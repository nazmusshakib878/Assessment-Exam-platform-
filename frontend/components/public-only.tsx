"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";

export function PublicOnly({ children }: Readonly<{ children: React.ReactNode }>) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(user.role === "admin" ? "/admin" : "/student");
    }
  }, [router, status, user]);

  if (status === "loading") return <LoadingState label="Checking your session" />;
  if (user) return <LoadingState label="Redirecting" />;

  return <>{children}</>;
}
