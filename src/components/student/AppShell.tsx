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
import {
  Award,
  Bell,
  Bookmark,
  Briefcase,
  FolderGit2,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Send,
  Settings,
  Sparkles,
  User,
  X,
} from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";
import GlobalSearchModal from "@/components/search/GlobalSearchModal";
import type { SearchItem } from "@/lib/searchIndex";
import PortalNotificationsMenu from "@/components/notifications/PortalNotificationsMenu";
import DashboardPageTransition from "@/components/motion/DashboardPageTransition";
import { formatFriendlyDate, formatTime12h, getTaskStatus } from "@/lib/student/task-utils";
import { useStudent } from "./StudentProvider";
import { ConfirmModal } from "./ui";
import { KeyboardShortcutsModal } from "@/components/ui/KeyboardShortcutsModal";

const NAV = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "My Profile", icon: User },
  { href: "/student/skills", label: "Gain Skills", icon: Sparkles },
  { href: "/student/certificates", label: "Certificates", icon: Award },
  { href: "/student/projects", label: "Projects", icon: FolderGit2 },
  { href: "/student/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/student/applications", label: "Applications", icon: Send },
  { href: "/student/saved", label: "Saved Opportunities", icon: Bookmark },
  { href: "/student/referral", label: "Peer Referrals", icon: Gift },
  { href: "/student/settings", label: "Settings", icon: Settings },
] as const;

interface SidebarPillState {
  top: number;
  left: number;
  width: number;
  height: number;
  opacity: number;
  isHover: boolean;
  targetHref: string;
  immediate: boolean;
}

function NavList({
  collapsed = false,
  onNavigate,
  onLogout,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const { data } = useStudent();
  const counts: Record<string, number> = {
    "/student/certificates": data.certifications.length,
    "/student/applications": data.applications.length,
    "/student/saved": data.saved.length,
  };

  // Find active item based on current pathname
  const activeItem = useMemo(() => {
    return (
      NAV.find(
        (item) =>
          pathname === item.href ||
          (item.href !== "/student/dashboard" && pathname.startsWith(item.href))
      ) || NAV[0]
    );
  }, [pathname]);

  const activeHref = activeItem.href;

  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const hoveredHrefRef = useRef<string | null>(null);

  const listRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const [pillState, setPillState] = useState<SidebarPillState>({
    top: 0,
    left: 0,
    width: 0,
    height: 44,
    opacity: 0,
    isHover: false,
    targetHref: activeHref,
    immediate: true,
  });

  // Calculate pixel-accurate vertical position of target item inside the navigation container
  const movePillTo = useCallback((href: string, isHover = false, immediate = false) => {
    const container = listRef.current;
    const item = itemRefs.current.get(href);
    if (!container || !item) return;

    const containerRect = container.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    setPillState({
      top: Math.round(itemRect.top - containerRect.top),
      left: 0,
      width: Math.round(itemRect.width),
      height: Math.round(itemRect.height) || 44,
      opacity: 1,
      isHover,
      targetHref: href,
      immediate,
    });
  }, []);

  // Recompute pill position when active item changes
  useEffect(() => {
    movePillTo(activeHref, false, false);
  }, [activeHref, movePillTo]);

  // Initial placement & layout settling without jump animation from top-left
  useEffect(() => {
    movePillTo(activeHref, false, true);
    const t = setTimeout(() => movePillTo(activeHref, false, true), 50);
    return () => clearTimeout(t);
  }, [activeHref, movePillTo]);

  // Re-align indicator on window resize or sidebar container resize
  useEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const onResize = () => {
      const target = hoveredHrefRef.current || activeHref;
      movePillTo(target, Boolean(hoveredHrefRef.current), true);
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(container);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [activeHref, movePillTo]);

  const handleItemPointerEnter = (href: string) => {
    hoveredHrefRef.current = href;
    setHoveredHref(href);
    movePillTo(href, true, false);
  };

  const handleListPointerLeave = () => {
    hoveredHrefRef.current = null;
    setHoveredHref(null);
    movePillTo(activeHref, false, false);
  };

  const handleItemFocus = (href: string) => {
    hoveredHrefRef.current = href;
    setHoveredHref(href);
    movePillTo(href, true, false);
  };

  const handleItemBlur = () => {
    hoveredHrefRef.current = null;
    setHoveredHref(null);
    movePillTo(activeHref, false, false);
  };

  const isHoveredElsewhere = Boolean(hoveredHref && hoveredHref !== activeHref);

  return (
    <nav aria-label="Student" className="flex flex-1 flex-col justify-between overflow-x-hidden">
      <ul
        ref={listRef}
        onPointerLeave={handleListPointerLeave}
        className="relative space-y-1 w-full"
      >
        {/* ONE Shared Liquid Glass Highlight Pill - Full Width & Fluid Vertically */}
        <div
          className={`sidebar-liquid-glass-pill pointer-events-none absolute left-0 right-0 ${
            pillState.isHover ? "is-hovered" : "is-active"
          }`}
          style={{
            transform: `translate3d(0, ${pillState.top}px, 0)`,
            height: `${pillState.height || 44}px`,
            opacity: pillState.opacity,
            transition: pillState.immediate ? "none" : undefined,
          }}
          aria-hidden="true"
        >
          {/* Subtle luminous active pip on the left border */}
          <span
            className={`pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 h-4 w-1 rounded-full transition-opacity duration-200 ${
              pillState.isHover && pillState.targetHref !== activeHref
                ? "opacity-0"
                : "opacity-100 bg-[#D41514] shadow-[0_0_8px_rgba(212,21,20,0.8)] light:bg-[#FF6A00] light:shadow-[0_0_8px_rgba(255,106,0,0.5)]"
            }`}
          />
        </div>

        {NAV.map(({ href, label, icon: Icon }) => {
          const isActive = activeHref === href;
          const isHovered = hoveredHref === href;
          const count = counts[href] ?? 0;

          return (
            <li key={href} className="relative z-10 w-full">
              <Link
                ref={(el) => {
                  if (el) itemRefs.current.set(href, el);
                  else itemRefs.current.delete(href);
                }}
                href={href}
                onClick={() => {
                  hoveredHrefRef.current = null;
                  setHoveredHref(null);
                  movePillTo(href, false);
                  if (onNavigate) onNavigate();
                }}
                onPointerEnter={() => handleItemPointerEnter(href)}
                onFocus={() => handleItemFocus(href)}
                onBlur={handleItemBlur}
                className={`student-side-link group/item relative flex items-center w-full h-11 px-1 rounded-xl text-sm font-medium outline-none select-none overflow-hidden transition-colors duration-200 ${
                  isActive
                    ? "text-white font-semibold light:text-[#FF6A00] light:bg-orange-500/[0.10] shadow-sm"
                    : isHovered
                    ? "text-sb-text font-medium light:text-[#171717] light:bg-orange-500/[0.05]"
                    : "text-sb-muted hover:text-sb-text light:text-[#686868] light:hover:text-[#171717]"
                }`}
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
              >
                {/* Persistent Active Pip when user is previewing another item */}
                {isActive && isHoveredElsewhere && (
                  <span
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full bg-[#D41514] light:bg-[#FF6A00]/80 shadow-[0_0_6px_rgba(212,21,20,0.6)] light:shadow-[0_0_6px_rgba(255,106,0,0.5)] animate-pulse"
                    aria-hidden="true"
                  />
                )}

                {/* Fixed-width Icon Container: always centered in collapsed mode and stable in expanded mode */}
                <div className="relative flex items-center justify-center shrink-0 w-11 h-11">
                  <Icon
                    size={19}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${
                      isActive
                        ? "text-sb-cyan light:text-[#FF6A00] scale-105"
                        : isHovered
                        ? "text-sb-text scale-105 light:text-[#171717]"
                        : "text-sb-muted group-hover/item:text-sb-text light:text-[#686868] light:group-hover/item:text-[#171717]"
                    }`}
                  />
                  {/* Collapsed mini indicator badge on icon */}
                  {count > 0 && (
                    <span
                      className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF6A00] dark:bg-sb-cyan text-white dark:text-[#0D1117] text-[10px] font-extrabold px-1 shadow-sm transition-all duration-200 ${
                        collapsed ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
                      }`}
                      aria-label={`${count} items`}
                    >
                      {count}
                    </span>
                  )}
                </div>

                {/* Smoothly Transitioning Label & Count Badge without DOM unmounting */}
                <div
                  className={`flex items-center min-w-0 flex-1 pr-3 transition-all duration-200 ease-out ${
                    collapsed
                      ? "opacity-0 -translate-x-3 max-w-0 pointer-events-none overflow-hidden"
                      : "opacity-100 translate-x-0 max-w-[200px]"
                  }`}
                >
                  <span className="flex-1 truncate">{label}</span>
                  {count > 0 && (
                    <span
                      className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[11px] transition-colors duration-200 ${
                        isActive
                          ? "bg-sb-cyan/20 text-sb-cyan light:bg-orange-500/20 light:text-[#FF6A00] font-semibold"
                          : "bg-white/10 light:bg-black/[0.05] text-sb-muted light:text-[#686868]"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </div>

                {/* Collapsed Hover / Focus Floating Glass Tooltip */}
                {collapsed && (
                  <div
                    role="tooltip"
                    className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 hidden group-hover/item:flex group-focus-visible/item:flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border transition-all animate-in fade-in-0 zoom-in-95 duration-150 bg-white/95 dark:bg-[#0D1117]/95 text-[#171717] dark:text-white border-[#E3E3E3] dark:border-white/10 backdrop-blur-xl"
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

      {/* Bottom Promotional Panel - Continuous Cross-Fade without DOM Destructuring */}
      <div className="mt-auto mb-2 pt-2 relative overflow-hidden">
        {/* Expanded Placement Pro Card */}
        <div
          className={`rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-white dark:bg-white/[0.03] p-3.5 shadow-sm transition-all duration-200 ease-out ${
            collapsed
              ? "opacity-0 pointer-events-none scale-95 h-0 p-0 m-0 border-0 overflow-hidden"
              : "opacity-100 scale-100"
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan shrink-0">
              <Sparkles size={13} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-sb-text light:text-[#171717] truncate">Placement Pro</p>
              <p className="text-[10px] text-sb-muted light:text-[#686868] truncate">Tier-1 Qualified</p>
            </div>
          </div>
          <div className="h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-2.5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] dark:from-sb-cyan dark:to-sb-cyan" style={{ width: "92%" }} />
          </div>
          <Link
            href="/student/profile"
            className="block text-center rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] text-white shadow-[0_4px_12px_-2px_rgba(255,106,0,0.35)] dark:bg-white/10 dark:from-transparent dark:to-transparent dark:shadow-none dark:text-white py-1.5 text-xs font-semibold hover:shadow-[0_6px_16px_-2px_rgba(255,106,0,0.45)] dark:hover:bg-white/20 transition-all"
          >
            View Status
          </Link>
        </div>

        {/* Collapsed Compact Icon Button */}
        <div
          className={`flex justify-center transition-all duration-200 ease-out ${
            collapsed
              ? "opacity-100 scale-100"
              : "opacity-0 pointer-events-none scale-90 h-0 overflow-hidden"
          }`}
        >
          <Link
            href="/student/profile"
            aria-label="Placement Pro: Tier-1 Qualified (92%)"
            className="group/promo relative grid h-11 w-11 place-items-center rounded-xl border border-orange-500/20 dark:border-sb-cyan/30 bg-orange-500/10 dark:bg-sb-cyan/10 text-[#FF6A00] dark:text-sb-cyan hover:scale-105 hover:shadow-md transition-all cursor-pointer"
          >
            <Sparkles size={18} />
            <div
              role="tooltip"
              className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 hidden group-hover/promo:flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border transition-all animate-in fade-in-0 zoom-in-95 duration-150 bg-white/95 dark:bg-[#0D1117]/95 text-[#171717] dark:text-white border-[#E3E3E3] dark:border-white/10 backdrop-blur-xl"
            >
              <span>Placement Pro: Tier-1 (92%)</span>
              <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#E3E3E3] dark:border-r-white/10" />
            </div>
          </Link>
        </div>
      </div>

      {/* Logout button - Single Unified Button */}
      <div className="pt-1 w-full">
        <button
          type="button"
          onClick={onLogout}
          aria-label={collapsed ? "Logout" : undefined}
          className="group/logout relative flex items-center w-full h-11 px-1 rounded-xl text-sb-muted hover:text-sb-pink hover:bg-rose-500/10 transition-colors duration-200 outline-none select-none overflow-hidden"
        >
          <div className="w-11 h-11 shrink-0 flex items-center justify-center">
            <LogOut size={18} aria-hidden="true" className="text-sb-muted group-hover/logout:text-sb-pink transition-colors duration-200" />
          </div>
          <span
            className={`text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ease-out ${
              collapsed
                ? "opacity-0 -translate-x-3 max-w-0 pointer-events-none"
                : "opacity-100 translate-x-0 max-w-[120px]"
            }`}
          >
            Logout
          </span>
          {collapsed && (
            <div
              role="tooltip"
              className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 hidden group-hover/logout:flex items-center whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xl border transition-all animate-in fade-in-0 zoom-in-95 duration-150 bg-white/95 dark:bg-[#0D1117]/95 text-rose-500 border-[#E3E3E3] dark:border-white/10 backdrop-blur-xl"
            >
              <span>Logout</span>
              <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#E3E3E3] dark:border-r-white/10" />
            </div>
          )}
        </button>
      </div>
    </nav>
  );
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

function Notifications() {
  const { data, completion, opps } = useStudent();
  const [now] = useState(() => Date.now());

  const items = useMemo(() => {
    const list: { id: string; text: string; href: string }[] = [];
    if (completion.percent < 100) {
      list.push({ id: "profile", text: `Your profile is ${completion.percent}% complete.`, href: "/student/profile" });
    }
    const week = now + 7 * 86400000;
    for (const id of data.saved) {
      const o = opps?.find((x) => x.id === id);
      if (o && new Date(o.deadline).getTime() < week && !data.applications.some((a) => a.opportunityId === id)) {
        const days = Math.max(0, Math.ceil((new Date(o.deadline).getTime() - now) / 86400000));
        list.push({ id: "dl-" + id, text: `Saved: “${o.title}” closes in ${days} day${days === 1 ? "" : "s"}.`, href: `/student/opportunities?id=${id}` });
      }
    }

    // Personal Task Reminders & Deadlines
    for (const t of data.tasks ?? []) {
      if (t.completed) continue;
      const status = getTaskStatus(t);
      if (status === "Overdue") {
        list.push({
          id: "task-od-" + t.id,
          text: `Overdue: “${t.title}” was due ${formatFriendlyDate(t.date)}.`,
          href: "/student/dashboard",
        });
      } else if (status === "Due Today") {
        list.push({
          id: "task-today-" + t.id,
          text: `Due Today: “${t.title}”${t.dueTime ? ` by ${formatTime12h(t.dueTime)}` : ""}.`,
          href: "/student/dashboard",
        });
      } else if (t.reminder && t.reminder !== "none") {
        list.push({
          id: "task-remind-" + t.id,
          text: `Reminder: “${t.title}” on ${formatFriendlyDate(t.date)}.`,
          href: "/student/dashboard",
        });
      }
    }

    return list;
  }, [completion.percent, data.saved, data.applications, data.tasks, opps, now]);

  return (
    <PortalNotificationsMenu
      title="Student Notifications"
      items={items}
      portalVariant="student"
      ariaLabel={`Notifications${items.length ? `, ${items.length} new` : ""}`}
      emptyMessage="You're all caught up."
    />
  );
}

const SIDEBAR_STORAGE_KEY = "skillbridge-student-sidebar-collapsed";

function subscribeSidebar(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("skillbridge-sidebar-toggle", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("skillbridge-sidebar-toggle", callback);
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
      id="student-search-trigger"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label="Search"
      title="Search SkillBridge & Opportunities (⌘K)"
      onClick={onClick}
      className={`btn-bounce-sm relative grid h-10 w-10 place-items-center rounded-full border cursor-pointer transition-all duration-200 ${
        isOpen
          ? "border-[#FF6A00] bg-white text-[#FF6A00] shadow-[0_0_12px_rgba(255,106,0,0.3)] dark:border-sb-cyan dark:bg-white/[0.1] dark:text-sb-cyan"
          : "border-slate-200/80 bg-white/70 text-[#161B2E] shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-xl hover:border-[#FF6A00]/50 hover:bg-white hover:text-[#FF6A00] hover:shadow-[0_0_16px_rgba(255,106,0,0.2)] dark:border-white/15 dark:bg-[#070b14]/70 dark:text-slate-100 dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] dark:hover:border-sb-cyan/50 dark:hover:bg-white/[0.14] dark:hover:text-white dark:hover:shadow-[0_0_16px_rgba(25,184,230,0.3)]"
      }`}
    >
      <Search size={18} aria-hidden="true" />
    </button>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data, opps, logout } = useStudent();
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

  // Keyboard shortcut: Cmd+K / Ctrl+K opens search, Cmd+/ opens shortcuts
  useEffect(() => {
    const handleSearchKey = (e: KeyboardEvent) => {
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
    window.addEventListener("keydown", handleSearchKey);
    return () => window.removeEventListener("keydown", handleSearchKey);
  }, []);

  // Compute student-specific dynamic search items
  const studentSearchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    // 1. Student Skills & Credentials
    if (data.skills?.length) {
      for (const skill of data.skills) {
        items.push({
          id: `student-skill-${skill.id}`,
          title: `${skill.name} (${skill.level})`,
          description: `Your verified skill level: ${skill.level}. Click to view or edit in Skills & Certifications.`,
          category: "student",
          categoryLabel: "My Skills",
          keywords: [skill.name, "skill", skill.level, "proficiency", "credential"],
          href: "/student/skills",
          badge: "Personal",
          iconName: "award",
        });
      }
    }

    // 2. Student Projects
    if (data.projects?.length) {
      for (const proj of data.projects) {
        items.push({
          id: `student-proj-${proj.id}`,
          title: proj.title,
          description: proj.description || `Built with: ${proj.technologies?.join(", ") || "various technologies"}.`,
          category: "student",
          categoryLabel: "My Projects",
          keywords: [proj.title, "project", ...(proj.technologies || [])],
          href: "/student/projects",
          badge: "Personal",
          iconName: "code",
        });
      }
    }

    // 3. Student Certifications
    if (data.certifications?.length) {
      for (const cert of data.certifications) {
        items.push({
          id: `student-cert-${cert.id}`,
          title: cert.title,
          description: `Issued by ${cert.issuer} (${cert.issueDate}).`,
          category: "student",
          categoryLabel: "My Certifications",
          keywords: [cert.title, cert.issuer, "certification", "credential"],
          href: "/student/skills",
          badge: "Personal",
          iconName: "award",
        });
      }
    }

    // 4. Student Tasks & Deadlines
    if (data.tasks?.length) {
      for (const t of data.tasks) {
        items.push({
          id: `student-task-${t.id}`,
          title: `${t.title} (${t.type})`,
          description: `Date: ${t.date} · Priority: ${t.priority} · Status: ${t.completed ? "Completed" : "Pending"}.`,
          category: "student",
          categoryLabel: "My Tasks",
          keywords: [t.title, t.type, t.priority, "task", "schedule", "deadline", "calendar"],
          href: "/student/dashboard",
          badge: "Personal",
          iconName: "calendar",
        });
      }
    }

    // 5. Student Applications
    if (data.applications?.length && opps?.length) {
      for (const app of data.applications) {
        const opp = opps.find((o) => o.id === app.opportunityId);
        if (opp) {
          items.push({
            id: `student-app-${app.id}`,
            title: `Application: ${opp.title}`,
            description: `Organisation: ${opp.org} · Stage: ${app.status} · Applied: ${app.appliedAt?.slice(0, 10)}.`,
            category: "student",
            categoryLabel: "Applications",
            keywords: [opp.title, opp.org, app.status, "application", "applied", "job application"],
            href: "/student/applications",
            badge: "Application",
            iconName: "file-text",
          });
        }
      }
    }

    // 6. Student Saved Opportunities
    if (data.saved?.length && opps?.length) {
      for (const savedId of data.saved) {
        const opp = opps.find((o) => o.id === savedId);
        if (opp) {
          items.push({
            id: `student-saved-${opp.id}`,
            title: `Saved: ${opp.title}`,
            description: `Organisation: ${opp.org} · Type: ${opp.type} (${opp.mode}) · Location: ${opp.location}.`,
            category: "opportunities",
            categoryLabel: "Saved",
            keywords: [opp.title, opp.org, opp.type, opp.mode, ...(opp.skills || []), "saved", "bookmark"],
            href: `/student/opportunities?id=${opp.id}`,
            badge: "Saved",
            iconName: "sparkles",
          });
        }
      }
    }

    // 7. Live Opportunities Catalogue
    if (opps?.length) {
      for (const opp of opps) {
        // avoid duplicating if already added in saved
        if (data.saved?.includes(opp.id)) continue;
        items.push({
          id: `live-opp-${opp.id}`,
          title: `${opp.title} · ${opp.org}`,
          description: `${opp.type} (${opp.mode}) · ${opp.location} · Skills: ${opp.skills?.slice(0, 4).join(", ") || "General"}.`,
          category: "opportunities",
          categoryLabel: "Opportunities",
          keywords: [opp.title, opp.org, opp.type, opp.mode, opp.location, ...(opp.skills || []), "internship", "job", "hiring"],
          href: `/student/opportunities?id=${opp.id}`,
          badge: opp.sample ? "Catalogue" : "Live",
          iconName: "briefcase",
        });
      }
    }

    return items;
  }, [data.skills, data.projects, data.certifications, data.tasks, data.applications, data.saved, opps]);

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
      window.dispatchEvent(new Event("skillbridge-sidebar-toggle"));
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

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawer]);

  const brand = (
    <Link href="/" className="flex items-center gap-2.5 px-2" aria-label="SkillBridge website">
      <Logo size={28} />
      <SkillBridgeWordmark className="text-lg" portal="student" />
    </Link>
  );

  return (
    <div className="student-app-root relative min-h-screen overflow-x-hidden bg-[#080808] light:bg-[#F1F1F1] transition-colors duration-300">
      <div className="pointer-events-none fixed -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[rgba(205,203,202,0.02)] light:opacity-0 blur-[140px]" />
      <div className="pointer-events-none fixed -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[rgba(212,21,20,0.02)] light:opacity-0 blur-[140px]" />

      <aside
        aria-label="Student Navigation"
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-[rgba(205,203,202,0.12)] light:border-[#E3E3E3] bg-[#080808]/95 light:bg-[#FFFFFF] backdrop-blur-xl lg:flex light:shadow-[1px_0_12px_rgba(0,0,0,0.02)] student-sidebar student-sidebar-transition overflow-x-hidden ${
          collapsed ? "w-20 is-collapsed" : "w-64"
        } p-3.5`}
      >
        {/* Top Header: Brand & Collapse/Expand Toggle with Fluid Continuous Gliding */}
        <div
          className={`relative mb-5 mt-0.5 w-full transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            collapsed ? "h-20" : "h-9"
          }`}
        >
          {/* Brand Logo & Wordmark */}
          <Link
            href="/"
            className={`flex items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sb-cyan transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] absolute ${
              collapsed
                ? "left-1/2 -translate-x-1/2 top-0"
                : "left-1 top-1/2 -translate-y-1/2"
            }`}
            aria-label="SkillBridge website"
            title="SkillBridge"
          >
            <Logo size={28} className="shrink-0" />
            <span
              className={`text-lg font-bold tracking-tight whitespace-nowrap transition-all duration-200 ease-out ${
                collapsed
                  ? "opacity-0 -translate-x-2 max-w-0 pointer-events-none overflow-hidden"
                  : "opacity-100 translate-x-0 max-w-[120px]"
              }`}
            >
              <SkillBridgeWordmark portal="student" />
            </span>
          </Link>

          {/* Collapse/Expand Toggle Button */}
          <div
            className={`group/toggle absolute transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              collapsed
                ? "left-1/2 -translate-x-1/2 top-11"
                : "right-1 top-1/2 -translate-y-1/2"
            }`}
          >
            <button
              id="sidebar-collapse-toggle-btn"
              data-testid="sidebar-collapse-toggle-btn"
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="btn-bounce-sm grid h-8 w-8 place-items-center rounded-xl border border-black/[0.08] dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.04] text-sb-muted hover:text-[#FF6A00] dark:hover:text-sb-cyan hover:bg-orange-500/10 dark:hover:bg-white/[0.1] transition-colors cursor-pointer shadow-xs"
            >
              {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>

            {/* Floating tooltip for toggle button in collapsed mode */}
            {collapsed && (
              <div
                role="tooltip"
                className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 z-50 hidden group-hover/toggle:flex items-center whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xl border bg-white/95 dark:bg-[#0D1117]/95 text-[#171717] dark:text-white border-[#E3E3E3] dark:border-white/10 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-150"
              >
                Expand sidebar
                <span className="absolute right-full top-1/2 -translate-y-1/2 -mr-[1px] border-[5px] border-transparent border-r-[#E3E3E3] dark:border-r-white/10" />
              </div>
            )}
          </div>
        </div>

        <NavList collapsed={collapsed} onLogout={() => setConfirm(true)} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <aside role="dialog" aria-modal="true" aria-label="Navigation" className="rise absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r border-sb-blue/25 light:border-[#E3E3E3] bg-[var(--sidebar-bg)] light:bg-[#FFFFFF] p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between">
              {brand}
              <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className="btn-bounce-sm grid h-9 w-9 place-items-center rounded-full border border-[var(--glass-border)] text-sb-muted transition-colors hover:text-sb-text">
                <X size={18} />
              </button>
            </div>
            <NavList collapsed={false} onNavigate={() => setDrawer(false)} onLogout={() => { setDrawer(false); setConfirm(true); }} />
          </aside>
        </div>
      )}

      <div
        className={`flex flex-col min-h-screen student-main-content student-main-transition ${
          collapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <main
          id="main"
          className="relative w-full px-3 sm:px-6 lg:px-8 xl:px-10 pt-3 sm:pt-5 lg:pt-6 pb-12 sm:pb-16"
        >
          {/* Global Top Utility Row: Mobile Navigation & Floating Controls (Theme Toggle & Notifications) */}
          <div className="relative z-40 flex items-center justify-between gap-3 mb-4 sm:mb-6">
            {/* Mobile Drawer Trigger (visible on mobile / tablet screens < lg) */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={drawer}
                onClick={() => setDrawer(true)}
                className="btn-bounce-sm grid h-10 w-10 place-items-center rounded-2xl border border-black/[0.08] dark:border-white/15 bg-white/80 dark:bg-[#070b14]/70 text-sb-muted transition-colors hover:text-sb-text backdrop-blur-xl shadow-sm"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 pl-1">
                <Logo size={22} />
                <SkillBridgeWordmark className="text-base" portal="student" />
              </div>
            </div>
            <div className="hidden lg:block" />

            {/* Compact Floating Utility Group: Search, Theme Toggle & Notifications */}
            <div
              role="region"
              aria-label="Portal controls"
              className="flex items-center gap-2 p-1.5 rounded-full border border-black/[0.08] dark:border-white/15 bg-white/70 dark:bg-[#070b14]/70 backdrop-blur-xl shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
            >
              <div className="relative">
                <CompactSearchButton
                  isOpen={searchOpen}
                  onClick={() => setSearchOpen((prev) => !prev)}
                />
                <GlobalSearchModal
                  isOpen={searchOpen}
                  onClose={() => setSearchOpen(false)}
                  extraItems={studentSearchItems}
                  variant="student"
                />
              </div>
              <ThemeToggle />
              <Notifications />
            </div>
          </div>

          <DashboardPageTransition>{children}</DashboardPageTransition>
        </main>
      </div>

      <ConfirmModal
        open={confirm}
        title="Log out?"
        text="You will need to log in again to access your dashboard."
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
