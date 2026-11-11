"use client";

import { useState } from "react";
import { Building2, FileCheck2, Handshake, Loader2, Plus, Trash2 } from "lucide-react";
import { useAcademia } from "./AcademiaProvider";
import {
  ConfirmModal,
  EmptyState,
  ErrorNote,
  Modal,
  PageHeader,
  SelectField,
  TextAreaField,
  TextField,
  ToggleGroup,
} from "@/components/student/ui";
import { PARTNERSHIP_STATUSES, type IndustryPartnership, type PartnershipStatus } from "@/lib/academia/types";
import { INDUSTRY_CATEGORIES } from "@/lib/industry/types";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

const COLLAB_TYPES = [
  "Campus Hiring",
  "Internships",
  "Guest Lectures",
  "Sponsored Projects",
  "Faculty Research",
  "Memorandum of Understanding (MoU)",
] as const;

export default function IndustryPartnersView() {
  const { data, managePartnerships, notify } = useAcademia();
  const { staff, partnerships, industryCompanies } = data;
  const canEdit = staff.role !== "Read-Only Analyst";

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState<string>(INDUSTRY_CATEGORIES[0]);
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [collaborationTypes, setCollaborationTypes] = useState<string[]>(["Campus Hiring", "Internships"]);
  const [status, setStatus] = useState<PartnershipStatus>("Requested");
  const [mouSigned, setMouSigned] = useState(false);
  const [mouReference, setMouReference] = useState("");
  const [mouValidUntil, setMouValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<IndustryPartnership | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCreate = (prefillName = "", prefillIndustry = INDUSTRY_CATEGORIES[0], prefillWeb = "") => {
    setEditingId(null);
    setCompanyName(prefillName);
    setIndustry(prefillIndustry);
    setWebsite(prefillWeb);
    setContactName("");
    setContactEmail("");
    setCollaborationTypes(["Campus Hiring", "Internships"]);
    setStatus("Requested");
    setMouSigned(false);
    setMouReference("");
    setMouValidUntil("");
    setNotes("");
    setError(null);
    setModalOpen(true);
  };

  const openEdit = (p: IndustryPartnership) => {
    setEditingId(p.id);
    setCompanyName(p.companyName);
    setIndustry(p.industry);
    setWebsite(p.website);
    setContactName(p.contactName);
    setContactEmail(p.contactEmail);
    setCollaborationTypes(p.collaborationTypes);
    setStatus(p.status);
    setMouSigned(p.mouSigned);
    setMouReference(p.mouReference ?? "");
    setMouValidUntil(p.mouValidUntil ?? "");
    setNotes(p.notes);
    setError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await managePartnerships(
      {
        id: editingId ?? undefined,
        companyName,
        industry,
        website,
        contactName,
        contactEmail,
        collaborationTypes,
        status,
        mouSigned,
        mouReference,
        mouValidUntil,
        notes,
      },
      editingId ? "PATCH" : "POST",
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    notify("success", editingId ? "Partnership updated." : `Logged industry partnership with ${companyName}.`);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await managePartnerships({ partnershipId: deleteTarget.id }, "DELETE");
    setDeleting(false);
    setDeleteTarget(null);
    if (res.ok) notify("success", "Partnership record removed.");
    else notify("error", res.error);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Industry Relations & MoU Partnerships"
        subtitle="Manage corporate relationships, campus hiring collaborations, guest lectures, and verified Memorandum of Understanding (MoU) records."
        action={
          canEdit ? (
            <button type="button" onClick={() => openCreate()} className="btn btn-primary">
              <Plus size={16} /> Log Partnership / Request Collaboration
            </button>
          ) : undefined
        }
      />

      {/* Registered Industry Portal Companies Directory */}
      {industryCompanies.length > 0 && (
        <section className="glass space-y-3 p-5">
          <h2 className="text-sm font-bold text-sb-cyan">
            Employers Registered on SkillBridge Industry Portal ({industryCompanies.length})
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {industryCompanies.map((c) => {
              const alreadyPartner = partnerships.some(
                (p) => p.companyName.toLowerCase() === c.name.toLowerCase(),
              );
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5 text-xs"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">{c.name}</p>
                    <p className="truncate text-sb-muted">
                      {c.industry} {c.headquarters ? `· ${c.headquarters}` : ""}
                    </p>
                  </div>
                  {canEdit && !alreadyPartner && (
                    <button
                      type="button"
                      onClick={() => openCreate(c.name, c.industry as never, c.website)}
                      className="btn btn-glass btn-sm flex-none"
                    >
                      Connect
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Partnerships List */}
      {partnerships.length === 0 ? (
        <EmptyState
          icon={<Handshake size={22} />}
          title="No institutional partnerships logged yet"
          text="Track collaboration requests, active hiring partnerships, and authorized MoU agreements with industry organizations."
          action={
            canEdit ? (
              <button type="button" onClick={() => openCreate()} className="btn btn-primary btn-sm">
                <Plus size={15} /> Add First Industry Partner
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {partnerships.map((p) => (
            <article key={p.id} className="glass flex flex-col justify-between p-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">{p.companyName}</h2>
                      <span className="rounded-full border border-sb-cyan/40 bg-sb-blue/15 px-2.5 py-0.5 text-xs font-semibold text-sb-cyan">
                        {p.status}
                      </span>
                      {p.mouSigned && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                          <FileCheck2 size={12} /> MoU Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-sb-muted">
                      <Building2 size={12} className="mr-1 inline text-sb-cyan" />
                      {p.industry} · Contact: <strong className="text-white">{p.contactName}</strong> ({p.contactEmail})
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {p.collaborationTypes.map((ct) => (
                    <span key={ct} className="chip">
                      {ct}
                    </span>
                  ))}
                </div>

                {p.mouSigned && p.mouReference && (
                  <p className="mt-3 text-xs text-sb-muted">
                    MoU Ref: <strong className="text-white">{p.mouReference}</strong>
                    {p.mouValidUntil ? ` · Valid until ${p.mouValidUntil}` : ""}
                  </p>
                )}

                {p.notes && <p className="mt-2.5 text-xs text-sb-muted">{p.notes}</p>}
              </div>

              {canEdit && (
                <div className="mt-4 flex justify-end gap-2 border-t border-white/10 pt-3.5">
                  <button type="button" onClick={() => openEdit(p)} className="btn btn-glass btn-sm">
                    Edit Partnership
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(p)}
                    className="btn btn-danger btn-sm"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Industry Partnership" : "Log Industry Partnership / Collaboration Request"}
      >
        <form onSubmit={handleSave} className="space-y-4" noValidate>
          {error && <ErrorNote>{error}</ErrorNote>}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Company Name"
              placeholder="Acme Cloud Systems"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <SelectField
              label="Industry Category"
              options={INDUSTRY_CATEGORIES}
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <TextField
              label="Contact Person Name"
              placeholder="Vikram Deshpande"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              required
            />
            <TextField
              label="Contact Email"
              type="email"
              placeholder="vikram@acme.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
            <TextField
              label="Company Website"
              optional
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
            <SelectField
              label="Partnership Status"
              options={PARTNERSHIP_STATUSES}
              value={status}
              onChange={(e) => setStatus(e.target.value as PartnershipStatus)}
            />
          </div>

          <ToggleGroup
            legend="Collaboration Scope"
            options={COLLAB_TYPES}
            value={collaborationTypes}
            onChange={setCollaborationTypes}
          />

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-3 text-xs font-medium">
              <span>Authorized Memorandum of Understanding (MoU) Signed</span>
              <SkillBridgeToggle
                checked={mouSigned}
                onChange={setMouSigned}
                aria-label="Authorized Memorandum of Understanding (MoU) Signed"
                accent="cyan"
              />
            </div>
            {mouSigned && (
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="MoU Reference ID"
                  placeholder="MOU-2026-019"
                  value={mouReference}
                  onChange={(e) => setMouReference(e.target.value)}
                />
                <TextField
                  label="Valid Until"
                  type="date"
                  value={mouValidUntil}
                  onChange={(e) => setMouValidUntil(e.target.value)}
                />
              </div>
            )}
          </div>

          <TextAreaField
            label="Relationship & Engagement Notes"
            rows={2}
            optional
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn btn-primary btn-sm">
              {busy && <Loader2 size={14} className="animate-spin" />}
              Save Partnership
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Partnership Record"
        text={`Delete partnership record with ${deleteTarget?.companyName ?? ""}?`}
        confirmLabel="Delete"
        busy={deleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
