import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get token from cookie
    const token = request.cookies.get('token')?.value

    // Define protected route patterns
    const protectedRoutes = {
        student: /^\/student/,
        tutor: /^\/tutor/,
        admin: /^\/admin/,
    }

    // Public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/login',
        '/signup',
        '/register',
        '/about',
        '/contact',
        '/courses',
        '/tutors',
        '/student-registration',
        '/register-paid',
        '/register-free',
        '/free-class',
        '/order-confirmation',
    ]

    // Check if the current path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))

    // If it's a public route, allow access
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname) // Save intended destination
        return NextResponse.redirect(url)
    }

    // Get user role from cookie (stored separately since Sanctum tokens don't contain role)
    const userRole = request.cookies.get('userRole')?.value

    if (!userRole) {
        // No role cookie, redirect to login
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Check role-based access
    for (const [role, pattern] of Object.entries(protectedRoutes)) {
        if (pattern.test(pathname)) {
            if (userRole !== role) {
                // User trying to access route for different role
                const url = request.nextUrl.clone()
                url.pathname = `/${userRole}` // Redirect to their correct dashboard
                return NextResponse.redirect(url)
            }
            break
        }
    }

    // Token exists and role matches, allow access
    return NextResponse.next()
}


// Configure which routes should be processed by middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|SVG|PNG|JPG|JPEG|GIF|WEBP)$).*)',
    ],
}
