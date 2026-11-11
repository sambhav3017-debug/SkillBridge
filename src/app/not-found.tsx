import Link from "next/link";
import { ArrowLeft, Home, Compass, Sparkles } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";

export const metadata = {
  title: "404 — Page Not Found | SkillBridge",
  description: "The page you are looking for does not exist or has been moved.",
};

export default function NotFound() {
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

        {/* Quick Portal Jump Links */}
        <div className="pt-8 border-t border-neutral-200/60 dark:border-white/10">
          <p className="text-xs uppercase tracking-wider text-[#778195] dark:text-neutral-400 font-semibold mb-3">
            Direct Portals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/student"
              className="px-3 py-1.5 rounded-full border border-neutral-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-200 hover:border-sb-cyan transition-colors"
            >
              Student Portal
            </Link>
            <Link
              href="/academia"
              className="px-3 py-1.5 rounded-full border border-neutral-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-200 hover:border-purple-400 transition-colors"
            >
              Academia Portal
            </Link>
            <Link
              href="/industry"
              className="px-3 py-1.5 rounded-full border border-neutral-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5 text-neutral-700 dark:text-neutral-200 hover:border-pink-400 transition-colors"
            >
              Industry Portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
