// Agent 2: Triage & Priority Agent
// Type: AI-powered (Google Gemini 1.5 Flash)
// Purpose: Analyze symptoms and assign priority + department

import { GoogleGenerativeAI } from '@google/generative-ai';
import { TriageResult, Priority } from '../types';
import { safeParseJSON } from '../utils';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get fallback triage result when AI is unavailable
 */
function getFallbackTriage(age: number): TriageResult {
    console.log("[Agent 2: Triage] Using fallback logic due to AI unavailability");
    return {
        priority: age > 60 ? "MEDIUM" : "LOW",
        department: "General Medicine",
        reason: "System assigned based on age (AI temporarily unavailable)"
    };
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
 * @returns Triage result with priority, department, and reason
 */
export async function analyzePatient(age: number, symptoms: string): Promise<TriageResult> {
    console.log("[Agent 2: Triage] Analyzing patient...", { age, symptoms });

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[Agent 2: Triage] No GEMINI_API_KEY found, using fallback");
        return getFallbackTriage(age);
    }

    const prompt = `You are a medical triage assistant in a government hospital OPD.

Patient Details:
- Age: ${age}
- Symptoms: ${symptoms}

Return ONLY valid JSON (no markdown, no explanations):
{
  "priority": "LOW" | "MEDIUM" | "HIGH",
  "department": "<department name>",
  "reason": "<one sentence explanation>"
}

Priority Guidelines:
- HIGH: Chest pain, severe bleeding, difficulty breathing, stroke symptoms, severe trauma, severe allergic reactions
- MEDIUM: High fever, moderate pain, elderly patients with concerns, chronic disease flare-ups, persistent vomiting
- LOW: Minor ailments, routine checkups, mild symptoms, follow-up visits

Common Departments: General Medicine, Cardiology, Orthopedics, Pediatrics, Emergency, ENT, Dermatology, Neurology, Gastroenterology, Ophthalmology`;

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
            return getFallbackTriage(age);
        }

        // Normalize priority to uppercase
        parsed.priority = parsed.priority.toUpperCase() as Priority;

        console.log("[Agent 2: Triage] Successfully parsed triage result:", parsed);
        return parsed;

    } catch (error) {
        console.error("[Agent 2: Triage] Gemini API error:", error);
        return getFallbackTriage(age);
    }
}
