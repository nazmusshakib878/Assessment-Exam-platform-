"use client";

import { useEffect, useState } from "react";
import { getAttempts, startAttempt, type AttemptResult } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useApiError } from "@/components/use-api-error";
import { ErrorMessage } from "@/components/error-message";
import { useRouter } from "next/navigation";
import { writeExamCache } from "@/lib/exam-cache";

const RESULTS_CACHE_TTL = 30_000;
type ResultsCacheEntry = { results: AttemptResult[]; cachedAt: number };
const resultsCache = new Map<string, ResultsCacheEntry>();
const resultsRequests = new Map<string, Promise<AttemptResult[]>>();

function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "Not submitted";
}

function hasFreshResults(token: string) {
  const entry = resultsCache.get(token);
  return Boolean(entry && Date.now() - entry.cachedAt < RESULTS_CACHE_TTL);
}

function getCachedResults(token: string, forceRefresh = false) {
  const cached = resultsCache.get(token);
  if (!forceRefresh && cached && Date.now() - cached.cachedAt < RESULTS_CACHE_TTL) return Promise.resolve(cached.results);

  const inFlight = resultsRequests.get(token);
  if (inFlight) return inFlight;

  const request = getAttempts(token)
    .then(({ attempts }) => {
      resultsCache.set(token, { results: attempts, cachedAt: Date.now() });
      return attempts;
    })
    .finally(() => {
      resultsRequests.delete(token);
    });
  resultsRequests.set(token, request);
  return request;
}

function SummaryIcon({ type }: { type: "level" | "score" | "attempts" | "best" }) {
  const paths = {
    level: <path d="M12 3 4 7l8 4 6-3v6m-14-7v8l8 4 4-2v-6M9 5.5l6 3" />,
    score: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    attempts: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 11a3 3 0 0 1 3 3m-1 6a4 4 0 0 0-2-3.7" /></>,
    best: <><path d="M6 4h12M8 4v4a4 4 0 0 0 8 0V4M12 12v4m-4 4h8M9 20h6" /><path d="m12 7 .6 1.2 1.4.2-1 .9.2 1.4-1.2-.7-1.2.7.2-1.4-1-.9 1.4-.2L12 7Z" /></>,
  };

  return <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">{paths[type]}</svg>;
}

function CardSkeleton({ wide = false }: { wide?: boolean }) {
  return <span aria-label="Loading" className={`inline-block h-8 animate-pulse rounded bg-slate-200 ${wide ? "w-32" : "w-20"}`} />;
}

export function StudentDashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const handleApiError = useApiError();
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadResults(forceRefresh = false) {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(!hasFreshResults(token));
    setError(null);
    try {
      setResults(await getCachedResults(token, forceRefresh));
    } catch (caught) {
      setError(await handleApiError(caught));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      await loadResults();
    })();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStart() {
    if (!token) return;
    setIsStarting(true); setError(null);
    try {
      const { attempt } = await startAttempt(token);
      writeExamCache(user?.id, String(attempt.id), attempt, {}, 0);
      const examRoute = `/student/exam/${attempt.id}`;
      router.prefetch(examRoute);
      router.push(examRoute);
    } catch (caught) { setError(await handleApiError(caught)); } finally { setIsStarting(false); }
  }

  const latestResult = results[0];
  const bestScore = results.length > 0 ? Math.max(...results.map((result) => result.total_score)) : null;
  const summaryCards = [
    { label: "Current level", value: latestResult?.level_name ?? "Not available", detail: latestResult ? "From your latest assessment" : "Complete an assessment to see your level", icon: "level" as const, color: "bg-indigo-50 text-indigo-600", wide: true },
    { label: "Latest score", value: latestResult ? `${latestResult.total_score}/30` : "N/A", detail: latestResult ? "Your most recent result" : "No score recorded yet", icon: "score" as const, color: "bg-violet-50 text-violet-600", wide: false },
    { label: "Total attempts", value: String(results.length), detail: results.length === 0 ? "Your completed assessments" : "Completed assessments", icon: "attempts" as const, color: "bg-sky-50 text-sky-600", wide: false },
    { label: "Best score", value: bestScore === null ? "N/A" : `${bestScore}/30`, detail: bestScore === null ? "Your highest result" : "Your highest result so far", icon: "best" as const, color: "bg-amber-50 text-amber-600", wide: false },
  ];

  return <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
    <div className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white shadow-xl shadow-indigo-200/50 sm:p-10 lg:flex-row lg:items-end">
      <div><p className="text-sm font-semibold text-indigo-200">Student dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {user?.name?.split(" ")[0]}.</h1><p className="mt-3 max-w-xl text-indigo-100">Take a focused level assessment and see where your learning can go next.</p></div>
      <button disabled={isStarting} onClick={handleStart} className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50 disabled:opacity-60">{isStarting ? "Starting exam..." : "Start exam"}</button>
    </div>
    {error && <div className="mt-6"><ErrorMessage message={error} /></div>}
    <section aria-label="Assessment summary" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map((card) => <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">{card.label}</p><p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950" title={isLoading ? undefined : card.value}>{isLoading ? <CardSkeleton wide={card.wide} /> : card.value}</p></div><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}><SummaryIcon type={card.icon} /></span></div><p className="mt-4 text-xs leading-5 text-slate-500">{isLoading ? <span className="inline-block h-4 w-36 animate-pulse rounded bg-slate-100" /> : card.detail}</p></article>)}
    </section>
    <section className="mt-10"><div className="flex items-baseline justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Your progress</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Past results</h2></div><button onClick={() => void loadResults(true)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Refresh</button></div>
      {isLoading ? <div className="mt-5 grid gap-4 md:grid-cols-2">{[1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="h-4 w-32 rounded bg-slate-200" /><div className="mt-4 h-6 w-24 rounded bg-slate-100" /></div>)}</div> : results.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><p className="font-semibold text-slate-900">No completed assessments yet</p><p className="mt-2 text-sm text-slate-600">Start your first exam when you are ready.</p></div> : <div className="mt-5 grid gap-4 md:grid-cols-2">{results.map((result) => <button key={result.id} onClick={() => router.push(`/student/result/${result.id}`)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-slate-500">Submitted {formatDate(result.submitted_at)}</p><p className="mt-2 text-lg font-bold text-slate-950">{result.level_name}</p></div><span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700">{result.total_score}/30</span></div></button>)}</div>}
    </section>
  </main>;
}
