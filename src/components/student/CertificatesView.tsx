"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles,
  Compass,
  Bookmark,
  TrendingUp,
  Clock,
  Layers,
  Search,
  Filter,
  Check,
  BookOpen,
} from "lucide-react";
import { validatePastDate, validateRequired, validateUrl } from "@/lib/student/validation";
import type { Certification } from "@/lib/student/types";
import { useStudent } from "./StudentProvider";
import { ConfirmModal, EmptyState, Modal, PageHeader, TextField, formatDate } from "./ui";

import { GLOBAL_CERTIFICATES } from "@/lib/student/certificate-catalog";
import type {
  GlobalCertificate,
  CertificateRecommendation,
  StudentCertificateProgress,
} from "@/lib/student/certificate-types";
import { GlobalCertificateCard } from "./certificates/GlobalCertificateCard";
import { CertificateDetailModal } from "./certificates/CertificateDetailModal";
import { CertificateFilterBar } from "./certificates/CertificateFilterBar";

type TabId =
  | "recommended"
  | "explore"
  | "popular"
  | "free"
  | "professional"
  | "my_certs"
  | "in_progress"
  | "saved";

type Form = { title: string; issuer: string; issueDate: string; credentialUrl: string };
const BLANK: Form = { title: "", issuer: "", issueDate: "", credentialUrl: "" };

export default function CertificatesView() {
  const { data, patch, notify } = useStudent();

  // Active Hub Tab
  const [activeTab, setActiveTab] = useState<TabId>("recommended");

  // Dynamic Catalog & Recommendations State
  const [catalog, setCatalog] = useState<GlobalCertificate[]>(GLOBAL_CERTIFICATES);
  const [recommendations, setRecommendations] = useState<CertificateRecommendation[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [inProgress, setInProgress] = useState<StudentCertificateProgress[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("All Domains");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedPricing, setSelectedPricing] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  // Detail Modal State
  const [selectedCert, setSelectedCert] = useState<GlobalCertificate | null>(null);

  // Add/Edit Manual Certificate Form
  const [editing, setEditing] = useState<Certification | "new" | null>(null);
  const [form, setForm] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<Certification | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  // Fetch recommendations and student certificate tracking from server
  useEffect(() => {
    async function loadCertificatesData() {
      try {
        const res = await fetch("/api/student/certificates");
        if (res.ok) {
          const json = await res.json();
          const payload = json.data || json;
          if (payload.catalog) setCatalog(payload.catalog);
          if (payload.recommendations) setRecommendations(payload.recommendations);
          if (payload.savedIds) setSavedIds(payload.savedIds);
          if (payload.inProgress) setInProgress(payload.inProgress);
        }
      } catch (err) {
        console.error("Failed to load certificate recommendations", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadCertificatesData();
  }, []);

  // Save / Unsave Certificate action
  async function handleToggleSave(certId: string, currentSaved: boolean) {
    const action = currentSaved ? "unsave" : "save";
    setSavedIds((prev) =>
      currentSaved ? prev.filter((id) => id !== certId) : [certId, ...prev]
    );

    try {
      const res = await fetch("/api/student/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, catalogId: certId }),
      });
      if (res.ok) {
        notify("success", currentSaved ? "Certificate removed from saved." : "Certificate saved to your list!");
      }
    } catch {
      notify("error", "Failed to update saved status.");
    }
  }

  // Add to learning plan action
  async function handleAddToPlan(cert: GlobalCertificate, targetDate?: string, notes?: string) {
    try {
      const res = await fetch("/api/student/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plan_to_start",
          catalogId: cert.id,
          targetDate,
          notes,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;
        if (payload.inProgress) setInProgress(payload.inProgress);
        notify("success", `Added “${cert.title}” to your Smart Learning Planner!`);
      }
    } catch {
      notify("error", "Could not add certificate to learning plan.");
    }
  }

  // Mark certificate as completed / earned
  async function handleMarkCompleted(cert: GlobalCertificate, credentialUrl: string) {
    try {
      const res = await fetch("/api/student/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark_completed",
          catalogId: cert.id,
          credentialUrl,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;
        if (payload.inProgress) setInProgress(payload.inProgress);
        if (payload.earnedCertificates) {
          await patch({ certifications: payload.earnedCertificates });
        }
        notify("success", `Congratulations! “${cert.title}” added to your verified credentials!`);
      }
    } catch {
      notify("error", "Could not record completed certificate.");
    }
  }

  // Check if a certificate is already earned in student.certifications
  function isCertEarned(cert: GlobalCertificate) {
    return (data.certifications || []).some(
      (c) =>
        c.title.toLowerCase().includes(cert.title.toLowerCase()) ||
        cert.title.toLowerCase().includes(c.title.toLowerCase())
    );
  }

  // Manual Add/Edit Handlers
  function open(c: Certification | "new") {
    setErrors({});
    setForm(
      c === "new"
        ? BLANK
        : {
            title: c.title,
            issuer: c.issuer,
            issueDate: c.issueDate,
            credentialUrl: c.credentialUrl ?? "",
          }
    );
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
    const next =
      editing === "new"
        ? [item, ...data.certifications]
        : data.certifications.map((c) => (c.id === item.id ? item : c));

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

  // Filtering Logic
  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedDomain !== "All Domains" ||
    selectedPlatform !== "All Platforms" ||
    selectedPricing !== "All" ||
    selectedDifficulty !== "All";

  function resetFilters() {
    setSearchQuery("");
    setSelectedDomain("All Domains");
    setSelectedPlatform("All Platforms");
    setSelectedPricing("All");
    setSelectedDifficulty("All");
  }

  function matchesFilters(cert: GlobalCertificate) {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        cert.title.toLowerCase().includes(q) ||
        cert.issuer.toLowerCase().includes(q) ||
        cert.domain.toLowerCase().includes(q) ||
        cert.skillsCovered.some((s) => s.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedDomain !== "All Domains" && cert.domain !== selectedDomain) {
      return false;
    }
    if (selectedPlatform !== "All Platforms" && cert.platform !== selectedPlatform) {
      return false;
    }
    if (selectedPricing !== "All" && cert.pricing !== selectedPricing) {
      return false;
    }
    if (selectedDifficulty !== "All" && cert.difficulty !== selectedDifficulty) {
      return false;
    }
    return true;
  }

  // Filtered views
  const filteredCatalog = catalog.filter(matchesFilters);

  const popularCerts = catalog.filter((c) => c.isPopular).filter(matchesFilters);
  const freeCerts = catalog.filter((c) => c.pricing === "Free" || c.pricing === "Free Audit").filter(matchesFilters);
  const professionalCerts = catalog.filter((c) => c.badgeType === "Vendor Certification" || c.badgeType === "Professional Certificate").filter(matchesFilters);
  const savedCerts = catalog.filter((c) => savedIds.includes(c.id)).filter(matchesFilters);
  const inProgressCerts = catalog.filter((c) => inProgress.some((p) => p.catalogId === c.id)).filter(matchesFilters);

  return (
    <div className="space-y-7 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Global Certificates & Smart Career Recommendations"
          subtitle="Discover high-impact industry credentials, personalized by your active coursework, skills, and target engineering roles."
        />
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => open("new")}
            className="btn-bounce-sm inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white shadow-md shadow-orange-500/20 hover:brightness-105 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} /> Add Custom Certificate
          </button>
        </div>
      </div>

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => setActiveTab("my_certs")}
          className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-4 backdrop-blur-xl flex items-center gap-3 cursor-pointer hover:border-orange-500/30 transition-all"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-[#FF6A00] dark:bg-sb-cyan/10 dark:text-sb-cyan shrink-0">
            <Award size={20} />
          </span>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-num tabular-nums text-[#171717] dark:text-white">
              {data.certifications.length}
            </div>
            <div className="text-xs font-medium text-sb-muted">Earned Credentials</div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("in_progress")}
          className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-4 backdrop-blur-xl flex items-center gap-3 cursor-pointer hover:border-amber-500/30 transition-all"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <Clock size={20} />
          </span>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-num tabular-nums text-[#171717] dark:text-white">
              {inProgress.length}
            </div>
            <div className="text-xs font-medium text-sb-muted">In Progress / Planned</div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("saved")}
          className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-4 backdrop-blur-xl flex items-center gap-3 cursor-pointer hover:border-blue-500/30 transition-all"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-sb-blue shrink-0">
            <Bookmark size={20} />
          </span>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-num tabular-nums text-[#171717] dark:text-white">
              {savedIds.length}
            </div>
            <div className="text-xs font-medium text-sb-muted">Saved for Later</div>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("recommended")}
          className="rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-4 backdrop-blur-xl flex items-center gap-3 cursor-pointer hover:border-emerald-500/30 transition-all"
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles size={20} />
          </span>
          <div>
            <div className="text-xl sm:text-2xl font-bold font-num tabular-nums text-[#171717] dark:text-white">
              {recommendations.length}
            </div>
            <div className="text-xs font-medium text-sb-muted">AI Matches</div>
          </div>
        </div>
      </div>

      {/* Modern Multi-Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-black/[0.06] dark:border-white/10 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("recommended")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "recommended"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          <Sparkles size={14} /> Recommended for You
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {recommendations.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("explore")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "explore"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          <Compass size={14} /> Explore Global Catalog ({catalog.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("popular")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "popular"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          <TrendingUp size={14} /> Popular Certifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("free")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "free"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          Free & Auditable
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("professional")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "professional"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          Vendor & Industry
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my_certs")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "my_certs"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          <Award size={14} /> My Certificates ({data.certifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("in_progress")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "in_progress"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          <Clock size={14} /> In Progress ({inProgress.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("saved")}
          className={`btn-bounce-sm px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "saved"
              ? "bg-[#FF6A00] text-white shadow-sm"
              : "text-[#666] dark:text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/5"
          }`}
        >
          <Bookmark size={14} /> Saved ({savedIds.length})
        </button>
      </div>

      {/* Filter & Search Bar (displayed for catalog exploration tabs) */}
      {activeTab !== "my_certs" && (
        <CertificateFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedDomain={selectedDomain}
          onDomainChange={setSelectedDomain}
          selectedPlatform={selectedPlatform}
          onPlatformChange={setSelectedPlatform}
          selectedPricing={selectedPricing}
          onPricingChange={setSelectedPricing}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {/* TAB 1: RECOMMENDED FOR YOU */}
      {activeTab === "recommended" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-[#FF6A00] dark:text-sb-cyan" />
              Certifications Matched with Your Profile & Gain Skills Progress
            </h2>
            <span className="text-xs text-sb-muted">
              {recommendations.filter((r) => matchesFilters(r.certificate)).length} personalized options
            </span>
          </div>

          {recommendations.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={32} />}
              title="No recommendations generated yet"
              text="Enroll in courses on Gain Skills or update your target roles to receive personalized certification recommendations."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {recommendations
                .filter((r) => matchesFilters(r.certificate))
                .map((rec) => (
                  <GlobalCertificateCard
                    key={rec.certificate.id}
                    certificate={rec.certificate}
                    recommendation={rec}
                    isSaved={savedIds.includes(rec.certificate.id)}
                    progress={inProgress.find((p) => p.catalogId === rec.certificate.id)}
                    isEarned={isCertEarned(rec.certificate)}
                    onViewDetails={setSelectedCert}
                    onToggleSave={handleToggleSave}
                    onAddToPlan={(cert) => setSelectedCert(cert)}
                    onMarkCompleted={handleMarkCompleted}
                  />
                ))}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: EXPLORE GLOBAL CATALOG */}
      {activeTab === "explore" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <Compass size={18} className="text-[#FF6A00] dark:text-sb-cyan" />
              Global Certificate Discovery Catalog
            </h2>
            <span className="text-xs text-sb-muted">
              Showing {filteredCatalog.length} of {catalog.length} certifications
            </span>
          </div>

          {filteredCatalog.length === 0 ? (
            <EmptyState
              icon={<Search size={32} />}
              title="No matching certifications found"
              text="Try adjusting your search query, domain filters, or platform selectors."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6A00] text-white"
                >
                  Clear All Filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {filteredCatalog.map((cert) => {
                const rec = recommendations.find((r) => r.certificate.id === cert.id);
                return (
                  <GlobalCertificateCard
                    key={cert.id}
                    certificate={cert}
                    recommendation={rec}
                    isSaved={savedIds.includes(cert.id)}
                    progress={inProgress.find((p) => p.catalogId === cert.id)}
                    isEarned={isCertEarned(cert)}
                    onViewDetails={setSelectedCert}
                    onToggleSave={handleToggleSave}
                    onAddToPlan={(c) => setSelectedCert(c)}
                    onMarkCompleted={handleMarkCompleted}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 3: POPULAR CERTIFICATIONS */}
      {activeTab === "popular" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-amber-500" />
              Most Popular Global Certifications
            </h2>
            <span className="text-xs text-sb-muted">{popularCerts.length} certificates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {popularCerts.map((cert) => {
              const rec = recommendations.find((r) => r.certificate.id === cert.id);
              return (
                <GlobalCertificateCard
                  key={cert.id}
                  certificate={cert}
                  recommendation={rec}
                  isSaved={savedIds.includes(cert.id)}
                  progress={inProgress.find((p) => p.catalogId === cert.id)}
                  isEarned={isCertEarned(cert)}
                  onViewDetails={setSelectedCert}
                  onToggleSave={handleToggleSave}
                  onAddToPlan={(c) => setSelectedCert(c)}
                  onMarkCompleted={handleMarkCompleted}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 4: FREE & AUDITABLE */}
      {activeTab === "free" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              Free & Auditable Certifications
            </h2>
            <span className="text-xs text-sb-muted">{freeCerts.length} certificates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {freeCerts.map((cert) => {
              const rec = recommendations.find((r) => r.certificate.id === cert.id);
              return (
                <GlobalCertificateCard
                  key={cert.id}
                  certificate={cert}
                  recommendation={rec}
                  isSaved={savedIds.includes(cert.id)}
                  progress={inProgress.find((p) => p.catalogId === cert.id)}
                  isEarned={isCertEarned(cert)}
                  onViewDetails={setSelectedCert}
                  onToggleSave={handleToggleSave}
                  onAddToPlan={(c) => setSelectedCert(c)}
                  onMarkCompleted={handleMarkCompleted}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 5: VENDOR & INDUSTRY */}
      {activeTab === "professional" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <Layers size={18} className="text-blue-500" />
              Official Vendor & Professional Accreditations
            </h2>
            <span className="text-xs text-sb-muted">{professionalCerts.length} certificates</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
            {professionalCerts.map((cert) => {
              const rec = recommendations.find((r) => r.certificate.id === cert.id);
              return (
                <GlobalCertificateCard
                  key={cert.id}
                  certificate={cert}
                  recommendation={rec}
                  isSaved={savedIds.includes(cert.id)}
                  progress={inProgress.find((p) => p.catalogId === cert.id)}
                  isEarned={isCertEarned(cert)}
                  onViewDetails={setSelectedCert}
                  onToggleSave={handleToggleSave}
                  onAddToPlan={(c) => setSelectedCert(c)}
                  onMarkCompleted={handleMarkCompleted}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 6: MY CERTIFICATES (EARNED) */}
      {activeTab === "my_certs" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <Award size={18} className="text-[#FF6A00] dark:text-sb-cyan" />
              Active Verified Credentials & Diplomas ({data.certifications.length})
            </h2>
          </div>

          {data.certifications.length === 0 ? (
            <EmptyState
              icon={<Award size={32} />}
              title="No certificates added yet"
              text="Add your completed degrees, vendor licenses (AWS, Google, Microsoft), and accredited coursework to showcase to recruiters."
              action={
                <button
                  type="button"
                  className="btn-bounce-sm px-4 py-2 rounded-xl text-sm font-bold bg-[#FF6A00] text-white shadow-sm"
                  onClick={() => open("new")}
                >
                  Add Your First Certificate
                </button>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {data.certifications.map((c) => (
                <li
                  key={c.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.03] p-5 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-orange-500/15 to-amber-500/15 text-[#FF6A00] dark:from-sb-cyan/15 dark:to-sb-blue/15 dark:text-sb-cyan shrink-0">
                        <Award size={22} />
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#171717] dark:text-white leading-snug">
                      {c.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-[#686868] dark:text-sb-muted font-medium">
                      <Building2 size={13} className="shrink-0" />
                      <span>{c.issuer}</span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-sb-muted">
                      <Calendar size={13} className="shrink-0" />
                      <span>Issued {formatDate(c.issueDate)}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-2">
                    {c.credentialUrl ? (
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-bounce-sm inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan hover:underline"
                      >
                        <ExternalLink size={13} /> View Credential
                      </a>
                    ) : (
                      <span className="text-xs text-sb-muted italic">No external URL</span>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => open(c)}
                        className="btn-bounce-sm grid h-8 w-8 place-items-center rounded-lg text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10 transition-colors cursor-pointer"
                        aria-label={`Edit ${c.title}`}
                        title="Edit Certificate"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToDelete(c)}
                        className="btn-bounce-sm grid h-8 w-8 place-items-center rounded-lg text-sb-muted hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        aria-label={`Delete ${c.title}`}
                        title="Delete Certificate"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* TAB 7: IN PROGRESS / PLANNED */}
      {activeTab === "in_progress" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-amber-500" />
              Certifications Currently Being Pursued ({inProgressCerts.length})
            </h2>
          </div>

          {inProgressCerts.length === 0 ? (
            <EmptyState
              icon={<Clock size={32} />}
              title="No certifications in progress"
              text="Explore the global catalog or recommended certificates and click 'Add to Plan' to start scheduling study tasks."
              action={
                <button
                  type="button"
                  onClick={() => setActiveTab("recommended")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6A00] text-white"
                >
                  Browse Recommendations
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {inProgressCerts.map((cert) => {
                const progressItem = inProgress.find((p) => p.catalogId === cert.id);
                return (
                  <GlobalCertificateCard
                    key={cert.id}
                    certificate={cert}
                    isSaved={savedIds.includes(cert.id)}
                    progress={progressItem}
                    isEarned={isCertEarned(cert)}
                    onViewDetails={setSelectedCert}
                    onToggleSave={handleToggleSave}
                    onAddToPlan={(c) => setSelectedCert(c)}
                    onMarkCompleted={handleMarkCompleted}
                  />
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 8: SAVED CERTIFICATES */}
      {activeTab === "saved" && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#171717] dark:text-white flex items-center gap-2">
              <Bookmark size={18} className="text-blue-500" />
              Bookmarked Certifications ({savedCerts.length})
            </h2>
          </div>

          {savedCerts.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={32} />}
              title="No saved certificates"
              text="Click the bookmark icon on any certificate card to save it for quick reference later."
              action={
                <button
                  type="button"
                  onClick={() => setActiveTab("explore")}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6A00] text-white"
                >
                  Explore Catalog
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
              {savedCerts.map((cert) => (
                <GlobalCertificateCard
                  key={cert.id}
                  certificate={cert}
                  isSaved={true}
                  progress={inProgress.find((p) => p.catalogId === cert.id)}
                  isEarned={isCertEarned(cert)}
                  onViewDetails={setSelectedCert}
                  onToggleSave={handleToggleSave}
                  onAddToPlan={(c) => setSelectedCert(c)}
                  onMarkCompleted={handleMarkCompleted}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Detailed Modal View */}
      {selectedCert && (
        <CertificateDetailModal
          certificate={selectedCert}
          recommendation={recommendations.find((r) => r.certificate.id === selectedCert.id)}
          isSaved={savedIds.includes(selectedCert.id)}
          progress={inProgress.find((p) => p.catalogId === selectedCert.id)}
          isEarned={isCertEarned(selectedCert)}
          onClose={() => setSelectedCert(null)}
          onToggleSave={handleToggleSave}
          onAddToPlan={async (cert, targetDate, notes) => {
            await handleAddToPlan(cert, targetDate, notes);
          }}
          onMarkCompleted={async (cert, credentialUrl) => {
            await handleMarkCompleted(cert, credentialUrl);
            setSelectedCert(null);
          }}
        />
      )}

      {/* Manual Add/Edit Modal */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add Custom Certificate" : "Edit Certificate"}
        footer={
          <>
            <button
              type="button"
              className="btn-bounce-sm px-4 py-2 rounded-xl text-xs font-semibold text-sb-muted hover:text-[#171717] dark:hover:text-white cursor-pointer"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="cert-form"
              disabled={busy}
              className="btn-bounce-sm inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6A00] text-white shadow-sm hover:brightness-105 disabled:opacity-50 cursor-pointer"
            >
              {busy && <Loader2 size={14} className="animate-spin" />} Save Certificate
            </button>
          </>
        }
      >
        <form id="cert-form" onSubmit={saveCert} noValidate className="space-y-4">
          <TextField
            label="Certification title"
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. AWS Certified Solutions Architect, Meta Frontend Developer"
          />
          <TextField
            label="Issuing organization"
            value={form.issuer}
            error={errors.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            placeholder="e.g. Amazon Web Services, Coursera, freeCodeCamp"
          />
          <TextField
            label="Issue date"
            type="date"
            max={today}
            value={form.issueDate}
            error={errors.issueDate}
            onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
          />
          <TextField
            label="Credential URL"
            optional
            type="url"
            value={form.credentialUrl}
            error={errors.credentialUrl}
            onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
            placeholder="https://www.credly.com/badges/..."
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={!!toDelete}
        title="Delete certificate?"
        text={`“${toDelete?.title ?? ""}” will be permanently removed from your profile and recruiter credentials.`}
        confirmLabel="Delete"
        busy={busy}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          setBusy(true);
          const r = await patch({
            certifications: data.certifications.filter((c) => c.id !== toDelete!.id),
          });
          setBusy(false);
          setToDelete(null);
          notify(
            r.ok ? "success" : "error",
            r.ok ? "Certification deleted." : (r.error ?? "Could not delete.")
          );
        }}
      />
    </div>
  );
}
