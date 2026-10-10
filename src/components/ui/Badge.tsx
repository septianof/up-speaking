import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "accent" | "success" | "warning" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center font-medium rounded-pill border select-none transition-colors";

  const variantStyles = {
    primary: "bg-primary-50 text-primary-700 border-primary-200",
    accent: "bg-accent-50 text-accent-700 border-accent-200",
    success: "bg-success-50 text-success-700 border-emerald-200",
    warning: "bg-warning-50 text-amber-800 border-amber-200",
    neutral: "bg-surface-subtle text-text-secondary border-surface-border",
  };

  const sizeStyles = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};
