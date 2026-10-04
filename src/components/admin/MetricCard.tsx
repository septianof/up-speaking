import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: number | string;
  description?: string;
  badgeText?: string;
  icon: LucideIcon;
  variant?: 'navy' | 'emerald' | 'amber' | 'indigo' | 'sky';
  isLoading?: boolean;
}

const variantStyles = {
  navy: {
    iconBg: 'bg-slate-100 text-[#0e263e]',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
    hoverBorder: 'hover:border-sky-300',
    topHighlight: 'bg-gradient-to-r from-[#0e263e] to-[#00a6f4]',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    hoverBorder: 'hover:border-emerald-300',
    topHighlight: 'bg-emerald-500',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200/80',
    hoverBorder: 'hover:border-amber-300',
    topHighlight: 'bg-amber-500',
  },
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    hoverBorder: 'hover:border-indigo-300',
    topHighlight: 'bg-indigo-500',
  },
  sky: {
    iconBg: 'bg-sky-50 text-sky-600',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200/80',
    hoverBorder: 'hover:border-sky-300',
    topHighlight: 'bg-sky-500',
  },
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  badgeText,
  icon: Icon,
  variant = 'navy',
  isLoading = false,
}) => {
  const styles = variantStyles[variant] || variantStyles.navy;

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100" />
          <div className="w-20 h-6 rounded-full bg-slate-100" />
        </div>
        <div className="w-24 h-9 rounded-xl bg-slate-100 mb-2" />
        <div className="w-32 h-4 rounded-md bg-slate-100 mb-1" />
        <div className="w-44 h-3 rounded-md bg-slate-50" />
      </div>
    );
  }

  return (
    <div
      className={`group bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg transition-all duration-300 relative overflow-hidden ${styles.hoverBorder}`}
    >
      {/* Subtle top indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${styles.topHighlight} opacity-80`} />

      {/* Header Baris Atas: Ikon + Badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-2xs ${styles.iconBg}`}
        >
          <Icon className="w-6 h-6" />
        </div>

        {badgeText && (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${styles.badgeBg}`}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Nilai Utama */}
      <div className="space-y-1">
        <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        <p className="text-sm font-bold text-slate-700">{title}</p>
        {description && (
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
