// middleware.ts or middleware.js
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;

  // Check if the request is for a protected route
  const protectedRoutes = [
    '/dashboard',
    '/dashboard/settings',
    '/dashboard/conversations',
    '/dashboard/billing',
    '/dashboard/employees',
    '/dashboard/reservations',
    // Add more protected routes here
  ];

  const requestPath = request.nextUrl.pathname;

  if (protectedRoutes.some((route) => requestPath.startsWith(route))) {
    // If the request is for a protected route and the user is not authenticated
    if (!accessToken) {
      // Redirect to the login page
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // If the request is not for a protected route, or the user is authenticated, allow the request
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)', '/'],
};