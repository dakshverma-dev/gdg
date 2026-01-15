// In-memory store for demo purposes
// This replaces Firebase for now - data persists only during server session

import type { PatientRecord, Alert, QueueData } from './types';

// Use globalThis to persist across Next.js hot reloads in development
declare global {
    var __caresre_store: {
        patients: PatientRecord[];
        alerts: Alert[];
        queueStats: Record<string, QueueData>;
    } | undefined;
}

// Initialize global store if not exists
if (!globalThis.__caresre_store) {
    globalThis.__caresre_store = {
        patients: [],
        alerts: [],
        queueStats: {
            "General Medicine": { activePatients: 0, avgConsultTime: 15 },
            "Cardiology": { activePatients: 0, avgConsultTime: 20 },
            "Orthopedics": { activePatients: 0, avgConsultTime: 18 },
            "Pediatrics": { activePatients: 0, avgConsultTime: 12 },
            "ENT": { activePatients: 0, avgConsultTime: 10 },
            "Dermatology": { activePatients: 0, avgConsultTime: 8 },
            "Emergency": { activePatients: 0, avgConsultTime: 25 },
            "Neurology": { activePatients: 0, avgConsultTime: 22 },
            "Gastroenterology": { activePatients: 0, avgConsultTime: 18 },
            "Ophthalmology": { activePatients: 0, avgConsultTime: 12 }
        }
    };
}

// Get references to the global store
const store = globalThis.__caresre_store;

// Patient operations
export function addPatient(patient: PatientRecord): void {
    // Add status field if not present
    const patientWithStatus = {
        ...patient,
        status: patient.status || 'waiting'
    };
    store.patients.unshift(patientWithStatus); // Add to front (most recent first)

    // Update queue stats
    const dept = patient.department;
    if (store.queueStats[dept]) {
        store.queueStats[dept].activePatients++;
    } else {
        store.queueStats[dept] = { activePatients: 1, avgConsultTime: 15 };
    }

    console.log(`[Store] Added patient ${patient.name}, total: ${store.patients.length}`);
}

export function updatePatientStatus(id: string, status: string): boolean {
    const patient = store.patients.find(p => p.id === id);
    if (patient) {
        (patient as any).status = status;
        console.log(`[Store] Updated patient ${id} status to ${status}`);

        // If completed, decrement active count
        if (status === 'completed' && store.queueStats[patient.department]) {
            store.queueStats[patient.department].activePatients = Math.max(
                0,
                store.queueStats[patient.department].activePatients - 1
            );
        }
        return true;
    }
    return false;
}

export function getPatients(): PatientRecord[] {
    return [...store.patients]; // Return copy
}

export function getPatient(id: string): PatientRecord | undefined {
    return store.patients.find(p => p.id === id);
}

// Alias for API routes
export const getPatientById = getPatient;

// Alert operations
export function addAlert(alert: Alert): void {
    store.alerts.unshift(alert);
    console.log(`[Store] Added alert for ${alert.patientName}, total: ${store.alerts.length}`);
}

export function getAlerts(unresolvedOnly: boolean = true): Alert[] {
    if (unresolvedOnly) {
        return store.alerts.filter(a => !a.resolved);
    }
    return [...store.alerts];
}

export function resolveAlert(id: string): boolean {
    const alert = store.alerts.find(a => a.id === id);
    if (alert) {
        alert.resolved = true;
        console.log(`[Store] Resolved alert ${id}`);
        return true;
    }
    return false;
}

// Queue operations
export function getQueueStats(): Record<string, QueueData> {
    return { ...store.queueStats };
}

export function getQueueForDepartment(department: string): QueueData | null {
    return store.queueStats[department] || null;
}

// Stats
export function getStats() {
    return {
        totalPatients: store.patients.length,
        activeAlerts: store.alerts.filter(a => !a.resolved).length,
        departments: Object.keys(store.queueStats).length
    };
}
