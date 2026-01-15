// Agent 6: Document Analysis Agent
// Type: AI-powered (Google Gemini 1.5 Flash with Vision)
// Purpose: Analyze uploaded medical documents (lab reports, prescriptions, past records)

import { GoogleGenerativeAI } from '@google/generative-ai';
import { safeParseJSON } from '../utils';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface DocumentAnalysisResult {
    summary: string;
    findings: string[];
    conditions: string[];
    medications: string[];
    allergies: string[];
    riskFactors: string[];
    recommendations: string;
}

/**
 * Get fallback result when AI is unavailable
 */
function getFallbackAnalysis(): DocumentAnalysisResult {
    console.log("[Agent 6: Document Analysis] Using fallback - no analysis available");
    return {
        summary: "Document uploaded but could not be analyzed (AI temporarily unavailable)",
        findings: [],
        conditions: [],
        medications: [],
        allergies: [],
        riskFactors: [],
        recommendations: "Please present original documents to the consulting physician"
    };
}

/**
 * Validate that the analysis result has valid structure
 */
function validateAnalysisResult(result: unknown): result is DocumentAnalysisResult {
    if (!result || typeof result !== 'object') return false;

    const r = result as Record<string, unknown>;
    if (typeof r.summary !== 'string') return false;

    return true;
}

/**
 * Analyze uploaded medical document using Gemini Vision
 * 
 * @param base64Data Base64-encoded image data
 * @param mimeType MIME type of the image (e.g., 'image/jpeg', 'image/png', 'application/pdf')
 * @param documentType Type of document (e.g., 'lab_report', 'prescription', 'medical_record')
 * @returns Analysis result with extracted medical information
 */
export async function analyzeDocument(
    base64Data: string,
    mimeType: string,
    documentType: string = 'medical_document'
): Promise<DocumentAnalysisResult> {
    console.log("[Agent 6: Document Analysis] Analyzing document...", { mimeType, documentType });

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[Agent 6: Document Analysis] No GEMINI_API_KEY found, using fallback");
        return getFallbackAnalysis();
    }

    const prompt = `You are a medical document analysis assistant for a hospital OPD triage system.

Analyze this medical document (${documentType}) and extract relevant information for patient triage.

Return ONLY valid JSON (no markdown, no explanations):
{
  "summary": "<brief 1-2 sentence summary of the document>",
  "findings": ["<key finding 1>", "<key finding 2>"],
  "conditions": ["<diagnosed condition 1>", "<condition 2>"],
  "medications": ["<medication 1 with dosage if visible>", "<medication 2>"],
  "allergies": ["<allergy 1>", "<allergy 2>"],
  "riskFactors": ["<risk factor 1>", "<risk factor 2>"],
  "recommendations": "<triage recommendation based on findings>"
}

Focus on:
- Lab values that are abnormal (marked with H or L, or outside normal range)
- Diagnosed conditions or diseases
- Current medications
- Any allergies mentioned
- Risk factors (high blood sugar, cholesterol, blood pressure, etc.)
- Urgency indicators

If the document is unclear or not a medical document, still provide the JSON with appropriate messages.`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("[Agent 6: Document Analysis] Calling Gemini Vision API...");

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            { text: prompt }
        ]);

        const response = await result.response;
        const text = response.text();

        console.log("[Agent 6: Document Analysis] Raw Gemini response:", text.substring(0, 200));

        // Parse the response
        const parsed = safeParseJSON<DocumentAnalysisResult>(text);

        if (!parsed || !validateAnalysisResult(parsed)) {
            console.error("[Agent 6: Document Analysis] Invalid response format, using fallback");
            return getFallbackAnalysis();
        }

        // Ensure arrays exist
        parsed.findings = parsed.findings || [];
        parsed.conditions = parsed.conditions || [];
        parsed.medications = parsed.medications || [];
        parsed.allergies = parsed.allergies || [];
        parsed.riskFactors = parsed.riskFactors || [];

        console.log("[Agent 6: Document Analysis] Successfully analyzed document:", {
            conditionsFound: parsed.conditions.length,
            medicationsFound: parsed.medications.length,
            riskFactorsFound: parsed.riskFactors.length
        });

        return parsed;

    } catch (error) {
        console.error("[Agent 6: Document Analysis] Gemini API error:", error);
        return getFallbackAnalysis();
    }
}

/**
 * Analyze multiple documents and combine results
 */
export async function analyzeMultipleDocuments(
    documents: Array<{ base64Data: string; mimeType: string; documentType: string }>
): Promise<DocumentAnalysisResult> {
    console.log("[Agent 6: Document Analysis] Analyzing", documents.length, "documents");

    const results = await Promise.all(
        documents.map(doc => analyzeDocument(doc.base64Data, doc.mimeType, doc.documentType))
    );

    // Combine all results
    const combined: DocumentAnalysisResult = {
        summary: results.map(r => r.summary).filter(s => s).join('. '),
        findings: [...new Set(results.flatMap(r => r.findings))],
        conditions: [...new Set(results.flatMap(r => r.conditions))],
        medications: [...new Set(results.flatMap(r => r.medications))],
        allergies: [...new Set(results.flatMap(r => r.allergies))],
        riskFactors: [...new Set(results.flatMap(r => r.riskFactors))],
        recommendations: results.map(r => r.recommendations).filter(r => r).join('. ')
    };

    return combined;
}
