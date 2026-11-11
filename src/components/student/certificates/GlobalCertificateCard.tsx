"use client";

import React from "react";
import {
  Award,
  ExternalLink,
  Bookmark,
  Calendar,
  Sparkles,
  Clock,
  Star,
  Users,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Layers,
} from "lucide-react";
import type {
  GlobalCertificate,
  CertificateRecommendation,
  StudentCertificateProgress,
} from "@/lib/student/certificate-types";

interface Props {
  certificate: GlobalCertificate;
  recommendation?: CertificateRecommendation;
  isSaved?: boolean;
  progress?: StudentCertificateProgress;
  isEarned?: boolean;
  onViewDetails: (cert: GlobalCertificate) => void;
  onToggleSave: (certId: string, currentSaved: boolean) => void;
  onAddToPlan: (cert: GlobalCertificate) => void;
  onMarkCompleted?: (cert: GlobalCertificate, credentialUrl: string) => void;
}

export function GlobalCertificateCard({
  certificate,
  recommendation,
  isSaved = false,
  progress,
  isEarned = false,
  onViewDetails,
  onToggleSave,
  onAddToPlan,
  onMarkCompleted,
}: Props) {
  const isRecommended = !!recommendation;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
        isRecommended
          ? "border-orange-500/30 dark:border-sb-cyan/30 bg-gradient-to-b from-orange-500/[0.03] to-white dark:from-sb-cyan/[0.04] dark:to-white/[0.02]"
          : "border-black/[0.08] dark:border-white/10 bg-white dark:bg-white/[0.02]"
      } p-5.5 backdrop-blur-md`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                certificate.pricing === "Free"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : certificate.pricing === "Free Audit"
                  ? "bg-blue-500/10 text-blue-600 dark:text-sb-blue border border-blue-500/20"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
              }`}
            >
              {certificate.pricing}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/[0.04] dark:bg-white/10 text-[#555] dark:text-[#bbb]">
              <Layers size={11} /> {certificate.badgeType}
            </span>

            {isEarned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 size={12} /> Earned & Verified
              </span>
            )}

            {progress && !isEarned && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                <Clock size={12} /> {progress.status}
              </span>
            )}
          </div>

          {/* Bookmark CTA */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(certificate.id, isSaved);
            }}
            className={`btn-bounce-sm grid h-8 w-8 place-items-center rounded-xl transition-all cursor-pointer ${
              isSaved
                ? "bg-orange-500/15 text-[#FF6A00] dark:bg-sb-cyan/15 dark:text-sb-cyan"
                : "text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/10"
            }`}
            title={isSaved ? "Remove from saved" : "Save certificate"}
            aria-label={isSaved ? "Remove from saved" : "Save certificate"}
          >
            <Bookmark size={15} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>

        {/* Issuer and Platform */}
        <div className="flex items-center gap-1.5 text-xs text-[#707070] dark:text-sb-muted font-medium mb-1.5">
          <span className="font-semibold text-[#171717] dark:text-white">{certificate.issuer}</span>
          <span>•</span>
          <span>{certificate.platform}</span>
        </div>

        {/* Certificate Title */}
        <h3
          onClick={() => onViewDetails(certificate)}
          className="font-extrabold text-base sm:text-lg text-[#171717] dark:text-white leading-snug cursor-pointer hover:text-[#FF6A00] dark:hover:text-sb-cyan transition-colors"
        >
          {certificate.title}
        </h3>

        {/* Recommendation Match Badge */}
        {recommendation && (
          <div className="mt-3 rounded-xl bg-orange-500/[0.08] dark:bg-sb-cyan/[0.08] border border-orange-500/20 dark:border-sb-cyan/20 p-2.5 flex items-start gap-2 text-xs">
            <Sparkles size={15} className="text-[#FF6A00] dark:text-sb-cyan shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#FF6A00] dark:text-sb-cyan flex items-center gap-1.5">
                <span>{recommendation.category}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500/20 dark:bg-sb-cyan/20">
                  {recommendation.matchScore}% Match
                </span>
              </div>
              <p className="text-[#555] dark:text-[#bbb] mt-0.5 leading-relaxed text-[11.5px]">
                {recommendation.matchReason}
              </p>
            </div>
          </div>
        )}

        {/* Metadata info: Rating, Duration, Difficulty */}
        <div className="mt-3.5 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-sb-muted font-medium">
          <span className="inline-flex items-center gap-1 text-amber-500">
            <Star size={13} className="fill-current" />
            <strong className="text-[#171717] dark:text-white">{certificate.rating}</strong>
            <span className="text-sb-muted">({certificate.reviewsCount.toLocaleString()})</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {certificate.duration}
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <TrendingUp size={12} /> {certificate.difficulty}
          </span>
        </div>

        {/* Skills Tag Pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {certificate.skillsCovered.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] text-[#555] dark:text-[#ccc] border border-black/[0.04] dark:border-white/5"
            >
              {skill}
            </span>
          ))}
          {certificate.skillsCovered.length > 4 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-sb-muted">
              +{certificate.skillsCovered.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onViewDetails(certificate)}
          className="btn-bounce-sm inline-flex items-center gap-1 text-xs font-bold text-[#FF6A00] hover:text-[#E94E00] dark:text-sb-cyan dark:hover:text-cyan-300 transition-colors cursor-pointer"
        >
          View Details <ArrowRight size={13} />
        </button>

        <div className="flex items-center gap-1.5">
          {!isEarned && (
            <button
              type="button"
              onClick={() => onAddToPlan(certificate)}
              className="btn-bounce-sm inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-white/10 hover:bg-black/[0.08] dark:hover:bg-white/15 text-[#171717] dark:text-white transition-all cursor-pointer"
              title="Add this certificate to your learning plan & schedule daily study tasks"
            >
              <Calendar size={13} /> {progress ? "Update Plan" : "Add to Plan"}
            </button>
          )}

          <a
            href={certificate.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-bounce-sm inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#FF6A00] to-[#E94E00] text-white shadow-xs hover:brightness-105 transition-all cursor-pointer"
          >
            Visit <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
