"use client";

import { useEffect, useState, useMemo } from "react";
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  BarChart2,
  User,
  Shield,
  Layers,
  ChevronRight,
  Eye,
  Check,
  X,
  FileText,
  Calendar,
  AlertCircle,
  FolderGit2,
  ExternalLink,
} from "lucide-react";
import { useAcademia } from "@/components/academia/AcademiaProvider";
import SearchInput from "@/components/ui/SearchInput";
import { academiaApi } from "@/lib/academia/client";
import type {
  InstitutionalLearningAnalytics,
  StudentLearningProfile,
  VerificationStatus,
} from "@/lib/academia/learning-sync-types";
import StudentLearningProfileDetailModal from "./StudentLearningProfileDetailModal";

export default function StudentLearningManagementView() {
  const { data, notify } = useAcademia();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<InstitutionalLearningAnalytics | null>(null);
  const [studentProfiles, setStudentProfiles] = useState<StudentLearningProfile[]>([]);

  // Selected student for detailed learning profile view
  const [selectedStudent, setSelectedStudent] = useState<StudentLearningProfile | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "courses" | "skills" | "certificates" | "analytics"
  >("overview");

  // Fetch synchronized learning records
  const loadLearningData = async () => {
    setLoading(true);
    try {
      const res = await academiaApi<{
        analytics: InstitutionalLearningAnalytics;
        studentProfiles: StudentLearningProfile[];
      }>("/api/academia/learning");

      if (res.ok && res.data) {
        setAnalytics(res.data.analytics);
        setStudentProfiles(res.data.studentProfiles);
      } else {
        notify("error", res.error || "Failed to load synchronized learning data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLearningData();
  }, []);

  // Distinct departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const p of studentProfiles) {
      if (p.department) set.add(p.department);
    }
    return ["All", ...Array.from(set).sort()];
  }, [studentProfiles]);

  // Distinct courses
  const enrolledCoursesList = useMemo(() => {
    const set = new Set<string>();
    for (const p of studentProfiles) {
      for (const c of p.courses) {
        set.add(c.courseName);
      }
    }
    return ["All", ...Array.from(set).sort()];
  }, [studentProfiles]);

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return studentProfiles.filter((st) => {
      if (departmentFilter !== "All" && st.department !== departmentFilter) return false;
      if (courseFilter !== "All" && !st.courses.some((c) => c.courseName === courseFilter))
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = st.studentName.toLowerCase().includes(q);
        const matchesEmail = st.studentEmail.toLowerCase().includes(q);
        const matchesCode = st.studentIdCode.toLowerCase().includes(q);
        const matchesSkill = st.skills.some((s) => s.name.toLowerCase().includes(q));
        if (!matchesName && !matchesEmail && !matchesCode && !matchesSkill) return false;
      }
      return true;
    });
  }, [studentProfiles, departmentFilter, courseFilter, searchQuery]);

  // Handle Certificate Verification
  const handleVerifyCertificate = async (
    studentId: string,
    certificateId: string,
    status: VerificationStatus,
    notes?: string
  ) => {
    const res = await academiaApi<{ success: boolean; message: string }>("/api/academia/learning", {
      method: "POST",
      json: {
        action: "verify_certificate",
        studentId,
        certificateId,
        status,
        notes,
      },
    });

    if (res.ok) {
      notify("success", res.data?.message || `Certificate status updated to ${status}.`);
      await loadLearningData();
      if (selectedStudent && selectedStudent.studentId === studentId) {
        // Refresh selected student modal view
        const updated = studentProfiles.find((s) => s.studentId === studentId);
        if (updated) setSelectedStudent(updated);
      }
    } else {
      notify("error", res.error || "Could not update certificate.");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#121620] via-[#0E121B] to-[#0A0D14] p-6 sm:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sb-cyan/15 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-20 h-52 w-52 rounded-full bg-sb-blue/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-sb-cyan/15 text-sb-cyan border border-sb-cyan/30 shadow-2xs">
              <Sparkles size={13} />
              <span>Real-Time Learning Synchronization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Student Learning Analytics
            </h1>
            <p className="text-xs sm:text-sm text-sb-muted max-w-2xl leading-relaxed">
              Monitor active course enrollments, verify practical skill development, and inspect credentials across {data.institution?.name || "your institution"} in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadLearningData}
              disabled={loading}
              className="btn-bounce-sm inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-white border border-white/10 shadow-sm transition-all"
            >
              <Clock size={14} className={loading ? "animate-spin text-sb-cyan" : "text-sb-cyan"} />
              <span>{loading ? "Synchronizing..." : "Refresh Sync"}</span>
            </button>
          </div>
        </div>

        {/* 2. Top-Level Synchronized KPI Metrics */}
        {analytics && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-white/10">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-sb-cyan" /> Total Students
              </span>
              <div className="mt-2 text-2xl font-black text-white">
                {analytics.metrics.totalEnrolledStudents}
              </div>
              <span className="text-[10px] text-sb-muted mt-0.5">Enrolled institutional roster</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#FF9F1C]" /> Active Courses
              </span>
              <div className="mt-2 text-2xl font-black text-white">
                {analytics.metrics.totalActiveCourseEnrollments}
              </div>
              <span className="text-[10px] text-sb-muted mt-0.5">
                {analytics.metrics.studentsActivelyLearning} students currently learning
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" /> Courses Completed
              </span>
              <div className="mt-2 text-2xl font-black text-white">
                {analytics.metrics.totalCoursesCompleted}
              </div>
              <span className="text-[10px] text-emerald-400/90 mt-0.5">Fully completed syllabi</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-purple-400" /> Skills In Progress
              </span>
              <div className="mt-2 text-2xl font-black text-white">
                {analytics.metrics.skillsCurrentlyDeveloped}
              </div>
              <span className="text-[10px] text-sb-muted mt-0.5">Distinct technical skills</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
                <Award size={13} className="text-[#FF6A00]" /> Certifications
              </span>
              <div className="mt-2 text-2xl font-black text-white">
                {analytics.metrics.certificatesEarned}
              </div>
              <span className="text-[10px] text-amber-400 mt-0.5">
                {analytics.metrics.certificatesPendingVerification} pending verification
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-2">
        <div className="flex items-center gap-1 p-1 bg-white/[0.04] rounded-2xl border border-white/10 text-xs font-bold">
          {(
            [
              { id: "overview", label: "Learning Overview", icon: BarChart2 },
              { id: "students", label: `Student Records (${filteredStudents.length})`, icon: User },
              { id: "courses", label: "Course Progress", icon: BookOpen },
              { id: "skills", label: "Skills Development", icon: Sparkles },
              { id: "certificates", label: "Certificates & Credentials", icon: Award },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`btn-bounce-sm inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
                  active
                    ? "bg-gradient-to-r from-sb-cyan to-sb-blue text-[#090C12] shadow-sm font-extrabold"
                    : "text-sb-muted hover:text-white"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Search & Dept Selector */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
          <div className="flex-1 max-w-xs">
            <SearchInput
              placeholder="Search student, roll number, or skill..."
              value={searchQuery}
              onChange={setSearchQuery}
              portalVariant="academia"
              sizeVariant="sm"
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#141822] border border-white/10 text-xs text-white focus:outline-none focus:border-sb-cyan cursor-pointer"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === "All" ? "All Departments" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Tab Views */}
      {/* ============================================================== */}
      {/* TAB A: OVERVIEW & INSIGHTS                                     */}
      {/* ============================================================== */}
      {activeTab === "overview" && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Popular Skills Bar */}
            <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles size={15} className="text-sb-cyan" />
                  Most In-Demand Skills Being Developed
                </h3>
                <span className="text-[11px] font-mono text-sb-muted">Active Learners</span>
              </div>
              <div className="space-y-2.5">
                {analytics.popularSkills.map((sk) => (
                  <div key={sk.skillName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{sk.skillName}</span>
                      <span className="font-mono text-sb-muted text-[11px]">
                        {sk.studentCount} students
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sb-cyan to-sb-blue rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (sk.studentCount / Math.max(1, analytics.metrics.totalEnrolledStudents)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Courses */}
            <div className="lg:col-span-6 rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BookOpen size={15} className="text-[#FF9F1C]" />
                  Top Enrolled Course Syllabi
                </h3>
                <span className="text-[11px] font-mono text-sb-muted">Total Enrolled</span>
              </div>
              <div className="space-y-2.5">
                {analytics.mostEnrolledCourses.map((crs) => (
                  <div
                    key={crs.courseName}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{crs.courseName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-sb-muted font-semibold">
                          {crs.difficulty}
                        </span>
                      </div>
                      <span className="text-[11px] text-sb-muted">{crs.category}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-sb-cyan">
                      {crs.count} active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recently Active Learning Feed */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <TrendingUp size={15} className="text-emerald-400" />
              Live Student Learning Activity Feed
            </h3>
            <div className="divide-y divide-white/5">
              {analytics.recentlyActiveStudents.length === 0 ? (
                <p className="text-xs text-sb-muted py-4 text-center">
                  No learning activity recorded in the past 7 days.
                </p>
              ) : (
                analytics.recentlyActiveStudents.map((ev, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 text-sb-cyan font-bold text-xs shrink-0">
                        {ev.studentName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{ev.studentName}</span>
                          <span className="text-sb-muted">({ev.department})</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sb-cyan/10 text-sb-cyan font-semibold border border-sb-cyan/20">
                            {ev.activityType}
                          </span>
                        </div>
                        <p className="text-sb-muted text-[11px] mt-0.5">{ev.activityTitle}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-sb-muted shrink-0">
                      {new Date(ev.timestamp).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB B: STUDENT RECORDS TABLE                                   */}
      {/* ============================================================== */}
      {(activeTab === "students" || activeTab === "courses" || activeTab === "skills") && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] uppercase tracking-wider text-sb-muted text-[10px] font-bold font-mono">
                <tr>
                  <th className="px-5 py-3.5">Student / Roll No.</th>
                  <th className="px-5 py-3.5">Department & Batch</th>
                  <th className="px-5 py-3.5">Active Courses</th>
                  <th className="px-5 py-3.5">Verified Skills</th>
                  <th className="px-5 py-3.5">Certificates</th>
                  <th className="px-5 py-3.5">Sync Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sb-muted">
                      No matching student learning records found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => (
                    <tr
                      key={st.studentId}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sb-cyan/20 to-sb-blue/20 text-sb-cyan font-bold text-xs shrink-0 border border-white/10">
                            {st.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-white text-sm block truncate group-hover:text-sb-cyan transition-colors">
                              {st.studentName}
                            </span>
                            <span className="text-[11px] font-mono text-sb-muted block">
                              {st.studentIdCode} · {st.studentEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4">
                        <span className="text-white font-medium block">{st.department}</span>
                        <span className="text-sb-muted text-[11px]">
                          {st.program} ({st.year})
                        </span>
                      </td>

                      {/* Courses */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <span className="font-mono font-bold text-white">
                            {st.courses.length} courses
                          </span>
                          {st.courses.slice(0, 2).map((c) => (
                            <div key={c.courseId} className="flex items-center gap-1.5 text-[11px]">
                              <span className="truncate max-w-[140px] text-sb-muted">
                                {c.courseName}
                              </span>
                              <span className="font-mono font-bold text-sb-cyan">
                                {c.progressPercent}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Skills */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {st.skills.slice(0, 3).map((sk) => (
                            <span
                              key={sk.id}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                                sk.origin === "course_completed"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-white/5 text-sb-muted border-white/5"
                              }`}
                            >
                              {sk.name}
                            </span>
                          ))}
                          {st.skills.length > 3 && (
                            <span className="text-[10px] text-sb-muted self-center">
                              +{st.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Certs */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-white font-mono">
                            {st.certificates.length} earned
                          </span>
                          {st.metrics.pendingCertsCount > 0 && (
                            <span className="block text-[10px] text-amber-400 font-semibold">
                              {st.metrics.pendingCertsCount} pending review
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Sync Status */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <Check size={10} /> Synced
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(st)}
                          className="btn-bounce-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all shadow-2xs"
                        >
                          <Eye size={12} />
                          <span>View Learning</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB E: CERTIFICATES & CREDENTIALS VERIFICATION QUEUE           */}
      {/* ============================================================== */}
      {activeTab === "certificates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award size={16} className="text-[#FF6A00]" />
                Institutional Certificate Verification Desk
              </h3>
              <p className="text-xs text-sb-muted mt-0.5">
                Inspect student submitted credentials and assign official institutional verification status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studentProfiles.flatMap((st) =>
              st.certificates.map((cert) => (
                <div
                  key={`${st.studentId}-${cert.id}`}
                  className="p-5 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sb-muted block">
                          Student: {st.studentName} ({st.studentIdCode})
                        </span>
                        <h4 className="text-sm font-extrabold text-white mt-0.5">{cert.title}</h4>
                        <span className="text-xs text-sb-muted">Issuer: {cert.issuer}</span>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          cert.verificationStatus === "Verified"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : cert.verificationStatus === "Rejected"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {cert.verificationStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-sb-muted font-mono mt-3">
                      <span>Issued: {cert.issueDate}</span>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sb-cyan hover:underline"
                        >
                          Verify Document <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-[11px] text-sb-muted">
                      {cert.verifiedBy ? `Audited by ${cert.verifiedBy}` : "Pending staff review"}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyCertificate(st.studentId, cert.id, "Verified")
                        }
                        className="btn-bounce-sm px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all"
                      >
                        Approve &amp; Verify
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleVerifyCertificate(st.studentId, cert.id, "Rejected", "Insufficient documentation")
                        }
                        className="btn-bounce-sm px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Detailed Student Learning Profile Modal */}
      {selectedStudent && (
        <StudentLearningProfileDetailModal
          profile={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onVerifyCertificate={handleVerifyCertificate}
        />
      )}
    </div>
  );
}
