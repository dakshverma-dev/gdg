// Agent 1: Patient Intake Agent
// Type: No AI, pure logic
// Purpose: Normalize and validate patient input data

import { PatientInput, NormalizedPatient } from '../types';
import { validatePatientInput } from '../utils';

/**
 * Process patient intake form data
 * - Validates all required fields
 * - Normalizes data (trim, parse age, lowercase symptoms)
 * - Adds timestamp
 * 
 * @param input Raw patient input from form
 * @returns Normalized patient data
 * @throws Error if validation fails
 */
export function processIntake(input: PatientInput): NormalizedPatient {
    console.log("[Agent 1: Intake] Processing patient input...");

    // Validate input
    validatePatientInput(input);

    // Parse and normalize age
    const age = typeof input.age === 'string'
        ? parseInt(input.age, 10)
        : input.age;

    // Create normalized patient object
    const normalized: NormalizedPatient = {
        name: input.name.trim(),
        age: age,
        symptoms: input.symptoms.trim().toLowerCase(),
        timestamp: Date.now()
    };

    console.log("[Agent 1: Intake] Normalized patient data:", {
        name: normalized.name,
        age: normalized.age,
        symptomsLength: normalized.symptoms.length
    });

    return normalized;
}
