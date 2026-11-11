"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import type { Application, AppStatus } from "@/lib/student/types";
import { useStudent } from "./StudentProvider";
import { OpportunityModal, SampleBadge } from "./OpportunityParts";
import { ConfirmModal, EmptyState, ErrorNote, Modal, PageHeader, Spinner, formatDate } from "./ui";
import { DataTable, type ColumnDef } from "@/components/ui/table/DataTable";

const STATUS_STYLE: Record<AppStatus, string> = {
  Applied: "chip",
  "Under Review": "chip chip-muted",
  Shortlisted: "chip chip-pink",
  Interview: "chip !border-sb-cyan/60 !bg-sb-blue/25 !text-white",
  Offer: "chip !border-emerald-400/40 !bg-emerald-400/10 !text-emerald-300",
  Hired: "chip !border-emerald-400/60 !bg-emerald-500/20 !text-emerald-200",
  Rejected: "chip chip-muted !text-sb-muted",
};

export default function ApplicationsView() {
  const { data, opps, oppsError, loadOpps, withdraw, notify } = useStudent();
  const [detail, setDetail] = useState<Application | null>(null);
  const [viewOpp, setViewOpp] = useState<string | null>(null);
  const [toWithdraw, setToWithdraw] = useState<Application | null>(null);
  const [busy, setBusy] = useState(false);

  const oppOf = (a: Application) => opps?.find((o) => o.id === a.opportunityId);
  const detailOpp = detail ? oppOf(detail) : undefined;

  const enrichedApps = useMemo(() => {
    return data.applications.map((a) => {
      const o = oppOf(a);
      return {
        ...a,
        title: o?.title ?? "Listing unavailable",
        org: o?.org ?? "Company",
        type: o?.type ?? "Internship",
      };
    });
  }, [data.applications, opps]);

  const columns: ColumnDef<any>[] = [
    {
      id: "opportunity",
      header: "Opportunity & Company",
      sortable: true,
      accessorKey: "title",
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{a.title}</div>
          <div className="text-xs text-sb-muted">{a.org}</div>
        </div>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      sortable: true,
      width: "140px",
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      sortable: true,
      width: "160px",
      render: (a) => <span className={STATUS_STYLE[a.status as AppStatus]}>{a.status}</span>,
    },
    {
      id: "appliedAt",
      header: "Applied Date",
      accessorKey: "appliedAt",
      sortable: true,
      width: "150px",
      render: (a) => <span className="text-xs text-sb-muted">{formatDate(a.appliedAt)}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      width: "180px",
      render: (a) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm !py-1 !px-2.5 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              setDetail(a);
            }}
          >
            Details
          </button>
          {a.status === "Applied" && (
            <button
              type="button"
              className="btn btn-danger btn-sm !py-1 !px-2.5 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setToWithdraw(a);
              }}
            >
              Withdraw
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Applications" subtitle="Everything you've applied to, and where it stands." />

      {oppsError && <div className="mb-4"><ErrorNote retry={loadOpps}>{oppsError}</ErrorNote></div>}

      {data.interviews && data.interviews.length > 0 && (
        <section className="glass glass-hover mb-6 p-5 dash-entrance dash-delay-1" aria-labelledby="stu-interviews-h">
          <h2 id="stu-interviews-h" className="text-sm font-bold text-sb-cyan">Scheduled Interviews</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            {data.interviews.map((iv) => (
              <li key={iv.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 light:border-black/10 bg-white/[0.02] light:bg-black/[0.02] px-4 py-3">
                <div>
                  <p className="font-semibold text-sb-text">{iv.jobTitle} · <span className="text-sb-muted">{iv.companyName}</span></p>
                  <p className="text-xs text-sb-muted">
                    {iv.round} ({iv.type}) · {formatDate(iv.scheduledAt)} ({iv.durationMinutes} min, {iv.timezone})
                  </p>
                </div>
                <span className="chip">{iv.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.applications.length === 0 ? (
        <EmptyState icon={<Send size={24} />} title="No applications yet" text="When you apply to an opportunity, it will appear here with its status." action={<Link href="/student/opportunities" className="btn btn-primary">Explore Opportunities</Link>} />
      ) : !opps && !oppsError ? (
        <Spinner label="Loading applications" />
      ) : (
        <div className="dash-entrance dash-delay-2">
          <DataTable
            data={enrichedApps}
            columns={columns}
            searchKey="title"
            searchPlaceholder="Search applied roles..."
            pageSize={8}
            onRowClick={(row) => setDetail(row)}
          />
        </div>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title="Application details" footer={detailOpp && <button type="button" className="btn btn-glass btn-sm" onClick={() => { setViewOpp(detailOpp.id); setDetail(null); }}>View listing</button>}>
        {detail && (
          <dl className="space-y-4 text-sm">
            <div><dt className="text-xs text-sb-muted">Opportunity</dt><dd className="mt-0.5 font-semibold">{detailOpp?.title ?? "Listing unavailable"}</dd><dd className="text-sb-muted">{detailOpp?.org}</dd></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs text-sb-muted">Applied on</dt><dd className="mt-0.5">{formatDate(detail.appliedAt)}</dd></div>
              <div><dt className="text-xs text-sb-muted">Status</dt><dd className="mt-1"><span className={STATUS_STYLE[detail.status]}>{detail.status}</span></dd></div>
            </div>
            <p className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-sb-muted">
              Status changes (Under Review, Shortlisted, Accepted, Rejected) are made by the hiring organisation. Sample listings never change status.
            </p>
          </dl>
        )}
      </Modal>

      <OpportunityModal o={opps?.find((o) => o.id === viewOpp) ?? null} onClose={() => setViewOpp(null)} />

      <ConfirmModal
        open={!!toWithdraw}
        title="Withdraw application?"
        text={`Your application to “${toWithdraw ? (oppOf(toWithdraw)?.title ?? "this listing") : ""}” will be removed. You can apply again later if it's still open.`}
        confirmLabel="Withdraw"
        busy={busy}
        onClose={() => setToWithdraw(null)}
        onConfirm={async () => {
          setBusy(true);
          const r = await withdraw(toWithdraw!.id);
          setBusy(false);
          setToWithdraw(null);
          notify(r.ok ? "success" : "error", r.ok ? "Application withdrawn." : (r.error ?? "Could not withdraw."));
        }}
      />
    </div>
  );
}
