import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // Public routes that don't need authentication
    const publicRoutes = ["/", "/login", "/api/auth"];
    if (publicRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin routes - require ADMIN role
    if (pathname.startsWith("/admin")) {
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Dashboard routes - require any authenticated user
    if (pathname.startsWith("/dashboard")) {
      if (!token.email) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access if token exists (detailed checks in middleware function)
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
