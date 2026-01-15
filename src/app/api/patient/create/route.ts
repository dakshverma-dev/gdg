// POST /api/patient/create
// Main patient creation endpoint - orchestrates all 6 agents

import { NextRequest, NextResponse } from 'next/server';
import { processIntake } from '@/lib/agents/intake';
import { analyzePatient } from '@/lib/agents/triage';
import { predictQueue } from '@/lib/agents/queue-prediction';
import { shouldCreateAlert, getAlertReason } from '@/lib/agents/clinical-alert';
import { getAdminSuggestion } from '@/lib/agents/admin-workflow';
import { analyzeMultipleDocuments, DocumentAnalysisResult } from '@/lib/agents/document-analysis';
import { generateId } from '@/lib/utils';
import { addPatient, addAlert, getQueueForDepartment } from '@/lib/store';
import type {
    PatientInput,
    PatientRecord,
    Alert,
    CreatePatientResponse,
    QueueData
} from '@/lib/types';

// Extended input type with documents
interface PatientInputWithDocs extends PatientInput {
    documents?: Array<{
        name: string;
        mimeType: string;
        base64Data: string;
    }>;
}

export async function POST(request: NextRequest) {
    console.log("\n========== NEW PATIENT CREATION REQUEST ==========");

    try {
        // Parse request body
        const body = await request.json() as PatientInputWithDocs;
        console.log("[API] Received input:", { ...body, documents: body.documents?.length || 0 });

        // ============================================
        // Step 1: Run Agent 1 (Intake - normalize data)
        // ============================================
        let normalizedData;
        try {
            normalizedData = processIntake(body);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Invalid input";
            console.error("[API] Intake validation failed:", message);
            return NextResponse.json(
                { success: false, error: message },
                { status: 400 }
            );
        }

        // ============================================
        // Step 1.5: Run Agent 6 (Document Analysis) if documents uploaded
        // ============================================
        let documentAnalysis: DocumentAnalysisResult | null = null;
        if (body.documents && body.documents.length > 0) {
            console.log("[API] Analyzing", body.documents.length, "uploaded documents...");
            documentAnalysis = await analyzeMultipleDocuments(
                body.documents.map(doc => ({
                    base64Data: doc.base64Data,
                    mimeType: doc.mimeType,
                    documentType: doc.name.toLowerCase().includes('lab') ? 'lab_report'
                        : doc.name.toLowerCase().includes('prescription') ? 'prescription'
                            : 'medical_record'
                }))
            );
            console.log("[API] Document analysis complete:", {
                conditionsFound: documentAnalysis.conditions.length,
                medicationsFound: documentAnalysis.medications.length,
                allergiesFound: documentAnalysis.allergies.length
            });

            // Merge document findings with patient-provided info
            if (documentAnalysis.conditions.length > 0) {
                const existingConditions = normalizedData.chronicConditions || '';
                const docConditions = documentAnalysis.conditions.join(', ');
                normalizedData.chronicConditions = existingConditions
                    ? `${existingConditions}, [From Documents: ${docConditions}]`
                    : `[From Documents: ${docConditions}]`;
            }
            if (documentAnalysis.medications.length > 0) {
                const existingMeds = normalizedData.currentMedications || '';
                const docMeds = documentAnalysis.medications.join(', ');
                normalizedData.currentMedications = existingMeds
                    ? `${existingMeds}, [From Documents: ${docMeds}]`
                    : `[From Documents: ${docMeds}]`;
            }
            if (documentAnalysis.allergies.length > 0) {
                const existingAllergies = normalizedData.allergies || '';
                const docAllergies = documentAnalysis.allergies.join(', ');
                normalizedData.allergies = existingAllergies
                    ? `${existingAllergies}, [From Documents: ${docAllergies}]`
                    : `[From Documents: ${docAllergies}]`;
            }
        }

        // ============================================
        // Step 2: Run Agent 2 (AI Triage) - now with document insights
        // ============================================
        const triageResult = await analyzePatient(
            normalizedData.age,
            normalizedData.symptoms,
            {
                chronicConditions: normalizedData.chronicConditions,
                currentMedications: normalizedData.currentMedications,
                allergies: normalizedData.allergies
            }
        );
        console.log("[API] Triage result:", triageResult);

        // ============================================
        // Step 3: Run Agent 3 (Queue Prediction)
        // ============================================
        // Get queue data from in-memory store (will be Firebase later)
        const storedQueueData = getQueueForDepartment(triageResult.department);
        const queueData: QueueData = storedQueueData || {
            activePatients: 0,
            avgConsultTime: 15
        };

        const queuePrediction = predictQueue(
            triageResult.department,
            triageResult.priority,
            queueData
        );
        console.log("[API] Queue prediction:", queuePrediction);

        // ============================================
        // Step 4: Run Agent 4 (Clinical Alert Check)
        // ============================================
        const createAlert = shouldCreateAlert(
            triageResult.priority,
            normalizedData.age,
            normalizedData.symptoms
        );
        console.log("[API] Should create alert:", createAlert);

        // ============================================
        // Step 5: Run Agent 5 (Admin Suggestion)
        // ============================================
        const adminSuggestion = await getAdminSuggestion(
            queueData.activePatients,
            queueData.avgConsultTime
        );
        console.log("[API] Admin suggestion:", adminSuggestion);

        // ============================================
        // Prepare response data
        // ============================================
        const patientId = generateId();
        const alertId = createAlert ? generateId() : null;

        // Prepare patient record for Firebase
        const patientRecord: PatientRecord = {
            id: patientId,
            name: normalizedData.name,
            age: normalizedData.age,
            symptoms: normalizedData.symptoms,
            priority: triageResult.priority,
            department: triageResult.department,
            token: queuePrediction.token,
            eta: queuePrediction.eta,
            position: queuePrediction.position,
            reason: triageResult.reason,
            hasAlert: createAlert,
            createdAt: normalizedData.timestamp
        };

        // Prepare alert for Firebase (if needed)
        const alertRecord: Alert | null = createAlert ? {
            id: alertId!,
            patientId: patientId,
            patientName: normalizedData.name,
            priority: "HIGH",
            reason: getAlertReason(triageResult.priority, normalizedData.age, normalizedData.symptoms),
            department: triageResult.department,
            resolved: false,
            createdAt: normalizedData.timestamp
        } : null;

        // Build response
        const response: CreatePatientResponse = {
            success: true,
            slip: {
                token: queuePrediction.token,
                name: normalizedData.name,
                department: triageResult.department,
                priority: triageResult.priority,
                eta: queuePrediction.eta,
                position: queuePrediction.position,
                reason: triageResult.reason
            },
            adminSuggestion: adminSuggestion,

            // For Firebase team (internal use - not sent to frontend in production)
            _firebaseData: {
                patient: patientRecord,
                alert: alertRecord,
                queueUpdate: {
                    department: triageResult.department,
                    increment: 1
                }
            }
        };

        console.log("[API] SUCCESS - Returning slip data");
        console.log("========== REQUEST COMPLETE ==========\n");

        // Save to in-memory store (will be Firebase later)
        addPatient(patientRecord);
        if (alertRecord) {
            addAlert(alertRecord);
        }

        console.log("[API] Patient saved to store");
        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("[API] Unexpected error:", error);
        const message = error instanceof Error ? error.message : "An unexpected error occurred";

        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
