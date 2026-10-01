"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getAdminResults, type AdminResult, type AdminResultsFilter, type PaginationMeta } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useApiError } from "@/components/use-api-error";
import { ErrorMessage } from "@/components/error-message";
import { LoadingState } from "@/components/loading-state";
import { PaginationControls } from "@/components/pagination-controls";

const filters: Array<{ value: AdminResultsFilter; label: string }> = [
  { value: "all", label: "All" }, { value: "score_desc", label: "Top Score" }, { value: "Expert", label: "Expert" },
  { value: "Advanced", label: "Advanced" }, { value: "Intermediate", label: "Intermediate" }, { value: "Elementary", label: "Elementary" }, { value: "Beginner", label: "Beginner" },
];
function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not available"; }
function filterSummary(filter: AdminResultsFilter) { return filter === "all" ? "Showing all submitted results" : filter === "score_desc" ? "Sorted by highest score" : `Showing ${filter} results`; }

export function AdminResultsTable() {
  const { token } = useAuth(); const handleApiError = useApiError();
  const [results, setResults] = useState<AdminResult[]>([]); const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1); const [filter, setFilter] = useState<AdminResultsFilter>("all");
  const [isLoading, setIsLoading] = useState(true); const [isRefreshing, setIsRefreshing] = useState(false); const [error, setError] = useState<string | null>(null);
  const requestInFlight = useRef(false);
  const loadResults = useCallback(async (refresh = false) => {
    if (!token || requestInFlight.current) return;
    requestInFlight.current = true; if (refresh) setIsRefreshing(true); else setIsLoading(true); setError(null);
    try { const response = await getAdminResults(token, page, filter); setResults(response.data); setMeta(response.meta); }
    catch (caught) { setError(await handleApiError(caught)); }
    finally { requestInFlight.current = false; setIsLoading(false); setIsRefreshing(false); }
  }, [filter, handleApiError, page, token]);
  useEffect(() => { void loadResults(); }, [loadResults]);
  function selectFilter(nextFilter: AdminResultsFilter) { if (nextFilter === filter) return; setFilter(nextFilter); setPage(1); }
  if (isLoading && !meta) return <LoadingState label="Loading student results" />;
  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-indigo-600">Admin dashboard</Link><div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Student results</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Completed assessments</h1><p className="mt-2 text-slate-600">Review submitted results across the platform.</p></div><button type="button" onClick={() => void loadResults(true)} disabled={isRefreshing || isLoading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">{isRefreshing && <span aria-hidden="true" className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />}{isRefreshing ? "Refreshing" : "Refresh"}</button></div><section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"><div className="mb-6"><p className="text-sm font-semibold text-slate-700">Filter results</p><div className="mt-3 flex flex-wrap gap-2">{filters.map((option) => <button key={option.value} type="button" onClick={() => selectFilter(option.value)} aria-pressed={filter === option.value} className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${filter === option.value ? "border-indigo-600 bg-indigo-600 text-white shadow-sm" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"}`}>{option.label}</button>)}</div><p className="mt-3 text-sm text-slate-500">{filterSummary(filter)}</p></div>{error && <div className="mb-5"><ErrorMessage message={error} /></div>}<div className="overflow-x-auto"><table className="min-w-full text-left"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Student</th><th className="px-3 py-3">Score</th><th className="px-3 py-3">Level</th><th className="px-3 py-3">Submitted</th></tr></thead><tbody>{results.map((result) => <tr key={result.id} className="border-b border-slate-100 last:border-0"><td className="px-3 py-4 text-sm font-semibold text-slate-900">{result.student_name}</td><td className="px-3 py-4"><span className="rounded-lg bg-indigo-50 px-2.5 py-1.5 text-sm font-bold text-indigo-700">{result.score}/30</span></td><td className="px-3 py-4 text-sm font-medium text-slate-700">{result.level_name}</td><td className="px-3 py-4 text-sm text-slate-600">{formatDate(result.submitted_at)}</td></tr>)}</tbody></table></div>{results.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No submitted attempts are available for this filter.</p>}{meta && <PaginationControls meta={meta} onPageChange={setPage} />}</section></main>;
}