import React from "react";
import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", size = "md", isLoading = false, className, disabled, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2";

    const variants = {
      primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm border border-slate-900/10",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 border border-slate-200/80",
      ghost: "text-slate-700 hover:bg-slate-100/80 active:bg-slate-200/70",
      outline: "border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm",
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      glass: "bg-white/80 backdrop-blur-md text-slate-800 border border-white/40 shadow-sm hover:bg-white/95",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-9 w-9 p-0 text-slate-700 hover:text-slate-900",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
