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
        console.log(`Token found in cookie: ${token.slice(0, 10)}...`);
        headers.set('Authorization', `Bearer ${token}`);
    } else {
        console.log('No token found in cookie');
    }

    try {
        const body = request.method !== 'GET' ? await request.arrayBuffer() : undefined;

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

        const contentType = response.headers.get('content-type');
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            console.error(`Backend returned non-JSON response (${response.status}) for ${url}:`, text.slice(0, 500));
            return NextResponse.json(
                {
                    error: 'Backend Error',
                    message: 'The server returned an invalid response.',
                    url: url,
                    raw: text.slice(0, 200)
                },
                { status: response.status }
            );
        }

        const nextResponse = NextResponse.json(data, { status: response.status });

        // If backend returns a new token (e.g. after onboarding completion), update the cookie
        if (data && data.access_token) {
            nextResponse.cookies.set('token', data.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // 30 days
            });
        }

        return nextResponse;
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
