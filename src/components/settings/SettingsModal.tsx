"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  X,
  Sun,
  Moon,
  Search,
  RotateCcw,
  Check,
  GraduationCap,
  Building2,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onOpenSearch,
}: SettingsModalProps) {
  const { theme, setThemeMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [resetNotice, setResetNotice] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Escape key and Outside Click detection
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      // Do not close if clicking inside panel or the settings trigger button
      if (
        panelRef.current?.contains(target) ||
        document.getElementById("header-settings-trigger")?.contains(target)
      ) {
        return;
      }
      onClose();
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, onClose]);

  // Reset All to Defaults
  const handleResetDefaults = () => {
    setThemeMode("dark");
    setLanguage("en");

    if (typeof window !== "undefined") {
      // Purge obsolete accessibility preference items from storage
      localStorage.removeItem("skillbridge-reduced-motion");
      localStorage.removeItem("skillbridge-text-size");
      localStorage.removeItem("skillbridge-high-contrast");
      delete document.documentElement.dataset.reducedMotion;
      delete document.documentElement.dataset.textSize;

      // Enhanced Contrast remains permanently active across SkillBridge
      document.documentElement.dataset.highContrast = "true";
    }

    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      id="settings-popover-panel"
      role="dialog"
      aria-modal="false"
      aria-label={t.settings.title}
      className="fixed sm:absolute top-[70px] sm:top-full right-3 sm:right-0 mt-0 sm:mt-2.5 z-50 w-[calc(100vw-1.5rem)] sm:w-[350px] max-w-[360px] rounded-[18px] border border-black/[0.08] dark:border-[rgba(205,203,202,0.14)] bg-white/95 dark:bg-[#121214]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)_inset] origin-top-right transition-all duration-200 animate-in fade-in zoom-in-95 pointer-events-auto select-auto max-h-[min(580px,calc(100vh-90px))] flex flex-col overflow-hidden text-left"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Apple Modal Navigation Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.07] px-4 py-3 shrink-0 bg-white/50 dark:bg-transparent">
        <h2 className="text-[0.92rem] font-semibold tracking-tight text-slate-900 dark:text-[#F5F5F7]">
          {t.settings.title}
        </h2>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="grid h-6 w-6 place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:text-[#8E8C8B] dark:hover:text-white bg-black/[0.04] dark:bg-[#242426] hover:bg-black/[0.08] dark:hover:bg-[#323236] transition-colors cursor-pointer"
        >
          <X size={12} strokeWidth={2.4} />
        </button>
      </div>

      {/* iOS Settings App Inset Grouped Content */}
      <div className="relative z-10 overflow-y-auto px-3.5 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-300/60 dark:scrollbar-thumb-slate-700/60">
        
        {/* Section 1: Appearance */}
        <section aria-labelledby="heading-appearance" className="space-y-1.5">
          <h3
            id="heading-appearance"
            className="text-[0.68rem] font-semibold text-slate-400 dark:text-[#8E8C8B] uppercase tracking-[0.05em] px-1"
          >
            {t.settings.appearance}
          </h3>

          <div className="rounded-[14px] border border-black/[0.06] dark:border-white/[0.07] bg-black/[0.025] dark:bg-[#1C1C1E] overflow-hidden">
            {/* Night Mode / Dark Theme Switch */}
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#1C1C1E] dark:bg-[#2C2C2E] text-slate-200 dark:text-[#CDCBCA] shadow-2xs">
                  {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                </div>
                <div>
                  <span className="text-[0.82rem] font-medium text-slate-900 dark:text-[#F5F5F7] block leading-snug">
                    Dark Mode
                  </span>
                  <span className="text-[0.66rem] text-slate-500 dark:text-[#8E8C8B] block leading-tight">
                    {theme === "dark" ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>

              <SkillBridgeToggle
                checked={theme === "dark"}
                onChange={(isDark) => setThemeMode(isDark ? "dark" : "light")}
                aria-label="Toggle dark mode"
                accent="cyan"
              />
            </div>
          </div>
        </section>

        {/* Section 2: Language */}
        <section aria-labelledby="heading-language" className="space-y-1.5">
          <h3
            id="heading-language"
            className="text-[0.68rem] font-semibold text-slate-400 dark:text-[#8E8C8B] uppercase tracking-[0.05em] px-1"
          >
            {t.settings.language}
          </h3>

          <div className="rounded-[14px] border border-black/[0.06] dark:border-white/[0.07] bg-black/[0.025] dark:bg-[#1C1C1E] p-1">
            <div
              role="radiogroup"
              aria-label="Language selection"
              className="grid grid-cols-2 gap-1 rounded-[10px] bg-black/[0.04] dark:bg-[#262628] p-0.5"
            >
              {[
                { id: "en" as const, label: "English" },
                { id: "hi" as const, label: "हिंदी (Hindi)" },
              ].map(({ id, label }) => {
                const isSelected = language === id;
                return (
                  <button
                    key={id}
                    id={`settings-lang-${id}`}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setLanguage(id)}
                    className={`flex items-center justify-center gap-1.5 rounded-[7px] py-1.5 px-2 text-[0.78rem] transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-[#3A3A3C] text-slate-900 dark:text-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                        : "text-slate-500 dark:text-[#8E8C8B] hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{label}</span>
                    {isSelected && (
                      <Check size={12} strokeWidth={2.4} className="text-[#007BA7] dark:text-[#D41514]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Platform Shortcuts & Portals */}
        <section aria-labelledby="heading-shortcuts" className="space-y-1.5">
          <h3
            id="heading-shortcuts"
            className="text-[0.68rem] font-semibold text-slate-400 dark:text-[#8E8C8B] uppercase tracking-[0.05em] px-1"
          >
            {t.settings.shortcuts}
          </h3>

          <div className="rounded-[14px] border border-black/[0.06] dark:border-white/[0.07] bg-black/[0.025] dark:bg-[#1C1C1E] overflow-hidden">
            {onOpenSearch && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSearch();
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-[#007BA7]/10 text-[#007BA7] dark:bg-[#D41514]/15 dark:text-[#D41514]">
                      <Search size={14} />
                    </div>
                    <span className="text-[0.82rem] font-medium text-slate-900 dark:text-[#F5F5F7]">
                      {t.settings.openSearch}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <kbd className="font-sans px-1.5 py-0.5 rounded-[5px] text-[0.64rem] font-medium text-slate-400 dark:text-[#8E8C8B] bg-black/[0.04] dark:bg-white/[0.06]">
                      ⌘K
                    </kbd>
                    <ChevronRight size={13} className="text-slate-400 dark:text-[#636366]" />
                  </div>
                </button>
                <div className="border-t border-black/[0.05] dark:border-white/[0.06] ml-12" />
              </>
            )}

            {/* Portal Links */}
            <Link
              href="/student/login"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <GraduationCap size={14} />
                </div>
                <span className="text-[0.82rem] font-medium text-slate-900 dark:text-[#F5F5F7]">
                  {t.settings.student}
                </span>
              </div>
              <ChevronRight size={13} className="text-slate-400 dark:text-[#636366]" />
            </Link>

            <div className="border-t border-black/[0.05] dark:border-white/[0.06] ml-12" />

            <Link
              href="/academia/login"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Building2 size={14} />
                </div>
                <span className="text-[0.82rem] font-medium text-slate-900 dark:text-[#F5F5F7]">
                  {t.settings.academia}
                </span>
              </div>
              <ChevronRight size={13} className="text-slate-400 dark:text-[#636366]" />
            </Link>

            <div className="border-t border-black/[0.05] dark:border-white/[0.06] ml-12" />

            <Link
              href="/industry/login"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 text-left hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="grid h-7 w-7 place-items-center rounded-[7px] bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Briefcase size={14} />
                </div>
                <span className="text-[0.82rem] font-medium text-slate-900 dark:text-[#F5F5F7]">
                  {t.settings.industry}
                </span>
              </div>
              <ChevronRight size={13} className="text-slate-400 dark:text-[#636366]" />
            </Link>
          </div>
        </section>
      </div>

      {/* Apple-style Restrained Footer */}
      <div className="relative z-10 flex items-center justify-between border-t border-black/[0.06] dark:border-white/[0.07] bg-black/[0.02] dark:bg-white/[0.02] px-4 py-2.5 shrink-0 text-xs">
        <Link
          href="/legal"
          onClick={onClose}
          className="text-[0.72rem] text-slate-400 dark:text-[#8E8C8B] hover:text-slate-700 dark:hover:text-[#CDCBCA] transition-colors"
        >
          {t.settings.privacyTerms}
        </Link>

        <div className="flex items-center gap-2">
          {resetNotice && (
            <span className="inline-flex items-center gap-1 text-[0.66rem] font-medium text-emerald-600 dark:text-emerald-400 animate-in fade-in">
              <Check size={11} strokeWidth={2.4} />
              <span>{t.settings.resetConfirmed}</span>
            </span>
          )}

          <button
            type="button"
            id="settings-reset-defaults"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-[0.72rem] font-medium text-slate-500 dark:text-[#8E8C8B] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw size={11} />
            <span>{t.settings.resetDefaults}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
