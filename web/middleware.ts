import { NextResponse } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  // `withAuth` augments your Request with the user's token.
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (!token) {
          // Redirect to login if there's no token
          const redirectUrl = encodeURIComponent(req.url)
          return false // This will trigger the redirect in `pages` option
        }
        return true
      }
    },
    pages: {
      signIn: '/api/auth/signin',
    }
  }
)

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
}