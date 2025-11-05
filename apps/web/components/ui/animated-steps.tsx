"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface AnimatedStepsProps {
  steps: Array<{ id: string; label: string; description?: string }>;
  currentStep: number;
  className?: string;
}

export function AnimatedSteps({ steps, currentStep, className }: AnimatedStepsProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  isCompleted
                    ? "border-neon-green bg-neon-green/20"
                    : isActive
                      ? "border-neon-green bg-neon-green/10 shadow-[0_0_20px_rgba(0,255,136,0.4)]"
                      : "border-border/60 bg-surface-muted/70",
                )}
                animate={{
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-neon-green" />
                ) : (
                  <span className="text-sm font-semibold text-text-primary">{index + 1}</span>
                )}
              </motion.div>
              <div className="mt-2 text-center">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    isActive ? "text-neon-green" : "text-text-secondary",
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-1 text-xs text-text-secondary/60">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-0.5 flex-1 transition-colors",
                  isCompleted ? "bg-neon-green" : "bg-border/60",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

