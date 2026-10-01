"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createAdminQuestion, deleteAdminQuestion, getAdminQuestions, updateAdminQuestion, type AdminQuestion, type PaginationMeta, type QuestionInput } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useApiError } from "@/components/use-api-error";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorMessage } from "@/components/error-message";
import { LoadingState } from "@/components/loading-state";
import { PaginationControls } from "@/components/pagination-controls";
import { QuestionForm } from "@/components/question-form";

export function QuestionManagement() {
  const { token } = useAuth();
  const handleApiError = useApiError();
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<number | undefined>();
  const [editing, setEditing] = useState<AdminQuestion | null>(null);
  const [deleting, setDeleting] = useState<AdminQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadQuestions() {
    if (!token) return;
    const authToken = token;
    setIsLoading(true); setError(null);
    try { const response = await getAdminQuestions(authToken, page, level); setQuestions(response.data); setMeta(response.meta); } catch (caught) { setError(await handleApiError(caught)); } finally { setIsLoading(false); }
  }

  useEffect(() => { void (async () => { await Promise.resolve(); await loadQuestions(); })(); }, [page, level, token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveQuestion(input: QuestionInput) {
    if (!token) return;
    setIsSaving(true); setError(null);
    try { if (editing) await updateAdminQuestion(editing.id, input, token); else await createAdminQuestion(input, token); setEditing(null); await loadQuestions(); } finally { setIsSaving(false); }
  }

  async function confirmDelete() {
    if (!token || !deleting) return;
    setIsDeleting(true); setError(null);
    try { await deleteAdminQuestion(deleting.id, token); setDeleting(null); await loadQuestions(); } catch (caught) { setError(await handleApiError(caught)); } finally { setIsDeleting(false); }
  }

  if (isLoading && !meta) return <LoadingState label="Loading questions" />;

  return <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><Link href="/admin" className="text-sm font-semibold text-slate-500 hover:text-indigo-600">Admin dashboard</Link><p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-indigo-600">Question management</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Question bank</h1></div><label className="text-sm font-semibold text-slate-700">Filter by level<select value={level ?? ""} onChange={(event) => { setLevel(event.target.value ? Number(event.target.value) : undefined); setPage(1); }} className="ml-3 h-10 rounded-lg border border-slate-300 bg-white px-3"><option value="">All levels</option>{[1, 2, 3, 4, 5].map((item) => <option key={item} value={item}>Level {item}</option>)}</select></label></div><div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]"><section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">{error && <div className="mb-5"><ErrorMessage message={error} /></div>}<div className="overflow-x-auto"><table className="min-w-full text-left"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Question</th><th className="px-3 py-3">Level</th><th className="px-3 py-3">Options</th><th className="px-3 py-3 text-right">Actions</th></tr></thead><tbody>{questions.map((question) => <tr key={question.id} className="border-b border-slate-100 align-top last:border-0"><td className="max-w-xs px-3 py-4 text-sm font-semibold text-slate-900">{question.text}</td><td className="px-3 py-4"><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{question.level}</span></td><td className="min-w-52 px-3 py-4"><ol className="space-y-1 text-xs text-slate-600">{question.options.map((option, index) => <li key={index} className={index === question.correct_option ? "font-semibold text-emerald-700" : ""}>{index + 1}. {option}</li>)}</ol></td><td className="px-3 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => setEditing(question)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700">Edit</button><button onClick={() => setDeleting(question)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">Delete</button></div></td></tr>)}</tbody></table></div>{questions.length === 0 && <p className="py-10 text-center text-sm text-slate-500">No questions match this filter.</p>}{meta && <PaginationControls meta={meta} onPageChange={setPage} />}</section><aside><QuestionForm key={editing?.id ?? "new"} question={editing} isSaving={isSaving} onCancel={() => setEditing(null)} onSubmit={saveQuestion} /></aside></div><ConfirmDialog open={Boolean(deleting)} title="Delete this question?" description="Questions already used in an exam cannot be deleted." confirmLabel="Delete question" isPending={isDeleting} onCancel={() => setDeleting(null)} onConfirm={() => void confirmDelete()} /></main>;
}
