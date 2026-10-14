"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  showCloseButton?: boolean;
  variant?: "default" | "kid";
  topSlot?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
  showCloseButton = true,
  variant = "default",
  topSlot,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const isKid = variant === "kid";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className={cn(
              "fixed inset-0 backdrop-blur-sm",
              isKid ? "bg-primary-900/40" : "bg-slate-900/40"
            )}
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full bg-surface-white shadow-float text-left z-10",
              isKid
                ? cn("rounded-[28px] p-6 sm:p-7 font-kid", topSlot && "mt-16")
                : "rounded-2xl p-6 border border-surface-border",
              maxWidthStyles[maxWidth]
            )}
          >
            {topSlot && <div className="flex justify-center -mt-20 mb-1">{topSlot}</div>}

            {/* Header */}
            {(title || showCloseButton) && (
              <div
                className={cn(
                  "flex items-start justify-between gap-3 mb-4",
                  !isKid && "pb-3.5 border-b border-surface-border",
                  isKid && topSlot && "justify-center text-center"
                )}
              >
                <div className="flex-1 min-w-0 pr-1">
                  {title && (
                    <h3
                      className={cn(
                        "font-semibold text-text-primary tracking-tight leading-tight",
                        isKid ? "font-display text-2xl font-bold" : "text-base sm:text-lg"
                      )}
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p
                      className={cn(
                        "text-text-muted mt-1 leading-normal",
                        isKid ? "text-base" : "text-xs sm:text-sm"
                      )}
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      "rounded-lg p-1.5 text-text-muted hover:bg-surface-subtle hover:text-text-primary transition-colors shrink-0 -mr-1 -mt-1",
                      isKid && "absolute top-4 right-4 bg-surface-subtle p-2 rounded-full"
                    )}
                    aria-label="Tutup modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
