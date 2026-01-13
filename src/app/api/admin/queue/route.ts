// GET /api/admin/queue
// Queue data for admin dashboard - returns patients, alerts, and queue stats

import { NextResponse } from 'next/server';
import type { AdminQueueResponse, PatientRecord, Alert, QueueStats } from '@/lib/types';

export async function GET() {
    console.log("[API] GET /api/admin/queue - Fetching queue data");

    try {
        // TODO: Firebase team - Replace mock data with Firestore queries:
        // - /patients: orderBy('createdAt', 'desc').limit(50)
        // - /alerts: where('resolved', '==', false)
        // - /queues: get all departments

        // Mock patient data
        const mockPatients: PatientRecord[] = [
            {
                id: "patient_1",
                name: "Rajesh Kumar",
                age: 45,
                symptoms: "persistent headache and dizziness",
                priority: "MEDIUM",
                department: "General Medicine",
                token: "GE-001",
                eta: 20,
                position: 2,
                reason: "Moderate symptoms requiring evaluation",
                hasAlert: false,
                createdAt: Date.now() - 1800000 // 30 mins ago
            },
            {
                id: "patient_2",
                name: "Priya Sharma",
                age: 72,
                symptoms: "chest pain and shortness of breath",
                priority: "HIGH",
                department: "Cardiology",
                token: "CA-001",
                eta: 5,
                position: 1,
                reason: "Elderly patient with cardiac symptoms - urgent",
                hasAlert: true,
                createdAt: Date.now() - 900000 // 15 mins ago
            },
            {
                id: "patient_3",
                name: "Amit Singh",
                age: 28,
                symptoms: "mild cold and cough",
                priority: "LOW",
                department: "General Medicine",
                token: "GE-002",
                eta: 35,
                position: 4,
                reason: "Minor symptoms, routine consultation",
                hasAlert: false,
                createdAt: Date.now() - 600000 // 10 mins ago
            },
            {
                id: "patient_4",
                name: "Baby Meera",
                age: 1,
                symptoms: "high fever and crying",
                priority: "MEDIUM",
                department: "Pediatrics",
                token: "PE-001",
                eta: 10,
                position: 1,
                reason: "Infant with fever - pediatric priority",
                hasAlert: true,
                createdAt: Date.now() - 300000 // 5 mins ago
            },
            {
                id: "patient_5",
                name: "Sunita Devi",
                age: 55,
                symptoms: "joint pain and swelling",
                priority: "LOW",
                department: "Orthopedics",
                token: "OR-001",
                eta: 25,
                position: 2,
                reason: "Chronic joint condition",
                hasAlert: false,
                createdAt: Date.now() - 1200000 // 20 mins ago
            }
        ];

        // Mock alert data
        const mockAlerts: Alert[] = [
            {
                id: "alert_1",
                patientId: "patient_2",
                patientName: "Priya Sharma",
                priority: "HIGH",
                reason: "Elderly patient (65+) presenting with concerning symptoms",
                department: "Cardiology",
                resolved: false,
                createdAt: Date.now() - 900000
            },
            {
                id: "alert_2",
                patientId: "patient_4",
                patientName: "Baby Meera",
                priority: "HIGH",
                reason: "Infant patient (under 2 years) with medical concerns",
                department: "Pediatrics",
                resolved: false,
                createdAt: Date.now() - 300000
            }
        ];

        // Mock queue stats per department
        const mockQueueStats: QueueStats = {
            "General Medicine": { activePatients: 12, avgConsultTime: 15 },
            "Cardiology": { activePatients: 8, avgConsultTime: 20 },
            "Orthopedics": { activePatients: 6, avgConsultTime: 18 },
            "Pediatrics": { activePatients: 5, avgConsultTime: 12 },
            "ENT": { activePatients: 4, avgConsultTime: 10 },
            "Dermatology": { activePatients: 7, avgConsultTime: 8 },
            "Emergency": { activePatients: 3, avgConsultTime: 25 }
        };

        const response: AdminQueueResponse = {
            patients: mockPatients,
            alerts: mockAlerts,
            queueStats: mockQueueStats
        };

        console.log("[API] Returning queue data:", {
            patientCount: mockPatients.length,
            alertCount: mockAlerts.length,
            departmentCount: Object.keys(mockQueueStats).length
        });

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("[API] Error fetching queue data:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch queue data";

        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
