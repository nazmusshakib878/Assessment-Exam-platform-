export type UserRole = "admin" | "student";

export type AuthUser = { id: number; name: string; email: string; role: UserRole };
export type ExamQuestion = { id: number; text: string; level: number; options: string[]; option_ids?: number[]; selected_option?: number | null };
export type Attempt = { id: number; status: string; questions?: ExamQuestion[]; created_at?: string };
export type AttemptResult = { id: number; status: string; total_score: number; level_name: string; submitted_at: string | null; created_at: string };
export type AdminQuestion = { id: number; text: string; level: number; options: string[]; correct_option: number; created_at: string; updated_at: string };
export type AdminResult = { id: number; student_name: string; score: number; level_name: string; submitted_at: string | null };
export type PaginationMeta = { current_page: number; last_page: number; per_page: number; total: number };
export type PaginatedResponse<T> = { data: T[]; meta: PaginationMeta };
export type QuestionInput = { text: string; level: number; options: string[]; correct_option: number };

type ApiErrorBody = { message?: string; errors?: Record<string, string[]> };
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function getApiUrl(): string { if (!apiUrl) throw new Error("NEXT_PUBLIC_API_URL is not configured."); return apiUrl; }

export class ApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors?: Record<string, string[]>) { super(message); this.name = "ApiError"; }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${getApiUrl()}${path}`, { ...options, headers });
  const payload = (await response.json().catch(() => ({}))) as ApiErrorBody & T;
  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.sessionStorage.removeItem("level-assessment-auth");
      document.cookie = "auth_present=; Path=/; SameSite=Lax; Max-Age=0";
      document.cookie = "auth_role=; Path=/; SameSite=Lax; Max-Age=0";
      if (window.location.pathname !== "/login") window.location.assign(new URL("/login", window.location.origin));
    }
    const validationMessage = payload.errors ? Object.values(payload.errors).flat().join(" ") : undefined;
    throw new ApiError(response.status >= 500 ? "Server error. Please try again later." : validationMessage || payload.message || "Something went wrong.", response.status, payload.errors);
  }
  return payload as T;
}

type AuthResponse = { token: string; user: AuthUser };
export function login(email: string, password: string): Promise<AuthResponse> { return apiRequest<AuthResponse>("/api/login", { method: "POST", body: JSON.stringify({ email, password }) }); }
export function register(name: string, email: string, password: string, passwordConfirmation: string): Promise<AuthResponse> { return apiRequest<AuthResponse>("/api/register", { method: "POST", body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }) }); }
export function getAuthenticatedUser(token: string): Promise<{ user: AuthUser }> { return apiRequest<{ user: AuthUser }>("/api/user", {}, token); }
export function logout(token: string): Promise<{ message: string }> { return apiRequest<{ message: string }>("/api/logout", { method: "POST" }, token); }

export type StartAttemptResponse = { attempt: Attempt; resumed: boolean };
export function startAttempt(token: string): Promise<StartAttemptResponse> { return apiRequest<StartAttemptResponse>("/api/attempts", { method: "POST" }, token); }
export function getAttempt(id: string, token: string): Promise<{ attempt: Attempt }> { return apiRequest<{ attempt: Attempt }>(`/api/attempts/${id}`, {}, token); }
export type AttemptsResponse = { attempts: AttemptResult[]; active_attempt_id: number | null };
export function getAttempts(token: string): Promise<AttemptsResponse> { return apiRequest<AttemptsResponse>("/api/attempts", {}, token); }
export function saveAttemptAnswers(id: string, answers: Array<{ question_id: number; selected_option: number | null }>, token: string): Promise<{ attempt: Attempt }> { return apiRequest<{ attempt: Attempt }>(`/api/attempts/${id}/answers`, { method: "PATCH", body: JSON.stringify({ answers }) }, token); }
export function submitAttempt(id: string, answers: Array<{ question_id: number; selected_option: number | null }>, token: string): Promise<{ attempt: AttemptResult }> { return apiRequest<{ attempt: AttemptResult }>(`/api/attempts/${id}/submit`, { method: "POST", body: JSON.stringify({ answers }) }, token); }

export function getAdminQuestions(token: string, page = 1, level?: number): Promise<PaginatedResponse<AdminQuestion>> { const params = new URLSearchParams({ page: String(page) }); if (level) params.set("level", String(level)); return apiRequest<PaginatedResponse<AdminQuestion>>(`/api/admin/questions?${params}`, {}, token); }
export function createAdminQuestion(question: QuestionInput, token: string): Promise<{ question: AdminQuestion }> { return apiRequest<{ question: AdminQuestion }>("/api/admin/questions", { method: "POST", body: JSON.stringify(question) }, token); }
export function updateAdminQuestion(id: number, question: Partial<QuestionInput>, token: string): Promise<{ question: AdminQuestion }> { return apiRequest<{ question: AdminQuestion }>(`/api/admin/questions/${id}`, { method: "PATCH", body: JSON.stringify(question) }, token); }
export function deleteAdminQuestion(id: number, token: string): Promise<{ message: string }> { return apiRequest<{ message: string }>(`/api/admin/questions/${id}`, { method: "DELETE" }, token); }
export function getAdminResults(token: string, page = 1): Promise<PaginatedResponse<AdminResult>> { return apiRequest<PaginatedResponse<AdminResult>>(`/api/admin/results?page=${page}`, {}, token); }
