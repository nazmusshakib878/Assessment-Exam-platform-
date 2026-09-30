"use client";

import { useEffect, useState } from "react";
import { getAdminQuestions, getAdminResults } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useApiError } from "@/components/use-api-error";

type InsightState = { questions: number; results: number; levels: number[] };

export function AdminInsights() {
  const { token } = useAuth();
  const handleApiError = useApiError();
  const [insights, setInsights] = useState<InsightState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const authToken = token;
    let active = true;
    async function load() {
      await Promise.resolve();
      try {
        const [allQuestions, results, ...levels] = await Promise.all([
          getAdminQuestions(authToken),
          getAdminResults(authToken),
          ...[1, 2, 3, 4, 5].map((level) => getAdminQuestions(authToken, 1, level)),
        ]);
        if (active) setInsights({ questions: allQuestions.meta.total, results: results.meta.total, levels: levels.map((level) => level.meta.total) });
      } catch (caught) {
        if (active) setError(await handleApiError(caught));
      }
    }
    void load();
    return () => { active = false; };
  }, [handleApiError, token]);

  if (error) return <p className="mt-8 text-sm text-rose-600">Summary is temporarily unavailable: {error}</p>;
  if (!insights) return <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-slate-200" />)}</div>;

  return <section className="mt-8"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Metric label="Question bank" value={insights.questions} detail="Ready for assessment" /><Metric label="Submitted assessments" value={insights.results} detail="Student results recorded" /><Metric label="Coverage" value={`${insights.levels.filter((count) => count >= 10).length}/5`} detail="Levels with 10+ questions" /></div><div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><p className="font-semibold text-slate-900">Question distribution</p><p className="mt-1 text-sm text-slate-500">A balanced bank supports consistent exam generation.</p></div><span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Levels 1-5</span></div><div className="mt-5 grid grid-cols-5 gap-3">{insights.levels.map((count, index) => <div key={index} className="rounded-xl bg-slate-50 p-3 text-center"><p className="text-xs font-semibold text-slate-500">Level {index + 1}</p><p className={`mt-1 text-xl font-bold ${count >= 10 ? "text-emerald-600" : "text-amber-600"}`}>{count}</p></div>)}</div></div></section>;
}

function Metric({ label, value, detail }: Readonly<{ label: string; value: number | string; detail: string }>) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></div>;
}
