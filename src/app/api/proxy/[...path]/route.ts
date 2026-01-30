import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://open-score-backend.onrender.com';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleRequest(request, path);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleRequest(request, path);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleRequest(request, path);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleRequest(request, path);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleRequest(request, path);
}

async function handleRequest(request: NextRequest, pathParts: string[]) {
    const path = pathParts.join('/');
    const token = request.cookies.get('token')?.value;
    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

    const headers = new Headers();
    // Headers to forward
    const headersToForward = ['content-type', 'accept'];
    headersToForward.forEach(h => {
        const val = request.headers.get(h);
        if (val) headers.set(h, val);
    });

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const body = request.method !== 'GET' ? await request.text() : undefined;

        const response = await fetch(url, {
            method: request.method,
            headers,
            body,
            cache: 'no-store'
        });

        // If backend says unauthorized, we should probably clear the cookie
        if (response.status === 401) {
            const nextResponse = NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
            nextResponse.cookies.delete('token');
            return nextResponse;
        }

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
