"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth-provider";

export function AppHeader({ role }: Readonly<{ role: "admin" | "student" }>) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.replace("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-xs font-bold text-white">LA</span><div><p className="font-semibold text-slate-950">Level Assessment</p><p className="text-xs capitalize text-slate-500">{role} workspace</p></div></div>
        <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{user?.name}</p><p className="text-xs text-slate-500">{user?.email}</p></div><button onClick={handleLogout} disabled={isLoggingOut} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">{isLoggingOut ? "Signing out" : "Sign out"}</button></div>
      </div>
    </header>
  );
}
