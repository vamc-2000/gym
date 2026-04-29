import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This is a server-side middleware. It can only read cookies, not localStorage.
// We expect the 'accessToken' to be stored in a cookie for server-side protection.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      // No token, redirect to login
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-based protection logic
    // In a real app, we would verify the JWT here. 
    // Since we are in a demo, we will rely on a 'userRole' cookie for routing.
    const role = request.cookies.get("userRole")?.value || "USER";

    if (pathname === "/dashboard") {
      // Root dashboard path, redirect based on role
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/dashboard/super-admin", request.url));
      if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    }

    // Specific route protections
    if (pathname.startsWith("/dashboard/super-admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
