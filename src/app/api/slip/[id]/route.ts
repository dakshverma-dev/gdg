// GET /api/slip/[id]/route.ts
// Retrieve slip details for QR code validation

import { NextRequest, NextResponse } from 'next/server';
import { getPatientById } from '@/lib/store';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    console.log("[API] Slip validation request for ID:", id);

    if (!id) {
        return NextResponse.json(
            { success: false, error: 'Slip ID is required' },
            { status: 400 }
        );
    }

    const patient = getPatientById(id);

    if (!patient) {
        return NextResponse.json(
            { success: false, error: 'Slip not found or expired' },
            { status: 404 }
        );
    }

    // Return slip validation data
    return NextResponse.json({
        success: true,
        valid: true,
        slip: {
            token: patient.token,
            name: patient.name,
            age: patient.age,
            department: patient.department,
            priority: patient.priority,
            eta: patient.eta,
            position: patient.position,
            reason: patient.reason,
            createdAt: patient.createdAt,
            hasAlert: patient.hasAlert
        }
    });
}
