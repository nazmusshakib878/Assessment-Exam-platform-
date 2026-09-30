import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const present = request.cookies.get("auth_present")?.value === "1";
  const role = request.cookies.get("auth_role")?.value;
  const redirect = (target: string) => pathname === target ? NextResponse.next() : NextResponse.redirect(new URL(target, request.url));

  if ((pathname.startsWith("/admin") || pathname.startsWith("/student")) && !present) return redirect("/login");
  if (pathname.startsWith("/admin") && role === "student") return redirect("/student");
  if (pathname.startsWith("/student") && role === "admin") return redirect("/admin");

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*", "/student/:path*", "/login", "/register"] };
