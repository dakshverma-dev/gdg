// CareSRE Backend - TypeScript Type Definitions

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface PatientInput {
    name: string;
    age: string | number;
    symptoms: string;
}

export interface NormalizedPatient {
    name: string;
    age: number;
    symptoms: string;
    timestamp: number;
}

export interface TriageResult {
    priority: Priority;
    department: string;
    reason: string;
}

export interface QueueData {
    activePatients: number;
    avgConsultTime: number;
}

export interface QueuePrediction {
    eta: number;
    token: string;
    position: number;
}

export interface OPDSlip {
    token: string;
    name: string;
    department: string;
    priority: Priority;
    eta: number;
    position: number;
    reason: string;
}

export interface Alert {
    id?: string;
    patientId?: string;
    patientName: string;
    priority: "HIGH";
    reason: string;
    department: string;
    resolved: boolean;
    createdAt: number;
}

export interface PatientRecord {
    id?: string;
    name: string;
    age: number;
    symptoms: string;
    priority: Priority;
    department: string;
    token: string;
    eta: number;
    position: number;
    reason: string;
    hasAlert: boolean;
    createdAt: number;
}

export interface QueueStats {
    [department: string]: QueueData;
}

export interface CreatePatientResponse {
    success: boolean;
    slip: OPDSlip;
    adminSuggestion: string;
    _firebaseData: {
        patient: PatientRecord;
        alert: Alert | null;
        queueUpdate: { department: string; increment: number };
    };
}

export interface AdminQueueResponse {
    patients: PatientRecord[];
    alerts: Alert[];
    queueStats: QueueStats;
}

export interface AlertsResponse {
    alerts: Alert[];
}

export interface ResolveAlertResponse {
    success: boolean;
    alertId: string;
}
