import { NextResponse } from 'next/server';

export function errorResponse(message: string, status: number = 400) {
    return NextResponse.json({ error: message, success: false }, { status });
}

export function successResponse(data: Record<string, unknown> = {}, status: number = 200) {
    return NextResponse.json({ ...data, success: true }, { status });
}
