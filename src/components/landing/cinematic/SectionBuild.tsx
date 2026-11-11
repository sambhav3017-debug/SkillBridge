"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Terminal,
  Play,
  GitCommit,
  ShieldCheck,
} from "lucide-react";
import ScrollSection from "./ScrollSection";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type TrackKey = "web" | "ai" | "cloud";

interface ProjectTrack {
  id: TrackKey;
  label: string;
  repo: string;
  branch: string;
  title: string;
  summary: string;
  architectureNodes: { name: string; type: string; status: "synced" | "active" }[];
  codeSnippet: string;
  testsPassed: number;
  totalTests: number;
  coverage: string;
}

const TRACKS: Record<TrackKey, ProjectTrack> = {
  web: {
    id: "web",
    label: "Full-Stack Web",
    repo: "skillbridge-portal-core",
    branch: "main",
    title: "Distributed Enterprise Exchange",
    summary:
      "A high-throughput talent-matching engine built with Next.js App Router, real-time WebSocket pipelines, and role-based cryptographic verification.",
    architectureNodes: [
      { name: "Client Mesh", type: "React 19 / Tailwind", status: "synced" },
      { name: "Edge Gateway", type: "Next.js Route Handlers", status: "active" },
      { name: "Relational Store", type: "PostgreSQL & Prisma", status: "synced" },
    ],
    codeSnippet: `// Cryptographic Skill Verification Node
export async function verifySkillCommit(token: string) {
  const proof = await verifyCredentialProof(token);
  return {
    verified: proof.isValid,
    score: proof.competencyScore, // 94% Verified
    signature: proof.issuerSignature,
  };
}`,
    testsPassed: 32,
    totalTests: 32,
    coverage: "98.4%",
  },
  ai: {
    id: "ai",
    label: "AI & Data Intelligence",
    repo: "skill-graph-inference",
    branch: "release/v2",
    title: "Autonomous Skill Graph & RAG Evaluator",
    summary:
      "Vector-indexed semantic matching pipeline extracting verified technical aptitudes from student commit histories and research papers.",
    architectureNodes: [
      { name: "Vector Index", type: "ChromaDB / Embeddings", status: "synced" },
      { name: "Inference Engine", type: "Gemini 2.5 Flash / Reasoning", status: "active" },
      { name: "Telemetry Feed", type: "Stream Pipeline", status: "synced" },
    ],
    codeSnippet: `// Semantic Capability Evaluation Pipeline
export async function scoreCandidateAptitude(repo: RepoMetrics) {
  const analysis = await gemini.models.generateContent({
    model: 'gemini-2.5-flash',
    prompt: formatDiagnosticPrompt(repo),
  });
  return parseSkillManifest(analysis.text);
}`,
    testsPassed: 48,
    totalTests: 48,
    coverage: "96.8%",
  },
  cloud: {
    id: "cloud",
    label: "Cloud & DevOps",
    repo: "infra-orchestrator-k8s",
    branch: "production",
    title: "Zero-Downtime Microservices Mesh",
    summary:
      "Automated infrastructure with Kubernetes manifests, ephemeral sandbox environments for applicant code challenges, and TLS mutual auth.",
    architectureNodes: [
      { name: "Cluster Plane", type: "Kubernetes / GKE", status: "synced" },
      { name: "CI/CD Pipeline", type: "GitHub Actions Matrix", status: "active" },
      { name: "Observability", type: "Prometheus & OpenTelemetry", status: "synced" },
    ],
    codeSnippet: `// Ephemeral Sandbox Lifecycle Provisioner
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sandbox-candidate-runner
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: runner
          image: skillbridge/sandbox:latest`,
    testsPassed: 28,
    totalTests: 28,
    coverage: "99.1%",
  },
};

export default function SectionBuild() {
  const [selectedTrack, setSelectedTrack] = useState<TrackKey>("ai");
  const [hoveredId, setHoveredId] = useState<TrackKey | null>(null);

  const trackNavRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Map<TrackKey, HTMLButtonElement>>(new Map());

  const [pillState, setPillState] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
    isHover: boolean;
    targetId: TrackKey;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
    isHover: false,
    targetId: "ai",
  });

  // Calculate pixel-accurate position of target button inside the track container
  const movePillTo = useCallback((id: TrackKey, isHover = false) => {
    const navEl = trackNavRef.current;
    const itemEl = itemRefs.current.get(id);
    if (!navEl || !itemEl) return;

    const navRect = navEl.getBoundingClientRect();
    const itemRect = itemEl.getBoundingClientRect();

    setPillState({
      left: Math.round(itemRect.left - navRect.left),
      top: Math.round(itemRect.top - navRect.top),
      width: Math.round(itemRect.width),
      height: Math.round(itemRect.height),
      opacity: 1,
      isHover,
      targetId: id,
    });
  }, []);

  // Update pill position when active track changes (only if user is not currently hovering)
  useEffect(() => {
    if (!hoveredId) {
      movePillTo(selectedTrack, false);
    }
  }, [selectedTrack, hoveredId, movePillTo]);

  // Initial layout measurement & font load synchronization
  useEffect(() => {
    const t1 = setTimeout(() => movePillTo(selectedTrack, false), 40);
    const t2 = setTimeout(() => movePillTo(selectedTrack, false), 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [selectedTrack, movePillTo]);

  // Re-align indicator on window resize or container resize
  useEffect(() => {
    const navEl = trackNavRef.current;
    if (!navEl) return;

    const onResize = () => {
      const target = hoveredId || selectedTrack;
      movePillTo(target, Boolean(hoveredId));
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(navEl);
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [selectedTrack, hoveredId, movePillTo]);

  const track = TRACKS[selectedTrack];
  const { t } = useLanguage();

  return (
    <ScrollSection id="skills" className="py-24 sm:py-32 lg:py-36 bg-neutral-100/40 dark:bg-[#080808]">
      {({ inView }) => (
        <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-12">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <h2
              className={`scroll-reveal scroll-delay-1 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#161B2E] dark:text-[#CDCBCA] ${
                inView ? "is-in-view" : ""
              }`}
            >
              {t.skills.title}{" "}
              <span className="font-editorial text-transparent bg-clip-text bg-gradient-to-r from-[#D81B7A] via-[#743BFF] to-[#007BA7] dark:from-[#FF2D95] dark:via-[#B57CFF] dark:to-[#19B8E6]">
                {t.skills.titleAccent}
              </span>
            </h2>

            <p
              className={`scroll-reveal scroll-delay-2 mt-4 sm:mt-5 text-base sm:text-lg leading-relaxed text-[#434D62] dark:text-[#8E8C8B] ${
                inView ? "is-in-view" : ""
              }`}
            >
              {t.skills.subtitle}
            </p>

            {/* Track Switcher with SkillBridge Top Navigation Sliding Liquid Glass System */}
            <div className="w-full flex justify-center overflow-x-auto scrollbar-none px-2">
              <div
                ref={trackNavRef}
                onPointerLeave={() => {
                  setHoveredId(null);
                  movePillTo(selectedTrack, false);
                }}
                className={`floating-glass-navbar is-top relative mt-8 inline-flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl max-w-full overflow-x-auto scrollbar-none transition-all duration-700 delay-300 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
              >
                {/* The Single Continuous Sliding Glass Indicator */}
                <div
                  className={`sliding-glass-pill pointer-events-none absolute left-0 top-0 rounded-xl transition-all ${
                    pillState.isHover ? "is-hovered" : "is-active"
                  }`}
                  style={{
                    transform: `translate3d(${pillState.left}px, ${pillState.top}px, 0)`,
                    width: `${pillState.width}px`,
                    height: `${pillState.height}px`,
                    opacity: pillState.opacity,
                  }}
                  aria-hidden="true"
                />

                {/* Individual Navigation Item Buttons */}
                {(Object.keys(TRACKS) as TrackKey[]).map((key) => {
                  const isSelected = selectedTrack === key;
                  const isHovered = hoveredId === key;
                  return (
                    <button
                      key={key}
                      ref={(el) => {
                        if (el) itemRefs.current.set(key, el);
                        else itemRefs.current.delete(key);
                      }}
                      type="button"
                      id={`track-btn-${key}`}
                      onPointerEnter={() => {
                        setHoveredId(key);
                        movePillTo(key, true);
                      }}
                      onFocus={() => {
                        setHoveredId(key);
                        movePillTo(key, true);
                      }}
                      onBlur={(e) => {
                        if (trackNavRef.current && !trackNavRef.current.contains(e.relatedTarget as Node)) {
                          setHoveredId(null);
                          movePillTo(selectedTrack, false);
                        }
                      }}
                      onClick={() => {
                        setSelectedTrack(key);
                        setHoveredId(null);
                        movePillTo(key, false);
                      }}
                      aria-pressed={isSelected}
                      className={`nav-item-link relative z-10 rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap outline-none select-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-white/20 ${
                        isSelected
                          ? "text-slate-900 font-semibold dark:text-white"
                          : isHovered
                          ? "text-slate-800 font-medium dark:text-[#CDCBCA]"
                          : "text-slate-500 hover:text-slate-900 dark:text-[#8E8C8B] dark:hover:text-[#CDCBCA]"
                      }`}
                    >
                      <span className="relative z-10">{TRACKS[key].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3D Assembling Interactive Workbench Stage */}
          <div
            className={`mt-14 sm:mt-18 lg:mt-20 transition-all duration-1000 delay-300 ${
              inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative mx-auto max-w-[1240px] rounded-3xl border border-neutral-200/80 bg-white/70 p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl dark:border-[rgba(205,203,202,0.12)] dark:bg-[#0D0D0D]">
              {/* Workspace Top Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/60 pb-5 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-400/80" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                    <span className="h-3 w-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="h-4 w-[1px] bg-neutral-200 dark:bg-white/10" />
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    <GitCommit className="h-3.5 w-3.5 text-pink-500" />
                    <span className="font-semibold text-[#161B2E] dark:text-white">{track.repo}</span>
                    <span className="opacity-50">/</span>
                    <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[0.68rem] dark:bg-white/5">
                      {track.branch}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Workbench Body: 2-Column Split View */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Left Column: Architecture Blocks & Connected Conduits (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#161B2E] dark:text-white">
                      {track.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-[#596579] dark:text-neutral-300">
                      {track.summary}
                    </p>
                  </div>

                  {/* Assembled Modular Components Stack */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-[#778195] dark:text-neutral-400">
                      Integrated Architecture Nodes
                    </div>
                    {track.architectureNodes.map((node, i) => (
                      <div
                        key={node.name}
                        className="group flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 transition-all duration-300 hover:border-pink-500/30 hover:bg-white dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-pink-500/30 dark:hover:bg-white/[0.05]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-pink-500/10 text-pink-500 text-xs font-mono font-bold">
                            0{i + 1}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-[#161B2E] dark:text-white">
                              {node.name}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-neutral-400">
                              {node.type}
                            </div>
                          </div>
                        </div>
                        <span className="flex items-center gap-1.5 text-[0.72rem] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>{node.status}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Real-time Project Progress Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 rounded-2xl border border-neutral-200/70 bg-neutral-50/50 p-3.5 sm:p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
                      <div className="text-[0.68rem] text-neutral-500 dark:text-neutral-400">Test Harness</div>
                      <div className="font-mono text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 sm:mt-1">
                        {track.testsPassed}/{track.totalTests} Pass
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
                      <div className="text-[0.68rem] text-neutral-500 dark:text-neutral-400">Code Coverage</div>
                      <div className="font-mono text-sm sm:text-base font-bold text-[#007BA7] dark:text-[#19B8E6] sm:mt-1">
                        {track.coverage}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start">
                      <div className="text-[0.68rem] text-neutral-500 dark:text-neutral-400">Faculty Review</div>
                      <div className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 sm:mt-1">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Signed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Code Editor & Testing Terminal (7 cols) */}
                <div className="lg:col-span-7 flex flex-col rounded-2xl border border-neutral-200/80 bg-[#0F1420] text-neutral-100 shadow-inner overflow-hidden">
                  {/* Editor Header Bar */}
                  <div className="flex items-center justify-between border-b border-white/10 bg-[#161D2E] px-4 py-2.5 text-xs text-neutral-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <Terminal className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                      <span className="font-mono text-white truncate">VerificationHarness.ts</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[0.7rem] text-emerald-300">Live Workspace</span>
                    </div>
                  </div>

                  {/* Syntax Highlighted Code Box */}
                  <div className="relative p-3.5 sm:p-5 font-mono text-[0.72rem] sm:text-xs leading-relaxed overflow-x-auto text-blue-200 max-w-full">
                    <pre className="text-neutral-300 overflow-x-auto max-w-full">
                      <code>{track.codeSnippet}</code>
                    </pre>

                    {/* Ambient Code Glow */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-2 right-4 h-24 w-48 rounded-full bg-pink-500/10 blur-2xl"
                    />
                  </div>

                  {/* Terminal Execution Output Footer */}
                  <div className="mt-auto border-t border-white/10 bg-[#0A0D15] p-4 font-mono text-xs">
                    <div className="flex items-center justify-between text-neutral-400 text-[0.7rem]">
                      <div className="flex items-center gap-2">
                        <Play className="h-3 w-3 text-emerald-400 fill-emerald-400" />
                        <span>Automated Test Runner Output</span>
                      </div>
                      <span className="text-neutral-500">Execution: 142ms</span>
                    </div>
                    <div className="mt-2 space-y-1 text-[0.72rem]">
                      <div className="text-emerald-400">✓ Unit tests completed with 0 errors</div>
                      <div className="text-cyan-400">✓ Architecture constraints validated against industry profile</div>
                      <div className="text-neutral-400">→ Skill Signature successfully committed to profile graph</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="mt-8 flex flex-wrap items-center justify-end gap-4 border-t border-neutral-200/60 pt-6 dark:border-white/10">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/student/projects"
                    className="btn btn-primary group px-5 py-2.5 text-sm font-medium"
                  >
                    <span>Explore Capstones</span>
                    <ArrowRight size={16} className="transition-transform duration-150 group-hover:translate-x-0.5 text-current" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/student/skills"
                    className="btn btn-glass group px-5 py-2.5 text-sm font-medium"
                  >
                    <span>View Roadmaps</span>
                    <Compass size={16} className="text-slate-400 group-hover:text-slate-200 transition-colors" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ScrollSection>
  );
}
