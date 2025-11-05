import { ModulePage } from "@/components/module-page";

export default function PeoplePage() {
  return (
    <ModulePage
      title="Identity & Access"
      description="Role-centric access with clear names, avatars, and contextual permissions for every domain object."
      callouts={[
        {
          title: "Directory",
          detail: "Searchable list with filters by role, department, and status—always show full names and job titles."
        },
        {
          title: "Role Matrix",
          detail: "Visualize permissions using a neon matrix with hover explanations and workflow integrations."
        },
        {
          title: "Sessions",
          detail: "Monitor active sessions, revoke access, and enforce security policies."
        }
      ]}
    />
  );
}
