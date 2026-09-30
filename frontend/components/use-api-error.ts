"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export function useApiError() {
  const { logout } = useAuth();
  const router = useRouter();

  return useCallback(async (error: unknown): Promise<string> => {
    if (error instanceof ApiError && error.status === 401) {
      await logout();
      router.replace("/login");
      return "Your session has expired. Please sign in again.";
    }
    if (error instanceof ApiError && error.status === 403) return "You do not have permission to access this resource.";
    return error instanceof Error ? error.message : "Unable to complete the request. Please try again.";
  }, [logout, router]);
}
