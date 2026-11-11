"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, CalendarClock, MapPin } from "lucide-react";
import { useStudent } from "./StudentProvider";
import { ActionButtons, OpportunityModal, SampleBadge, deadlineText } from "./OpportunityParts";
import { EmptyState, ErrorNote, PageHeader, Spinner } from "./ui";

export default function SavedView() {
  const { data, opps, oppsError, loadOpps } = useStudent();
  const [viewId, setViewId] = useState<string | null>(null);
  const saved = (opps ?? []).filter((o) => data.saved.includes(o.id));

  return (
    <div>
      <PageHeader title="Saved Opportunities" subtitle="Listings you've bookmarked to come back to." />
      {oppsError ? (
        <ErrorNote retry={loadOpps}>{oppsError}</ErrorNote>
      ) : data.saved.length === 0 ? (
        <EmptyState icon={<Bookmark size={24} />} title="Nothing saved yet" text="Save opportunities as you browse and they'll be waiting here." action={<Link href="/student/opportunities" className="btn btn-primary">Explore Opportunities</Link>} />
      ) : !opps ? (
        <Spinner label="Loading saved opportunities" />
      ) : (
        <ul className="dash-entrance dash-delay-1 space-y-3">
          {saved.map((o) => (
            <li key={o.id} className="glass glass-hover flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
              <div className="min-w-0 flex-1 basis-64">
                <div className="flex items-center gap-2">
                  <h2 className="truncate font-bold">{o.title}</h2>
                  <SampleBadge sample={o.sample} />
                </div>
                <p className="text-sm text-sb-muted">{o.org} · {o.type}</p>
                <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-sb-muted">
                  <span className="inline-flex items-center gap-1.5"><MapPin size={13} />{o.mode} · {o.location}</span>
                  <span className="inline-flex items-center gap-1.5"><CalendarClock size={13} />{deadlineText(o.deadline)}</span>
                </p>
              </div>
              <ActionButtons o={o} onView={() => setViewId(o.id)} />
            </li>
          ))}
        </ul>
      )}
      <OpportunityModal o={opps?.find((o) => o.id === viewId) ?? null} onClose={() => setViewId(null)} />
    </div>
  );
}
