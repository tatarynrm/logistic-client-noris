import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Define public auth routes
    const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');

    // Define protected routes
    const isProtectedRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/trips') ||
        pathname.startsWith('/earnings');

    // If the user is on an auth page and has a token, redirect to dashboard
    if (isAuthPage && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If the user is on a protected route and has NO token, redirect to login
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Special case for root path: if logged in, go to dashboard
    if (pathname === '/' && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
