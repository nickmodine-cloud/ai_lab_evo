"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { Zap, ShieldCheck, Edit } from "lucide-react";
import { CreateHypothesisModal } from "@/components/hypotheses/create-hypothesis-modal";
import { BulkEditDialog } from "@/components/hypotheses/bulk-edit-dialog";
import { HypothesisFilters, FilterState } from "@/components/hypotheses/hypothesis-filters";
import { HypothesisItem } from "@/lib/hypothesis-data";

interface GlobalHeaderProps {
  hypotheses?: HypothesisItem[];
}

export function GlobalHeader({ hypotheses = [] }: GlobalHeaderProps) {
  const t = useTranslations();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: "",
    stages: [],
    priorities: [],
    aiTypes: [],
    owners: [],
    departments: [],
    tags: []
  });

  const quickLinks = [
    { label: t('header.quickLinks.decisionLog'), href: "#decision-log" },
    { label: t('header.quickLinks.experimentQueue'), href: "#experiment-queue" },
    { label: t('header.quickLinks.governanceTasks'), href: "#governance" }
  ];

  const handleBulkEdit = (ids: string[], changes: any) => {
    // TODO: API call to bulk edit hypotheses
    // In real implementation, this would trigger a refresh of the data
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // TODO: Apply filters to hypotheses list
  };

  const handleCreated = () => {
    setCreateModalOpen(false);
  };

  return (
    <>
      <header className="rounded-3xl border border-border/80 bg-surface/90 px-5 py-5 backdrop-blur lg:px-6 lg:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-transparent bg-[rgba(0,255,136,0.08)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.32em] text-neon-green">
              {t('common.hypothesisCenter')}
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary leading-tight lg:text-3xl">
              {t('header.title')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary lg:mt-3">
              {t('header.description')}
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="relative overflow-hidden rounded-full px-4 py-2 text-sm font-semibold text-base shadow-neon transition duration-200 ease-soft-spring hover:shadow-neon-hover whitespace-nowrap"
            >
              <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,255,136,0.9),rgba(64,224,208,0.9))]" />
              <span className="relative flex items-center gap-2">
                <Zap className="h-4 w-4" />
                {t('common.newHypothesis')}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setBulkEditOpen(true)}
              className="rounded-full border border-border/80 px-4 py-2 text-sm font-medium text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green whitespace-nowrap"
            >
              <Edit className="h-4 w-4 inline mr-2" />
              Bulk Edit
            </button>
            <button
              type="button"
              className="rounded-full border border-border/80 px-4 py-2 text-sm font-medium text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green whitespace-nowrap"
            >
              {t('common.recordDecision')}
            </button>
          </div>
        </div>

        <div className="mt-4 lg:mt-5">
          <HypothesisFilters onFiltersChange={handleFiltersChange} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3.5 py-2 text-[11px] font-medium uppercase tracking-wide text-text-secondary transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:text-neon-green whitespace-nowrap"
            >
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
              {link.label}
            </a>
          ))}
        </div>
      </header>
      <CreateHypothesisModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreated={handleCreated}
      />
      <BulkEditDialog
        open={bulkEditOpen}
        onOpenChange={setBulkEditOpen}
        hypotheses={hypotheses}
        onBulkEdit={handleBulkEdit}
      />
    </>
  );
}
