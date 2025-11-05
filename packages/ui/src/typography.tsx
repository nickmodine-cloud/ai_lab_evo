import { ReactNode } from "react";
import clsx from "clsx";

interface HeadingProps {
  children: ReactNode;
  className?: string;
}

export function Heading({ children, className }: HeadingProps) {
  return <h2 className={clsx("text-lg font-semibold text-neon-cyan", className)}>{children}</h2>;
}

export function Subheading({ children, className }: HeadingProps) {
  return <p className={clsx("text-sm text-slate-400", className)}>{children}</p>;
}
