// CareSRE Backend - TypeScript Type Definitions

export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type VisitType = "new" | "followup";
export type Gender = "male" | "female" | "other";

export interface EmergencyContact {
    name: string;
    phone: string;
}

export interface PatientInput {
    // Required fields
    name: string;
    age: string | number;
    symptoms: string;

    // Enhanced fields
    phone?: string;
    gender?: Gender;
    visitType?: VisitType;
    oldPatientId?: string; // For follow-up visits
    previousVisitDate?: string;

    // Medical history
    chronicConditions?: string;
    currentMedications?: string;
    allergies?: string;

    // Emergency & referral
    emergencyContact?: EmergencyContact;
    referralDoctor?: string;
}

export interface NormalizedPatient {
    name: string;
    age: number;
    symptoms: string;
    timestamp: number;
    // Optional enhanced fields for triage
    chronicConditions?: string;
    currentMedications?: string;
    allergies?: string;
    gender?: Gender;
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
    status?: 'waiting' | 'in-progress' | 'completed' | 'skipped';
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
