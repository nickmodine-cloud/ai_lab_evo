import { ModulePage } from "@/components/module-page";

export default function LabsPage() {
  return (
    <ModulePage
      title="Laboratories"
      description="Manage collaborative workspaces, membership, and visibility settings across the AI portfolio."
      callouts={[
        {
          title: "Workspace Cards",
          detail: "Display lab summaries with mission, owners, and active hypothesis counts."
        },
        {
          title: "Membership",
          detail: "Invite members using email and name—IDs stay behind the scenes."
        },
        {
          title: "Settings",
          detail: "Control visibility, integrations, and notification preferences per lab."
        }
      ]}
    />
  );
}
