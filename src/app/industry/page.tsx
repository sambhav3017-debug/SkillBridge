import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, Briefcase, CalendarCheck, Users } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { getCurrentIndustry } from "@/lib/server/industry-service";

export const metadata: Metadata = {
  title: "For Industry & Recruiters — SkillBridge",
  description:
    "Direct skill-based recruiting, verified repository capstone challenges, and end-to-end applicant tracking across top university cohorts.",
};

const HIGHLIGHTS = [
  {
    icon: Users,
    title: "Discover verified student talent",
    text: "Search candidates by demonstrated skills, projects, degree, and graduation year.",
    color: "#19b8e6",
  },
  {
    icon: Briefcase,
    title: "Publish jobs & internships",
    text: "Create structured listings that go live immediately in the Student Opportunities feed.",
    color: "#ff2d95",
  },
  {
    icon: CalendarCheck,
    title: "End-to-end ATS & interviews",
    text: "Move applicants through custom pipeline stages, record team notes, and schedule interviews.",
    color: "#19b8e6",
  },
  {
    icon: BarChart3,
    title: "Campus drives & analytics",
    text: "Coordinate campus events and track conversion across every role and stage.",
    color: "#ff2d95",
  },
] as const;

export default async function IndustryEntryPage() {
  const workspace = await getCurrentIndustry();
  const loggedIn = !!workspace;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-40 top-0 h-[480px] w-[480px] rounded-full bg-sb-pink/15 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[420px] w-[420px] rounded-full bg-sb-blue/20 blur-[140px]" />

      <header className="relative z-10 mx-auto flex max-w-[1300px] items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SkillBridge home">
          <Logo size={30} />
          <span className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
            <SkillBridgeWordmark portal="industry" />{" "}
            <span className="ml-1 rounded-full border border-sb-pink/40 bg-sb-pink/10 px-2 py-0.5 text-[11px] font-semibold text-sb-pink">
              Industry
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-sb-muted transition-colors hover:text-sb-text">
            <ArrowLeft size={16} aria-hidden="true" /> Back to website
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-[1300px] items-center gap-10 px-5 pb-16 pt-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-14">
        <div>
          <p className="rise d1 inline-flex items-center gap-2.5 rounded-full border border-sb-pink/50 bg-white/5 light:bg-[#FDF1F6] light:border-[#FF2D95]/30 light:text-[#202536] px-4 py-1.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-sb-pink shadow-[0_0_10px_2px_rgba(255,45,149,0.9)]" />
            For Companies, Startups &amp; Hiring Teams
          </p>
          <h1 className="rise d2 mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)] font-bold leading-[1.06] tracking-[-0.03em]">
            Find the talent that{" "}
            <span className="text-sb-blue">moves your business</span>{" "}
            <span className="text-sb-pink light:text-[#D81B7A]">forward.</span>
          </h1>
          <p className="rise d3 mt-5 max-w-lg text-base leading-relaxed text-sb-muted">
            SkillBridge connects your hiring team directly with emerging student engineers, designers, and analysts. Post
            internships and jobs, evaluate real project portfolios, and manage your entire recruitment pipeline in one workspace.
          </p>

          <div className="rise d4 mt-8 flex flex-wrap items-center gap-4">
            {loggedIn ? (
              <Link href="/industry/dashboard" className="btn btn-primary">
                Open Recruiter Workspace <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link href="/industry/signup" className="btn btn-primary">
                  Create Company Account <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/industry/login" className="btn btn-glass">
                  Recruiter Login
                </Link>
              </>
            )}
          </div>

          <ul className="rise d5 mt-10 grid gap-3 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon: Icon, title, text, color }) => (
              <li key={title} className="glass flex gap-3.5 p-4">
                <span
                  className="grid h-10 w-10 flex-none place-items-center rounded-full border light:bg-[#FFFEFC]"
                  style={{ color, borderColor: `${color}99`, boxShadow: `0 0 16px -5px ${color}` }}
                >
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-sm font-bold">{title}</h2>
                  <p className="mt-0.5 text-[13px] leading-snug text-sb-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="fade-in relative mx-auto aspect-[16/10] w-full max-w-[700px] overflow-hidden rounded-3xl light:border light:border-[#D6DBE7] light:bg-[radial-gradient(ellipse_92%_85%_at_50%_45%,#FFFFFF_0%,#EEF5FB_54%,#FDF1F6_100%)] light:shadow-[0_24px_56px_-16px_rgba(32,37,54,0.10)]">
          <Image
            src="/bridge-hero.jpg"
            alt="Glowing cyan and neon-pink digital bridge connecting student potential with industry opportunity"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover light:invert light:hue-rotate-180 light:mix-blend-multiply light:opacity-90"
            style={{
              maskImage: "radial-gradient(ellipse 52% 52% at 50% 50%, #000 62%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 52% 52% at 50% 50%, #000 62%, transparent 100%)",
            }}
          />
          <div className="drift absolute left-1/2 top-[20%] -translate-x-1/2 rounded-full border border-white/15 bg-black/50 px-3.5 py-1 text-[11px] font-semibold backdrop-blur-md light:border-[#D6DBE7] light:bg-[#FFFEFC]/95 light:shadow-md">
            <span className="text-sb-cyan light:text-[#007BA7]">Discover</span> <span className="text-white/50 light:text-[#778195]">·</span>{" "}
            <span className="text-white light:text-[#202536]">Evaluate</span> <span className="text-white/50 light:text-[#778195]">·</span>{" "}
            <span className="text-sb-pink light:text-[#D81B7A]">Hire</span>
          </div>
        </div>
      </main>
    </div>
  );
}
