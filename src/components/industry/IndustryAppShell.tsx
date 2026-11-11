"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";
import {
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CalendarClock,
  Compass,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import DashboardPageTransition from "@/components/motion/DashboardPageTransition";
import GlobalSearchModal from "@/components/search/GlobalSearchModal";
import PortalNotificationsMenu from "@/components/notifications/PortalNotificationsMenu";
import IndustryAmbientBackground from "./IndustryAmbientBackground";
import { useIndustry } from "./IndustryProvider";
import { ConfirmModal } from "@/components/student/ui";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";

const NAV = [
  { href: "/industry/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/industry/company-profile", label: "Company Profile", icon: Building2 },
  { href: "/industry/jobs", label: "Jobs & Internships", icon: Briefcase },
  { href: "/industry/applicants", label: "Applicants", icon: Users },
  { href: "/industry/talent", label: "Discover Talent", icon: Compass },
  { href: "/industry/messages", label: "Messages", icon: MessageSquare },
  { href: "/industry/interviews", label: "Interviews", icon: CalendarClock },
  { href: "/industry/events", label: "Events & Campus Hiring", icon: Calendar },
  { href: "/industry/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/industry/team", label: "Team Members", icon: Shield },
  { href: "/industry/settings", label: "Settings", icon: Settings },
] as const;

const SIDEBAR_STORAGE_KEY = "skillbridge-industry-sidebar-collapsed";

function subscribeSidebar(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("skillbridge-industry-sidebar-toggle", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("skillbridge-industry-sidebar-toggle", callback);
  };
}

function getSidebarSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getSidebarServerSnapshot(): boolean {
  return false;
}

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function SidebarNav({
  collapsed = false,
  onNavigate,
  onLogout,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { data } = useIndustry();
  const prefersReduced = usePrefersReducedMotion();

  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const getActiveHrefFromPath = useCallback((path: string): string => {
    if (NAV.some((n) => n.href === path)) return path;
    const prefixMatch = NAV.find((n) => n.href !== "/industry/dashboard" && path.startsWith(n.href));
    return prefixMatch ? prefixMatch.href : "/industry/dashboard";
  }, []);

  const [activeHref, setActiveHref] = useState<string>(() => getActiveHrefFromPath(pathname));
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const hoveredHrefRef = useRef<string | null>(null);

  useEffect(() => {
    hoveredHrefRef.current = hoveredHref;
  }, [hoveredHref]);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveHref(getActiveHrefFromPath(pathname));
  }

  const [pill, setPill] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
    opacity: number;
    isHover: boolean;
    targetHref: string;
    isAnimated: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0,
    isHover: false,
    targetHref: getActiveHrefFromPath(pathname),
    isAnimated: false,
  });

  const unreadCount = data.conversations.filter((c) => c.unreadByRecruiter).length;
  const activeJobs = data.jobs.filter((j) => j.status === "Published").length;
  const counts: Record<string, number> = {
    "/industry/jobs": activeJobs,
    "/industry/applicants": data.applicants.length,
    "/industry/messages": unreadCount,
    "/industry/interviews": data.interviews.filter((iv) => iv.status === "Scheduled" || iv.status === "Rescheduled").length,
  };

  const movePillTo = useCallback(
    (href: string, isHover = false, animated = true) => {
      const container = listRef.current;
      const target = itemRefs.current.get(href);
      if (!container || !target) {
        setPill((prev) => ({ ...prev, opacity: 0 }));
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();

      const top = Math.round(targetRect.top - containerRect.top + container.scrollTop);
      const left = Math.round(targetRect.left - containerRect.left + container.scrollLeft);
      const width = Math.round(targetRect.width);
      const height = Math.round(targetRect.height);

      setPill({
        top,
        left,
        width,
        height,
        opacity: 1,
        isHover,
        targetHref: href,
        isAnimated: animated && !prefersReduced,
      });
    },
    [prefersReduced]
  );

  useEffect(() => {
    if (!hoveredHref) {
      movePillTo(activeHref, false, pill.isAnimated);
    }
  }, [activeHref, hoveredHref, movePillTo, pill.isAnimated, collapsed]);

  useEffect(() => {
    movePillTo(activeHref, false, false);
    const t1 = setTimeout(() => {
      movePillTo(activeHref, false, false);
      setPill((prev) => ({ ...prev, isAnimated: !prefersReduced }));
    }, 40);
    const t2 = setTimeout(() => {
      movePillTo(activeHref, false, false);
      setPill((prev) => ({ ...prev, isAnimated: !prefersReduced }));
    }, 180);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeHref, movePillTo, prefersReduced, collapsed]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const onUpdate = () => {
      const target = hoveredHrefRef.current || activeHref;
      movePillTo(target, Boolean(hoveredHrefRef.current), false);
    };

    const observer = new ResizeObserver(onUpdate);
    observer.observe(container);
    window.addEventListener("resize", onUpdate, { passive: true });

    const scrollParent = container.closest(".overflow-y-auto") || container;
    scrollParent.addEventListener("scroll", onUpdate, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onUpdate);
      scrollParent.removeEventListener("scroll", onUpdate);
    };
  }, [activeHref, movePillTo, collapsed]);

  const handleItemPointerEnter = (href: string) => {
    hoveredHrefRef.current = href;
    setHoveredHref(href);
    movePillTo(href, true, true);
  };

  const handleNavPointerLeave = () => {
    hoveredHrefRef.current = null;
    setHoveredHref(null);
    movePillTo(activeHref, false, true);
  };

  const handleItemFocus = (href: string) => {
    hoveredHrefRef.current = href;
    setHoveredHref(href);
    movePillTo(href, true, true);
  };

  const handleItemBlur = (e: React.FocusEvent) => {
    if (listRef.current && !listRef.current.contains(e.relatedTarget as Node)) {
      hoveredHrefRef.current = null;
      setHoveredHref(null);
      movePillTo(activeHref, false, true);
    }
  };

  return (
    <nav aria-label="Industry workspace navigation" className="flex flex-1 flex-col justify-between">
      <ul ref={listRef} onPointerLeave={handleNavPointerLeave} className="relative space-y-1">
        {/* ONE Shared Sliding Liquid Glass Active & Hover Indicator Pill */}
        <div
          className={`sidebar-liquid-glass-pill ${pill.isHover ? "is-hovered" : "is-active"} ${
            pill.isAnimated ? "is-animated" : ""
          }`}
          style={{
            transform: `translate3d(0, ${pill.top}px, 0)`,
            left: `${pill.left}px`,
            width: `${pill.width}px`,
            height: `${pill.height}px`,
            opacity: pill.opacity,
          }}
          aria-hidden="true"
        >
          {/* Luminous accent bar on the leading edge */}
          <span
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full transition-opacity duration-200 ${
              collapsed ? "left-1 h-3 w-1" : "left-1.5 h-4 w-1"
            } bg-sb-cyan shadow-[0_0_8px_rgba(25,184,230,0.9)] light:bg-[#FF6A00] light:shadow-[0_0_8px_rgba(255,106,0,0.5)] ${
              pill.isHover && pill.targetHref !== activeHref ? "opacity-0" : "opacity-100"
            }`}
            aria-hidden="true"
          />
          {/* Subtle specular top highlight reflection */}
          <span
            className="pointer-events-none absolute inset-x-2 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent light:via-white/80"
            aria-hidden="true"
          />
        </div>

        {/* 11 Dedicated Recruiter Navigation Options */}
        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = activeHref === href;
          const isHovered = hoveredHref === href;
          const count = counts[href] ?? 0;
          return (
            <li key={href} className="relative z-10">
              <Link
                ref={(el) => {
                  if (el) itemRefs.current.set(href, el);
                  else itemRefs.current.delete(href);
                }}
                href={href}
                onPointerEnter={() => handleItemPointerEnter(href)}
                onFocus={() => handleItemFocus(href)}
                onBlur={handleItemBlur}
                onClick={() => {
                  hoveredHrefRef.current = null;
                  setActiveHref(href);
                  setHoveredHref(null);
                  movePillTo(href, false, true);
                  onNavigate?.();
                }}
                className={`group relative flex items-center rounded-xl text-xs sm:text-[13px] font-medium outline-none select-none transition-all duration-200 border border-transparent ${
                  collapsed
                    ? "justify-center h-11 w-11 mx-auto p-0"
                    : "gap-3 px-3.5 py-2.5"
                } ${
                  isActive
                    ? "text-white font-semibold light:text-[#FF6A00] light:bg-orange-500/[0.10] shadow-sm"
                    : isHovered
                    ? "text-white font-medium light:text-[#171717] light:bg-orange-500/[0.05]"
                    : "text-sb-muted light:text-[#686868] light:hover:text-[#171717]"
                } focus-visible:ring-2 focus-visible:ring-sb-cyan/70 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-bg)]`}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
              >
                {/* Persistent active indicator bar when cursor is exploring other navigation options */}
                {isActive && hoveredHref && hoveredHref !== activeHref && (
                  <span
                    className={`pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full bg-sb-cyan/85 shadow-[0_0_6px_rgba(25,184,230,0.7)] light:bg-[#FF6A00]/85 light:shadow-[0_0_6px_rgba(255,106,0,0.5)] transition-opacity duration-200 ${
                      collapsed ? "left-1 h-3 w-1" : "left-1.5 h-4 w-1"
                    }`}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-center justify-center shrink-0">
                  <Icon
                    size={collapsed ? 20 : 16}
                    aria-hidden="true"
                    className={`transition-all duration-200 ${
                      isActive
                        ? "text-sb-cyan scale-105 light:text-[#FF6A00]"
                        : isHovered
                        ? "text-sb-cyan scale-105 light:text-[#FF6A00]"
                        : "text-sb-muted/80 light:text-[#686868] group-hover:text-sb-cyan light:group-hover:text-[#FF6A00]"
                    }`}
                  />
                  {/* Collapsed mini indicator badge on icon */}
                  {collapsed && count > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF6A00] dark:bg-sb-cyan text-white dark:text-[#0D1117] text-[10px] font-extrabold px-1 shadow-sm"
                      aria-label={`${count} items`}
                    >
                      {count}
                    </span>
                  )}
                </div>

                {!collapsed && (
                  <>
                    <span className="flex-1 truncate">{label}</span>
                    {count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors ${
                          isActive
                            ? "border border-sb-cyan/35 bg-sb-cyan/20 text-sb-cyan light:border-[#FF6A00]/25 light:bg-[#FF6A00]/12 light:text-[#FF6A00]"
                            : isHovered
                            ? "border border-white/20 bg-white/10 text-white light:border-[#FF6A00]/20 light:bg-[#FF6A00]/10 light:text-[#FF6A00]"
                            : "border border-white/10 bg-white/[0.06] text-sb-muted light:border-black/5 light:bg-black/[0.04] light:text-[#686868]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed Hover / Focus Floating Glass Tooltip */}
                {collapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 hidden group-hover:flex group-focus-visible:flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border transition-all animate-in fade-in-0 zoom-in-95 duration-150 bg-white/95 dark:bg-[#0D1117]/95 text-[#171717] dark:text-white border-[#E3E3E3] dark:border-white/10 backdrop-blur-xl"
                  >
                    <span>{label}</span>
                    {count > 0 && (
                      <span className="rounded-full px-1.5 py-0.2 text-[10px] font-bold bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/20 dark:text-sb-cyan">
                        {count}
                      </span>
                    )}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#E3E3E3] dark:border-r-white/10" />
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Logout Action Button */}
      {collapsed ? (
        <div className="pt-3 border-t border-[var(--glass-border)] light:border-[#E3E3E3] mt-3 flex justify-center">
          <button
            type="button"
            onClick={onLogout}
            aria-label="Logout"
            className="group/logout relative grid h-11 w-11 place-items-center rounded-xl text-sb-muted hover:text-sb-pink hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut size={18} aria-hidden="true" />
            <div
              role="tooltip"
              className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 hidden group-hover/logout:flex items-center whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border transition-all animate-in fade-in-0 zoom-in-95 duration-150 bg-white/95 dark:bg-[#0D1117]/95 text-rose-500 border-[#E3E3E3] dark:border-white/10 backdrop-blur-xl"
            >
              <span>Logout</span>
              <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#E3E3E3] dark:border-r-white/10" />
            </div>
          </button>
        </div>
      ) : (
        <div className="pt-4 border-t border-[var(--glass-border)] light:border-[#E3E3E3] mt-4">
          <button
            type="button"
            onClick={onLogout}
            className="group relative flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-[13px] font-medium text-sb-muted light:text-[#686868] outline-none select-none transition-all duration-200 border border-transparent hover:text-sb-pink hover:bg-sb-pink/[0.06] hover:border-sb-pink/20 hover:shadow-[0_2px_12px_rgba(255,45,149,0.06)] focus-visible:ring-2 focus-visible:ring-sb-pink/70"
          >
            <LogOut
              size={16}
              aria-hidden="true"
              className="flex-none transition-transform duration-200 group-hover:scale-105 group-hover:text-sb-pink"
            />
            <span className="flex-1 text-left">Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

function NotificationsMenu() {
  const { data } = useIndustry();
  const [now] = useState(() => Date.now());

  const items = useMemo(() => {
    const out: { id: string; text: string; href: string }[] = [];
    const n = data.recruiter.notifications;

    if (data.company.verificationStatus === "not_submitted") {
      out.push({
        id: "ver-submit",
        text: "Complete and submit your company profile for verification review.",
        href: "/industry/company-profile",
      });
    } else if (data.company.verificationStatus === "pending_review") {
      out.push({
        id: "ver-pending",
        text: "Company verification is pending administrative review.",
        href: "/industry/company-profile",
      });
    }

    if (n.interviewReminders) {
      const pendingFeedback = data.interviews.filter((iv) => !iv.feedback && iv.status !== "Cancelled");
      for (const iv of pendingFeedback.slice(0, 2)) {
        out.push({
          id: "iv-" + iv.id,
          text: `Interview with ${iv.candidateName} (${iv.round}) — record feedback when complete.`,
          href: "/industry/interviews",
        });
      }
    }

    if (n.jobDeadlines) {
      const soon = now + 7 * 86400000;
      for (const j of data.jobs.filter((x) => x.status === "Published")) {
        const dl = new Date(j.deadline.includes("T") ? j.deadline : `${j.deadline}T23:59:59.000Z`).getTime();
        if (dl >= now && dl <= soon) {
          out.push({
            id: "dl-" + j.id,
            text: `Listing “${j.title}” closes within 7 days.`,
            href: `/industry/jobs/${j.id}`,
          });
        }
      }
    }

    if (n.newApplications || n.stageChanges) {
      for (const act of data.activities.slice(0, 4)) {
        out.push({ id: act.id, text: act.text, href: act.href });
      }
    }
    return out.slice(0, 7);
  }, [data, now]);

  return (
    <PortalNotificationsMenu
      title="Recruiter Notifications"
      items={items}
      portalVariant="industry"
      ariaLabel={`Notifications${items.length ? `, ${items.length} items` : ""}`}
      emptyMessage="No new notifications."
    />
  );
}

function CompactSearchButton({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      id="industry-search-trigger"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label="Search"
      title="Search Industry Portal & Talent (⌘K)"
      onClick={onClick}
      className={`btn-bounce-sm relative grid h-10 w-10 place-items-center rounded-full border cursor-pointer transition-all duration-200 ${
        isOpen
          ? "border-[#6366F1] bg-white text-[#4F46E5] shadow-[0_0_12px_rgba(99,102,241,0.3)] dark:border-sb-cyan dark:bg-white/[0.1] dark:text-sb-cyan"
          : "border-slate-200/80 bg-white/70 text-[#161B2E] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl hover:border-[#6366F1]/50 hover:bg-white hover:text-[#4F46E5] dark:border-white/12 dark:bg-transparent dark:text-sb-muted dark:shadow-none dark:hover:border-sb-cyan/50 dark:hover:text-white"
      }`}
    >
      <Search size={18} aria-hidden="true" />
    </button>
  );
}

export default function IndustryAppShell({ children }: { children: React.ReactNode }) {
  const { data, logout } = useIndustry();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Scroll lock when mobile drawer is open
  useEffect(() => {
    if (drawer) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawer]);

  // Synchronized persistent sidebar state via useSyncExternalStore
  const collapsed = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getSidebarServerSnapshot
  );

  const toggleCollapsed = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      const next = !getSidebarSnapshot();
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      window.dispatchEvent(new Event("skillbridge-industry-sidebar-toggle"));
    } catch {
      // ignore
    }
  }, []);

  // Keyboard shortcut: Cmd+B (Mac) or Ctrl+B (Windows/Linux)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleCollapsed]);

  // Keyboard shortcut: Cmd+K / Ctrl+K for search, Cmd+/ for shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key === "/" && !isInput) {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  const currentNav = NAV.find(
    (n) => pathname === n.href || (n.href === "/industry/jobs" && pathname.startsWith("/industry/jobs/")),
  );

  const brand = (
    <Link
      href="/"
      className={`group relative flex items-center transition-all duration-300 ${
        collapsed ? "justify-center p-1" : "gap-2.5 p-2 rounded-2xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] light:hover:border-[#E3E3E3] light:hover:bg-white/40"
      }`}
      aria-label="SkillBridge home"
      title={collapsed ? "SkillBridge - " + data.company.name : undefined}
    >
      <Logo size={28} className="shrink-0" />
      <div
        className={`min-w-0 transition-all duration-300 ${
          collapsed ? "w-0 opacity-0 overflow-hidden pointer-events-none" : "w-auto opacity-100"
        }`}
      >
        <SkillBridgeWordmark
          className="block text-base leading-tight text-[var(--color-text)]"
          portal="industry"
        />
        <span className="block truncate text-[11px] font-medium text-sb-pink light:text-[#E94E00]">{data.company.name}</span>
      </div>
    </Link>
  );

  return (
    <div className="industry-app-root relative min-h-screen overflow-x-hidden bg-[#080808] light:bg-[#F8FAFC] transition-colors duration-300">
      <IndustryAmbientBackground />

      <aside
        aria-label="Industry Navigation"
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col overflow-y-auto backdrop-blur-2xl lg:flex transition-all duration-300 ease-in-out border-r border-[rgba(205,203,202,0.12)] light:border-[#E3E3E3] bg-[#080808]/95 light:bg-[#FFFFFF] light:shadow-[1px_0_12px_rgba(0,0,0,0.02)] ${
          collapsed ? "w-20 p-2.5" : "w-64 p-3.5"
        }`}
      >
        <div
          className={`mb-4 mt-1 flex items-center transition-all duration-300 ${
            collapsed ? "flex-col gap-2.5 justify-center" : "justify-between"
          }`}
        >
          {brand}
          <div className="relative group/toggle">
            <button
              id="sidebar-collapse-toggle-btn"
              data-testid="sidebar-collapse-toggle-btn"
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="btn-bounce-sm grid h-8 w-8 place-items-center rounded-xl border border-black/[0.08] dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-sb-muted hover:text-[#FF6A00] dark:hover:text-sb-cyan hover:bg-orange-500/10 dark:hover:bg-white/[0.1] transition-all cursor-pointer shadow-xs"
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Floating tooltip for toggle button in collapsed mode */}
            {collapsed && (
              <div
                role="tooltip"
                className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50 hidden group-hover/toggle:flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xl border bg-white/95 dark:bg-[#0D1117]/95 text-[#171717] dark:text-white border-[#E3E3E3] dark:border-white/10 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
              >
                Expand sidebar
                <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[4px] border-transparent border-r-[#E3E3E3] dark:border-r-white/10" />
              </div>
            )}
          </div>
        </div>
        <SidebarNav collapsed={collapsed} onLogout={() => setConfirm(true)} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Industry Navigation"
            className="rise absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto p-4 backdrop-blur-2xl border-r border-sb-blue/25 light:border-[#E3E3E3] bg-[var(--sidebar-bg)] light:bg-[#FFFFFF]"
          >
            <div className="mb-5 flex items-center justify-between">
              {brand}
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawer(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/12 light:border-black/10"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarNav
              collapsed={false}
              onNavigate={() => setDrawer(false)}
              onLogout={() => {
                setDrawer(false);
                setConfirm(true);
              }}
            />
          </aside>
        </div>
      )}

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between gap-3 border-b border-sb-blue/20 light:border-[#E3E3E3] bg-[var(--header-bg)] light:bg-white/80 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={drawer}
              onClick={() => setDrawer(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-[var(--glass-border)] light:border-[#E3E3E3] text-sb-muted transition-colors hover:text-sb-text lg:hidden"
            >
              <Menu size={20} />
            </button>
            <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-xs text-sb-muted sm:flex">
              <Link href="/industry/dashboard" className="transition-colors hover:text-sb-text light:hover:text-[#FF6A00]">
                Industry
              </Link>
              <span>/</span>
              <span className="font-semibold text-sb-text light:text-[#171717]">{currentNav?.label ?? "Workspace"}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsMenu />
            <div className="relative">
              <CompactSearchButton
                isOpen={searchOpen}
                onClick={() => setSearchOpen((prev) => !prev)}
              />
              <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            </div>
          </div>
        </header>

        <main id="main" className="relative mx-auto w-full max-w-[1400px] px-3 sm:px-8 py-5 sm:py-8">
          <DashboardPageTransition>{children}</DashboardPageTransition>
        </main>
      </div>

      <ConfirmModal
        open={confirm}
        title="Log out of recruiter workspace?"
        text="You will need to log in again to manage your company's listings and applicants."
        confirmLabel="Log out"
        busy={busy}
        onClose={() => setConfirm(false)}
        onConfirm={async () => {
          setBusy(true);
          await logout();
        }}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}
