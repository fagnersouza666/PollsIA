import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

export async function GET(
    request: NextRequest,
    { params }: { params: { publicKey: string } }
) {
    try {
        const { publicKey } = params;
        const { searchParams } = new URL(request.url);

        // Construir query string
        const queryString = searchParams.toString();
        const url = `${BACKEND_URL}/api/wallet/${publicKey}/pools${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error proxying to backend:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch wallet pools data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 