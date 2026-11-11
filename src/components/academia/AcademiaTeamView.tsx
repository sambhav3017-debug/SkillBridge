"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users2,
  X,
} from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import { ACADEMIA_ROLES, type AcademiaRole } from "@/lib/academia/types";

const ROLE_DESCRIPTIONS: Record<AcademiaRole, string> = {
  "Institution Owner":
    "Full control over institutional profile, verification, staff RBAC, departments, placements, and settings.",
  "Institution Administrator":
    "Manage departments, faculty, student directory, industry partnerships, events, announcements, and team roles.",
  "Placement Officer":
    "Coordinate placement drives, approve industry campus events, endorse employer jobs, and update placement statuses.",
  "Department Coordinator":
    "Manage department programs, student cohorts, faculty supervision, and departmental project listings.",
  "Faculty Member":
    "Publish academic projects & research fellowships, supervise students, and manage lab collaborations.",
  "Read-Only Analyst":
    "Inspect institutional dashboards, student readiness metrics, and export accreditation reports without write access.",
};

export default function AcademiaTeamView() {
  const { data, manageTeam, notify } = useAcademia();
  const { team, auditLog, departments, staff } = data;
  const canManageTeam =
    staff.role === "Institution Owner" || staff.role === "Institution Administrator";

  const [modalOpen, setModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [designation, setDesignation] = useState("Placement Coordinator");
  const [department, setDepartment] = useState(
    departments[0]?.name ?? "Training & Placement Cell",
  );
  const [role, setRole] = useState<AcademiaRole>("Placement Officer");

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    const res = await manageTeam(
      { name, email, designation, department, role },
      "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      notify("error", res.error ?? "Could not invite team member.");
      return;
    }
    notify(
      "success",
      `Added ${name} (${role}) to institutional team (Demo — email not sent).`,
    );
    setName("");
    setEmail("");
    setModalOpen(false);
  }

  async function updateMemberRole(memberId: string, nextRole: AcademiaRole) {
    const res = await manageTeam({ memberId, role: nextRole }, "PATCH");
    if (res.ok) notify("success", "Staff role updated.");
    else notify("error", res.error ?? "Failed to update role.");
  }

  async function toggleMemberStatus(memberId: string, current: string) {
    const nextStatus = current === "Deactivated" ? "Active" : "Deactivated";
    const res = await manageTeam({ memberId, status: nextStatus }, "PATCH");
    if (res.ok) notify("success", `Staff member ${nextStatus.toLowerCase()}.`);
    else notify("error", res.error ?? "Failed to update status.");
  }

  async function removeMember(memberId: string) {
    const res = await manageTeam({ memberId }, "DELETE");
    if (res.ok) notify("success", "Staff member removed from team.");
    else notify("error", res.error ?? "Failed to remove member.");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2.5 py-0.5 text-[11px] font-medium text-sb-cyan">
            <ShieldCheck size={12} /> Role-Based Access Control (RBAC)
          </span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Institution Team, Coordinators &amp; Permissions
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-sb-muted">
            Assign granular permissions to placement officers, department heads, faculty members,
            and accreditation analysts. Your current role:{" "}
            <strong className="text-sb-cyan">{staff.role}</strong>.
          </p>
        </div>

        {canManageTeam && (
          <button
            type="button"
            onClick={() => {
              setErrors({});
              setModalOpen(true);
            }}
            className="btn-primary px-4 py-2.5 text-xs font-semibold text-white"
          >
            <UserPlus size={15} /> Invite Staff / Coordinator
          </button>
        )}
      </div>

      {/* Role Matrix */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACADEMIA_ROLES.map((r) => (
          <div key={r} className="glass-panel rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">{r}</span>
              <span className="rounded-full border border-sb-cyan/30 bg-sb-cyan/10 px-2 py-0.5 text-[10px] text-sb-cyan">
                {team.filter((t) => t.role === r).length} member(s)
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-sb-muted">
              {ROLE_DESCRIPTIONS[r]}
            </p>
          </div>
        ))}
      </div>

      {/* Team Table */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold">Institutional Staff Roster ({team.length})</h2>
            <p className="text-xs text-sb-muted">
              Invitations in this environment are labeled clearly as demo records (no outbound SMTP
              email is dispatched).
            </p>
          </div>
          <Users2 size={18} className="text-sb-cyan" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-sb-muted">
              <tr>
                <th className="px-5 py-3">Staff Member</th>
                <th className="px-4 py-3">Designation &amp; Department</th>
                <th className="px-4 py-3">Assigned Role</th>
                <th className="px-4 py-3">Status</th>
                {canManageTeam && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {team.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      {m.name}
                      {m.isOwner && (
                        <span className="rounded-full border border-sb-cyan/40 bg-sb-cyan/15 px-2 py-0.5 text-[10px] text-sb-cyan">
                          Owner
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-sb-muted">
                      <a
                        href={`mailto:${m.email}`}
                        className="hover:underline hover:text-sb-cyan transition-colors"
                        aria-label={`Email ${m.name} at ${m.email}`}
                      >
                        {m.email}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sb-muted">
                    <div className="text-white/90">{m.designation}</div>
                    <div className="text-[11px]">{m.department}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    {canManageTeam && !m.isOwner ? (
                      <select
                        aria-label={`Change role for ${m.name}`}
                        value={m.role}
                        onChange={(e) =>
                          updateMemberRole(m.id, e.target.value as AcademiaRole)
                        }
                        className="field-input w-auto py-1.5 text-xs"
                      >
                        {ACADEMIA_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white">
                        {m.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                        m.status === "Active"
                          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                          : m.status === "Deactivated"
                            ? "border-sb-pink/40 bg-sb-pink/10 text-sb-pink"
                            : "border-sb-cyan/30 bg-sb-cyan/10 text-sb-cyan"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  {canManageTeam && (
                    <td className="px-4 py-3.5 text-right">
                      {!m.isOwner && (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleMemberStatus(m.id, m.status)}
                            className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-sb-muted hover:text-white"
                          >
                            {m.status === "Deactivated" ? "Activate" : "Deactivate"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMember(m.id)}
                            className="rounded-lg border border-white/10 bg-white/[0.03] p-1.5 text-sb-muted hover:text-sb-pink"
                            aria-label={`Remove ${m.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Audit Log */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Institutional Activity &amp; Governance Log</h2>
            <p className="text-xs text-sb-muted">
              Chronological audit trail of administrative actions across departments and placements.
            </p>
          </div>
          <Clock size={16} className="text-sb-cyan" />
        </div>

        <div className="mt-4 divide-y divide-white/[0.06]">
          {auditLog.slice(0, 10).map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
            >
              <div>
                <span className="font-semibold text-white">{item.actorName}</span>{" "}
                <span className="text-sb-cyan">({item.actorRole})</span> —{" "}
                <span className="text-sb-muted">{item.action}</span>
              </div>
              <span className="text-[11px] text-sb-muted">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-modal-title"
        >
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 id="team-modal-title" className="text-lg font-semibold">
                  Invite Institutional Staff / Coordinator
                </h2>
                <p className="text-xs text-sb-muted">
                  Assign a role and department. Invitations are recorded in the roster (Demo — email
                  not sent).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-sb-muted hover:bg-white/5 hover:text-white"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={inviteMember} className="mt-4 space-y-4">
              <div>
                <label className="field-label" htmlFor="tm-name">
                  Full Name *
                </label>
                <input
                  id="tm-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Prof. Siddharth Menon"
                  className="field-input"
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>

              <div>
                <label className="field-label" htmlFor="tm-email">
                  Institutional Email *
                </label>
                <input
                  id="tm-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="s.menon@university.ac.in"
                  className="field-input"
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor="tm-desig">
                    Designation *
                  </label>
                  <input
                    id="tm-desig"
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="field-input"
                  />
                  {errors.designation && <p className="field-error">{errors.designation}</p>}
                </div>

                <div>
                  <label className="field-label" htmlFor="tm-dept">
                    Department / Cell
                  </label>
                  <input
                    id="tm-dept"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="field-input"
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="tm-role">
                  Access Role (RBAC)
                </label>
                <select
                  id="tm-role"
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
                <p className="mt-1.5 text-[11px] text-sb-muted">{ROLE_DESCRIPTIONS[role]}</p>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost px-4 py-2 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn-primary px-5 py-2 text-xs font-semibold text-white"
                >
                  <CheckCircle2 size={14} />
                  {busy ? "Adding..." : "Send Staff Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
