"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/components/ui/input";
import { Label } from "@/components/components/ui/label";

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const AnimatedInput = React.forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ className, label, error, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);

    return (
      <div className="w-full">
        {label && (
          <Label className="mb-2 text-text-primary text-sm font-medium">
            {label}
          </Label>
        )}
        <motion.div
          className="relative"
          animate={{
            boxShadow: focused
              ? "0 0 20px rgba(61, 224, 255, 0.3)"
              : "0 0 0px rgba(61, 224, 255, 0)",
          }}
          transition={{ duration: 0.3 }}
        >
          <Input
            ref={ref}
            className={cn(
              "border-border/60 bg-surface-muted/70 text-text-primary placeholder:text-text-secondary/50",
              "focus:border-neon-green/60 focus:ring-2 focus:ring-neon-green/20",
              "transition-all duration-300",
              error && "border-[rgba(64,224,208,0.55)] focus:border-[rgba(64,224,208,0.7)] focus:ring-[rgba(64,224,208,0.2)]",
              className,
            )}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-xs text-[rgba(255,120,210,0.9)]"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

AnimatedInput.displayName = "AnimatedInput";

