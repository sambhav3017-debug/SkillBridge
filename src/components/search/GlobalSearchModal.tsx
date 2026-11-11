"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  GraduationCap,
  Building2,
  Briefcase,
  Compass,
  Sparkles,
  Code,
  TrendingUp,
  Award,
  FileText,
  Calendar,
  Shield,
  User,
  CornerDownLeft,
} from "lucide-react";
import {
  SearchItem,
  SearchCategory,
  searchSite,
  highlightChunks,
  POPULAR_SEARCH_TERMS,
} from "@/lib/searchIndex";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  extraItems?: SearchItem[];
  variant?: "student" | "default";
}

function getCategoryIcon(iconName: SearchItem["iconName"]) {
  const size = 15;
  switch (iconName) {
    case "graduation":
      return <GraduationCap size={size} className="text-emerald-500 dark:text-emerald-400" />;
    case "building":
      return <Building2 size={size} className="text-amber-500 dark:text-amber-400" />;
    case "briefcase":
      return <Briefcase size={size} className="text-purple-500 dark:text-purple-400" />;
    case "compass":
      return <Compass size={size} className="text-[#007BA7] dark:text-[#CDCBCA]" />;
    case "code":
      return <Code size={size} className="text-blue-500 dark:text-blue-400" />;
    case "trending-up":
      return <TrendingUp size={size} className="text-rose-500 dark:text-rose-400" />;
    case "award":
      return <Award size={size} className="text-amber-500 dark:text-amber-400" />;
    case "file-text":
      return <FileText size={size} className="text-indigo-500 dark:text-indigo-400" />;
    case "calendar":
      return <Calendar size={size} className="text-rose-500 dark:text-rose-400" />;
    case "shield":
      return <Shield size={size} className="text-emerald-500 dark:text-emerald-400" />;
    case "user":
      return <User size={size} className="text-blue-500 dark:text-blue-400" />;
    case "sparkles":
    case "portal":
    default:
      return <Sparkles size={size} className="text-[#007BA7] dark:text-[#CDCBCA]" />;
  }
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  extraItems = [],
  variant,
}: GlobalSearchModalProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const categories = useMemo<{ id: SearchCategory; label: string }[]>(() => [
    { id: "all", label: t.search.all },
    { id: "portals", label: t.search.portals },
    { id: "opportunities", label: t.search.opportunities },
    { id: "student", label: t.search.studentCat },
    { id: "academia", label: t.search.academiaCat },
    { id: "industry", label: t.search.industryCat },
    { id: "platform", label: t.search.platformCat },
    { id: "auth", label: t.search.authCat },
  ], [t]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isStudent = variant === "student" || (variant === undefined && pathname?.startsWith("/student"));

  // Search results based on query & active category
  const results = useMemo(() => {
    return searchSite(query, activeCategory, extraItems);
  }, [query, activeCategory, extraItems]);

  const safeSelectedIndex = Math.min(selectedIndex, Math.max(0, results.length - 1));

  const [isDissolving, setIsDissolving] = useState(false);
  const [dissolvingText, setDissolvingText] = useState("");
  const dissolveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClear = () => {
    if (!query || isDissolving) return;
    setDissolvingText(query);
    setIsDissolving(true);
    setQuery("");
    setSelectedIndex(0);
    inputRef.current?.focus();

    if (dissolveTimerRef.current) clearTimeout(dissolveTimerRef.current);
    dissolveTimerRef.current = setTimeout(() => {
      setIsDissolving(false);
      setDissolvingText("");
      dissolveTimerRef.current = null;
    }, 1000);
  };

  const handleQueryChange = (val: string) => {
    if (isDissolving) {
      setIsDissolving(false);
      setDissolvingText("");
      if (dissolveTimerRef.current) {
        clearTimeout(dissolveTimerRef.current);
        dissolveTimerRef.current = null;
      }
    }
    setQuery(val);
    setSelectedIndex(0);
  };

  const handleCategoryChange = (cat: SearchCategory) => {
    setActiveCategory(cat);
    setSelectedIndex(0);
  };

  const [mounted, setMounted] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  // Synchronize state during render for instant responsiveness
  if (isOpen && !mounted) {
    setMounted(true);
    setIsClosing(false);
  }
  if (isOpen && isClosing) {
    setIsClosing(false);
  }
  if (!isOpen && mounted && !isClosing) {
    setIsClosing(true);
  }

  // Graceful unmount after exit animation finishes
  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.target !== panelRef.current) return;
    if (isClosing) {
      setMounted(false);
      setIsClosing(false);
    }
  };

  // Safety fallback timer if onAnimationEnd does not fire
  useEffect(() => {
    if (!isClosing) return;
    const timer = setTimeout(() => {
      setMounted(false);
      setIsClosing(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [isClosing]);

  // Focus input immediately and handle Escape & outside click when opened
  useEffect(() => {
    if (!mounted || isClosing) return;

    // Immediate focus for instant typing readiness
    inputRef.current?.focus();
    inputRef.current?.select();

    const onGlobalKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      // Do not close if clicking inside panel or any search trigger button
      if (
        panelRef.current?.contains(target) ||
        document.getElementById("header-search-trigger")?.contains(target) ||
        document.getElementById("industry-search-trigger")?.contains(target) ||
        document.getElementById("academia-search-trigger")?.contains(target) ||
        document.getElementById("student-search-trigger")?.contains(target) ||
        (target as Element)?.closest?.('[id*="search-trigger"]')
      ) {
        return;
      }
      onClose();
    };

    window.addEventListener("keydown", onGlobalKey);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onGlobalKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [mounted, isClosing, onClose]);

  // Dynamic viewport boundary clamp to keep popover safely anchored inside the viewport
  useEffect(() => {
    if (!mounted || isClosing) return;

    const clampToViewport = () => {
      const panel = panelRef.current;
      if (!panel) return;

      const rect = panel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // 1. Horizontal Boundary Clamp via CSS property
      if (rect.left < 12) {
        const overflowLeft = 12 - rect.left;
        panel.style.setProperty("--search-popover-shift-x", `${overflowLeft}px`);
      } else if (rect.right > viewportWidth - 12) {
        const overflowRight = rect.right - (viewportWidth - 12);
        panel.style.setProperty("--search-popover-shift-x", `-${overflowRight}px`);
      } else {
        panel.style.removeProperty("--search-popover-shift-x");
      }

      // 2. Vertical Boundary Clamp
      if (rect.bottom > viewportHeight - 12) {
        const maxH = Math.max(260, viewportHeight - rect.top - 20);
        panel.style.maxHeight = `${maxH}px`;
      }
    };

    const timer = setTimeout(clampToViewport, 10);
    window.addEventListener("resize", clampToViewport, { passive: true });
    window.addEventListener("scroll", clampToViewport, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", clampToViewport);
      window.removeEventListener("scroll", clampToViewport);
    };
  }, [mounted, isClosing, results.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeElement = listRef.current.querySelector<HTMLElement>(
      `[data-search-index="${safeSelectedIndex}"]`
    );
    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [safeSelectedIndex]);

  // Navigate to target item
  const handleSelect = (item: SearchItem) => {
    onClose();

    // If it's a landing page section and we are already on "/" or "/#...", smooth scroll to it
    if (item.isSection && (pathname === "/" || pathname === "")) {
      const hash = item.href.replace(/^\//, "");
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    // Standard router navigation
    router.push(item.href);
  };

  // Keyboard navigation within search container
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && results[safeSelectedIndex]) {
        handleSelect(results[safeSelectedIndex]);
      }
    }
  };

  if (!mounted) return null;

  return (
    <div
      ref={panelRef}
      id="search-popover-panel"
      role="dialog"
      aria-modal="false"
      aria-label={t.search.modalAria}
      onAnimationEnd={handleAnimationEnd}
      className={`fixed sm:absolute top-[70px] sm:top-full right-3 sm:right-0 mt-0 sm:mt-2.5 z-50 w-[calc(100vw-1.5rem)] sm:w-[500px] max-w-[520px] rounded-[18px] origin-top-right select-auto max-h-[min(560px,calc(100vh-90px))] flex flex-col overflow-hidden text-left border border-black/[0.08] dark:border-[rgba(205,203,202,0.14)] bg-white/95 dark:bg-[#121214]/95 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.14)] dark:shadow-[0_28px_70px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.06)_inset] ${
        isClosing
          ? "animate-search-popover-exit pointer-events-none"
          : "animate-search-popover-enter pointer-events-auto"
      }`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={handleKeyDown}
    >
      {/* Apple Spotlight Top Search Header */}
      <div className="relative z-10 flex items-center px-4 py-3 shrink-0 border-b border-black/[0.06] dark:border-white/[0.07] bg-white/50 dark:bg-transparent">
        <Search
          size={17}
          className="mr-3 text-slate-400 dark:text-[#8E8C8B] shrink-0 pointer-events-none"
        />

        <div className="relative flex-1 flex items-center min-w-0">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={isDissolving ? "" : t.search.placeholder}
            className="w-full bg-transparent text-[0.98rem] font-normal tracking-tight text-slate-900 dark:text-[#F5F5F7] placeholder:text-slate-400 dark:placeholder:text-[#636366] focus:outline-none"
            aria-label={t.search.placeholder}
            autoComplete="off"
            spellCheck={false}
          />

          {/* Transitions.dev Dissolve Overlay Layer */}
          {isDissolving && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden font-normal text-[0.98rem] tracking-tight"
              aria-hidden="true"
            >
              <span className="search-dissolve-text whitespace-pre truncate text-slate-900 dark:text-[#F5F5F7]">
                {dissolvingText}
              </span>
              <span className="search-dissolve-placeholder absolute left-0 text-slate-400 dark:text-[#636366] whitespace-pre truncate">
                {t.search.placeholder}
              </span>
              <div
                className="search-dissolve-glow absolute inset-x-0 h-2.5 rounded-full pointer-events-none opacity-40"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(0, 123, 167, 0.35), rgba(212, 21, 20, 0.25), transparent)",
                }}
              />
            </div>
          )}
        </div>

        {/* Clear & Keyboard Dismiss Indicators */}
        <div className="flex items-center gap-1.5 ml-2">
          {(query.length > 0 || isDissolving) && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleClear()}
              aria-label="Clear search"
              title="Clear search"
              className="grid h-4.5 w-4.5 place-items-center rounded-full bg-slate-200 dark:bg-[#2C2C2E] hover:bg-slate-300 dark:hover:bg-[#3A3A3C] text-slate-500 dark:text-[#8E8C8B] active:scale-90 transition-all duration-150 cursor-pointer"
            >
              <X size={10} strokeWidth={2.4} />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-flex items-center rounded-[5px] px-1.5 py-0.5 text-[0.62rem] font-medium text-slate-400 dark:text-[#636366] bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] hover:text-slate-700 dark:hover:text-[#CDCBCA] transition-colors"
            aria-label="Close search (ESC)"
          >
            ESC
          </button>

          <button
            type="button"
            onClick={onClose}
            className="sm:hidden grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
            aria-label="Close search"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Apple-style Category Segmented Filter Strip */}
      <div className="relative z-10 flex items-center gap-1 overflow-x-auto px-3.5 py-2 scrollbar-none shrink-0 border-b border-black/[0.04] dark:border-white/[0.05]">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.72rem] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-[#007BA7] text-white dark:bg-[#D41514] dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 dark:text-[#8E8C8B] hover:text-slate-800 dark:hover:text-[#F5F5F7] hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Live Spotlight Recommendations & Search Results */}
      <div
        ref={listRef}
        className="relative z-10 flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-300/60 dark:scrollbar-thumb-slate-700/60 max-h-[320px]"
        role="listbox"
        aria-label="Search suggestions"
      >
        {results.length > 0 ? (
          <div className="space-y-0.5">
            {results.map((item, index) => {
              const isSelected = index === safeSelectedIndex;
              const titleChunks = highlightChunks(item.title, query);
              const descChunks = highlightChunks(item.description, query);

              return (
                <div
                  key={item.id}
                  data-search-index={index}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`group flex items-start gap-3 rounded-[10px] p-2.5 transition-colors duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-black/[0.05] dark:bg-[#1E1E22] text-slate-900 dark:text-white"
                      : "hover:bg-black/[0.025] dark:hover:bg-white/[0.03] text-slate-700 dark:text-[#8E8C8B]"
                  }`}
                >
                  {/* Apple Squircle Item Icon */}
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-[8px] border transition-colors duration-150 ${
                      isSelected
                        ? "bg-white dark:bg-[#26262B] border-black/[0.08] dark:border-white/[0.12] shadow-xs"
                        : "bg-slate-100/80 dark:bg-[#1A1A1E] border-black/[0.04] dark:border-white/[0.06]"
                    }`}
                  >
                    {getCategoryIcon(item.iconName)}
                  </div>

                  {/* Text Details with Restrained Highlights */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.85rem] font-medium tracking-tight truncate text-slate-900 dark:text-[#F5F5F7]">
                        {titleChunks.map((chunk, idx) =>
                          chunk.isMatch ? (
                            <span
                              key={idx}
                              className="font-semibold text-[#007BA7] dark:text-white underline decoration-[#007BA7]/40 dark:decoration-white/40 underline-offset-2"
                            >
                              {chunk.text}
                            </span>
                          ) : (
                            <span key={idx}>{chunk.text}</span>
                          )
                        )}
                      </span>

                      {item.badge && (
                        <span className="hidden sm:inline-flex items-center rounded px-1.5 py-0.2 text-[0.62rem] font-medium text-slate-500 dark:text-[#8E8C8B] bg-black/[0.04] dark:bg-white/[0.05]">
                          {item.badge}
                        </span>
                      )}

                      <span className="ml-auto text-[0.68rem] font-normal text-slate-400 dark:text-[#636366] shrink-0">
                        {item.categoryLabel}
                      </span>
                    </div>

                    <p className="mt-0.5 text-[0.74rem] text-slate-500 dark:text-[#8E8C8B] line-clamp-1">
                      {descChunks.map((chunk, idx) =>
                        chunk.isMatch ? (
                          <span
                            key={idx}
                            className="font-medium text-[#007BA7] dark:text-[#CDCBCA]"
                          >
                            {chunk.text}
                          </span>
                        ) : (
                          <span key={idx}>{chunk.text}</span>
                        )
                      )}
                    </p>
                  </div>

                  {/* Subtle Selection Indicator */}
                  <div className="shrink-0 flex items-center self-center pl-1">
                    {isSelected && (
                      <div className="flex items-center gap-1 text-[0.68rem] font-medium text-slate-400 dark:text-[#8E8C8B]">
                        <span className="hidden sm:inline">{t.search.open}</span>
                        <CornerDownLeft size={11} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Apple-style Intentional Empty State */
          <div className="py-8 text-center px-4">
            <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1E1E22] text-slate-400 dark:text-[#8E8C8B]">
              <Search size={16} />
            </div>
            <h3 className="text-[0.88rem] font-medium text-slate-900 dark:text-[#F5F5F7]">
              {t.search.noResultsTitle}
            </h3>
            <p className="mt-0.5 text-[0.76rem] text-slate-500 dark:text-[#8E8C8B] max-w-xs mx-auto">
              {t.search.noResultsDesc} &ldquo;
              <span className="font-medium text-slate-800 dark:text-[#CDCBCA]">{query}</span>
              &rdquo;.
            </p>

            {/* Suggestions */}
            <div className="mt-4">
              <p className="text-[0.68rem] font-medium uppercase tracking-wider text-slate-400 dark:text-[#636366]">
                {t.search.trySearching}
              </p>
              <div className="mt-1.5 flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
                {["Student Portal", "Academia", "Capstones", "Fellowships"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQueryChange(term)}
                    className="rounded-full px-2.5 py-0.5 text-[0.72rem] font-medium border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.03] text-slate-600 dark:text-[#8E8C8B] hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.07] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spotlight Minimal Footer Bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2 text-[0.7rem] shrink-0 border-t border-black/[0.05] dark:border-white/[0.06] bg-black/[0.015] dark:bg-white/[0.015] text-slate-500 dark:text-[#8E8C8B]">
        <div className="flex items-center gap-2 truncate">
          <span className="text-slate-400 dark:text-[#636366]">{t.search.trending}</span>
          {POPULAR_SEARCH_TERMS.slice(0, 3).map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleQueryChange(term)}
              className="text-slate-600 dark:text-[#8E8C8B] hover:text-slate-900 dark:hover:text-white transition-colors truncate"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0 text-slate-400 dark:text-[#636366]">
          <span>
            <kbd className="font-sans px-1 py-0.2 rounded text-[0.62rem] bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-[#8E8C8B]">
              ↑↓
            </kbd>{" "}
            {t.search.navTip}
          </span>
          <span>
            <kbd className="font-sans px-1 py-0.2 rounded text-[0.62rem] bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-[#8E8C8B]">
              ↵
            </kbd>{" "}
            {t.search.selectTip}
          </span>
        </div>
      </div>
    </div>
  );
}
