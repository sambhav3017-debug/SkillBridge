"use client";

import { useEffect, useState } from "react";
import {
  Landmark,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
  BookOpen,
  Award,
  FolderGit2,
  Lock,
  ChevronRight,
  Info,
} from "lucide-react";
import { api } from "@/lib/student/client";
import type { StudentAcademicSharingPrefs } from "@/lib/academia/learning-sync-types";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

export default function MyAcademicSharingWidget() {
  const [institutionName, setInstitutionName] = useState<string>("");
  const [prefs, setPrefs] = useState<StudentAcademicSharingPrefs | null>(null);
  const [lastSync, setLastSync] = useState<string>("");
  const [recordsCount, setRecordsCount] = useState<{
    enrolledCourses: number;
    profileSkills: number;
    certificates: number;
    projects: number;
    tasks: number;
  }>({
    enrolledCourses: 0,
    profileSkills: 0,
    certificates: 0,
    projects: 0,
    tasks: 0,
  });
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<{
      institutionName: string;
      sharingPreferences: StudentAcademicSharingPrefs;
      lastSyncTimestamp: string;
      recordsCount: typeof recordsCount;
    }>("/api/student/academic-sharing").then((res) => {
      if (cancelled) return;
      if (res.ok && res.data) {
        setInstitutionName(res.data.institutionName);
        setPrefs(res.data.sharingPreferences);
        setLastSync(res.data.lastSyncTimestamp);
        setRecordsCount(res.data.recordsCount);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async (key: keyof StudentAcademicSharingPrefs) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    try {
      const res = await api<{ sharingPreferences: StudentAcademicSharingPrefs }>(
        "/api/student/academic-sharing",
        {
          method: "PATCH",
          json: { [key]: next[key] },
        }
      );
      if (res.ok && res.data?.sharingPreferences) {
        setPrefs(res.data.sharingPreferences);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!prefs) return null;

  return (
    <div className="card-interactive rounded-3xl border border-orange-500/15 dark:border-white/10 bg-gradient-to-br from-[#FFFDF9] via-white to-[#FFF6EE] dark:from-[#131722] dark:via-[#0F131C] dark:to-[#0A0D14] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.06] dark:border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan">
            <Landmark size={16} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-[#171717] dark:text-white">
                My Academic Sharing &amp; Data Transparency
              </h3>
              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Connected
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-sb-muted">
              Synchronized with <strong className="text-neutral-800 dark:text-white">{institutionName}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-sb-muted">
          <Clock size={12} className="text-sb-cyan" />
          <span>Last Synced: {new Date(lastSync).toLocaleTimeString()}</span>
          {savedSuccess && (
            <span className="text-emerald-500 font-bold flex items-center gap-0.5">
              <Check size={12} /> Saved
            </span>
          )}
        </div>
      </div>

      {/* Synchronized Records Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1">
            <BookOpen size={11} className="text-[#FF6A00] dark:text-sb-cyan" /> Enrolled Courses
          </span>
          <div className="mt-1 text-lg font-black text-[#171717] dark:text-white">
            {recordsCount.enrolledCourses}
          </div>
          <span className="text-[10px] text-sb-muted">
            {prefs.shareCourseEnrollmentAndProgress ? "Shared with institution" : "Private"}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="text-[#FF9F1C]" /> Skills
          </span>
          <div className="mt-1 text-lg font-black text-[#171717] dark:text-white">
            {recordsCount.profileSkills}
          </div>
          <span className="text-[10px] text-sb-muted">
            {prefs.shareSkillDevelopment ? "Shared with institution" : "Private"}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1">
            <Award size={11} className="text-purple-500" /> Certificates
          </span>
          <div className="mt-1 text-lg font-black text-[#171717] dark:text-white">
            {recordsCount.certificates}
          </div>
          <span className="text-[10px] text-sb-muted">
            {prefs.shareCertificates ? "Eligible for verification" : "Private"}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.04] dark:border-white/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-sb-muted uppercase tracking-wider flex items-center gap-1">
            <FolderGit2 size={11} className="text-emerald-500" /> Projects
          </span>
          <div className="mt-1 text-lg font-black text-[#171717] dark:text-white">
            {recordsCount.projects}
          </div>
          <span className="text-[10px] text-sb-muted">
            {prefs.shareProjectsAndPracticalWork ? "Shared evidence" : "Private"}
          </span>
        </div>
      </div>

      {/* Transparent Consent Toggle Controls */}
      <div className="space-y-2.5 pt-1">
        <span className="text-xs font-bold text-neutral-800 dark:text-white block">
          Granular Institutional Sharing Permissions
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 hover:border-orange-500/30 transition-all">
            <div className="pr-3">
              <span className="font-bold text-[#171717] dark:text-white block">
                Course Progress &amp; Daily Tasks
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-sb-muted">
                Allow placement &amp; academic staff to track course completion
              </span>
            </div>
            <SkillBridgeToggle
              checked={prefs.shareCourseEnrollmentAndProgress}
              onChange={() => handleToggle("shareCourseEnrollmentAndProgress")}
              disabled={saving}
              aria-label="Course Progress & Daily Tasks sharing"
              accent="cyan"
            />
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 hover:border-orange-500/30 transition-all">
            <div className="pr-3">
              <span className="font-bold text-[#171717] dark:text-white block">
                Skills &amp; Provenance
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-sb-muted">
                Share verified course skills &amp; assessed technical capabilities
              </span>
            </div>
            <SkillBridgeToggle
              checked={prefs.shareSkillDevelopment}
              onChange={() => handleToggle("shareSkillDevelopment")}
              disabled={saving}
              aria-label="Skills & Provenance sharing"
              accent="cyan"
            />
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 hover:border-orange-500/30 transition-all">
            <div className="pr-3">
              <span className="font-bold text-[#171717] dark:text-white block">
                Certificates &amp; Credential Audit
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-sb-muted">
                Share earned certificates for official university verification
              </span>
            </div>
            <SkillBridgeToggle
              checked={prefs.shareCertificates}
              onChange={() => handleToggle("shareCertificates")}
              disabled={saving}
              aria-label="Certificates & Credential Audit sharing"
              accent="cyan"
            />
          </div>

          {/* Toggle 4 */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/10 hover:border-orange-500/30 transition-all">
            <div className="pr-3">
              <span className="font-bold text-[#171717] dark:text-white block">
                Practical Projects &amp; Repos
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-sb-muted">
                Allow faculty coordinators to review project submissions &amp; links
              </span>
            </div>
            <SkillBridgeToggle
              checked={prefs.shareProjectsAndPracticalWork}
              onChange={() => handleToggle("shareProjectsAndPracticalWork")}
              disabled={saving}
              aria-label="Practical Projects & Repos sharing"
              accent="cyan"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
