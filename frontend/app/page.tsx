"use client";

import { Fragment } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/loading-state";

type IconName = "shield" | "bolt" | "users" | "check" | "arrow";

function Icon({ name, className = "" }: Readonly<{ name: IconName; className?: string }>) {
  const paths: Record<IconName, React.ReactNode> = {
    shield: <path d="M12 3 4.5 6.5v5.25c0 4.35 3.04 7.95 7.5 9.25 4.46-1.3 7.5-4.9 7.5-9.25V6.5L12 3Zm-3 9 2 2 4-4" />,
    bolt: <path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" />,
    users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m17-10a4 4 0 1 0-4-8 4 4 0 0 0 4 8ZM14 3.25a4 4 0 0 1 0 7.5M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />,
    check: <path d="m5 12 4 4L19 6" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{paths[name]}</svg>;
}

const highlights = [
  { icon: "check" as const, title: "A focused assessment", text: "Ten thoughtfully balanced questions create a clear starting point." },
  { icon: "bolt" as const, title: "Clear next steps", text: "Receive an instant level result when you complete your assessment." },
  { icon: "users" as const, title: "Built for every role", text: "Separate workspaces keep learners and administrators in control." },
];

const features = [
  { icon: "shield" as const, title: "Secure Assessment", text: "Your answers and assessment progress stay tied to your account." },
  { icon: "bolt" as const, title: "Instant Results", text: "See your score and recommended level as soon as you submit." },
  { icon: "users" as const, title: "Role-Based Access", text: "Purpose-built student and administrator workspaces." },
];

const steps = [
  ["01", "Sign in", "Create an account or return to your existing workspace."],
  ["02", "Take assessment", "Answer ten focused questions at your own pace."],
  ["03", "Get your level", "Receive a clear result and continue with confidence."],
] as const;

export default function Home() {
  const { status, user } = useAuth();
  if (status === "loading") return <LoadingState label="Loading Level Assessment" />;

  const workspace = user?.role === "admin" ? "/admin" : "/student";
  const primaryHref = user ? workspace : "/register";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-950">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_85%_16%,rgba(129,140,248,0.20),transparent_28rem),radial-gradient(circle_at_18%_4%,rgba(224,231,255,0.9),transparent_25rem)]" />
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:py-7">
          <Link href="/" className="group flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-200 transition duration-200 group-hover:-translate-y-0.5">LA</span>
            <span className="text-sm font-semibold tracking-tight text-slate-950 sm:text-base">Level Assessment</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <Link className="rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition duration-200 hover:bg-indigo-700 active:scale-[0.98] sm:px-4" href={workspace}>Open workspace</Link>
            ) : (
              <>
                <Link className="rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition duration-200 hover:bg-white/80 hover:text-indigo-700 active:scale-[0.98] sm:px-4" href="/login">Sign in</Link>
                <Link className="rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition duration-200 hover:bg-indigo-700 active:scale-[0.98] sm:px-4" href="/register">Create account</Link>
              </>
            )}
          </div>
        </nav>

        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Level Assessment Platform</p>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.06]">Know your level. Choose your next step.</h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">A focused assessment experience that gives learners a clear starting point and gives teams the insight to support them.</p>
            <p className="mt-5 text-sm font-semibold text-indigo-700">10 questions <span className="mx-1.5 text-indigo-300">{"\u2022"}</span> 5 levels <span className="mx-1.5 text-indigo-300">{"\u2022"}</span> Instant result</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200/80 transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-300/70 active:translate-y-0 active:scale-[0.98]" href={primaryHref}>{user ? "Go to workspace" : "Get started"}<Icon name="arrow" className="h-4 w-4" /></Link>
              {!user && <Link className="rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:border-indigo-200 hover:bg-white hover:text-indigo-700 active:scale-[0.98]" href="/login">I have an account</Link>}
            </div>
          </div>

          <aside className="relative rounded-[1.75rem] border border-white/65 bg-gradient-to-br from-white/75 via-indigo-50/85 to-violet-100/75 p-5 shadow-xl shadow-indigo-200/30 backdrop-blur-xl sm:p-7">
            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
            <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-900">Designed for clarity</p><span className="rounded-full border border-indigo-100 bg-white/70 px-2.5 py-1 text-xs font-semibold text-indigo-700">Assessment</span></div>
            <p className="mt-2 text-sm leading-6 text-slate-600">Everything you need for a focused, confident start.</p>
            <div className="mt-6 space-y-3">
              {highlights.map((item) => <div className="flex gap-3.5 rounded-2xl border border-white/75 bg-white/70 p-4 shadow-sm shadow-indigo-100/30" key={item.title}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-100 text-indigo-700"><Icon name={item.icon} className="h-4.5 w-4.5" /></span><div><p className="text-sm font-semibold text-slate-900">{item.title}</p><p className="mt-0.5 text-sm leading-5 text-slate-600">{item.text}</p></div></div>)}
            </div>
          </aside>
        </section>
      </div>

      <section className="border-y border-slate-200/80 bg-white/80">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 sm:grid-cols-3 sm:px-8 sm:py-14">
          {features.map((feature) => <article className="rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/60 sm:p-6" key={feature.title}><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Icon name={feature.icon} className="h-5 w-5" /></span><h2 className="mt-5 text-base font-semibold text-slate-950">{feature.title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{feature.text}</p></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-600">Simple by design</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl">How it works</h2><p className="mt-3 text-base leading-7 text-slate-600">A clear path from your first sign-in to a useful result.</p></div>
        <ol className="mt-9 grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)_3rem_minmax(0,1fr)] xl:items-stretch xl:gap-0">
          {steps.map(([number, title, text]) => <Fragment key={number}>
            <li className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6 xl:h-full">
              <span className="text-sm font-bold text-indigo-600">{number}</span>
              <h3 className="mt-7 text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </li>
            {number !== "03" && <li aria-hidden="true" className="hidden items-center justify-center xl:flex"><span className="relative block h-px w-full bg-indigo-200 after:absolute after:right-0 after:top-1/2 after:h-1.5 after:w-1.5 after:-translate-y-1/2 after:rotate-45 after:border-r after:border-t after:border-indigo-300" /></li>}
          </Fragment>)}
        </ol>
      </section>
    </main>
  );
}
