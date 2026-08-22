import React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  glass?: boolean;
}

export function Card({
  children,
  hoverable = false,
  glass = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border transition-all duration-200",
        glass
          ? "bg-white/85 backdrop-blur-xl border-white/60 shadow-elevated"
          : "bg-white border-slate-200/80 shadow-subtle",
        hoverable && "hover:shadow-elevated hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
