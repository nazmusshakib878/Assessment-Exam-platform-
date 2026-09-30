"use client";

import { useEffect, useState } from "react";
import { getAttempts, startAttempt, type AttemptResult } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useApiError } from "@/components/use-api-error";
import { ErrorMessage } from "@/components/error-message";
import { LoadingState } from "@/components/loading-state";
import { useRouter } from "next/navigation";

function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not submitted"; }

export function StudentDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const handleApiError = useApiError();
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadResults = async () => {
    if (!token) return;
    setIsLoading(true); setError(null);
    try { setResults((await getAttempts(token)).attempts); } catch (caught) { setError(await handleApiError(caught)); } finally { setIsLoading(false); }
  };

  useEffect(() => { void (async () => { await Promise.resolve(); await loadResults(); })(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    if (!token) return;
    setIsStarting(true); setError(null);
    try { const { attempt } = await startAttempt(token); router.push(`/student/exam/${attempt.id}`); } catch (caught) { setError(await handleApiError(caught)); } finally { setIsStarting(false); }
  }

  if (isLoading) return <LoadingState label="Loading your assessment history" />;

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white sm:p-10 lg:flex-row lg:items-end"><div><p className="text-sm font-semibold text-indigo-200">Student dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {user?.name?.split(" ")[0]}.</h1><p className="mt-3 max-w-xl text-indigo-100">Take a focused level assessment and see where your learning can go next.</p></div><button disabled={isStarting} onClick={handleStart} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50 disabled:opacity-60">{isStarting ? "Starting exam..." : "Start exam"}</button></div>{error && <div className="mt-6"><ErrorMessage message={error} /></div>}<section className="mt-10"><div className="flex items-baseline justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Your progress</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Past results</h2></div><button onClick={() => void loadResults()} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh</button></div>{results.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-900">No completed assessments yet</p><p className="mt-2 text-sm text-slate-600">Start your first exam when you are ready.</p></div> : <div className="mt-5 grid gap-4 md:grid-cols-2">{results.map((result) => <button key={result.id} onClick={() => router.push(`/student/result/${result.id}`)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-500">Submitted {formatDate(result.submitted_at)}</p><p className="mt-2 text-lg font-bold text-slate-950">{result.level_name}</p></div><span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700">{result.total_score}/30</span></div></button>)}</div>}</section></main>;
}
