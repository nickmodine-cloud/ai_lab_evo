import { ModulePage } from "@/components/module-page";

export default function DashboardsPage() {
  return (
    <ModulePage
      title="Dashboards"
      description="Adaptive KPI suites for executives, curators, and delivery teams built on hypothesis telemetry."
      callouts={[
        {
          title: "CEO Overview",
          detail: "Neon KPI tiles with ROI, adoption, and risk posture."
        },
        {
          title: "Portfolio Heatmaps",
          detail: "Highlight bottlenecks by stage, department, or impact cluster."
        },
        {
          title: "Team Performance",
          detail: "Monitor task load, SLA compliance, and experiment throughput."
        }
      ]}
    />
  );
}
