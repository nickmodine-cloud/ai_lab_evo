"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface NeonGradientCardProps {
  title?: string;
  value?: string | number;
  description?: string;
  gradient?: "green" | "turquoise";
  className?: string;
  children?: React.ReactNode;
}

const gradientClasses = {
  green: "from-neon-green/20 to-neon-green/5",
  turquoise: "from-neon-turquoise/20 to-neon-turquoise/5",
};

const borderClasses = {
  green: "border-neon-green/40",
  turquoise: "border-neon-turquoise/40",
};

const shadowClasses = {
  green: "shadow-[0_0_28px_rgba(0,255,136,0.25)]",
  turquoise: "shadow-[0_0_28px_rgba(64,224,208,0.25)]",
};

export function NeonGradientCard({
  title,
  value,
  description,
  gradient = "green",
  className,
  children,
}: NeonGradientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br p-6 transition duration-300",
        gradientClasses[gradient],
        borderClasses[gradient],
        shadowClasses[gradient],
        "hover:shadow-[0_0_36px_rgba(0,255,136,0.4)]",
        className,
      )}
    >
      {title && (
        <p className="text-[11px] uppercase tracking-[0.32em] text-text-secondary/60">
          {title}
        </p>
      )}
      {value !== undefined && (
        <h3 className="mt-2 text-3xl font-semibold text-text-primary">
          {value}
        </h3>
      )}
      {description && (
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      )}
      {children}
    </motion.div>
  );
}

