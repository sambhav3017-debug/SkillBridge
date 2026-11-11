"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Code,
  Microscope,
  Briefcase,
  GraduationCap,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import ScrollSection from "./ScrollSection";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface CapabilityItem {
  id: string;
  category: string;
  title: string;
  description: string;
  icon: typeof Code;
  accentHex: string;
  softTintHex: string;
  pillBorder: string;
  activePillBg: string;
  activeText: string;
  badgeBg: string;
  badgeText: string;
  highlights: string[];
  portalHref: string;
  portalText: string;
  ctaClass: string;
}

export const CAPABILITIES: CapabilityItem[] = [
  {
    id: "collab",
    category: "STUDENT COLLABORATION",
    title: "Project Collaboration",
    description:
      "Cross-departmental squads assemble to tackle real problems. Computer science, design, and business students team up to ship end-to-end products.",
    icon: Code,
    accentHex: "#007BA7",
    softTintHex: "rgba(0, 123, 167, 0.08)",
    pillBorder: "border-[#007BA7]/35 dark:border-[#19B8E6]/40",
    activePillBg: "rgba(0, 123, 167, 0.08)",
    activeText: "text-[#007BA7] dark:text-[#19B8E6]",
    badgeBg: "bg-cyan-500/10 border-cyan-500/25",
    badgeText: "text-[#007BA7] dark:text-[#19B8E6]",
    highlights: [
      "Integrated Git repository tracking",
      "Automated milestone reviews",
      "Interdisciplinary squad formation",
    ],
    portalHref: "/student/projects",
    portalText: "View Student Projects",
    ctaClass: "btn btn-primary px-5 py-2.5 text-sm font-medium",
  },
  {
    id: "research",
    category: "FACULTY & INSTITUTIONS",
    title: "Research Connections",
    description:
      "University research scholars publish open laboratory projects, recruit talented student investigators, and bridge academic inquiry with grant funding.",
    icon: Microscope,
    accentHex: "#743BFF",
    softTintHex: "rgba(116, 59, 255, 0.08)",
    pillBorder: "border-[#743BFF]/35 dark:border-[#B57CFF]/40",
    activePillBg: "rgba(116, 59, 255, 0.08)",
    activeText: "text-[#743BFF] dark:text-[#B57CFF]",
    badgeBg: "bg-purple-500/10 border-purple-500/25",
    badgeText: "text-[#743BFF] dark:text-[#B57CFF]",
    highlights: [
      "Faculty lab opportunity boards",
      "Peer-reviewed project deliverables",
      "Grant & sponsored fellowship matching",
    ],
    portalHref: "/academia/research",
    portalText: "Explore Research Labs",
    ctaClass: "btn btn-primary px-5 py-2.5 text-sm font-medium",
  },
  {
    id: "industry",
    category: "ENTERPRISE & TECH HUBS",
    title: "Industry Engagement",
    description:
      "Tech companies submit engineering challenges directly to student cohorts, sponsor capstones, and offer architecture feedback through staff engineers.",
    icon: Briefcase,
    accentHex: "#FF2D95",
    softTintHex: "rgba(255, 45, 149, 0.08)",
    pillBorder: "border-[#FF2D95]/35 dark:border-[#FF2D95]/40",
    activePillBg: "rgba(255, 45, 149, 0.08)",
    activeText: "text-[#FF2D95] dark:text-[#FF2D95]",
    badgeBg: "bg-pink-500/10 border-pink-500/25",
    badgeText: "text-[#FF2D95] dark:text-[#FF2D95]",
    highlights: [
      "Sponsored capstone challenges",
      "Senior engineer architecture office hours",
      "Real-world API and tool sandbox access",
    ],
    portalHref: "/industry",
    portalText: "Engage as Enterprise",
    ctaClass: "btn btn-primary px-5 py-2.5 text-sm font-medium",
  },
  {
    id: "careers",
    category: "DIRECT RECRUITMENT",
    title: "Career Opportunities",
    description:
      "Talent discovery driven by demonstrated skill profiles. Recruiters search candidates by specific verified capabilities rather than static resumes.",
    icon: GraduationCap,
    accentHex: "#0284C7",
    softTintHex: "#EEF7FC",
    pillBorder: "border-[#0284C7]/35",
    activePillBg: "rgba(2, 132, 199, 0.08)",
    activeText: "text-[#0284C7]",
    badgeBg: "bg-[#0284C7]/10 border-[#0284C7]/25",
    badgeText: "text-[#0284C7]",
    highlights: [
      "Capability-verified applicant filters",
      "Direct interview invitation fast-track",
      "Full transparency on candidate code history",
    ],
    portalHref: "/student/opportunities",
    portalText: "Browse Opportunities",
    ctaClass: "btn btn-primary px-5 py-2.5 text-sm font-medium",
  },
  {
    id: "accreditation",
    category: "UNIVERSITY GOVERNANCE",
    title: "Academic Partnerships",
    description:
      "Universities leverage comprehensive placement analytics, student progression metrics, and industry feedback loops for NIRF and ABET compliance.",
    icon: Building2,
    accentHex: "#5A32A3",
    softTintHex: "#F4F0FA",
    pillBorder: "border-[#5A32A3]/35",
    activePillBg: "rgba(90, 50, 163, 0.08)",
    activeText: "text-[#5A32A3]",
    badgeBg: "bg-[#5A32A3]/10 border-[#5A32A3]/25",
    badgeText: "text-[#5A32A3]",
    highlights: [
      "Institutional outcome tracking",
      "Placement drive management suite",
      "Accreditation-ready reporting exports",
    ],
    portalHref: "/academia",
    portalText: "University Solutions",
    ctaClass: "btn btn-primary px-5 py-2.5 text-sm font-medium",
  },
];

interface PartnerOrg {
  id: string;
  name: string;
  fullName?: string;
  category: string;
  domainId: string;
  role: string;
  logoSrc: string;
  width: number;
  height: number;
  tone: "blue" | "pink" | "purple";
  alt: string;
  needsLightPlate?: boolean;
  highlightTag?: string;
}

const PARTNER_ORGS: PartnerOrg[] = [
  // 1. Universities & Academia (MIT ADT University)
  {
    id: "mit-adt",
    name: "MIT ADT University",
    fullName: "MIT Art, Design and Technology University",
    category: "Universities & Academia",
    domainId: "academia",
    role: "Flagship Higher Education & Research Partner",
    logoSrc: "/logos/mit-adt-crest.png",
    width: 64,
    height: 64,
    tone: "purple",
    alt: "MIT ADT University official emblem and typography",
    needsLightPlate: false,
    highlightTag: "Accredited University Partner",
  },
  // 2. Technology & Software
  {
    id: "google",
    name: "Google",
    fullName: "Google LLC",
    category: "Technology & Software",
    domainId: "tech",
    role: "Cloud & Developer Platforms",
    logoSrc: "/logos/google.svg",
    width: 125,
    height: 42,
    tone: "blue",
    alt: "Google official full-color logo",
    highlightTag: "Core Developer Stack",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    fullName: "Microsoft Corporation",
    category: "Technology & Software",
    domainId: "tech",
    role: "Enterprise Software & Cloud Ecosystem",
    logoSrc: "/logos/microsoft.svg",
    width: 135,
    height: 36,
    tone: "blue",
    alt: "Microsoft official 4-color symbol and wordmark",
    highlightTag: "Enterprise Platforms",
  },
  // 3. Artificial Intelligence & Data
  {
    id: "openai",
    name: "OpenAI",
    fullName: "OpenAI Inc.",
    category: "Artificial Intelligence & Data",
    domainId: "ai",
    role: "Frontier Foundation Models & Research",
    logoSrc: "/logos/openai.svg",
    width: 40,
    height: 40,
    tone: "pink",
    alt: "OpenAI official symbol and wordmark",
    highlightTag: "Frontier AI & RAG",
  },
  // 4. Cloud & Platforms
  {
    id: "aws",
    name: "Amazon Web Services (AWS)",
    fullName: "Amazon Web Services Inc.",
    category: "Cloud & Platforms",
    domainId: "cloud",
    role: "Hyperscale Cloud & Ephemeral Sandboxes",
    logoSrc: "/logos/aws.svg",
    width: 66,
    height: 40,
    tone: "blue",
    alt: "Amazon Web Services (AWS) official logo",
    highlightTag: "Cloud Infrastructure",
  },
  // 5. Global Enterprises
  {
    id: "tata",
    name: "TATA",
    fullName: "Tata Sons & Tata Consultancy Services",
    category: "Global Enterprises",
    domainId: "enterprise",
    role: "Global Engineering & Industrial Systems",
    logoSrc: "/logos/tata.svg",
    width: 100,
    height: 40,
    tone: "blue",
    alt: "Tata official blue logo and emblem",
    highlightTag: "Industrial Conglomerate",
  },
  {
    id: "infosys",
    name: "Infosys",
    fullName: "Infosys Limited",
    category: "Global Enterprises",
    domainId: "enterprise",
    role: "Digital Transformation & Strategic Consulting",
    logoSrc: "/logos/infosys.svg",
    width: 125,
    height: 52,
    tone: "blue",
    alt: "Infosys official cobalt blue wordmark",
    highlightTag: "Global IT Services",
  },
  {
    id: "accenture",
    name: "Accenture",
    fullName: "Accenture plc",
    category: "Global Enterprises",
    domainId: "enterprise",
    role: "Enterprise Tech Strategy & Operations",
    logoSrc: "/logos/accenture.svg",
    width: 130,
    height: 36,
    tone: "pink",
    alt: "Accenture official wordmark and purple chevron",
    highlightTag: "Global Consulting",
  },
];

interface DomainSection {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof GraduationCap;
  accent: "purple" | "blue" | "pink";
  badge: string;
}

const DOMAIN_SECTIONS: DomainSection[] = [
  {
    id: "academia",
    title: "Universities & Academia",
    subtitle: "Accredited higher education, research laboratories & faculty mentorship",
    icon: GraduationCap,
    accent: "purple",
    badge: "Academic Partner",
  },
  {
    id: "tech",
    title: "Technology & Software",
    subtitle: "Industry-standard developer stacks, runtime platforms & software tooling",
    icon: Code,
    accent: "blue",
    badge: "Software Engineering",
  },
  {
    id: "ai",
    title: "Artificial Intelligence & Data",
    subtitle: "Frontier machine intelligence, foundation models & semantic reasoning",
    icon: Sparkles,
    accent: "pink",
    badge: "AI & Models",
  },
  {
    id: "cloud",
    title: "Cloud & Platforms",
    subtitle: "Hyperscale distributed infrastructure & cloud container networks",
    icon: Building2,
    accent: "blue",
    badge: "Cloud Networks",
  },
  {
    id: "enterprise",
    title: "Global Enterprises",
    subtitle: "Multinational engineering conglomerates & enterprise talent pipelines",
    icon: Briefcase,
    accent: "blue",
    badge: "Enterprise Networks",
  },
];

const PartnerCard = memo(function PartnerCard({ org }: { org: PartnerOrg }) {
  const [tilt, setTilt] = useState<{ x: number; y: number; px: number; py: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 9;
      const rotateY = (x - 0.5) * 9;
      setTilt({
        x: rotateX,
        y: rotateY,
        px: Math.round(x * 100),
        py: Math.round(y * 100),
      });
    });
  };

  const handlePointerLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTilt(null);
  };

  const isPink = org.tone === "pink";
  const isPurple = org.tone === "purple";

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      tabIndex={0}
      role="article"
      id={`partner-card-${org.id}`}
      aria-label={`${org.name} — ${org.category} (${org.role})`}
      style={{
        transform:
          tilt
            ? `perspective(800px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateY(-4px) scale(1.02)`
            : "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)",
        transition: tilt
          ? "transform 80ms ease-out"
          : "transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 400ms cubic-bezier(0.2, 0.8, 0.2, 1), border-color 400ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className="group relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 outline-none select-none min-h-[160px] sm:min-h-[174px] focus-visible:ring-2 focus-visible:ring-[#007BA7] border border-slate-200/80 bg-white hover:border-[#007BA7]/35 hover:shadow-[0_14px_32px_-12px_rgba(15,23,42,0.10)] dark:border-white/[0.08] dark:bg-[#18181D] dark:hover:border-white/[0.18] dark:hover:bg-[#1D1D23] dark:hover:shadow-[0_14px_32px_-12px_rgba(0,0,0,0.5)] cursor-pointer transition-all duration-300"
    >
      {/* Subtle Specular Sheen on Hover */}
      {tilt && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-70 dark:opacity-30 transition-opacity duration-200"
          style={{
            background: `radial-gradient(140px circle at ${tilt.px}% ${tilt.py}%, rgba(181, 101, 75, 0.10) 0%, rgba(181, 101, 75, 0.02) 45%, transparent 75%)`,
          }}
          aria-hidden="true"
        />
      )}

      {/* Top domain tag */}
      <div className="relative z-10 flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-[#A7B0BE] gap-2">
        <span className="uppercase tracking-wider text-[10px] text-slate-600 dark:text-[#A7B0BE] truncate">
          {org.category}
        </span>
        {org.highlightTag && (
          <span
            className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0 ${
              isPink
                ? "bg-purple-500/12 text-[#743BFF] dark:text-[#B57CFF] dark:bg-purple-500/20"
                : isPurple
                ? "bg-cyan-500/12 text-[#007BA7] dark:text-[#19B8E6] dark:bg-cyan-500/20"
                : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-[#CDCBCA]"
            }`}
          >
            {org.highlightTag}
          </span>
        )}
      </div>

      {/* Logo Showcase Container */}
      <div className="relative z-10 my-3 flex flex-1 items-center justify-center py-1">
        {org.id === "mit-adt" ? (
          <div className="relative flex items-center justify-center gap-3.5 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logos/mit-adt-crest.png"
              alt="MIT ADT University official emblem"
              width={48}
              height={48}
              className="h-10 sm:h-11 w-auto object-contain shrink-0 drop-shadow-sm"
              priority
            />
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm sm:text-base tracking-tight text-[#0F172A] dark:text-white leading-tight">
                MIT ADT University
              </span>
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#007BA7] dark:text-[#19B8E6]">
                Accredited Higher Education
              </span>
            </div>
          </div>
        ) : org.id === "microsoft" ? (
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 338 72" className="h-7 sm:h-8 w-auto">
              <rect fill="#F25022" width="34.2" height="34.2" />
              <rect x="37.8" fill="#7FBA00" width="34.2" height="34.2" />
              <rect y="37.8" fill="#00A4EF" width="34.2" height="34.2" />
              <rect x="37.8" y="37.8" fill="#FFB900" width="34.2" height="34.2" />
              <path
                className="fill-[#4A4A4A] dark:fill-[#F1F5F9] transition-colors duration-200"
                d="M140.4,14.4v43.2h-7.5V23.7h-0.1l-13.4,33.9h-5l-13.7-33.9h-0.1v33.9h-6.9V14.4h10.8l12.4,32h0.2l13.1-32H140.4 z M146.6,17.7c0-1.2,0.4-2.2,1.3-3c0.9-0.8,1.9-1.2,3.1-1.2c1.3,0,2.4,0.4,3.2,1.2s1.3,1.8,1.3,3c0,1.2-0.4,2.2-1.3,3 c-0.9,0.8-1.9,1.2-3.2,1.2s-2.3-0.4-3.1-1.2C147.1,19.8,146.6,18.8,146.6,17.7z M154.7,26.6v31h-7.3v-31H154.7z M176.8,52.3 c1.1,0,2.3-0.2,3.6-0.8c1.3-0.5,2.5-1.2,3.6-2v6.8c-1.2,0.7-2.5,1.2-4,1.5c-1.5,0.3-3.1,0.5-4.9,0.5c-4.6,0-8.3-1.4-11.1-4.3 c-2.9-2.9-4.3-6.6-4.3-11c0-5,1.5-9.1,4.4-12.3c2.9-3.2,7-4.8,12.4-4.8c1.4,0,2.8,0.2,4.1,0.5c1.4,0.3,2.5,0.8,3.3,1.2v7 c-1.1-0.8-2.3-1.5-3.4-1.9c-1.2-0.4-2.4-0.7-3.6-0.7c-2.9,0-5.2,0.9-7,2.8s-2.6,4.4-2.6,7.6c0,3.1,0.9,5.6,2.6,7.3 C171.6,51.4,173.9,52.3,176.8,52.3z M204.7,26.1c0.6,0,1.1,0,1.6,0.1s0.9,0.2,1.2,0.3v7.4c-0.4-0.3-0.9-0.6-1.7-0.8 s-1.6-0.4-2.7-0.4c-1.8,0-3.3,0.8-4.5,2.3s-1.9,3.8-1.9,7v15.6h-7.3v-31h7.3v4.9h0.1c0.7-1.7,1.7-3,3-4 C201.2,26.6,202.8,26.1,204.7,26.1z M207.9,42.6c0-5.1,1.5-9.2,4.3-12.2c2.9-3,6.9-4.5,12-4.5c4.8,0,8.6,1.4,11.3,4.3 s4.1,6.8,4.1,11.7c0,5-1.5,9-4.3,12c-2.9,3-6.8,4.5-11.8,4.5c-4.8,0-8.6-1.4-11.4-4.2C209.3,51.3,207.9,47.4,207.9,42.6z M215.5,42.3c0,3.2,0.7,5.7,2.2,7.4s3.6,2.6,6.3,2.6c2.6,0,4.7-0.8,6.1-2.6c1.4-1.7,2.1-4.2,2.1-7.6c0-3.3-0.7-5.8-2.1-7.6 c-1.4-1.7-3.5-2.6-6-2.6c-2.7,0-4.7,0.9-6.2,2.7C216.2,36.5,215.5,39,215.5,42.3z M250.5,34.8c0,1,0.3,1.9,1,2.5 c0.7,0.6,2.1,1.3,4.4,2.2c2.9,1.2,5,2.5,6.1,3.9c1.2,1.5,1.8,3.2,1.8,5.3c0,2.9-1.1,5.2-3.4,7c-2.2,1.8-5.3,2.6-9.1,2.6 c-1.3,0-2.7-0.2-4.3-0.5c-1.6-0.3-2.9-0.7-4-1.2v-7.2c1.3,0.9,2.8,1.7,4.3,2.2c1.5,0.5,2.9,0.8,4.2,0.8c1.6,0,2.9-0.2,3.6-0.7 c0.8-0.5,1.2-1.2,1.2-2.3c0-1-0.4-1.8-1.2-2.6c-0.8-0.7-2.4-1.5-4.6-2.4c-2.7-1.1-4.6-2.4-5.7-3.8s-1.7-3.2-1.7-5.4 c0-2.8,1.1-5.1,3.3-6.9c2.2-1.8,5.1-2.7,8.6-2.7c1.1,0,2.3,0.1,3.6,0.4s2.5,0.6,3.4,0.9V34c-1-0.6-2.1-1.2-3.4-1.7 c-1.3-0.5-2.6-0.7-3.8-0.7c-1.4,0-2.5,0.3-3.2,0.8C250.9,33.1,250.5,33.8,250.5,34.8z M266.9,42.6c0-5.1,1.5-9.2,4.3-12.2 c2.9-3,6.9-4.5,12-4.5c4.8,0,8.6,1.4,11.3,4.3s4.1,6.8,4.1,11.7c0,5-1.5,9-4.3,12c-2.9,3-6.8,4.5-11.8,4.5c-4.8,0-8.6-1.4-11.4-4.2 C268.4,51.3,266.9,47.4,266.9,42.6z M274.5,42.3c0,3.2,0.7,5.7,2.2,7.4s3.6,2.6,6.3,2.6c2.6,0,4.7-0.8,6.1-2.6 c1.4-1.7,2.1-4.2,2.1-7.6c0-3.3-0.7-5.8-2.1-7.6c-1.4-1.7-3.5-2.6-6-2.6c-2.7,0-4.7,0.9-6.2,2.7C275.3,36.5,274.5,39,274.5,42.3z M322.9,32.6h-10.9v25h-7.4v-25h-5.2v-6h5.2v-4.3c0-3.2,1.1-5.9,3.2-8s4.8-3.1,8.1-3.1c0.9,0,1.7,0.1,2.4,0.1s1.3,0.2,1.8,0.4v6.3 c-0.2-0.1-0.7-0.3-1.3-0.5c-0.6-0.2-1.3-0.3-2.1-0.3c-1.5,0-2.7,0.5-3.5,1.4c-0.8,0.9-1.2,2.4-1.2,4.2v3.7h10.9v-7l7.3-2.2v9.2h7.4 v6h-7.4v14.5c0,1.9,0.4,3.2,1,4c0.7,0.8,1.8,1.2,3.3,1.2c0.4,0,0.9-0.1,1.5-0.3c0.6-0.2,1.1-0.4,1.5-0.7v6c-0.5,0.3-1.2,0.5-2.3,0.7 c-1.1,0.2-2.1,0.3-3.2,0.3c-3.1,0-5.4-0.8-6.9-2.4c-1.5-1.6-2.3-4.1-2.3-7.4L322.9,32.6L322.9,32.6z"
              />
            </svg>
          </div>
        ) : org.id === "openai" ? (
          <div className="relative flex items-center justify-center gap-2.5 transition-transform duration-300 group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7 shrink-0">
              <path
                className="fill-[#222222] dark:fill-white transition-colors duration-200"
                d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.401-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4593a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"
              />
            </svg>
            <span className="font-bold text-base sm:text-lg tracking-tight text-[#0F172A] dark:text-white transition-colors duration-200">
              OpenAI
            </span>
          </div>
        ) : org.id === "aws" ? (
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 24 129 78" className="h-9 w-auto">
              <path
                className="fill-[#232F3E] dark:fill-white transition-colors duration-200"
                d="M36.379 53.64c0 1.56.168 2.825.465 3.75.336.926.758 1.938 1.347 3.032.207.336.293.672.293.969 0 .418-.254.84-.8 1.261l-2.653 1.77c-.379.25-.758.379-1.093.379-.422 0-.844-.211-1.266-.59a13.28 13.28 0 0 1-1.516-1.98 34.153 34.153 0 0 1-1.304-2.485c-3.282 3.875-7.41 5.813-12.38 5.813-3.535 0-6.355-1.012-8.421-3.032-2.063-2.023-3.114-4.718-3.114-8.086 0-3.578 1.262-6.484 3.833-8.671 2.566-2.192 5.976-3.286 10.316-3.286 1.43 0 2.902.125 4.46.336 1.56.211 3.161.547 4.845.926v-3.074c0-3.2-.676-5.43-1.98-6.734C26.061 32.633 23.788 32 20.546 32c-1.473 0-2.988.168-4.547.547a33.416 33.416 0 0 0-4.547 1.433c-.676.293-1.18.461-1.473.547-.296.082-.507.125-.675.125-.59 0-.883-.422-.883-1.304v-2.063c0-.676.082-1.18.293-1.476.21-.293.59-.586 1.18-.883 1.472-.758 3.242-1.39 5.304-1.895 2.063-.547 4.254-.8 6.57-.8 5.008 0 8.672 1.136 11.032 3.41 2.316 2.273 3.492 5.726 3.492 10.359v13.64Zm-17.094 6.403c1.387 0 2.82-.254 4.336-.758 1.516-.508 2.863-1.433 4-2.695.672-.8 1.18-1.684 1.43-2.695.254-1.012.422-2.23.422-3.665v-1.765a34.401 34.401 0 0 0-3.871-.719 31.816 31.816 0 0 0-3.961-.25c-2.82 0-4.883.547-6.274 1.684-1.387 1.136-2.062 2.734-2.062 4.84 0 1.98.504 3.453 1.558 4.464 1.012 1.051 2.485 1.559 4.422 1.559Zm33.809 4.547c-.758 0-1.262-.125-1.598-.422-.34-.254-.633-.84-.887-1.64L40.715 29.98c-.25-.843-.38-1.39-.38-1.687 0-.672.337-1.05 1.013-1.05h4.125c.8 0 1.347.124 1.644.421.336.25.59.84.84 1.64l7.074 27.876 6.57-27.875c.208-.84.462-1.39.797-1.64.34-.255.93-.423 1.688-.423h3.367c.8 0 1.348.125 1.684.422.336.25.633.84.8 1.64l6.653 28.212 7.285-28.211c.25-.84.547-1.39.84-1.64.336-.255.887-.423 1.644-.423h3.914c.676 0 1.055.336 1.055 1.051 0 .21-.043.422-.086.676-.043.254-.125.59-.293 1.05L80.801 62.57c-.254.84-.547 1.387-.887 1.64-.336.255-.883.423-1.598.423h-3.62c-.801 0-1.348-.13-1.684-.422-.34-.297-.633-.844-.801-1.684l-6.527-27.16-6.485 27.117c-.21.844-.46 1.391-.8 1.684-.337.297-.926.422-1.684.422Zm54.105 1.137c-2.187 0-4.379-.254-6.484-.758-2.106-.504-3.746-1.055-4.84-1.684-.676-.379-1.137-.8-1.305-1.18a2.919 2.919 0 0 1-.254-1.18v-2.148c0-.882.336-1.304.97-1.304.25 0 .503.043.757.129.25.082.629.25 1.05.418a23.102 23.102 0 0 0 4.634 1.476c1.683.336 3.324.504 5.011.504 2.653 0 4.715-.465 6.145-1.39 1.433-.926 2.191-2.274 2.191-4 0-1.18-.379-2.145-1.136-2.946-.758-.8-2.192-1.516-4.254-2.191l-6.106-1.895c-3.074-.969-5.348-2.398-6.734-4.293-1.39-1.855-2.106-3.918-2.106-6.105 0-1.77.38-3.328 1.137-4.676a10.829 10.829 0 0 1 3.031-3.453c1.262-.965 2.696-1.684 4.38-2.188 1.683-.504 3.452-.715 5.304-.715.926 0 1.894.043 2.82.168.969.125 1.852.293 2.738.461.84.211 1.641.422 2.399.676.758.254 1.348.504 1.77.758.59.336 1.011.672 1.261 1.05.254.34.379.802.379 1.391v1.98c0 .884-.336 1.348-.969 1.348-.336 0-.883-.171-1.597-.507-2.403-1.094-5.098-1.641-8.086-1.641-2.399 0-4.293.379-5.598 1.18-1.309.797-1.98 2.02-1.98 3.746 0 1.18.421 2.191 1.261 2.988.844.8 2.403 1.602 4.633 2.316l5.98 1.895c3.032.969 5.22 2.316 6.524 4.043 1.305 1.727 1.938 3.707 1.938 5.895 0 1.812-.38 3.453-1.094 4.882-.758 1.434-1.77 2.696-3.074 3.707-1.305 1.051-2.864 1.809-4.672 2.36-1.895.586-3.875.883-6.024.883Zm0 0"
              />
              <path
                fill="#FF9900"
                d="M118 73.348c-4.432.063-9.664 1.052-13.621 3.832-1.223.883-1.012 2.062.336 1.894 4.508-.547 14.44-1.726 16.21.547 1.77 2.23-1.976 11.62-3.663 15.79-.504 1.26.59 1.769 1.726.8 7.41-6.231 9.348-19.242 7.832-21.137-.757-.925-4.388-1.79-8.82-1.726zM1.63 75.859c-.927.116-1.347 1.236-.368 2.121 16.508 14.902 38.359 23.872 62.613 23.872 17.305 0 37.43-5.43 51.281-15.66 2.273-1.688.297-4.254-2.02-3.204-15.534 6.57-32.421 9.77-47.788 9.77-22.778 0-44.8-6.273-62.653-16.633-.39-.231-.755-.304-1.064-.266z"
              />
            </svg>
          </div>
        ) : org.id === "accenture" ? (
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <svg viewBox="0 0 163.4 43" className="h-6 sm:h-7 w-auto">
              <polygon fill="#A100FF" points="95.1,4.9 95.1,0 111.2,6.5 111.2,10.5 95.1,17 95.1,12 104.5,8.5" />
              <path
                className="fill-[#0F172A] dark:fill-white transition-colors duration-200"
                d="M 6.2,43 C 2.8,43 0,41.3 0,37.5 v -0.2 c 0,-4.6 4,-6.2 8.9,-6.2 h 2.3 v -0.9 c 0,-1.9 -0.8,-3 -2.8,-3 -1.8,0 -2.7,1 -2.8,2.4 h -5 c 0.4,-4.2 3.7,-6.2 8.1,-6.2 4.5,0 7.8,1.9 7.8,6.6 V 42.6 H 11.4 V 40.4 C 10.4,41.8 8.7,43 6.2,43 Z m 5,-6.6 V 34.6 H 9.1 c -2.6,0 -3.9,0.7 -3.9,2.4 v 0.2 c 0,1.3 0.8,2.2 2.6,2.2 1.8,-0.1 3.4,-1.1 3.4,-3 z M 28.4,43 c -5.2,0 -9,-3.2 -9,-9.6 v -0.3 c 0,-6.4 4,-9.8 9,-9.8 4.3,0 7.8,2.2 8.2,7.1 h -5 c -0.3,-1.8 -1.3,-3 -3.1,-3 -2.2,0 -3.8,1.8 -3.8,5.5 v 0.6 c 0,3.8 1.4,5.5 3.8,5.5 1.8,0 3.1,-1.3 3.4,-3.4 h 4.8 C 36.4,40 33.5,43 28.4,43 Z M 48,43 c -5.2,0 -9,-3.2 -9,-9.6 v -0.3 c 0,-6.4 4,-9.8 9,-9.8 4.3,0 7.8,2.2 8.2,7.1 h -5 c -0.3,-1.8 -1.3,-3 -3.1,-3 -2.2,0 -3.8,1.8 -3.8,5.5 v 0.6 c 0,3.8 1.4,5.5 3.8,5.5 1.8,0 3.1,-1.3 3.4,-3.4 h 4.8 C 56,40 53.1,43 48,43 Z m 19.7,0 c -5.4,0 -9.1,-3.2 -9.1,-9.5 v -0.4 c 0,-6.3 3.9,-9.8 9,-9.8 4.7,0 8.6,2.6 8.6,8.9 v 2.3 H 63.9 c 0.2,3.4 1.7,4.7 3.9,4.7 2,0 3.1,-1.1 3.5,-2.4 h 4.9 C 75.6,40.3 72.6,43 67.7,43 Z M 64,31 h 7 c -0.1,-2.8 -1.4,-4 -3.5,-4 -1.6,0.1 -3.1,1 -3.5,4 z m 15.4,-7.2 h 5.3 v 2.8 c 0.9,-1.8 2.8,-3.2 5.7,-3.2 3.4,0 5.7,2.1 5.7,6.6 V 42.6 H 90.8 V 30.8 c 0,-2.2 -0.9,-3.2 -2.8,-3.2 -1.8,0 -3.3,1.1 -3.3,3.5 v 11.5 h -5.3 z m 26.4,-5.7 v 5.7 h 3.6 v 3.9 h -3.6 v 8.9 c 0,1.4 0.6,2.1 1.9,2.1 0.8,0 1.3,-0.1 1.8,-0.3 v 4.1 c -0.6,0.2 -1.7,0.4 -3,0.4 -4.1,0 -6,-1.9 -6,-5.7 v -9.5 h -2.2 v -3.9 h 2.2 v -3.5 z m 23.4,24.5 H 124 v -2.8 c -0.9,1.8 -2.7,3.2 -5.5,3.2 -3.4,0 -5.9,-2.1 -5.9,-6.5 V 23.8 h 5.3 v 12 c 0,2.2 0.9,3.2 2.7,3.2 1.8,0 3.3,-1.2 3.3,-3.5 V 23.8 h 5.3 z m 3.9,-18.8 h 5.3 v 3.5 c 1.1,-2.5 2.9,-3.7 5.7,-3.7 v 5.2 c -3.6,0 -5.7,1.1 -5.7,4.2 v 9.7 h -5.3 z M 154.8,43 c -5.4,0 -9.1,-3.2 -9.1,-9.5 v -0.4 c 0,-6.3 3.9,-9.8 9,-9.8 4.7,0 8.6,2.6 8.6,8.9 v 2.3 h -12.2 c 0.2,3.4 1.7,4.7 3.9,4.7 2,0 3.1,-1.1 3.5,-2.4 h 4.9 c -0.8,3.5 -3.7,6.2 -8.6,6.2 z M 151,31 h 7.1 c -0.1,-2.8 -1.4,-4 -3.5,-4 -1.6,0.1 -3.1,1 -3.6,4 z"
              />
            </svg>
          </div>
        ) : org.needsLightPlate ? (
          <div className="relative flex items-center justify-center rounded-xl px-3 py-2 transition-all duration-300">
            <Image
              src={org.logoSrc}
              alt={org.alt}
              width={org.width}
              height={org.height}
              className="max-h-10 sm:max-h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="relative flex items-center justify-center text-[#0F172A] dark:text-white transition-transform duration-300 group-hover:scale-105">
            <Image
              src={org.logoSrc}
              alt={org.alt}
              width={org.width}
              height={org.height}
              className="max-h-9 sm:max-h-10 w-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* Organization Name & Role */}
      <div className="relative z-10 w-full pt-2.5 border-t border-slate-200/80 dark:border-white/[0.08] text-center">
        <h5 className="font-semibold text-xs sm:text-sm text-[#0F172A] dark:text-white truncate">
          {org.name}
        </h5>
        {org.fullName && org.fullName !== org.name && (
          <p className="text-[10px] text-slate-600 dark:text-[#A7B0BE] truncate">
            {org.fullName}
          </p>
        )}
        <p className="text-[11px] text-slate-600 dark:text-[#CDCBCA] truncate mt-0.5">
          {org.role}
        </p>
      </div>
    </div>
  );
});

const TRUSTED_DOMAIN_FILTERS = [
  { id: "all", label: "All Domains", icon: Sparkles },
  { id: "academia", label: "Universities and Academia", icon: GraduationCap },
  { id: "tech", label: "Technology and Software", icon: Code },
  { id: "ai", label: "Artificial Intelligence and Data", icon: Sparkles },
  { id: "cloud", label: "Cloud and Platforms", icon: Building2 },
  { id: "enterprise", label: "Global Enterprises", icon: Briefcase },
] as const;

export function SectionOutcomes() {
  const { t } = useLanguage();
  const [selectedCap, setSelectedCap] = useState<string>("collab");
  const [hoveredCap, setHoveredCap] = useState<string | null>(null);

  const [activeDomainFilter, setActiveDomainFilter] = useState<string>("all");
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  // Capability Navigation & iOS Sliding Glass Pill Refs (matching SectionBuild)
  const capNavRef = useRef<HTMLDivElement | null>(null);
  const capItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [capPillState, setCapPillState] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
    isHover: boolean;
    targetId: string;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
    isHover: false,
    targetId: "collaborate",
  });

  // Domain Filter Navigation & iOS Sliding Glass Pill Refs
  const filterNavRef = useRef<HTMLDivElement | null>(null);
  const filterItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [filterPillStyle, setFilterPillStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  // Calculate pixel-accurate position of target button inside the capability container (matching SectionBuild)
  const moveCapPillTo = useCallback((id: string, isHover = false) => {
    const navEl = capNavRef.current;
    const itemEl = capItemRefs.current.get(id);
    if (!navEl || !itemEl) return;

    const navRect = navEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    setCapPillState({
      left: Math.round(itemRect.left - navRect.left),
      top: Math.round(itemRect.top - navRect.top),
      width: Math.round(itemRect.width),
      height: Math.round(itemRect.height),
      opacity: 1,
      isHover,
      targetId: id,
    });
  }, []);

  // Calculate pixel-accurate position of target button inside the domain filter container
  const updateFilterPill = useCallback((id: string) => {
    const navEl = filterNavRef.current;
    const itemEl = filterItemRefs.current.get(id);
    if (!navEl || !itemEl) return;

    const navRect = navEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    setFilterPillStyle({
      left: Math.round(itemRect.left - navRect.left),
      top: Math.round(itemRect.top - navRect.top),
      width: Math.round(itemRect.width),
      height: Math.round(itemRect.height),
      opacity: 1,
    });
  }, []);

  // Update capability pill position when active capability changes (only if user is not currently hovering)
  useEffect(() => {
    if (!hoveredCap) {
      moveCapPillTo(selectedCap, false);
    }
  }, [selectedCap, hoveredCap, moveCapPillTo]);

  useEffect(() => {
    const target = hoveredFilter || activeDomainFilter;
    updateFilterPill(target);
  }, [activeDomainFilter, hoveredFilter, updateFilterPill]);

  // Initial layout measurement & font load synchronization (matching SectionBuild)
  useEffect(() => {
    const t1 = setTimeout(() => {
      moveCapPillTo(selectedCap, false);
      updateFilterPill(activeDomainFilter);
    }, 40);
    const t2 = setTimeout(() => {
      moveCapPillTo(selectedCap, false);
      updateFilterPill(activeDomainFilter);
    }, 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedCap, activeDomainFilter, moveCapPillTo, updateFilterPill]);

  // Re-align indicator on window resize or container resize
  useEffect(() => {
    const navEl = capNavRef.current;
    if (!navEl) return;

    const onResize = () => {
      moveCapPillTo(hoveredCap || selectedCap, !!hoveredCap);
      updateFilterPill(hoveredFilter || activeDomainFilter);
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(navEl);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [selectedCap, hoveredCap, activeDomainFilter, hoveredFilter, moveCapPillTo, updateFilterPill]);

  const activeCap = CAPABILITIES.find((c) => c.id === selectedCap) || CAPABILITIES[0];

  return (
    <ScrollSection
      id="outcomes"
      className="py-24 sm:py-32 lg:py-36 border-b border-[#222222]/[0.06]"

    >
      {({ inView }) => (
        <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className={`scroll-reveal scroll-delay-1 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-[#0F172A] dark:text-[#CDCBCA] ${
                inView ? "is-in-view" : ""
              }`}
            >
              {t.outcomes.title}{" "}
              <span className="font-editorial text-transparent bg-clip-text bg-gradient-to-r from-[#007BA7] via-[#743BFF] to-[#FF2D95] dark:from-[#19B8E6] dark:via-[#B57CFF] dark:to-[#FF2D95]">
                {t.outcomes.titleAccent}
              </span>
            </h2>

            <p
              className={`scroll-reveal scroll-delay-2 mt-4 sm:mt-5 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-[#8E8C8B] ${
                inView ? "is-in-view" : ""
              }`}
            >
              {t.outcomes.subtitle}
            </p>
          </div>

          {/* Interactive Capabilities Grid */}
          <div className="mt-14 sm:mt-18 lg:mt-20">
            {/* Capability Selector with SkillBridge iOS Glass Sliding System (matching SectionBuild) */}
            <div className="flex justify-center">
              <div
                ref={capNavRef}
                onPointerLeave={() => {
                  setHoveredCap(null);
                  moveCapPillTo(selectedCap, false);
                }}
                className={`floating-glass-navbar is-top relative mt-8 inline-flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl transition-all duration-700 delay-150 select-none ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                role="tablist"
                aria-label="SkillBridge Interactive Outcomes"
              >
                {/* The Single Continuous Sliding Glass Indicator matching SectionBuild */}
                <div
                  className={`sliding-glass-pill pointer-events-none absolute left-0 top-0 rounded-xl transition-all ${
                    capPillState.isHover ? "is-hovered" : "is-active"
                  }`}
                  style={{
                    transform: `translate3d(${capPillState.left}px, ${capPillState.top}px, 0)`,
                    width: `${capPillState.width}px`,
                    height: `${capPillState.height}px`,
                    opacity: capPillState.opacity,
                  }}
                  aria-hidden="true"
                />

                {/* Capability Option Buttons matching SectionBuild iOS Glass styling */}
                {CAPABILITIES.map((cap) => {
                  const isSelected = selectedCap === cap.id;
                  const isHovered = hoveredCap === cap.id;
                  const Icon = cap.icon;

                  return (
                    <button
                      key={cap.id}
                      ref={(el) => {
                        if (el) capItemRefs.current.set(cap.id, el);
                        else capItemRefs.current.delete(cap.id);
                      }}
                      type="button"
                      id={`cap-tab-${cap.id}`}
                      role="tab"
                      aria-selected={isSelected}
                      aria-pressed={isSelected}
                      onPointerEnter={() => {
                        setHoveredCap(cap.id);
                        moveCapPillTo(cap.id, true);
                      }}
                      onFocus={() => {
                        setHoveredCap(cap.id);
                        moveCapPillTo(cap.id, true);
                      }}
                      onBlur={(e) => {
                        if (capNavRef.current && !capNavRef.current.contains(e.relatedTarget as Node)) {
                          setHoveredCap(null);
                          moveCapPillTo(selectedCap, false);
                        }
                      }}
                      onClick={() => {
                        setSelectedCap(cap.id);
                        setHoveredCap(null);
                        moveCapPillTo(cap.id, false);
                      }}
                      className={`nav-item-link relative z-10 inline-flex items-center gap-2 rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium outline-none select-none cursor-pointer transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/20 ${
                        isSelected
                          ? "text-slate-900 font-semibold dark:text-white"
                          : isHovered
                          ? "text-slate-800 font-medium dark:text-[#CDCBCA]"
                          : "text-slate-500 hover:text-slate-900 dark:text-[#8E8C8B] dark:hover:text-[#CDCBCA]"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors duration-200 ${
                          isSelected
                            ? "text-slate-900 dark:text-white"
                            : isHovered
                            ? "text-slate-800 dark:text-[#CDCBCA]"
                            : "text-slate-500 dark:text-[#8E8C8B]"
                        }`}
                      />
                      <span className="relative z-10 whitespace-nowrap">{cap.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Capability Deep-Dive Card */}
            <div
              className={`mt-8 rounded-3xl border border-slate-200/80 dark:border-white/[0.10] bg-white dark:bg-[#0D0D0F] p-6 sm:p-10 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-500 delay-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest border border-slate-200/80 dark:border-white/[0.12] bg-slate-100/90 dark:bg-white/[0.06] text-slate-700 dark:text-[#CDCBCA] transition-colors duration-300"
                  >
                    {activeCap.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F5F7FA] tracking-tight">
                    {activeCap.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
                    {activeCap.description}
                  </p>

                  <div className="pt-2 flex items-center gap-4">
                    <Link
                      href={activeCap.portalHref}
                      id={`outcomes-btn-${activeCap.id}`}
                      className={`${activeCap.ctaClass} group`}
                    >
                      <span>{activeCap.portalText}</span>
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-150 group-hover:translate-x-0.5 text-current"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>

                <div
                  className="lg:col-span-5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/90 dark:bg-[#151518] p-6 transition-colors duration-300"
                >
                  <div
                    className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-[#CDCBCA] transition-colors duration-300"
                  >
                    Capability Specifications
                  </div>
                  <div className="mt-4 space-y-3">
                    {activeCap.highlights.map((h) => (
                      <div key={h} className="flex items-center gap-3">
                        <CheckCircle2
                          className="h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 transition-colors duration-300"
                        />
                        <span className="text-sm font-medium text-[#0F172A] dark:text-[#F5F7FA]">
                          {h}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Redesigned Premium "Trusted by Global Innovators and Universities" Section */}
            <div
              id="trusted-ecosystem"
              className={`mt-14 sm:mt-18 rounded-3xl border border-slate-200/80 dark:border-white/[0.08] bg-[#FAF8F4]/95 dark:bg-[#0D0D10] p-6 sm:p-10 shadow-[0_24px_60px_-20px_rgba(34,34,34,0.08)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] transition-[opacity,transform] duration-500 delay-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#222222]/10 dark:border-white/[0.08] pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-white dark:bg-[#141418] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#007BA7] dark:text-[#19B8E6] mb-2.5 shadow-sm dark:shadow-none">
                    <Building2 className="h-3 w-3 text-[#007BA7] dark:text-[#19B8E6]" />
                    <span>ACCREDITED PARTNERS &amp; ENTERPRISE NETWORKS</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white">
                    Trusted by Global Innovators and Universities
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-[#CDCBCA] max-w-2xl">
                    Bridging learners, research labs, and recruiting teams across world-class technology enterprises and accredited higher education institutions.
                  </p>
                </div>
              </div>

              {/* Domain Filters with iOS-Inspired Translucent Glass System */}
              <div className="mt-6 flex flex-wrap items-center">
                <div
                  ref={filterNavRef}
                  onPointerLeave={() => setHoveredFilter(null)}
                  className="relative inline-flex flex-wrap items-center gap-1 sm:gap-1.5 p-1.5 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-white/70 dark:bg-[#141418]/90 backdrop-blur-xl shadow-[0_8px_30px_-6px_rgba(34,34,34,0.06),inset_0_1px_1px_rgba(255,255,255,0.85)] dark:shadow-none select-none transition-all duration-300"
                  role="tablist"
                  aria-label="Domain Filters"
                >
                  {/* Single Continuous Sliding iOS Translucent Glass Pill */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-0 rounded-xl transition-all duration-260 ease-[cubic-bezier(0.2,0.8,0.2,1)] backdrop-blur-md bg-white/90 dark:bg-white/[0.10] border border-white/80 dark:border-white/[0.14] shadow-[0_4px_16px_-2px_rgba(34,34,34,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.95)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_2px_8px_-1px_rgba(0,0,0,0.5)]"
                    style={{
                      transform: `translate3d(${filterPillStyle.left}px, ${filterPillStyle.top}px, 0)`,
                      width: `${filterPillStyle.width}px`,
                      height: `${filterPillStyle.height}px`,
                      opacity: filterPillStyle.opacity,
                    }}
                  />

                  {/* Individual Domain Filter Buttons with Refined Typography */}
                  {TRUSTED_DOMAIN_FILTERS.map((f) => {
                    const isActive = activeDomainFilter === f.id;
                    const isHovered = hoveredFilter === f.id;
                    const Icon = f.icon;

                    return (
                      <button
                        key={f.id}
                        ref={(el) => {
                          if (el) filterItemRefs.current.set(f.id, el);
                          else filterItemRefs.current.delete(f.id);
                        }}
                        type="button"
                        id={`domain-filter-${f.id}`}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => {
                          setActiveDomainFilter(f.id);
                          setHoveredFilter(null);
                        }}
                        onPointerEnter={() => setHoveredFilter(f.id)}
                        onFocus={() => setHoveredFilter(f.id)}
                        onBlur={() => setHoveredFilter(null)}
                        className={`relative z-10 flex items-center gap-1.5 sm:gap-2 rounded-xl px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm whitespace-nowrap outline-none select-none cursor-pointer transition-colors duration-200 ${
                          isActive
                            ? "font-semibold text-[#007BA7] dark:text-[#19B8E6]"
                            : isHovered
                            ? "font-medium text-[#0F172A] dark:text-white"
                            : "font-medium text-slate-600 dark:text-[#CDCBCA] hover:text-[#0F172A] dark:hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                            isActive
                              ? "text-[#007BA7] dark:text-[#19B8E6]"
                              : isHovered
                              ? "text-[#0F172A] dark:text-white"
                              : "text-[#687082] dark:text-[#8E8C8B]"
                          }`}
                          aria-hidden="true"
                        />
                        <span className="whitespace-nowrap transition-colors duration-200">
                          {f.label}
                        </span>
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[#007BA7] dark:bg-[#19B8E6]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domain Groups Showcase */}
              <div className="mt-8 space-y-8">
                {DOMAIN_SECTIONS.filter((d) => {
                  if (activeDomainFilter === "all") return true;
                  return d.id === activeDomainFilter;
                }).map((domain) => {
                  const orgs = PARTNER_ORGS.filter((o) => o.domainId === domain.id);
                  const Icon = domain.icon;
                  const isAcademia = domain.id === "academia";

                  return (
                    <div
                      key={domain.id}
                      id={`domain-group-${domain.id}`}
                      className="rounded-2xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50 dark:bg-[#121215] p-5 sm:p-6 transition-all duration-300"
                    >
                      {/* Domain Subheading & Description */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-white/[0.08] pb-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`grid h-8 w-8 place-items-center rounded-lg border ${
                              domain.accent === "purple"
                                ? "bg-cyan-500/12 text-[#007BA7] dark:text-[#19B8E6] border-cyan-500/25 dark:border-cyan-500/30"
                                : domain.accent === "pink"
                                ? "bg-purple-500/12 text-[#743BFF] dark:text-[#B57CFF] border-purple-500/25 dark:border-purple-500/30"
                                : "bg-pink-500/12 text-[#FF2D95] dark:text-[#FF2D95] border-pink-500/25 dark:border-pink-500/30"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <h5 className="font-semibold text-base text-[#0F172A] dark:text-white">
                              {domain.title}
                            </h5>
                            <p className="text-xs text-slate-600 dark:text-[#CDCBCA]">
                              {domain.subtitle}
                            </p>
                          </div>
                        </div>

                        <span className="self-start sm:self-center inline-flex items-center rounded-full bg-white dark:bg-[#16161A] border border-slate-200/80 dark:border-white/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-[#CDCBCA]">
                          {domain.badge}
                        </span>
                      </div>

                      {/* Cards Grid for Domain */}
                      <div
                        className={`mt-5 grid gap-4 ${
                          isAcademia
                            ? "grid-cols-1"
                            : orgs.length === 1
                            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            : orgs.length === 2
                            ? "grid-cols-1 sm:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        }`}
                      >
                        {orgs.map((org) => (
                          <PartnerCard key={org.id} org={org} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Supporting Network Metadata Bar */}
              <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[#222222]/10 dark:border-white/[0.08] pt-6 text-xs text-slate-600 dark:text-[#CDCBCA] sm:flex-row">
                <div className="flex items-center gap-2 text-center sm:text-left">
                  <Sparkles className="h-4 w-4 text-[#007BA7] dark:text-[#19B8E6] shrink-0" aria-hidden="true" />
                  <span>Verified talent pathways connecting university cohorts with hiring pipelines</span>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-medium text-[#0F172A] dark:text-[#CDCBCA]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#007BA7]" aria-hidden="true" />
                    Accredited Universities
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#743BFF]" aria-hidden="true" />
                    Industry Hiring Networks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScrollSection>
  );
}

export default SectionOutcomes;
