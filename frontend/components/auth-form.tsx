"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApiError, login, register } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { ErrorMessage } from "@/components/error-message";

type AuthFormProps = Readonly<{ mode: "login" | "register" }>;

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const router = useRouter();
  const { setSession } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const email = String(formData.get("email") || "");
      const password = String(formData.get("password") || "");
      const response = isRegister
        ? await register(String(formData.get("name") || ""), email, password, String(formData.get("password_confirmation") || ""))
        : await login(email, password);

      setSession(response);
      router.replace(response.user.role === "admin" ? "/admin" : "/student");
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : "Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-slate-50 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.02fr)]">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-700 to-violet-800 p-12 text-white xl:flex xl:flex-col">
        <div className="pointer-events-none absolute -right-32 -top-24 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-indigo-300/15 blur-3xl" />
        <Link href="/" className="relative flex w-fit items-center gap-3 rounded-xl text-lg font-semibold outline-none transition hover:text-indigo-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-700"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-700 shadow-sm">LA</span>Level Assessment</Link>
        <div className="relative my-auto w-full max-w-md py-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">Assessment platform</p>
          <h1 className="text-5xl font-semibold leading-tight">Understand where you are. Build what comes next.</h1>
          <p className="mt-5 max-w-sm text-lg leading-8 text-indigo-100">A focused space for learners and administrators to begin with confidence.</p>

          <div className="mt-9 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-lg shadow-indigo-950/10 backdrop-blur-md">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">Assessment format</p><p className="mt-1 text-lg font-semibold text-white">10 questions. 5 levels.</p></div><span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-indigo-100"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M12 3 4.5 6.5v5.25c0 4.35 3.04 7.95 7.5 9.25 4.46-1.3 7.5-4.9 7.5-9.25V6.5L12 3Z" /></svg></span></div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full w-full rounded-full bg-gradient-to-r from-indigo-200 via-white to-indigo-200" /></div>
            <div className="mt-5 space-y-2.5">{['2 questions from each level', 'Correct answers earn level-based points', 'Maximum score: 30 points'].map((rule) => <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-indigo-50" key={rule}><span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/15"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path d="m5 12 4 4L19 6" /></svg></span>{rule}</div>)}</div>
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">Result levels</p><p className="mt-2 text-xs font-medium leading-5 text-indigo-100">0-5 Beginner <span className="mx-1 text-indigo-300">{"\u2022"}</span> 6-11 Elementary <span className="mx-1 text-indigo-300">{"\u2022"}</span> 12-18 Intermediate <span className="mx-1 text-indigo-300">{"\u2022"}</span> 19-24 Advanced <span className="mx-1 text-indigo-300">{"\u2022"}</span> 25-30 Expert</p></div>
        </div>
        <p className="relative text-sm text-indigo-200">Secure, role-based access</p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 xl:min-h-0 xl:px-10">
        <div className="w-full max-w-[29rem] rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 rounded-lg font-semibold text-slate-900 outline-none transition hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 xl:hidden"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-xs text-white">LA</span>Level Assessment</Link>
          <Link href="/" className="group relative mb-6 inline-flex items-center gap-1.5 rounded-lg text-xs font-semibold text-slate-500 outline-none transition-colors duration-200 hover:text-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"><span className="transition-transform duration-200 group-hover:-translate-x-0.5">{"\u2190"}</span><span className="relative after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-indigo-500 after:transition-transform after:duration-200 group-hover:after:scale-x-100">Back to Home</span></Link>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">{isRegister ? "Create account" : "Welcome back"}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{isRegister ? "Start your learning journey" : "Sign in to continue"}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{isRegister ? "Your account will be created as a student." : "Use your assessment platform credentials."}</p>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {isRegister && <Field label="Full name" name="name" autoComplete="name" />}
            <Field label="Email address" name="email" type="email" autoComplete="email" />
            <Field label="Password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} />
            {isRegister && <Field label="Confirm password" name="password_confirmation" type="password" autoComplete="new-password" minLength={8} />}
            {error && <ErrorMessage message={error} />}
            <button disabled={isSubmitting} className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit">
              {isSubmitting ? "Please wait" : isRegister ? "Create student account" : "Sign in"}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-600">{isRegister ? "Already have an account?" : "New to the platform?"} <Link className="font-semibold text-indigo-600 hover:text-indigo-700" href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </section>
    </main>
  );
}

type FieldProps = Readonly<{ label: string; name: string; type?: string; autoComplete: string; minLength?: number }>;
function Field({ label, name, type = "text", autoComplete, minLength }: FieldProps) {
  return <label className="block text-sm font-medium text-slate-700"><span>{label}</span><input required minLength={minLength} name={name} type={type} autoComplete={autoComplete} className="mt-2 block h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" /></label>;
}
