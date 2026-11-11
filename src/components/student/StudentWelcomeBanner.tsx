"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Camera, GraduationCap } from "lucide-react";
import { getISTGreeting } from "@/lib/student/greeting";
import { TRIndicator } from "@/components/ui/TRIndicator";

interface StudentWelcomeBannerProps {
  first?: string;
  fullName?: string;
  avatar?: string;
  nextStep?: { label: string; href?: string } | null;
  college?: string;
  degree?: string;
  branch?: string;
}

export default function StudentWelcomeBanner({
  first,
  fullName,
  avatar,
  college,
  degree,
  branch,
}: StudentWelcomeBannerProps) {
  // Dynamic time-based greeting strictly in Indian Standard Time (Asia/Kolkata)
  const [greeting, setGreeting] = useState<string>(() => getISTGreeting());
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Monitor image loading failures, including cases where image errored before React hydration
  useEffect(() => {
    const el = imgRef.current;
    if (!el || !avatar) return;

    if (el.complete && el.naturalWidth === 0) {
      queueMicrotask(() => setFailedSrc(avatar));
      return;
    }

    const handleError = () => setFailedSrc(avatar);
    el.addEventListener("error", handleError);
    return () => el.removeEventListener("error", handleError);
  }, [avatar]);

  useEffect(() => {
    // Automatically update greeting when time crosses period boundary (5am, 12pm, 5pm, 9pm IST)
    const interval = setInterval(() => {
      const nextGreeting = getISTGreeting();
      setGreeting((prev) => (prev !== nextGreeting ? nextGreeting : prev));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cleanName = first?.trim();
  const fullGreetingText = cleanName ? `${greeting}, ${cleanName}` : greeting;
  const displayName = fullName?.trim() || cleanName || "Student";
  const initials =
    displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "SB";

  const hasValidAvatar = Boolean(avatar && avatar.trim() && failedSrc !== avatar);

  return (
    <div
      id="student-welcome-banner"
      role="region"
      aria-label={fullGreetingText}
      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 sm:p-7 lg:p-8 text-white shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-[#0c1322] dark:via-[#0f172a] dark:to-[#090d16]"
    >
      {/* Subtle ambient lighting */}
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-sky-500/10 blur-[80px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-indigo-500/10 blur-[80px]"
        aria-hidden="true"
      />

      {/* HERO CONTENT GRID */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Greeting, Headline, and Action Button */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5 text-white">
          <div>
            {/* Status Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/10 text-slate-200 border border-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Day-0 Placement Drive Active
              </span>
              <TRIndicator variant="badge" score={88} />
            </div>

            {/* Dynamic IST Greeting Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-[-0.03em] text-white leading-tight">
              {greeting}
              {cleanName ? (
                <>
                  ,<br />
                  <span className="font-bold text-white">
                    {cleanName}
                  </span>
                </>
              ) : null}
            </h1>

            {college && (
              <p className="mt-2 text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>{college} {degree ? `· ${degree}` : ""} {branch ? `(${branch})` : ""}</span>
              </p>
            )}
          </div>

          {/* Action Button & Metadata */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <Link
              href="/student/opportunities"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
            >
              <span>Explore Opportunities</span>
              <ArrowRight size={14} />
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-[11px] font-medium text-slate-300">
              <GraduationCap size={14} className="text-sky-400" />
              <span>Skill Passport: Verified</span>
            </div>
          </div>
        </div>

        {/* Right Column: Authenticated Student Profile Photo */}
        <div className="md:col-span-5 relative flex items-center justify-center md:justify-end">
          {hasValidAvatar ? (
            <div className="relative w-44 h-52 sm:w-52 sm:h-60 select-none">
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/20 shadow-md bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={avatar}
                  loading="eager"
                  decoding="async"
                  alt={fullName ? `${fullName}'s verified profile photo` : "Student profile photo"}
                  className="w-full h-full object-cover object-center"
                  style={{ imageRendering: "-webkit-optimize-contrast" }}
                  onError={() => setFailedSrc(avatar || "")}
                />

                {/* Subtle vignette */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                  aria-hidden="true"
                />

                {/* Top-Right Change Photo Action */}
                <Link
                  href="/student/profile"
                  className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-md bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white border border-white/20 transition-colors shadow-sm"
                  title="Update profile photo"
                  aria-label="Update profile photo"
                >
                  <Camera size={13} />
                </Link>

                {/* Verified Student Badge */}
                <div className="absolute bottom-2.5 left-2.5 z-10">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-900/80 text-slate-200 border border-white/15">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Verified Student
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative w-44 h-52 sm:w-52 sm:h-60 select-none">
              <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/15 shadow-md bg-slate-800/80 flex flex-col items-center justify-center p-5 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-xl bg-white/10 border border-white/15 mb-2 text-white font-bold text-xl tracking-wider">
                  {initials}
                </div>

                <p className="text-xs font-semibold text-white truncate max-w-[150px]">
                  {displayName}
                </p>

                <Link
                  href="/student/profile"
                  className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors"
                >
                  <Camera size={12} />
                  <span>Upload Photo</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
