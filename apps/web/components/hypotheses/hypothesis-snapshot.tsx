"use client";

import { useTranslations } from 'next-intl';
import { HypothesisHighlights } from "@/lib/hypothesis-data";

interface HypothesisSnapshotProps {
  highlights: HypothesisHighlights;
}

export function HypothesisSnapshot({ highlights }: HypothesisSnapshotProps) {
  const t = useTranslations('hypotheses.snapshot');

  const cards = [
    { key: "portfolioValue" as const },
    { key: "experimentsInFlight" as const },
    { key: "avgTimeToValue" as const },
    { key: "governancePending" as const }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface/80 px-5 py-6 transition duration-200 ease-soft-spring hover:border-neon-green/60 hover:shadow-neon"
        >
          <span className="text-[11px] uppercase tracking-[0.28em] text-text-secondary/70">
            {t(card.key)}
          </span>
          <p className="mt-3 text-2xl font-semibold text-text-primary">
            {String(highlights[card.key])}
          </p>
          <span className="mt-3 inline-flex h-1 w-12 rounded-full bg-gradient-to-r from-[rgba(0,255,136,0.7)] to-[rgba(64,224,208,0.7)]" />
        </div>
      ))}
    </div>
  );
}

