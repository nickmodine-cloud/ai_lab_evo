import { NextIntlClientProvider } from 'next-intl';
import '../styles/globals.css';
import type { ReactNode } from 'react';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { FloatingDockNav } from "@/components/navigation/floating-dock-nav";
import enMessages from '../messages/en.json';
import ruMessages from '../messages/ru.json';
import { LocaleSelector } from "@/components/navigation/locale-selector";
import { K2TechLogo } from "@/components/branding/k2tech-logo";


export const metadata: Metadata = {
  title: "K2 Hypothesis Management Center",
  description: "AI Hypothesis Management Center: intake, prioritization, and scaling."
};

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const cookieStore = cookies();
  const localeCookie =
    typeof cookieStore.get === "function" ? cookieStore.get("NEXT_LOCALE") : undefined;
  const locale = localeCookie?.value === "ru" ? "ru" : "en";
  const messages = locale === "ru" ? ruMessages : enMessages;

  return (
    <html lang={locale} className="dark">
      <body className="font-cascadia overflow-x-hidden">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-12 lg:px-6">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <K2TechLogo variant="compact" />
                <LocaleSelector initialLocale={locale} />
              </div>
              <main className="flex flex-1 flex-col gap-10">{children}</main>
            </div>
          </div>
          <FloatingDockNav />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}














