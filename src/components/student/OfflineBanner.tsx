"use client";

import React, { useEffect, useState } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export interface OfflineBannerProps {
  isOnline?: boolean;
  isSyncing?: boolean;
  hasPendingSync?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline: propIsOnline,
  isSyncing = false,
  hasPendingSync = false,
}) => {
  const [internalIsOnline, setInternalIsOnline] = useState(true);

  useEffect(() => {
    setInternalIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setInternalIsOnline(true);
    const handleOffline = () => setInternalIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const effectiveIsOnline = propIsOnline !== undefined ? propIsOnline : internalIsOnline;

  if (effectiveIsOnline) {
    if (isSyncing) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-medium">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-600" />
          <span className="hidden sm:inline">Menyimpan...</span>
        </div>
      );
    }

    if (hasPendingSync) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Ada antrean lokal</span>
        </div>
      );
    }

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
