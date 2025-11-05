"use client";

import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface K2TechLogoProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "compact";
}

export function K2TechLogo({ className, variant = "default", ...props }: K2TechLogoProps) {
  const textClasses =
    variant === "compact"
      ? "text-base tracking-[0.4em]"
      : "text-lg tracking-[0.48em]";

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[rgba(0,255,136,0.35)] bg-[rgba(9,20,17,0.85)] px-4 py-2 shadow-[0_0_24px_rgba(0,255,136,0.25)]",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_top_right,rgba(0,255,136,0.25),transparent_65%)]" />
      <span className={cn("relative font-semibold uppercase text-neon-green", textClasses)}>
        K2<span className="text-[rgba(64,224,208,0.95)]">Tech</span>
      </span>
    </div>
  );
}
