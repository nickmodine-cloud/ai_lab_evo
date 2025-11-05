"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface AnimatedChartProps {
  data: Array<{ x: number | string; y: number }>;
  className?: string;
  gradient?: "cyan" | "magenta" | "violet";
}

const gradientColors = {
  cyan: "rgba(61, 224, 255, 0.8)",
  magenta: "rgba(255, 59, 241, 0.8)",
  violet: "rgba(168, 85, 247, 0.8)",
};

export function AnimatedChart({ data, className, gradient = "cyan" }: AnimatedChartProps) {
  const maxY = Math.max(...data.map((d) => d.y));
  const chartHeight = 200;

  return (
    <div className={cn("relative h-[200px] w-full", className)}>
      <svg viewBox={`0 0 ${data.length * 40} ${chartHeight}`} className="w-full h-full">
        <defs>
          <linearGradient id={`gradient-${gradient}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradientColors[gradient]} stopOpacity="0.8" />
            <stop offset="100%" stopColor={gradientColors[gradient]} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {data.map((point, index) => {
          const x = index * 40 + 20;
          const height = (point.y / maxY) * chartHeight;
          const y = chartHeight - height;

          return (
            <motion.rect
              key={index}
              x={x - 15}
              y={y}
              width="30"
              height={height}
              fill={`url(#gradient-${gradient})`}
              rx="4"
              initial={{ height: 0, y: chartHeight }}
              animate={{ height, y }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

