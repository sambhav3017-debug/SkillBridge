"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";
import { useTheme } from "@/components/theme/ThemeProvider";

interface IndustryEmblem3DProps {
  className?: string;
  size?: number;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const testCanvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * Creates a soft radial shadow canvas texture to ground the 3D industry emblem.
 */
function createEmblemShadowTexture(isLight: boolean): THREE.CanvasTexture {
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
    grad.addColorStop(0, "rgba(15, 23, 42, 0.35)");
    grad.addColorStop(0.35, "rgba(99, 102, 241, 0.15)");
    grad.addColorStop(0.7, "rgba(6, 182, 212, 0.04)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    grad.addColorStop(0, "rgba(0, 0, 0, 0.75)");
    grad.addColorStop(0.35, "rgba(11, 16, 29, 0.45)");
    grad.addColorStop(0.7, "rgba(99, 102, 241, 0.12)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates high-energy particle sprite texture for innovation sparks.
 */
function createSparkParticleTexture(): THREE.CanvasTexture {
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
  grad.addColorStop(0.25, "rgba(6, 182, 212, 0.85)");
  grad.addColorStop(0.6, "rgba(99, 102, 241, 0.4)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Premium 3D Industry Emblem (Accenture-inspired Digital Elegance)
 * 
 * Features:
 * - Geometric Innovation Nexus: Precision faceted crystalline polyhedron embodying forward momentum.
 * - Titanium & Chrome Gyroscopic Orbit Rings: Interlocking chamfered metallic rings representing industry & talent alignment.
 * - Glowing Inner Intelligence Nucleus: Pulsing electric violet and cyber cyan plasma core.
 * - Forward Chevron Accents: Subtle faceted directional chevrons symbolizing growth and career progression.
 * - Calibrated PBR Studio Lighting: 4-point directional and rim lighting rig adapting dynamically to Light & Dark modes.
 * - Cursor Parallax Synchronization: Natural mouse-following physics with smooth harmonic oscillation.
 */
export default function IndustryEmblem3D({
  className = "",
  size = 210,
}: IndustryEmblem3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [hasWebGL] = useState(() => checkWebGLSupport());
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isHoveredRef = useRef(false);

  useEffect(() => {
    if (!hasWebGL) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isLight ? 1.25 : 1.35;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
    camera.position.set(0, 0.2, 7.0);
    camera.lookAt(0, 0, 0);

    // Root Master Group
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Studio Lighting System (Accenture-inspired Electric Violet & Cyber Cyan Rig)
    const ambientLight = new THREE.AmbientLight(
      isLight ? 0xffffff : 0x0f172a,
      isLight ? 1.6 : 1.2
    );
    scene.add(ambientLight);

    // Key Light: Crisp Titanium White
    const keyLight = new THREE.DirectionalLight(
      isLight ? 0xfffcf5 : 0xe0e7ff,
      isLight ? 2.8 : 3.0
    );
    keyLight.position.set(4, 5, 5);
    scene.add(keyLight);

    // Rim Light 1: Electric Violet (Top-Left)
    const violetLight = new THREE.PointLight(0x7c3aed, isLight ? 3.2 : 4.5, 14);
    violetLight.position.set(-4, 3, 3);
    scene.add(violetLight);

    // Rim Light 2: Cyber Cyan (Bottom-Right)
    const cyanLight = new THREE.PointLight(0x06b6d4, isLight ? 3.0 : 4.2, 14);
    cyanLight.position.set(4, -3, 3);
    scene.add(cyanLight);

    // Front soft camera fill
    const frontLight = new THREE.PointLight(0xffffff, isLight ? 1.2 : 1.5, 10);
    frontLight.position.set(0, 0, 5);
    scene.add(frontLight);

    // 2. Ground Anchor Shadow
    const shadowTex = createEmblemShadowTexture(isLight);
    const shadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: isLight ? 0.7 : 0.85,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -2.35;
    shadowMesh.rotation.x = -Math.PI / 2.2;
    masterGroup.add(shadowMesh);

    // 3. Central Faceted Crystal Nexus (Octahedral / Icosahedral Hybrid)
    const emblemCoreGroup = new THREE.Group();
    masterGroup.add(emblemCoreGroup);

    // Outer Faceted Crystal Prism (Diamond-cut Precision Shell)
    const crystalGeo = new THREE.OctahedronGeometry(1.35, 1);
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0xffffff : 0x1e1b4b,
      metalness: isLight ? 0.25 : 0.45,
      roughness: 0.1,
      transmission: isLight ? 0.72 : 0.65,
      opacity: 0.95,
      ior: 1.62,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      emissive: isLight ? 0x4f46e5 : 0x6366f1,
      emissiveIntensity: isLight ? 0.35 : 0.75,
      reflectivity: 0.9,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    emblemCoreGroup.add(crystalMesh);

    // Inner Glowing Intelligence Nucleus Sphere
    const nucleusGeo = new THREE.SphereGeometry(0.68, 32, 32);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: isLight ? 0x06b6d4 : 0x38bdf8,
      emissiveIntensity: isLight ? 1.4 : 2.2,
      roughness: 0.18,
      metalness: 0.85,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    emblemCoreGroup.add(nucleusMesh);

    // Outer Precision Wireframe Hologram Cage
    const wireGeo = new THREE.OctahedronGeometry(1.42, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: isLight ? 0x4f46e5 : 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: isLight ? 0.45 : 0.65,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    emblemCoreGroup.add(wireMesh);

    // 4. Interlocking Gyroscope Precision Rings (Titanium Chrome & Electric Violet)
    const gyroGroup = new THREE.Group();
    masterGroup.add(gyroGroup);

    // Ring 1: Primary Titanium Platinum Ring (Inclined Plane X)
    const ring1Geo = new THREE.TorusGeometry(1.85, 0.045, 16, 96);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(isLight ? 0xd1d5db : 0xe2e8f0),
      metalness: 0.92,
      roughness: 0.18,
      envMapIntensity: 1.6,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    gyroGroup.add(ring1);

    // Ring 2: Secondary Cyber Violet Beveled Ring (Inclined Plane Y)
    const ring2Geo = new THREE.TorusGeometry(2.15, 0.035, 16, 96);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x7c3aed),
      emissive: new THREE.Color(0x4f46e5),
      emissiveIntensity: isLight ? 0.6 : 1.2,
      metalness: 0.88,
      roughness: 0.22,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 5;
    gyroGroup.add(ring2);

    // Ring 3: Outer Cyber Cyan Orbit Track (Slender Halo)
    const ring3Geo = new THREE.TorusGeometry(2.45, 0.02, 16, 96);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x06b6d4),
      emissive: new THREE.Color(0x06b6d4),
      emissiveIntensity: isLight ? 0.7 : 1.4,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: isLight ? 0.75 : 0.9,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.z = Math.PI / 6;
    gyroGroup.add(ring3);

    // 5. Directional Forward Chevron Wings (Accenture-inspired Architectural Accent)
    const chevronGroup = new THREE.Group();
    masterGroup.add(chevronGroup);

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.35, 0.65);
    wingShape.lineTo(0.22, 0.65);
    wingShape.lineTo(-0.08, 0.1);
    wingShape.closePath();

    const extrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    const wingMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xffffff : 0x06b6d4,
      metalness: 0.8,
      roughness: 0.2,
      emissive: isLight ? 0x06b6d4 : 0x38bdf8,
      emissiveIntensity: isLight ? 0.4 : 0.8,
    });

    // 4 Symmetrical Wings positioned as directional satellites
    for (let i = 0; i < 4; i++) {
      const wingMesh = new THREE.Mesh(wingGeo, wingMat);
      const angle = (i * Math.PI) / 2;
      wingMesh.position.set(Math.cos(angle) * 1.7, Math.sin(angle) * 1.7, 0);
      wingMesh.rotation.z = angle + Math.PI / 4;
      chevronGroup.add(wingMesh);
    }

    // 6. Constellation Sparks (Floating Quantum Innovation Particles)
    const particleCount = 36;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 1.6 + Math.random() * 1.2;

      particlePositions[i * 3] = rad * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = rad * Math.cos(phi);
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

    const sparkTex = createSparkParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      map: sparkTex,
      transparent: true,
      opacity: isLight ? 0.7 : 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particleSystem);

    // 7. Mouse Pointer Tracking
    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      mousePosRef.current.targetX = nx * 0.8;
      mousePosRef.current.targetY = ny * 0.6;
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

    // 8. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth cursor parallax interpolation
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.08;
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.08;

      if (!prefersReduced) {
        const speedMult = isHoveredRef.current ? 1.5 : 1.0;

        // Harmonic master floating oscillation
        masterGroup.position.y = Math.sin(elapsed * 1.4) * 0.08;
        masterGroup.rotation.y = elapsed * 0.35 * speedMult + mousePosRef.current.x;
        masterGroup.rotation.x = mousePosRef.current.y + Math.sin(elapsed * 0.9) * 0.05;

        // Pulsing breathing on crystal core
        const pulse = 1.0 + Math.sin(elapsed * 2.5) * 0.035;
        emblemCoreGroup.scale.set(pulse, pulse, pulse);
        emblemCoreGroup.rotation.y += delta * 0.3 * speedMult;
        emblemCoreGroup.rotation.z -= delta * 0.15 * speedMult;

        // Gyroscope ring rotations
        ring1.rotation.z += delta * 0.4 * speedMult;
        ring2.rotation.z -= delta * 0.3 * speedMult;
        ring3.rotation.z += delta * 0.2 * speedMult;

        // Directional chevrons rotation
        chevronGroup.rotation.z += delta * 0.18 * speedMult;

        // Drifting spark particles
        particleSystem.rotation.y += delta * 0.1;
        particleSystem.rotation.x += delta * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
      renderer.dispose();
    };
  }, [hasWebGL, isLight, prefersReduced, size]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full outline-none"
        aria-label="SkillBridge 3D Industry Innovation Emblem"
      />
    </div>
  );
}
