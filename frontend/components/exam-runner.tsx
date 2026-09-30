"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAttemptAnswers, submitAttempt, type Attempt } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";
import { useApiError } from "@/components/use-api-error";
import { AppHeader } from "@/components/app-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ErrorMessage } from "@/components/error-message";
import { LoadingState } from "@/components/loading-state";
import { QuestionNavigator } from "@/components/question-navigator";
import { clearExamCache, getAttemptOnce, readExamCache, writeExamCache } from "@/lib/exam-cache";

type ExamRunnerProps = Readonly<{ attemptId: string }>;

export function ExamRunner({ attemptId }: ExamRunnerProps) {
  const { token, user } = useAuth();
  const router = useRouter();
  const handleApiError = useApiError();
  const initialExam = readExamCache(user?.id, attemptId);
  const saveQueue = useRef(Promise.resolve());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingAnswers = useRef(new Map<number, number>());
  const attemptRef = useRef<Attempt | null>(initialExam?.attempt ?? null);
  const answersRef = useRef<Record<number, number>>(initialExam?.answers ?? {});
  const questionIndexRef = useRef(initialExam?.questionIndex ?? 0);
  const [attempt, setAttempt] = useState<Attempt | null>(initialExam?.attempt ?? null);
  const [questionIndex, setQuestionIndex] = useState(initialExam?.questionIndex ?? 0);
  const [answers, setAnswers] = useState<Record<number, number>>(initialExam?.answers ?? {});
  const [isLoading, setIsLoading] = useState(!initialExam);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !user) return;
    const authToken = token;
    const userId = user.id;
    let active = true;
    async function revalidate() {
      setError(null);
      try {
        const response = await getAttemptOnce(userId, attemptId, authToken);
        if (!active) return;
        if (response.attempt.status === "submitted") {
          clearExamCache(userId, attemptId);
          router.replace(`/student/result/${attemptId}`);
          return;
        }
        const serverAnswers = Object.fromEntries((response.attempt.questions ?? []).flatMap((item) => item.selected_option === null || item.selected_option === undefined ? [] : [[item.id, item.selected_option]]));
        const mergedAnswers = { ...serverAnswers, ...answersRef.current };
        const nextQuestionIndex = Math.min(questionIndexRef.current, Math.max(response.attempt.questions?.length ?? 1, 1) - 1);
        attemptRef.current = response.attempt;
        answersRef.current = mergedAnswers;
        questionIndexRef.current = nextQuestionIndex;
        setAttempt(response.attempt);
        setAnswers(mergedAnswers);
        setQuestionIndex(nextQuestionIndex);
        writeExamCache(userId, attemptId, response.attempt, mergedAnswers, nextQuestionIndex);
      } catch (caught) {
        if (active) setError(await handleApiError(caught));
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void revalidate();
    return () => { active = false; };
  }, [attemptId, handleApiError, router, token, user]);

  const questions = attempt?.questions ?? [];
  const question = questions[questionIndex];
  const unansweredIndexes = questions.reduce<number[]>((indexes, item, index) => answers[item.id] === undefined ? [...indexes, index] : indexes, []);
  const unanswered = unansweredIndexes.length;
  const unansweredQuestionNumbers = unansweredIndexes.map((index) => `Q${index + 1}`);

  function persistCache(nextAnswers = answersRef.current, nextQuestionIndex = questionIndexRef.current) {
    writeExamCache(user?.id, attemptId, attemptRef.current ?? attempt!, nextAnswers, nextQuestionIndex);
  }

  function queuePendingAnswers() {
    if (!token || pendingAnswers.current.size === 0) return;
    const changes = Array.from(pendingAnswers.current, ([questionId, selectedOption]) => ({ question_id: questionId, selected_option: selectedOption }));
    pendingAnswers.current.clear();
    const authToken = token;
    saveQueue.current = saveQueue.current.catch(() => undefined).then(async () => {
      setIsSavingAnswer(true);
      try {
        await saveAttemptAnswers(attemptId, changes, authToken);
      } catch (caught) {
        setError(await handleApiError(caught));
      } finally {
        setIsSavingAnswer(false);
      }
    });
  }

  function flushPendingAnswers() {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    queuePendingAnswers();
    return saveQueue.current;
  }

  function chooseAnswer(questionId: number, optionIndex: number) {
    if (!token) return;
    const nextAnswers = { ...answersRef.current, [questionId]: optionIndex };
    answersRef.current = nextAnswers;
    pendingAnswers.current.set(questionId, optionIndex);
    setAnswers(nextAnswers);
    persistCache(nextAnswers);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      queuePendingAnswers();
    }, 350);
  }

  function selectQuestion(index: number) {
    questionIndexRef.current = index;
    setQuestionIndex(index);
    persistCache(answersRef.current, index);
  }

  async function completeSubmission() {
    if (!token || !attempt) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await flushPendingAnswers();
      await saveQueue.current;
      await submitAttempt(attemptId, questions.map((item) => ({ question_id: item.id, selected_option: answersRef.current[item.id] ?? null })), token);
      clearExamCache(user?.id, attemptId);
      router.replace(`/student/result/${attemptId}`);
    } catch (caught) {
      setIsConfirming(false);
      setError(await handleApiError(caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestSubmission() {
    if (unanswered > 0) { setIsConfirming(true); return; }
    void completeSubmission();
  }

  if (isLoading && !attempt) return <LoadingState label="Loading your saved exam" />;
  if (!attempt || questions.length === 0 || !question) return <div className="min-h-screen bg-slate-50"><AppHeader role="student" /><main className="mx-auto max-w-xl px-5 py-16"><ErrorMessage message={error || "This exam could not be loaded."} /><button onClick={() => router.push("/student")} className="mt-5 text-sm font-semibold text-indigo-600">Return to dashboard</button></main></div>;

  return <div className="min-h-screen bg-slate-50"><AppHeader role="student" /><main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12"><div className="mb-7 flex items-center justify-between gap-4"><button onClick={() => setIsLeaving(true)} className="text-sm font-semibold text-slate-600 hover:text-slate-950">Save and leave</button><div className="text-right"><p className="text-sm font-semibold text-slate-600">Question {questionIndex + 1} of {questions.length}</p><p className={`mt-1 text-xs font-medium ${isSavingAnswer ? "text-amber-600" : "text-emerald-600"}`}>{isSavingAnswer ? "Saving progress..." : "Progress saved"}</p></div></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div><div className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-indigo-700">Level {question.level}</span><div className="text-left sm:text-right"><p className="text-sm text-slate-500">{unanswered} unanswered</p>{unanswered > 0 && <p className="mt-1 text-sm font-semibold text-red-600">Unanswered: {unansweredQuestionNumbers.join(", ")}</p>}</div></div><h1 className="mt-6 text-2xl font-bold leading-9 text-slate-950 sm:text-3xl">{question.text}</h1><div className="mt-8 grid gap-3">{question.options.map((option, optionIndex) => { const optionId = question.option_ids?.[optionIndex] ?? optionIndex; const selected = answers[question.id] === optionId; return <button aria-label={`Select option ${String.fromCharCode(65 + optionIndex)}`} key={`${question.id}-${optionId}`} onClick={() => chooseAnswer(question.id, optionId)} className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? "border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>{String.fromCharCode(65 + optionIndex)}</span><span className="font-medium text-slate-800">{option}</span></button>; })}</div></div><QuestionNavigator questions={questions} currentIndex={questionIndex} answers={answers} onSelect={selectQuestion} /><div className="mt-6 flex flex-col-reverse justify-between gap-3 sm:flex-row"><button disabled={questionIndex === 0 || isSubmitting} onClick={() => selectQuestion(questionIndex - 1)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><div className="flex flex-col gap-3 sm:flex-row"><button disabled={isSubmitting} onClick={requestSubmission} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-60">{isSubmitting ? "Submitting..." : "Submit exam"}</button><button disabled={questionIndex === questions.length - 1 || isSubmitting} onClick={() => selectQuestion(questionIndex + 1)} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">Next question</button></div></div><ConfirmDialog open={isConfirming} title="Submit with unanswered questions?" description={`You still have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}: ${unansweredQuestionNumbers.join(", ")}. Submit anyway?`} confirmLabel="Submit exam" isPending={isSubmitting} onCancel={() => setIsConfirming(false)} onReview={() => { selectQuestion(unansweredIndexes[0]); setIsConfirming(false); }} onConfirm={() => void completeSubmission()} /><ConfirmDialog open={isLeaving} title="Leave this exam?" description="Your selected answers have been saved. You can safely return later and continue this same attempt." confirmLabel="Save and leave" onCancel={() => setIsLeaving(false)} onConfirm={() => router.push("/student")} /></main></div>;
}
