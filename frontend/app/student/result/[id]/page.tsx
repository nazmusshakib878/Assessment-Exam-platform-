import { ProtectedRoute } from "@/components/protected-route";
import { ResultView } from "@/components/result-view";

export default async function ResultPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <ProtectedRoute role="student"><ResultView attemptId={id} /></ProtectedRoute>;
}
