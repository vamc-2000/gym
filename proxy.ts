import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const role = request.cookies.get("userRole")?.value || "USER";

    if (pathname === "/dashboard") {
      if (role === "SUPER_ADMIN") return NextResponse.redirect(new URL("/dashboard/super-admin", request.url));
      if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      return NextResponse.redirect(new URL("/dashboard/user", request.url));
    }

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
  matcher: ["/dashboard/:path*", "/api/:path*"],
};