"use client";

import React, { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-50 text-success-600 border border-emerald-200 text-xs font-medium">
        <Wifi className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Online</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-50 text-amber-800 border border-amber-300 text-xs font-medium animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-warning-500" />
      <span>Mode Offline (Tersimpan Lokal)</span>
    </div>
  );
};
