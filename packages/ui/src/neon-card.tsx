import { ReactNode } from "react";
import clsx from "clsx";
import { colors, shadows, gradients } from "./design-tokens";

interface NeonCardProps {
  children: ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function NeonCard({ children, as: Tag = "div", className }: NeonCardProps) {
  return (
    <Tag
      className={clsx(
        "rounded-2xl border border-transparent bg-[rgba(11,11,17,0.85)] p-6 transition duration-300",
        className
      )}
      style={{
        borderImage: `${gradients.outline} 1`,
        boxShadow: shadows.neon,
        backgroundColor: colors.surface
      }}
    >
      {children}
    </Tag>
  );
}
