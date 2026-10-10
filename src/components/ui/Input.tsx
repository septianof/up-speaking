"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-text-primary mb-1.5"
          >
            {label}
            {props.required && <span className="text-accent-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-11 px-3.5 rounded-btn bg-surface-white border text-text-primary text-sm transition-all focus:outline-none focus:ring-2 placeholder:text-text-disabled",
              error
                ? "border-accent-500 focus:ring-accent-200 bg-accent-50/20"
                : "border-surface-border focus:border-primary-500 focus:ring-primary-100",
              className
            )}
            {...props}
          />
        </div>
        {error ? (
          <p className="mt-1.5 text-xs font-medium text-accent-500 flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1.5 text-xs text-text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
