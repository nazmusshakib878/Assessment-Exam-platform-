"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { ProtectedRoute } from "@/components/protected-route";

const cards = [
  { href: "/admin/questions", label: "Question Management", description: "Create, edit, organize, and maintain the assessment question bank.", accent: "QM" },
  { href: "/admin/results", label: "Student Results", description: "Review submitted assessment scores and assigned levels.", accent: "SR" },
];

export default function AdminPage() {
  return <ProtectedRoute role="admin"><div className="min-h-screen bg-slate-50"><AppHeader role="admin" /><main className="mx-auto max-w-6xl px-5 py-12 sm:px-8"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Admin workspace</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Platform administration</h1><p className="mt-3 max-w-xl text-slate-600">Manage the question bank and review completed student assessments from one focused workspace.</p><div className="mt-9 grid gap-5 md:grid-cols-2">{cards.map((card) => <Link key={card.href} href={card.href} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"><span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">{card.accent}</span><h2 className="mt-6 text-xl font-bold text-slate-950 group-hover:text-indigo-700">{card.label}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p><p className="mt-6 text-sm font-semibold text-indigo-600">Open workspace</p></Link>)}</div></main></div></ProtectedRoute>;
}
