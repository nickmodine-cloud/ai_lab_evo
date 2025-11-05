import { ModulePage } from "@/components/module-page";

export default function AdminPage() {
  return (
    <ModulePage
      title="Admin & Marketplace"
      description="Configure dictionaries, integrations, branding, and workflow templates without sacrificing usability."
      callouts={[
        {
          title: "Dictionaries",
          detail: "Manage lists like industries and AI types with drag-and-drop ordering."
        },
        {
          title: "Integrations",
          detail: "Test connections instantly and surface human-readable status labels."
        },
        {
          title: "Marketplace",
          detail: "Install add-ons with neon cards and animated confirmations."
        }
      ]}
    />
  );
}
