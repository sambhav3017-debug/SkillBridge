"use client";

import { useState } from "react";
import { Award, ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { validatePastDate, validateRequired, validateUrl } from "@/lib/student/validation";
import type { Certification } from "@/lib/student/types";
import { useStudent } from "./StudentProvider";
import SkillsEditor from "./SkillsEditor";
import { ConfirmModal, EmptyState, Modal, PageHeader, TextField, formatDate } from "./ui";

type Form = { title: string; issuer: string; issueDate: string; credentialUrl: string };
const BLANK: Form = { title: "", issuer: "", issueDate: "", credentialUrl: "" };

export default function SkillsView() {
  const { data, patch, notify } = useStudent();
  const [editing, setEditing] = useState<Certification | "new" | null>(null);
  const [form, setForm] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Certification | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  function open(c: Certification | "new") {
    setErrors({});
    setForm(c === "new" ? BLANK : { title: c.title, issuer: c.issuer, issueDate: c.issueDate, credentialUrl: c.credentialUrl ?? "" });
    setEditing(c);
  }

  async function saveCert(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const errs: Record<string, string> = {};
    const add = (k: string, m: string | null) => m && (errs[k] = m);
    add("title", validateRequired(form.title, "Certification title", 120));
    add("issuer", validateRequired(form.issuer, "Issuing organization", 120));
    add("issueDate", validatePastDate(form.issueDate, "Issue date"));
    add("credentialUrl", validateUrl(form.credentialUrl, "Credential URL"));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const item: Certification = {
      id: editing && editing !== "new" ? editing.id : crypto.randomUUID(),
      title: form.title.trim(),
      issuer: form.issuer.trim(),
      issueDate: form.issueDate,
      credentialUrl: form.credentialUrl.trim() || undefined,
    };
    const next = editing === "new" ? [item, ...data.certifications] : data.certifications.map((c) => (c.id === item.id ? item : c));
    setBusy(true);
    const r = await patch({ certifications: next });
    setBusy(false);
    if (r.ok) {
      notify("success", editing === "new" ? "Certification added." : "Certification updated.");
      setEditing(null);
    } else {
      setErrors(r.fieldErrors ?? {});
      notify("error", r.error ?? "Could not save certification.");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Skills & Certifications" subtitle="Add what you know, set how well you know it, and back it up with certifications." />

      <section className="glass glass-hover p-6 dash-entrance dash-delay-1" aria-labelledby="skills-h">
        <h2 id="skills-h" className="mb-4 text-lg font-bold text-sb-text">Skills <span className="ml-1 text-sm font-normal text-sb-muted">({data.skills.length})</span></h2>
        <SkillsEditor
          skills={data.skills}
          onChange={async (next) => {
            const r = await patch({ skills: next });
            return r.ok ? null : (r.error ?? "Could not save skills.");
          }}
        />
        {data.skills.length === 0 && <p className="mt-4 text-sm text-sb-muted">No skills yet. Add your first one above.</p>}
      </section>

      <section className="dash-entrance dash-delay-2" aria-labelledby="certs-h">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="certs-h" className="text-lg font-bold text-sb-text">Certifications <span className="ml-1 text-sm font-normal text-sb-muted">({data.certifications.length})</span></h2>
          <button type="button" onClick={() => open("new")} className="btn btn-glass btn-sm !px-4">
            <Plus size={15} /> Add certification
          </button>
        </div>
        {data.certifications.length === 0 ? (
          <EmptyState icon={<Award size={24} />} title="No certifications yet" text="Add courses and credentials you've completed to strengthen your profile." action={<button type="button" className="btn btn-primary" onClick={() => open("new")}>Add certification</button>} />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {data.certifications.map((c) => (
              <li key={c.id} className="glass glass-hover flex flex-col p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-sb-pink/50 text-sb-pink"><Award size={18} /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold leading-snug">{c.title}</h3>
                    <p className="text-sm text-sb-muted">{c.issuer}</p>
                    <p className="mt-1 text-xs text-sb-muted">Issued {formatDate(c.issueDate)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {c.credentialUrl && (
                    <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                      <ExternalLink size={13} /> Credential
                    </a>
                  )}
                  <button type="button" onClick={() => open(c)} className="btn btn-ghost btn-sm" aria-label={`Edit ${c.title}`}><Pencil size={13} /> Edit</button>
                  <button type="button" onClick={() => setToDelete(c)} className="btn btn-ghost btn-sm !px-3" aria-label={`Delete ${c.title}`}><Trash2 size={13} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add certification" : "Edit certification"}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="cert-form" disabled={busy} className="btn btn-primary">
              {busy && <Loader2 size={15} className="animate-spin" />} Save
            </button>
          </>
        }
      >
        <form id="cert-form" onSubmit={saveCert} noValidate className="space-y-4">
          <TextField label="Certification title" value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextField label="Issuing organization" value={form.issuer} error={errors.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} />
          <TextField label="Issue date" type="date" max={today} value={form.issueDate} error={errors.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
          <TextField label="Credential URL" optional type="url" value={form.credentialUrl} error={errors.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} placeholder="https://…" />
        </form>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Delete certification?"
        text={`“${toDelete?.title ?? ""}” will be removed from your profile.`}
        confirmLabel="Delete"
        busy={busy}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          setBusy(true);
          const r = await patch({ certifications: data.certifications.filter((c) => c.id !== toDelete!.id) });
          setBusy(false);
          setToDelete(null);
          notify(r.ok ? "success" : "error", r.ok ? "Certification deleted." : (r.error ?? "Could not delete."));
        }}
      />
    </div>
  );
}
