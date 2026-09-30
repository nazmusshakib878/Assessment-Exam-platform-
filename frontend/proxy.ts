import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const present = request.cookies.get("auth_present")?.value === "1";
  const role = request.cookies.get("auth_role")?.value;
  const home = role === "admin" ? "/admin" : "/student";
  if ((pathname.startsWith("/admin") || pathname.startsWith("/student")) && !present) return NextResponse.redirect(new URL("/login", request.url));
  if (pathname.startsWith("/admin") && role === "student") return NextResponse.redirect(new URL("/student", request.url));
  if (pathname.startsWith("/student") && role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
  if ((pathname === "/login" || pathname === "/register") && present && (role === "admin" || role === "student")) return NextResponse.redirect(new URL(home, request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/student/:path*", "/login", "/register"] };
