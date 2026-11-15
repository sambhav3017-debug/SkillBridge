"use client";

import { useEffect, useState, useCallback } from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [restoredNotice, setRestoredNotice] = useState(false);

  const checkConnectivity = useCallback(async () => {
    setIsChecking(true);
    try {
      // Direct reachability ping to /api/health with a short timeout and cache-busting
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`/api/health?_t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        if (isOffline) {
          setIsOffline(false);
          setRestoredNotice(true);
          setTimeout(() => setRestoredNotice(false), 3500);
        }
      } else {
        setIsOffline(true);
      }
    } catch {
      setIsOffline(true);
    } finally {
      setIsChecking(false);
    }
  }, [isOffline]);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    const handleOffline = () => {
      setIsOffline(true);
    };

    const handleOnline = () => {
      // Verify actual server reachability when the browser triggers 'online'
      checkConnectivity();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [checkConnectivity]);

  if (restoredNotice) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/90 dark:bg-emerald-900/90 px-4 py-3 text-emerald-100 shadow-[0_12px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 select-none"
      >
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Connection Restored</p>
          <p className="text-[11px] text-emerald-200/90">You are back online and synchronized.</p>
        </div>
      </div>
    );
  }

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:right-6 z-[100] max-w-md rounded-2xl border border-rose-500/40 bg-[#161618]/95 dark:bg-[#121214]/95 p-4 text-white shadow-[0_16px_50px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-5 duration-300 select-none"
    >
      <div className="flex items-start gap-3.5">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-[#FF2D95] dark:text-[#D41514] border border-rose-500/20">
          <WifiOff size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Internet Connection Unavailable
          </h3>
          <p className="mt-1 text-xs text-[#A7B0BE] leading-relaxed">
            Your connection was interrupted. SkillBridge will automatically resume once connectivity returns.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={checkConnectivity}
              disabled={isChecking}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D41514] to-[#FF2D95] hover:opacity-95 text-white px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isChecking ? "animate-spin" : ""} />
              <span>{isChecking ? "Checking..." : "Retry Connection"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
