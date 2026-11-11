"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Briefcase, GraduationCap, Landmark } from "lucide-react";
import { useInView, usePrefersReducedMotion } from "@/components/motion/MotionHooks";

interface PortalCardItem {
  id: string;
  category: "STUDENTS" | "INDUSTRY" | "ACADEMIA";
  title: string;
  description: string;
  cta: string;
  href: string;
  imageSrc: string;
  animatedSrc: string;
  imageAlt: string;
  icon: typeof GraduationCap;
  accent: "cyan" | "pink" | "purple";
  badge: string;
}

const PORTAL_CARDS: readonly PortalCardItem[] = [
  {
    id: "students",
    category: "STUDENTS",
    title: "Learn • Build • Grow",
    description: "Master industry roadmaps, build verified projects, and apply directly to top opportunities.",
    cta: "Enter Student Portal",
    href: "/student",
    imageSrc: "/portals/students.jpg",
    animatedSrc: "/portals/students-animated.webp",
    imageAlt: "University students collaborating with laptops at a study table in a modern campus library",
    icon: GraduationCap,
    accent: "cyan",
    badge: "Verified Cohorts",
  },
  {
    id: "industry",
    category: "INDUSTRY",
    title: "Talent • Capabilities • Impact",
    description: "Discover student talent by demonstrated skills, publish capstones, and recruit with structured pipelines.",
    cta: "Enter Industry Portal",
    href: "/industry",
    imageSrc: "/portals/industry.jpg",
    animatedSrc: "/portals/industry-animated.webp",
    imageAlt: "Software engineers and tech specialists reviewing architecture and workflows in a modern tech office",
    icon: Briefcase,
    accent: "pink",
    badge: "Enterprise ATS",
  },
  {
    id: "academia",
    category: "ACADEMIA",
    title: "Research • Placement • Growth",
    description: "Empower departments, manage placement drives, publish faculty research, and track NIRF-ready outcomes.",
    cta: "Enter Academia Portal",
    href: "/academia",
    imageSrc: "/portals/academia.jpg",
    animatedSrc: "/portals/academia-animated.webp",
    imageAlt: "University faculty professor and research scholars discussing project data in an academic seminar room",
    icon: Landmark,
    accent: "purple",
    badge: "Accredited Campuses",
  },
] as const;

function PortalCard({ card, idx, inView }: { card: PortalCardItem; idx: number; inView: boolean }) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [pointer, setPointer] = useState<{ px: number; py: number; imgX: number; imgY: number } | null>(null);
  const [animError, setAnimError] = useState(false);
  const prefersReduced = usePrefersReducedMotion();
  const router = useRouter();

  const Icon = card.icon;
  const isPink = card.accent === "pink";
  const isPurple = card.accent === "purple";

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || e.pointerType === "touch") return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    const imgX = (px / 100 - 0.5) * 4; // subtle -2px to +2px parallax
    const imgY = (py / 100 - 0.5) * 3;
    setPointer({ px, py, imgX, imgY });
  };

  const handlePointerLeave = () => {
    setPointer(null);
  };

  return (
    <div
      className={`transition-all duration-700 flex ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${idx * 100}ms` }}
    >
      <div
        ref={cardRef}
        role="link"
        tabIndex={0}
        aria-label={`${card.cta} — ${card.title}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("a") && (target as HTMLElement).tagName.toLowerCase() === "a") return;
          router.push(card.href);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            router.push(card.href);
          }
        }}
        className={`group relative flex h-full w-full flex-col justify-between rounded-xl p-2.5 sm:p-3 outline-none select-none cursor-pointer border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-sky-500 ${
          isPink
            ? "hover:border-sb-pink/40"
            : isPurple
            ? "hover:border-[#743BFF]/40"
            : "hover:border-sb-cyan/40"
        } ${
          prefersReduced ? "" : "hover:-translate-y-0.5"
        } bg-[#111625]/90 border-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.35)] light:bg-[#ffffff] light:border-[#e2e8f0] light:shadow-[0_1px_3px_rgba(0,0,0,0.05)] light:hover:shadow-[0_6px_16px_rgba(0,0,0,0.08)] light:hover:border-[#cbd5e1]`}
      >
        <div className="w-full">
          {/* 1. Controlled Compact Image Area (~25–30% reduced height with character animation) */}
          <div className="relative aspect-[2.55/1] w-full overflow-hidden rounded-xl bg-neutral-900/60 light:bg-[#F0F3F8] shadow-inner">
            <div
              className="relative h-full w-full"
              style={{
                transform:
                  pointer && !prefersReduced
                    ? `scale(1.025) translate(${pointer.imgX.toFixed(2)}px, ${pointer.imgY.toFixed(2)}px)`
                    : "scale(1) translate(0px, 0px)",
                transition: pointer
                  ? "transform 90ms ease-out"
                  : "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Foundational Photograph Layer (Graceful Fallback & Instant Display) */}
              <Image
                src={card.imageSrc}
                alt={card.imageAlt}
                fill
                sizes="(min-width: 1024px) 310px, (min-width: 768px) 33vw, 100vw"
                className="object-cover object-center"
                priority={idx === 0}
              />

              {/* Seamless Cinemagraph Loop with Character Movement (blinking, head turns, gestures, gaze shifts) */}
              {inView && !prefersReduced && !animError && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={card.animatedSrc}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  onError={() => setAnimError(true)}
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
                />
              )}
            </div>

            {/* Subtle photographic vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-55 transition-opacity duration-300 group-hover:opacity-35" />

            {/* Quality / Metric Badge floating top-right */}
            <div className="absolute top-2 right-2 z-10 rounded-md px-2 py-0.5 text-[9px] font-medium tracking-wide bg-slate-900/80 text-slate-200 border border-white/10 light:bg-white/95 light:text-slate-700 light:border-slate-200 shadow-sm">
              {card.badge}
            </div>
          </div>

          {/* 2. Clearly Visible Category Icon & Label (Visual Anchor) */}
          <div className="flex items-center gap-2 pt-2.5 px-0.5">
            <span
              className={`inline-flex items-center justify-center h-6 w-6 rounded-md flex-none border ${
                isPink
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25 light:bg-rose-50 light:text-rose-600 light:border-rose-200"
                  : isPurple
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25 light:bg-indigo-50 light:text-indigo-600 light:border-indigo-200"
                  : "bg-sky-500/10 text-sky-400 border-sky-500/25 light:bg-sky-50 light:text-sky-600 light:border-sky-200"
              }`}
            >
              <Icon size={13} aria-hidden="true" />
            </span>
            <span
              className={`text-[11px] font-semibold tracking-wider uppercase ${
                isPink
                  ? "text-rose-400 light:text-rose-600"
                  : isPurple
                  ? "text-indigo-400 light:text-indigo-600"
                  : "text-sky-400 light:text-sky-600"
              }`}
            >
              {card.category}
            </span>
          </div>

          {/* 3. Main Title */}
          <div className="pt-1.5 px-0.5">
            <h3 className="text-[14px] sm:text-[14.5px] font-semibold tracking-tight text-white/95 light:text-slate-900">
              {card.title}
            </h3>
            {/* 4. Concise Description */}
            <p className="mt-1 text-[11.5px] leading-relaxed text-slate-400 line-clamp-2 min-h-[2.1rem] light:text-slate-600">
              {card.description}
            </p>
          </div>
        </div>

        {/* 5. Compact CTA and Arrow */}
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5 px-0.5 light:border-slate-200/80 w-full">
          <span
            className={`inline-flex items-center gap-1.5 text-[11.5px] font-medium transition-colors duration-150 ${
              isPink
                ? "text-rose-400 group-hover:text-rose-300 light:text-rose-600 light:group-hover:text-rose-700"
                : isPurple
                ? "text-indigo-400 group-hover:text-indigo-300 light:text-indigo-600 light:group-hover:text-indigo-700"
                : "text-sky-400 group-hover:text-sky-300 light:text-sky-600 light:group-hover:text-sky-700"
            }`}
          >
            {card.cta}
          </span>

          <div
            className={`flex h-6 w-6 items-center justify-center rounded-md border transition-transform duration-150 ${
              prefersReduced ? "" : "group-hover:translate-x-0.5"
            } ${
              isPink
                ? "border-rose-500/20 text-rose-400 bg-rose-500/5 light:text-rose-600 light:bg-rose-50 light:border-rose-200"
                : isPurple
                ? "border-indigo-500/20 text-indigo-400 bg-indigo-500/5 light:text-indigo-600 light:bg-indigo-50 light:border-indigo-200"
                : "border-sky-500/20 text-sky-400 bg-sky-500/5 light:text-sky-600 light:bg-sky-50 light:border-sky-200"
            }`}
          >
            <ArrowRight size={12} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AudienceCards() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      id="audiences"
      ref={ref}
      aria-label="Choose Your Dedicated Portal"
      className="relative mx-auto max-w-[960px] px-4 pt-5 pb-2 sm:px-6"
    >
      {/* Compact Section Header */}
      <div className="mb-3.5 flex flex-col items-center text-center justify-between gap-2 border-b border-[var(--glass-border)] pb-3 sm:flex-row sm:text-left sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-sb-cyan light:text-sb-blue">
            <span aria-hidden="true" className="text-xs">✧</span>
            <span>STUDENT • INDUSTRY • ACADEMIA</span>
          </span>
          <h2 className="mt-0.5 text-base sm:text-lg font-bold tracking-tight text-sb-text">
            Choose Your Dedicated Portal
          </h2>
        </div>
        <p className="max-w-sm text-[11.5px] text-sb-muted leading-relaxed sm:text-right">
          Three specialized workflows engineered for students, industry recruiters, and university leadership.
        </p>
      </div>

      {/* 3-Card Responsive Grid with Controlled Compact Footprint (~20% reduction) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-3.5 lg:gap-4 items-stretch">
        {PORTAL_CARDS.map((card, idx) => (
          <PortalCard key={card.id} card={card} idx={idx} inView={inView} />
        ))}
      </div>
    </section>
  );
}
