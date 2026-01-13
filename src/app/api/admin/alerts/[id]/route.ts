// PATCH /api/admin/alerts/[id]
// Mark a specific alert as resolved

import { NextRequest, NextResponse } from 'next/server';
import type { ResolveAlertResponse } from '@/lib/types';

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PATCH(
    request: NextRequest,
    context: RouteParams
) {
    const { id } = await context.params;
    console.log(`[API] PATCH /api/admin/alerts/${id} - Resolving alert`);

    try {
        // Parse request body
        const body = await request.json();
        const { resolved } = body as { resolved: boolean };

        if (typeof resolved !== 'boolean') {
            return NextResponse.json(
                { success: false, error: "'resolved' must be a boolean value" },
                { status: 400 }
            );
        }

        // TODO: Firebase team - Replace with Firestore update:
        // /alerts/{id} set resolved = true, resolvedAt = Date.now()

        console.log(`[API] Alert ${id} marked as resolved:`, resolved);

        const response: ResolveAlertResponse = {
            success: true,
            alertId: id
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        console.error("[API] Error resolving alert:", error);
        const message = error instanceof Error ? error.message : "Failed to resolve alert";

        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
