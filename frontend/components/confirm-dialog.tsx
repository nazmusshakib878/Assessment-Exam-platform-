"use client";

type ConfirmDialogProps = Readonly<{ open: boolean; title: string; description: string; confirmLabel: string; reviewLabel?: string; isPending?: boolean; onCancel: () => void; onConfirm: () => void; onReview?: () => void }>;

export function ConfirmDialog({ open, title, description, confirmLabel, reviewLabel = "Review unanswered", isPending = false, onCancel, onConfirm, onReview }: ConfirmDialogProps) {
  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5"><div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="confirm-title" className="text-xl font-bold text-slate-950">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p><div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end"><button disabled={isPending} onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Keep reviewing</button>{onReview && <button disabled={isPending} onClick={onReview} className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">{reviewLabel}</button>}<button disabled={isPending} onClick={onConfirm} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{isPending ? "Submitting..." : confirmLabel}</button></div></div></div>;
}
