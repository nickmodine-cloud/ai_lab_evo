import { fetchHypothesisDashboard } from "@/lib/hypothesis-api";
import { HypothesisWorkspace } from "@/components/hypotheses/hypothesis-workspace";

export default async function HypothesesPage() {
  const dashboard = await fetchHypothesisDashboard();
  return <HypothesisWorkspace initialDashboard={dashboard} />;
}
