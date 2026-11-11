"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Award,
  BarChart3,
  Building2,
  Calendar,
  GraduationCap,
  Handshake,
  Landmark,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import { InstitutionVerificationBadge } from "./AcademiaOnboardingWizard";
import AnimatedNumber from "@/components/motion/AnimatedNumber";
import { triggerMilestoneCelebration } from "@/lib/motion";
import { formatAcademicName, getISTGreeting } from "@/lib/utils/greeting";
import { useInteractiveTilt } from "@/components/student/useInteractiveTilt";
import UniversityEmblem3D from "./UniversityEmblem3D";
import AcademiaKpiCard3D from "./AcademiaKpiCard3D";
import AcademiaFilterBar from "./dashboard/AcademiaFilterBar";
import StudentEnrollmentChart from "./dashboard/StudentEnrollmentChart";
import CoursesProgramsChart from "./dashboard/CoursesProgramsChart";
import FacultyActivitySection from "./dashboard/FacultyActivitySection";
import PendingApprovalsModule from "./dashboard/PendingApprovalsModule";
import AcademicPerformanceSection from "./dashboard/AcademicPerformanceSection";
import OperationalFeedSection from "./dashboard/OperationalFeedSection";
import AcademiaLearningAnalyticsSection from "./dashboard/AcademiaLearningAnalyticsSection";
import { INITIAL_ACADEMIA_FILTERS, type AcademiaFilterState } from "./dashboard/types";

export default function AcademiaDashboardView() {
  const { data, managePlacements, notify } = useAcademia();
  const {
    staff,
    institution,
    departments,
    faculty,
    students,
    drives,
    partnerships,
    academicOpportunities,
    events,
    announcements,
    auditLog,
    industryJobs,
    industryCampusEvents,
  } = data;

  const [filters, setFilters] = useState<AcademiaFilterState>(INITIAL_ACADEMIA_FILTERS);
  const [now] = useState(() => Date.now());

  // Dynamic time-based greeting strictly in Indian Standard Time (Asia/Kolkata)
  const [greeting, setGreeting] = useState<string>(() => getISTGreeting());

  useEffect(() => {
    // Automatically update greeting when time crosses period boundary (5am, 12pm, 5pm, 9pm IST)
    const interval = setInterval(() => {
      const nextGreeting = getISTGreeting();
      setGreeting((prev) => (prev !== nextGreeting ? nextGreeting : prev));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const academicName = formatAcademicName(staff?.name, staff?.designation);
  const fullGreetingText = academicName ? `${greeting}, ${academicName}` : greeting;

  // Interactive 3D tilt aligned with Student Dashboard Welcome Banner
  const {
    cardRef,
    tilt,
    prefersReduced,
    handlePointerMove,
    handlePointerLeave,
    transformStyle,
  } = useInteractiveTilt({
    maxDeg: 3.5,
    perspective: 1200,
    translateY: -2,
  });

  // Available graduation years from student records
  const gradYears = useMemo(() => {
    const set = new Set<string>();
    for (const s of students) {
      if (s.gradYear) set.add(s.gradYear);
    }
    return Array.from(set).sort();
  }, [students]);

  // Coordinated filtering logic across student records
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Department filter
      if (filters.department !== "All" && s.department !== filters.department) {
        return false;
      }
      // 2. Graduation Cohort filter
      if (filters.gradYear !== "All" && s.gradYear !== filters.gradYear) {
        return false;
      }
      // 3. Placement Status filter
      if (filters.placementStatus !== "All") {
        if (filters.placementStatus === "Eligible" && !s.placementEligible) return false;
        if (filters.placementStatus === "In Process" && s.placementStatus !== "In Process") return false;
        if (filters.placementStatus === "Placed" && s.placementStatus !== "Placed") return false;
        if (filters.placementStatus === "Internship Secured" && s.placementStatus !== "Internship Secured") return false;
        if (filters.placementStatus === "Not Eligible" && s.placementStatus !== "Not Eligible" && s.placementStatus !== "Higher Studies / Opted Out") return false;
      }
      // 4. Time Horizon filter
      if (filters.timeHorizon === "30d" || filters.timeHorizon === "90d") {
        const days = filters.timeHorizon === "30d" ? 30 : 90;
        const cutoff = now - days * 24 * 3600 * 1000;
        const created = new Date(s.createdAt).getTime();
        if (!Number.isNaN(created) && created < cutoff) return false;
      }
      return true;
    });
  }, [students, filters, now]);

  // KPI computations based on active filters
  const eligibleStudentsCount = useMemo(
    () => filteredStudents.filter((s) => s.placementEligible).length,
    [filteredStudents],
  );

  const placedCount = useMemo(
    () =>
      filteredStudents.filter(
        (s) => s.placementStatus === "Placed" || s.placementStatus === "Internship Secured",
      ).length,
    [filteredStudents],
  );

  const inProcessCount = useMemo(
    () => filteredStudents.filter((s) => s.placementStatus === "In Process").length,
    [filteredStudents],
  );

  const placementRate = useMemo(
    () => (eligibleStudentsCount > 0 ? Math.round((placedCount / eligibleStudentsCount) * 100) : 0),
    [eligibleStudentsCount, placedCount],
  );

  const activePartnersCount = useMemo(
    () => partnerships.filter((p) => p.status === "Active" || p.status === "In Discussion").length,
    [partnerships],
  );

  // Approval handler for industry campus drives
  const handleApproveIndustryEvent = async (eventId: string, title: string) => {
    const res = await managePlacements({ approveIndustryEventId: eventId }, "PATCH");
    if (res.ok) {
      triggerMilestoneCelebration();
      notify("success", `Approved industry campus event “${title}”.`);
    } else {
      notify("error", res.error);
    }
  };

  const handleResetFilters = () => {
    setFilters(INITIAL_ACADEMIA_FILTERS);
  };

  return (
    <div className="space-y-6">
      {/* 1. Administrative Command Center Hero Banner & External Action Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-both">
        {/* Resized Welcome Banner — Proportioned to Match Student Dashboard Banner */}
        <section
          ref={cardRef}
          id="academia-welcome-banner"
          data-keep-white="true"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          aria-label="Institution overview command center"
          style={transformStyle}
          className={`lg:col-span-8 group relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 sm:p-7 outline-none transition-all duration-300 select-none ${
            tilt
              ? "shadow-[0_24px_60px_-15px_rgba(79,70,229,0.35)] dark:shadow-[0_24px_60px_-15px_rgba(0,123,167,0.35)]"
              : "shadow-[0_16px_40px_-12px_rgba(79,70,229,0.22)] dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6)]"
          }`}
        >
          {/* Dynamic Multi-stop Academic Gradient: Deep Royal Indigo & Electric Blue in Light Mode; Deep Midnight/Sapphire in Dark Mode */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#312E81] to-[#4338CA] dark:from-[#0B1020] dark:via-[#101935] dark:to-[#070B14] transition-colors duration-500"
            aria-hidden="true"
          />

          {/* Ambient Academic Light Blooms (Cerulean, Violet, and Warm Amber Glow) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 -top-24 h-80 w-80 rounded-full bg-[#38BDF8]/25 blur-[90px] dark:bg-[#007BA7]/20 dark:blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-[#818CF8]/30 blur-[100px] dark:bg-[#6366F1]/20 dark:blur-[110px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/3 -translate-y-1/2 h-64 w-64 rounded-full bg-[#F59E0B]/15 blur-[80px] dark:bg-[#38BDF8]/15 dark:blur-[90px]"
          />

          {/* Luminous Sweep Highlight across banner surface */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full animate-[shimmer_8s_infinite] select-none"
          />

          {/* Dynamic Mouse-Synchronized Surface Illumination */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out"
            style={{
              opacity: tilt && !prefersReduced ? 1 : 0,
              background: `radial-gradient(550px circle at ${tilt?.px ?? 50}% ${tilt?.py ?? 50}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 140, 0, 0.15) 40%, transparent 75%)`,
            }}
            aria-hidden="true"
          />

          {/* Top Specular Edge Highlight following cursor */}
          <div
            className="pointer-events-none absolute -top-px h-[2px] rounded-full transition-all duration-150 ease-out"
            style={{
              left: tilt && !prefersReduced ? `calc(${tilt.px}% - 90px)` : "calc(50% - 70px)",
              width: tilt && !prefersReduced ? "180px" : "140px",
              background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9) 50%, transparent)",
              opacity: tilt && !prefersReduced ? 1 : 0.5,
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 h-full text-white">
            <div className="flex-1 flex flex-col justify-between h-full min-w-0 pr-2">
              <div>
                {/* Institution Context Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold text-white/95 backdrop-blur-sm">
                    <Landmark size={13} className="text-white/90" /> {institution.name}
                  </span>
                  <InstitutionVerificationBadge status={institution.verificationStatus} />
                  <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-xs text-white font-semibold backdrop-blur-sm shadow-xs">
                    AY {institution.academicYearLabel}
                  </span>
                </div>

                {/* Dynamic Headline Greeting */}
                <h1
                  className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                  aria-label={fullGreetingText}
                >
                  <span className="text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">{greeting}</span>
                  {academicName ? (
                    <>
                      ,{" "}
                      <span className="text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)]">
                        {academicName}
                      </span>
                    </>
                  ) : null}
                </h1>
              </div>

              {/* Floating 3D Micro-Badges for Tangible Academic Distinction */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-50/95 dark:border-amber-300/30 dark:bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-950 dark:text-amber-200 backdrop-blur-md shadow-xs transition-colors">
                  <ShieldCheck size={12} className="text-amber-700 dark:text-amber-300 shrink-0" />
                  <span className="bg-gradient-to-r from-[#92400E] to-[#451A03] bg-clip-text text-transparent dark:bg-none dark:text-amber-200">
                    NAAC A++ Grade
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/50 bg-cyan-50/95 dark:border-cyan-300/30 dark:bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-950 dark:text-cyan-200 backdrop-blur-md shadow-xs transition-colors">
                  <Award size={12} className="text-cyan-700 dark:text-cyan-300 shrink-0" />
                  <span className="bg-gradient-to-r from-[#0E7490] to-[#083344] bg-clip-text text-transparent font-bold dark:bg-none dark:text-cyan-200">
                    NIRF Ranked
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/70 bg-white/95 dark:border-white/20 dark:bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-800 dark:text-white/90 backdrop-blur-md shadow-xs transition-colors">
                  <span>{institution.city}</span>
                  {institution.state ? (
                    <>
                      <span className="text-slate-600 dark:text-white/60">, </span>
                      <span className="font-bold bg-gradient-to-r from-[#1E3A8A] to-[#1E1B4B] bg-clip-text text-transparent dark:bg-none dark:text-white/90">
                        {institution.state}
                      </span>
                    </>
                  ) : null}
                </span>
              </div>

              <p className="mt-2.5 text-xs text-white/80 leading-relaxed max-w-md">
                Autonomous University · Training, Placements &amp; Institutional Analytics
              </p>
            </div>

            {/* Right Side: Animated 3D MIT ADT University Emblem */}
            <div className="hidden sm:flex items-center justify-center shrink-0 self-center">
              <UniversityEmblem3D size={210} className="transform-gpu drop-shadow-[0_16px_36px_rgba(0,0,0,0.4)]" />
            </div>
          </div>
        </section>

        {/* Dedicated 4 Action Buttons Area Beside Resized Banner */}
        <section
          aria-label="Quick institutional actions"
          className="lg:col-span-4 flex flex-col justify-between rounded-3xl p-5 sm:p-6 glass border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-xs"
        >
          <div className="mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sb-muted light:text-[#686868]">
              Institutional Command Actions
            </h2>
            <p className="text-[11px] text-sb-muted light:text-[#686868] mt-0.5">
              Rapid access to placement drives, schedules &amp; audit reports
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2.5">
            {/* Action 1: Schedule */}
            <Link
              href="/academia/events"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-gradient-to-br from-white/95 to-white/80 dark:from-white/[0.04] dark:to-transparent text-[#171717] dark:text-white hover:border-[#4F46E5]/50 dark:hover:border-indigo-400/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#4F46E5]/10 dark:bg-indigo-950/40 text-[#4F46E5] dark:text-indigo-400 group-hover:scale-110 transition-transform shadow-xs">
                  <Calendar size={15} />
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                  14 Slots
                </span>
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold truncate">Schedule</p>
                <p className="text-[10px] text-sb-muted light:text-[#686868] truncate">Campus events &amp; slots</p>
              </div>
            </Link>

            {/* Action 2: Placement Drive */}
            <Link
              href="/academia/placements"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl border border-[#007BA7]/35 dark:border-sb-cyan/35 bg-gradient-to-br from-[#007BA7]/15 via-white/80 to-transparent dark:from-sb-cyan/15 dark:via-white/[0.03] text-[#171717] dark:text-white hover:border-[#007BA7] dark:hover:border-sb-cyan hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#007BA7] dark:bg-sb-cyan text-white dark:text-[#0B101D] group-hover:scale-110 transition-transform shadow-xs">
                  <Plus size={15} />
                </span>
                <span className="text-[10px] font-bold text-[#007BA7] dark:text-sb-cyan bg-[#007BA7]/10 dark:bg-sb-cyan/20 px-1.5 py-0.2 rounded-full">
                  Active
                </span>
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold truncate text-[#007BA7] dark:text-sb-cyan">Placement Drive</p>
                <p className="text-[10px] text-sb-muted light:text-[#686868] truncate">Launch recruitment</p>
              </div>
            </Link>

            {/* Action 3: Student Roster */}
            <Link
              href="/academia/students"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-gradient-to-br from-white/95 to-white/80 dark:from-white/[0.04] dark:to-transparent text-[#171717] dark:text-white hover:border-emerald-500/50 dark:hover:border-emerald-400/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-xs">
                  <GraduationCap size={15} />
                </span>
                <span className="text-[10px] text-sb-muted font-medium">Directory</span>
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold truncate">Student Roster</p>
                <p className="text-[10px] text-sb-muted light:text-[#686868] truncate">Cohort &amp; eligibility</p>
              </div>
            </Link>

            {/* Action 4: Accreditation Reports */}
            <Link
              href="/academia/reports"
              className="group relative flex flex-col justify-between p-3.5 rounded-2xl border border-[#E3E3E3] dark:border-white/10 bg-gradient-to-br from-white/95 to-white/80 dark:from-white/[0.04] dark:to-transparent text-[#171717] dark:text-white hover:border-[#7C3AED]/50 dark:hover:border-purple-400/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#7C3AED]/10 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 group-hover:scale-110 transition-transform shadow-xs">
                  <BarChart3 size={15} />
                </span>
                <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded-full">
                  Audit Ready
                </span>
              </div>
              <div className="mt-2.5">
                <p className="text-xs font-bold truncate">Accreditation Reports</p>
                <p className="text-[10px] text-sb-muted light:text-[#686868] truncate">Download audits</p>
              </div>
            </Link>
          </div>
        </section>
      </div>

      {/* 1.5. Student Learning Analytics & Real-Time Sync Section */}
      <AcademiaLearningAnalyticsSection />

      {/* 2. Consistent, Clickable 3D KPI Cards (4 Cards with Perspective Parallax) */}
      <section
        aria-label="Institutional overview metrics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both"
      >
        {/* KPI 1: Student Enrollment */}
        <AcademiaKpiCard3D
          href="/academia/students"
          title="Student Enrollment"
          value={<AnimatedNumber value={filteredStudents.length} />}
          subtitle={`${eligibleStudentsCount} placement-ready`}
          trendText="+14.2% YoY"
          badgeText="Directory"
          footerLeft={`${students.length} Total across cohorts`}
          footerRightText="Explore →"
          accentColor="blue"
          icon={<GraduationCap size={19} />}
        />

        {/* KPI 2: Academic Programs & Faculty */}
        <AcademiaKpiCard3D
          href="/academia/departments"
          title="Programs & Departments"
          value={<AnimatedNumber value={departments.length} />}
          subtitle={`${faculty.length} faculty members`}
          trendText="1:15 Faculty Ratio"
          badgeText="Academic Core"
          footerLeft={`${institution.programsOffered?.length || 3} Degree programs`}
          footerRightText="Manage →"
          accentColor="indigo"
          icon={<Building2 size={19} />}
        />

        {/* KPI 3: Placement Velocity & Outcomes */}
        <AcademiaKpiCard3D
          href="/academia/placements"
          title="Placement Outcomes"
          value={<AnimatedNumber value={placementRate} suffix="%" />}
          subtitle={`${placedCount} placed / ${inProcessCount} interviewing`}
          trendText="Top 10% Velocity"
          badgeText="T&P Cell"
          footerLeft={`${drives.length + events.length} Drives & sessions`}
          footerRightText="T&P Cell →"
          accentColor="emerald"
          icon={<TrendingUp size={19} />}
        />

        {/* KPI 4: Research & Industry Nexus */}
        <AcademiaKpiCard3D
          href="/academia/opportunities"
          title="Research & Industry Nexus"
          value={<AnimatedNumber value={industryJobs.length} />}
          subtitle={`${activePartnersCount} active corporate MoUs`}
          trendText="18 Active MoUs"
          badgeText="Industry"
          footerLeft={`${academicOpportunities.length} Faculty projects`}
          footerRightText="Explore →"
          accentColor="purple"
          icon={<Handshake size={19} />}
        />
      </section>

      {/* 3. Coordinated Interactive Filter Bar */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <AcademiaFilterBar
          filters={filters}
          onChange={setFilters}
          onReset={handleResetFilters}
          departments={departments}
          gradYears={gradYears}
          totalStudents={students.length}
          filteredCount={filteredStudents.length}
        />
      </div>

      {/* 4. Main Analytics Area — Row 1: Primary Trends & Program Distribution */}
      <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-5 duration-600 delay-300 fill-mode-both">
        {/* Student Enrollment Analytics (7 cols) */}
        <div className="lg:col-span-7">
          <StudentEnrollmentChart
            students={filteredStudents}
            academicYearLabel={institution.academicYearLabel}
          />
        </div>

        {/* Courses & Programs Analytics (5 cols) */}
        <div className="lg:col-span-5">
          <CoursesProgramsChart
            institution={institution}
            departments={departments}
            students={filteredStudents}
          />
        </div>
      </div>

      {/* 5. Main Analytics Area — Row 2: Pending Approvals & Faculty Engagement */}
      <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in slide-in-from-bottom-5 duration-600 delay-400 fill-mode-both">
        {/* Pending Approvals Hub (7 cols) */}
        <div className="lg:col-span-7">
          <PendingApprovalsModule
            industryCampusEvents={industryCampusEvents}
            institution={institution}
            students={students}
            partnerships={partnerships}
            academicOpportunities={academicOpportunities}
            role={staff.role}
            onApproveEvent={handleApproveIndustryEvent}
          />
        </div>

        {/* Faculty Activity Analytics (5 cols) */}
        <div className="lg:col-span-5">
          <FacultyActivitySection
            faculty={faculty}
            departments={departments}
            academicOpportunities={academicOpportunities}
            totalStudents={students.length}
          />
        </div>
      </div>

      {/* 6. Academic Performance & Career Readiness Section with 3D Spatial Hub (12 cols) */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500 fill-mode-both">
        <AcademicPerformanceSection
          students={filteredStudents}
          activePartnersCount={activePartnersCount}
        />
      </div>

      {/* 7. Operational Feed: Campus Announcements & Live Audit Trail */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-600 fill-mode-both">
        <OperationalFeedSection
          announcements={announcements}
          auditLog={auditLog}
        />
      </div>
    </div>
  );
}
