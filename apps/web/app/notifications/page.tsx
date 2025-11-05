import { ModulePage } from "@/components/module-page";

export default function NotificationsPage() {
  return (
    <ModulePage
      title="Notifications"
      description="Centralize high-signal alerts with rich context and triage controls."
      callouts={[
        {
          title: "Channels",
          detail: "Email, Slack, and in-app streams managed per persona."
        },
        {
          title: "Routing",
          detail: "Map events to people and workflows automatically."
        },
        {
          title: "Digest",
          detail: "Daily or weekly summaries with links to relevant hypotheses."
        }
      ]}
    />
  );
}
