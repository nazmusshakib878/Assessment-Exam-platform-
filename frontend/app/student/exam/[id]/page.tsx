import { ExamRunner } from "@/components/exam-runner";
import { ProtectedRoute } from "@/components/protected-route";

export default async function ExamPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ProtectedRoute role="student"><ExamRunner attemptId={id} /></ProtectedRoute>;
}
