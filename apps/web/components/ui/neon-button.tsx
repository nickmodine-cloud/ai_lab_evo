"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/components/ui/button";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "gradient";
  children: React.ReactNode;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const baseClasses = "relative overflow-hidden rounded-full px-6 py-3 font-semibold text-sm uppercase tracking-[0.24em] transition-all duration-300";

    if (variant === "gradient") {
      return (
        <motion.button
          ref={ref}
          className={cn(
            baseClasses,
            "bg-gradient-to-r from-neon-green to-neon-turquoise text-text-primary shadow-[0_0_28px_rgba(0,255,136,0.45)]",
            "hover:shadow-[0_0_36px_rgba(64,224,208,0.55)] hover:scale-105",
            className,
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          {...props}
        >
          {children}
        </motion.button>
      );
    }

    if (variant === "outline") {
      return (
        <motion.button
          ref={ref}
          className={cn(
            baseClasses,
            "border-2 border-neon-green/60 bg-transparent text-neon-green",
            "hover:bg-neon-green/10 hover:border-neon-green hover:shadow-[0_0_28px_rgba(0,255,136,0.35)]",
            className,
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          {...props}
        >
          {children}
        </motion.button>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseClasses,
          "border border-border/60 bg-surface-muted/80 text-text-primary",
          "hover:border-neon-green/60 hover:bg-surface-hover/90 hover:shadow-[0_0_28px_rgba(0,255,136,0.35)]",
          className,
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);

NeonButton.displayName = "NeonButton";

