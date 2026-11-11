"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  User,
  Shield,
  Layers,
} from "lucide-react";
import { academiaApi } from "@/lib/academia/client";
import type { InstitutionalLearningAnalytics } from "@/lib/academia/learning-sync-types";
import { SpinningCounter } from "@/components/ui/SpinningCounter";

export default function AcademiaLearningAnalyticsSection() {
  const [analytics, setAnalytics] = useState<InstitutionalLearningAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    academiaApi<{ analytics: InstitutionalLearningAnalytics }>("/api/academia/learning").then((res) => {
      if (cancelled) return;
      if (res.ok && res.data?.analytics) {
        setAnalytics(res.data.analytics);
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!analytics && !loading) return null;

  return (
    <section aria-labelledby="learning-analytics-heading" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-sb-cyan/15 text-sb-cyan">
              <Sparkles size={14} />
            </span>
            <h2
              id="learning-analytics-heading"
              className="text-base sm:text-lg font-bold text-white"
            >
              Student Learning Analytics &amp; Synchronization
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Sync
            </span>
          </div>
          <p className="text-xs text-sb-muted mt-0.5">
            Real-time synchronization of student course completions, technical skills, and verified credentials across your institution.
          </p>
        </div>

        <Link
          href="/academia/student-learning"
          className="btn-bounce-sm inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-sb-cyan border border-white/10 transition-all self-start sm:self-auto"
        >
          <span>Open Full Learning Desk</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
        <Link
          href="/academia/student-learning"
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-sb-cyan/30 transition-all group"
        >
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
            <User size={12} className="text-sb-cyan" /> Total Students
          </span>
          <div className="mt-2 text-xl font-black text-white group-hover:text-sb-cyan transition-colors">
            <SpinningCounter value={analytics?.metrics.totalEnrolledStudents ?? 0} />
          </div>
          <span className="text-[10px] text-sb-muted mt-0.5 block">Institutional roster</span>
        </Link>

        <Link
          href="/academia/student-learning"
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-sb-cyan/30 transition-all group"
        >
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={12} className="text-[#FF9F1C]" /> Active Courses
          </span>
          <div className="mt-2 text-xl font-black text-white group-hover:text-sb-cyan transition-colors">
            <SpinningCounter value={analytics?.metrics.totalActiveCourseEnrollments ?? 0} />
          </div>
          <span className="text-[10px] text-sb-muted mt-0.5 block">
            <SpinningCounter value={analytics?.metrics.studentsActivelyLearning ?? 0} /> students learning
          </span>
        </Link>

        <Link
          href="/academia/student-learning"
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-sb-cyan/30 transition-all group"
        >
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400" /> Completed
          </span>
          <div className="mt-2 text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
            <SpinningCounter value={analytics?.metrics.totalCoursesCompleted ?? 0} />
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5 block">Courses completed</span>
        </Link>

        <Link
          href="/academia/student-learning"
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-sb-cyan/30 transition-all group"
        >
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={12} className="text-purple-400" /> Skills Developed
          </span>
          <div className="mt-2 text-xl font-black text-white group-hover:text-purple-400 transition-colors">
            <SpinningCounter value={analytics?.metrics.skillsCurrentlyDeveloped ?? 0} />
          </div>
          <span className="text-[10px] text-sb-muted mt-0.5 block">Distinct technologies</span>
        </Link>

        <Link
          href="/academia/student-learning"
          className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-sb-cyan/30 transition-all group"
        >
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1.5">
            <Award size={12} className="text-[#FF6A00]" /> Certifications
          </span>
          <div className="mt-2 text-xl font-black text-white group-hover:text-[#FF6A00] transition-colors">
            <SpinningCounter value={analytics?.metrics.certificatesEarned ?? 0} />
          </div>
          <span className="text-[10px] text-amber-400 mt-0.5 block">
            <SpinningCounter value={analytics?.metrics.certificatesPendingVerification ?? 0} /> pending audit
          </span>
        </Link>
      </div>

      {/* Popular Skills & Recent Activity Row */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs font-bold text-white block mb-2">
              Trending Technical Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {analytics.popularSkills.map((sk) => (
                <span
                  key={sk.skillName}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white flex items-center gap-1.5"
                >
                  <span>{sk.skillName}</span>
                  <span className="text-[10px] font-mono text-sb-cyan font-bold">
                    <SpinningCounter value={sk.studentCount} />
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
            <span className="text-xs font-bold text-white block mb-2">
              Recent Synchronized Learning Events
            </span>
            <div className="space-y-1.5">
              {analytics.recentlyActiveStudents.slice(0, 3).map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs text-sb-muted">
                  <span className="text-white font-medium truncate max-w-[200px]">
                    {ev.studentName} — {ev.activityTitle}
                  </span>
                  <span className="text-[10px] font-mono text-sb-cyan shrink-0">
                    {ev.activityType}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
