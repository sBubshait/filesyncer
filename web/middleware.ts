import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redirect to the login page if not authenticated
  },
});

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"], // Protect all routes except API, static files, and public assets
};