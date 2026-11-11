"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PROFICIENCY, type Proficiency, type Skill } from "@/lib/student/types";

type Commit = (next: Skill[]) => Promise<string | null | void> | string | null | void;

const LEVEL_STYLE: Record<Proficiency, string> = {
  Beginner: "chip-muted",
  Intermediate: "",
  Advanced: "chip-pink",
};

function Row({ skill, onRename, onLevel, onRemove, busy }: { skill: Skill; onRename: (n: string) => void; onLevel: (l: Proficiency) => void; onRemove: () => void; busy: boolean }) {
  const [name, setName] = useState(skill.name);
  return (
    <li className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 sm:gap-3">
      <input
        aria-label={`Skill name for ${skill.name}`}
        value={name}
        maxLength={40}
        disabled={busy}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          const t = name.trim();
          if (t && t !== skill.name) onRename(t);
          else setName(skill.name);
        }}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="field !border-transparent !bg-transparent !py-1.5 font-medium"
      />
      <select
        aria-label={`Proficiency for ${skill.name}`}
        value={skill.level}
        disabled={busy}
        onChange={(e) => onLevel(e.target.value as Proficiency)}
        className="field !w-auto !py-1.5 text-[13px]"
      >
        {PROFICIENCY.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <button
        type="button"
        onClick={onRemove}
        disabled={busy}
        aria-label={`Remove ${skill.name}`}
        className="grid h-9 w-9 flex-none place-items-center rounded-lg text-sb-muted transition-colors hover:bg-sb-pink/10 hover:text-sb-pink"
      >
        <Trash2 size={16} />
      </button>
    </li>
  );
}

export function SkillTag({ skill }: { skill: Skill }) {
  return (
    <span className={`chip ${LEVEL_STYLE[skill.level]}`}>
      {skill.name}
      <span className="text-[10px] uppercase tracking-wider opacity-70">{skill.level.slice(0, 3)}</span>
    </span>
  );
}

export default function SkillsEditor({ skills, onChange }: { skills: Skill[]; onChange: Commit }) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Proficiency>("Beginner");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function commit(next: Skill[]) {
    setBusy(true);
    const err = await onChange(next);
    setBusy(false);
    setError(err ?? null);
    return !err;
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const t = name.trim();
    if (!t) return setError("Enter a skill name.");
    if (skills.some((s) => s.name.toLowerCase() === t.toLowerCase())) return setError(`"${t}" is already in your skills.`);
    if (await commit([...skills, { id: crypto.randomUUID(), name: t, level }])) setName("");
  }

  return (
    <div>
      <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row" noValidate>
        <input
          aria-label="New skill name"
          value={name}
          maxLength={40}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. React, Python, Figma"
          className="field flex-1"
        />
        <select aria-label="Proficiency level" value={level} onChange={(e) => setLevel(e.target.value as Proficiency)} className="field sm:!w-40">
          {PROFICIENCY.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <button type="submit" disabled={busy} className="btn btn-glass !px-5">
          <Plus size={16} aria-hidden="true" /> Add
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs text-[#ff7ab8]">
          {error}
        </p>
      )}
      {skills.length > 0 && (
        <ul className="mt-4 space-y-2" aria-label="Your skills">
          {skills.map((s) => (
            <Row
              key={s.id + s.name + s.level}
              skill={s}
              busy={busy}
              onRename={(n) => commit(skills.map((x) => (x.id === s.id ? { ...x, name: n } : x)))}
              onLevel={(l) => commit(skills.map((x) => (x.id === s.id ? { ...x, level: l } : x)))}
              onRemove={() => commit(skills.filter((x) => x.id !== s.id))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
