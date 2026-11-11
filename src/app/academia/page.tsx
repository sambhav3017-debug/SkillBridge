import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Landmark,
  ShieldCheck,
  Users,
} from "lucide-react";
import Header from "@/components/landing/Header";
import { getCurrentAcademia } from "@/lib/server/academia-service";

export const metadata: Metadata = {
  title: "For Academia & Universities — SkillBridge",
  description:
    "Institutional hub for university placement offices, faculty research labs, and academic departments to manage student career pipelines and industry collaborations.",
};

const PILLARS = [
  {
    icon: GraduationCap,
    title: "Student Directory & CSV Roster Sync",
    text: "Manage students across departments, import rosters via CSV with duplicate detection, and sync live profiles with the Student Portal.",
  },
  {
    icon: Briefcase,
    title: "Training & Placement Cell",
    text: "Coordinate campus placement drives, approve industry recruitment visits, share employer job listings, and track verified placement outcomes.",
  },
  {
    icon: BookOpen,
    title: "Faculty, Research & Academic Projects",
    text: "Publish faculty-led research and interdisciplinary projects directly into Student Opportunities and supervise student applications.",
  },
  {
    icon: Building2,
    title: "Industry Relations & MoU Tracking",
    text: "Build structured corporate partnerships, track active MoUs, and coordinate guest lectures, internships, and technical workshops.",
  },
  {
    icon: BarChart3,
    title: "Institutional Reports & Analytics",
    text: "Measure department-wise participation, student skill distributions, placement drive conversions, and exportable compliance reports.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Governance & Audit Logs",
    text: "Assign granular access for Institution Owners, Admins, Placement Officers, Department Coordinators, Faculty, and Read-Only Analysts.",
  },
] as const;

export default async function AcademiaEntryPage() {
  const current = await getCurrentAcademia();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
      <Header />

      <main className="relative overflow-hidden pb-24 pt-12 sm:pt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 left-1/4 h-[460px] w-[460px] rounded-full bg-sb-blue/20 blur-[150px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-1/4 top-48 h-[420px] w-[420px] rounded-full bg-sb-pink/15 blur-[150px]"
        />

        {/* Hero */}
        <section className="relative mx-auto max-w-[1280px] px-5 sm:px-8">
          <div className="glass relative overflow-hidden p-8 sm:p-12 lg:p-16">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-3.5 py-1.5 text-xs font-semibold text-sb-cyan light:border-[#007BA7]/25 light:bg-[#EEF5FB] light:text-[#007BA7]">
                <Landmark size={14} /> SkillBridge for Universities, Colleges &amp; Placement Cells
              </span>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                Bridge academic excellence with{" "}
                <span className="bg-gradient-to-r from-sb-cyan via-white to-sb-pink bg-clip-text text-transparent light:from-[#007BA7] light:via-[#743BFF] light:to-[#D81B7A]">
                  real industry outcomes.
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-relaxed text-sb-muted sm:text-lg">
                Unify your Training &amp; Placement Cell, academic departments, faculty research projects, and industry
                partnerships in one connected campus workspace.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                {current ? (
                  <Link href="/academia/dashboard" className="btn btn-primary">
                    Open {current.institution.name} Workspace <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link href="/academia/register" className="btn btn-primary">
                      Register Your Institution <ArrowRight size={16} />
                    </Link>
                    <Link href="/academia/login" className="btn btn-glass">
                      Institution Sign In
                    </Link>
                  </>
                )}
                <Link href="/industry" className="btn btn-ghost text-xs">
                  Explore Industry Portal
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-6 text-xs text-sb-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-sb-cyan" /> Connected to Student &amp; Industry Portals
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={14} className="text-sb-cyan" /> Multi-Role Department &amp; T&amp;P Access
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Award size={14} className="text-sb-pink" /> Transparent Verification &amp; Audit Trail
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities */}
        <section className="mx-auto mt-16 max-w-[1280px] px-5 sm:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Built for Modern Campus Governance &amp; Placements
            </h2>
            <p className="mt-2 text-sm text-sb-muted">
              Every module connects directly with real student profiles and employer listings across SkillBridge.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="glass glass-hover flex flex-col justify-between p-6">
                <div>
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-sb-cyan/40 bg-sb-blue/15 text-sb-cyan">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 text-base font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-sb-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-white/10 px-6 py-8 text-center text-sm text-sb-muted">
        © {new Date().getFullYear()} SkillBridge. Your potential. Our bridge.
      </footer>
    </div>
  );
}
