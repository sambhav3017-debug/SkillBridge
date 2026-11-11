"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, KeyRound, Loader2, LogOut, Save } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import {
  ErrorNote,
  PageHeader,
  PasswordField,
  SelectField,
  TextField,
} from "@/components/student/ui";
import { industryApi } from "@/lib/industry/client";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

export default function IndustrySettingsView() {
  const { data, updateMe, notify, logout } = useIndustry();
  const { recruiter, company } = data;

  const [name, setName] = useState(recruiter.name);
  const [email, setEmail] = useState(recruiter.email);
  const [jobTitle, setJobTitle] = useState(recruiter.jobTitle);
  const [contactPreference, setContactPreference] = useState(recruiter.contactPreference);
  const [notifications, setNotifications] = useState(recruiter.notifications);
  const [busyProfile, setBusyProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [profileTopError, setProfileTopError] = useState<string | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busyPw, setBusyPw] = useState(false);
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwTopError, setPwTopError] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileTopError(null);
    setBusyProfile(true);
    const res = await updateMe({
      recruiter: {
        name,
        email,
        jobTitle,
        contactPreference,
        notifications,
      },
    });
    setBusyProfile(false);
    if (!res.ok) {
      setProfileTopError(res.error);
      if (res.fieldErrors) setProfileErrors(res.fieldErrors);
      return;
    }
    notify("success", "Recruiter settings updated.");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwErrors({});
    setPwTopError(null);
    setBusyPw(true);
    const res = await industryApi<{ changed: boolean }>("/api/industry/auth/password", {
      method: "POST",
      json: { currentPassword, newPassword, confirmPassword },
    });
    setBusyPw(false);
    if (!res.ok) {
      setPwTopError(res.error);
      if (res.fieldErrors) setPwErrors(res.fieldErrors);
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    notify("success", "Password updated.");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account & Workspace Settings"
        subtitle="Manage your recruiter profile, notification preferences, and security settings."
        action={
          <Link href="/industry/company-profile" className="btn btn-glass btn-sm">
            <Building2 size={14} /> Edit {company.name} Profile
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Recruiter Account & Notifications */}
        <form onSubmit={handleSaveProfile} className="glass space-y-5 p-6 lg:col-span-7" noValidate>
          <h2 className="text-base font-bold">Recruiter Account Details</h2>
          {profileTopError && <ErrorNote>{profileTopError}</ErrorNote>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={profileErrors.name}
              required
            />
            <TextField
              label="Work email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={profileErrors.email}
              required
            />
            <TextField
              label="Job title"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              error={profileErrors.jobTitle}
              required
            />
            <SelectField
              label="Preferred candidate contact channel"
              options={["Both", "In-app messages", "Email"]}
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value as typeof contactPreference)}
            />
          </div>

          <div className="border-t border-white/10 pt-5">
            <h3 className="mb-3 text-sm font-bold">Notification Preferences</h3>
            <div className="space-y-2.5 text-sm">
              {[
                { key: "newApplications", label: "New student applications to your published jobs" },
                { key: "stageChanges", label: "Applicant stage transitions across your hiring team" },
                { key: "interviewReminders", label: "Upcoming interview schedule reminders" },
                { key: "jobDeadlines", label: "Job listing deadline alerts" },
                { key: "teamUpdates", label: "Hiring team member and role updates" },
              ].map((item) => {
                const k = item.key as keyof typeof notifications;
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs"
                  >
                    <span>{item.label}</span>
                    <SkillBridgeToggle
                      checked={notifications[k]}
                      onChange={(next) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [k]: next,
                        }))
                      }
                      aria-label={item.label}
                      accent="cyan"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end border-t border-white/10 pt-4">
            <button type="submit" disabled={busyProfile} className="btn btn-primary">
              {busyProfile ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save Settings
            </button>
          </div>
        </form>

        {/* Security & Session */}
        <div className="space-y-6 lg:col-span-5">
          <form onSubmit={handlePasswordChange} className="glass space-y-4 p-6" noValidate>
            <div className="flex items-center gap-2">
              <KeyRound size={17} className="text-sb-cyan" />
              <h2 className="text-base font-bold">Change Password</h2>
            </div>
            {pwTopError && <ErrorNote>{pwTopError}</ErrorNote>}

            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={pwErrors.currentPassword}
              required
            />
            <PasswordField
              label="New password"
              hint="At least 8 characters with a letter and a number."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={pwErrors.newPassword}
              required
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={pwErrors.confirmPassword}
              required
            />

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={busyPw} className="btn btn-glass btn-sm">
                {busyPw && <Loader2 size={14} className="animate-spin" />}
                Update Password
              </button>
            </div>
          </form>

          <div className="glass space-y-3 p-6">
            <h2 className="text-base font-bold">Session & Sign Out</h2>
            <p className="text-xs text-sb-muted">
              Signed in as <strong className="text-white">{recruiter.email}</strong> ({recruiter.role} at{" "}
              {company.name}).
            </p>
            <button type="button" onClick={logout} className="btn btn-danger btn-sm">
              <LogOut size={14} /> Log Out of Industry Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
