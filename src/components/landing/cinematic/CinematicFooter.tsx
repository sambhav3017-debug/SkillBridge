"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "../Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function CinematicFooter() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-neutral-200/80 bg-neutral-50/60 dark:border-[rgba(205,203,202,0.12)] dark:bg-[#080808] transition-colors duration-500">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <Logo size={36} />
              <SkillBridgeWordmark
                variant="static"
                className="text-[1.28rem] sm:text-[1.38rem]"
                portal="landing"
              />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-[#596579] dark:text-[#8E8C8B]">
              {t.footer.tagline}
            </p>

            <div className="flex flex-col gap-1.5 pt-1">
              <a
                href="mailto:support@skillbridge.edu"
                className="inline-flex items-center gap-2 text-xs text-[#596579] dark:text-[#8E8C8B] hover:text-[#007BA7] dark:hover:text-[#D41514] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sb-cyan rounded-md"
                aria-label="Email SkillBridge Support at support@skillbridge.edu"
              >
                <Mail size={13} className="shrink-0" />
                <span>support@skillbridge.edu</span>
              </a>
              <a
                href="tel:+18005550199"
                className="inline-flex items-center gap-2 text-xs text-[#596579] dark:text-[#8E8C8B] hover:text-[#007BA7] dark:hover:text-[#D41514] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sb-cyan rounded-md"
                aria-label="Call SkillBridge at +1 (800) 555-0199"
              >
                <Phone size={13} className="shrink-0" />
                <span>+1 (800) 555-0199</span>
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t.footer.operational}</span>
              </span>
              <ThemeToggle compact />
            </div>
          </div>

          {/* Students Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#161B2E] dark:text-white">
              {t.footer.forStudents}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#596579] dark:text-[#A7B0BE]">
              <li>
                <Link href="/student" className="hover:text-[#007BA7] dark:hover:text-[#19B8E6] transition-colors">
                  Student Portal
                </Link>
              </li>
              <li>
                <Link href="/student/opportunities" className="hover:text-[#007BA7] dark:hover:text-[#19B8E6] transition-colors">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/student/projects" className="hover:text-[#007BA7] dark:hover:text-[#19B8E6] transition-colors">
                  Capstone Projects
                </Link>
              </li>
              <li>
                <Link href="/student/skills" className="hover:text-[#007BA7] dark:hover:text-[#19B8E6] transition-colors">
                  Skill Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/student/signup" className="hover:text-[#007BA7] dark:hover:text-[#19B8E6] transition-colors">
                  Student Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Industry Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#161B2E] dark:text-white">
              {t.footer.forIndustry}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#596579] dark:text-[#A7B0BE]">
              <li>
                <Link href="/industry" className="hover:text-[#D81B7A] dark:hover:text-[#FF2D95] transition-colors">
                  Industry Portal
                </Link>
              </li>
              <li>
                <Link href="/industry/talent" className="hover:text-[#D81B7A] dark:hover:text-[#FF2D95] transition-colors">
                  Talent Search
                </Link>
              </li>
              <li>
                <Link href="/industry/jobs" className="hover:text-[#D81B7A] dark:hover:text-[#FF2D95] transition-colors">
                  Post Capstones & Roles
                </Link>
              </li>
              <li>
                <Link href="/industry/signup" className="hover:text-[#D81B7A] dark:hover:text-[#FF2D95] transition-colors">
                  Enterprise Onboarding
                </Link>
              </li>
            </ul>
          </div>

          {/* Academia Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#161B2E] dark:text-white">
              {t.footer.forAcademia}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#596579] dark:text-[#A7B0BE]">
              <li>
                <Link href="/academia" className="hover:text-[#743BFF] dark:hover:text-[#B57CFF] transition-colors">
                  Academia Portal
                </Link>
              </li>
              <li>
                <Link href="/academia/research" className="hover:text-[#743BFF] dark:hover:text-[#B57CFF] transition-colors">
                  Faculty Research Labs
                </Link>
              </li>
              <li>
                <Link href="/academia/placements" className="hover:text-[#743BFF] dark:hover:text-[#B57CFF] transition-colors">
                  Placement Management
                </Link>
              </li>
              <li>
                <Link href="/academia/register" className="hover:text-[#743BFF] dark:hover:text-[#B57CFF] transition-colors">
                  University Partnership
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Governance Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#161B2E] dark:text-white">
              {t.footer.platform}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#596579] dark:text-[#A7B0BE]">
              <li>
                <Link href="/#opportunities" className="hover:text-[#161B2E] dark:hover:text-white transition-colors">
                  Opportunities
                </Link>
              </li>
              <li>
                <Link href="/#skills" className="hover:text-[#161B2E] dark:hover:text-white transition-colors">
                  Learning & Building
                </Link>
              </li>
              <li>
                <Link href="/#ecosystem" className="hover:text-[#161B2E] dark:hover:text-white transition-colors">
                  Ecosystem Bridge
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-[#161B2E] dark:hover:text-white transition-colors">
                  Terms, Privacy & Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-200/60 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#778195] dark:text-neutral-400">
          <div>
            © {new Date().getFullYear()} SkillBridge Inc. {t.footer.allRightsReserved}
          </div>
          <div className="flex items-center gap-6">
            <Link href="/legal" className="hover:underline">
              {t.footer.legal}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
