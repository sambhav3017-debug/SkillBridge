"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { api, type ApiResult } from "@/lib/student/client";
import { getCompletion } from "@/lib/student/completion";
import type { Opportunity, StudentData, StudentTask } from "@/lib/student/types";

type Patch = Partial<{
  account: { name: string; email: string };
  profile: Record<string, unknown>;
  skills: unknown[];
  certifications: unknown[];
  projects: unknown[];
}>;

interface Toast {
  id: number;
  kind: "success" | "error";
  text: string;
}

interface Ctx {
  data: StudentData;
  completion: ReturnType<typeof getCompletion>;
  opps: Opportunity[] | null;
  oppsError: string | null;
  loadOpps: () => Promise<void>;
  patch: (p: Patch) => Promise<ApiResult<StudentData>>;
  setSaved: (opportunityId: string, saved: boolean) => Promise<ApiResult<StudentData>>;
  apply: (opportunityId: string) => Promise<ApiResult<StudentData>>;
  withdraw: (applicationId: string) => Promise<ApiResult<StudentData>>;
  uploadResume: (file: File) => Promise<ApiResult<StudentData>>;
  removeResume: () => Promise<ApiResult<StudentData>>;
  createTask: (task: Omit<StudentTask, "id" | "createdAt" | "updatedAt" | "completed">) => Promise<ApiResult<{ task: StudentTask; student: StudentData }>>;
  updateTask: (taskId: string, patch: Partial<StudentTask>) => Promise<ApiResult<{ task: StudentTask; student: StudentData }>>;
  deleteTask: (taskId: string) => Promise<ApiResult<{ deletedId: string; student: StudentData }>>;
  toggleTaskComplete: (taskId: string, completed: boolean) => Promise<ApiResult<{ task: StudentTask; student: StudentData }>>;
  refreshData: () => Promise<void>;
  logout: () => Promise<void>;
  notify: (kind: Toast["kind"], text: string) => void;
}

const StudentCtx = createContext<Ctx | null>(null);

export function useStudent() {
  const c = useContext(StudentCtx);
  if (!c) throw new Error("useStudent must be used inside <StudentProvider>");
  return c;
}

export default function StudentProvider({ initial, children }: { initial: StudentData; children: React.ReactNode }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [opps, setOpps] = useState<Opportunity[] | null>(null);
  const [oppsError, setOppsError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const notify = useCallback((kind: Toast["kind"], text: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t.slice(-2), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const loadOpps = useCallback(async () => {
    setOppsError(null);
    const r = await api<Opportunity[]>("/api/student/opportunities");
    if (r.ok && r.data) setOpps(r.data);
    else setOppsError(r.error ?? "Could not load opportunities.");
  }, []);

  useEffect(() => {
    let cancelled = false;
    api<Opportunity[]>("/api/student/opportunities").then((r) => {
      if (cancelled) return;
      if (r.ok && r.data) setOpps(r.data);
      else setOppsError(r.error ?? "Could not load opportunities.");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const track = useCallback(async (p: Promise<ApiResult<StudentData>>) => {
    const r = await p;
    if (r.ok && r.data) setData(r.data);
    return r;
  }, []);

  const trackTask = useCallback(async <T extends { student: StudentData }>(p: Promise<ApiResult<T>>) => {
    const r = await p;
    if (r.ok && r.data?.student) setData(r.data.student);
    return r;
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      data,
      completion: getCompletion(data),
      opps,
      oppsError,
      loadOpps,
      notify,
      patch: async (p) => {
        const prev = data;
        setData((current) => ({
          ...current,
          ...(p.account ? { user: { ...current.user, ...p.account } } : {}),
          ...(p.profile ? { profile: { ...current.profile, ...(p.profile as any) } } : {}),
        }));
        try {
          const res = await api<StudentData>("/api/student/me", { method: "PATCH", json: p });
          if (res.ok && res.data) {
            setData(res.data);
          } else {
            setData(prev);
          }
          return res;
        } catch (err: any) {
          setData(prev);
          return { ok: false, error: err?.message || "Failed to save updates.", status: 500 };
        }
      },
      setSaved: async (id, saved) => {
        const prev = data;
        setData((current) => {
          const currentSaved = current.saved || [];
          const nextSaved = saved
            ? Array.from(new Set([...currentSaved, id]))
            : currentSaved.filter((item) => item !== id);
          return { ...current, saved: nextSaved };
        });
        try {
          const res = await api<StudentData>("/api/student/saved", {
            method: saved ? "POST" : "DELETE",
            json: { opportunityId: id },
          });
          if (res.ok && res.data) {
            setData(res.data);
          } else {
            setData(prev);
          }
          return res;
        } catch (err: any) {
          setData(prev);
          return { ok: false, error: err?.message || "Failed to update saved item.", status: 500 };
        }
      },
      apply: (id) => track(api<StudentData>("/api/student/applications", { method: "POST", json: { opportunityId: id } })),
      withdraw: (id) => track(api<StudentData>("/api/student/applications", { method: "DELETE", json: { applicationId: id } })),
      uploadResume: (file) => {
        const f = new FormData();
        f.append("file", file);
        return track(api<StudentData>("/api/student/resume", { method: "POST", body: f }));
      },
      removeResume: () => track(api<StudentData>("/api/student/resume", { method: "DELETE" })),
      createTask: (t) =>
        trackTask(api<{ task: StudentTask; student: StudentData }>("/api/student/tasks", { method: "POST", json: t })),
      updateTask: (id, p) =>
        trackTask(api<{ task: StudentTask; student: StudentData }>(`/api/student/tasks/${id}`, { method: "PATCH", json: p })),
      deleteTask: async (id) => {
        const prev = data;
        setData((current) => ({
          ...current,
          tasks: (current.tasks || []).filter((t) => t.id !== id),
        }));
        try {
          const res = await api<{ deletedId: string; student: StudentData }>(`/api/student/tasks/${id}`, {
            method: "DELETE",
          });
          if (res.ok && res.data?.student) {
            setData(res.data.student);
          } else {
            setData(prev);
          }
          return res;
        } catch (err: any) {
          setData(prev);
          return { ok: false, error: err?.message || "Failed to delete task.", status: 500 };
        }
      },
      toggleTaskComplete: async (id, completed) => {
        const prev = data;
        setData((current) => {
          const nextTasks = (current.tasks || []).map((t) =>
            t.id === id ? { ...t, completedAt: completed ? new Date().toISOString() : undefined } : t
          );
          return { ...current, tasks: nextTasks };
        });
        try {
          const res = await api<{ task: StudentTask; student: StudentData }>(`/api/student/tasks/${id}`, {
            method: "PATCH",
            json: { completed },
          });
          if (res.ok && res.data?.student) {
            setData(res.data.student);
          } else {
            setData(prev);
          }
          return res;
        } catch (err: any) {
          setData(prev);
          return { ok: false, error: err?.message || "Failed to update task.", status: 500 };
        }
      },
      refreshData: async () => {
        const r = await api<StudentData>("/api/student/me");
        if (r.ok && r.data) setData(r.data);
      },
      logout: async () => {
        await api("/api/student/auth/logout", { method: "POST" });
        router.replace("/student/login?loggedout=1");
        router.refresh();
      },
    }),
    [data, opps, oppsError, loadOpps, notify, track, trackTask, router],
  );

  return (
    <StudentCtx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2" role="status" aria-live="polite">
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
    </StudentCtx.Provider>
  );
}
