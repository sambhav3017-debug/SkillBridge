"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { academiaApi, type AcademiaApiResult } from "@/lib/academia/client";
import type { AcademiaWorkspaceData } from "@/lib/academia/types";

interface Toast {
  id: number;
  kind: "success" | "error";
  text: string;
}

interface AcademiaCtx {
  data: AcademiaWorkspaceData;
  notify: (kind: Toast["kind"], text: string) => void;
  updateMe: (body: { institution?: Record<string, unknown>; staff?: Record<string, unknown> }) => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  manageStudents: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  manageFaculty: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  manageDepartments: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  managePlacements: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  managePartnerships: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  manageOpportunities: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  manageEvents: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  manageAnnouncements: (body: Record<string, unknown>, method?: "POST" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  manageTeam: (body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE") => Promise<AcademiaApiResult<AcademiaWorkspaceData>>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AcademiaCtx | null>(null);

export function useAcademia() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAcademia must be used inside <AcademiaProvider>");
  return c;
}

export default function AcademiaProvider({
  initial,
  children,
}: {
  initial: AcademiaWorkspaceData;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const notify = useCallback((kind: Toast["kind"], text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const track = useCallback(async (p: Promise<AcademiaApiResult<AcademiaWorkspaceData>>) => {
    const r = await p;
    if (r.ok && r.data) setData(r.data);
    return r;
  }, []);

  const value = useMemo<AcademiaCtx>(
    () => ({
      data,
      notify,
      updateMe: (body) =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/me", { method: "PATCH", json: body })),
      manageStudents: async (body, method = "POST") => {
        if (method === "DELETE" && body?.id) {
          const prev = data;
          setData((current) => ({
            ...current,
            students: current.students.filter((s) => s.id !== body.id),
          }));
          try {
            const res = await academiaApi<AcademiaWorkspaceData>("/api/academia/students", { method, json: body });
            if (res.ok && res.data) {
              setData(res.data);
            } else {
              setData(prev);
            }
            return res;
          } catch (err: any) {
            setData(prev);
            return { ok: false, error: err?.message || "Failed to remove student.", status: 500 };
          }
        }
        return track(academiaApi<AcademiaWorkspaceData>("/api/academia/students", { method, json: body }));
      },
      manageFaculty: (body, method = "POST") =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/faculty", { method, json: body })),
      manageDepartments: (body, method = "POST") =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/departments", { method, json: body })),
      managePlacements: (body, method = "POST") =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/placements", { method, json: body })),
      managePartnerships: (body, method = "POST") =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/partnerships", { method, json: body })),
      manageOpportunities: (body, method = "POST") =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/opportunities", { method, json: body })),
      manageEvents: (body, method = "POST") =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/events", { method, json: body })),
      manageAnnouncements: (body, method = "POST") =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/announcements", { method, json: body })),
      manageTeam: (body, method) =>
        track(academiaApi<AcademiaWorkspaceData>("/api/academia/team", { method, json: body })),
      logout: async () => {
        await academiaApi("/api/academia/auth/logout", { method: "POST" });
        router.replace("/academia/login?loggedout=1");
        router.refresh();
      },
    }),
    [data, notify, track, router],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rise pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#101214]/95 light:bg-[#FFFFFF]/95 light:text-[#202536] light:shadow-[0_14px_34px_-8px_rgba(32,37,54,0.16)] px-4 py-3 text-sm shadow-xl backdrop-blur ${
              t.kind === "success" ? "border-sb-cyan/40 light:border-[#007BA7]/35" : "border-sb-pink/50 light:border-[#E11D48]/35"
            }`}
          >
            {t.kind === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 flex-none text-sb-cyan" />
            ) : (
              <XCircle size={18} className="mt-0.5 flex-none text-sb-pink" />
            )}
            <span className="flex-1">{t.text}</span>
            <button
              type="button"
              aria-label="Dismiss"
              className="text-sb-muted hover:text-white"
              onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
