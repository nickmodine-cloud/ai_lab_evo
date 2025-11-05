import { ModulePage } from "@/components/module-page";

export default function GovernancePage() {
  return (
    <ModulePage
      title="Governance"
      description="Policies, approvals, and risk registers that keep AI programs compliant while remaining delightful to use."
      callouts={[
        {
          title: "Approval Center",
          detail: "Track stage gates, assign reviewers, and capture rationale with inline rich text."
        },
        {
          title: "Risk Register",
          detail: "Plot severity vs likelihood with quick filters by domain and owner."
        },
        {
          title: "Knowledge Base",
          detail: "Versioned wiki with neon diff previews and easy cross-linking to hypotheses."
        }
      ]}
    />
  );
}
