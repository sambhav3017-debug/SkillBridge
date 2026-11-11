"use client";

import { useState } from "react";
import { Loader2, Plus, Shield, Trash2, UserCheck, Users } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import {
  Avatar,
  ConfirmModal,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TextField,
  formatDate,
} from "@/components/student/ui";
import { TEAM_ROLES, type TeamMember, type TeamRole } from "@/lib/industry/types";

export default function TeamView() {
  const { data, manageTeam, notify } = useIndustry();
  const { recruiter, team } = data;
  const isAdmin = recruiter.role === "Company Admin";

  const [inviteOpen, setInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [role, setRole] = useState<TeamRole>("Recruiter");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setTopError(null);
    setBusy(true);
    const res = await manageTeam({ name, email, jobTitle, role }, "POST");
    setBusy(false);
    if (!res.ok) {
      setTopError(res.error);
      if (res.fieldErrors) setErrors(res.fieldErrors);
      return;
    }
    notify("success", `Added ${name} (${role}) to your hiring team.`);
    setName("");
    setEmail("");
    setJobTitle("");
    setRole("Recruiter");
    setInviteOpen(false);
  };

  const handleRoleChange = async (member: TeamMember, nextRole: TeamRole) => {
    const res = await manageTeam({ memberId: member.id, role: nextRole }, "PATCH");
    if (res.ok) notify("success", `Updated ${member.name}'s role to ${nextRole}.`);
    else notify("error", res.error);
  };

  const handleToggleActive = async (member: TeamMember) => {
    const nextStatus = member.status === "Deactivated" ? "Active" : "Deactivated";
    const res = await manageTeam({ memberId: member.id, status: nextStatus }, "PATCH");
    if (res.ok) notify("success", `${member.name} is now ${nextStatus}.`);
    else notify("error", res.error);
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    const res = await manageTeam({ memberId: removeTarget.id }, "DELETE");
    setRemoving(false);
    setRemoveTarget(null);
    if (res.ok) notify("success", "Team member removed.");
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring Team & Role Permissions"
        subtitle="Manage recruiters, hiring managers, and interviewers in your company workspace."
        action={
          isAdmin ? (
            <button type="button" onClick={() => setInviteOpen(true)} className="btn btn-primary">
              <Plus size={16} /> Invite Team Member
            </button>
          ) : undefined
        }
      />

      {/* Role Permissions Legend */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sb-cyan">
            <Shield size={14} /> Company Admin
          </div>
          <p className="mt-1.5 text-xs text-sb-muted">
            Full access to company branding, jobs, ATS stages, interviews, events, analytics, and team member permissions.
          </p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sb-cyan">
            <UserCheck size={14} /> Recruiter
          </div>
          <p className="mt-1.5 text-xs text-sb-muted">
            Can create and publish jobs, manage applicants and pipeline stages, discover talent, and schedule interviews.
          </p>
        </div>
        <div className="glass p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sb-cyan">
            <Users size={14} /> Interviewer
          </div>
          <p className="mt-1.5 text-xs text-sb-muted">
            Can view candidates, conduct scheduled interviews, and submit structured evaluation notes and rubrics.
          </p>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.02] text-xs uppercase tracking-wider text-sb-muted">
              <tr>
                <th className="px-5 py-3.5">Member</th>
                <th className="px-5 py-3.5">Job Title</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {team.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} size={36} />
                      <div>
                        <p className="font-semibold text-white">
                          {m.name}{" "}
                          {m.isOwner && (
                            <span className="ml-1.5 rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2 py-0.5 text-[10px] font-semibold text-sb-cyan">
                              Owner
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-sb-muted">
                          <a
                            href={`mailto:${m.email}`}
                            className="hover:underline hover:text-sb-cyan transition-colors"
                            aria-label={`Email ${m.name} at ${m.email}`}
                          >
                            {m.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-sb-muted">{m.jobTitle}</td>
                  <td className="px-5 py-4">
                    {isAdmin && !m.isOwner ? (
                      <select
                        aria-label={`Role for ${m.name}`}
                        value={m.role}
                        onChange={(e) => handleRoleChange(m, e.target.value as TeamRole)}
                        className="rounded-lg border border-white/15 bg-[#101318] px-2.5 py-1.5 text-xs font-semibold text-white"
                      >
                        {TEAM_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-xs font-semibold">
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-sb-muted">
                      {m.status} · Joined {formatDate(m.joinedAt)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {isAdmin && !m.isOwner && (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(m)}
                          className="btn btn-glass btn-sm"
                        >
                          {m.status === "Deactivated" ? "Activate" : "Deactivate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRemoveTarget(m)}
                          className="btn btn-danger btn-sm"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Hiring Team Member"
      >
        <form onSubmit={handleInvite} className="space-y-4" noValidate>
          {topError && <ErrorNote>{topError}</ErrorNote>}

          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-sb-muted">
            Demo mode notice: Adding a team member registers them in your workspace roster immediately with status{" "}
            <strong className="text-white">Invited (Demo — email not sent)</strong>.
          </p>

          <TextField
            label="Full Name"
            placeholder="Priya Kulkarni"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
          <TextField
            label="Work Email"
            type="email"
            placeholder="priya@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Job Title"
              placeholder="Senior Engineering Manager"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              error={errors.jobTitle}
              required
            />
            <SelectField
              label="Workspace Role"
              options={TEAM_ROLES}
              value={role}
              onChange={(e) => setRole(e.target.value as TeamRole)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setInviteOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {busy && <Loader2 size={14} className="animate-spin" />}
              Add Team Member
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        title="Remove Team Member"
        text={`Remove ${removeTarget?.name ?? ""} from your hiring team?`}
        confirmLabel="Remove Member"
        busy={removing}
        onConfirm={handleRemove}
      />
    </div>
  );
}
