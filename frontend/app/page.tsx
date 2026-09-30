"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";

export default function Home() {
  const { status, user } = useAuth();
  if (status === "loading") return <LoadingState label="Loading Level Assessment" />;

  const workspace = user?.role === "admin" ? "/admin" : "/student";

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-6 sm:px-8">
      <nav className="mx-auto flex max-w-6xl items-center justify-between"><div className="flex items-center gap-3 font-semibold text-slate-950"><span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-xs text-white">LA</span>Level Assessment</div><div className="flex gap-2">{user ? <Link className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" href={workspace}>Open workspace</Link> : <><Link className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700" href="/login">Sign in</Link><Link className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white" href="/register">Create account</Link></>}</div></nav>
      <section className="mx-auto grid max-w-6xl gap-10 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Level Assessment Platform</p><h1 className="mt-5 max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl">Make every next step a more informed one.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">A concise, role-aware assessment experience for learners and the teams supporting them.</p><div className="mt-9 flex flex-wrap gap-3"><Link className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700" href={user ? workspace : "/register"}>{user ? "Go to workspace" : "Get started"}</Link>{!user && <Link className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/login">I have an account</Link>}</div></div><div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl shadow-indigo-200"><p className="text-sm font-semibold text-indigo-200">Designed for clarity</p><div className="mt-7 space-y-5">{["Personal learning paths", "Role-based workspaces", "Focused assessment workflow"].map((item, index) => <div className="flex items-center gap-4" key={item}><span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 text-sm font-semibold">0{index + 1}</span><p className="font-medium">{item}</p></div>)}</div></div></section>
    </main>
  );
}
