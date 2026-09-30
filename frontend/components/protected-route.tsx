"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";

type ProtectedRouteProps = Readonly<{
  role: UserRole;
  children: React.ReactNode;
}>;

export function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== role) {
      router.replace(user.role === "admin" ? "/admin" : "/student");
    }
  }, [pathname, router, status, user, role]);

  if (status === "loading") return <LoadingState label="Checking your session" />;
  if (!user || user.role !== role) return <LoadingState label="Redirecting" />;

  return <>{children}</>;
}
