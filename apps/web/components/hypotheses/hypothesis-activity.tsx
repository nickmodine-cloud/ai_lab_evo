"use client";

import { useTranslations } from 'next-intl';
import { HypothesisActivity } from "@/lib/hypothesis-data";
import { ArrowUpRight, Minus, AlertOctagon } from "lucide-react";

const impactAccent: Record<HypothesisActivity["impact"], string> = {
  positive: "bg-[rgba(0,255,136,0.18)] text-neon-green",
  neutral: "bg-[rgba(168,85,247,0.18)] text-[rgba(168,85,247,0.9)]",
  negative: "bg-[rgba(255,59,241,0.18)] text-[rgba(255,120,210,0.9)]"
};

const impactIcon: Record<HypothesisActivity["impact"], JSX.Element> = {
  positive: <ArrowUpRight className="h-3.5 w-3.5" />,
  neutral: <Minus className="h-3.5 w-3.5" />,
  negative: <AlertOctagon className="h-3.5 w-3.5" />
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface HypothesisActivityTimelineProps {
  events: HypothesisActivity[];
}

export function HypothesisActivityTimeline({ events }: HypothesisActivityTimelineProps) {
  const t = useTranslations('hypotheses.activity');

  return (
    <section className="rounded-3xl border border-border/70 bg-surface/80 px-5 py-5" id="decision-log">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.32em] text-text-secondary/60">{t('title')}</p>
          <h3 className="mt-1.5 text-lg font-semibold text-text-primary lg:text-xl">{t('subtitle')}</h3>
        </div>
      </div>

      <ol className="mt-5 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="relative rounded-3xl border border-border/60 bg-surface-muted/70 px-4 py-4">
            <span className="absolute -left-3 top-6 h-6 w-6 rounded-full border border-border/60 bg-surface text-[11px] uppercase tracking-wide text-text-secondary/60">
              &nbsp;
            </span>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-text-secondary/70">
                  {event.stage.toLowerCase()}
                </div>
                <p className="mt-2 text-sm font-semibold text-text-primary">{event.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{event.detail}</p>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-xs uppercase tracking-[0.24em] text-text-secondary">
                  {formatDate(event.occurredAt)}
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${impactAccent[event.impact]}`}
                >
                  {impactIcon[event.impact]}
                  {t(`impact.${event.impact}`)}
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-text-secondary/80">{t('recordedBy', { actor: event.actor })}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

