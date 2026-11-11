"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Sparkles,
  Video,
} from "lucide-react";

/* ==========================================================================
   Type Definitions
   ========================================================================== */

export interface CalendarAttendee {
  id: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
  role?: string;
}

export type EventAccentColor =
  | "cyan"
  | "blue"
  | "pink"
  | "purple"
  | "emerald"
  | "amber"
  | "orange";

export interface CalendarEvent {
  id: string;
  title: string;
  subtitle?: string;
  startTime: string; // e.g. "10:00 AM" or "14:00"
  endTime?: string;   // e.g. "11:30 AM"
  date: string;      // YYYY-MM-DD
  category?: string;
  color?: EventAccentColor;
  attendees?: CalendarAttendee[];
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  badge?: string;
  locationOrLink?: string;
  isOnline?: boolean;
  metadata?: Record<string, any>;
}

export interface SkillBridgeCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  events: CalendarEvent[];
  onAddEvent?: (date: string) => void;
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
  className?: string;
  portalTheme?: "student" | "industry" | "academia" | "default";
  showAddButton?: boolean;
  addButtonLabel?: string;
  viewRangeDays?: 5 | 7;
  allowWeekNavigation?: boolean;
  compact?: boolean;
}

/* ==========================================================================
   Helper Utilities
   ========================================================================== */

function parseDateSafe(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 3) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  return new Date(dateStr);
}

function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const COLOR_MAP: Record<
  EventAccentColor,
  {
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    glow: string;
    dot: string;
  }
> = {
  cyan: {
    border: "border-l-[#00F0FF] dark:border-l-[#00F0FF] border-[#E3E3E3] dark:border-white/10",
    bg: "bg-[#00F0FF]/[0.04] dark:bg-[#00F0FF]/[0.08]",
    badgeBg: "bg-[#00F0FF]/15 text-[#0099AA] dark:text-[#00F0FF] border-[#00F0FF]/30",
    badgeText: "text-[#008899] dark:text-[#00F0FF]",
    glow: "rgba(0, 240, 255, 0.2)",
    dot: "bg-[#00F0FF]",
  },
  blue: {
    border: "border-l-[#007BA7] dark:border-l-[#007BA7] border-[#E3E3E3] dark:border-white/10",
    bg: "bg-[#007BA7]/[0.04] dark:bg-[#007BA7]/[0.08]",
    badgeBg: "bg-[#007BA7]/15 text-[#007BA7] dark:text-[#38BDF8] border-[#007BA7]/30",
    badgeText: "text-[#007BA7] dark:text-[#38BDF8]",
    glow: "rgba(0, 123, 167, 0.2)",
    dot: "bg-[#007BA7]",
  },
  pink: {
    border: "border-l-[#FF2D95] dark:border-l-[#FF2D95] border-[#E3E3E3] dark:border-white/10",
    bg: "bg-[#FF2D95]/[0.04] dark:bg-[#FF2D95]/[0.08]",
    badgeBg: "bg-[#FF2D95]/15 text-[#FF2D95] dark:text-[#FF66B2] border-[#FF2D95]/30",
    badgeText: "text-[#E0187D] dark:text-[#FF2D95]",
    glow: "rgba(255, 45, 149, 0.22)",
    dot: "bg-[#FF2D95]",
  },
  purple: {
    border: "border-l-[#743BFF] dark:border-l-[#743BFF] border-[#E3E3E3] dark:border-white/10",
    bg: "bg-[#743BFF]/[0.04] dark:bg-[#743BFF]/[0.08]",
    badgeBg: "bg-[#743BFF]/15 text-[#743BFF] dark:text-[#A78BFA] border-[#743BFF]/30",
    badgeText: "text-[#743BFF] dark:text-[#A78BFA]",
    glow: "rgba(116, 59, 255, 0.2)",
    dot: "bg-[#743BFF]",
  },
  emerald: {
    border: "border-l-[#10B981] dark:border-l-[#10B981] border-[#E3E3E3] dark:border-white/10",
    bg: "bg-[#10B981]/[0.04] dark:bg-[#10B981]/[0.08]",
    badgeBg: "bg-[#10B981]/15 text-[#059669] dark:text-[#34D399] border-[#10B981]/30",
    badgeText: "text-[#059669] dark:text-[#34D399]",
    glow: "rgba(16, 185, 129, 0.2)",
    dot: "bg-[#10B981]",
  },
  amber: {
    border: "border-l-[#F59E0B] dark:border-l-[#F59E0B] border-[#E3E3E3] dark:border-white/10",
    bg: "bg-[#F59E0B]/[0.04] dark:bg-[#F59E0B]/[0.08]",
    badgeBg: "bg-[#F59E0B]/15 text-[#D97706] dark:text-[#FBBF24] border-[#F59E0B]/30",
    badgeText: "text-[#D97706] dark:text-[#FBBF24]",
    glow: "rgba(245, 158, 11, 0.2)",
    dot: "bg-[#F59E0B]",
  },
  orange: {
    border: "border-l-[#FF6A00] dark:border-l-[#FF6A00] border-[#E3E3E3] dark:border-white/10",
    bg: "bg-[#FF6A00]/[0.04] dark:bg-[#FF6A00]/[0.08]",
    badgeBg: "bg-[#FF6A00]/15 text-[#EA580C] dark:text-[#FB923C] border-[#FF6A00]/30",
    badgeText: "text-[#EA580C] dark:text-[#FB923C]",
    glow: "rgba(255, 106, 0, 0.2)",
    dot: "bg-[#FF6A00]",
  },
};

/* ==========================================================================
   1. Subcomponent: Transitions.dev Soft Text Cross-Blur Swap
   Reference: transitions-dev 34-text-swap-soft
   ========================================================================== */

interface TextSoftSwapProps {
  text: string;
  className?: string;
  as?: "span" | "h2" | "h3" | "p" | "div";
}

export function TextSoftSwap({ text, className = "", as = "span" }: TextSoftSwapProps) {
  const [currentText, setCurrentText] = useState(text);
  const [oldText, setOldText] = useState<string | null>(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (text === currentText) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    setOldText(currentText);
    setCurrentText(text);
    setIsSwapping(true);

    timerRef.current = setTimeout(() => {
      setIsSwapping(false);
      setOldText(null);
    }, 220);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, currentText]);

  const Component = as as any;

  return (
    <Component className={`t-text-soft ${isSwapping ? "is-swapping" : ""} ${className}`}>
      {isSwapping && oldText !== null && (
        <span className="t-text-soft-old" aria-hidden="true">
          {oldText}
        </span>
      )}
      <span className={isSwapping ? "t-text-soft-new" : ""}>{currentText}</span>
    </Component>
  );
}

/* ==========================================================================
   2. Subcomponent: Transitions.dev Avatar Group with Hover Lift & Falloff
   Reference: transitions-dev 11-avatar-group-hover
   ========================================================================== */

interface CalendarAvatarGroupProps {
  attendees: CalendarAttendee[];
  maxVisible?: number;
}

export function CalendarAvatarGroup({ attendees, maxVisible = 4 }: CalendarAvatarGroupProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  const visibleAttendees = useMemo(
    () => attendees.slice(0, maxVisible),
    [attendees, maxVisible]
  );
  const overflowCount = attendees.length - maxVisible;

  const setShifts = useCallback((activeIdx: number | null, phase: "in" | "out") => {
    if (!rootRef.current) return;
    const avatars = Array.from(rootRef.current.querySelectorAll<HTMLElement>(".t-avatar"));
    if (avatars.length === 0) return;

    const cs = getComputedStyle(document.documentElement);
    const num = (name: string, fallback: number) => {
      const v = parseFloat(cs.getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };
    const ease = (name: string, fallback: string) =>
      cs.getPropertyValue(name).trim() || fallback;

    const lift = num("--avatar-lift", -4);
    const falloff = num("--avatar-falloff", 0.45);
    const scale = num("--avatar-scale", 1.05);
    const tf =
      phase === "out"
        ? ease("--avatar-ease-out", "cubic-bezier(0.34, 3.85, 0.64, 1)")
        : ease("--avatar-ease-in", "cubic-bezier(0.22, 1, 0.36, 1)");

    avatars.forEach((el, i) => {
      el.style.transitionTimingFunction = tf;
      if (activeIdx === null) {
        el.style.setProperty("--shift", "0px");
        el.style.setProperty("--scale-active", "1");
        return;
      }
      const distance = Math.abs(i - activeIdx);
      const computedLift = (lift * Math.pow(falloff, distance)).toFixed(3);
      el.style.setProperty("--shift", `${computedLift}px`);
      el.style.setProperty("--scale-active", i === activeIdx ? String(scale) : "1");
    });
  }, []);

  if (attendees.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="t-avatar-group -space-x-2"
      onMouseLeave={() => setShifts(null, "out")}
      aria-label={`${attendees.length} attendees`}
    >
      {visibleAttendees.map((att, idx) => {
        const initials =
          att.initials ||
          att.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

        return (
          <div
            key={att.id || idx}
            className="t-avatar relative inline-block group"
            onMouseEnter={() => setShifts(idx, "in")}
            title={`${att.name}${att.role ? ` · ${att.role}` : ""}`}
          >
            {att.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={att.avatarUrl}
                alt={att.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-[#161822] shadow-sm bg-neutral-200 dark:bg-neutral-800"
              />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-tr from-[#007BA7] to-[#FF2D95] ring-2 ring-white dark:ring-[#161822] shadow-sm select-none">
                {initials}
              </div>
            )}
          </div>
        );
      })}

      {overflowCount > 0 && (
        <div
          className="t-avatar relative inline-block group"
          onMouseEnter={() => setShifts(visibleAttendees.length, "in")}
          title={`+${overflowCount} more participants`}
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-[#686868] dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 ring-2 ring-white dark:ring-[#161822] shadow-sm select-none">
            +{overflowCount}
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   3. Main Component: SkillBridgeCalendar
   ========================================================================== */

export default function SkillBridgeCalendar({
  selectedDate,
  onSelectDate,
  events,
  onAddEvent,
  title,
  subtitle,
  emptyMessage = "No scheduled items for this day",
  className = "",
  portalTheme = "default",
  showAddButton = true,
  addButtonLabel = "Add Task / Event",
  viewRangeDays = 7,
  allowWeekNavigation = true,
  compact = false,
}: SkillBridgeCalendarProps) {
  // Base reference date from selectedDate
  const selectedDateTime = useMemo(() => parseDateSafe(selectedDate), [selectedDate]);

  // Base Monday or start day for week view
  const [weekOffset, setWeekOffset] = useState(0);

  // Today reference string
  const todayStr = useMemo(() => formatDateISO(new Date()), []);

  // Direction tracking for schedule slide animation
  const prevDateRef = useRef(selectedDate);
  const [slideDirection, setSlideDirection] = useState<"forward" | "backward" | null>(null);

  // Tabs pill ref and tabs container ref
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Week days calculation
  const weekDays = useMemo(() => {
    const base = new Date();
    // Offset by weekOffset
    base.setDate(base.getDate() + weekOffset * 7);

    // Calculate start of week (Monday)
    const dayOfWeek = base.getDay(); // 0 is Sunday
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const startOfWeek = new Date(base);
    startOfWeek.setDate(base.getDate() - distanceToMonday);

    const days = [];
    const labels7 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const labels5 = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const labels = viewRangeDays === 5 ? labels5 : labels7;

    for (let i = 0; i < viewRangeDays; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const iso = formatDateISO(d);

      // Check if events exist on this date
      const dayEvents = events.filter((ev) => ev.date === iso);
      const isToday = iso === todayStr;
      const isSelected = iso === selectedDate;

      days.push({
        iso,
        dateNum: d.getDate(),
        dayLabel: labels[i],
        dayFull: d.toLocaleDateString("en-US", { weekday: "long" }),
        monthName: d.toLocaleDateString("en-US", { month: "short" }),
        isToday,
        isSelected,
        eventCount: dayEvents.length,
        hasEvents: dayEvents.length > 0,
      });
    }

    return days;
  }, [weekOffset, viewRangeDays, events, todayStr, selectedDate]);

  // Direction computation on date switch
  useEffect(() => {
    if (selectedDate === prevDateRef.current) return;

    const prev = parseDateSafe(prevDateRef.current).getTime();
    const current = parseDateSafe(selectedDate).getTime();

    setSlideDirection(current >= prev ? "forward" : "backward");
    prevDateRef.current = selectedDate;

    const timer = setTimeout(() => {
      setSlideDirection(null);
    }, 280);

    return () => clearTimeout(timer);
  }, [selectedDate]);

  // Synchronize Sliding Pill Position (Transitions.dev 16-tabs-sliding)
  const updatePill = useCallback((smooth = true) => {
    const pill = pillRef.current;
    if (!pill) return;

    const activeTab = tabRefs.current.get(selectedDate);
    if (!activeTab) {
      pill.style.width = "0px";
      pill.style.opacity = "0";
      return;
    }

    if (!smooth) {
      pill.style.transition = "none";
    }

    const left = activeTab.offsetLeft;
    const width = activeTab.offsetWidth;

    pill.style.transform = `translateX(${left}px)`;
    pill.style.width = `${width}px`;
    pill.style.opacity = "1";

    if (!smooth) {
      // Force reflow and restore transition
      void pill.offsetHeight;
      pill.style.transition = "";
    }
  }, [selectedDate]);

  useLayoutEffect(() => {
    // Snap on mount
    updatePill(false);
  }, [updatePill]);

  useEffect(() => {
    // Animate on selectedDate change
    updatePill(true);

    const handleResize = () => updatePill(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedDate, updatePill, weekDays]);

  // Filter events for the currently selected date
  const selectedDayEvents = useMemo(() => {
    return events.filter((ev) => ev.date === selectedDate);
  }, [events, selectedDate]);

  // Header texts
  const selectedDayHeader = useMemo(() => {
    const d = parseDateSafe(selectedDate);
    const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
    const isToday = selectedDate === todayStr;
    return isToday ? `Today (${dayName})` : dayName;
  }, [selectedDate, todayStr]);

  const selectedDateHeader = useMemo(() => {
    const d = parseDateSafe(selectedDate);
    const formatted = d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const count = selectedDayEvents.length;
    const countLabel = count === 1 ? "1 item scheduled" : `${count} items scheduled`;
    return `${formatted} · ${countLabel}`;
  }, [selectedDate, selectedDayEvents.length]);

  const monthYearLabel = useMemo(() => {
    const d = parseDateSafe(selectedDate);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [selectedDate]);

  // Navigation handlers
  const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
  const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
  const handleJumpToday = () => {
    setWeekOffset(0);
    onSelectDate(todayStr);
  };

  return (
    <div
      className={`relative flex flex-col rounded-3xl bg-white dark:bg-[#111318] text-[#171717] dark:text-white p-5 sm:p-6 shadow-sm dark:shadow-xl border border-[#E3E3E3] dark:border-white/10 transition-all duration-200 select-none ${className}`}
      data-testid="skillbridge-calendar-day-card"
    >
      {/* 1. Header Section with Soft Text Cross-Blur Swap */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E3E3E3] dark:border-white/10 gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#686868] dark:text-neutral-400">
              {title || "Calendar & Day Schedule"}
            </span>
            {selectedDate === todayStr && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase bg-[#00F0FF]/15 text-[#008899] dark:text-[#00F0FF] border border-[#00F0FF]/30">
                Live Today
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-col">
            <TextSoftSwap
              text={selectedDayHeader}
              as="h2"
              className="text-lg sm:text-xl font-extrabold text-[#171717] dark:text-white tracking-tight"
            />
            <TextSoftSwap
              text={selectedDateHeader}
              as="p"
              className="text-xs font-medium text-[#686868] dark:text-neutral-400 mt-0.5"
            />
          </div>
        </div>

        {/* Top Actions: Today Jump, Prev/Next Week & Quick Add */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {allowWeekNavigation && (
            <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-white/[0.04] p-0.5 border border-[#E3E3E3] dark:border-white/10">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="t-btn-press p-1.5 rounded-lg text-[#686868] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition"
                aria-label="Previous week"
                title="Previous week"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleJumpToday}
                className="t-btn-press px-2 py-1 text-[11px] font-semibold text-[#686868] dark:text-neutral-300 hover:text-[#171717] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 rounded-lg transition"
                title="Go to Today"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNextWeek}
                className="t-btn-press p-1.5 rounded-lg text-[#686868] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition"
                aria-label="Next week"
                title="Next week"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {showAddButton && onAddEvent && (
            <button
              type="button"
              onClick={() => onAddEvent(selectedDate)}
              className="t-btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#007BA7] to-[#FF2D95] shadow-sm hover:brightness-110 active:scale-95 transition"
              aria-label={addButtonLabel}
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span className="hidden sm:inline">{addButtonLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Horizontal Week Strip with Sliding Active Pill (Transitions.dev 16-tabs-sliding) */}
      <div className="py-3.5 border-b border-[#E3E3E3] dark:border-white/10">
        <div
          ref={tabsContainerRef}
          className="t-tabs w-full justify-between"
          role="tablist"
          aria-label="Week day selection"
        >
          {/* Hardware-accelerated sliding tab pill */}
          <span
            ref={pillRef}
            className="t-tabs-pill border border-[#007BA7]/30 dark:border-[#00F0FF]/30 bg-gradient-to-r from-[#007BA7]/15 to-[#FF2D95]/10 dark:from-[#00F0FF]/20 dark:to-[#FF2D95]/15 shadow-sm"
            aria-hidden="true"
          />

          {weekDays.map((day) => {
            const isSelected = day.isSelected;
            return (
              <button
                key={day.iso}
                ref={(el) => {
                  if (el) tabRefs.current.set(day.iso, el);
                  else tabRefs.current.delete(day.iso);
                }}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectDate(day.iso)}
                className={`t-tab flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition duration-150 ${
                  isSelected
                    ? "font-bold text-[#171717] dark:text-white"
                    : "text-[#686868] dark:text-neutral-400 hover:text-[#171717] dark:hover:text-white"
                }`}
                data-date={day.iso}
              >
                <span className="text-[10px] tracking-wide uppercase">{day.dayLabel}</span>
                <span className="text-sm sm:text-base font-extrabold mt-0.5 leading-none">
                  {day.dateNum}
                </span>

                {/* Event count or status dot indicator */}
                <div className="h-1.5 mt-1 flex items-center justify-center">
                  {day.hasEvents ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? "bg-[#FF2D95] ring-2 ring-[#FF2D95]/30"
                          : day.isToday
                          ? "bg-[#00F0FF]"
                          : "bg-neutral-400 dark:bg-neutral-600"
                      }`}
                    />
                  ) : day.isToday ? (
                    <span className="w-1 h-1 rounded-full bg-[#007BA7] dark:bg-[#00F0FF]" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Direction-Aware Day Schedule (Transitions.dev 08-page-side-by-side) */}
      <div className="t-schedule-viewport flex-1 pt-3.5 min-h-[220px]">
        <div
          className={`t-schedule-slide flex flex-col gap-2.5 ${
            slideDirection === "forward"
              ? "is-entering-forward"
              : slideDirection === "backward"
              ? "is-entering-backward"
              : ""
          }`}
          key={selectedDate}
        >
          {selectedDayEvents.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-dashed border-[#E3E3E3] dark:border-white/10 bg-neutral-50/50 dark:bg-white/[0.01]">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr from-[#007BA7]/10 to-[#FF2D95]/10 text-[#007BA7] dark:text-[#00F0FF] mb-3">
                <CalendarIcon size={22} className="opacity-80" />
              </div>
              <h3 className="text-sm font-bold text-[#171717] dark:text-white">
                {emptyMessage}
              </h3>
              <p className="text-xs text-[#686868] dark:text-neutral-400 mt-1 max-w-xs">
                No meetings, tasks, or deadlines registered for {selectedDayHeader}.
              </p>
              {showAddButton && onAddEvent && (
                <button
                  type="button"
                  onClick={() => onAddEvent(selectedDate)}
                  className="t-btn-press mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#007BA7] dark:text-[#00F0FF] bg-[#007BA7]/10 dark:bg-[#00F0FF]/10 hover:bg-[#007BA7]/20 dark:hover:bg-[#00F0FF]/20 border border-[#007BA7]/20 dark:border-[#00F0FF]/20 transition"
                >
                  <Plus size={14} />
                  <span>Create Item for {selectedDayHeader}</span>
                </button>
              )}
            </div>
          ) : (
            /* Scheduled Event Tiles */
            selectedDayEvents.map((event) => {
              const colorTheme = COLOR_MAP[event.color || "blue"];

              return (
                <div
                  key={event.id}
                  className={`t-btn-press group relative flex flex-col gap-2.5 p-3.5 sm:p-4 rounded-2xl border border-l-4 ${colorTheme.border} ${colorTheme.bg} transition-all duration-200 hover:shadow-md hover:border-opacity-80`}
                  style={{
                    boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
                  }}
                  data-testid={`calendar-event-${event.id}`}
                >
                  {/* Top Row: Time, Category & Action Button */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Time Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#686868] dark:text-neutral-300">
                        <Clock size={12} className={colorTheme.badgeText} />
                        {event.startTime}
                        {event.endTime ? ` – ${event.endTime}` : ""}
                      </span>

                      {/* Category Badge */}
                      {event.category && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${colorTheme.badgeBg}`}
                        >
                          {event.category}
                        </span>
                      )}

                      {/* Custom Badge */}
                      {event.badge && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-white/10 text-[#171717] dark:text-white border border-[#E3E3E3] dark:border-white/10">
                          {event.badge}
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {(event.actionLabel || event.actionHref || event.onAction) && (
                      event.actionHref ? (
                        <a
                          href={event.actionHref}
                          className="t-btn-press inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-[#171717] dark:text-white bg-white dark:bg-white/10 border border-[#E3E3E3] dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-white/20 transition shadow-sm"
                        >
                          <span>{event.actionLabel || "View"}</span>
                          <ExternalLink size={11} className="opacity-70" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={event.onAction}
                          className="t-btn-press inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-[#171717] dark:text-white bg-white dark:bg-white/10 border border-[#E3E3E3] dark:border-white/15 hover:bg-neutral-100 dark:hover:bg-white/20 transition shadow-sm"
                        >
                          <span>{event.actionLabel || "Open"}</span>
                        </button>
                      )
                    )}
                  </div>

                  {/* Middle Row: Title & Subtitle */}
                  <div>
                    <h4 className="text-sm font-bold text-[#171717] dark:text-white tracking-tight group-hover:text-[#007BA7] dark:group-hover:text-[#00F0FF] transition-colors">
                      {event.title}
                    </h4>

                    {event.subtitle && (
                      <p className="text-xs text-[#686868] dark:text-neutral-400 mt-0.5 line-clamp-1">
                        {event.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Bottom Row: Location & Attendees */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E3E3E3]/60 dark:border-white/5">
                    {event.locationOrLink ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-[#686868] dark:text-neutral-400 truncate">
                        {event.isOnline ? (
                          <Video size={12} className="text-[#00F0FF] shrink-0" />
                        ) : (
                          <MapPin size={12} className="text-[#FF2D95] shrink-0" />
                        )}
                        <span className="truncate">{event.locationOrLink}</span>
                      </div>
                    ) : (
                      <span />
                    )}

                    {/* Attendee Avatar Group with Power-Falloff Hover Lift */}
                    {event.attendees && event.attendees.length > 0 && (
                      <CalendarAvatarGroup attendees={event.attendees} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
