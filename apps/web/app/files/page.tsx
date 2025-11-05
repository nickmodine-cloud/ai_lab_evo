import { ModulePage } from "@/components/module-page";

export default function FilesPage() {
  return (
    <ModulePage
      title="File Storage"
      description="Neon-styled evidence vault with versioning, previews, and permissions aligned to each hypothesis."
      callouts={[
        {
          title: "Versioned Attachments",
          detail: "Upload, diff, and restore artifacts with human-readable names."
        },
        {
          title: "Security",
          detail: "Signed URLs, virus scanning, and fine-grained access."
        }
      ]}
    />
  );
}
