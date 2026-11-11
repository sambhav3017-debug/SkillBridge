"use client";

import { useState } from "react";
import {
  Bell,
  CheckCircle2,
  KeyRound,
  LogOut,
  Settings,
  Shield,
  UserCheck,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import { academiaApi } from "@/lib/academia/client";
import { ACADEMIA_ROLES, type AcademiaRole } from "@/lib/academia/types";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

export default function AcademiaSettingsView() {
  const { data, updateMe, notify, logout } = useAcademia();
  const { staff, institution } = data;

  const [staffName, setStaffName] = useState(staff.name);
  const [designation, setDesignation] = useState(staff.designation);
  const [department, setDepartment] = useState(staff.department);
  const [role, setRole] = useState<AcademiaRole>(staff.role);

  const [academicYearLabel, setAcademicYearLabel] = useState(institution.academicYearLabel);
  const [placementPolicyNote, setPlacementPolicyNote] = useState(
    institution.placementPolicyNote,
  );
  const [shareCgpaWithRecruiters, setShareCgpaWithRecruiters] = useState(
    institution.shareCgpaWithRecruiters,
  );

  const [notifications, setNotifications] = useState(staff.notifications);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateMe({
      staff: {
        name: staffName,
        designation,
        department,
        role,
        notifications,
      },
      institution: {
        academicYearLabel,
        placementPolicyNote,
        shareCgpaWithRecruiters,
      },
    });
    setSavingProfile(false);
    if (!res.ok) {
      notify("error", res.error ?? "Failed to save settings.");
      return;
    }
    notify("success", "Institutional & staff preferences updated.");
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notify("error", "New passwords do not match.");
      return;
    }
    setPwBusy(true);
    const res = await academiaApi<{ updated: boolean }>("/api/academia/auth/password", {
      method: "POST",
      json: { currentPassword, newPassword },
    });
    setPwBusy(false);
    if (!res.ok) {
      notify("error", res.error ?? "Could not update password.");
      return;
    }
    notify("success", "Account password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-cyan">
            <Settings size={12} /> Governance, Privacy &amp; Staff Preferences
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Institution &amp; Account Settings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-sb-muted">
            Configure your staff account, active academic year cycle, placement policy rules,
            student data privacy controls, and security credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-sb-pink/40 bg-sb-pink/10 px-4 py-2 text-xs font-semibold text-sb-pink transition hover:bg-sb-pink/20"
        >
          <LogOut size={14} /> Sign Out of Academia Portal
        </button>
      </div>

      <form onSubmit={saveSettings} className="grid gap-6 lg:grid-cols-2">
        {/* Staff Profile */}
        <div className="glass-panel min-w-0 space-y-4 rounded-2xl p-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <UserCheck size={17} className="text-sb-cyan" />
            <h2 className="text-base font-semibold">Administrator / Staff Profile</h2>
          </div>

          <div>
            <label className="field-label" htmlFor="st-name">
              Full Name
            </label>
            <input
              id="st-name"
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
              className="field-input"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="st-email">
              Institutional Email (Verified Login ID)
            </label>
            <input
              id="st-email"
              type="email"
              disabled
              value={staff.email}
              className="field-input opacity-60"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="st-desig">
                Official Designation
              </label>
              <input
                id="st-desig"
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className="field-input"
              />
            </div>

            <div>
              <label className="field-label" htmlFor="st-dept">
                Primary Department / Cell
              </label>
              <input
                id="st-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="st-role">
              Active Workspace Role (RBAC Preview Switcher)
            </label>
            <select
              id="st-role"
              value={role}
              onChange={(e) => setRole(e.target.value as AcademiaRole)}
              className="field-input"
            >
              {ACADEMIA_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-sb-muted">
              Switch roles to preview how Read-Only Analysts, Faculty Members, or Placement Officers
              experience the workspace.
            </p>
          </div>
        </div>

        {/* Academic Cycle & Privacy */}
        <div className="glass-panel min-w-0 space-y-4 rounded-2xl p-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <Shield size={17} className="text-sb-pink" />
            <h2 className="text-base font-semibold">
              Academic Year &amp; Placement Privacy Policy
            </h2>
          </div>

          <div>
            <label className="field-label" htmlFor="inst-ay">
              Active Academic Cycle Label
            </label>
            <input
              id="inst-ay"
              type="text"
              value={academicYearLabel}
              onChange={(e) => setAcademicYearLabel(e.target.value)}
              placeholder="e.g., 2026–2027"
              className="field-input"
            />
          </div>

          <div>
            <label className="field-label" htmlFor="inst-policy">
              Campus Placement Governance Policy (One-Offer / Dream-Tier Rule)
            </label>
            <textarea
              id="inst-policy"
              rows={3}
              value={placementPolicyNote}
              onChange={(e) => setPlacementPolicyNote(e.target.value)}
              className="field-input"
            />
          </div>

          <div className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs">
            <div className="pr-2">
              <div className="font-semibold text-white">
                Share Verified CGPA with Partner Recruiters
              </div>
              <div className="mt-0.5 text-sb-muted">
                When enabled, verified employer partners in the Industry Portal can view verified
                CGPA bands for placement-eligible students.
              </div>
            </div>
            <SkillBridgeToggle
              checked={shareCgpaWithRecruiters}
              onChange={setShareCgpaWithRecruiters}
              aria-label="Share Verified CGPA with Partner Recruiters"
              accent="cyan"
            />
          </div>

          {/* Notification Toggles */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Bell size={14} className="text-sb-cyan" /> Notification Preferences
            </div>
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["studentRegistrations", "Student Portal links & CSV imports"],
                  ["placementDrives", "Placement drive milestones & offers"],
                  ["industryCollaborations", "Industry campus event & MoU requests"],
                  ["researchApplications", "Student research & project applications"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-sb-muted hover:text-white"
                >
                  <span>{label}</span>
                  <SkillBridgeToggle
                    checked={notifications[key]}
                    onChange={(next) =>
                      setNotifications({ ...notifications, [key]: next })
                    }
                    aria-label={label}
                    accent="cyan"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary px-5 py-2.5 text-xs font-semibold text-white"
            >
              <CheckCircle2 size={14} />
              {savingProfile ? "Saving..." : "Save Institutional Preferences"}
            </button>
          </div>
        </div>
      </form>

      {/* Password Change */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <KeyRound size={17} className="text-sb-cyan" />
          <h2 className="text-base font-semibold">Security &amp; Password Update</h2>
        </div>

        <form onSubmit={changePassword} className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="field-label" htmlFor="pw-curr">
              Current Password
            </label>
            <input
              id="pw-curr"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="pw-new">
              New Password (min 8 chars)
            </label>
            <input
              id="pw-new"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="pw-conf">
              Confirm New Password
            </label>
            <input
              id="pw-conf"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="field-input"
            />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={pwBusy}
              className="btn-ghost border border-sb-cyan/40 px-4 py-2 text-xs font-semibold text-white"
            >
              {pwBusy ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
