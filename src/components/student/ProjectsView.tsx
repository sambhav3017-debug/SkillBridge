"use client";

import { useState } from "react";
import { ExternalLink, FolderGit2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { validateRequired, validateUrl } from "@/lib/student/validation";
import type { Project } from "@/lib/student/types";
import { useStudent } from "./StudentProvider";
import { ConfirmModal, EmptyState, Modal, PageHeader, TagInput, TextAreaField, TextField } from "./ui";

type Form = { title: string; description: string; technologies: string[]; url: string };
const BLANK: Form = { title: "", description: "", technologies: [], url: "" };

export default function ProjectsView({ autoOpen = false }: { autoOpen?: boolean }) {
  const { data, patch, notify } = useStudent();
  const [editing, setEditing] = useState<Project | "new" | null>(autoOpen ? "new" : null);
  const [form, setForm] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Project | null>(null);

  function open(p: Project | "new") {
    setErrors({});
    setForm(p === "new" ? BLANK : { title: p.title, description: p.description, technologies: p.technologies, url: p.url ?? "" });
    setEditing(p);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const errs: Record<string, string> = {};
    const add = (k: string, m: string | null) => m && (errs[k] = m);
    add("title", validateRequired(form.title, "Project title", 100));
    add("description", validateRequired(form.description, "Description", 1000));
    add("url", validateUrl(form.url, "Project URL"));
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const item: Project = {
      id: editing && editing !== "new" ? editing.id : crypto.randomUUID(),
      title: form.title.trim(),
      description: form.description.trim(),
      technologies: form.technologies,
      url: form.url.trim() || undefined,
    };
    const next = editing === "new" ? [item, ...data.projects] : data.projects.map((p) => (p.id === item.id ? item : p));
    setBusy(true);
    const r = await patch({ projects: next });
    setBusy(false);
    if (r.ok) {
      notify("success", editing === "new" ? "Project added." : "Project updated.");
      setEditing(null);
    } else {
      setErrors(r.fieldErrors ?? {});
      notify("error", r.error ?? "Could not save project.");
    }
  }

  const addBtn = (
    <button type="button" onClick={() => open("new")} className="btn btn-primary btn-primary-sm">
      <Plus size={15} /> Add project
    </button>
  );

  return (
    <div>
      <PageHeader title="Projects" subtitle="Show what you've built. Projects are the strongest signal on a student profile." action={data.projects.length ? addBtn : undefined} />

      {data.projects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 size={24} />}
          title="No projects yet"
          text="Add a project you've built, with the technologies you used and a link to the code or live demo."
          action={<button type="button" className="btn btn-primary" onClick={() => open("new")}>Add Your First Project</button>}
        />
      ) : (
        <ul className="dash-entrance dash-delay-1 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.projects.map((p) => (
            <li key={p.id} className="glass glass-hover flex flex-col p-5">
              <h2 className="text-base font-bold leading-snug">{p.title}</h2>
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-sb-muted">{p.description}</p>
              {p.technologies.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Technologies">
                  {p.technologies.map((t) => <li key={t} className="chip">{t}</li>)}
                </ul>
              )}
              <div className="mt-auto flex items-center gap-2 pt-5">
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    <ExternalLink size={13} /> Open
                  </a>
                )}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => open(p)} aria-label={`Edit ${p.title}`}><Pencil size={13} /> Edit</button>
                <button type="button" className="btn btn-ghost btn-sm !px-3" onClick={() => setToDelete(p)} aria-label={`Delete ${p.title}`}><Trash2 size={13} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add project" : "Edit project"}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button type="submit" form="project-form" disabled={busy} className="btn btn-primary">
              {busy && <Loader2 size={15} className="animate-spin" />} Save project
            </button>
          </>
        }
      >
        <form id="project-form" onSubmit={submit} noValidate className="space-y-4">
          <TextField label="Project title" maxLength={100} value={form.title} error={errors.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextAreaField label="Description" rows={4} maxLength={1000} value={form.description} error={errors.description} onChange={(e) => setForm({ ...form, description: e.target.value })} hint={`${form.description.length}/1000`} />
          <TagInput label="Technologies used" optional value={form.technologies} onChange={(v) => setForm({ ...form, technologies: v })} placeholder="e.g. React, Node.js" />
          <TextField label="GitHub or live demo URL" optional type="url" value={form.url} error={errors.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://…" />
        </form>
      </Modal>

      <ConfirmModal
        open={!!toDelete}
        title="Delete project?"
        text={`“${toDelete?.title ?? ""}” will be permanently removed from your portfolio.`}
        confirmLabel="Delete"
        busy={busy}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          setBusy(true);
          const r = await patch({ projects: data.projects.filter((p) => p.id !== toDelete!.id) });
          setBusy(false);
          setToDelete(null);
          notify(r.ok ? "success" : "error", r.ok ? "Project deleted." : (r.error ?? "Could not delete."));
        }}
      />
    </div>
  );
}
