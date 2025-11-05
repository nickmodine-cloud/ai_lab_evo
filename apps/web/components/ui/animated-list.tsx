"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface AnimatedListProps {
  items: Array<{ id: string | number; content: React.ReactNode }>;
  className?: string;
}

export function AnimatedList({ items, className }: AnimatedListProps) {
  return (
    <motion.ul
      className={cn("space-y-3", className)}
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={fadeInUp}>
          {item.content}
        </motion.li>
      ))}
    </motion.ul>
  );
}

