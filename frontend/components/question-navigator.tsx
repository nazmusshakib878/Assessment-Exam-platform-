"use client";

import type { ExamQuestion } from "@/lib/api";

type QuestionNavigatorProps = Readonly<{ questions: ExamQuestion[]; currentIndex: number; answers: Record<number, number>; onSelect: (index: number) => void }>;

export function QuestionNavigator({ questions, currentIndex, answers, onSelect }: QuestionNavigatorProps) {
  return <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-800">Question navigator</p><p className="text-xs text-slate-500"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />answered</p></div><div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">{questions.map((item, index) => { const current = index === currentIndex; const answered = answers[item.id] !== undefined; return <button key={item.id} onClick={() => onSelect(index)} aria-label={`Go to question ${index + 1}`} className={`h-10 rounded-lg text-sm font-bold transition ${current ? "bg-indigo-600 text-white ring-4 ring-indigo-100" : answered ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{index + 1}</button>; })}</div></div>;
}
