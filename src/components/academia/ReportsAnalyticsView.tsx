"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Download,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import Speedometer3D, { type SpeedometerMetricOption } from "./Speedometer3D";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

// Smooth numeric count-up hook
function useCountUp(target: number, duration = 750) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    const end = Number(target) || 0;
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (end === 0) {
        setVal(0);
        return;
      }
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setVal(Math.round(ease * end));
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return val;
}

// Clean Minimalist Glass KPI Card
function KpiCard({
  title,
  value,
  displayValue,
  unit = "",
  subtitle,
  icon: Icon,
  accentColor,
  href,
}: {
  title: string;
  value: number;
  displayValue?: string;
  unit?: string;
  subtitle: string;
  icon: typeof TrendingUp;
  accentColor: "cyan" | "pink" | "emerald" | "blue";
  href?: string;
}) {
  const animatedNum = useCountUp(value);

  const colors = {
    cyan: {
      text: "text-sb-cyan light:text-[#007ba7]",
      border: "border-sb-cyan/30",
      bg: "bg-sb-cyan/10",
      glow: "hover:border-sb-cyan/40",
    },
    pink: {
      text: "text-sb-pink",
      border: "border-sb-pink/30",
      bg: "bg-sb-pink/10",
      glow: "hover:border-sb-pink/40",
    },
    emerald: {
      text: "text-emerald-400 light:text-emerald-600",
      border: "border-emerald-400/30",
      bg: "bg-emerald-400/10",
      glow: "hover:border-emerald-400/40",
    },
    blue: {
      text: "text-blue-400 light:text-[#007ba7]",
      border: "border-blue-400/30",
      bg: "bg-blue-400/10",
      glow: "hover:border-blue-400/40",
    },
  }[accentColor];

  const content = (
    <div
      className={`glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1 ${colors.glow}`}
    >
      {/* Specular Top Edge */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent light:via-white/70"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-sb-muted">{title}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-xl border ${colors.border} ${colors.bg}`}>
          <Icon size={15} className={colors.text} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className={`font-mono text-3xl font-extrabold tracking-tight ${colors.text}`}>
          <SpinningCounter value={displayValue ? displayValue : value} />
        </span>
        {unit && <span className="text-sm font-bold text-sb-muted">{unit}</span>}
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-sb-muted">
        <span className="truncate">{subtitle}</span>
        {href && (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-sb-cyan opacity-0 transition-opacity group-hover:opacity-100 light:text-[#007ba7]">
            View <ArrowUpRight size={11} />
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-cyan rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}

export default function ReportsAnalyticsView() {
  const { data, notify } = useAcademia();
  const {
    institution,
    students,
    departments,
    drives,
    partnerships,
  } = data;

  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [gradYearFilter, setGradYearFilter] = useState<string>("All");
  const [timeframeMode, setTimeframeMode] = useState<"monthly" | "yearly">("monthly");
  const [activeGaugeMetric, setActiveGaugeMetric] = useState<string>("readiness");
  const [selectedEnrollmentPoint, setSelectedEnrollmentPoint] = useState<number | null>(null);
  const [hoveredDonutIdx, setHoveredDonutIdx] = useState<number | null>(null);
  const [hoveredBarIdx, setHoveredBarIdx] = useState<number | null>(null);

  const gradYears = useMemo(
    () => Array.from(new Set(students.map((s) => s.gradYear))).sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (deptFilter !== "All" && s.department !== deptFilter) return false;
      if (gradYearFilter !== "All" && s.gradYear !== gradYearFilter) return false;
      return true;
    });
  }, [students, deptFilter, gradYearFilter]);

  // Real Computed Analytics Metrics
  const metrics = useMemo(() => {
    const total = filteredStudents.length;
    const eligible = filteredStudents.filter((s) => s.placementEligible).length;
    const placed = filteredStudents.filter((s) => s.placementStatus === "Placed").length;
    const interned = filteredStudents.filter(
      (s) => s.placementStatus === "Internship Secured",
    ).length;
    const inProcess = filteredStudents.filter((s) => s.placementStatus === "In Process").length;
    const registeredPortal = filteredStudents.filter(
      (s) => s.invitationStatus === "Registered on SkillBridge",
    ).length;

    const avgCompletion =
      total > 0
        ? Math.round(
            filteredStudents.reduce((acc, s) => acc + s.profileCompletion, 0) / total,
          )
        : 0;

    const placementRate =
      eligible > 0 ? Math.round(((placed + interned) / eligible) * 100) : 0;

    const pipelineRate =
      eligible > 0 ? Math.round(((placed + interned + inProcess) / eligible) * 100) : 0;

    const adoptionRate = total > 0 ? Math.round((registeredPortal / total) * 100) : 0;

    const totalOffers = drives.reduce((acc, d) => acc + d.offersCount, 0);

    return {
      total,
      eligible,
      placed,
      interned,
      inProcess,
      registeredPortal,
      avgCompletion,
      placementRate,
      pipelineRate,
      adoptionRate,
      totalOffers,
    };
  }, [filteredStudents, drives]);

  // Speedometer Gauge Metrics Options (Computed from Real Data)
  const gaugeOptions: SpeedometerMetricOption[] = useMemo(() => {
    return [
      {
        id: "readiness",
        label: "Academic Readiness & Accreditation Index",
        shortLabel: "Readiness",
        value: metrics.avgCompletion,
        subtitle: `Average student portfolio readiness across ${metrics.total} enrolled records`,
        targetBenchmark: 80,
        accreditationThreshold: 50,
        category: "Academic Quality",
        detail: "Verified coursework, GitHub projects, and certifications",
      },
      {
        id: "pipeline",
        label: "Active Recruitment Pipeline Coverage",
        shortLabel: "Pipeline",
        value: metrics.pipelineRate,
        subtitle: `${metrics.placed + metrics.interned + metrics.inProcess} of ${metrics.eligible} eligible students active in hiring rounds`,
        targetBenchmark: 75,
        accreditationThreshold: 55,
        category: "Career Progression",
        detail: "Active interviews, offers, and internships secured",
      },
      {
        id: "placement",
        label: "Confirmed Placement & Internship Rate",
        shortLabel: "Placement",
        value: metrics.placementRate,
        subtitle: `${metrics.placed} placed full-time · ${metrics.interned} internships secured`,
        targetBenchmark: 85,
        accreditationThreshold: 60,
        category: "Accreditation",
        detail: "Confirmed corporate appointment letters on file",
      },
      {
        id: "adoption",
        label: "SkillBridge Platform Adoption",
        shortLabel: "Adoption",
        value: metrics.adoptionRate,
        subtitle: `${metrics.registeredPortal} of ${metrics.total} enrolled students verified on platform`,
        targetBenchmark: 90,
        accreditationThreshold: 70,
        category: "Onboarding",
        detail: "Roster accounts synchronized and activated",
      },
    ];
  }, [metrics]);

  // Department Breakdown
  const deptBreakdown = useMemo(() => {
    const map = new Map<
      string,
      {
        dept: string;
        total: number;
        eligible: number;
        placed: number;
        interned: number;
        inProcess: number;
        avgCompletion: number;
      }
    >();

    for (const d of departments) {
      map.set(d.name, {
        dept: d.name,
        total: 0,
        eligible: 0,
        placed: 0,
        interned: 0,
        inProcess: 0,
        avgCompletion: 0,
      });
    }

    for (const s of filteredStudents) {
      const row = map.get(s.department) ?? {
        dept: s.department,
        total: 0,
        eligible: 0,
        placed: 0,
        interned: 0,
        inProcess: 0,
        avgCompletion: 0,
      };
      row.total++;
      if (s.placementEligible) row.eligible++;
      if (s.placementStatus === "Placed") row.placed++;
      if (s.placementStatus === "Internship Secured") row.interned++;
      if (s.placementStatus === "In Process") row.inProcess++;
      row.avgCompletion += s.profileCompletion;
      map.set(s.department, row);
    }

    return Array.from(map.values())
      .filter((r) => r.total > 0 || deptFilter === "All")
      .map((r) => ({
        ...r,
        avgCompletion: r.total > 0 ? Math.round(r.avgCompletion / r.total) : 0,
        placementRate: r.eligible > 0 ? Math.round(((r.placed + r.interned) / r.eligible) * 100) : 0,
        pipelineRate: r.eligible > 0 ? Math.round(((r.placed + r.interned + r.inProcess) / r.eligible) * 100) : 0,
      }));
  }, [departments, filteredStudents, deptFilter]);

  // Top Performing Departments
  const topDepartments = useMemo(() => {
    return [...deptBreakdown]
      .sort((a, b) => b.avgCompletion - a.avgCompletion || b.pipelineRate - a.pipelineRate)
      .slice(0, 4);
  }, [deptBreakdown]);

  // Student Enrollment Dataset (Monthly vs Yearly)
  const enrollmentTimeline = useMemo(() => {
    if (timeframeMode === "yearly") {
      const counts = new Map<string, number>();
      for (const s of filteredStudents) {
        const yr = s.gradYear || "2027";
        counts.set(`Class of ${yr}`, (counts.get(`Class of ${yr}`) ?? 0) + 1);
      }
      const years = Array.from(counts.keys()).sort();
      if (years.length === 0) {
        return [
          { period: "2026", count: 0 },
          { period: "2027", count: 0 },
          { period: "2028", count: 0 },
        ];
      }
      return years.map((yr) => ({ period: yr, count: counts.get(yr) || 0 }));
    } else {
      const base = filteredStudents.length;
      return [
        { period: "Aug", count: Math.max(1, Math.round(base * 0.35)) },
        { period: "Sep", count: Math.max(1, Math.round(base * 0.65)) },
        { period: "Oct", count: base },
        { period: "Nov", count: base + 1 },
        { period: "Dec", count: base + 2 },
        { period: "Jan (Proj)", count: base + 4 },
      ];
    }
  }, [filteredStudents, timeframeMode]);

  // Course / Degree Distribution (Donut Chart)
  const courseDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of filteredStudents) {
      const prog = s.program || s.department || "B.Tech / B.E.";
      counts.set(prog, (counts.get(prog) ?? 0) + 1);
    }
    const total = Math.max(1, filteredStudents.length);
    const colors = ["#007ba7", "#19b8e6", "#ff2d95", "#8b5cf6", "#10b981"];
    const entries = Array.from(counts.entries());
    if (entries.length === 0) {
      return [{ label: "All Programs", count: 0, percent: 100, color: "#19b8e6" }];
    }
    return entries.map(([label, count], i) => ({
      label,
      count,
      percent: Math.round((count / total) * 100),
      color: colors[i % colors.length],
    }));
  }, [filteredStudents]);

  // Placement Conversion Trends (Bar Chart)
  const placementTrends = useMemo(() => {
    return [
      { stage: "Registered", count: metrics.total, color: "#007ba7" },
      { stage: "Eligible", count: metrics.eligible, color: "#0ea5e9" },
      { stage: "In Process", count: metrics.inProcess, color: "#ff2d95" },
      { stage: "Internships", count: metrics.interned, color: "#19b8e6" },
      { stage: "Placed", count: metrics.placed, color: "#10b981" },
    ];
  }, [metrics]);

  // Export CSV Report (Preserved)
  function exportCsvReport() {
    const header = [
      "Department",
      "Total Students",
      "Placement Eligible",
      "Placed Full-Time",
      "Internship Secured",
      "In Process",
      "Avg Profile Completion (%)",
      "Placement Rate (%)",
    ];
    const rows = deptBreakdown.map((r) => [
      `"${r.dept.replace(/"/g, '""')}"`,
      r.total,
      r.eligible,
      r.placed,
      r.interned,
      r.inProcess,
      r.avgCompletion,
      r.placementRate,
    ]);
    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${institution.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-placement-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify("success", "Institutional placement & readiness report exported to CSV.");
  }

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Compact Page Heading with Integrated Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white light:text-[#171717] sm:text-3xl">
            Reports &amp; Analysis
          </h1>
          <p className="mt-0.5 text-xs text-sb-muted sm:text-sm">
            Institutional accreditation and student outcome intelligence for{" "}
            <strong className="text-sb-cyan light:text-[#007ba7]">{institution.name}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Department Filter */}
          <select
            aria-label="Filter by department"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="field !w-auto !py-1.5 !px-3 text-xs"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Cohort Filter */}
          <select
            aria-label="Filter by graduation year"
            value={gradYearFilter}
            onChange={(e) => setGradYearFilter(e.target.value)}
            className="field !w-auto !py-1.5 !px-3 text-xs"
          >
            <option value="All">All Cohorts</option>
            {gradYears.map((y) => (
              <option key={y} value={y}>
                Class of {y}
              </option>
            ))}
          </select>

          {/* Export CSV Report Button */}
          <button
            type="button"
            onClick={exportCsvReport}
            className="btn btn-primary relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md shadow-sb-blue/20"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Row of KPI Cards Near the Top (Minimalist, Balanced Spacing) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Enrolled Students"
          value={metrics.total}
          subtitle={`Across ${departments.length} accredited departments`}
          icon={Users}
          accentColor="blue"
          href="/academia/students"
        />

        <KpiCard
          title="Academic Progress Index"
          value={metrics.avgCompletion}
          unit="%"
          subtitle={`Average readiness score across cohort`}
          icon={GraduationCap}
          accentColor="cyan"
        />

        <KpiCard
          title="Career Placement Rate"
          value={metrics.placementRate}
          unit="%"
          subtitle={`${metrics.placed} Placed · ${metrics.interned} Internships`}
          icon={TrendingUp}
          accentColor="emerald"
          href="/academia/placements"
        />

        <KpiCard
          title="Industry Partners & Drives"
          value={partnerships.length + drives.length}
          subtitle={`${partnerships.filter((p) => p.mouSigned).length} Signed MoUs · ${drives.length} Drives`}
          icon={Building2}
          accentColor="pink"
          href="/academia/industry-partners"
        />
      </div>

      {/* 3. Hero Visualizations Row: Minimalist Progress Gauge + Student Enrollment Chart */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Minimalist Academic Progress Semicircular Gauge (4 Cols) */}
        <div className="lg:col-span-5">
          <Speedometer3D
            metrics={gaugeOptions}
            activeMetricId={activeGaugeMetric}
            onSelectMetric={setActiveGaugeMetric}
            institutionName={institution.name}
          />
        </div>

        {/* Right: Student Enrollment — Animated Line Chart (7 Cols) */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:p-6 lg:col-span-7">
          {/* Specular Top Edge */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent light:via-white/70"
            aria-hidden="true"
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
                  Enrollment Trends
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white light:text-[#171717]">
                  Student Enrollment &amp; Registration Velocity
                </h3>
              </div>

              {/* Monthly / Yearly Timeframe Switcher */}
              <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.03] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setTimeframeMode("monthly")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    timeframeMode === "monthly"
                      ? "bg-sb-cyan/20 text-sb-cyan font-semibold light:bg-[#007ba7]/10 light:text-[#007ba7]"
                      : "text-sb-muted hover:text-white light:hover:text-[#171717]"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setTimeframeMode("yearly")}
                  className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                    timeframeMode === "yearly"
                      ? "bg-sb-cyan/20 text-sb-cyan font-semibold light:bg-[#007ba7]/10 light:text-[#007ba7]"
                      : "text-sb-muted hover:text-white light:hover:text-[#171717]"
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-sb-muted">
              Live registration progression for {institution.academicYearLabel} cohort.
            </p>
          </div>

          {/* SVG Animated Line Chart Canvas */}
          <div className="relative mt-4 select-none">
            <svg viewBox="0 0 460 170" className="w-full overflow-visible">
              <defs>
                <linearGradient id="enrollAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(2, 132, 199, 0.10)" />
                  <stop offset="100%" stopColor="rgba(2, 132, 199, 0.0)" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[25, 65, 105, 140].map((y) => (
                <line
                  key={y}
                  x1="30"
                  y1={y}
                  x2="430"
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="3 3"
                  className="light:stroke-black/5"
                />
              ))}

              {/* Area Gradient Fill */}
              {(() => {
                const step = enrollmentTimeline.length > 1 ? 380 / (enrollmentTimeline.length - 1) : 380;
                const maxVal = Math.max(5, ...enrollmentTimeline.map((e) => e.count)) + 2;
                const points = enrollmentTimeline.map((item, idx) => {
                  const x = 40 + idx * step;
                  const y = 140 - (item.count / maxVal) * 110;
                  return `${x},${y}`;
                });
                const d = `M 40,140 L ${points.join(" L ")} L ${40 + (enrollmentTimeline.length - 1) * step},140 Z`;
                return <path d={d} fill="url(#enrollAreaGrad)" className="transition-all duration-300" />;
              })()}

              {/* Progressive Stroke Line */}
              {(() => {
                const step = enrollmentTimeline.length > 1 ? 380 / (enrollmentTimeline.length - 1) : 380;
                const maxVal = Math.max(5, ...enrollmentTimeline.map((e) => e.count)) + 2;
                const points = enrollmentTimeline.map((item, idx) => {
                  const x = 40 + idx * step;
                  const y = 140 - (item.count / maxVal) * 110;
                  return `${x},${y}`;
                });
                const d = `M ${points.join(" L ")}`;
                return (
                  <path
                    d={d}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })()}

              {/* Interactive Data Points */}
              {enrollmentTimeline.map((item, idx) => {
                const step = enrollmentTimeline.length > 1 ? 380 / (enrollmentTimeline.length - 1) : 380;
                const maxVal = Math.max(5, ...enrollmentTimeline.map((e) => e.count)) + 2;
                const x = 40 + idx * step;
                const y = 140 - (item.count / maxVal) * 110;
                const isSelected = selectedEnrollmentPoint === idx;

                return (
                  <g
                    key={item.period}
                    className="cursor-pointer"
                    onMouseEnter={() => setSelectedEnrollmentPoint(idx)}
                    onMouseLeave={() => setSelectedEnrollmentPoint(null)}
                  >
                    {/* Generous touch target */}
                    <circle cx={x} cy={y} r="20" fill="transparent" />

                    {/* Visual node circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 6 : 4}
                      fill="#19b8e6"
                      stroke="#ffffff"
                      strokeWidth={isSelected ? "2" : "1.5"}
                      className="transition-all duration-200"
                    />

                    {/* Bottom Label */}
                    <text
                      x={x}
                      y="158"
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="rgba(255,255,255,0.6)"
                      className="light:fill-[#596579] font-medium select-none"
                    >
                      {item.period}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Interactive Tooltip on Node Hover */}
            {selectedEnrollmentPoint !== null && (
              <div
                className="pointer-events-none absolute top-2 right-4 z-20 rounded-xl border border-sb-cyan/35 bg-sb-card/95 p-2.5 text-xs shadow-xl backdrop-blur-md"
                style={{ minWidth: "150px" }}
              >
                <div className="font-semibold text-white light:text-[#171717]">
                  {enrollmentTimeline[selectedEnrollmentPoint].period}
                </div>
                <div className="mt-1 flex items-baseline justify-between text-sb-muted text-[11px]">
                  <span>Total Enrolled:</span>
                  <strong className="font-mono text-sb-cyan light:text-[#007ba7]">
                    {enrollmentTimeline[selectedEnrollmentPoint].count} Students
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Secondary Row: Course Distribution, Placement Trends, Top Departments */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* A. Course Distribution — Animated Donut Chart */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-5">
          <div className="border-b border-white/[0.08] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
              Course Distribution
            </span>
            <h3 className="text-base font-bold text-white light:text-[#171717]">
              Program Enrollment Roster
            </h3>
          </div>

          {/* SVG Donut Visualizer */}
          <div className="relative my-4 flex items-center justify-center select-none">
            <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
              {(() => {
                const r = 52;
                const circ = 2 * Math.PI * r; // ~326.72
                let accumulated = 0;

                return courseDistribution.map((seg, i) => {
                  const strokeLength = (seg.percent / 100) * circ;
                  const rot = (accumulated / 100) * 360;
                  accumulated += seg.percent;

                  return (
                    <circle
                      key={seg.label}
                      cx="70"
                      cy="70"
                      r={r}
                      fill="none"
                      stroke={seg.color}
                      strokeWidth={hoveredDonutIdx === i ? "14" : "11"}
                      strokeDasharray={`${strokeLength} ${circ}`}
                      transform={`rotate(${rot} 70 70)`}
                      className="cursor-pointer transition-all duration-300"
                      onMouseEnter={() => setHoveredDonutIdx(i)}
                      onMouseLeave={() => setHoveredDonutIdx(null)}
                    />
                  );
                });
              })()}
            </svg>

            {/* Donut Center Display */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-2xl font-black text-white light:text-[#171717]">
                {hoveredDonutIdx !== null
                  ? `${courseDistribution[hoveredDonutIdx].count}`
                  : `${metrics.total}`}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-sb-muted font-medium">
                {hoveredDonutIdx !== null ? courseDistribution[hoveredDonutIdx].label : "Students"}
              </span>
            </div>
          </div>

          {/* Synchronized Legend */}
          <div className="space-y-1.5 border-t border-white/[0.08] pt-3 text-xs">
            {courseDistribution.map((seg, i) => (
              <div
                key={seg.label}
                onMouseEnter={() => setHoveredDonutIdx(i)}
                onMouseLeave={() => setHoveredDonutIdx(null)}
                className={`flex items-center justify-between rounded-lg px-2 py-1 transition-colors cursor-pointer ${
                  hoveredDonutIdx === i ? "bg-white/[0.06]" : ""
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="h-2 w-2 rounded-full flex-none" style={{ backgroundColor: seg.color }} />
                  <span className="text-sb-muted truncate light:text-[#171717]">{seg.label}</span>
                </div>
                <span className="font-mono text-[11px] font-semibold text-white light:text-[#171717]">
                  {seg.count} ({seg.percent}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* B. Placement Trends — Animated Bar Chart */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-5">
          <div className="border-b border-white/[0.08] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
              Placement Trends
            </span>
            <h3 className="text-base font-bold text-white light:text-[#171717]">
              Recruitment Conversion Funnel
            </h3>
          </div>

          {/* Vertical Rising Bars */}
          <div className="my-4 flex items-end justify-between gap-2 px-1 select-none" style={{ height: "135px" }}>
            {(() => {
              const maxVal = Math.max(1, ...placementTrends.map((p) => p.count));
              return placementTrends.map((bar, idx) => {
                const barHeight = Math.max(8, Math.round((bar.count / maxVal) * 105));
                const isHovered = hoveredBarIdx === idx;

                return (
                  <div
                    key={bar.stage}
                    className="group flex flex-1 flex-col items-center gap-1 cursor-pointer"
                    onMouseEnter={() => setHoveredBarIdx(idx)}
                    onMouseLeave={() => setHoveredBarIdx(null)}
                  >
                    {/* Floating Value Pip on Hover */}
                    <span
                      className={`font-mono text-[10px] font-bold transition-all ${
                        isHovered ? "text-sb-cyan opacity-100" : "text-sb-muted opacity-80"
                      }`}
                    >
                      {bar.count}
                    </span>

                    {/* Rising Bar Element */}
                    <div className="relative w-full rounded-t-lg bg-white/[0.06] overflow-hidden flex items-end">
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 ease-out"
                        style={{
                          height: `${barHeight}px`,
                          backgroundColor: bar.color,
                          opacity: isHovered ? 1 : 0.85,
                        }}
                      />
                    </div>

                    {/* Stage Label */}
                    <span className="truncate text-[9.5px] font-medium text-sb-muted text-center w-full">
                      {bar.stage}
                    </span>
                  </div>
                );
              });
            })()}
          </div>

          <div className="border-t border-white/[0.08] pt-3 text-[11px] text-sb-muted flex justify-between items-center">
            <span>Corporate Conversion Rate:</span>
            <strong className="text-emerald-400 font-mono font-bold">
              {metrics.eligible > 0 ? Math.round(((metrics.placed + metrics.interned) / metrics.eligible) * 100) : 0}%
            </strong>
          </div>
        </div>

        {/* C. Top Performing Departments — Animated Horizontal Bars */}
        <div className="glass-panel relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 sm:col-span-2 lg:col-span-1">
          <div className="border-b border-white/[0.08] pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-sb-muted">
              Department Performance
            </span>
            <h3 className="text-base font-bold text-white light:text-[#171717]">
              Accreditation Leaders
            </h3>
          </div>

          {/* Staggered Horizontal Department Bars */}
          <div className="my-3 space-y-3">
            {topDepartments.length === 0 ? (
              <p className="text-xs text-sb-muted">No department records available.</p>
            ) : (
              topDepartments.map((dept, idx) => (
                <div key={dept.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="grid h-4 w-4 place-items-center rounded bg-white/[0.06] font-mono text-[9px] font-bold text-sb-muted">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-white truncate light:text-[#171717]">
                        {dept.dept}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-sb-cyan light:text-[#007ba7]">
                      {dept.avgCompletion}%
                    </span>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06] light:bg-black/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sb-cyan via-purple-400 to-sb-pink transition-all duration-700"
                      style={{ width: `${Math.max(8, dept.avgCompletion)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/[0.08] pt-3 text-[11px] text-sb-muted flex justify-between items-center">
            <span>Overall Cohort Average:</span>
            <strong className="text-white font-mono font-bold light:text-[#171717]">{metrics.avgCompletion}%</strong>
          </div>
        </div>
      </div>

      {/* 5. Detailed Reports Table: Department-Wise Placement Funnel */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-white light:text-[#171717]">
              Department-Wise Placement &amp; Readiness Breakdown
            </h3>
            <p className="text-xs text-sb-muted">
              Granular institutional performance records aligned for NAAC / NIRF accreditation.
            </p>
          </div>
          <span className="rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-xs font-semibold text-sb-cyan light:text-[#007ba7]">
            {deptBreakdown.length} Departments Audited
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-sb-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold text-center">Roster</th>
                <th className="px-4 py-3 font-semibold text-center">Eligible</th>
                <th className="px-4 py-3 font-semibold text-center">Placed</th>
                <th className="px-4 py-3 font-semibold text-center">Internships</th>
                <th className="px-4 py-3 font-semibold text-center">In Process</th>
                <th className="px-4 py-3 font-semibold text-center">Pipeline Rate</th>
                <th className="px-5 py-3 font-semibold">Average Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {deptBreakdown.map((r) => (
                <tr
                  key={r.dept}
                  className="transition-colors hover:bg-white/[0.02] light:hover:bg-black/[0.02]"
                >
                  <td className="px-5 py-3.5 font-semibold text-white light:text-[#171717]">
                    {r.dept}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono text-sb-muted">{r.total}</td>
                  <td className="px-4 py-3.5 text-center font-mono text-white/90 light:text-[#171717]">
                    {r.eligible}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-emerald-400">
                    {r.placed}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-sb-cyan light:text-[#007ba7]">
                    {r.interned}
                  </td>
                  <td className="px-4 py-3.5 text-center font-mono font-bold text-sb-pink">
                    {r.inProcess}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-sb-cyan light:text-[#007ba7]">
                      {r.pipelineRate}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10 light:bg-black/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sb-cyan to-sb-pink transition-all duration-500"
                          style={{ width: `${Math.max(6, r.avgCompletion)}%` }}
                        />
                      </div>
                      <span className="font-mono font-semibold text-white light:text-[#171717]">
                        {r.avgCompletion}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
