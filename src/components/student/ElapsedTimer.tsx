"use client";

import React, { useEffect, useState } from "react";
import { Timer } from "lucide-react";

export interface ElapsedTimerProps {
  initialSeconds?: number;
  onTick?: (seconds: number) => void;
  isPaused?: boolean;
}

export const ElapsedTimer: React.FC<ElapsedTimerProps> = ({
  initialSeconds = 0,
  onTick,
  isPaused = false,
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1;
        if (onTick) onTick(next);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onTick]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-surface-border text-text-primary text-xs font-semibold">
      <Timer className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
      <span className="text-text-muted font-normal hidden sm:inline">Waktu Berjalan:</span>
      <span className="font-mono text-sm tracking-wide text-text-primary">
        {formatTime(seconds)}
      </span>
    </div>
  );
};
