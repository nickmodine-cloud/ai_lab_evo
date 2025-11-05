import { ModulePage } from "@/components/module-page";

export default function AnalyticsPage() {
  return (
    <ModulePage
      title="Analytics"
      description="Insight engine covering time-series, bottlenecks, and predictive signals for hypotheses."
      callouts={[
        {
          title: "Time Series",
          detail: "Slice metrics by lab, stage, or owner and export to CSV or PDF."
        },
        {
          title: "Insights",
          detail: "Automatic detection of drift in stage durations with recommended actions."
        },
        {
          title: "Predictions",
          detail: "Estimate success probability from historical context."
        }
      ]}
    />
  );
}
