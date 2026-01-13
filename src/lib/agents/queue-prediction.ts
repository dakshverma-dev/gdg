// Agent 3: Queue Prediction Agent
// Type: Deterministic logic (no AI)
// Purpose: Calculate queue position, ETA, and generate token

import { Priority, QueueData, QueuePrediction } from '../types';
import { generateToken, calculateETA } from '../utils';

// Priority multipliers for queue position
const PRIORITY_MULTIPLIERS: Record<Priority, number> = {
    HIGH: 0.2,    // Skip to 20% of queue
    MEDIUM: 0.6,  // Skip to 60% of queue
    LOW: 1.0      // End of queue (100%)
};

// Default values
const DEFAULT_AVG_CONSULT_TIME = 15; // minutes

/**
 * Predict queue position and wait time for a patient
 * 
 * Business Logic:
 * 1. Token Generation: {DEPT_CODE}-{NUMBER} (e.g., "GM-042")
 * 2. Position: Based on priority (HIGH skips ahead, LOW at end)
 * 3. ETA: position × avgConsultTime (min 5 minutes)
 * 
 * @param department Assigned department
 * @param priority Triage priority (LOW/MEDIUM/HIGH)
 * @param queueData Current queue status (null if empty)
 * @returns Queue prediction with token, position, and ETA
 */
export function predictQueue(
    department: string,
    priority: Priority,
    queueData: QueueData | null
): QueuePrediction {
    console.log("[Agent 3: Queue] Calculating queue position...", { department, priority, queueData });

    // Handle empty queue or no data
    if (!queueData || queueData.activePatients === 0) {
        console.log("[Agent 3: Queue] Empty queue, assigning first position");
        const token = generateToken(department, 1);
        return {
            token,
            position: 1,
            eta: 5 // Minimum wait time
        };
    }

    const { activePatients, avgConsultTime } = queueData;
    const actualConsultTime = avgConsultTime || DEFAULT_AVG_CONSULT_TIME;

    // Calculate position based on priority
    const multiplier = PRIORITY_MULTIPLIERS[priority];
    const position = Math.floor(activePatients * multiplier) + 1;

    // Generate token (use activePatients + 1 as token number)
    const tokenNumber = activePatients + 1;
    const token = generateToken(department, tokenNumber);

    // Calculate ETA
    const eta = calculateETA(position, actualConsultTime);

    const prediction: QueuePrediction = {
        token,
        position,
        eta
    };

    console.log("[Agent 3: Queue] Queue prediction:", prediction);
    return prediction;
}
