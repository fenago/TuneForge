import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: any } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    // If no token, redirect to login for protected routes only
    if (!token) {
      // Protected routes that require authentication
      const protectedRoutes = ["/dashboard", "/admin", "/profile", "/library"];
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      // Allow access to public routes without token
      return NextResponse.next();
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
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes - allow access without authentication
        const publicRoutes = ["/", "/login", "/api/auth", "/pricing", "/about", "/contact"];
        if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
          return true;
        }

        // Protected routes - require authentication
        const protectedRoutes = ["/dashboard", "/admin", "/profile", "/library"];
        if (protectedRoutes.some(route => pathname.startsWith(route))) {
          return !!token;
        }

        // Default: allow access (for other routes like static assets)
        return true;
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
