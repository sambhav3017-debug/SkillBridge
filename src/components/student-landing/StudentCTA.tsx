"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface StudentCTAProps {
  isLoggedIn?: boolean;
}

export default function StudentCTA({ isLoggedIn = false }: StudentCTAProps) {
  return (
    <section
      className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8"
      aria-label="Student call to action"
    >
      <div className="relative overflow-hidden rounded-3xl border border-sb-pink/30 light:border-sb-pink/40 bg-gradient-to-tr from-sb-blue/15 via-[#181a24] to-sb-pink/20 light:from-sb-blue/10 light:via-white light:to-sb-pink/10 p-8 sm:p-12 lg:p-16 text-center shadow-2xl backdrop-blur-2xl">
        {/* Ambient glow orbs */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-sb-blue/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-sb-pink/25 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-sb-pink/40 bg-sb-pink/10 px-4 py-1.5 text-xs font-semibold text-sb-pink shadow-sm mb-6">
            <Sparkles size={14} />
            <span>Launch Your Tech Journey</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-sb-text leading-tight">
            Ready to Accelerate Your Technical Career?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-sb-muted font-normal leading-relaxed">
            Join thousands of ambitious students turning hands-on projects into verified proof of work and direct placement opportunities.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={isLoggedIn ? "/student/dashboard" : "/student/signup"}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF2D95] via-[#A855F7] to-[#007BA7] px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-sb-pink/25 transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-sb-cyan"
            >
              <span>{isLoggedIn ? "Open Dashboard" : "Create Free Student Account"}</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/student/opportunities"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 light:border-neutral-200 bg-white/5 light:bg-white px-6 py-3.5 text-sm sm:text-base font-medium text-sb-text backdrop-blur-md transition-all duration-300 hover:bg-white/10 light:hover:bg-neutral-50 hover:border-sb-cyan/40 hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-sb-cyan"
            >
              <span>Browse Open Roles</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-sb-muted font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>100% Free for Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Verified Industry Projects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Direct Employer Outreach</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
