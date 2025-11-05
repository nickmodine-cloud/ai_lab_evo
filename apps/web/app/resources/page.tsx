import { ModulePage } from "@/components/module-page";

export default function ResourcesPage() {
  return (
    <ModulePage
      title="Resource Orchestration"
      description="Plan and monitor compute usage with queues, reservations, and cost breakdowns tied to experiments."
      callouts={[
        {
          title: "Queue",
          detail: "See incoming reservations with friendly names, not opaque job IDs."
        },
        {
          title: "Reservation Board",
          detail: "Extend, release, or fast-track allocations with a tap."
        },
        {
          title: "Cost Analytics",
          detail: "Forecast GPU hours and chargeback by lab or hypothesis."
        }
      ]}
    />
  );
}
