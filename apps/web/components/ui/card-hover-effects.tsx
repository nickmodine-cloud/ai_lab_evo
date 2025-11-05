"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface CardHoverEffectsProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHoverEffects({ children, className }: CardHoverEffectsProps) {
  return (
    <motion.div
      className={cn(
        "group relative rounded-3xl border border-border/60 bg-surface-muted/70 p-6 transition duration-300",
        "hover:border-neon-green/60 hover:bg-surface-hover/90 hover:shadow-[0_0_28px_rgba(0,255,136,0.35)]",
        className,
      )}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

