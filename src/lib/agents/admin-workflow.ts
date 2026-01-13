// Agent 5: Admin Workflow Agent
// Type: AI-lite (Google Gemini)
// Purpose: Provide actionable suggestions for admin based on queue status

import { GoogleGenerativeAI } from '@google/generative-ai';
import { cleanGeminiResponse } from '../utils';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Get fallback suggestion when AI is unavailable
 */
function getFallbackSuggestion(queueLength: number): string {
    console.log("[Agent 5: Admin Workflow] Using fallback logic");

    if (queueLength > 20) {
        return "Consider opening additional counters to manage high patient volume";
    } else if (queueLength > 10) {
        return "Queue building up, monitor closely";
    } else {
        return "Queue status normal, continue standard operations";
    }
}

/**
 * Generate admin workflow suggestion based on queue status
 * Uses Gemini for intelligent suggestions, with rule-based fallback
 * 
 * @param queueLength Current number of patients waiting
 * @param avgConsultTime Average consultation time in minutes
 * @returns One actionable suggestion for the admin
 */
export async function getAdminSuggestion(
    queueLength: number,
    avgConsultTime: number
): Promise<string> {
    console.log("[Agent 5: Admin Workflow] Generating suggestion...", { queueLength, avgConsultTime });

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
        console.warn("[Agent 5: Admin Workflow] No GEMINI_API_KEY found, using fallback");
        return getFallbackSuggestion(queueLength);
    }

    const prompt = `You are an OPD admin assistant in a government hospital.

Current Queue Status:
- Patients waiting: ${queueLength}
- Average consultation time: ${avgConsultTime} minutes

Provide ONE actionable suggestion for the admin (max 15 words).

Examples:
- "Consider opening counter 2 to reduce wait time"
- "Queue is manageable, maintain current operations"
- "Alert staff: high patient volume detected"
- "Recommend extending consultation hours today"

Return ONLY the suggestion text (no JSON, no markdown, no explanations).`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log("[Agent 5: Admin Workflow] Calling Gemini API...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("[Agent 5: Admin Workflow] Raw Gemini response:", text);

        // Clean and validate response
        const suggestion = cleanGeminiResponse(text);

        if (!suggestion || suggestion.length === 0 || suggestion.length > 200) {
            console.warn("[Agent 5: Admin Workflow] Invalid response length, using fallback");
            return getFallbackSuggestion(queueLength);
        }

        console.log("[Agent 5: Admin Workflow] Final suggestion:", suggestion);
        return suggestion;

    } catch (error) {
        console.error("[Agent 5: Admin Workflow] Gemini API error:", error);
        return getFallbackSuggestion(queueLength);
    }
}
