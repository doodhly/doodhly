import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const PROTECTED_ROUTES = {
    '/app': ['CUSTOMER'],
    '/admin': ['ADMIN'],
    '/partner': ['DELIVERY_PARTNER']
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route requires protection
    const routePrefix = Object.keys(PROTECTED_ROUTES).find(prefix => pathname.startsWith(prefix));

    if (routePrefix) {
        // Look for the auth_token cookie
        const token = request.cookies.get('auth_token')?.value;

        try {
            // Check if token exists first
            if (!token) {
                const loginUrl = new URL('/auth/login', request.url);
                // Optionally append the intended destination so they can be redirected back after login
                loginUrl.searchParams.set('redirectUrl', pathname);
                return NextResponse.redirect(loginUrl);
            }

            // Note: Since this runs on the Edge runtime, we cannot use heavy crypto libraries like 'jsonwebtoken'.
            // However, since we simply need to read the role to route the user, we can decode the payload.
            // A JWT is three base64url encoded strings separated by dots.
            const payloadBase64 = token.split('.')[1];
            if (!payloadBase64) throw new Error('Invalid token structure');

            // Decode base64url to JSON using Edge-compatible atob
            // Need to fix base64url format for atob
            const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
            const decodedPayload = JSON.parse(atob(base64));
            const userRole = decodedPayload.role;

            const allowedRoles = PROTECTED_ROUTES[routePrefix as keyof typeof PROTECTED_ROUTES];

            // If the user's role is not authorized for this section, redirect them
            if (!allowedRoles.includes(userRole)) {
                // Determine fallback route based on role
                let fallbackUrl = new URL('/products', request.url);
                if (userRole === 'ADMIN') fallbackUrl = new URL('/admin/dashboard', request.url);
                if (userRole === 'CUSTOMER') fallbackUrl = new URL('/app/dashboard', request.url);
                if (userRole === 'DELIVERY_PARTNER') fallbackUrl = new URL('/partner/dashboard', request.url);

                return NextResponse.redirect(fallbackUrl);
            }
        } catch (error) {
            // If token parsing fails (e.g., malformed token), treat as unauthenticated
            console.error('Middleware token decode error:', error);
            const loginUrl = new URL('/auth/login', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Allow the request to proceed if it doesn't match protected routes or passed checks
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
         * - public images/assets
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)$).*)',
    ],
};
