// Agent 4: Clinical Alert Agent
// Type: Rule-based (safety-critical, NO AI)
// Purpose: Detect high-risk patients requiring immediate attention

import { Priority } from '../types';

// Keywords that indicate concerning symptoms for elderly patients
const CONCERNING_KEYWORDS = [
    "chest pain",
    "breathing",
    "breath",
    "unconscious",
    "bleeding",
    "bleed",
    "fever",
    "dizzy",
    "weak",
    "confused",
    "collapse",
    "faint",
    "heart",
    "stroke",
    "seizure",
    "unresponsive"
];

/**
 * Check if symptoms contain any concerning keywords
 */
function hasConcerningSymptoms(symptoms: string): boolean {
    const lowerSymptoms = symptoms.toLowerCase();
    return CONCERNING_KEYWORDS.some(keyword => lowerSymptoms.includes(keyword));
}

/**
 * Determine if a clinical alert should be created for this patient
 * 
 * Alert Rules (evaluated in order, any match triggers alert):
 * 1. Always alert if priority is HIGH
 * 2. Alert if elderly (age > 65) with concerning symptoms
 * 3. Alert for pediatric emergencies (age < 2 AND priority MEDIUM)
 * 
 * Why no AI: Medical alerts are safety-critical and must be:
 * - Deterministic (same input = same output)
 * - Auditable (rules can be reviewed)
 * - Never fail (no API dependencies)
 * 
 * @param priority Assigned priority from triage
 * @param age Patient age
 * @param symptoms Patient symptoms
 * @returns true if alert should be created, false otherwise
 */
export function shouldCreateAlert(
    priority: Priority,
    age: number,
    symptoms: string
): boolean {
    console.log("[Agent 4: Clinical Alert] Evaluating alert rules...", { priority, age });

    // Rule 1: Always alert for HIGH priority
    if (priority === "HIGH") {
        console.log("[Agent 4: Clinical Alert] ALERT: Rule 1 triggered (HIGH priority)");
        return true;
    }

    // Rule 2: Elderly with concerning symptoms
    if (age > 65 && hasConcerningSymptoms(symptoms)) {
        console.log("[Agent 4: Clinical Alert] ALERT: Rule 2 triggered (elderly + concerning symptoms)");
        return true;
    }

    // Rule 3: Pediatric emergency (infant with medium priority)
    if (age < 2 && priority === "MEDIUM") {
        console.log("[Agent 4: Clinical Alert] ALERT: Rule 3 triggered (pediatric emergency)");
        return true;
    }

    console.log("[Agent 4: Clinical Alert] No alert needed");
    return false;
}

/**
 * Generate alert reason based on triggered rule
 */
export function getAlertReason(priority: Priority, age: number, symptoms: string): string {
    if (priority === "HIGH") {
        return "High priority patient requires immediate attention";
    }

    if (age > 65 && hasConcerningSymptoms(symptoms)) {
        return "Elderly patient (65+) presenting with concerning symptoms";
    }

    if (age < 2 && priority === "MEDIUM") {
        return "Infant patient (under 2 years) with medical concerns";
    }

    return "Clinical alert triggered";
}
