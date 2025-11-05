"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from "@dnd-kit/core";
import { motion, AnimatePresence } from "motion/react";
import { HypothesisStageSummary, HypothesisItem } from "@/lib/hypothesis-data";
import { CardHoverEffects } from "@/components/ui/card-hover-effects";
import { cn } from "@/lib/utils";

interface HypothesisMatrixProps {
  stages: HypothesisStageSummary[];
  onImpactFeasibilityChange?: (hypothesisId: string, impact: number, feasibility: number) => void;
}

interface DraggableHypothesisProps {
  hypothesis: HypothesisItem;
  isDragging?: boolean;
}

function DraggableHypothesis({ hypothesis, isDragging }: DraggableHypothesisProps) {
  const tCommon = useTranslations('common');
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 0.95 : 1 
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        "cursor-move rounded-xl border border-border/60 bg-surface-hover/70 px-3 py-2 text-xs transition duration-200",
        isDragging && "border-neon-green/60 shadow-[0_0_20px_rgba(0,255,136,0.4)]"
      )}
    >
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-text-secondary/60">
        <span>{hypothesis.id}</span>
        <span>{hypothesis.stage.toLowerCase()}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold text-text-primary leading-tight">{hypothesis.title}</p>
      <p className="mt-1 text-[11px] text-text-secondary">
        {tCommon('impact')} {hypothesis.impact.toFixed(1)} · {tCommon('feasibility')} {hypothesis.feasibility.toFixed(1)} · {hypothesis.owner}
      </p>
    </motion.div>
  );
}

export function HypothesisMatrix({ stages, onImpactFeasibilityChange }: HypothesisMatrixProps) {
  const t = useTranslations('hypotheses.matrix');
  const tCommon = useTranslations('common');
  const allHypotheses = stages.flatMap((stage) => stage.items);
  
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hypotheses, setHypotheses] = useState<HypothesisItem[]>(allHypotheses);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const quadrants = [
    {
      key: "pursue",
      label: t('quadrants.pursue.label'),
      description: t('quadrants.pursue.description'),
      filter: (impact: number, feasibility: number) => impact >= 7 && feasibility >= 7,
      gradient: "green" as const,
      bounds: { minImpact: 7, maxImpact: 10, minFeasibility: 7, maxFeasibility: 10 }
    },
    {
      key: "partner",
      label: t('quadrants.partner.label'),
      description: t('quadrants.partner.description'),
      filter: (impact: number, feasibility: number) => impact >= 7 && feasibility < 7,
      gradient: "turquoise" as const,
      bounds: { minImpact: 7, maxImpact: 10, minFeasibility: 0, maxFeasibility: 7 }
    },
    {
      key: "optimize",
      label: t('quadrants.optimize.label'),
      description: t('quadrants.optimize.description'),
      filter: (impact: number, feasibility: number) => impact < 7 && feasibility >= 7,
      gradient: "turquoise" as const,
      bounds: { minImpact: 0, maxImpact: 7, minFeasibility: 7, maxFeasibility: 10 }
    },
    {
      key: "observe",
      label: t('quadrants.observe.label'),
      description: t('quadrants.observe.description'),
      filter: (impact: number, feasibility: number) => impact < 7 && feasibility < 7,
      gradient: "turquoise" as const,
      bounds: { minImpact: 0, maxImpact: 7, minFeasibility: 0, maxFeasibility: 7 }
    },
  ] as const;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const hypothesisId = active.id as string;
    const targetQuadrant = quadrants.find((q) => q.key === over.id);
    
    if (targetQuadrant) {
      const hypothesis = hypotheses.find((h) => h.id === hypothesisId);
      if (hypothesis) {
        // Calculate new impact and feasibility based on quadrant center
        const newImpact = (targetQuadrant.bounds.minImpact + targetQuadrant.bounds.maxImpact) / 2;
        const newFeasibility = (targetQuadrant.bounds.minFeasibility + targetQuadrant.bounds.maxFeasibility) / 2;
        
        const updatedHypothesis = {
          ...hypothesis,
          impact: Math.max(0, Math.min(10, newImpact)),
          feasibility: Math.max(0, Math.min(10, newFeasibility))
        };

        setHypotheses(prev => prev.map(h => h.id === hypothesisId ? updatedHypothesis : h));
        
        if (onImpactFeasibilityChange) {
          onImpactFeasibilityChange(hypothesisId, updatedHypothesis.impact, updatedHypothesis.feasibility);
        }
      }
    }
  };

  const activeHypothesis = activeId ? hypotheses.find((h) => h.id === activeId) : null;

  return (
    <section className="rounded-3xl border border-border/70 bg-surface/80 px-5 py-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-text-secondary/60">{t('title')}</p>
          <h3 className="mt-1.5 text-lg font-semibold text-text-primary lg:text-xl">{t('subtitle')}</h3>
          <p className="mt-2 text-xs text-text-secondary">{t('dragHint')}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-text-secondary">
          {t('displayedInitiatives', { count: hypotheses.length })}
        </span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          {quadrants.map((quadrant) => {
            const items = hypotheses.filter((item) => quadrant.filter(item.impact, item.feasibility));
            const gradientClasses = {
              green: "from-[rgba(0,255,136,0.15)] to-[rgba(0,255,136,0.05)] border-[rgba(0,255,136,0.4)]",
              turquoise: "from-[rgba(64,224,208,0.15)] to-[rgba(64,224,208,0.05)] border-[rgba(64,224,208,0.4)]",
            };

            return (
              <motion.div
                key={quadrant.key}
                id={quadrant.key}
                data-quadrant={quadrant.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "group relative flex min-h-[200px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition duration-300",
                  gradientClasses[quadrant.gradient],
                  "hover:shadow-[0_0_28px_rgba(0,255,136,0.25)]"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-text-primary">{quadrant.label}</h4>
                    <p className="mt-2 text-xs leading-relaxed text-text-secondary">{quadrant.description}</p>
                  </div>
                  <span className="ml-3 text-4xl font-bold text-text-primary">{items.length}</span>
                </div>
                
                {items.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {items.slice(0, 5).map((item) => (
                      <li key={item.id}>
                        <CardHoverEffects>
                          <DraggableHypothesis 
                            hypothesis={item} 
                            isDragging={activeId === item.id}
                          />
                        </CardHoverEffects>
                      </li>
                    ))}
                    {items.length > 5 && (
                      <li className="pt-1 text-center text-xs text-text-secondary">
                        {t('more', { count: items.length - 5 })}
                      </li>
                    )}
                  </ul>
                )}
                
                {items.length === 0 && (
                  <div className="mt-4 flex-1 rounded-xl border border-dashed border-border/60 bg-surface-hover/50 p-6 text-center text-xs text-text-secondary/70">
                    {t('noHypotheses')}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <DragOverlay>
          {activeHypothesis ? (
            <div className="rounded-xl border border-neon-green/60 bg-surface/90 shadow-[0_0_28px_rgba(0,255,136,0.5)] px-3 py-2 text-xs">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-text-secondary/60">
                <span>{activeHypothesis.id}</span>
                <span>{activeHypothesis.stage.toLowerCase()}</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-text-primary leading-tight">{activeHypothesis.title}</p>
              <p className="mt-1 text-[11px] text-text-secondary">
                {tCommon('impact')} {activeHypothesis.impact.toFixed(1)} · {tCommon('feasibility')} {activeHypothesis.feasibility.toFixed(1)}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </section>
  );
}
