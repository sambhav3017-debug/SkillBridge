"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { api } from "@/lib/student/client";
import { OPP_TYPES, WORK_MODES } from "@/lib/student/types";
import { validateEmail, validatePassword, validateRequired } from "@/lib/student/validation";
import { useStudent } from "./StudentProvider";
import CodingAccountsManager from "./CodingAccountsManager";
import MyAcademicSharingWidget from "./MyAcademicSharingWidget";
import { ConfirmModal, PageHeader, PasswordField, TagInput, TextField, ToggleGroup } from "./ui";

export default function SettingsView() {
  const { data, patch, notify, refreshData, logout } = useStudent();
  const [acct, setAcct] = useState({ name: data.user.name, email: data.user.email });
  const [acctErr, setAcctErr] = useState<Record<string, string>>({});
  const [acctBusy, setAcctBusy] = useState(false);

  const pr = data.profile.preferences;
  const [prefs, setPrefs] = useState(pr);
  const [prefBusy, setPrefBusy] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErr, setPwErr] = useState<Record<string, string>>({});
  const [pwBusy, setPwBusy] = useState(false);

  const [confirm, setConfirm] = useState(false);
  const [outBusy, setOutBusy] = useState(false);

  async function saveAccount(e: React.FormEvent) {
    e.preventDefault();
    if (acctBusy) return;
    const errs: Record<string, string> = {};
    const a = validateRequired(acct.name, "Full name", 80);
    const b = validateEmail(acct.email);
    if (a) errs.name = a;
    if (b) errs.email = b;
    setAcctErr(errs);
    if (Object.keys(errs).length) return;
    setAcctBusy(true);
    const r = await patch({ account: acct });
    setAcctBusy(false);
    if (r.ok) notify("success", "Account details saved.");
    else {
      setAcctErr(r.fieldErrors ?? {});
      notify("error", r.error ?? "Could not save account details.");
    }
  }

  async function savePrefs(e: React.FormEvent) {
    e.preventDefault();
    if (prefBusy) return;
    setPrefBusy(true);
    const r = await patch({ profile: { preferences: prefs } });
    setPrefBusy(false);
    notify(r.ok ? "success" : "error", r.ok ? "Preferences saved." : (r.error ?? "Could not save preferences."));
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    if (pwBusy) return;
    const errs: Record<string, string> = {};
    if (!pw.currentPassword) errs.currentPassword = "Enter your current password.";
    const v = validatePassword(pw.newPassword);
    if (v) errs.newPassword = v;
    if (pw.confirmPassword !== pw.newPassword) errs.confirmPassword = "Passwords do not match.";
    setPwErr(errs);
    if (Object.keys(errs).length) return;
    setPwBusy(true);
    const r = await api("/api/student/auth/password", { method: "POST", json: pw });
    setPwBusy(false);
    setPw({ currentPassword: "", newPassword: "", confirmPassword: "" });
    if (r.ok) notify("success", "Password changed.");
    else {
      setPwErr(r.fieldErrors ?? {});
      notify("error", r.error ?? "Could not change password.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account, preferences and security." />

      <form onSubmit={saveAccount} noValidate className="glass glass-hover dash-entrance dash-delay-1 space-y-5 p-6" aria-labelledby="acct-h">
        <h2 id="acct-h" className="text-lg font-bold">Account details</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Full name" value={acct.name} error={acctErr.name} onChange={(e) => setAcct({ ...acct, name: e.target.value })} />
          <TextField label="Email address" type="email" value={acct.email} error={acctErr.email} onChange={(e) => setAcct({ ...acct, email: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={acctBusy} className="btn btn-glass btn-sm !px-5">{acctBusy && <Loader2 size={14} className="animate-spin" />} Save account</button>
        </div>
      </form>

      <form onSubmit={savePrefs} className="glass glass-hover dash-entrance dash-delay-2 space-y-5 p-6" aria-labelledby="pref-h">
        <h2 id="pref-h" className="text-lg font-bold">Career preferences</h2>
        <ToggleGroup legend="Opportunity types" options={OPP_TYPES} value={prefs.types} onChange={(types) => setPrefs({ ...prefs, types })} />
        <ToggleGroup legend="Work mode" options={WORK_MODES} value={prefs.modes} onChange={(modes) => setPrefs({ ...prefs, modes })} />
        <TagInput label="Interested roles" optional value={prefs.roles} onChange={(roles) => setPrefs({ ...prefs, roles })} placeholder="e.g. Data Analyst" />
        <TagInput label="Technology areas" optional value={prefs.areas} onChange={(areas) => setPrefs({ ...prefs, areas })} placeholder="e.g. Web, AI" />
        <div className="flex justify-end">
          <button type="submit" disabled={prefBusy} className="btn btn-glass btn-sm !px-5">{prefBusy && <Loader2 size={14} className="animate-spin" />} Save preferences</button>
        </div>
      </form>

      {/* Transparent Student Academic Sharing Transparency Center */}
      <div className="dash-entrance dash-delay-2">
        <MyAcademicSharingWidget />
      </div>

      {/* Developer Coding Accounts Integration Center */}
      <div className="dash-entrance dash-delay-3">
        <CodingAccountsManager
          accounts={data.codingAccounts || []}
          onAccountsUpdated={() => {
            refreshData();
          }}
          notify={notify}
        />
      </div>

      <form onSubmit={changePw} noValidate className="glass glass-hover dash-entrance dash-delay-3 space-y-5 p-6" aria-labelledby="pw-h">
        <h2 id="pw-h" className="text-lg font-bold">Change password</h2>
        <PasswordField label="Current password" autoComplete="current-password" value={pw.currentPassword} error={pwErr.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField label="New password" autoComplete="new-password" hint="8+ characters with a letter and a number." value={pw.newPassword} error={pwErr.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          <PasswordField label="Confirm new password" autoComplete="new-password" value={pw.confirmPassword} error={pwErr.confirmPassword} onChange={(e) => setPw({ ...pw, confirmPassword: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={pwBusy} className="btn btn-glass btn-sm !px-5">{pwBusy && <Loader2 size={14} className="animate-spin" />} Update password</button>
        </div>
      </form>

      <section className="glass glass-hover dash-entrance dash-delay-4 flex flex-wrap items-center justify-between gap-4 p-6" aria-labelledby="out-h">
        <div>
          <h2 id="out-h" className="text-lg font-bold">Log out</h2>
          <p className="text-sm text-sb-muted">End your session on this device.</p>
        </div>
        <button type="button" className="btn btn-danger" onClick={() => setConfirm(true)}><LogOut size={15} /> Log out</button>
      </section>

      <ConfirmModal open={confirm} title="Log out?" text="You will need to log in again to access your dashboard." confirmLabel="Log out" busy={outBusy} onClose={() => setConfirm(false)} onConfirm={async () => { setOutBusy(true); await logout(); }} />
    </div>
  );
}
