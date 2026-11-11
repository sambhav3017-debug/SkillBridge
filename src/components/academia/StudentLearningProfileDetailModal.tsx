"use client";

import { useState } from "react";
import {
  X,
  User,
  BookOpen,
  Sparkles,
  Award,
  FolderGit2,
  Clock,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  FileText,
} from "lucide-react";
import type {
  StudentLearningProfile,
  VerificationStatus,
} from "@/lib/academia/learning-sync-types";

interface Props {
  profile: StudentLearningProfile;
  onClose: () => void;
  onVerifyCertificate: (
    studentId: string,
    certificateId: string,
    status: VerificationStatus,
    notes?: string
  ) => Promise<void>;
}

export default function StudentLearningProfileDetailModal({
  profile,
  onClose,
  onVerifyCertificate,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "currently_learning" | "skills" | "certificates" | "projects" | "timeline"
  >("currently_learning");

  const [timelineFilter, setTimelineFilter] = useState<
    "all" | "course" | "skill" | "certificate" | "project" | "assessment"
  >("all");

  const filteredTimeline = profile.timeline.filter((ev) => {
    if (timelineFilter === "all") return true;
    return ev.activityCategory === timelineFilter;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md animate-fade-in"
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#121620] border border-white/10 shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-[#151B27]/80 backdrop-blur-md flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sb-cyan/20 to-sb-blue/20 text-sb-cyan font-black text-lg border border-white/10 shrink-0">
              {profile.studentName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono font-bold text-sb-muted uppercase tracking-wider">
                  {profile.studentIdCode}
                </span>
                <span className="h-1 w-1 rounded-full bg-sb-muted" />
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                  {profile.syncStatus}
                </span>
                <span className="text-[10px] text-sb-muted">
                  Synced: {new Date(profile.lastSynchronizedAt).toLocaleTimeString()}
                </span>
              </div>
              <h2 id="student-profile-title" className="text-lg sm:text-xl font-black text-white leading-tight">
                {profile.studentName} — Learning &amp; Skills Profile
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid h-8 w-8 place-items-center rounded-xl text-sb-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Academic Meta Banner */}
        <div className="px-6 py-3.5 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-sb-muted">
          <div className="flex items-center gap-3">
            <span>
              Dept: <strong className="text-white">{profile.department}</strong>
            </span>
            <span>•</span>
            <span>
              Program: <strong className="text-white">{profile.program} ({profile.year})</strong>
            </span>
            <span>•</span>
            <span>
              Grad: <strong className="text-white">{profile.gradYear}</strong>
            </span>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-sb-cyan font-bold">
              {profile.metrics.activeCoursesCount} Active Courses
            </span>
            <span className="text-emerald-400 font-bold">
              {profile.metrics.totalHoursLearned}h Spent
            </span>
            <span className="text-[#FF9F1C] font-bold">
              {profile.metrics.verifiedCertsCount} Certs
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 py-2.5 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
          {[
            { id: "currently_learning", label: `Currently Learning (${profile.courses.length})`, icon: BookOpen },
            { id: "skills", label: `Skills Development (${profile.skills.length})`, icon: Sparkles },
            { id: "certificates", label: `Certificates (${profile.certificates.length})`, icon: Award },
            { id: "projects", label: `Practical Projects (${profile.projects.length})`, icon: FolderGit2 },
            { id: "timeline", label: `Activity Timeline (${profile.timeline.length})`, icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                  active
                    ? "bg-white/15 text-sb-cyan shadow-2xs font-extrabold border border-white/10"
                    : "text-sb-muted hover:text-white"
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* 1. CURRENTLY LEARNING COURSES */}
          {activeTab === "currently_learning" && (
            <div className="space-y-4">
              {profile.courses.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-sb-muted space-y-1">
                  <BookOpen size={28} className="mx-auto text-sb-muted opacity-40" />
                  <p className="text-sm font-bold text-white">No active course enrollments</p>
                  <p className="text-xs">Student has not enrolled in any SkillBridge courses yet or has restricted sharing.</p>
                </div>
              ) : (
                profile.courses.map((crs) => (
                  <div
                    key={crs.courseId}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sb-muted">
                            {crs.category}
                          </span>
                          <span className="h-1 w-1 rounded-full bg-sb-muted" />
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/5 text-sb-muted font-semibold">
                            {crs.difficulty}
                          </span>
                          <span className="text-[10px] font-mono text-sb-muted">
                            Enrolled: {new Date(crs.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-white">{crs.courseName}</h4>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border self-start sm:self-auto ${
                          crs.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-sb-cyan/15 text-sb-cyan border-sb-cyan/30"
                        }`}
                      >
                        {crs.status} — {crs.progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-sb-muted">
                        <span>
                          {crs.completedLessonsCount} of {crs.totalLessonsCount} lessons completed
                        </span>
                        <span>
                          {crs.completedTasksCount} tasks done ({crs.pendingTasksCount} pending)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-sb-cyan to-sb-blue rounded-full transition-all duration-500"
                          style={{ width: `${crs.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Next scheduled topic */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5 text-sb-muted">
                      <span>
                        Next Topic:{" "}
                        <strong className="text-white">
                          {crs.nextScheduledTopic || "Syllabus completed"}
                        </strong>
                      </span>
                      <span>
                        Last Active:{" "}
                        <strong className="text-white">
                          {new Date(crs.lastActivityAt).toLocaleDateString()}
                        </strong>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. SKILLS DEVELOPMENT */}
          {activeTab === "skills" && (
            <div className="space-y-4">
              <div className="text-xs text-sb-muted">
                Skills categorized by provenance: Verified (Course Completed), Currently Learning, or Self-Declared.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.skills.map((sk) => (
                  <div
                    key={sk.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-extrabold text-white block">{sk.name}</span>
                      <span className="text-[11px] text-sb-muted">Level: {sk.level}</span>
                      {sk.courseName && (
                        <span className="text-[10px] text-sb-muted block mt-0.5">
                          Via: {sk.courseName}
                        </span>
                      )}
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        sk.origin === "course_completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : sk.origin === "currently_learning"
                          ? "bg-sb-cyan/15 text-sb-cyan border-sb-cyan/30"
                          : "bg-white/5 text-sb-muted border-white/10"
                      }`}
                    >
                      {sk.originLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. CERTIFICATES */}
          {activeTab === "certificates" && (
            <div className="space-y-4">
              {profile.certificates.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-sb-muted">
                  No certificates submitted yet.
                </div>
              ) : (
                profile.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{cert.title}</h4>
                        <span
                          className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
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
                      <p className="text-xs text-sb-muted mt-0.5">
                        Issuer: {cert.issuer} • Issue Date: {cert.issueDate}
                      </p>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-sb-cyan hover:underline mt-1"
                        >
                          View Credential <ExternalLink size={10} />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          onVerifyCertificate(profile.studentId, cert.id, "Verified")
                        }
                        className="btn-bounce-sm px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onVerifyCertificate(profile.studentId, cert.id, "Rejected", "Incomplete document")
                        }
                        className="btn-bounce-sm px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 4. PRACTICAL PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              {profile.projects.length === 0 ? (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-sb-muted">
                  No practical projects recorded.
                </div>
              ) : (
                profile.projects.map((prj) => (
                  <div
                    key={prj.id}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{prj.title}</h4>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {prj.completionStatus}
                      </span>
                    </div>
                    <p className="text-xs text-sb-muted leading-relaxed">{prj.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {prj.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-sb-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 5. TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              {/* Timeline Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                {(["all", "course", "skill", "certificate", "project", "assessment"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setTimelineFilter(f)}
                      className={`btn-bounce-sm px-2.5 py-1 rounded-lg capitalize transition-all ${
                        timelineFilter === f
                          ? "bg-sb-cyan text-[#090C12] font-bold"
                          : "bg-white/5 text-sb-muted hover:text-white"
                      }`}
                    >
                      {f}
                    </button>
                  )
                )}
              </div>

              <div className="relative pl-6 border-l border-white/10 space-y-4">
                {filteredTimeline.map((ev) => (
                  <div key={ev.id} className="relative">
                    <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-sb-cyan border-2 border-[#121620]" />
                    <div className="text-xs font-bold text-white">{ev.title}</div>
                    <p className="text-[11px] text-sb-muted mt-0.5">{ev.description}</p>
                    <span className="text-[10px] font-mono text-sb-muted">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#151B27]/80 flex items-center justify-between">
          <span className="text-xs text-sb-muted">
            Institutional Data Access: Strictly isolated for {profile.college}.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-bounce-sm px-4 py-2 rounded-xl text-xs font-bold bg-white text-neutral-900 hover:bg-neutral-200 transition-colors shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}
