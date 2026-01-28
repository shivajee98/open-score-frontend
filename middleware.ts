import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userStr = request.cookies.get('user')?.value;
    const { pathname } = request.nextUrl;

    // Handle legacy merchant routes
    if (pathname.startsWith('/merchant')) {
        return NextResponse.redirect(new URL('/customer', request.url));
    }

    // Define protected and auth routes
    const isProtectedRoute = pathname.startsWith('/customer') ||
        pathname.startsWith('/admin');
    const isAuthRoute = pathname === '/' || pathname.startsWith('/auth');
    const isOnboardingRoute = pathname === '/auth/onboarding' || pathname === '/auth/merchant-onboarding';

    // Protected routes require authentication
    if (isProtectedRoute) {
        if (!token) {
            const response = NextResponse.redirect(new URL('/', request.url));
            // Clear any stale cookies
            response.cookies.delete('token');
            response.cookies.delete('user');
            return response;
        }

        // Check if user data exists and is valid
        if (userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));

                // Redirect to onboarding if not completed
                if (!user.is_onboarded && !isOnboardingRoute) {
                    const onboardingPath = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';

                    // Prevent redirect loop
                    if (pathname !== onboardingPath) {
                        return NextResponse.redirect(new URL(onboardingPath, request.url));
                    }
                }
            } catch (e) {
                // If user cookie is malformed, clear everything and redirect to login
                console.error('Malformed user cookie:', e);
                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.delete('token');
                response.cookies.delete('user');
                return response;
            }
        } else if (token) {
            // Token exists but no user data - don't clear token, just redirect to home
            // where client-side checkSession can re-verify and sync cookies
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Redirect logged-in users away from auth routes
    if (isAuthRoute && token && userStr) {
        try {
            const user = JSON.parse(decodeURIComponent(userStr));

            if (user.is_onboarded) {
                // Redirect based on role
                const targetPath = user.role === 'ADMIN' ? '/admin' : '/customer';

                // Only redirect if not already on the target path
                if (!pathname.startsWith(targetPath)) {
                    return NextResponse.redirect(new URL(targetPath, request.url));
                }
            } else if (pathname === '/') {
                // Not onboarded, redirect to appropriate onboarding
                const onboardingPath = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';
                return NextResponse.redirect(new URL(onboardingPath, request.url));
            }
        } catch (e) {
            // Parsing error - clear cookies
            const response = NextResponse.next();
            response.cookies.delete('token');
            response.cookies.delete('user');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - icon.svg (icon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
    ],
};
