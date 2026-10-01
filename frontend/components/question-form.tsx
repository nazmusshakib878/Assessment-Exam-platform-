"use client";

import { FormEvent, useState } from "react";
import { ApiError, type AdminQuestion, type QuestionInput } from "@/lib/api";
import { ErrorMessage } from "@/components/error-message";

type QuestionFormProps = Readonly<{ question?: AdminQuestion | null; isSaving: boolean; onCancel: () => void; onSubmit: (input: QuestionInput) => Promise<void> }>;
type FieldErrors = Record<string, string[]>;
const blankQuestion: QuestionInput = { text: "", level: 1, options: ["", "", "", ""], correct_option: 0 };

export function QuestionForm({ question, isSaving, onCancel, onSubmit }: QuestionFormProps) {
  const [values, setValues] = useState<QuestionInput>(() => question ? { text: question.text, level: question.level, options: question.options, correct_option: question.correct_option } : blankQuestion);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function resetForm() {
    setValues(question ? { text: question.text, level: question.level, options: question.options, correct_option: question.correct_option } : blankQuestion);
    setErrors({});
    setFormError(null);
  }
  function updateOption(index: number, value: string) { setValues((current) => ({ ...current, options: current.options.map((option, itemIndex) => itemIndex === index ? value : option) })); }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrors({}); setFormError(null);
    try { await onSubmit(values); setSuccessMessage(question ? "Question updated" : "Question created"); if (!question) resetForm(); } catch (caught) { if (caught instanceof ApiError && caught.errors) setErrors(caught.errors); else setFormError(caught instanceof Error ? caught.message : "Unable to save the question."); }
  }
  const fieldError = (name: string) => errors[name]?.[0];

  return <form noValidate onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-950">{question ? "Edit question" : "Create question"}</h2><p className="mt-1 text-sm text-slate-600">Provide exactly four answer choices and select the correct one.</p></div>{question && <button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:text-slate-900">Cancel</button>}</div><div className="mt-5 grid gap-5"><label className="block text-sm font-semibold text-slate-700">Question text<textarea required value={values.text} onChange={(event) => setValues((current) => ({ ...current, text: event.target.value }))} className="mt-2 min-h-24 w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" /></label><FieldError message={fieldError("text")} /><div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-700">Level<select value={values.level} onChange={(event) => setValues((current) => ({ ...current, level: Number(event.target.value) }))} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500"><option value={1}>Level 1</option><option value={2}>Level 2</option><option value={3}>Level 3</option><option value={4}>Level 4</option><option value={5}>Level 5</option></select></label><label className="block text-sm font-semibold text-slate-700">Correct option<select value={values.correct_option} onChange={(event) => setValues((current) => ({ ...current, correct_option: Number(event.target.value) }))} className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500">{values.options.map((option, index) => <option key={index} value={index}>Option {index + 1}{option ? `: ${option}` : ""}</option>)}</select></label></div><FieldError message={fieldError("level") || fieldError("correct_option")} /><div><p className="text-sm font-semibold text-slate-700">Options</p><div className="mt-2 grid gap-3 sm:grid-cols-2">{values.options.map((option, index) => <label key={index} className="text-sm text-slate-600">Option {index + 1}<input required value={option} onChange={(event) => updateOption(index, event.target.value)} className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-indigo-500" /></label>)}</div><FieldError message={fieldError("options")} />{values.options.map((_, index) => <FieldError key={index} message={fieldError(`options.${index}`)} />)}</div>{successMessage && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{successMessage}</p>}{formError && <ErrorMessage message={formError} />}<div className="flex justify-end gap-3"><button type="button" onClick={() => question ? onCancel() : resetForm()} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Reset</button><button disabled={isSaving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60" type="submit">{isSaving ? "Saving..." : question ? "Save changes" : "Create question"}</button></div></div></form>;
}

function FieldError({ message }: Readonly<{ message?: string }>) { return message ? <p className="-mt-3 text-sm text-rose-600">{message}</p> : null; }
