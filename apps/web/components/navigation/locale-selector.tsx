"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const LOCALES = [
  { value: "en", labelKey: "english" },
  { value: "ru", labelKey: "russian" },
];

interface LocaleSelectorProps {
  className?: string;
  initialLocale: string;
}

export function LocaleSelector({ className, initialLocale }: LocaleSelectorProps) {
  const t = useTranslations("locale");
  const [locale, setLocale] = useState(initialLocale);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setLocale(initialLocale);
  }, [initialLocale]);

  const handleChange = (nextLocale: string) => {
    if (nextLocale === locale) {
      return;
    }
    setLocale(nextLocale);
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000`;
    startTransition(() => {
      const query = searchParams.toString();
      const target = query ? `${pathname}?${query}` : pathname;
      router.replace(target);
      router.refresh();
    });
  };

  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface-muted/60 px-3 py-1.5 text-xs", className)}>
      <span className="uppercase tracking-[0.24em] text-text-secondary/70">{t("label")}</span>
      <select
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        className="rounded-md border border-border/60 bg-surface px-2 py-1 text-sm text-text-primary outline-none focus:border-neon-green"
        aria-label={t("label")}
      >
        {LOCALES.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}
