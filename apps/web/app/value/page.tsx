import { ModulePage } from "@/components/module-page";

export default function ValuePage() {
  return (
    <ModulePage
      title="Value & ROI"
      description="Capture business context, assumptions, and financial signals that feed the hypothesis statement."
      callouts={[
        {
          title: "Value Cases",
          detail: "Structured templates for opportunity sizing with editable assumptions and stakeholder mapping."
        },
        {
          title: "ROI Calculator",
          detail: "Interactive model with currencies, sliders, and live payback preview."
        },
        {
          title: "Exports",
          detail: "One-click export to create or update hypothesis records without leaking internal IDs."
        }
      ]}
    />
  );
}
