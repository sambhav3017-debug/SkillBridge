"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, WifiOff, RefreshCw, Home } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isOffline, setIsOffline] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    // Check if network is offline or error message indicates connection failure
    const offlineNow =
      typeof navigator !== "undefined" && !navigator.onLine;
    const msg = error.message?.toLowerCase() || "";
    const isNetworkError =
      offlineNow ||
      msg.includes("network") ||
      msg.includes("fetch") ||
      msg.includes("failed to fetch") ||
      msg.includes("load failed") ||
      msg.includes("connection");

    setIsOffline(isNetworkError);

    console.error("[SkillBridge Application Error Boundary]:", error);
  }, [error]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      // Test server reachability before resetting
      await fetch(`/api/health?_t=${Date.now()}`, { cache: "no-store" }).catch(() => null);
    } finally {
      setRetrying(false);
      reset();
    }
  };

  return (
    <main className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 text-center select-none overflow-hidden">
      {/* Background ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-rose-500/15 via-purple-500/10 to-blue-500/15 blur-[140px]"
      />

      <div className="relative z-10 mx-auto max-w-lg space-y-6">
        <Link href="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95">
          <Logo size={42} />
          <SkillBridgeWordmark
            className="font-heading text-xl text-[#161B2E] dark:text-white"
            portal="landing"
          />
        </Link>

        {/* Visual Icon Badge */}
        <div className="mt-4 flex items-center justify-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-lg">
            {isOffline ? <WifiOff size={40} /> : <AlertCircle size={40} />}
          </div>
        </div>

        {/* Headline & Narrative */}
        <div className="space-y-2">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isOffline ? "Internet Connection Unavailable" : "Something Went Wrong"}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
            {isOffline
              ? "We couldn't connect to SkillBridge servers. Check your network or Wi-Fi connection and tap Retry."
              : "An unexpected error occurred while loading this page. Your data is safe and our team has been notified."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={retrying ? "animate-spin" : ""} />
            <span>{retrying ? "Reconnecting..." : "Retry Connection"}</span>
          </button>

          <Link
            href="/"
            className="btn btn-glass inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
          >
            <Home size={16} />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
