"use client";

import React, { useEffect, useState } from "react";
import { Command, X, Keyboard, Search, Settings, PanelLeft, ArrowUp, ArrowDown, CornerDownLeft } from "lucide-react";

interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
  }[];
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    category: "Navigation & Search",
    items: [
      { keys: ["⌘", "K"], description: "Open Command Palette / Global Search" },
      { keys: ["⌘", "/"], description: "Open Keyboard Shortcuts reference" },
      { keys: ["⌘", ","], description: "Open Platform Preferences & Settings" },
      { keys: ["⌘", "B"], description: "Toggle Sidebar collapse/expand" },
    ],
  },
  {
    category: "Modal & List Controls",
    items: [
      { keys: ["↑"], description: "Navigate to previous item in lists" },
      { keys: ["↓"], description: "Navigate to next item in lists" },
      { keys: ["↵"], description: "Execute selected action / open link" },
      { keys: ["Esc"], description: "Close active modal, drawer, or palette" },
    ],
  },
  {
    category: "Data & Form Actions",
    items: [
      { keys: ["Tab"], description: "Focus next input or interactive field" },
      { keys: ["Shift", "Tab"], description: "Focus previous input field" },
      { keys: ["Auto"], description: "Auto-saves profiles & planners on pause" },
    ],
  },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/12 bg-white/95 dark:bg-[#0c101d]/95 p-6 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#007BA7]/10 dark:bg-sb-cyan/10 text-[#007BA7] dark:text-sb-cyan">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quick productivity controls across SkillBridge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.category} className="space-y-2.5">
              <h4 className="text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.category}
              </h4>
              <div className="space-y-2">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {item.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kidx) => (
                        <kbd
                          key={kidx}
                          className="min-w-[24px] h-6 px-1.5 grid place-items-center text-[0.7rem] font-bold font-mono rounded-md bg-white dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-700 dark:text-slate-200 shadow-xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[0.74rem] text-slate-500 dark:text-slate-400">
          <span>Shortcuts adapt automatically to Windows (Ctrl) and Mac (⌘).</span>
          <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[0.68rem] font-mono">
            Esc to close
          </kbd>
        </div>
      </div>
    </div>
  );
}

/**
 * Global keyboard listener hook that opens shortcuts modal on Cmd+/ or Ctrl+/
 */
export function useKeyboardShortcutsListener() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input / textarea / contenteditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === "/" && !isInput) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return {
    isShortcutsOpen: isOpen,
    openShortcuts: () => setIsOpen(true),
    closeShortcuts: () => setIsOpen(false),
  };
}
