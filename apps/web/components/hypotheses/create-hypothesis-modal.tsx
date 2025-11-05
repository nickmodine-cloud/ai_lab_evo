"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { AnimatedModal } from "@/components/ui/animated-modal";
import { AnimatedInput } from "@/components/ui/animated-input";
import { Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/components/ui/select";
import { Label } from "@/components/components/ui/label";
import { useRouter } from "next/navigation";
import { createHypothesis, CreateHypothesisInput } from "@/lib/hypothesis-api";
import { HypothesisDetail } from "@/lib/hypothesis-data";

interface CreateHypothesisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (hypothesis: HypothesisDetail) => void;
  defaultLabId?: string;
}

const aiTypes = [
  { value: "LLM", label: "LLM (Large Language Model)" },
  { value: "CLASSICAL_ML", label: "Classical Machine Learning" },
  { value: "CV", label: "Computer Vision" },
  { value: "NLP", label: "Natural Language Processing" },
  { value: "RPA", label: "Robotic Process Automation" },
  { value: "ANALYTICS", label: "Analytics / BI" },
  { value: "OTHER", label: "Other AI / Data Science" }
] as const;

const llmSubtypes = [
  { value: "chatbot", label: "Chatbot" },
  { value: "rag", label: "RAG (Retrieval Augmented Generation)" },
  { value: "code-generation", label: "Code Generation" },
  { value: "content-generation", label: "Content Generation" },
  { value: "translation", label: "Translation" }
];

const classicalMlSubtypes = [
  { value: "classification", label: "Classification" },
  { value: "regression", label: "Regression" },
  { value: "clustering", label: "Clustering" },
  { value: "recommendation", label: "Recommendation System" }
];

type FormState = {
  labId: string;
  title: string;
  description: string;
  aiType: string;
  subtype: string;
  statement: string;
  goals: string;
  dataSources: string;
  owner: string;
  ownerEmail: string;
  sponsor: string;
  impact: string;
  feasibility: string;
  tags: string;
};

const initialFormState = (defaultLabId: string): FormState => ({
  labId: defaultLabId,
  title: "",
  description: "",
  aiType: "",
  subtype: "",
  statement: "",
  goals: "",
  dataSources: "",
  owner: "",
  ownerEmail: "",
  sponsor: "",
  impact: "5",
  feasibility: "5",
  tags: ""
});

export function CreateHypothesisModal({
  open,
  onOpenChange,
  onCreated,
  defaultLabId = "LAB-ALPHA"
}: CreateHypothesisModalProps) {
  const t = useTranslations('hypotheses.create');
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(() => initialFormState(defaultLabId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [subtypes, setSubtypes] = useState<typeof llmSubtypes>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleAiTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, aiType: value, subtype: "" }));
    if (value === "LLM") {
      setSubtypes(llmSubtypes);
    } else if (value === "CLASSICAL_ML") {
      setSubtypes(classicalMlSubtypes);
    } else {
      setSubtypes([]);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.labId.trim()) newErrors.labId = "Lab ID is required";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.statement.trim()) newErrors.statement = "Statement is required";
    if (!formData.aiType) newErrors.aiType = "AI Type is required";
    if (!formData.owner.trim()) newErrors.owner = "Owner is required";
    if (!formData.ownerEmail.trim()) newErrors.ownerEmail = "Owner email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.ownerEmail)) newErrors.ownerEmail = "Enter a valid email";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData(initialFormState(defaultLabId));
    setErrors({});
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const impactScore = Number(formData.impact) || 5;
      const feasibilityScore = Number(formData.feasibility) || 5;
      const tags = formData.tags
        ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];
      const dataSources = formData.dataSources
        ? formData.dataSources.split(",").map((source) => source.trim()).filter(Boolean)
        : undefined;

      const payload: CreateHypothesisInput = {
        title: formData.title,
        statement: formData.statement,
        labId: formData.labId,
        aiType: (formData.aiType || "OTHER") as CreateHypothesisInput["aiType"],
        aiSubtype: formData.subtype || undefined,
        description: formData.description || undefined,
        impactScore,
        feasibilityScore,
        confidenceScore: 0.6,
        owner: {
          name: formData.owner,
          email: formData.ownerEmail,
          role: "OWNER"
        },
        tags,
        notes: formData.goals || undefined,
        dataSources,
      };

      const hypothesis = await createHypothesis(payload);
      resetForm();
      onOpenChange(false);
      onCreated?.(hypothesis);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create hypothesis";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatedModal
      open={open}
      onOpenChange={(value) => {
        if (!value) resetForm();
        onOpenChange(value);
      }}
      title="Create New Hypothesis"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatedInput
            label="Lab ID"
            value={formData.labId}
            onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
            error={errors.labId}
            placeholder="LAB-ALPHA"
            required
          />
          <AnimatedInput
            label="Owner Email"
            value={formData.ownerEmail}
            onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
            error={errors.ownerEmail}
            placeholder="owner@example.com"
            type="email"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <AnimatedInput
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              placeholder="Enter hypothesis title"
              required
            />
          </div>

          <div>
            <Label className="mb-2 text-text-primary text-sm font-medium">
              AI Type
            </Label>
            <Select value={formData.aiType} onValueChange={handleAiTypeChange}>
              <SelectTrigger className="border-border/60 bg-surface-muted/70 text-text-primary focus:border-neon-green/60">
                <SelectValue placeholder="Select AI type" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border/60">
                {aiTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.aiType && (
              <p className="mt-1 text-xs text-[rgba(255,120,210,0.9)]">{errors.aiType}</p>
            )}
          </div>

          {subtypes.length > 0 && (
            <div>
              <Label className="mb-2 text-text-primary text-sm font-medium">
                Subtype
              </Label>
              <Select value={formData.subtype} onValueChange={(value) => setFormData({ ...formData, subtype: value })}>
                <SelectTrigger className="border-border/60 bg-surface-muted/70 text-text-primary focus:border-neon-green/60">
                  <SelectValue placeholder="Select subtype" />
                </SelectTrigger>
                <SelectContent className="bg-surface border-border/60">
                  {subtypes.map((subtype) => (
                    <SelectItem key={subtype.value} value={subtype.value}>
                      {subtype.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="md:col-span-2">
            <Label className="mb-2 text-text-primary text-sm font-medium">
              Statement
            </Label>
            <textarea
              value={formData.statement}
              onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
              className="w-full border border-border/60 bg-surface-muted/70 text-text-primary placeholder:text-text-secondary/50 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 rounded-lg px-3 py-2 min-h-[100px] focus:outline-none transition-all duration-300"
              placeholder="Describe your hypothesis statement"
              required
            />
            {errors.statement && (
              <p className="mt-1 text-xs text-[rgba(255,120,210,0.9)]">{errors.statement}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label className="mb-2 text-text-primary text-sm font-medium">
              Description
            </Label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-border/60 bg-surface-muted/70 text-text-primary placeholder:text-text-secondary/50 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 rounded-lg px-3 py-2 min-h-[80px] focus:outline-none transition-all duration-300"
              placeholder="Additional details"
            />
          </div>

          <div>
            <Label className="mb-2 text-text-primary text-sm font-medium">
              Goals
            </Label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="w-full border border-border/60 bg-surface-muted/70 text-text-primary placeholder:text-text-secondary/50 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 rounded-lg px-3 py-2 min-h-[80px] focus:outline-none transition-all duration-300"
              placeholder="What outcomes are you targeting?"
            />
          </div>

          <div>
            <Label className="mb-2 text-text-primary text-sm font-medium">
              Data Sources
            </Label>
            <textarea
              value={formData.dataSources}
              onChange={(e) => setFormData({ ...formData, dataSources: e.target.value })}
              className="w-full border border-border/60 bg-surface-muted/70 text-text-primary placeholder:text-text-secondary/50 focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20 rounded-lg px-3 py-2 min-h-[80px] focus:outline-none transition-all duration-300"
              placeholder="Comma-separated list (e.g. CRM, Tickets, ERP)"
            />
          </div>

          <AnimatedInput
            label="Owner"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            error={errors.owner}
            placeholder="Primary owner name"
            required
          />

          <AnimatedInput
            label="Sponsor"
            value={formData.sponsor}
            onChange={(e) => setFormData({ ...formData, sponsor: e.target.value })}
            placeholder="Executive sponsor (optional)"
          />

          <AnimatedInput
            label="Tags"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="Comma-separated (e.g. Finance, Prediction)"
          />

          <div>
            <Label className="mb-2 text-text-primary text-sm font-medium">
              Impact ({formData.impact})
            </Label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-neon-green"
            />
          </div>

          <div>
            <Label className="mb-2 text-text-primary text-sm font-medium">
              Feasibility ({formData.feasibility})
            </Label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.feasibility}
              onChange={(e) => setFormData({ ...formData, feasibility: e.target.value })}
              className="w-full h-2 bg-surface-muted rounded-lg appearance-none cursor-pointer accent-neon-green"
            />
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-[rgba(255,120,210,0.9)]">{submitError}</p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-full border border-border/80 text-sm font-medium text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold text-base shadow-neon transition duration-200 ease-soft-spring hover:shadow-neon-hover disabled:cursor-not-allowed disabled:opacity-75"
          >
            <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,136,0.9),rgba(64,224,208,0.9))]" />
            <span className="relative flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Hypothesis"}
            </span>
          </button>
        </div>
      </form>
    </AnimatedModal>
  );
}
