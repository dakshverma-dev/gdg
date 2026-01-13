// GET /api/admin/alerts
// Get all unresolved alerts for admin dashboard

import { NextResponse } from 'next/server';
import type { AlertsResponse, Alert } from '@/lib/types';

export async function GET() {
    console.log("[API] GET /api/admin/alerts - Fetching alerts");

    try {
        // TODO: Firebase team - Replace with Firestore query:
        // /alerts where resolved == false, orderBy createdAt desc

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
            },
            {
                id: "alert_3",
                patientId: "patient_6",
                patientName: "Mohan Lal",
                priority: "HIGH",
                reason: "High priority patient requires immediate attention",
                department: "Emergency",
                resolved: false,
                createdAt: Date.now() - 120000
            }
        ];

        const response: AlertsResponse = {
            alerts: mockAlerts
        };

        console.log("[API] Returning alerts:", { count: mockAlerts.length });

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("[API] Error fetching alerts:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch alerts";

        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
