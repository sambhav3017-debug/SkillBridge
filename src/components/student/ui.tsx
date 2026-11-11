"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Plus, X } from "lucide-react";
import { useCountUp } from "@/components/motion/MotionHooks";

/* ------------------------------ form fields ------------------------------ */

interface BaseProps {
  label: string;
  error?: string | null;
  hint?: string;
  optional?: boolean;
}

function FieldShell({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-sb-muted">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-sb-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs text-[#ff7ab8]">
          {error}
        </p>
      )}
    </div>
  );
}

const aria = (id: string, error?: string | null, hint?: string) => ({
  "aria-invalid": error ? (true as const) : undefined,
  "aria-describedby": error ? `${id}-err` : hint ? `${id}-hint` : undefined,
});

export function TextField({
  label,
  error,
  hint,
  optional,
  className = "",
  ...props
}: BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> & { className?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} {...{ label, error, hint, optional }}>
      <input id={id} className={`field ${className}`} {...aria(id, error, hint)} {...props} />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  error,
  hint,
  optional,
  ...props
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <FieldShell id={id} {...{ label, error, hint, optional }}>
      <textarea id={id} className="field" {...aria(id, error, hint)} {...props} />
    </FieldShell>
  );
}

export function SelectField({
  label,
  error,
  hint,
  optional,
  options,
  placeholder,
  ...props
}: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[]; placeholder?: string }) {
  const id = useId();
  return (
    <FieldShell id={id} {...{ label, error, hint, optional }}>
      <select id={id} className="field" {...aria(id, error, hint)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function PasswordField({
  label,
  error,
  hint,
  onVisibilityChange,
  ...props
}: BaseProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "className"> & {
  onVisibilityChange?: (visible: boolean) => void;
}) {
  const id = useId();
  const [show, setShow] = useState(false);

  const toggleShow = () => {
    const next = !show;
    setShow(next);
    onVisibilityChange?.(next);
  };

  return (
    <FieldShell id={id} {...{ label, error, hint }}>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} className="field pr-11" {...aria(id, error, hint)} {...props} />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-sb-muted transition-colors hover:text-sb-text"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </FieldShell>
  );
}

/** Multi-select pill group (checkbox semantics via aria-pressed). */
export function ToggleGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  error,
}: {
  legend: string;
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  error?: string | null;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              className="chip-toggle"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
            >
              {o}
            </button>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-[#ff7ab8]">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Free-text tag entry: Enter or comma adds, Backspace on empty removes the last tag. */
export function TagInput({
  label,
  value,
  onChange,
  placeholder,
  max = 15,
  optional,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
  optional?: boolean;
  hint?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const t = raw.trim().slice(0, 30);
    if (t && value.length < max && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setDraft("");
  };
  return (
    <FieldShell id={id} label={label} optional={optional} hint={hint ?? `Press Enter to add (up to ${max}).`}>
      <div className="field flex flex-wrap items-center gap-2 !p-2 focus-within:border-sb-cyan/70 focus-within:shadow-[0_0_0_3px_rgba(25,184,230,0.16)]">
        {value.map((t) => (
          <span key={t} className="chip">
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              className="opacity-70 hover:opacity-100"
              onClick={() => onChange(value.filter((v) => v !== t))}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={value.length ? "" : placeholder}
          disabled={value.length >= max}
          onChange={(e) => (e.target.value.includes(",") ? add(e.target.value.replace(",", "")) : setDraft(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft && add(draft)}
          className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-[var(--field-placeholder)]"
        />
      </div>
    </FieldShell>
  );
}

/* --------------------------------- layout --------------------------------- */

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sb-muted">
      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="dash-entrance mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-sb-text">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-sm text-sb-muted leading-relaxed">{subtitle}</p>}
      </div>
      {action && <div className="flex-none">{action}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass glass-hover dash-entrance flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5 text-sky-400 light:bg-slate-100 light:border-slate-200 light:text-sky-600 shadow-sm">
        {icon}
      </span>
      <h2 className="text-base font-semibold text-sb-text">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-sb-muted leading-relaxed">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorNote({ children, retry }: { children: React.ReactNode; retry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 light:bg-red-50 light:border-red-200 light:text-red-700">
      <span className="flex-1">{children}</span>
      {retry && (
        <button type="button" className="btn btn-danger btn-sm" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function LinkButton({ href, children, className = "btn btn-glass btn-sm" }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (src && !imgFailed) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={src}
        alt=""
        style={{ ...style, imageRendering: "-webkit-optimize-contrast" }}
        decoding="async"
        onError={() => setImgFailed(true)}
        className="flex-none rounded-lg border border-white/20 object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      data-keep-white
      style={style}
      className="grid flex-none place-items-center rounded-lg border border-white/10 bg-slate-800 text-white font-semibold shadow-sm light:bg-slate-200 light:text-slate-800 light:border-slate-300"
    >
      {initials || "?"}
    </span>
  );
}

export function ProgressRing({ percent, size = 96 }: { percent: number; size?: number }) {
  const animatedPercent = useCountUp(percent, 900);
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex-none" style={{ width: size, height: size }} role="img" aria-label={`${percent}% complete`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-white/10 light:text-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#0284c7"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-xl font-bold text-sb-text">{animatedPercent}%</span>
    </div>
  );
}

/* ---------------------------------- modal ---------------------------------- */

/** Native <dialog>: focus is trapped, Escape closes, and screen readers announce it as a dialog. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--glass-border)] px-6 py-4">
            <h2 id={titleId} className="text-lg font-bold">
              {title}
            </h2>
            <button type="button" onClick={onClose} aria-label="Close" className="text-sb-muted transition-colors hover:text-sb-text">
              <X size={20} />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--glass-border)] px-6 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export function ConfirmModal({
  open,
  title,
  text,
  confirmLabel,
  busy,
  confirmationKeyword,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  text: string;
  confirmLabel: string;
  busy?: boolean;
  confirmationKeyword?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const [typedInput, setTypedInput] = useState("");

  useEffect(() => {
    if (!open) setTypedInput("");
  }, [open]);

  const isConfirmed = confirmationKeyword
    ? typedInput.trim().toUpperCase() === confirmationKeyword.toUpperCase()
    : true;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            type="button"
            className="btn btn-ghost"
            autoFocus
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            disabled={busy || !isConfirmed}
            onClick={onConfirm}
          >
            {busy && <Loader2 size={14} className="animate-spin mr-1.5" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-sb-muted leading-relaxed">{text}</p>

        {confirmationKeyword && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.04] p-3 space-y-2">
            <label className="block text-xs font-semibold text-rose-500 dark:text-rose-400">
              To proceed, please type <strong className="font-mono">{confirmationKeyword}</strong> below:
            </label>
            <input
              type="text"
              value={typedInput}
              onChange={(e) => setTypedInput(e.target.value)}
              placeholder={confirmationKeyword}
              className="w-full rounded-lg border border-rose-500/40 bg-white/50 dark:bg-black/30 px-3 py-1.5 text-xs font-mono text-slate-800 dark:text-white focus:outline-none"
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export const PlusIcon = Plus;

export function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
