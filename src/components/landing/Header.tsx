"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Menu,
  Search,
  Settings,
  X,
  GraduationCap,
  Building2,
  Briefcase,
  Sparkles,
  Compass,
  Shield,
  Home,
  ChevronRight,
} from "lucide-react";
import Logo, { SkillBridgeWordmark } from "./Logo";
import GlobalSearchModal from "@/components/search/GlobalSearchModal";
import SettingsModal from "@/components/settings/SettingsModal";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type ActivePanel = "settings" | "search" | "shortcuts" | null;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const { t } = useLanguage();

  // Pointer position tracking for interactive glass sheen micro-interaction
  const handleBtnPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--btn-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--btn-y", `${e.clientY - rect.top}px`);
    e.currentTarget.style.setProperty("--btn-hover", "1");
  };

  const handleBtnPointerLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty("--btn-hover", "0");
  };

  // Keyboard shortcut listener: Cmd+K for search, Cmd+, for settings, Escape to close mobile menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setActivePanel((prev) => (prev === "search" ? null : "search"));
      } else if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setActivePanel((prev) => (prev === "settings" ? null : "settings"));
      } else if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setActivePanel((prev) => (prev === "shortcuts" ? null : "shortcuts"));
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <header
      ref={headerRef}
      className="absolute top-0 left-0 right-0 z-50 w-full pointer-events-none py-3 sm:py-4 select-none"
    >
      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        <div className="pointer-events-auto relative flex h-[58px] sm:h-[66px] items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo & Title with Transparent Background */}
          <Link
            href="/#home"
            className="group flex items-center gap-2 sm:gap-3 rounded-xl px-1 sm:px-2 py-1.5 outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-sb-cyan hover:opacity-95 active:scale-[0.98] bg-transparent border-0 shadow-none backdrop-blur-none min-w-0"
            aria-label={t.header.homeAria}
          >
            <div className="t-stagger-loop-icon transition-transform duration-300 group-hover:scale-105 shrink-0 flex items-center">
              <Logo size={32} />
            </div>
            <SkillBridgeWordmark
              className="text-[1.12rem] xs:text-[1.24rem] sm:text-[1.38rem] truncate"
              portal="landing"
            />
          </Link>

          {/* Action Controls: Apple iOS-inspired Refined Search & Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Website Settings Button & Anchored Side Popover */}
            <div className="relative">
              <button
                type="button"
                id="header-settings-trigger"
                onClick={() => setActivePanel((prev) => (prev === "settings" ? null : "settings"))}
                aria-expanded={activePanel === "settings"}
                aria-haspopup="dialog"
                aria-controls="settings-popover-panel"
                aria-label={t.header.settings}
                title={t.header.settingsBtnTitle}
                className={`group grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D41514]/60 ${
                  activePanel === "settings"
                    ? "bg-black/[0.08] text-slate-900 border-black/[0.18] dark:bg-white/[0.12] dark:text-white dark:border-white/[0.22] dark:ring-1 dark:ring-[#D41514]/50 shadow-xs"
                    : "bg-black/[0.04] hover:bg-black/[0.07] text-slate-700 hover:text-slate-900 border-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.09] dark:text-[#CDCBCA] dark:hover:text-white dark:border-white/[0.08]"
                }`}
              >
                <Settings
                  size={15}
                  className={`transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:size-[17px] ${
                    activePanel === "settings" ? "rotate-90 text-slate-900 dark:text-white" : "group-hover:rotate-45"
                  }`}
                />
              </button>

              {/* Anchored Apple-style Settings Modal */}
              <SettingsModal
                isOpen={activePanel === "settings"}
                onClose={() => setActivePanel(null)}
                onOpenSearch={() => setActivePanel("search")}
              />
            </div>

            {/* Website Search Button & Anchored Floating Spotlight Search */}
            <div className="relative">
              <button
                type="button"
                id="header-search-trigger"
                onClick={() => setActivePanel((prev) => (prev === "search" ? null : "search"))}
                aria-expanded={activePanel === "search"}
                aria-haspopup="dialog"
                aria-controls="search-popover-panel"
                aria-label={t.header.search}
                title={t.header.searchBtnTitle}
                className={`group grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D41514]/60 ${
                  activePanel === "search"
                    ? "bg-black/[0.08] text-slate-900 border-black/[0.18] dark:bg-white/[0.12] dark:text-white dark:border-white/[0.22] dark:ring-1 dark:ring-[#D41514]/50 shadow-xs"
                    : "bg-black/[0.04] hover:bg-black/[0.07] text-slate-700 hover:text-slate-900 border-black/[0.06] dark:bg-white/[0.06] dark:hover:bg-white/[0.09] dark:text-[#CDCBCA] dark:hover:text-white dark:border-white/[0.08]"
                }`}
              >
                <Search
                  size={15}
                  className="transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 sm:size-[17px]"
                />
              </button>

              {/* Anchored Apple-style Spotlight Search */}
              <GlobalSearchModal
                isOpen={activePanel === "search"}
                onClose={() => setActivePanel(null)}
              />

              {/* Global Keyboard Shortcuts Reference Panel */}
              <KeyboardShortcutsModal
                isOpen={activePanel === "shortcuts"}
                onClose={() => setActivePanel(null)}
              />
            </div>

            <button
              type="button"
              className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full text-[#202536] dark:text-slate-100 bg-white/70 dark:bg-[#070b14]/70 border border-slate-200/80 dark:border-white/15 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] backdrop-blur-xl transition-all duration-200 hover:scale-105 hover:bg-white/90 dark:hover:bg-white/[0.14] hover:border-sb-cyan/50 active:scale-95 focus-visible:ring-2 focus-visible:ring-sb-cyan lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer & Backdrop */}
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden pointer-events-auto">
            {/* Backdrop with click-to-dismiss */}
            <div
              className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Mobile Navigation Sheet */}
            <nav
              id="mobile-menu"
              aria-label="Mobile Navigation"
              className="absolute inset-x-3 top-3 max-h-[calc(100dvh-24px)] overscroll-contain overflow-y-auto rounded-3xl border border-white/20 dark:border-white/12 bg-white/95 dark:bg-[#0c101d]/95 p-4 sm:p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-2xl transition-all duration-300 dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.7)]"
            >
              {/* Header inside Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                <Link
                  href="/#home"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 py-1"
                >
                  <div className="t-stagger-loop-icon shrink-0 flex items-center">
                    <Logo size={32} />
                  </div>
                  <SkillBridgeWordmark
                    className="text-[1.22rem]"
                    portal="landing"
                  />
                </Link>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-full text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Actions: Search & Settings (Apple iOS Inset Style) */}
              <div className="grid grid-cols-2 gap-2 my-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setActivePanel("search");
                  }}
                  className="flex min-h-[42px] items-center justify-between gap-2 rounded-[12px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-[#1C1C1E] px-3 py-2 text-left text-[0.84rem] font-medium text-slate-800 dark:text-[#F5F5F7] hover:bg-black/[0.06] dark:hover:bg-[#26262A] active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Search size={15} className="text-slate-500 dark:text-[#8E8C8B]" />
                    <span>{t.header.search}</span>
                  </div>
                  <span className="text-[0.64rem] font-medium text-slate-400 dark:text-[#636366] bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-[4px]">
                    ⌘K
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setActivePanel("settings");
                  }}
                  className="flex min-h-[42px] items-center justify-between gap-2 rounded-[12px] border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.03] dark:bg-[#1C1C1E] px-3 py-2 text-left text-[0.84rem] font-medium text-slate-800 dark:text-[#F5F5F7] hover:bg-black/[0.06] dark:hover:bg-[#26262A] active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Settings size={15} className="text-slate-500 dark:text-[#8E8C8B]" />
                    <span>{t.header.settings}</span>
                  </div>
                  <span className="text-[0.64rem] font-medium text-slate-400 dark:text-[#636366] bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-[4px]">
                    ⌘,
                  </span>
                </button>
              </div>

              {/* Portals Section */}
              <div className="mb-4">
                <span className="block px-1 mb-2 text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Platform Portals
                </span>
                <div className="space-y-1">
                  <Link
                    href="/student"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center justify-between px-3.5 py-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-sb-cyan">
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <div className="text-[0.9rem] font-semibold">Student Portal</div>
                        <div className="text-[0.74rem] text-slate-500 dark:text-slate-400">
                          Skills, courses, & opportunities
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/academia"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center justify-between px-3.5 py-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-pink-500/10 text-pink-600 dark:text-sb-pink">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <div className="text-[0.9rem] font-semibold">Academia Portal</div>
                        <div className="text-[0.74rem] text-slate-500 dark:text-slate-400">
                          Institution analytics & cohorts
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>

                  <Link
                    href="/industry"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center justify-between px-3.5 py-2.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-white/10 bg-slate-50/60 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-800 dark:text-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <div className="text-[0.9rem] font-semibold">Industry Portal</div>
                        <div className="text-[0.74rem] text-slate-500 dark:text-slate-400">
                          Recruitment & talent pipelines
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-400" />
                  </Link>
                </div>
              </div>

              {/* Explore Section */}
              <div className="mb-4">
                <span className="block px-1 mb-2 text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Explore Platform
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/student/skills"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-[0.84rem] font-medium transition-colors"
                  >
                    <Sparkles size={16} className="text-[#007BA7] dark:text-sb-cyan" />
                    <span>Gain Skills</span>
                  </Link>

                  <Link
                    href="/student/opportunities"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-[0.84rem] font-medium transition-colors"
                  >
                    <Compass size={16} className="text-pink-600 dark:text-sb-pink" />
                    <span>Opportunities</span>
                  </Link>

                  <Link
                    href="/#ecosystem"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-[0.84rem] font-medium transition-colors"
                  >
                    <Home size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Ecosystem</span>
                  </Link>

                  <Link
                    href="/legal"
                    onClick={() => setOpen(false)}
                    className="flex min-h-[44px] items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-200 text-[0.84rem] font-medium transition-colors"
                  >
                    <Shield size={16} className="text-slate-500" />
                    <span>Legal & Privacy</span>
                  </Link>
                </div>
              </div>

              {/* Action Buttons: Log In / Sign Up */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-2 gap-3">
                <Link
                  href="/student/login"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100/80 dark:bg-white/10 px-4 py-2.5 text-center text-[0.9rem] font-semibold text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
                >
                  {t.header.logIn}
                </Link>

                <Link
                  href="/student/signup"
                  onClick={() => setOpen(false)}
                  className="flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r from-[#007BA7] to-[#00A3D7] dark:from-sb-cyan dark:to-sb-pink px-4 py-2.5 text-center text-[0.9rem] font-semibold text-white dark:text-black shadow-md hover:opacity-95 transition-all"
                >
                  {t.header.signUp}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
