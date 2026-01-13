// CareSRE Backend - Utility Functions

import { PatientInput } from './types';

/**
 * Get department code (first 2 letters, uppercase)
 * @example getDeptCode("Cardiology") → "CA"
 * @example getDeptCode("General Medicine") → "GE"
 */
export function getDeptCode(department: string): string {
    if (!department || department.trim().length === 0) {
        return "GM"; // Default to General Medicine
    }
    return department.trim().substring(0, 2).toUpperCase();
}

/**
 * Generate OPD token from department name and position
 * @example generateToken("General Medicine", 42) → "GE-042"
 */
export function generateToken(department: string, position: number): string {
    const deptCode = getDeptCode(department);
    const paddedNumber = position.toString().padStart(3, '0');
    return `${deptCode}-${paddedNumber}`;
}

/**
 * Calculate ETA based on position and avg consult time
 * Minimum ETA is always 5 minutes
 * @example calculateETA(3, 15) → 45 (minutes)
 */
export function calculateETA(position: number, avgConsultTime: number = 15): number {
    const calculatedETA = position * avgConsultTime;
    return Math.max(5, calculatedETA);
}

/**
 * Validate patient input data
 * @throws Error with specific message if invalid
 */
export function validatePatientInput(data: unknown): asserts data is PatientInput {
    if (!data || typeof data !== 'object') {
        throw new Error("Invalid input: Request body must be a valid object");
    }

    const input = data as Record<string, unknown>;

    // Validate name
    if (!input.name || typeof input.name !== 'string' || input.name.trim().length === 0) {
        throw new Error("Invalid input: 'name' is required and must be a non-empty string");
    }

    // Validate age
    if (input.age === undefined || input.age === null) {
        throw new Error("Invalid input: 'age' is required");
    }

    const ageNum = typeof input.age === 'string' ? parseInt(input.age, 10) : input.age;
    if (typeof ageNum !== 'number' || isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        throw new Error("Invalid input: 'age' must be a valid number between 0 and 150");
    }

    // Validate symptoms
    if (!input.symptoms || typeof input.symptoms !== 'string' || input.symptoms.trim().length === 0) {
        throw new Error("Invalid input: 'symptoms' is required and must be a non-empty string");
    }
}

/**
 * Clean Gemini response (remove markdown artifacts like ```json)
 */
export function cleanGeminiResponse(text: string): string {
    if (!text) return "";

    let cleaned = text.trim();

    // Remove ```json or ``` at the start
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');

    // Remove ``` at the end
    cleaned = cleaned.replace(/\s*```$/i, '');

    // Remove any leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
}

/**
 * Safely parse JSON from Gemini response
 * @returns Parsed object or null if parsing fails
 */
export function safeParseJSON<T>(text: string): T | null {
    try {
        const cleaned = cleanGeminiResponse(text);
        return JSON.parse(cleaned) as T;
    } catch (error) {
        console.error("[Utils] JSON parsing failed:", error);
        console.error("[Utils] Original text:", text);
        return null;
    }
}

/**
 * Generate a unique ID for records
 */
export function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
