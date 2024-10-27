import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add any paths that should be public
const publicPaths = new Set([
  '/',
  '/favicon.ico',
]);

export function middleware(request: NextRequest) {
  // Check if the path is public
  if (publicPaths.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('auth_token');

  // If no token and trying to access protected route, redirect to home
  if (!authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|.*\\.).*)' // Protect all routes except api, static files, and public paths
};
