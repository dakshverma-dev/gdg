// Agent 2: Triage & Priority Agent
// Type: AI-powered (Google Gemini 1.5 Flash)
// Purpose: Analyze symptoms and assign priority + department

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TriageResult, Priority } from '../types';
import { safeParseJSON } from '../utils';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get fallback triage result using keyword-based analysis when AI is unavailable
 */
function getFallbackTriage(age: number, symptoms: string = ''): TriageResult {
    console.log("[Agent 2: Triage] Using keyword-based fallback logic");

    const symptomsLower = symptoms.toLowerCase();

    // HIGH priority keywords - life-threatening emergencies
    const highPriorityKeywords = [
        'heart attack', 'chest pain', 'difficulty breathing', 'cannot breathe',
        'stroke', 'paralysis', 'unconscious', 'severe bleeding', 'accident',
        'seizure', 'convulsion', 'severe allergy', 'anaphylaxis', 'poisoning',
        'overdose', 'suicide', 'severe trauma', 'head injury', 'burn'
    ];

    // MEDIUM priority keywords
    const mediumPriorityKeywords = [
        'high fever', 'fever', 'vomiting blood', 'blood in stool', 'severe pain',
        'fracture', 'broken bone', 'infection', 'abscess', 'diabetic',
        'blood pressure', 'hypertension', 'asthma attack', 'pregnancy complication'
    ];

    // Department mapping keywords
    const departmentKeywords: Record<string, string[]> = {
        'Cardiology': ['heart', 'chest pain', 'palpitation', 'cardiac'],
        'Emergency': ['accident', 'trauma', 'severe', 'emergency', 'unconscious', 'bleeding'],
        'Orthopedics': ['bone', 'fracture', 'joint', 'spine', 'back pain', 'knee', 'shoulder'],
        'Neurology': ['headache', 'migraine', 'seizure', 'numbness', 'stroke', 'paralysis', 'dizziness'],
        'Gastroenterology': ['stomach', 'abdomen', 'vomiting', 'diarrhea', 'liver', 'acidity'],
        'Pediatrics': ['child', 'infant', 'baby'],
        'ENT': ['ear', 'nose', 'throat', 'hearing', 'sinus', 'tonsil'],
        'Dermatology': ['skin', 'rash', 'allergy', 'itching', 'eczema'],
        'Ophthalmology': ['eye', 'vision', 'blind', 'cataract'],
        'Pulmonology': ['breathing', 'cough', 'asthma', 'lung', 'respiratory'],
        'Endocrinology': ['diabetes', 'thyroid', 'hormone']
    };

    // Check for HIGH priority
    const isHighPriority = highPriorityKeywords.some(kw => symptomsLower.includes(kw));

    // Check for MEDIUM priority
    const isMediumPriority = mediumPriorityKeywords.some(kw => symptomsLower.includes(kw));

    // Elderly with any symptoms gets at least MEDIUM
    const isElderly = age >= 60;

    // Determine priority
    let priority: Priority = 'LOW';
    if (isHighPriority) {
        priority = 'HIGH';
    } else if (isMediumPriority || isElderly) {
        priority = 'MEDIUM';
    }

    // Determine department
    let department = 'General Medicine';
    for (const [dept, keywords] of Object.entries(departmentKeywords)) {
        if (keywords.some(kw => symptomsLower.includes(kw))) {
            department = dept;
            break;
        }
    }

    // Special case: HIGH priority with general keywords → Emergency
    if (priority === 'HIGH' && department === 'General Medicine') {
        department = 'Emergency';
    }

    // Generate reason
    const reason = priority === 'HIGH'
        ? `Urgent: ${symptoms.substring(0, 50)}... requires immediate attention`
        : priority === 'MEDIUM'
            ? `Moderate concern: Patient needs prompt evaluation`
            : `Routine case: Standard consultation recommended`;

    console.log("[Agent 2: Triage] Fallback result:", { priority, department, reason: reason.substring(0, 50) });

    return { priority, department, reason };
}

/**
 * Validate that the triage result has valid values
 */
function validateTriageResult(result: unknown): result is TriageResult {
    if (!result || typeof result !== 'object') return false;

    const r = result as Record<string, unknown>;

    const validPriorities: Priority[] = ["LOW", "MEDIUM", "HIGH"];
    if (!validPriorities.includes(r.priority as Priority)) return false;
    if (typeof r.department !== 'string' || r.department.length === 0) return false;
    if (typeof r.reason !== 'string') return false;

    return true;
}

/**
 * Analyze patient symptoms and assign priority and department
 * Uses Google Gemini 1.5 Flash for AI analysis
 * Falls back to rule-based logic if AI fails
 * 
 * @param age Patient age
 * @param symptoms Patient symptoms (lowercased)
 * @param medicalHistory Optional medical history for enhanced triage
 * @returns Triage result with priority, department, and reason
 */
export async function analyzePatient(
    age: number,
    symptoms: string,
    medicalHistory?: {
        chronicConditions?: string;
        currentMedications?: string;
        allergies?: string;
    }
): Promise<TriageResult> {
    console.log("[Agent 2: Triage] Analyzing patient...", { age, symptoms, hasMedicalHistory: !!medicalHistory });

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[Agent 2: Triage] No GEMINI_API_KEY found, using fallback");
        return getFallbackTriage(age, symptoms);
    }

    // Build medical history section for prompt
    const medicalHistorySection = medicalHistory
        ? `
Medical History:
- Chronic Conditions: ${medicalHistory.chronicConditions || 'None reported'}
- Current Medications: ${medicalHistory.currentMedications || 'None reported'}
- Known Allergies: ${medicalHistory.allergies || 'None reported'}`
        : '';

    const prompt = `You are a medical triage assistant in a government hospital OPD.

Patient Details:
- Age: ${age}
- Symptoms: ${symptoms}
${medicalHistorySection}

Return ONLY valid JSON (no markdown, no explanations):
{
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "department": "<department name>",
  "reason": "<one sentence explanation>"
}

Priority Guidelines:
- HIGH: Chest pain, severe bleeding, difficulty breathing, stroke symptoms, severe trauma, severe allergic reactions, diabetic emergencies, uncontrolled hypertension
- MEDIUM: High fever, moderate pain, elderly patients (65+) with concerns, chronic disease flare-ups, persistent vomiting, patients on multiple medications with new symptoms
- LOW: Minor ailments, routine checkups, mild symptoms, follow-up visits

Consider comorbidities: Patients with chronic conditions (diabetes, heart disease, hypertension) presenting with related symptoms should be prioritized higher.

Common Departments: General Medicine, Cardiology, Orthopedics, Pediatrics, Emergency, ENT, Dermatology, Neurology, Gastroenterology, Ophthalmology, Endocrinology`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("[Agent 2: Triage] Calling Gemini API...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("[Agent 2: Triage] Raw Gemini response:", text);

        // Parse the response
        const parsed = safeParseJSON<TriageResult>(text);

        if (!parsed || !validateTriageResult(parsed)) {
            console.error("[Agent 2: Triage] Invalid response format, using fallback");
            return getFallbackTriage(age, symptoms);
        }

        // Normalize priority to uppercase
        parsed.priority = parsed.priority.toUpperCase() as Priority;

        console.log("[Agent 2: Triage] Successfully parsed triage result:", parsed);
        return parsed;

    } catch (error) {
        console.error("[Agent 2: Triage] Gemini API error:", error);
        return getFallbackTriage(age, symptoms);
    }
}
