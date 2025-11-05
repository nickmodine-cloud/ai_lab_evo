import { ModulePage } from "@/components/module-page";

export default function ExperimentsPage() {
  return (
    <ModulePage
      title="Experiment Service"
      description="Run, observe, and evaluate experiments that trace back to the originating hypothesis and resource plan."
      callouts={[
        {
          title: "Run Console",
          detail: "Trigger runs, watch logs, and capture metrics with live diff against targets."
        },
        {
          title: "Artifacts",
          detail: "Upload notebooks, model binaries, and evaluation reports—never expose raw IDs to users."
        },
        {
          title: "Resource Sync",
          detail: "Reserve GPUs automatically via the Resource service with queue visibility."
        },
        {
          title: "Outcome Linking",
          detail: "Push experiment outcomes back into the hypothesis scorecard and ROI storyline."
        }
      ]}
    />
  );
}
