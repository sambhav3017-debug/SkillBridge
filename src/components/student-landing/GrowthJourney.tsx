"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Code2,
  Sparkles,
  Target,
} from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Learn Skills",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-400",
    text: "Master industry-aligned technical curricula and guided roadmaps curated with engineering leads.",
    badge: "Personalized Track",
  },
  {
    step: "02",
    title: "Build Projects",
    icon: Code2,
    color: "from-pink-500 to-rose-400",
    text: "Construct production-ready capstones and fullstack apps that prove your real problem-solving capacity.",
    badge: "Verified Codebase",
  },
  {
    step: "03",
    title: "Complete Profile",
    icon: Award,
    color: "from-purple-500 to-indigo-400",
    text: "Showcase dynamic skill assessments, GitHub contributions, and automated ATS-ready badges.",
    badge: "Proof of Work",
  },
  {
    step: "04",
    title: "Get Hired",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-400",
    text: "Receive direct interview requests from 350+ partner tech companies without repetitive applications.",
    badge: "Direct Hiring",
  },
] as const;

export default function GrowthJourney() {
  return (
    <section
      className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:px-8 border-t border-[var(--glass-border)]"
      aria-label="Student growth journey"
    >
      <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sb-cyan mb-2">
            <Sparkles size={14} /> The Progression Pathway
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-sb-text">
            From Skills to Opportunities
          </h2>
        </div>
        <p className="max-w-md text-sm sm:text-base text-sb-muted font-normal">
          A proven four-stage pathway engineered to take you from foundational knowledge to high-growth career placement.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-stretch">
        {/* The 4 Connected Step Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map(({ step, title, icon: Icon, color, text, badge }) => (
            <div
              key={step}
              className="group relative flex flex-col justify-between rounded-2xl border border-[var(--card-glass-border)] bg-[var(--card-glass-bg)] p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-sb-cyan/40 backdrop-blur-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-black text-sb-muted/40 group-hover:text-sb-cyan transition-colors">
                    {step}
                  </span>
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr ${color} text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon size={18} />
                  </span>
                </div>

                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-sb-cyan mb-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-sb-cyan" />
                  <span>{badge}</span>
                </div>

                <h3 className="text-lg font-bold text-sb-text group-hover:text-sb-cyan transition-colors">
                  {title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-sb-muted">
                  {text}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-sb-cyan/90 group-hover:text-sb-pink transition-colors">
                <span>Stage Details</span>
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>

        {/* "Built for Your Success" Feature Callout Card */}
        <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-sb-pink/30 light:border-sb-pink/40 bg-gradient-to-br from-sb-pink/10 via-purple-500/5 to-sb-blue/15 p-7 lg:p-8 backdrop-blur-xl shadow-xl">
          {/* Ambient blurred glow in corner */}
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-sb-pink/25 blur-3xl"
            aria-hidden="true"
          />

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sb-pink/40 bg-sb-pink/15 px-3 py-1 text-xs font-bold text-sb-pink shadow-sm">
              <Target size={14} />
              <span>Built for Your Success</span>
            </div>

            <h3 className="mt-6 text-xl sm:text-2xl font-extrabold text-sb-text leading-snug">
              Over 12,000+ Students Placed Across 350+ Partner Companies
            </h3>

            <p className="mt-3 text-xs sm:text-sm text-sb-muted leading-relaxed">
              From first-year college students to graduates, SkillBridge removes the guesswork from technical careers with verified projects and direct recruiter reach.
            </p>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-sb-text font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Zero spam, verified job opportunities</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-sb-text font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Automated skill validation certificates</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-sb-text font-medium">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Direct campus placement cell integration</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--glass-border)] flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-sb-muted font-semibold">Ready to begin?</p>
              <p className="text-sm font-bold text-sb-text">Join SkillBridge Free</p>
            </div>

            <Link
              href="/student/signup"
              aria-label="Join SkillBridge free"
              className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-sb-pink to-sb-cyan text-white shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
