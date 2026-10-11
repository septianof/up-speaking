"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

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
    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-sky-soft border-2 border-primary-200/80 text-text-primary text-xs font-bold shadow-2xs font-kid">
      <Clock className="w-3.5 h-3.5 text-primary-500 animate-spin" style={{ animationDuration: "10s" }} />
      <span className="text-text-muted font-normal hidden sm:inline">Waktu Santai:</span>
      <span className="font-mono text-xs sm:text-sm tracking-wide text-primary-800 font-bold">
        {formatTime(seconds)}
      </span>
    </div>
  );
};
