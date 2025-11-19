import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/signin", "/signup", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Auth API routes are always accessible
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protected routes
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isApiRoute = pathname.startsWith("/api");

  // Redirect unauthenticated users to signin
  if ((isDashboardRoute || isApiRoute) && !isAuthenticated) {
    const signInUrl = new URL("/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthenticated && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
