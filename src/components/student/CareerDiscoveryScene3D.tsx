"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

interface CareerDiscoveryScene3DProps {
  className?: string;
}

export default function CareerDiscoveryScene3D({ className = "" }: CareerDiscoveryScene3DProps) {
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

    let width = container.clientWidth || 280;
    let height = container.clientHeight || 240;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0.2, 4.6);

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
    renderer.toneMappingExposure = 1.2;

    // Detect active theme
    const isDark = document.documentElement.getAttribute("data-theme") !== "light" &&
      !document.documentElement.classList.contains("light");

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight(isDark ? 0x141e33 : 0xffeedd, isDark ? 1.4 : 1.8);
    scene.add(ambientLight);

    // Warm Key Light (amber/orange in light mode, cyan/white in dark mode)
    const keyLight = new THREE.DirectionalLight(isDark ? 0x19b8e6 : 0xff7a00, isDark ? 3.0 : 3.5);
    keyLight.position.set(3, 4, 3.5);
    scene.add(keyLight);

    // Complementary Accent Light
    const rimLight = new THREE.PointLight(isDark ? 0xff2d95 : 0xff9f1c, isDark ? 4.0 : 3.2, 12);
    rimLight.position.set(-3.5, -1.5, 2);
    scene.add(rimLight);

    // 3. Central Career Gateway / Prism
    // Floating faceted geometry representing ambition & career milestones
    const prismGeo = new THREE.OctahedronGeometry(1.05, 0);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0f172a : 0xff5500,
      emissive: isDark ? 0x007ba7 : 0xe63900,
      emissiveIntensity: isDark ? 0.45 : 0.35,
      roughness: 0.12,
      metalness: 0.3,
      transmission: isDark ? 0.55 : 0.35,
      thickness: 1.2,
      transparent: true,
      opacity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    const prismMesh = new THREE.Mesh(prismGeo, prismMat);
    scene.add(prismMesh);

    // Inner glowing nucleus
    const coreGeo = new THREE.IcosahedronGeometry(0.48, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x19b8e6 : 0xffb703,
      emissive: isDark ? 0x19b8e6 : 0xff9f1c,
      emissiveIntensity: 1.2,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    prismMesh.add(coreMesh);

    // 4. Orbital Career Pathway Rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);

    // Primary Pathway Ring (e.g., Internships & Projects)
    const ring1Geo = new THREE.TorusGeometry(1.68, 0.022, 16, 80);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x19b8e6 : 0xff6a00,
      emissive: isDark ? 0x19b8e6 : 0xff6a00,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI * 0.38;
    ring1Mesh.rotation.y = Math.PI * 0.15;
    ringGroup.add(ring1Mesh);

    // Secondary Pathway Ring (e.g., Skills & Certifications)
    const ring2Geo = new THREE.TorusGeometry(2.05, 0.018, 16, 90);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xff2d95 : 0xff9f1c,
      emissive: isDark ? 0xff2d95 : 0xff9f1c,
      emissiveIntensity: 0.7,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI * 0.32;
    ring2Mesh.rotation.y = -Math.PI * 0.2;
    ringGroup.add(ring2Mesh);

    // 5. Orbital Opportunity Node Spheres
    const nodeCount = 5;
    const nodes: { mesh: THREE.Mesh; angle: number; speed: number; radius: number; height: number }[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);

    for (let i = 0; i < nodeCount; i++) {
      const isAlt = i % 2 === 0;
      const nodeMat = new THREE.MeshStandardMaterial({
        color: isDark ? (isAlt ? 0x19b8e6 : 0xff2d95) : (isAlt ? 0xff6a00 : 0xfbbf24),
        emissive: isDark ? (isAlt ? 0x19b8e6 : 0xff2d95) : (isAlt ? 0xff6a00 : 0xfbbf24),
        emissiveIntensity: 1.0,
        roughness: 0.2,
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      scene.add(nodeMesh);
      nodes.push({
        mesh: nodeMesh,
        angle: (i / nodeCount) * Math.PI * 2,
        speed: 0.4 + i * 0.12,
        radius: 1.7 + (i % 2) * 0.35,
        height: (Math.sin(i) * 0.5),
      });
    }

    // 6. Interactive Pointer Tracking
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = nx * 0.35;
      targetRotX = -ny * 0.25;
    };

    const handlePointerLeave = () => {
      targetRotX = 0;
      targetRotY = 0;
    };

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerleave", handlePointerLeave);

    // 7. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 280;
      height = container.clientHeight || 240;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation Render Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth pointer interpolation
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      // Central Prism Motion
      prismMesh.rotation.y = elapsed * 0.35 + currentRotY;
      prismMesh.rotation.x = Math.sin(elapsed * 0.4) * 0.15 + currentRotX;
      prismMesh.position.y = Math.sin(elapsed * 1.2) * 0.08;

      // Inner Core Counter-Rotation
      coreMesh.rotation.y = -elapsed * 0.6;
      coreMesh.rotation.z = elapsed * 0.3;

      // Gyroscopic Ring Rotations
      ring1Mesh.rotation.z = elapsed * 0.25;
      ring2Mesh.rotation.z = -elapsed * 0.2;
      ringGroup.rotation.y = currentRotY * 0.6;
      ringGroup.rotation.x = currentRotX * 0.6;

      // Orbital Node Trajectories
      for (const n of nodes) {
        n.angle += 0.008 * n.speed;
        n.mesh.position.x = Math.cos(n.angle) * n.radius;
        n.mesh.position.z = Math.sin(n.angle) * n.radius;
        n.mesh.position.y = n.height + Math.sin(elapsed * 1.5 + n.angle) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);

      prismGeo.dispose();
      prismMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      nodeGeo.dispose();
      renderer.dispose();
    };
  }, [hasWebGL, prefersReduced]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[220px] sm:h-[260px] flex items-center justify-center select-none pointer-events-auto ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
      />
      {!hasWebGL && (
        <div className="flex h-full w-full items-center justify-center text-xs text-sb-muted">
          SkillBridge 3D Career Node
        </div>
      )}
    </div>
  );
}
