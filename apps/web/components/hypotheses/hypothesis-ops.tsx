"use client";

import { useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AlertTriangle, Database, ShieldAlert, ClipboardCheck } from "lucide-react";
import { HypothesisTask } from "@/lib/hypothesis-data";

const typeIcon: Record<HypothesisTask["type"], JSX.Element> = {
  data: <Database className="h-4 w-4 text-neon-green" />,
  governance: <ShieldAlert className="h-4 w-4 text-[rgba(255,180,71,0.8)]" />,
  approval: <ClipboardCheck className="h-4 w-4 text-[rgba(0,255,136,0.9)]" />
};

const severityBadge: Record<HypothesisTask["severity"], string> = {
  critical: "border-[rgba(255,59,241,0.55)] text-[rgba(255,120,210,0.9)]",
  high: "border-[rgba(255,180,71,0.55)] text-[rgba(255,200,120,0.9)]",
  medium: "border-border/60 text-text-secondary"
};

interface HypothesisOperationalInboxProps {
  tasks: HypothesisTask[];
}

function formatTaskDue(dueAt: string, locale: string): string {
  const parsed = new Date(dueAt);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }
  const diffMs = parsed.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffDays) <= 7) {
    return rtf.format(diffDays, "day");
  }

  return parsed.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function HypothesisOperationalInbox({ tasks }: HypothesisOperationalInboxProps) {
  const t = useTranslations("hypotheses.ops");
  const tCommon = useTranslations("common");
  const tStages = useTranslations("hypotheses.stages");
  const locale = useLocale();
  const criticalCount = tasks.filter((task) => task.severity === "critical").length;
  const dueLabels = useMemo(
    () =>
      Object.fromEntries(tasks.map((task) => [task.id, formatTaskDue(task.dueAt, locale)])),
    [tasks, locale],
  );

  return (
    <section className="rounded-3xl border border-border/70 bg-surface/80 px-5 py-5">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-text-secondary/60">{t('title')}</p>
          <h3 className="mt-1.5 text-lg font-semibold text-text-primary lg:text-xl">{t('subtitle')}</h3>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,59,241,0.4)] bg-[rgba(255,59,241,0.08)] px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-text-primary">
          <AlertTriangle className="h-3.5 w-3.5 text-[rgba(255,59,241,0.9)]" />
          {t('critical', { count: criticalCount })}
        </span>
      </header>

      <ul className="mt-4 space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface-muted/70 px-4 py-4 transition duration-200 ease-soft-spring hover:border-neon-green/60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-surface-hover/70">
                  {typeIcon[task.type]}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{task.label}</p>
                  <p className="text-xs text-text-secondary">
                    {task.owner} · {tStages(task.relatedStage)} · {tCommon("due")}{" "}
                    {dueLabels[task.id]}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] ${severityBadge[task.severity]}`}
              >
                {t(`status.${task.status}`)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
