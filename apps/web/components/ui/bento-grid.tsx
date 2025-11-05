"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  className,
  name,
  description,
  href,
  header,
  icon,
  children,
}: {
  className?: string;
  name?: string;
  description?: string;
  href?: string;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-border/60 bg-surface-muted/70 p-6 transition duration-300",
        "hover:border-neon-green/60 hover:shadow-[0_0_28px_rgba(0,255,136,0.35)]",
        className,
      )}
    >
      {header}
      <div className="transition duration-300 group-hover:translate-x-2">
        {icon}
        {name && (
          <div className="my-2 font-sans font-bold text-text-primary text-neutral-600 dark:text-neutral-300">
            {name}
          </div>
        )}
        {description && (
          <div className="text-sm font-sans text-text-secondary text-neutral-600 dark:text-neutral-300">
            {description}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
};

