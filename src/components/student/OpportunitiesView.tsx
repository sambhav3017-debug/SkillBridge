"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  Briefcase,
  CheckCircle2,
  Filter,
  Flame,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SearchX,
  Sparkles,
  X,
} from "lucide-react";
import { WORK_MODES, type Opportunity, type OppType, type WorkMode } from "@/lib/student/types";
import { useStudent } from "./StudentProvider";
import { OpportunityCard, OpportunityModal } from "./OpportunityParts";
import { EmptyState, ErrorNote } from "./ui";
import CareerDiscoveryScene3D from "./CareerDiscoveryScene3D";
import SearchInput from "@/components/ui/SearchInput";

type CategoryFilter = "All" | "Recommended" | OppType | "Saved" | "Applied";

export default function OpportunitiesView({ openId }: { openId?: string }) {
  const { opps, oppsError, loadOpps, data } = useStudent();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [mode, setMode] = useState<WorkMode | "">("");
  const [location, setLocation] = useState("");
  const [skill, setSkill] = useState("");
  const [sort, setSort] = useState<"match" | "newest" | "deadline" | "az">("match");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [viewId, setViewId] = useState<string | null>(openId ?? null);

  // Student's verified skills set
  const studentSkillNames = useMemo(
    () => new Set(data.skills.map((s) => s.name.toLowerCase())),
    [data.skills]
  );

  // Calculate matching skills count for an opportunity
  const getMatchCount = useMemo(() => {
    return (o: Opportunity) =>
      o.skills.filter((s) => studentSkillNames.has(s.toLowerCase())).length;
  }, [studentSkillNames]);

  // Unique filter options
  const locations = useMemo(
    () => Array.from(new Set((opps ?? []).map((o) => o.location))).sort(),
    [opps]
  );

  const allSkills = useMemo(
    () => Array.from(new Set((opps ?? []).flatMap((o) => o.skills))).sort(),
    [opps]
  );

  // KPI Statistics
  const stats = useMemo(() => {
    const list = opps ?? [];
    const totalCount = list.length;
    const matchCount = list.filter((o) => getMatchCount(o) > 0).length;
    const savedCount = data.saved.length;
    const appCount = data.applications.length;
    return { totalCount, matchCount, savedCount, appCount };
  }, [opps, getMatchCount, data.saved, data.applications]);

  // Filtered & Sorted Opportunities
  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const appliedIds = new Set(data.applications.map((a) => a.opportunityId));
    const savedIds = new Set(data.saved);

    return (opps ?? [])
      .filter((o) => {
        // Category filtering
        if (category === "Recommended") {
          if (getMatchCount(o) === 0) return false;
        } else if (category === "Saved") {
          if (!savedIds.has(o.id)) return false;
        } else if (category === "Applied") {
          if (!appliedIds.has(o.id)) return false;
        } else if (category !== "All") {
          if (o.type !== category) return false;
        }

        // Mode filter
        if (mode && o.mode !== mode) return false;

        // Location filter
        if (location && o.location !== location) return false;

        // Skill filter
        if (skill && !o.skills.includes(skill)) return false;

        // Search term
        if (term) {
          const haystack = [
            o.title,
            o.org,
            o.department ?? "",
            o.location,
            o.description,
            ...o.skills,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(term)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === "match") {
          const matchA = getMatchCount(a);
          const matchB = getMatchCount(b);
          if (matchB !== matchA) return matchB - matchA;
          // Tie-break with deadline
          return +new Date(a.deadline) - +new Date(b.deadline);
        }
        if (sort === "newest") {
          return +new Date(b.postedAt) - +new Date(a.postedAt);
        }
        if (sort === "deadline") {
          return +new Date(a.deadline) - +new Date(b.deadline);
        }
        if (sort === "az") {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [opps, q, category, mode, location, skill, sort, data.saved, data.applications, getMatchCount]);

  const hasActiveFilters = Boolean(
    q || category !== "All" || mode || location || skill || sort !== "match"
  );

  const clearAllFilters = () => {
    setQ("");
    setCategory("All");
    setMode("");
    setLocation("");
    setSkill("");
    setSort("match");
  };

  const viewing: Opportunity | null = opps?.find((o) => o.id === viewId) ?? null;

  return (
    <div className="space-y-6">
      {/* 1. Hero Gateway Banner with 3D Ambition Scene */}
      <section className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-white via-[#FFF7ED]/50 to-[#FFEDD5]/30 p-6 sm:p-8 shadow-[0_4px_20px_-4px_rgba(255,106,0,0.08),inset_0_1px_0_#FFFFFF] dark:border-white/10 dark:bg-gradient-to-br dark:from-[#0D121F] dark:via-[#11192C] dark:to-[#070B14] dark:shadow-[0_8px_32px_-8px_rgba(0,123,167,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]">
        {/* Ambient background glows */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#FF6A00]/10 blur-[80px] dark:bg-sb-cyan/15"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-[#FF9F1C]/10 blur-[80px] dark:bg-sb-pink/10"
          aria-hidden="true"
        />

        <div className="relative z-10 grid gap-6 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Headlines & Live KPI Stat Badges */}
          <div className="space-y-5 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6A00]/30 bg-[#FFF7ED] px-3 py-1 text-xs font-semibold text-[#FF6A00] shadow-sm dark:border-sb-cyan/30 dark:bg-sb-cyan/15 dark:text-sb-cyan">
              <Sparkles size={13} className="text-[#FF6A00] dark:text-sb-cyan animate-pulse" />
              <span>SkillBridge Career Gateway</span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
                Opportunity Discovery & Career Pathways
              </h1>
              <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-neutral-600 dark:text-neutral-300">
                Explore curated internships, capstone projects, and industry roles matched with your verified profile skills.
              </p>
            </div>

            {/* Live KPI Stat Badges */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-3 shadow-xs dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <Briefcase size={13} className="text-[#FF6A00] dark:text-sb-cyan" />
                  <span>Available</span>
                </div>
                <div id="kpi-available-count" className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.totalCount}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-3 shadow-xs dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <Flame size={13} className="text-amber-500 dark:text-sb-cyan" />
                  <span>Skill Matches</span>
                </div>
                <div id="kpi-matched-count" className="mt-1 text-xl font-bold text-[#FF6A00] dark:text-sb-cyan">
                  {stats.matchCount}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-3 shadow-xs dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <Bookmark size={13} className="text-purple-500" />
                  <span>Saved</span>
                </div>
                <div id="kpi-saved-count" className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.savedCount}
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200/80 bg-white/80 p-3 shadow-xs dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Applied</span>
                </div>
                <div id="kpi-applied-count" className="mt-1 text-xl font-bold text-neutral-900 dark:text-white">
                  {stats.appCount}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Ambition Prism Scene */}
          <div className="hidden sm:block lg:col-span-5">
            <div className="relative mx-auto flex h-[240px] w-full max-w-[360px] items-center justify-center rounded-2xl border border-neutral-200/60 bg-white/40 p-2 shadow-inner backdrop-blur-xs dark:border-white/10 dark:bg-white/[0.02]">
              <CareerDiscoveryScene3D className="h-full w-full" />
              <div className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-[10px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
                Interactive Ambition Node • Drag to Orbit
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Discovery Controls & Filters Bar */}
      <section className="space-y-4 rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-white/10 dark:bg-[#0D121F]">
        {/* Top Search Input & Layout Switcher */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <div className="flex-1">
            <SearchInput
              value={q}
              onChange={setQ}
              placeholder="Search by role title, company, skill, department, or keyword..."
              portalVariant="student"
            />
          </div>

          {/* Grid / List Layout Toggle */}
          <div className="flex items-center gap-1 self-end sm:self-auto rounded-lg border border-neutral-200 bg-neutral-100/70 p-0.5 dark:border-white/10 dark:bg-white/[0.04]">
            <button
              type="button"
              onClick={() => setLayout("grid")}
              className={`rounded-md p-1.5 transition ${
                layout === "grid"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setLayout("list")}
              className={`rounded-md p-1.5 transition ${
                layout === "list"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
              }`}
              title="List View"
              aria-label="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Primary Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { key: "All", label: "All Opportunities", count: stats.totalCount },
              { key: "Recommended", label: "★ Recommended", count: stats.matchCount },
              { key: "Internship", label: "Internships" },
              { key: "Full-time Job", label: "Full-time" },
              { key: "Project", label: "Projects" },
              { key: "Hackathon", label: "Hackathons" },
              { key: "Freelance", label: "Freelance" },
              { key: "Saved", label: "Saved", count: stats.savedCount },
              { key: "Applied", label: "Applied", count: stats.appCount },
            ] as const
          ).map((tab) => {
            const active = category === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setCategory(tab.key)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition active:scale-98 ${
                  active
                    ? "bg-[#FF6A00] text-white shadow-xs dark:bg-sb-blue dark:text-white"
                    : "border border-neutral-200/80 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-300 dark:hover:bg-white/[0.08] dark:hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                {"count" in tab && typeof tab.count === "number" && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-neutral-200 text-neutral-700 dark:bg-white/10 dark:text-neutral-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Filters Grid */}
        <div className="grid gap-3 pt-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Work Mode */}
          <div>
            <label htmlFor="mode-filter" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Work Mode
            </label>
            <select
              id="mode-filter"
              value={mode}
              onChange={(e) => setMode(e.target.value as WorkMode | "")}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-xs font-medium text-neutral-800 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200 dark:focus:border-sb-cyan"
            >
              <option value="">All Work Modes</option>
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location-filter" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Location
            </label>
            <select
              id="location-filter"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-xs font-medium text-neutral-800 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200 dark:focus:border-sb-cyan"
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Skill */}
          <div>
            <label htmlFor="skill-filter" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Specific Skill
            </label>
            <select
              id="skill-filter"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-xs font-medium text-neutral-800 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200 dark:focus:border-sb-cyan"
            >
              <option value="">Any Skill</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-filter" className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
              Sort By
            </label>
            <select
              id="sort-filter"
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as "match" | "newest" | "deadline" | "az")
              }
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50/80 px-3 py-2 text-xs font-medium text-neutral-800 transition focus:border-[#FF6A00] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/[0.04] dark:text-neutral-200 dark:focus:border-sb-cyan"
            >
              <option value="match">Best Skill Match</option>
              <option value="newest">Newest Listed</option>
              <option value="deadline">Application Deadline</option>
              <option value="az">Role Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Row & Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-neutral-100 dark:border-white/[0.06]">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-neutral-800 dark:text-white">
              Showing {results.length} of {opps?.length ?? 0} {results.length === 1 ? "role" : "roles"}
            </span>

            {hasActiveFilters && (
              <>
                <span className="text-neutral-400">•</span>
                <span className="text-neutral-500 dark:text-neutral-400">Filters:</span>

                {category !== "All" && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200">
                    Category: {category}
                    <button
                      type="button"
                      onClick={() => setCategory("All")}
                      className="hover:text-red-500"
                      aria-label="Remove category filter"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {mode && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200">
                    Mode: {mode}
                    <button
                      type="button"
                      onClick={() => setMode("")}
                      className="hover:text-red-500"
                      aria-label="Remove mode filter"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {location && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200">
                    Location: {location}
                    <button
                      type="button"
                      onClick={() => setLocation("")}
                      className="hover:text-red-500"
                      aria-label="Remove location filter"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {skill && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200">
                    Skill: {skill}
                    <button
                      type="button"
                      onClick={() => setSkill("")}
                      className="hover:text-red-500"
                      aria-label="Remove skill filter"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}

                {q && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-200">
                    Keyword: &quot;{q}&quot;
                    <button
                      type="button"
                      onClick={() => setQ("")}
                      className="hover:text-red-500"
                      aria-label="Remove search filter"
                    >
                      <X size={11} />
                    </button>
                  </span>
                )}
              </>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A00] hover:underline dark:text-sb-cyan"
            >
              <RotateCcw size={12} />
              Reset all filters
            </button>
          )}
        </div>
      </section>

      {/* 3. Opportunities Display Grid or Empty States */}
      {oppsError ? (
        <ErrorNote retry={loadOpps}>{oppsError}</ErrorNote>
      ) : !opps ? (
        <div
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          aria-busy="true"
          aria-label="Loading opportunities"
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-64 rounded-xl border border-neutral-200/60 bg-neutral-100/50 animate-pulse dark:border-white/10 dark:bg-white/[0.04]"
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? <SearchX size={26} /> : <Briefcase size={26} />}
          title={hasActiveFilters ? "No matching opportunities found" : "No opportunities available"}
          text={
            hasActiveFilters
              ? "We couldn't find any opportunities matching your selected combination of filters and keywords."
              : "There are currently no active opportunities listed. Please check back soon!"
          }
          action={
            hasActiveFilters ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                onClick={clearAllFilters}
              >
                <Filter size={13} />
                Clear all filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div
          className={`dash-entrance dash-delay-1 ${
            layout === "grid"
              ? "grid gap-5 md:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col gap-4"
          }`}
        >
          {results.map((o) => (
            <OpportunityCard
              key={o.id}
              o={o}
              layout={layout}
              onView={() => setViewId(o.id)}
            />
          ))}
        </div>
      )}

      {/* 4. Rich Opportunity Details Modal */}
      <OpportunityModal o={viewing} onClose={() => setViewId(null)} />
    </div>
  );
}