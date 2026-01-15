// GET /api/admin/queue
// Queue data for admin dashboard - returns patients, alerts, and queue stats

import { NextResponse } from 'next/server';
import { getPatients, getAlerts, getQueueStats, getStats } from '@/lib/store';
import type { AdminQueueResponse } from '@/lib/types';

export async function GET() {
    console.log("[API] GET /api/admin/queue - Fetching queue data");

    try {
        // Fetch from in-memory store (will be Firebase later)
        const patients = getPatients();
        const alerts = getAlerts(true); // Only unresolved alerts
        const queueStats = getQueueStats();
        const stats = getStats();

        const response: AdminQueueResponse = {
            patients,
            alerts,
            queueStats
        };

        console.log("[API] Returning queue data:", {
            patientCount: patients.length,
            alertCount: alerts.length,
            departmentCount: Object.keys(queueStats).length
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

