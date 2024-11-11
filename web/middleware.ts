// middleware.ts
import { NextResponse } from 'next/server';
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Check if the user is authenticated and trying to access protected routes
    if (!request.nextauth.token) {
      // Save the requested URL to redirect back after login
      const redirectUrl = request.nextUrl.pathname + request.nextUrl.search;
      const encodedRedirectUrl = encodeURIComponent(redirectUrl);
      
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encodedRedirectUrl}`, request.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect all routes except auth and public routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth folder (sign in pages)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public|auth).*)',
  ],
};