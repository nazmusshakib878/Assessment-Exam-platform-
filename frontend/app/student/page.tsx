"use client";

import { AppHeader } from "@/components/app-header";
import { ProtectedRoute } from "@/components/protected-route";
import { StudentDashboard } from "@/components/student-dashboard";

export default function StudentPage() {
  return <ProtectedRoute role="student"><div className="min-h-screen bg-slate-50"><AppHeader role="student" /><StudentDashboard /></div></ProtectedRoute>;
}
