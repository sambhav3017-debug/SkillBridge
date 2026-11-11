"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { industryApi, type IndustryApiResult } from "@/lib/industry/client";
import type { IndustryWorkspaceData } from "@/lib/industry/types";

interface Toast {
  id: number;
  kind: "success" | "error";
  text: string;
}

interface IndustryCtx {
  data: IndustryWorkspaceData;
  notify: (kind: Toast["kind"], text: string) => void;
  updateMe: (body: { company?: Record<string, unknown>; recruiter?: Record<string, unknown> }) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  createJob: (body: Record<string, unknown>) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  updateJob: (jobId: string, body: Record<string, unknown>) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  deleteJob: (jobId: string) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  updateApplicants: (body: Record<string, unknown>) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  setSavedCandidate: (candidateId: string, saved: boolean) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  sendMessage: (body: Record<string, unknown>) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  markRead: (conversationId: string) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  saveInterview: (body: Record<string, unknown>, isUpdate?: boolean) => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  saveEvent: (body: Record<string, unknown>, method?: "POST" | "PATCH" | "DELETE") => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  manageTeam: (body: Record<string, unknown>, method: "POST" | "PATCH" | "DELETE") => Promise<IndustryApiResult<IndustryWorkspaceData>>;
  logout: () => Promise<void>;
}

const Ctx = createContext<IndustryCtx | null>(null);

export function useIndustry() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useIndustry must be used inside <IndustryProvider>");
  return c;
}

export default function IndustryProvider({
  initial,
  children,
}: {
  initial: IndustryWorkspaceData;
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

  const track = useCallback(async (p: Promise<IndustryApiResult<IndustryWorkspaceData>>) => {
    const r = await p;
    if (r.ok && r.data) setData(r.data);
    return r;
  }, []);

  const value = useMemo<IndustryCtx>(
    () => ({
      data,
      notify,
      updateMe: (body) => track(industryApi<IndustryWorkspaceData>("/api/industry/me", { method: "PATCH", json: body })),
      createJob: (body) => track(industryApi<IndustryWorkspaceData>("/api/industry/jobs", { method: "POST", json: body })),
      updateJob: (jobId, body) =>
        track(industryApi<IndustryWorkspaceData>(`/api/industry/jobs/${jobId}`, { method: "PATCH", json: body })),
      deleteJob: (jobId) =>
        track(industryApi<IndustryWorkspaceData>(`/api/industry/jobs/${jobId}`, { method: "DELETE" })),
      updateApplicants: (body) =>
        track(industryApi<IndustryWorkspaceData>("/api/industry/applicants", { method: "PATCH", json: body })),
      setSavedCandidate: async (candidateId, saved) => {
        const prev = data;
        setData((current) => {
          const currentIds = current.recruiter.savedCandidateIds || [];
          const nextIds = saved
            ? Array.from(new Set([...currentIds, candidateId]))
            : currentIds.filter((id) => id !== candidateId);
          return {
            ...current,
            recruiter: { ...current.recruiter, savedCandidateIds: nextIds },
          };
        });
        try {
          const res = await industryApi<IndustryWorkspaceData>("/api/industry/talent", {
            method: saved ? "POST" : "DELETE",
            json: { candidateId },
          });
          if (res.ok && res.data) {
            setData(res.data);
          } else {
            setData(prev);
          }
          return res;
        } catch (err: any) {
          setData(prev);
          return { ok: false, error: err?.message || "Failed to update saved candidate.", status: 500 };
        }
      },
      sendMessage: (body) =>
        track(industryApi<IndustryWorkspaceData>("/api/industry/messages", { method: "POST", json: body })),
      markRead: (conversationId) =>
        track(industryApi<IndustryWorkspaceData>("/api/industry/messages", { method: "PATCH", json: { conversationId } })),
      saveInterview: (body, isUpdate = false) =>
        track(
          industryApi<IndustryWorkspaceData>("/api/industry/interviews", {
            method: isUpdate ? "PATCH" : "POST",
            json: body,
          }),
        ),
      saveEvent: (body, method = "POST") =>
        track(industryApi<IndustryWorkspaceData>("/api/industry/events", { method, json: body })),
      manageTeam: (body, method) =>
        track(industryApi<IndustryWorkspaceData>("/api/industry/team", { method, json: body })),
      logout: async () => {
        await industryApi("/api/industry/auth/logout", { method: "POST" });
        router.replace("/industry/login?loggedout=1");
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
