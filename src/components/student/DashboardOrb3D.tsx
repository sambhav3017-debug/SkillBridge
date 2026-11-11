"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

/**
 * Creates a rich, deep Midnight Obsidian & Amethyst core texture
 * featuring Deep Amethyst (#48204F), Midnight Obsidian (#11131B),
 * Ultraviolet (#743BFF), and Electric Pink (#FF2D95) chromatic swirls.
 */
function createMidnightAmethystCoreTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep multi-stop radial gradient
  const grad = ctx.createRadialGradient(size * 0.38, size * 0.36, 16, size * 0.5, size * 0.5, size * 0.5);
  grad.addColorStop(0, "#743bff");    // Ultraviolet nucleus highlight
  grad.addColorStop(0.24, "#5b236a"); // Radiant amethyst
  grad.addColorStop(0.52, "#48204f"); // Deep Amethyst body
  grad.addColorStop(0.78, "#24122d"); // Dark velvet violet
  grad.addColorStop(1.0, "#11131b");  // Midnight Obsidian base

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Concentric kinetic plasma arcs in Electric Pink and Ultraviolet
  ctx.strokeStyle = "rgba(255, 45, 149, 0.55)"; // Electric Pink
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(size * 0.48, size * 0.48, size * 0.28, 0.2, Math.PI * 1.6);
  ctx.stroke();

  ctx.strokeStyle = "rgba(116, 59, 255, 0.65)"; // Ultraviolet
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(size * 0.52, size * 0.50, size * 0.38, Math.PI * 0.8, Math.PI * 2.2);
  ctx.stroke();

  // Subtle luminous core fleck
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(size * 0.38, size * 0.36, 4, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates a soft radial shadow texture to anchor the orb in 3D space.
 */
function createShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(0, 0, 0, 0.55)");
  grad.addColorStop(0.35, "rgba(17, 19, 27, 0.28)");
  grad.addColorStop(0.75, "rgba(72, 32, 79, 0.08)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

interface DashboardOrbProps {
  className?: string;
}

export default function DashboardOrb3D({ className = "" }: DashboardOrbProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [hasWebGL] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const c = document.createElement("canvas");
      return Boolean(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || prefersReduced || !hasWebGL) return;

    const width = container.clientWidth || 130;
    const height = container.clientHeight || 130;

    // 1. Scene, Camera, and High-Performance Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.08, 3.4);

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    // 2. Controlled Studio Lighting Rig (Midnight Obsidian & Amethyst focus)
    // Deep amethyst-tinted ambient base
    const ambientLight = new THREE.AmbientLight(0x241832, 0.85);
    scene.add(ambientLight);

    // Crisp Specular Key Light (upper-left, creates sharp highlight on dark glass)
    const keyLight = new THREE.DirectionalLight(0xf8f0ff, 2.5);
    keyLight.position.set(2.2, 3.2, 2.6);
    scene.add(keyLight);

    // Ultraviolet Rim Light (Left flank)
    const violetRim = new THREE.PointLight(0x743bff, 4.2, 8);
    violetRim.position.set(-2.4, 0.9, 1.4);
    scene.add(violetRim);

    // Electric Pink Rim Light (Right / Bottom flank)
    const pinkRim = new THREE.PointLight(0xff2d95, 3.8, 8);
    pinkRim.position.set(2.4, -0.8, 1.4);
    scene.add(pinkRim);

    // Top Deep Amethyst Contour Fill
    const topFill = new THREE.DirectionalLight(0x48204f, 1.8);
    topFill.position.set(0, 2.5, -1.0);
    scene.add(topFill);

    // 3. Materials & Textures
    const amethystCoreTexture = createMidnightAmethystCoreTexture();
    const shadowTexture = createShadowTexture();

    // Polished Midnight Obsidian Glass Shell
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x11131b, // Midnight Obsidian base
      transmission: 0.48, // Smoky obsidian glass transparency
      opacity: 0.96,
      transparent: true,
      roughness: 0.11,
      metalness: 0.18,
      clearcoat: 1.0, // High-gloss liquid lacquer finish
      clearcoatRoughness: 0.04,
      ior: 1.54, // Polished obsidian refractive index
      reflectivity: 0.72,
      attenuationColor: new THREE.Color(0x48204f), // Deep Amethyst volumetric absorption
      attenuationDistance: 0.7,
    });

    // Inner Glowing Amethyst Core Material
    const coreMaterial = new THREE.MeshStandardMaterial({
      map: amethystCoreTexture,
      roughness: 0.32,
      metalness: 0.22,
      emissive: new THREE.Color(0x48204f), // Deep Amethyst inner luminescence
      emissiveMap: amethystCoreTexture,
      emissiveIntensity: 0.7,
    });

    // Gyroscopic Ring 1: Ultraviolet
    const ultravioletRingMat = new THREE.MeshStandardMaterial({
      color: 0x743bff,
      emissive: 0x743bff,
      emissiveIntensity: 0.8,
      roughness: 0.22,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9,
    });

    // Gyroscopic Ring 2: Electric Pink
    const electricPinkRingMat = new THREE.MeshStandardMaterial({
      color: 0xff2d95,
      emissive: 0xff2d95,
      emissiveIntensity: 0.75,
      roughness: 0.22,
      metalness: 0.85,
      transparent: true,
      opacity: 0.9,
    });

    // Floor Shadow Material
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.46,
      depthWrite: false,
    });

    // 4. Object Hierarchy
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Floating Orb Subgroup (contains sphere, core, and rings)
    const orbGroup = new THREE.Group();
    mainGroup.add(orbGroup);

    // Outer Midnight Obsidian Glass Sphere
    const glassSphereGeom = new THREE.SphereGeometry(0.82, 48, 48);
    const glassSphere = new THREE.Mesh(glassSphereGeom, glassMaterial);
    orbGroup.add(glassSphere);

    // Inner Amethyst Core
    const coreGeom = new THREE.SphereGeometry(0.48, 36, 36);
    const coreMesh = new THREE.Mesh(coreGeom, coreMaterial);
    orbGroup.add(coreMesh);

    // Inner Gyroscopic Rings (kinetic depth)
    const ring1Geom = new THREE.TorusGeometry(0.66, 0.009, 16, 64);
    const ring1 = new THREE.Mesh(ring1Geom, ultravioletRingMat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    orbGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(0.72, 0.007, 16, 64);
    const ring2 = new THREE.Mesh(ring2Geom, electricPinkRingMat);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 5;
    orbGroup.add(ring2);

    // Ground Anchor Shadow
    const shadowGeom = new THREE.PlaneGeometry(1.5, 0.75);
    const shadowMesh = new THREE.Mesh(shadowGeom, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -1.05, 0);
    mainGroup.add(shadowMesh);

    // 5. Intelligent Mouse Interaction & Parallax
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const orbCenterX = rect.left + rect.width / 2;
      const orbCenterY = rect.top + rect.height / 2;

      // Distance from orb center in pixels, clamped to comfortable range
      const dx = (e.clientX - orbCenterX) / Math.max(window.innerWidth * 0.4, 300);
      const dy = (e.clientY - orbCenterY) / Math.max(window.innerHeight * 0.4, 300);

      const clampedX = Math.max(-1, Math.min(1, dx));
      const clampedY = Math.max(-1, Math.min(1, dy));

      // Subtle, tactile 3D tilt
      targetTiltY = clampedX * 0.45;
      targetTiltX = -clampedY * 0.35;
    };

    const onPointerLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    container.addEventListener("mouseleave", onPointerLeave, { passive: true });

    // 6. Animation Loop
    const startTime = performance.now();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const totalTime = (now - startTime) / 1000;

      // Smooth pointer tilt interpolation
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;

      // Continuous unhurried rotation (~26s per revolution)
      const idleRotationY = totalTime * 0.24;
      const idleTiltX = Math.sin(totalTime * 0.28) * 0.12;

      // Vertical floating motion
      const floatY = Math.sin(totalTime * 1.5) * 0.065;
      orbGroup.position.y = floatY;

      // Composite rotation (idle rotation + pointer tilt)
      orbGroup.rotation.x = idleTiltX + currentTiltX;
      orbGroup.rotation.y = idleRotationY + currentTiltY;
      orbGroup.rotation.z = Math.sin(totalTime * 0.2) * 0.06;

      // Dynamic counter-rotation of gyroscopic rings
      ring1.rotation.z = totalTime * 0.4;
      ring2.rotation.y = -totalTime * 0.35;

      // Inner core slow pulsation & independent rotation
      coreMesh.rotation.y = -totalTime * 0.18;
      const corePulse = 1.0 + Math.sin(totalTime * 2.2) * 0.025;
      coreMesh.scale.set(corePulse, corePulse, corePulse);

      // Floor shadow breathing sync with float
      const shadowScale = 1.0 - floatY * 0.8;
      shadowMesh.scale.set(shadowScale, shadowScale, 1.0);
      shadowMat.opacity = 0.46 - floatY * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 130;
      const h = container.clientHeight || 130;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseleave", onPointerLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      glassSphereGeom.dispose();
      coreGeom.dispose();
      ring1Geom.dispose();
      ring2Geom.dispose();
      shadowGeom.dispose();
      amethystCoreTexture.dispose();
      shadowTexture.dispose();
    };
  }, [prefersReduced, hasWebGL]);

  if (prefersReduced || !hasWebGL) {
    // Elegant reduced-motion fallback: static Midnight Amethyst orb circle
    return (
      <div
        className={`relative flex items-center justify-center rounded-full bg-gradient-to-tr from-[#11131b] via-[#48204f] to-[#743bff]/40 backdrop-blur-md border border-[#743bff]/25 shadow-[0_0_24px_rgba(116,59,255,0.2)] ${className}`}
        aria-hidden="true"
      >
        <div className="h-2/3 w-2/3 rounded-full bg-gradient-to-tr from-[#743bff]/30 to-[#ff2d95]/30 blur-sm" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="presentation"
      aria-hidden="true"
      className={`relative select-none pointer-events-none ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full pointer-events-none" />

      {/* Atmospheric ambient glow behind the orb: Deep Amethyst & Electric Pink in Dark Mode, Warm Apricot/Peach Halo in Light Mode */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-4/5 rounded-full bg-gradient-to-tr from-[#743bff]/18 via-[#48204f]/25 to-[#ff2d95]/18 blur-2xl -z-10 light:hidden" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-4/5 rounded-full bg-gradient-to-tr from-[#EEF5FB]/40 via-[#FF2D95]/25 to-[#EEF5FB]/20 blur-2xl -z-10 hidden light:block" />
    </div>
  );
}
