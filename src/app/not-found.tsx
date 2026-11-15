"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Home, Compass, WifiOff, RefreshCw, GraduationCap, Building2, Briefcase } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";

export default function NotFound() {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkConnectivity = useCallback(async () => {
    setChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`/api/health?_t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        setIsOffline(false);
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      } else {
        setIsOffline(true);
      }
    } catch {
      setIsOffline(true);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setIsOffline(true);
    }

    const onOffline = () => setIsOffline(true);
    const onOnline = () => checkConnectivity();

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, [checkConnectivity]);

  return (
    <main className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 py-20 text-center select-none overflow-hidden">
      {/* Background ambient glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#007BA7]/20 via-[#743BFF]/20 to-[#FF2D95]/20 blur-[130px] dark:from-[#19B8E6]/25 dark:via-[#B57CFF]/25 dark:to-[#FF2D95]/25"
      />

      <div className="relative z-10 mx-auto max-w-lg space-y-6">
        {/* Brand mark */}
        <Link href="/" className="inline-flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95">
          <Logo size={42} />
          <SkillBridgeWordmark
            className="font-heading text-xl text-[#161B2E] dark:text-white"
            portal="landing"
          />
        </Link>

        {isOffline ? (
          /* Separate Friendly Offline Experience */
          <>
            <div className="mt-4 flex items-center justify-center">
              <div className="grid h-20 w-20 place-items-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-lg">
                <WifiOff size={40} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Internet Connection Unavailable
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                You appear to be offline or the server connection was interrupted. Check your network connection and tap Retry.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={checkConnectivity}
                disabled={checking}
                className="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
                <span>{checking ? "Checking Connection..." : "Retry Connection"}</span>
              </button>

              <Link
                href="/"
                className="btn btn-glass inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
              >
                <Home size={16} />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </>
        ) : (
          /* Authentic Genuine 404 — Lost in the Crossing */
          <>
            {/* 404 Visual badge */}
            <div className="mt-4 flex items-center justify-center">
              <span className="font-heading font-extrabold text-7xl sm:text-8xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#007BA7] via-[#743BFF] to-[#FF2D95] dark:from-[#19B8E6] dark:via-[#B57CFF] dark:to-[#FF2D95] drop-shadow-sm">
                404
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="font-heading text-2xl sm:text-3xl font-semibold text-[#161B2E] dark:text-white tracking-tight">
                Lost in the Crossing
              </h1>
              <p className="text-sm sm:text-base text-[#596579] dark:text-[#A7B0BE] leading-relaxed max-w-md mx-auto">
                The destination you were heading towards doesn&apos;t exist or has been moved. Let&apos;s get you back on track across the bridge.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="btn btn-glass inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold"
              >
                <Home size={16} />
                <span>Return to Homepage</span>
              </Link>

              <Link
                href="/student/opportunities"
                className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
              >
                <Compass size={16} className="text-current" />
                <span>Explore Opportunities</span>
              </Link>
            </div>
          </>
        )}

        {/* Quick Portal Jump Links (Always accessible) */}
        <div className="pt-8 border-t border-neutral-200/60 dark:border-white/10">
          <p className="text-xs uppercase tracking-wider text-[#778195] dark:text-neutral-400 font-semibold mb-3">
            Explore Dedicated Portals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs">
            <Link
              href="/student"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-200 hover:border-sb-cyan hover:text-sb-cyan transition-colors"
            >
              <GraduationCap size={14} className="text-sb-cyan" />
              <span>Student Portal</span>
            </Link>
            <Link
              href="/academia"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-200 hover:border-purple-400 hover:text-purple-400 transition-colors"
            >
              <Building2 size={14} className="text-purple-400" />
              <span>Academia Portal</span>
            </Link>
            <Link
              href="/industry"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-neutral-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-200 hover:border-pink-400 hover:text-pink-400 transition-colors"
            >
              <Briefcase size={14} className="text-pink-400" />
              <span>Industry Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
