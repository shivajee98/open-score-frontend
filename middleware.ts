import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const userStr = request.cookies.get('user')?.value;
    const { pathname } = request.nextUrl;

    // Define protected and auth routes
    const isProtectedRoute = pathname.startsWith('/customer') ||
        pathname.startsWith('/admin');
    const isAuthRoute = pathname === '/' || pathname.startsWith('/auth');
    const isOnboardingRoute = pathname === '/auth/onboarding' || pathname === '/auth/merchant-onboarding';

    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        if (userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                if (!user.is_onboarded && !isOnboardingRoute) {
                    const onboardingPath = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';
                    return NextResponse.redirect(new URL(onboardingPath, request.url));
                }
            } catch (e) {
                // If user cookie is malformed, clear and redirect to login
                const response = NextResponse.redirect(new URL('/', request.url));
                response.cookies.delete('token');
                response.cookies.delete('user');
                return response;
            }
        }
    }

    // Redirect logged-in users away from the login page
    if (pathname === '/' && token && userStr) {
        try {
            const user = JSON.parse(decodeURIComponent(userStr));
            if (!user.is_onboarded) {
                const onboardingPath = user.role === 'MERCHANT' ? '/auth/merchant-onboarding' : '/auth/onboarding';
                return NextResponse.redirect(new URL(onboardingPath, request.url));
            }

            if (user.role === 'ADMIN') return NextResponse.redirect(new URL('/admin', request.url));
            return NextResponse.redirect(new URL('/customer', request.url));
        } catch (e) {
            // Allow the page to load if parsing fails, it will clear storage anyway
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
