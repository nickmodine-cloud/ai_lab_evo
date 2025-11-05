import { ModulePage } from "@/components/module-page";

export default function WorkflowsPage() {
  return (
    <ModulePage
      title="Workflow Orchestration"
      description="BPMN-inspired visual designer and task console powering hypothesis governance."
      callouts={[
        {
          title: "Designer",
          detail: "Drag start, task, gateway, and timer nodes with neon feedback and inline validation."
        },
        {
          title: "Task Console",
          detail: "Human-friendly inbox showing who owns each step and what data is missing."
        },
        {
          title: "Analytics",
          detail: "Track SLA compliance and surface automation opportunities."
        }
      ]}
    />
  );
}
