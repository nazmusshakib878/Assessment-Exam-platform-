"use client";

import { AdminResultsTable } from "@/components/admin-results-table";
import { AppHeader } from "@/components/app-header";
import { ProtectedRoute } from "@/components/protected-route";

export default function AdminResultsPage() {
  return <ProtectedRoute role="admin"><div className="min-h-screen bg-slate-50"><AppHeader role="admin" /><AdminResultsTable /></div></ProtectedRoute>;
}
