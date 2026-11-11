"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck, GraduationCap, Zap, Hand } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import LoginForm from "@/components/student/LoginForm";
import HumanMascot3D from "@/components/student/HumanMascot3D";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

export default function StudentLoginSplit({
  next,
  notice,
}: {
  next?: string;
  notice?: string;
}) {
  const prefersReduced = usePrefersReducedMotion();

  // Animation synchronization state between login form inputs and 3D character
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  // Track pointer movements across the window to feed into 3D eye tracking
  useEffect(() => {
    if (prefersReduced) return;

    const handlePointerMove = (e: MouseEvent) => {
      // Normalize to [-1, 1] range
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setPointer({ x, y });
    };

    window.addEventListener("mousemove", handlePointerMove);
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, [prefersReduced]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-300">
      {/* Ambient background lighting */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-sb-blue/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full bg-sb-pink/12 blur-[140px]" />

      {/* Top Navigation Bar */}
      <header className="relative z-20 mx-auto flex w-full max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 sm:py-5">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sb-cyan"
          aria-label="SkillBridge home"
        >
          <Logo size={32} />
          <SkillBridgeWordmark
            className="text-lg text-sb-text"
            portal="landing"
          />
          <span className="hidden sm:inline-block ml-1 rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sb-cyan light:border-sb-blue/20 light:bg-sb-blue/5 light:text-sb-blue">
            Student Portal
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs sm:text-sm font-medium text-sb-muted transition-colors hover:text-sb-text outline-none focus-visible:ring-2 focus-visible:ring-sb-cyan"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hidden xs:inline">Back to website</span>
          </Link>
        </div>
      </header>

      {/* Main Split-Screen Container */}
      <main className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-1 items-center px-4 pb-10 pt-2 sm:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          
          {/* LEFT SIDE — Focused Login Form (5 of 12 columns on desktop) */}
          <div className="w-full lg:col-span-6 xl:col-span-5 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-md">
              
              {/* Form Glass Card */}
              <div className="rounded-3xl border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.015))] p-6 sm:p-8 backdrop-blur-xl shadow-[0_16px_40px_-15px_rgba(0,0,0,0.5)] light:bg-white light:border-black/[0.08] light:shadow-[0_16px_40px_-12px_rgba(36,39,53,0.10)] transition-all">
                
                {/* Header Stage */}
                <div className="mb-6">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sb-cyan light:border-sb-blue/20 light:bg-sb-blue/5 light:text-sb-blue">
                    <GraduationCap size={13} aria-hidden="true" />
                    <span>STUDENT ACCESS</span>
                  </div>
                  <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-sb-text">
                    Welcome back.
                  </h1>
                  <p className="mt-1.5 text-sm leading-relaxed text-sb-muted">
                    Your next opportunity starts here.
                  </p>
                </div>

                {/* Real Active Authentication Form with Mascot Sync Callbacks */}
                <LoginForm
                  next={next}
                  notice={notice}
                  onPasswordFocus={setIsPasswordFocused}
                  onPasswordVisibilityChange={setIsPasswordVisible}
                  onEmailFocus={setIsEmailFocused}
                />

                {/* Account Creation Footer Link */}
                <div className="mt-6 border-t border-white/5 pt-4 text-center text-xs sm:text-sm text-sb-muted light:border-black/5">
                  New to SkillBridge?{" "}
                  <Link
                    href="/student/signup"
                    className="font-semibold text-sb-cyan underline-offset-2 hover:underline light:text-sb-blue"
                  >
                    Create a student account
                  </Link>
                </div>
              </div>

              {/* Demo Mode Notice */}
              <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-sb-muted/80">
                <ShieldCheck size={14} className="flex-none text-sb-cyan" aria-hidden="true" />
                <span>Verified demo authentication. Accounts stored securely on server.</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE — Mascot Welcome Scene with Live 3D Character (7 of 12 columns on desktop) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col items-center justify-center">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1017]/90 via-[#0f1420]/80 to-[#15101f]/85 p-8 xl:p-10 backdrop-blur-xl shadow-[0_24px_50px_-15px_rgba(0,0,0,0.65)] light:from-white light:via-[#FFF6EE] light:to-[#F3F6FD] light:border-black/[0.08] light:shadow-[0_24px_50px_-15px_rgba(36,39,53,0.12)]">
              
              {/* Soft Ambient Radial Lights */}
              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-sb-cyan/20 blur-[90px]" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-sb-pink/20 blur-[90px]" />

              {/* Floating Glass Pill Top Left */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-md shadow-sm light:bg-white/80 light:border-black/5 light:text-[#202536]">
                  <Sparkles size={13} className="text-sb-cyan" aria-hidden="true" />
                  <span>SkillBridge Companion</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sb-pink/30 bg-sb-pink/10 px-3 py-1 text-[11px] font-medium text-sb-pink">
                  <Zap size={12} aria-hidden="true" />
                  <span>Interactive 3D</span>
                </div>
              </div>

              {/* 3D Character Stage */}
              <div className="relative z-10 my-4 flex items-center justify-center">
                <div className="relative h-[360px] w-full max-w-[420px] xl:h-[400px] xl:max-w-[460px] overflow-hidden rounded-2xl">
                  <HumanMascot3D
                    className="w-full h-full"
                    animState={{
                      isPasswordFocused,
                      isPasswordVisible,
                      isEmailFocused,
                      pointer,
                    }}
                  />
                </div>
              </div>

              {/* Floating Bottom Welcome Glass Panel */}
              <div className="relative z-10 rounded-2xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-md shadow-inner light:bg-white/90 light:border-black/5 light:shadow-md">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl border border-sb-cyan/35 bg-sb-cyan/15 text-sb-cyan light:border-sb-blue/30 light:bg-sb-blue/10 light:text-sb-blue">
                    <Sparkles size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-sb-text">
                      Hey there, future builder!
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-sb-muted">
                      Your next opportunity starts here. Let’s make something meaningful.
                    </p>
                  </div>
                </div>

                {/* Feature highlight tags */}
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-3 text-[11px] font-medium text-sb-muted light:border-black/5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-2 py-0.5 light:bg-black/[0.04]">
                    ✓ Verified Roadmaps
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-2 py-0.5 light:bg-black/[0.04]">
                    ✓ Direct ATS Pipeline
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-2 py-0.5 light:bg-black/[0.04]">
                    ✓ Capstone Mentorship
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* MOBILE ONLY — Compact Companion Accent Card */}
          <div className="flex lg:hidden flex-col items-center justify-center order-first sm:order-last mt-2">
            <div className="flex w-full max-w-md items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md light:bg-white light:border-black/5 light:shadow-sm">
              <div className="relative flex h-12 w-12 flex-none items-center justify-center rounded-xl border border-sb-cyan/30 bg-gradient-to-br from-sb-blue/20 to-sb-pink/20 text-sb-cyan light:from-sb-blue/10 light:to-sb-pink/10">
                <Hand size={22} className="animate-bounce" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-bold text-sb-text">
                  Hey there, future builder!
                </p>
                <p className="text-[11px] text-sb-muted leading-tight mt-0.5">
                  Your next opportunity starts here. Let’s make something meaningful.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-[var(--glass-border)] py-4 text-center text-xs text-sb-muted">
        © {new Date().getFullYear()} SkillBridge. Your potential. Our bridge.
      </footer>
    </div>
  );
}
