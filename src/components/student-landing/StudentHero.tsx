"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  GraduationCap,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface StudentHeroProps {
  isLoggedIn?: boolean;
}

export default function StudentHero({ isLoggedIn = false }: StudentHeroProps) {
  void isLoggedIn;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Subtle interactive mouse parallax effect on the 3D scene
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      setMousePos({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative mx-auto max-w-[1400px] px-4 pt-4 sm:px-6 sm:pt-8 lg:px-8 pb-16 lg:pb-24 overflow-hidden"
      aria-label="Student landing hero"
    >
      {/* Ambient background glows */}
      <div
        className="pointer-events-none absolute -top-24 left-1/4 h-[550px] w-[550px] rounded-full bg-gradient-to-br from-sb-blue/15 via-sb-cyan/10 to-transparent blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-sb-pink/15 via-purple-500/10 to-transparent blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8 items-center">
        {/* Left Column: Eyebrow, Headline, Subtitle, CTAs, Feature Strip */}
        <div className="flex flex-col items-start text-left">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sb-pink/30 bg-sb-pink/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-sb-pink light:border-[#FF2D95]/30 light:bg-[#FDF1F6] light:text-[#C41D74] shadow-[0_0_20px_-3px_rgba(255,45,149,0.25)] light:shadow-[0_2px_10px_rgba(255,45,149,0.12)]">
            <GraduationCap size={15} className="animate-pulse text-sb-pink light:text-[#C41D74]" />
            <span>For Students</span>
            <span className="h-1.5 w-1.5 rounded-full bg-sb-cyan shadow-[0_0_6px_rgba(25,184,230,0.8)]" />
          </div>

          {/* Main Headline */}
          <h1 className="mt-5 text-[clamp(2.6rem,5.6vw,4.5rem)] font-extrabold tracking-[-0.035em] leading-[1.06]">
            <span className="text-sb-text">Learn.</span>{" "}
            <span className="bg-gradient-to-r from-[#9D44F7] via-[#EC4899] to-[#FF2D95] bg-clip-text text-transparent">
              Build.
            </span>{" "}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#007BA7] via-[#0284C7] to-[#06B6D4] bg-clip-text text-transparent">
              Get Hired.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-sb-muted font-normal">
            Your skills are your superpower. SkillBridge connects you with personalized learning,
            real-world projects, and career opportunities — all in one place.
          </p>

          {/* Action CTAs: Enhanced Glassmorphic Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* Primary CTA: Go to Dashboard */}
            <Link
              href="/student/dashboard"
              className="btn-glass-primary group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 sm:px-7 py-3.5 text-sm sm:text-base font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-sb-cyan focus-visible:ring-offset-2 light:focus-visible:ring-offset-[#F8F6F2] focus-visible:ring-offset-[#0a0a0a] motion-reduce:transform-none motion-reduce:transition-none"
            >
              {/* Base multi-stop gradient accent layer */}
              <span className="btn-glass-primary-bg absolute inset-0 -z-20 transition-all duration-300" aria-hidden="true" />

              {/* Translucent glass overlay with subtle blur */}
              <span className="btn-glass-primary-glass absolute inset-0 -z-10 transition-all duration-300" aria-hidden="true" />

              {/* Diagonal light sweep sheen on hover */}
              <span className="btn-glass-sheen absolute inset-0 -z-5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />

              {/* Button content */}
              <span className="relative z-10 flex items-center gap-2.5 tracking-[-0.01em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                <span>Go to Dashboard</span>
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 ease-out group-hover:translate-x-1.5 motion-reduce:transform-none"
                  aria-hidden="true"
                />
              </span>
            </Link>

            {/* Secondary CTA: Explore Opportunities */}
            <Link
              href="/student/opportunities"
              className="btn btn-glass group px-6 py-3 text-sm font-medium rounded-xl"
            >
              <span>Explore Opportunities</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-0.5 text-current"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* 4 Feature Highlights Row */}
          <div className="mt-12 w-full pt-8 border-t border-[var(--glass-border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sb-cyan font-bold text-sm">
                <BookOpen size={16} />
                <span>Learn</span>
              </div>
              <p className="text-xs text-sb-muted leading-snug">Personalized roadmaps & AI mentors</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sb-pink font-bold text-sm">
                <Code2 size={16} />
                <span>Build</span>
              </div>
              <p className="text-xs text-sb-muted leading-snug">Verified production capstones</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sb-cyan font-bold text-sm">
                <Briefcase size={16} />
                <span>Get Hired</span>
              </div>
              <p className="text-xs text-sb-muted leading-snug">Direct access to hiring teams</p>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[#9D44F7] font-bold text-sm">
                <TrendingUp size={16} />
                <span>Grow</span>
              </div>
              <p className="text-xs text-sb-muted leading-snug">Continuous career progression</p>
            </div>
          </div>
        </div>

        {/* Right Column: Photorealistic 3D Student Scene with Floating Glass Cards */}
        <div className="relative flex items-center justify-center min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]">
          {/* Luminous concentric background halos */}
          <div
            className="pointer-events-none absolute h-[340px] w-[340px] sm:h-[420px] sm:w-[420px] rounded-full border border-sb-cyan/20 light:border-sb-blue/20 bg-gradient-to-tr from-sb-blue/10 via-sb-pink/5 to-transparent transition-transform duration-700"
            style={{
              transform: `translate(${mousePos.x * -12}px, ${mousePos.y * -12}px)`,
            }}
          />
          <div
            className="pointer-events-none absolute h-[420px] w-[420px] sm:h-[500px] sm:w-[500px] rounded-full border border-sb-pink/15 light:border-sb-pink/20 transition-transform duration-700"
            style={{
              transform: `translate(${mousePos.x * -6}px, ${mousePos.y * -6}px)`,
            }}
          />

          {/* Central 3D Student Character Asset */}
          <div
            className="relative z-10 w-full max-w-[440px] sm:max-w-[480px] lg:max-w-[510px] aspect-square transition-transform duration-500 ease-out"
            style={{
              transform: `translate3d(${mousePos.x * 14}px, ${mousePos.y * 14}px, 0)`,
            }}
          >
            <Image
              src="/student-3d-character.png"
              alt="Interactive 3D Student Character working on laptop with books and graduation cap"
              fill
              priority
              sizes="(min-width: 1024px) 500px, 90vw"
              className="object-contain filter drop-shadow-[0_16px_36px_rgba(0,123,167,0.18)] light:drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)] select-none pointer-events-none"
            />
          </div>

          {/* Floating Glass Card 1: Learn — New Skills (Top-Left) */}
          <div
            className="absolute -top-2 -left-2 sm:left-4 sm:top-6 z-20 w-[210px] sm:w-[230px] rounded-2xl border border-white/20 light:border-black/10 bg-white/80 dark:bg-[#14171d]/85 p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-sb-cyan/50"
            style={{
              transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -18}px, 0)`,
              animation: "student-float-1 5s ease-in-out infinite",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-[#9D44F7] to-[#FF2D95] text-white shadow-sm">
                <Sparkles size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-sb-pink">
                  Active Track
                </p>
                <h2 className="text-xs font-bold text-sb-text truncate">Learn — Python & AI</h2>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] text-sb-muted font-medium mb-1">
                <span>Progress</span>
                <span className="text-sb-cyan font-bold">78%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sb-pink to-sb-cyan"
                  style={{ width: "78%" }}
                />
              </div>
            </div>
          </div>

          {/* Floating Glass Card 2: Build — Real Projects (Mid-Right) */}
          <div
            className="absolute top-1/3 -right-2 sm:right-0 z-20 w-[205px] sm:w-[225px] rounded-2xl border border-white/20 light:border-black/10 bg-white/80 dark:bg-[#14171d]/85 p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-sb-pink/50"
            style={{
              transform: `translate3d(${mousePos.x * -24}px, ${mousePos.y * -24}px, 0)`,
              animation: "student-float-2 6s ease-in-out infinite",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-sb-blue to-sb-cyan text-white shadow-sm">
                <Code2 size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Verified Capstone</span>
                </div>
                <h2 className="text-xs font-bold text-sb-text truncate">Cloud Microservices</h2>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-sb-muted">
              <CheckCircle2 size={13} className="text-emerald-500 flex-none" />
              <span className="truncate">GitHub repo synced & reviewed</span>
            </div>
          </div>

          {/* Floating Glass Card 3: Get Hired — Top Companies (Bottom-Left) */}
          <div
            className="absolute bottom-2 left-2 sm:bottom-6 sm:left-6 z-20 w-[215px] sm:w-[235px] rounded-2xl border border-white/20 light:border-black/10 bg-white/80 dark:bg-[#14171d]/85 p-3.5 shadow-xl backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-500/50"
            style={{
              transform: `translate3d(${mousePos.x * -14}px, ${mousePos.y * -14}px, 0)`,
              animation: "student-float-3 5.5s ease-in-out infinite",
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm">
                <Briefcase size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-sb-cyan uppercase tracking-wider">
                  Direct Placement
                </p>
                <h2 className="text-xs font-bold text-sb-text truncate">3 Interview Offers</h2>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] border-t border-[var(--glass-border)] pt-2">
              <span className="text-sb-muted">Profile Match</span>
              <span className="font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                98% Match
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* ========================================================
           SkillBridge Premium Glassmorphism CTA Buttons
           ======================================================== */

        /* Primary Glass CTA ("Go to Dashboard") */
        .btn-glass-primary {
          position: relative;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.38);
          box-shadow:
            0 4px 20px -2px rgba(255, 45, 149, 0.4),
            0 8px 18px -4px rgba(0, 123, 167, 0.32),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.6),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.22);
          transition: transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1),
                      box-shadow 250ms cubic-bezier(0.2, 0.8, 0.2, 1),
                      border-color 250ms ease;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .btn-glass-primary-bg {
          background: linear-gradient(135deg, #FF2D95 0%, #8B5CF6 52%, #007BA7 100%);
          border-radius: inherit;
        }

        .btn-glass-primary-glass {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.26) 0%,
            rgba(255, 255, 255, 0.08) 45%,
            rgba(0, 0, 0, 0.12) 100%
          );
          border-radius: inherit;
        }

        .btn-glass-primary:hover {
          transform: translateY(-2.5px);
          border-color: rgba(255, 255, 255, 0.65);
          box-shadow:
            0 8px 30px -2px rgba(255, 45, 149, 0.55),
            0 14px 28px -4px rgba(0, 123, 167, 0.45),
            inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.85),
            inset 0 -1px 2px 0 rgba(0, 0, 0, 0.25);
        }

        .btn-glass-primary:active {
          transform: translateY(-0.5px) scale(0.985);
          box-shadow:
            0 2px 12px -2px rgba(255, 45, 149, 0.45),
            0 4px 10px -3px rgba(0, 123, 167, 0.38),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.5);
        }

        /* Secondary Glass CTA ("Explore Opportunities") */
        .btn-glass-secondary {
          position: relative;
          border-radius: 1rem;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1),
                      box-shadow 250ms cubic-bezier(0.2, 0.8, 0.2, 1),
                      border-color 250ms ease,
                      background 250ms ease,
                      color 250ms ease;
        }

        /* Secondary Button — Light Mode */
        [data-theme="light"] .btn-glass-secondary,
        .light .btn-glass-secondary {
          color: #1e2433;
          border: 1px solid rgba(0, 123, 167, 0.22);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.90) 0%,
            rgba(255, 255, 255, 0.68) 100%
          );
          box-shadow:
            0 4px 16px -2px rgba(36, 39, 53, 0.07),
            0 1px 4px -1px rgba(0, 123, 167, 0.08),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.95),
            inset 0 -1px 1px 0 rgba(0, 123, 167, 0.05);
        }

        [data-theme="light"] .btn-glass-secondary:hover,
        .light .btn-glass-secondary:hover {
          transform: translateY(-2.5px);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.98) 0%,
            rgba(255, 255, 255, 0.84) 100%
          );
          border-color: rgba(0, 123, 167, 0.45);
          box-shadow:
            0 8px 24px -3px rgba(0, 123, 167, 0.18),
            0 3px 12px -2px rgba(255, 45, 149, 0.18),
            inset 0 1px 1.5px 0 #ffffff,
            0 0 0 1px rgba(0, 123, 167, 0.16);
        }

        [data-theme="light"] .btn-glass-secondary:active,
        .light .btn-glass-secondary:active {
          transform: translateY(-0.5px) scale(0.985);
          box-shadow:
            0 2px 8px -1px rgba(36, 39, 53, 0.08),
            inset 0 1px 1px 0 #ffffff;
        }

        /* Secondary Button — Dark Mode */
        :root:not([data-theme="light"]) .btn-glass-secondary,
        [data-theme="dark"] .btn-glass-secondary {
          color: #f5f7fa;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.09) 0%,
            rgba(255, 255, 255, 0.03) 100%
          );
          box-shadow:
            0 4px 20px -2px rgba(0, 0, 0, 0.45),
            0 1px 6px 0 rgba(0, 123, 167, 0.15),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.22),
            inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3);
        }

        :root:not([data-theme="light"]) .btn-glass-secondary:hover,
        [data-theme="dark"] .btn-glass-secondary:hover {
          transform: translateY(-2.5px);
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.14) 0%,
            rgba(255, 255, 255, 0.06) 100%
          );
          border-color: rgba(25, 184, 230, 0.45);
          box-shadow:
            0 8px 28px -3px rgba(0, 123, 167, 0.35),
            0 4px 14px -2px rgba(255, 45, 149, 0.25),
            inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35),
            0 0 0 1px rgba(25, 184, 230, 0.25);
        }

        :root:not([data-theme="light"]) .btn-glass-secondary:active,
        [data-theme="dark"] .btn-glass-secondary:active {
          transform: translateY(-0.5px) scale(0.985);
          box-shadow:
            0 2px 10px -2px rgba(0, 0, 0, 0.5),
            inset 0 1px 1px 0 rgba(255, 255, 255, 0.15);
        }

        /* Glass Diagonal Sheen */
        .btn-glass-sheen {
          background: linear-gradient(
            105deg,
            transparent 20%,
            rgba(255, 255, 255, 0.22) 45%,
            rgba(255, 255, 255, 0.38) 50%,
            rgba(255, 255, 255, 0.22) 55%,
            transparent 80%
          );
          transform: translateX(-100%);
          transition: transform 600ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        .btn-glass-primary:hover .btn-glass-sheen,
        .btn-glass-secondary:hover .btn-glass-sheen {
          transform: translateX(100%);
        }

        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .btn-glass-primary,
          .btn-glass-secondary,
          .btn-glass-sheen {
            transition: none !important;
            transform: none !important;
          }
          .btn-glass-primary:hover,
          .btn-glass-secondary:hover {
            transform: none !important;
          }
        }

        @keyframes student-float-1 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(0.6deg);
          }
        }
        @keyframes student-float-2 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(9px) rotate(-0.6deg);
          }
        }
        @keyframes student-float-3 {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(0.4deg);
          }
        }
      `}</style>
    </section>
  );
}
