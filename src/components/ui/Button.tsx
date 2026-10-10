"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-primary-500 text-surface-white hover:bg-primary-600 focus:ring-primary-400 shadow-sm",
      accent:
        "bg-accent-500 text-surface-white hover:bg-accent-600 focus:ring-accent-400 shadow-sm",
      secondary:
        "bg-surface-subtle text-text-primary hover:bg-slate-200 focus:ring-slate-400",
      outline:
        "border border-surface-border text-text-primary hover:bg-surface-subtle focus:ring-primary-300",
      ghost:
        "text-text-primary hover:bg-surface-subtle focus:ring-primary-300",
      danger:
        "bg-accent-50 text-accent-500 hover:bg-accent-100 border border-accent-200 focus:ring-accent-400",
    };

    const sizeStyles = {
      sm: "h-9 px-3 text-xs min-h-[36px]",
      md: "h-11 px-5 text-sm min-h-[44px]", // Minimum 44px for WCAG touch accessibility
      lg: "h-12 px-6 text-base min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
