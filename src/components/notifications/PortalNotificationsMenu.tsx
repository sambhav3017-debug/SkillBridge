"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { NotificationBellButton } from "./NotificationBellButton";

export interface NotificationItem {
  id: string;
  text: string;
  href: string;
}

export interface PortalNotificationsMenuProps {
  title: string;
  items: NotificationItem[];
  portalVariant?: "student" | "academia" | "industry";
  ariaLabel?: string;
  emptyMessage?: string;
  className?: string;
}

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export function PortalNotificationsMenu({
  title,
  items,
  portalVariant = "student",
  ariaLabel,
  emptyMessage = "You're all caught up.",
  className = "",
}: PortalNotificationsMenuProps) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const ref = useDismiss(open, () => setOpen(false));

  // Compute unread items
  const unreadItems = useMemo(
    () => items.filter((item) => !readIds.has(item.id)),
    [items, readIds]
  );

  const unreadCount = unreadItems.length;

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReadIds((prev) => {
      const next = new Set(prev);
      items.forEach((item) => next.add(item.id));
      return next;
    });
  };

  const handleItemClick = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setOpen(false);
  };

  // Portal hover styles for items
  const itemHoverStyle =
    portalVariant === "academia"
      ? "hover:bg-[#743BFF]/10 hover:text-[#743BFF] dark:hover:bg-[#743BFF]/15 dark:hover:text-[#B57CFF]"
      : portalVariant === "industry"
      ? "hover:bg-[#FF2D95]/10 hover:text-[#FF2D95] dark:hover:bg-[#FF2D95]/15 dark:hover:text-[#FF2D95]"
      : "hover:bg-[#007BA7]/10 hover:text-[#007BA7] dark:hover:bg-cyan-500/15 dark:hover:text-[#19B8E6]";

  return (
    <div className={`relative ${className}`} ref={ref}>
      <NotificationBellButton
        count={unreadCount}
        isOpen={open}
        portalVariant={portalVariant}
        ariaLabel={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
      />

      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="glass absolute right-0 top-12 z-50 w-80 max-w-[88vw] rounded-2xl border border-slate-200/90 dark:border-[rgba(205,203,202,0.18)] bg-white/95 dark:bg-[#121212]/95 p-2 shadow-2xl backdrop-blur-2xl animate-dash-fade"
        >
          {/* Header with Title & Mark All As Read */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-white/[0.06] mb-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {title}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck size={13} className="text-emerald-500" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          {unreadCount === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {emptyMessage}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                No new alerts requiring your attention.
              </p>
            </div>
          ) : (
            <ul className="max-h-72 overflow-y-auto space-y-1 py-1">
              {unreadItems.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => handleItemClick(n.id)}
                    className={`block rounded-xl px-3 py-2.5 text-xs leading-relaxed text-slate-700 dark:text-slate-200 transition-colors ${itemHoverStyle}`}
                  >
                    {n.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default PortalNotificationsMenu;
