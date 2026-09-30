import { getAttempt, type Attempt } from "@/lib/api";

const CACHE_PREFIX = "level-assessment-exam:";
type CachedExam = { attempt: Attempt; answers: Record<number, number>; questionIndex: number; cachedAt: number };
const attemptRequests = new Map<string, { promise: Promise<{ attempt: Attempt }>; startedAt: number }>();

function cacheKey(userId: number, attemptId: string) {
  return `${CACHE_PREFIX}${userId}:${attemptId}`;
}

export function readExamCache(userId: number | undefined, attemptId: string): CachedExam | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const stored = window.sessionStorage.getItem(cacheKey(userId, attemptId));
    if (!stored) return null;
    const cached = JSON.parse(stored) as CachedExam;
    if (!cached.attempt || !Array.isArray(cached.attempt.questions)) return null;
    return cached;
  } catch {
    return null;
  }
}

export function writeExamCache(userId: number | undefined, attemptId: string, attempt: Attempt, answers: Record<number, number>, questionIndex: number) {
  if (!userId || typeof window === "undefined") return;
  const cached: CachedExam = { attempt, answers, questionIndex, cachedAt: Date.now() };
  try {
    window.sessionStorage.setItem(cacheKey(userId, attemptId), JSON.stringify(cached));
  } catch {
    // A full or restricted sessionStorage must never block the exam.
  }
}

export function clearExamCache(userId: number | undefined, attemptId: string) {
  if (!userId || typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(cacheKey(userId, attemptId));
  } catch {
    // Ignore storage cleanup failures; server authorization remains authoritative.
  }
}

export function getAttemptOnce(userId: number, attemptId: string, token: string) {
  const key = `${userId}:${attemptId}`;
  const existing = attemptRequests.get(key);
  if (existing && Date.now() - existing.startedAt < 1_000) return existing.promise;
  const request = getAttempt(attemptId, token).finally(() => {
    window.setTimeout(() => {
      const current = attemptRequests.get(key);
      if (current?.promise === request) attemptRequests.delete(key);
    }, 1_000);
  });
  attemptRequests.set(key, { promise: request, startedAt: Date.now() });
  return request;
}
