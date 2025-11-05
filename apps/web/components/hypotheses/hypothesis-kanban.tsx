"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Clock, GaugeCircle, Flag, Maximize2, Minimize2 } from "lucide-react";
import { HypothesisStageKey, HypothesisStageSummary } from "@/lib/hypothesis-data";
import { CardHoverEffects } from "@/components/ui/card-hover-effects";
import { cn } from "@/lib/utils";

const healthBadge = {
  "on-track": "border-[rgba(0,255,136,0.55)] text-neon-green",
  warning: "border-[rgba(255,180,71,0.55)] text-[rgba(255,200,120,0.9)]",
  risk: "border-[rgba(255,59,241,0.55)] text-[rgba(255,120,210,0.9)]",
};

const healthLabelKey: Record<string, string> = {
  "on-track": "onTrack",
  warning: "warning",
  risk: "risk",
};

interface HypothesisLifecycleProps {
  stages: HypothesisStageSummary[];
  onCardDrop?: (hypId: string, fromStage: HypothesisStageKey, toStage: HypothesisStageKey) => void;
  onCardSelect?: (hypId: string) => void;
  expanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  busy?: boolean;
}

interface DraggableCardProps {
  item: HypothesisStageSummary["items"][number];
  onSelect?: (id: string) => void;
  disabled?: boolean;
}

interface DroppableColumnProps {
  stage: HypothesisStageSummary;
  children: React.ReactNode;
}

function HypothesisCardBody({ item }: { item: HypothesisStageSummary["items"][number] }) {
  return (
    <>
      <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-text-secondary/70">
        <span>{item.id}</span>
        <span>{item.lastUpdated}</span>
      </div>
      <p className="mt-1.5 text-sm font-semibold leading-tight text-text-primary">{item.title}</p>
      <div className="mt-1.5 flex items-center justify-between text-xs text-text-secondary">
        <span>{item.owner}</span>
        {item.nextGate && (
          <span className="flex items-center gap-1 text-neon-green">
            <ArrowUpRight className="h-3 w-3" />
            {item.nextGate.replace(/_/g, " ")}
          </span>
        )}
      </div>
    </>
  );
}

function DraggableCard({ item, onSelect, disabled }: DraggableCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { stage: item.stage },
    disabled,
  });
  const style = transform ? { transform: CSS.Transform.toString(transform) } : undefined;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition duration-200 ease-soft-spring",
        isDragging ? "z-10 opacity-40" : "opacity-100",
      )}
      {...listeners}
      {...attributes}
    >
      <button type="button" onClick={() => onSelect?.(item.id)} className="w-full text-left">
        <CardHoverEffects
          className={cn(
            "p-3",
            isDragging && "border-neon-green/60 shadow-[0_0_28px_rgba(0,255,136,0.35)]",
          )}
        >
          <HypothesisCardBody item={item} />
        </CardHoverEffects>
      </button>
    </li>
  );
}

function DragOverlayCard({ item }: { item: HypothesisStageSummary["items"][number] | null }) {
  if (!item) return null;
  return (
    <div className="pointer-events-none w-[300px] rounded-3xl border border-neon-green/60 bg-surface/95 p-3 shadow-[0_0_44px_rgba(0,255,136,0.45)]">
      <HypothesisCardBody item={item} />
    </div>
  );
}

function DroppableColumn({ stage, children }: DroppableColumnProps) {
  const t = useTranslations("hypotheses.kanban");
  const tCommon = useTranslations("common");
  const { isOver, setNodeRef } = useDroppable({
    id: stage.key,
  });

  return (
    <article
      key={stage.key}
      className={cn(
        "flex h-full min-w-[300px] max-w-[300px] flex-col gap-3 rounded-2xl border bg-gradient-to-br p-4 transition duration-300",
        {
          "from-[rgba(0,255,136,0.15)] to-[rgba(0,255,136,0.05)] border-[rgba(0,255,136,0.4)]":
            stage.stageHealth === "on-track",
          "from-[rgba(255,180,71,0.15)] to-[rgba(255,180,71,0.05)] border-[rgba(255,180,71,0.4)]":
            stage.stageHealth === "warning",
          "from-[rgba(255,59,241,0.15)] to-[rgba(255,59,241,0.05)] border-[rgba(255,59,241,0.4)]":
            stage.stageHealth === "risk",
        },
        isOver ? "shadow-[0_0_32px_rgba(0,255,136,0.35)] scale-[1.01]" : "hover:shadow-[0_0_28px_rgba(0,255,136,0.25)]",
      )}
    >
      <header>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-text-primary">{stage.title}</h3>
          </div>
          <span
            className={cn(
              "ml-2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-wide",
              healthBadge[stage.stageHealth],
            )}
          >
            {t(`health.${healthLabelKey[stage.stageHealth] ?? "warning"}`)}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">{stage.description}</p>
      </header>

      <dl className="grid grid-cols-3 gap-2 text-[11px] uppercase tracking-wide text-text-secondary">
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-neon-green/70" />
          <div>
            <dt>{t("averageDays")}</dt>
            <dd className="text-text-primary">
              {stage.averageDaysInStage}
              {tCommon("days")}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <GaugeCircle className="h-3.5 w-3.5 text-neon-green/70" />
          <div>
            <dt>{t("conversion")}</dt>
            <dd className="text-text-primary">{Math.round(stage.conversionRate * 100)}%</dd>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Flag className="h-3.5 w-3.5 text-neon-green/70" />
          <div>
            <dt>{t("sla")}</dt>
            <dd className="text-text-primary">
              {stage.slaHours}
              {tCommon("hours")}
            </dd>
          </div>
        </div>
      </dl>

      <ul
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-dashed border-transparent p-0.5"
      >
        {children}
        {stage.items.length === 0 && (
          <li className="rounded-xl border border-dashed border-border/60 bg-surface-hover/50 p-6 text-center text-xs text-text-secondary/70">
            {t("noHypotheses")}
          </li>
        )}
      </ul>
    </article>
  );
}

export function HypothesisKanban({
  stages,
  onCardDrop,
  onCardSelect,
  expanded = false,
  onToggleExpand,
  busy = false,
}: HypothesisLifecycleProps) {
  const t = useTranslations("hypotheses.kanban");
  const totalHypotheses = useMemo(
    () => stages.reduce((acc, stage) => acc + stage.items.length, 0),
    [stages],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const [activeCard, setActiveCard] = useState<HypothesisStageSummary["items"][number] | null>(
    null,
  );

  const cardLookup = useMemo(() => {
    const map = new Map<string, HypothesisStageSummary["items"][number]>();
    stages.forEach((stage) => {
      stage.items.forEach((item) => map.set(item.id, item));
    });
    return map;
  }, [stages]);

  useEffect(() => {
    if (!expanded) {
      return undefined;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveCard(cardLookup.get(id) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !active?.id || !active.data.current) {
      return;
    }

    const currentStage = active.data.current.stage as HypothesisStageKey;
    const targetStage = over.id as HypothesisStageKey;

    if (targetStage && targetStage !== currentStage) {
      onCardDrop?.(String(active.id), currentStage, targetStage);
    }
  };

  const handleDragCancel = () => {
    setActiveCard(null);
  };

  return (
    <section
      className={cn(
        "rounded-3xl border border-border/70 bg-surface/80 px-5 py-5 transition-all duration-300",
        expanded ? "fixed inset-4 z-40 overflow-hidden shadow-[0_0_64px_rgba(0,0,0,0.45)]" : "relative",
      )}
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-text-secondary/60">
            {t("title")}
          </p>
          <h2 className="mt-1.5 text-lg font-semibold text-text-primary lg:text-xl">
            {t("subtitle")}
          </h2>
          <p className="mt-2 text-sm text-text-secondary">{t("description")}</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-text-secondary">
          {t("activeHypotheses", { count: totalHypotheses })}
        </span>
        <button
          type="button"
          onClick={() => onToggleExpand?.(!expanded)}
          className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-text-secondary transition duration-200 hover:border-neon-green/60 hover:text-neon-green"
        >
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          {expanded ? t("collapse") : t("expand")}
        </button>
      </div>

      <div
        className={cn(
          "mt-5 -mx-5 overflow-x-auto pb-4",
          expanded ? "h-[calc(100%-88px)]" : "h-auto",
        )}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          collisionDetection={closestCorners}
        >
          <div className={cn("flex min-w-max gap-4 px-5", expanded ? "h-full" : "")}>
            {stages.map((stage) => (
              <DroppableColumn key={stage.key} stage={stage}>
                {stage.items.map((item) => (
                  <DraggableCard
                    key={item.id}
                    item={item}
                    onSelect={onCardSelect}
                    disabled={busy}
                  />
                ))}
              </DroppableColumn>
            ))}
          </div>
          <DragOverlay
            dropAnimation={{
              duration: 180,
              easing: "cubic-bezier(0.2,0.75,0.5,1.15)",
              dragSourceOpacity: 0.15,
            }}
          >
            <DragOverlayCard item={activeCard} />
          </DragOverlay>
        </DndContext>
      </div>
    </section>
  );
}
