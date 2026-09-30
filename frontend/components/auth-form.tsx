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
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="hidden bg-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-lg font-semibold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-indigo-700">LA</span>Level Assessment</div>
        <div className="max-w-md"><p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">Assessment platform</p><h1 className="text-5xl font-semibold leading-tight">Understand where you are. Build what comes next.</h1><p className="mt-6 text-lg leading-8 text-indigo-100">A focused space for learners and administrators to begin with confidence.</p></div>
        <p className="text-sm text-indigo-200">Secure, role-based access</p>
      </section>
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 font-semibold text-slate-900 lg:hidden"><span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-xs text-white">LA</span>Level Assessment</Link>
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
