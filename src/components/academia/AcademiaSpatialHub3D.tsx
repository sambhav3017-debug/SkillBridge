"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Award,
  Compass,
  Cpu,
  Layers,
  TrendingUp,
} from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";
import { useTheme } from "@/components/theme/ThemeProvider";

interface AcademiaSpatialHub3DProps {
  placementRate?: number;
  totalStudents?: number;
  topSkills?: Array<{ name: string; count: number; pct: number; color: string }>;
  activePartnersCount?: number;
  className?: string;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const c = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Procedural anchor shadow texture for 3D grounding
 */
function createRadialShadowTexture(isLight: boolean): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.44;

  ctx.clearRect(0, 0, size, size);
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  if (isLight) {
    grad.addColorStop(0, "rgba(30, 58, 138, 0.28)");
    grad.addColorStop(0.35, "rgba(0, 123, 167, 0.12)");
    grad.addColorStop(0.7, "rgba(79, 70, 229, 0.04)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    grad.addColorStop(0, "rgba(0, 0, 0, 0.75)");
    grad.addColorStop(0.35, "rgba(10, 16, 32, 0.45)");
    grad.addColorStop(0.7, "rgba(0, 123, 167, 0.12)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates glowing particle sprite texture for constellation stars
 */
function createStarParticleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size / 2);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.25, "rgba(56, 189, 248, 0.85)");
  grad.addColorStop(0.6, "rgba(79, 70, 229, 0.35)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

export default function AcademiaSpatialHub3D({
  placementRate = 84,
  totalStudents = 120,
  topSkills = [
    { name: "React", count: 78, pct: 28, color: "#007ba7" },
    { name: "Python", count: 65, pct: 23, color: "#4f46e5" },
    { name: "Cloud & DevOps", count: 52, pct: 19, color: "#10b981" },
    { name: "AI / ML", count: 48, pct: 17, color: "#7c3aed" },
    { name: "UI/UX", count: 36, pct: 13, color: "#f59e0b" },
  ],
  activePartnersCount = 18,
  className = "",
}: AcademiaSpatialHub3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [activeMode, setActiveMode] = useState<"galaxy" | "velocity">("galaxy");
  const [activeSkillHover, setActiveSkillHover] = useState<string | null>(null);

  const [hasWebGL] = useState(() => checkWebGLSupport());
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || prefersReduced || !hasWebGL) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    // 1. Scene, Camera, and High-Performance Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.5, 4.4);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.2 : 1.35;

    // 2. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(
      isLight ? 0xf0f4ff : 0x0f172a,
      isLight ? 1.5 : 1.1
    );
    scene.add(ambientLight);

    // Key Light (Royal Indigo Warm Highlight)
    const keyLight = new THREE.DirectionalLight(
      isLight ? 0xffffff : 0x818cf8,
      isLight ? 2.5 : 2.8
    );
    keyLight.position.set(2, 4, 3);
    scene.add(keyLight);

    // Cerulean Blue fill light (Left rim)
    const cyanLight = new THREE.PointLight(0x007ba7, isLight ? 3.0 : 4.2, 10);
    cyanLight.position.set(-3, 1, 2);
    scene.add(cyanLight);

    // Electric Violet bounce light (Right rim)
    const violetLight = new THREE.PointLight(0x7c3aed, isLight ? 2.6 : 3.8, 10);
    violetLight.position.set(3, -1, 1.5);
    scene.add(violetLight);

    // Top subtle specular rim
    const topRim = new THREE.PointLight(0xffd700, isLight ? 0.8 : 1.4, 6);
    topRim.position.set(0, 2.5, 0.5);
    scene.add(topRim);

    // 3. Master Interactive Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 4. Ground Anchor Shadow
    const shadowTex = createRadialShadowTexture(isLight);
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: isLight ? 0.7 : 0.85,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -1.2, 0);
    masterGroup.add(shadowMesh);

    // 5. Central Faceted Crystalline Knowledge Core (Icosahedron)
    const coreGroup = new THREE.Group();
    masterGroup.add(coreGroup);

    // Outer Faceted Glass Shell
    const coreGeo = new THREE.IcosahedronGeometry(0.72, 1);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0x1e3a8a : 0x38bdf8,
      roughness: 0.12,
      metalness: 0.35,
      transmission: isLight ? 0.65 : 0.78,
      opacity: 0.95,
      ior: 1.55,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      emissive: isLight ? 0x007ba7 : 0x4f46e5,
      emissiveIntensity: isLight ? 0.28 : 0.65,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner Glowing Nucleus Sphere
    const nucleusGeo = new THREE.SphereGeometry(0.42, 24, 24);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: isLight ? 0x007ba7 : 0x06b6d4,
      emissiveIntensity: isLight ? 1.2 : 2.0,
      roughness: 0.2,
      metalness: 0.8,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    coreGroup.add(nucleusMesh);

    // Outer Holographic Wireframe Cage
    const wireGeo = new THREE.IcosahedronGeometry(0.76, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x007ba7 : 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.35 : 0.55,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    coreGroup.add(wireMesh);

    // 6. Multi-tier Orbital Rings (Curriculum, Placement Velocity, Corporate MoUs)
    const ringsGroup = new THREE.Group();
    masterGroup.add(ringsGroup);

    // Orbit Ring 1: Primary Curricular Ring (Inclined Plane X)
    const ring1Geo = new THREE.TorusGeometry(1.25, 0.016, 16, 80);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x007ba7,
      emissive: 0x007ba7,
      emissiveIntensity: isLight ? 0.6 : 1.2,
      roughness: 0.25,
      metalness: 0.85,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ringsGroup.add(ring1);

    // Orbit Ring 2: Placement Velocity Orbit (Inclined Plane Y)
    const ring2Geo = new THREE.TorusGeometry(1.55, 0.014, 16, 80);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      emissive: 0x7c3aed,
      emissiveIntensity: isLight ? 0.7 : 1.4,
      roughness: 0.2,
      metalness: 0.85,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    ringsGroup.add(ring2);

    // Orbit Ring 3: Corporate Accreditation Orbit
    const ring3Geo = new THREE.TorusGeometry(1.85, 0.011, 16, 80);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x059669,
      emissiveIntensity: isLight ? 0.5 : 1.0,
      roughness: 0.25,
      metalness: 0.8,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.z = Math.PI / 5;
    ringsGroup.add(ring3);

    // 7. Interactive Skill & Milestone Satellites
    const satellitesGroup = new THREE.Group();
    masterGroup.add(satellitesGroup);

    const satelliteMeshes: THREE.Mesh[] = [];
    const colors = [0x007ba7, 0x4f46e5, 0x10b981, 0x7c3aed, 0xf59e0b];

    topSkills.slice(0, 5).forEach((skill, idx) => {
      const satGeo = new THREE.SphereGeometry(0.11, 16, 16);
      const satMat = new THREE.MeshStandardMaterial({
        color: colors[idx % colors.length],
        emissive: colors[idx % colors.length],
        emissiveIntensity: isLight ? 0.9 : 1.6,
        roughness: 0.2,
        metalness: 0.6,
      });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      satelliteMeshes.push(satMesh);
      satellitesGroup.add(satMesh);
    });

    // 8. Constellation Particle Field
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 1.0 + Math.random() * 1.4;

      particlePositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = rad * Math.cos(phi);
    }
    particleGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );

    const starTex = createStarParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      map: starTex,
      transparent: true,
      opacity: isLight ? 0.65 : 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particleSystem);

    // 9. Mouse Pointer Tracking
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mousePosRef.current.targetX = nx * 0.9;
      mousePosRef.current.targetY = ny * 0.7;
    };

    const handlePointerEnter = () => {
      isHoveredRef.current = true;
    };

    const handlePointerLeave = () => {
      isHoveredRef.current = false;
      mousePosRef.current.targetX = 0;
      mousePosRef.current.targetY = 0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);

    // 10. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth mouse interpolation
      mousePosRef.current.x +=
        (mousePosRef.current.targetX - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y +=
        (mousePosRef.current.targetY - mousePosRef.current.y) * 0.08;

      // Base rotation speed (accelerates when hovered)
      const speedMult = isHoveredRef.current ? 1.6 : 1.0;

      // Master tilt
      masterGroup.rotation.y =
        elapsed * 0.25 * speedMult + mousePosRef.current.x;
      masterGroup.rotation.x =
        mousePosRef.current.y + Math.sin(elapsed * 0.8) * 0.04;

      // Core pulsating breathing
      const pulseScale = 1.0 + Math.sin(elapsed * 2.2) * 0.035;
      coreGroup.scale.set(pulseScale, pulseScale, pulseScale);
      coreGroup.rotation.y -= delta * 0.4 * speedMult;
      coreGroup.rotation.z += delta * 0.2 * speedMult;

      // Ring rotations on their local planes
      ring1.rotation.z += delta * 0.3 * speedMult;
      ring2.rotation.z -= delta * 0.22 * speedMult;
      ring3.rotation.z += delta * 0.16 * speedMult;

      // Animate orbiting skill satellites along ring trajectories
      satelliteMeshes.forEach((mesh, idx) => {
        const angle = elapsed * (0.6 + idx * 0.12) * speedMult + idx * 1.25;
        const orbitRadius = 1.35 + (idx % 2) * 0.35;
        const yOffset = Math.sin(angle * 1.5) * 0.28;
        mesh.position.set(
          Math.cos(angle) * orbitRadius,
          yOffset,
          Math.sin(angle) * orbitRadius
        );
      });

      // Drifting particle cloud
      particleSystem.rotation.y += delta * 0.08;
      particleSystem.rotation.x += delta * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      resizeObs.disconnect();
      renderer.dispose();
    };
  }, [isLight, prefersReduced, hasWebGL, topSkills]);

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E3E3E3] dark:border-[var(--glass-border)] bg-gradient-to-br from-white/90 via-white/50 to-white/80 dark:from-[#0f172a]/80 dark:via-[#1e1b4b]/30 dark:to-[#0f172a]/90 backdrop-blur-xl p-4 transition-all duration-300 hover:shadow-xl hover:border-[#007ba7]/40 dark:hover:border-sb-cyan/40 ${className}`}
    >
      {/* 3D Specular Top Bevel */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20 select-none"
        aria-hidden="true"
      />

      {/* Header with Mode Toggle */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-[#E3E3E3] dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#007ba7]/10 dark:bg-sb-cyan/15 text-[#007ba7] dark:text-sb-cyan">
            <Cpu size={15} />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-white flex items-center gap-1.5">
              Spatial Intelligence Core
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                3D Live
              </span>
            </h3>
            <p className="text-[10px] text-sb-muted light:text-[#686868]">
              Interactive curriculum &amp; placement topology
            </p>
          </div>
        </div>

        {/* Mode Pill Switcher */}
        <div className="flex items-center rounded-lg border border-[#E3E3E3] dark:border-white/10 bg-white/70 dark:bg-white/[0.04] p-0.5 text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setActiveMode("galaxy")}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition-all ${
              activeMode === "galaxy"
                ? "bg-[#007ba7] dark:bg-sb-cyan text-white dark:text-[#0B101D] font-bold shadow-xs"
                : "text-sb-muted hover:text-[var(--color-text)]"
            }`}
          >
            <Compass size={11} />
            <span>Galaxy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("velocity")}
            className={`flex items-center gap-1 rounded-md px-2 py-0.5 transition-all ${
              activeMode === "velocity"
                ? "bg-[#4F46E5] dark:bg-indigo-400 text-white dark:text-[#0B101D] font-bold shadow-xs"
                : "text-sb-muted hover:text-[var(--color-text)]"
            }`}
          >
            <TrendingUp size={11} />
            <span>Velocity</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div className="relative my-2 flex h-52 w-full items-center justify-center select-none">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab active:cursor-grabbing outline-none"
          aria-label="3D Academic Knowledge & Placement Spatial Visualization"
        />

        {/* Floating Dimensional Metric Badges */}
        <div className="pointer-events-none absolute left-2 top-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 rounded-lg border border-white/60 dark:border-white/10 bg-white/80 dark:bg-black/60 px-2 py-1 text-[10px] font-bold text-[#171717] dark:text-white backdrop-blur-md shadow-xs transition-transform duration-300 group-hover:scale-105">
            <span className="h-2 w-2 rounded-full bg-[#007ba7] dark:bg-sb-cyan animate-ping" />
            <span>{placementRate}% Placement Velocity ({totalStudents} Enrolled)</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-white/60 dark:border-white/10 bg-white/80 dark:bg-black/60 px-2 py-1 text-[10px] font-medium text-sb-muted dark:text-white/80 backdrop-blur-md shadow-xs">
            <Award size={11} className="text-amber-500" />
            <span>NAAC A++ Benchmark</span>
          </div>
        </div>

        {/* Bottom Right Floating Badge */}
        <div className="pointer-events-none absolute right-2 bottom-2 flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 rounded-lg border border-[#4F46E5]/30 bg-[#4F46E5]/10 dark:bg-indigo-950/40 px-2 py-1 text-[10px] font-semibold text-[#4F46E5] dark:text-indigo-300 backdrop-blur-md shadow-xs">
            <Layers size={10} />
            <span>{activePartnersCount} Active Corporate MoUs</span>
          </div>
        </div>
      </div>

      {/* Interactive Legend / Skill Satellites List */}
      <div className="relative z-10 border-t border-[#E3E3E3] dark:border-white/10 pt-2.5">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-semibold text-sb-muted light:text-[#686868]">
            {activeMode === "galaxy" ? "Verified Competency Satellites" : "Recruitment Conversion Nodes"}
          </span>
          <span className="text-[10px] text-[#007ba7] dark:text-sb-cyan font-bold">
            Interactive Parallax
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {topSkills.slice(0, 4).map((skill) => (
            <span
              key={skill.name}
              onMouseEnter={() => setActiveSkillHover(skill.name)}
              onMouseLeave={() => setActiveSkillHover(null)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all cursor-pointer ${
                activeSkillHover === skill.name
                  ? "scale-105 border border-[#007ba7] bg-[#007ba7]/15 text-[#007ba7] dark:text-sb-cyan"
                  : "border border-[#E3E3E3] dark:border-white/10 bg-white/70 dark:bg-white/[0.03] text-[var(--color-text)]"
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: skill.color }}
              />
              <span>{skill.name}</span>
              <span className="text-sb-muted font-normal">({skill.pct}%)</span>
            </span>
          ))}
          <span className="text-[10px] text-sb-muted px-1">
            +{topSkills.length > 4 ? topSkills.length - 4 : 0} more
          </span>
        </div>
      </div>
    </div>
  );
}
