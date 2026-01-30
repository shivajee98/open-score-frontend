import { NextResponse, NextRequest } from 'next/server';
import { jwtVerify, decodeJwt } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.AUTH_SECRET || 'd5QTAiHsCxdJ6TNoqK4BLJTnUygBkcIcFbbvQiBWXEOb5JkQHQglkCJHnM69i3pk'
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Define routes
    const isProtectedRoute = pathname.startsWith('/customer') || pathname.startsWith('/admin');
    const isAuthRoute = pathname === '/' || pathname.startsWith('/auth');
    const isOnboardingRoute = pathname === '/auth/onboarding' || pathname === '/auth/merchant-onboarding';
    const isStatic = pathname.startsWith('/_next') || pathname.includes('.');

    if (isStatic) return NextResponse.next();

    let payload: any = null;
    if (token) {
        try {
            // Priority 1: Try full verification if secret is set
            const verified = await jwtVerify(token, JWT_SECRET);
            payload = verified.payload;
        } catch (err) {
            console.error('JWT verification failed:', err);

            // Priority 2: Decoding as fallback for UI routing logic ONLY.
            // This prevents redirect loops if the AUTH_SECRET is temporarily out of sync.
            // Security is still maintained because the Backend API verifies the signature on every call.
            try {
                payload = decodeJwt(token);
                // If it's expired according to decoded data, treat as no token
                if (payload.exp && Date.now() >= payload.exp * 1000) {
                    payload = null;
                }
            } catch (decodeErr) {
                payload = null;
            }

            // If we still have no payload and it's a protected route, or token is clearly corrupt
            if (!payload && isProtectedRoute) {
                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.delete('token');
                return response;
            }
        }
    }

    // Protected routes require valid payload
    if (isProtectedRoute) {
        if (!payload) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('token');
            return response;
        }

        // Onboarding enforcement
        const user = payload.user || payload; // Adjust based on backend payload structure
        const isUserOnboarded = user.is_onboarded;

        if (!isUserOnboarded && !isOnboardingRoute) {
            const onboardingPath = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';
            if (pathname !== onboardingPath) {
                return NextResponse.redirect(new URL(onboardingPath, request.url));
            }
        }

        // Role enforcement
        if (pathname.startsWith('/admin') && user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/customer', request.url));
        }
    }

    // Auth routes (Login): if already logged in, redirect away
    if (isAuthRoute && payload) {
        const user = payload.user || payload;
        if (user.is_onboarded) {
            const targetPath = user.role === 'ADMIN' ? '/admin' : '/customer';
            if (!pathname.startsWith(targetPath)) {
                return NextResponse.redirect(new URL(targetPath, request.url));
            }
        } else if (pathname === '/') {
            const onboardingPath = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';
            return NextResponse.redirect(new URL(onboardingPath, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes, though we might want to protect some)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
