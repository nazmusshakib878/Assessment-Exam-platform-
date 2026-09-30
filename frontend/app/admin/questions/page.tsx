"use client";

import { AppHeader } from "@/components/app-header";
import { ProtectedRoute } from "@/components/protected-route";
import { QuestionManagement } from "@/components/question-management";

export default function AdminQuestionsPage() {
  return <ProtectedRoute role="admin"><div className="min-h-screen bg-slate-50"><AppHeader role="admin" /><QuestionManagement /></div></ProtectedRoute>;
}
