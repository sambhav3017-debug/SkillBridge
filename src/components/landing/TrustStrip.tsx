"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Building2, Sparkles } from "lucide-react";
import { useInView, usePrefersReducedMotion } from "@/components/motion/MotionHooks";

interface OrganizationItem {
  id: string;
  name: string;
  category: string;
  role: string;
  logoSrc: string;
  width: number;
  height: number;
  tone: "blue" | "pink";
  alt: string;
  needsLightPlate?: boolean;
}

const ORGANIZATIONS: OrganizationItem[] = [
  {
    id: "google",
    name: "Google",
    category: "Technology",
    role: "Cloud & Developer Platforms",
    logoSrc: "/logos/google.svg",
    width: 136,
    height: 46,
    tone: "blue",
    alt: "Google official full-color logo",
  },
  {
    id: "aws",
    name: "Amazon Web Services (AWS)",
    category: "Cloud & Platforms",
    role: "Cloud Infrastructure & Platforms",
    logoSrc: "/logos/aws.svg",
    width: 68,
    height: 41,
    tone: "blue",
    alt: "Amazon Web Services (AWS) official logo",
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "Artificial Intelligence",
    role: "Frontier AI & Research",
    logoSrc: "/logos/openai.svg",
    width: 40,
    height: 40,
    tone: "pink",
    alt: "OpenAI official symbol and blossom mark",
  },
  {
    id: "tata",
    name: "TATA",
    category: "Global Enterprise",
    role: "Engineering & IT Services",
    logoSrc: "/logos/tata.svg",
    width: 105,
    height: 42,
    tone: "blue",
    alt: "Tata official blue logo and emblem",
  },
  {
    id: "infosys",
    name: "Infosys",
    category: "Digital Transformation",
    role: "Global IT & Consulting",
    logoSrc: "/logos/infosys.svg",
    width: 136,
    height: 58,
    tone: "blue",
    alt: "Infosys official cobalt blue wordmark",
  },
  {
    id: "accenture",
    name: "Accenture",
    category: "Consulting & Tech",
    role: "Enterprise Tech Strategy",
    logoSrc: "/logos/accenture.svg",
    width: 136,
    height: 38,
    tone: "pink",
    alt: "Accenture official wordmark and purple chevron",
  },
  {
    id: "mit-adt",
    name: "MIT ADT University",
    category: "Higher Education",
    role: "Design, Tech & Research",
    logoSrc: "/logos/mit-adt.png",
    width: 165,
    height: 52,
    tone: "blue",
    alt: "MIT ADT University official emblem and typography",
    needsLightPlate: true,
  },
];

function LogoCard({
  item,
  index,
}: {
  item: OrganizationItem;
  index: number;
}) {
  const [tilt, setTilt] = useState<{ x: number; y: number; px: number; py: number } | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced) return;
    if (e.pointerType === "touch") return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    // Subtle perspective tilt (max +-6.5 degrees)
    const rotateX = (0.5 - y) * 13;
    const rotateY = (x - 0.5) * 13;
    setTilt({
      x: rotateX,
      y: rotateY,
      px: Math.round(x * 100),
      py: Math.round(y * 100),
    });
  };

  const handlePointerLeave = () => {
    setTilt(null);
  };

  const isPink = item.tone === "pink";

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      tabIndex={0}
      role="article"
      aria-label={`${item.name} — ${item.category} (${item.role})`}
      style={{
        transform:
          tilt && !prefersReduced
            ? `perspective(800px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateY(-5px) scale(1.025)`
            : "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)",
        transition: tilt
          ? "transform 90ms ease-out"
          : "transform 450ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 450ms cubic-bezier(0.22, 1, 0.36, 1), border-color 450ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`group relative flex flex-col justify-between rounded-2xl p-4 sm:p-5 outline-none select-none min-h-[148px] sm:min-h-[156px] focus-visible:ring-2 ${
        isPink
          ? "focus-visible:ring-sb-pink hover:border-sb-pink/50 hover:shadow-[0_16px_36px_-10px_rgba(255,45,149,0.3)]"
          : "focus-visible:ring-sb-cyan hover:border-sb-cyan/50 hover:shadow-[0_16px_36px_-10px_rgba(25,184,230,0.3)]"
      } trust-glass-card`}
    >
      {/* Dynamic Cursor Specular Sheen */}
      {tilt && !prefersReduced && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-75 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 140px at ${tilt.px}% ${tilt.py}%, ${
              isPink ? "rgba(255, 45, 149, 0.16)" : "rgba(25, 184, 230, 0.16)"
            }, transparent 75%)`,
          }}
        />
      )}

      {/* Subtle Top Edge Highlight */}
      <div
        className={`pointer-events-none absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-14 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          isPink
            ? "bg-gradient-to-r from-transparent via-sb-pink to-transparent"
            : "bg-gradient-to-r from-transparent via-sb-cyan to-transparent"
        }`}
      />

      {/* Card Header: Category & Live Indicator */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-sb-muted transition-colors group-hover:text-sb-text light:text-[#596579] light:group-hover:text-[#202536]">
          {item.category}
        </span>
        <span
          className={`h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-125 ${
            isPink
              ? "bg-sb-pink shadow-[0_0_8px_1px_rgba(255,45,149,0.7)]"
              : "bg-sb-cyan shadow-[0_0_8px_1px_rgba(25,184,230,0.7)]"
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Logo Showcase Stage */}
      <div className="relative z-10 my-auto flex h-14 w-full items-center justify-center py-1">
        {item.id === "openai" ? (
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <svg
              viewBox="0 0 24 24"
              width={item.width}
              height={item.height}
              aria-label={item.alt}
              className="h-9 w-9 sm:h-10 sm:w-10 transition-colors duration-300 fill-current text-[#111111] dark:text-white light:text-[#111111] dark:text-white"
            >
              <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.5045 4.5045 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.0201-1.1685a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.401-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4593a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
            </svg>
          </div>
        ) : item.id === "aws" ? (
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <svg
              viewBox="0 24 129 78"
              width={item.width}
              height={item.height}
              aria-label={item.alt}
              className="h-8 sm:h-9 w-auto select-none"
            >
              {/* AWS Wordmark: crisp white in Dark Mode, Amazon squid ink (#232F3E) in Light Mode */}
              <path
                className="fill-current text-sb-text transition-colors duration-300"
                d="M36.379 53.64c0 1.56.168 2.825.465 3.75.336.926.758 1.938 1.347 3.032.207.336.293.672.293.969 0 .418-.254.84-.8 1.261l-2.653 1.77c-.379.25-.758.379-1.093.379-.422 0-.844-.211-1.266-.59a13.28 13.28 0 0 1-1.516-1.98 34.153 34.153 0 0 1-1.304-2.485c-3.282 3.875-7.41 5.813-12.38 5.813-3.535 0-6.355-1.012-8.421-3.032-2.063-2.023-3.114-4.718-3.114-8.086 0-3.578 1.262-6.484 3.833-8.671 2.566-2.192 5.976-3.286 10.316-3.286 1.43 0 2.902.125 4.46.336 1.56.211 3.161.547 4.845.926v-3.074c0-3.2-.676-5.43-1.98-6.734C26.061 32.633 23.788 32 20.546 32c-1.473 0-2.988.168-4.547.547a33.416 33.416 0 0 0-4.547 1.433c-.676.293-1.18.461-1.473.547-.296.082-.507.125-.675.125-.59 0-.883-.422-.883-1.304v-2.063c0-.676.082-1.18.293-1.476.21-.293.59-.586 1.18-.883 1.472-.758 3.242-1.39 5.304-1.895 2.063-.547 4.254-.8 6.57-.8 5.008 0 8.672 1.136 11.032 3.41 2.316 2.273 3.492 5.726 3.492 10.359v13.64Zm-17.094 6.403c1.387 0 2.82-.254 4.336-.758 1.516-.508 2.863-1.433 4-2.695.672-.8 1.18-1.684 1.43-2.695.254-1.012.422-2.23.422-3.665v-1.765a34.401 34.401 0 0 0-3.871-.719 31.816 31.816 0 0 0-3.961-.25c-2.82 0-4.883.547-6.274 1.684-1.387 1.136-2.062 2.734-2.062 4.84 0 1.98.504 3.453 1.558 4.464 1.012 1.051 2.485 1.559 4.422 1.559Zm33.809 4.547c-.758 0-1.262-.125-1.598-.422-.34-.254-.633-.84-.887-1.64L40.715 29.98c-.25-.843-.38-1.39-.38-1.687 0-.672.337-1.05 1.013-1.05h4.125c.8 0 1.347.124 1.644.421.336.25.59.84.84 1.64l7.074 27.876 6.57-27.875c.208-.84.462-1.39.797-1.64.34-.255.93-.423 1.688-.423h3.367c.8 0 1.348.125 1.684.422.336.25.633.84.8 1.64l6.653 28.212 7.285-28.211c.25-.84.547-1.39.84-1.64.336-.255.887-.423 1.644-.423h3.914c.676 0 1.055.336 1.055 1.051 0 .21-.043.422-.086.676-.043.254-.125.59-.293 1.05L80.801 62.57c-.254.84-.547 1.387-.887 1.64-.336.255-.883.423-1.598.423h-3.62c-.801 0-1.348-.13-1.684-.422-.34-.297-.633-.844-.801-1.684l-6.527-27.16-6.485 27.117c-.21.844-.46 1.391-.8 1.684-.337.297-.926.422-1.684.422Zm54.105 1.137c-2.187 0-4.379-.254-6.484-.758-2.106-.504-3.746-1.055-4.84-1.684-.676-.379-1.137-.8-1.305-1.18a2.919 2.919 0 0 1-.254-1.18v-2.148c0-.882.336-1.304.97-1.304.25 0 .503.043.757.129.25.082.629.25 1.05.418a23.102 23.102 0 0 0 4.634 1.476c1.683.336 3.324.504 5.011.504 2.653 0 4.715-.465 6.145-1.39 1.433-.926 2.191-2.274 2.191-4 0-1.18-.379-2.145-1.136-2.946-.758-.8-2.192-1.516-4.254-2.191l-6.106-1.895c-3.074-.969-5.348-2.398-6.734-4.293-1.39-1.855-2.106-3.918-2.106-6.105 0-1.77.38-3.328 1.137-4.676a10.829 10.829 0 0 1 3.031-3.453c1.262-.965 2.696-1.684 4.38-2.188 1.683-.504 3.452-.715 5.304-.715.926 0 1.894.043 2.82.168.969.125 1.852.293 2.738.461.84.211 1.641.422 2.399.676.758.254 1.348.504 1.77.758.59.336 1.011.672 1.261 1.05.254.34.379.802.379 1.391v1.98c0 .884-.336 1.348-.969 1.348-.336 0-.883-.171-1.597-.507-2.403-1.094-5.098-1.641-8.086-1.641-2.399 0-4.293.379-5.598 1.18-1.309.797-1.98 2.02-1.98 3.746 0 1.18.421 2.191 1.261 2.988.844.8 2.403 1.602 4.633 2.316l5.98 1.895c3.032.969 5.22 2.316 6.524 4.043 1.305 1.727 1.938 3.707 1.938 5.895 0 1.812-.38 3.453-1.094 4.882-.758 1.434-1.77 2.696-3.074 3.707-1.305 1.051-2.864 1.809-4.672 2.36-1.895.586-3.875.883-6.024.883Zm0 0"
              />
              {/* Amazon Official Orange Smile Arrow */}
              <path
                fill="#FF9900"
                d="M118 73.348c-4.432.063-9.664 1.052-13.621 3.832-1.223.883-1.012 2.062.336 1.894 4.508-.547 14.44-1.726 16.21.547 1.77 2.23-1.976 11.62-3.663 15.79-.504 1.26.59 1.769 1.726.8 7.41-6.231 9.348-19.242 7.832-21.137-.757-.925-4.388-1.79-8.82-1.726zM1.63 75.859c-.927.116-1.347 1.236-.368 2.121 16.508 14.902 38.359 23.872 62.613 23.872 17.305 0 37.43-5.43 51.281-15.66 2.273-1.688.297-4.254-2.02-3.204-15.534 6.57-32.421 9.77-47.788 9.77-22.778 0-44.8-6.273-62.653-16.633-.39-.231-.755-.304-1.064-.266z"
              />
            </svg>
          </div>
        ) : item.needsLightPlate ? (
          <div className="relative flex items-center justify-center rounded-xl px-2.5 py-1.5 transition-all duration-300 dark:bg-white/95 dark:shadow-[0_4px_16px_rgba(0,0,0,0.35)] light:bg-transparent">
            <Image
              src={item.logoSrc}
              alt={item.alt}
              width={item.width}
              height={item.height}
              className="max-h-9 sm:max-h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              priority={index < 3}
            />
          </div>
        ) : (
          <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105 text-neutral-800 dark:text-neutral-100">
            <Image
              src={item.logoSrc}
              alt={item.alt}
              width={item.width}
              height={item.height}
              className="max-h-9 sm:max-h-10 w-auto object-contain"
              priority={index < 3}
            />
          </div>
        )}
      </div>

      {/* Card Footer: Role / Focus */}
      <div className="relative z-10 w-full text-center border-t border-white/5 pt-2 light:border-[#E5E7EF]">
        <p className="truncate text-[11px] font-medium text-sb-muted transition-colors group-hover:text-sb-text light:text-[#596579] light:group-hover:text-[#202536]">
          {item.role}
        </p>
      </div>
    </div>
  );
}

export default function TrustStrip() {
  const { ref, inView } = useInView({ threshold: 0.1 });

  return (
    <section
      ref={ref}
      aria-label="Connected Organizations & Institutions"
      className="relative mx-auto max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-sb-blue/10 blur-[110px] light:bg-[#EEF5FB] light:opacity-80" />
      <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-sb-pink/8 blur-[110px] light:bg-[#FDF1F6] light:opacity-75" />

      {/* Section Header */}
      <div
        className={`relative z-10 mx-auto max-w-3xl text-center transition-all duration-700 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-sb-blue/30 bg-sb-blue/10 px-3.5 py-1 text-xs font-semibold text-sb-cyan light:border-[#007BA7]/25 light:bg-[#EEF5FB] light:text-[#007BA7]">
          <Building2 size={13} aria-hidden="true" />
          <span>COMPANIES &amp; INSTITUTIONS</span>
        </span>
        <h2 className="mt-3.5 text-2xl font-bold tracking-tight sm:text-3xl lg:text-[2rem] text-sb-text">
          Organizations in the SkillBridge Ecosystem
        </h2>
        <p className="mt-2.5 text-sm sm:text-base text-sb-muted max-w-2xl mx-auto leading-relaxed">
          Bridging learners, research labs, and recruiting teams across world-class technology enterprises and accredited higher education institutions.
        </p>
      </div>

      {/* 7-Card Responsive Grid */}
      <div
        className={`relative z-10 mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-7 transition-all duration-700 delay-150 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {ORGANIZATIONS.map((org, idx) => (
          <LogoCard key={org.id} item={org} index={idx} />
        ))}
      </div>

      {/* Supporting Network Metadata Bar */}
      <div className="relative z-10 mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-sb-muted sm:flex-row light:border-[#E5E7EF] light:text-[#596579]">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-sb-cyan flex-none" aria-hidden="true" />
          <span>Verified talent pathways connecting university cohorts with hiring pipelines</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sb-cyan" aria-hidden="true" />
            Accredited Universities
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sb-pink" aria-hidden="true" />
            Industry Hiring Networks
          </span>
        </div>
      </div>
    </section>
  );
}
