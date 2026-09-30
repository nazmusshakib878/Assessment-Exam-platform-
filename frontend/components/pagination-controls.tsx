"use client";

import type { PaginationMeta } from "@/lib/api";

type PaginationControlsProps = Readonly<{ meta: PaginationMeta; onPageChange: (page: number) => void }>;

export function PaginationControls({ meta, onPageChange }: PaginationControlsProps) {
  if (meta.last_page <= 1) return null;
  return <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-5"><p className="text-sm text-slate-500">Page {meta.current_page} of {meta.last_page} ({meta.total} total)</p><div className="flex gap-2"><button disabled={meta.current_page === 1} onClick={() => onPageChange(meta.current_page - 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Previous</button><button disabled={meta.current_page === meta.last_page} onClick={() => onPageChange(meta.current_page + 1)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Next</button></div></nav>;
}
