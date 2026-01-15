// GET /api/doctor/queue
// Get patients queue for doctor's department

import { NextRequest, NextResponse } from 'next/server';
import { getPatients } from '@/lib/store';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');

    console.log("[API] Doctor queue request for department:", department);

    let patients = getPatients();

    // Filter by department if specified
    if (department && department !== 'all') {
        patients = patients.filter(p => p.department === department);
    }

    // Sort: In-progress first, then by priority (HIGH > MEDIUM > LOW), then by creation time
    const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
    patients.sort((a, b) => {
        // First sort by status (in-progress first)
        if (a.status === 'in-progress' && b.status !== 'in-progress') return -1;
        if (b.status === 'in-progress' && a.status !== 'in-progress') return 1;

        // Then by priority
        const priorityDiff = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
        if (priorityDiff !== 0) return priorityDiff;

        // Then by creation time (oldest first)
        return a.createdAt - b.createdAt;
    });

    // Get unique departments for filter dropdown
    const allPatients = getPatients();
    const departments = [...new Set(allPatients.map(p => p.department))];

    return NextResponse.json({
        success: true,
        patients: patients,
        departments: departments,
        stats: {
            total: patients.length,
            highPriority: patients.filter(p => p.priority === 'HIGH').length,
            waiting: patients.filter(p => p.status !== 'completed').length
        }
    });
}
