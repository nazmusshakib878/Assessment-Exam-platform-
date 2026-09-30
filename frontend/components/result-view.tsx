"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAttempts, type AttemptResult } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useApiError } from "@/components/use-api-error";
import { AppHeader } from "@/components/app-header";
import { ErrorMessage } from "@/components/error-message";
import { LoadingState } from "@/components/loading-state";

export function ResultView({ attemptId }: Readonly<{ attemptId: string }>) {
  const { token } = useAuth();
  const handleApiError = useApiError();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const authToken = token;
    let active = true;
    async function load() {
      setIsLoading(true); setError(null);
      try {
        const { attempts } = await getAttempts(authToken);
        const found = attempts.find((item) => item.id === Number(attemptId)) ?? null;
        if (!found) throw new Error("This submitted result was not found.");
        if (active) setResult(found);
      } catch (caught) { if (active) setError(await handleApiError(caught)); } finally { if (active) setIsLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, [attemptId, handleApiError, token]);

  if (isLoading) return <LoadingState label="Loading your result" />;
  if (!result) return <div className="min-h-screen bg-slate-50"><AppHeader role="student" /><main className="mx-auto max-w-xl px-5 py-16"><ErrorMessage message={error || "This result is unavailable."} /><Link href="/student" className="mt-5 inline-block text-sm font-semibold text-indigo-600">Return to dashboard</Link></main></div>;

  return <div className="min-h-screen bg-slate-50"><AppHeader role="student" /><main className="mx-auto max-w-2xl px-5 py-12 sm:px-8"><div className="rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm sm:p-10"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Assessment complete</p><h1 className="mt-3 text-3xl font-bold text-slate-950">Your result</h1><div className="mx-auto mt-8 grid h-40 w-40 place-items-center rounded-full border-8 border-indigo-100 bg-indigo-50"><div><p className="text-4xl font-bold text-indigo-700">{result.total_score}</p><p className="text-sm font-semibold text-indigo-600">out of 30</p></div></div><div className="mt-8 rounded-2xl bg-slate-50 p-5"><p className="text-sm text-slate-500">Your level</p><p className="mt-1 text-2xl font-bold text-slate-950">{result.level_name}</p></div><Link href="/student" className="mt-8 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Back to dashboard</Link></div></main></div>;
}
