"use client";

import { useMemo, useState } from "react";
import { Loader2, MessageSquare, Plus, Search, Send } from "lucide-react";
import { useIndustry } from "./IndustryProvider";
import { Avatar, EmptyState, Modal, PageHeader, TextAreaField, formatDate } from "@/components/student/ui";
import SearchInput from "@/components/ui/SearchInput";

export default function MessagesView() {
  const { data, sendMessage, markRead, notify } = useIndustry();
  const { conversations, candidates, jobs } = data;

  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  // New conversation modal
  const [newOpen, setNewOpen] = useState(false);
  const [newCandId, setNewCandId] = useState(candidates[0]?.id ?? "");
  const [newJobId, setNewJobId] = useState(jobs[0]?.id ?? "");
  const [newBody, setNewBody] = useState("");
  const [starting, setStarting] = useState(false);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((c) =>
      [c.candidateName, c.candidateHeadline, c.jobTitle ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [conversations, q]);

  const activeThread = useMemo(
    () => filtered.find((c) => c.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId],
  );

  const handleSelectThread = (id: string, unread: boolean) => {
    setSelectedId(id);
    if (unread) void markRead(id);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread || !draft.trim()) return;
    setSending(true);
    const res = await sendMessage({
      conversationId: activeThread.id,
      body: draft,
    });
    setSending(false);
    if (res.ok) {
      setDraft("");
    } else {
      notify("error", res.error);
    }
  };

  const handleStartNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandId || !newBody.trim()) return;
    setStarting(true);
    const res = await sendMessage({
      candidateId: newCandId,
      jobId: newJobId || undefined,
      body: newBody,
    });
    setStarting(false);
    if (res.ok) {
      setNewBody("");
      setNewOpen(false);
      if (res.data.conversations[0]) setSelectedId(res.data.conversations[0].id);
      notify("success", "Conversation started.");
    } else {
      notify("error", res.error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Candidate Communication & Messages"
        subtitle="Communicate directly with applicants and shortlisted talent regarding roles, interviews, and offers."
        action={
          <button
            type="button"
            onClick={() => {
              setNewCandId(candidates[0]?.id ?? "");
              setNewJobId(jobs[0]?.id ?? "");
              setNewOpen(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus size={15} /> New Message
          </button>
        }
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={22} />}
          title="No candidate conversations yet"
          text="Start a conversation with any applicant from the ATS or reach out to a student in Talent Discovery."
          action={
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <Plus size={15} /> Message a Candidate
            </button>
          }
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Left Column: Thread List */}
          <div className="glass flex flex-col p-4 lg:col-span-4">
            <div className="mb-3">
              <SearchInput
                value={q}
                onChange={setQ}
                placeholder="Search conversations…"
                aria-label="Search conversations"
                portalVariant="industry"
                sizeVariant="sm"
              />
            </div>

            <div className="divide-y divide-white/10 overflow-y-auto">
              {filtered.map((c) => {
                const isActive = activeThread?.id === c.id;
                const last = c.messages[c.messages.length - 1];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectThread(c.id, c.unreadByRecruiter)}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                      isActive ? "bg-sb-blue/20" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <Avatar name={c.candidateName} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{c.candidateName}</span>
                        {c.unreadByRecruiter && (
                          <span className="h-2 w-2 rounded-full bg-sb-pink" aria-label="Unread" />
                        )}
                      </div>
                      {c.jobTitle && (
                        <p className="truncate text-[11px] text-sb-cyan">{c.jobTitle}</p>
                      )}
                      {last && (
                        <p className="mt-0.5 truncate text-xs text-sb-muted">{last.body}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Thread */}
          <div className="glass flex min-h-[460px] flex-col justify-between p-5 lg:col-span-8">
            {activeThread ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={activeThread.candidateName} size={42} />
                    <div>
                      <h2 className="text-base font-bold">{activeThread.candidateName}</h2>
                      <p className="text-xs text-sb-muted">
                        {activeThread.candidateHeadline}
                        {activeThread.jobTitle ? ` · Regarding: ${activeThread.jobTitle}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-4 flex-1 space-y-3 overflow-y-auto pr-1">
                  {activeThread.messages.map((m) => {
                    const isRecruiter = m.senderRole === "recruiter";
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isRecruiter ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[82%] rounded-2xl border px-4 py-3 text-sm ${
                            isRecruiter
                              ? "border-sb-cyan/35 bg-sb-blue/20 text-white"
                              : "border-white/10 bg-white/[0.04] text-sb-text"
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.body}</p>
                        </div>
                        <span className="mt-1 text-[11px] text-sb-muted">
                          {m.senderName} · {formatDate(m.sentAt)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendReply} className="flex items-end gap-2.5 border-t border-white/10 pt-4">
                  <textarea
                    rows={2}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Write a message to ${activeThread.candidateName}…`}
                    aria-label="Message body"
                    className="field flex-1 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="btn btn-primary"
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center text-sm text-sb-muted">
                Select a conversation on the left.
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Message Modal */}
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="Start New Candidate Conversation"
      >
        <form onSubmit={handleStartNew} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium">Select Candidate</label>
            <select
              value={newCandId}
              onChange={(e) => setNewCandId(e.target.value)}
              className="field"
              required
            >
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.college || c.headline}
                </option>
              ))}
            </select>
          </div>

          {jobs.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[13px] font-medium">Related Job Listing (Optional)</label>
              <select
                value={newJobId}
                onChange={(e) => setNewJobId(e.target.value)}
                className="field"
              >
                <option value="">General Outreach</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <TextAreaField
            label="Message"
            rows={4}
            placeholder="Hi! We reviewed your SkillBridge portfolio and would love to connect regarding our upcoming roles…"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setNewOpen(false)}>
              Cancel
            </button>
            <button type="submit" disabled={starting || !newBody.trim()} className="btn btn-primary btn-sm">
              {starting && <Loader2 size={14} className="animate-spin" />}
              Send Message
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
