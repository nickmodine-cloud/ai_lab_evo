"use client";

import Link from "next/link";
import { useNavLinks } from "@/lib/nav-links";

export default function HomePage() {
  const navLinks = useNavLinks();
  const modules = navLinks.filter((link) => link.href !== "/");

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <h2 className="mb-4 text-lg font-semibold text-neon-green">Active Modules</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.label}
              href={module.href}
              className="neon-card block hover:border-neon-green/70 hover:text-neon-green"
            >
              <h3 className="text-base font-semibold">{module.label}</h3>
              <p className="mt-2 text-sm text-text-secondary">{module.description}</p>
              <p className="mt-4 text-xs uppercase tracking-wide text-text-secondary/60">
                Go to module →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}


