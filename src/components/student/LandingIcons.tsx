import React from "react";

export const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const TikTokIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.48 6.3 6.3 0 0 0 1.86-4.47V8.71a8.21 8.21 0 0 0 4.91 1.64v-3.5a4.79 4.79 0 0 1-1-.16Z" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
  </svg>
);

export const CloudSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 120 60"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M20 50 C10 50 0 42 0 32 C0 24 6 18 14 16 C16 8 26 2 38 2 C48 2 56 7 60 14 C64 10 72 8 80 8 C92 8 102 16 104 26 C114 26 120 34 120 42 C120 50 112 50 102 50 Z" />
  </svg>
);

export const SparkleStar: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 0 L14.5 9.5 L24 12 L14.5 14.5 L12 24 L9.5 14.5 L0 12 L9.5 9.5 Z" />
  </svg>
);

export const SpeechBubbleSvg: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 40 36"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M6 0 C2.7 0 0 2.7 0 6 L0 22 C0 25.3 2.7 28 6 28 L24 28 L34 36 L32 28 L34 28 C37.3 28 40 25.3 40 22 L40 6 C40 2.7 37.3 0 34 0 Z" />
  </svg>
);
