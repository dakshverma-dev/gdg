// POST /api/doctor/patient/[id]/action
// Update patient status (call, complete, etc.)

import { NextRequest, NextResponse } from 'next/server';
import { getPatient, updatePatientStatus } from '@/lib/store';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    console.log("[API] Doctor action:", action, "for patient:", id);

    if (!id) {
        return NextResponse.json(
            { success: false, error: 'Patient ID required' },
            { status: 400 }
        );
    }

    const patient = getPatient(id);
    if (!patient) {
        return NextResponse.json(
            { success: false, error: 'Patient not found' },
            { status: 404 }
        );
    }

    let newStatus: string;
    let message: string;

    switch (action) {
        case 'call':
            newStatus = 'in-progress';
            message = `Patient ${patient.name} called for consultation`;
            break;
        case 'complete':
            newStatus = 'completed';
            message = `Consultation completed for ${patient.name}`;
            break;
        case 'skip':
            newStatus = 'skipped';
            message = `Patient ${patient.name} skipped`;
            break;
        default:
            return NextResponse.json(
                { success: false, error: 'Invalid action' },
                { status: 400 }
            );
    }

    const updated = updatePatientStatus(id, newStatus);

    if (updated) {
        return NextResponse.json({
            success: true,
            message: message,
            patient: { ...patient, status: newStatus }
        });
    } else {
        return NextResponse.json(
            { success: false, error: 'Failed to update patient' },
            { status: 500 }
        );
    }
}
