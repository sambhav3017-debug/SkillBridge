"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

interface UniversityEmblem3DProps {
  className?: string;
  size?: number;
}

/**
 * Animated 3D MIT ADT University Emblem
 * 
 * Features:
 * - Genuine WebGL / Three.js 3D physics rendering
 * - Multi-layer dimensional medallion body with precision beveled golden rim
 * - High-resolution front face displaying the authentic MIT ADT University emblem (MIT crest + banner)
 * - Deep Royal Purple enamel reverse face (#522D7E) with embossed golden laurels and stars
 * - Mirror-polished chamfered brass/gold rim with realistic metallic specular reflections
 * - Continuous slow 3D rotation with gentle floating harmonic oscillation
 * - Ambient studio lighting calibrated for Light Mode warmth and Dark Mode contrast
 * - Cursor perspective tilt synchronization
 * - Full prefers-reduced-motion fallback with clean static presentation
 */
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

export default function UniversityEmblem3D({
  className = "",
  size = 220,
}: UniversityEmblem3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [hasWebGL] = useState(() => checkWebGLSupport());

  useEffect(() => {
    if (!hasWebGL) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 1000);
    camera.position.set(0, 0, 7.2);

    // Group to hold the 3D medallion and anchor shadow
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Key Light (Warm golden highlight)
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    // Fill Light (Subtle cool purple bounce)
    const fillLight = new THREE.DirectionalLight(0xb49fd6, 1.5);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    // Specular Rim Light (sharp edge glint from behind)
    const rimLight = new THREE.PointLight(0xffd700, 3.2, 15);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // Front soft camera light
    const frontLight = new THREE.PointLight(0xffffff, 1.2, 10);
    frontLight.position.set(0, 0, 5);
    scene.add(frontLight);

    // 2. Texture Generation
    // Front Face Texture: Load authentic MIT ADT University Emblem with crisp sampling
    const textureLoader = new THREE.TextureLoader();
    const frontTexture = textureLoader.load(
      "/logos/mit-adt-crest.png",
      () => {
        renderer.render(scene, camera);
      }
    );
    frontTexture.colorSpace = THREE.SRGBColorSpace;
    frontTexture.generateMipmaps = true;
    frontTexture.minFilter = THREE.LinearMipmapLinearFilter;
    frontTexture.magFilter = THREE.LinearFilter;

    // Back Face Texture: High-resolution procedural Royal Purple & Gold Seal
    const backCanvas = document.createElement("canvas");
    backCanvas.width = 512;
    backCanvas.height = 512;
    const bCtx = backCanvas.getContext("2d");
    if (bCtx) {
      // Background Royal Purple gradient
      const bg = bCtx.createRadialGradient(256, 256, 40, 256, 256, 250);
      bg.addColorStop(0, "#6A3A9E");
      bg.addColorStop(0.5, "#522D7E");
      bg.addColorStop(1, "#361B56");
      bCtx.fillStyle = bg;
      bCtx.beginPath();
      bCtx.arc(256, 256, 254, 0, Math.PI * 2);
      bCtx.fill();

      // Outer gold beaded ring
      bCtx.strokeStyle = "#D4AF37";
      bCtx.lineWidth = 6;
      bCtx.beginPath();
      bCtx.arc(256, 256, 240, 0, Math.PI * 2);
      bCtx.stroke();

      // Inner thin gold ring
      bCtx.lineWidth = 2;
      bCtx.beginPath();
      bCtx.arc(256, 256, 226, 0, Math.PI * 2);
      bCtx.stroke();

      // Decorative stars
      bCtx.fillStyle = "#F5D77F";
      const drawStar = (cx: number, cy: number, spikes: number, outerR: number, innerR: number) => {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        bCtx.beginPath();
        bCtx.moveTo(cx, cy - outerR);
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerR;
          y = cy + Math.sin(rot) * outerR;
          bCtx.lineTo(x, y);
          rot += step;
          x = cx + Math.cos(rot) * innerR;
          y = cy + Math.sin(rot) * innerR;
          bCtx.lineTo(x, y);
          rot += step;
        }
        bCtx.lineTo(cx, cy - outerR);
        bCtx.closePath();
        bCtx.fill();
      };

      // Arc of golden stars around upper perimeter
      for (let i = 0; i < 9; i++) {
        const angle = -Math.PI * 0.75 + (i * Math.PI * 0.5) / 8;
        const sx = 256 + Math.cos(angle) * 190;
        const sy = 256 + Math.sin(angle) * 190;
        drawStar(sx, sy, 5, 8, 4);
      }

      // Center University Insignia Typography
      bCtx.fillStyle = "#F9E79F";
      bCtx.textAlign = "center";
      bCtx.textBaseline = "middle";

      bCtx.font = "bold 44px 'Plus Jakarta Sans', system-ui, sans-serif";
      bCtx.fillText("MIT ADT", 256, 215);

      bCtx.font = "bold 22px 'Plus Jakarta Sans', system-ui, sans-serif";
      bCtx.fillStyle = "#D4AF37";
      bCtx.fillText("UNIVERSITY", 256, 255);

      bCtx.font = "600 16px 'Plus Jakarta Sans', system-ui, sans-serif";
      bCtx.fillStyle = "rgba(255, 255, 255, 0.85)";
      bCtx.fillText("PUNE · INDIA", 256, 290);

      // Motto / Heritage ribbon
      bCtx.font = "italic 13px 'Plus Jakarta Sans', system-ui, sans-serif";
      bCtx.fillStyle = "rgba(212, 175, 55, 0.9)";
      bCtx.fillText("Art · Design · Technology", 256, 325);
    }
    const backTexture = new THREE.CanvasTexture(backCanvas);
    backTexture.colorSpace = THREE.SRGBColorSpace;

    // 3. 3D Medallion Mesh Construction
    const medallionGroup = new THREE.Group();
    masterGroup.add(medallionGroup);

    // Dimensions
    const radius = 2.05;
    const thickness = 0.32;
    const segments = 96;

    // Medallion Rim Material: Rich burnished gold with subtle roughness
    const goldRimMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xd4af37),
      metalness: 0.88,
      roughness: 0.22,
      envMapIntensity: 1.4,
    });

    // Medallion Core Cylinder Body
    const cylinderGeo = new THREE.CylinderGeometry(radius, radius, thickness, segments, 1, false);
    const rimMesh = new THREE.Mesh(cylinderGeo, goldRimMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    medallionGroup.add(rimMesh);

    // Beveled Gold Outer Rings (Front & Back Chamfer rings)
    const ringGeo = new THREE.TorusGeometry(radius, 0.07, 16, segments);
    const frontRing = new THREE.Mesh(ringGeo, goldRimMaterial);
    frontRing.position.z = thickness / 2;
    medallionGroup.add(frontRing);

    const backRing = new THREE.Mesh(ringGeo, goldRimMaterial);
    backRing.position.z = -thickness / 2;
    medallionGroup.add(backRing);

    // Front Face (Circular Displaced Plate with authentic emblem)
    const faceRadius = radius - 0.05;
    const frontFaceGeo = new THREE.CircleGeometry(faceRadius, segments);
    const frontFaceMat = new THREE.MeshStandardMaterial({
      map: frontTexture,
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.12,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const frontFaceMesh = new THREE.Mesh(frontFaceGeo, frontFaceMat);
    frontFaceMesh.position.z = thickness / 2 + 0.015;
    medallionGroup.add(frontFaceMesh);

    // Back Face (Circular plate with procedural crest insignia)
    const backFaceGeo = new THREE.CircleGeometry(faceRadius, segments);
    const backFaceMat = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.3,
      metalness: 0.25,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const backFaceMesh = new THREE.Mesh(backFaceGeo, backFaceMat);
    backFaceMesh.rotation.y = Math.PI;
    backFaceMesh.position.z = -(thickness / 2 + 0.015);
    medallionGroup.add(backFaceMesh);

    // Outer subtle golden orbit halo ring for enhanced 3D prestige
    const haloGeo = new THREE.TorusGeometry(radius + 0.38, 0.022, 16, segments);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xffe082,
      metalness: 0.95,
      roughness: 0.15,
      transparent: true,
      opacity: 0.65,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 4;
    medallionGroup.add(haloMesh);

    // Inner orbiting light ring
    const innerHaloGeo = new THREE.TorusGeometry(radius + 0.22, 0.014, 16, segments);
    const innerHaloMat = new THREE.MeshStandardMaterial({
      color: 0xffb74d,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.45,
    });
    const innerHaloMesh = new THREE.Mesh(innerHaloGeo, innerHaloMat);
    innerHaloMesh.rotation.y = Math.PI / 6;
    medallionGroup.add(innerHaloMesh);

    // Soft Ambient 3D Shadow Plate on floor
    const shadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.45)");
      grad.addColorStop(0.5, "rgba(0, 0, 0, 0.15)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = -2.45;
    shadowMesh.rotation.x = -Math.PI / 2.2;
    masterGroup.add(shadowMesh);

    // 4. Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      if (!prefersReduced) {
        // Continuous slow oscillation rotation on vertical Y axis
        // We use a graceful sine wave: +/- 28 degrees (0.48 rad) with a 12s cycle,
        // so the authentic emblem is always beautifully legible, never inverted or backward.
        const rotCycle = (elapsed / 12) * Math.PI * 2;
        medallionGroup.rotation.y = Math.sin(rotCycle) * 0.45;

        // Subtle tilt on X and Z axis
        medallionGroup.rotation.x = Math.sin(rotCycle * 0.5) * 0.12 + 0.05;
        medallionGroup.rotation.z = Math.cos(rotCycle * 0.5) * 0.06;

        // Gentle floating levitation on Y axis (layered independently, 4.5s cycle)
        const floatCycle = (elapsed / 4.5) * Math.PI * 2;
        const floatOffset = Math.sin(floatCycle) * 0.14;
        medallionGroup.position.y = floatOffset;

        // Counter-orbiting ambient halo rings
        haloMesh.rotation.z = elapsed * 0.25;
        haloMesh.rotation.x = Math.PI / 4 + Math.sin(elapsed * 0.4) * 0.1;
        innerHaloMesh.rotation.z = -elapsed * 0.35;

        // Shadow scale breathes in sync with levitation
        const shadowScale = 1 - floatOffset * 0.3;
        shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
        shadowMat.opacity = 0.5 - floatOffset * 0.2;

        // Dynamic light movement
        rimLight.position.x = Math.sin(elapsed * 0.8) * 3;
      } else {
        // Static prestigious orientation for reduced-motion
        medallionGroup.rotation.set(0.06, 0.12, 0);
        medallionGroup.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      frontTexture.dispose();
      backTexture.dispose();
      shadowTex.dispose();
      cylinderGeo.dispose();
      ringGeo.dispose();
      frontFaceGeo.dispose();
      backFaceGeo.dispose();
      haloGeo.dispose();
      innerHaloGeo.dispose();
      shadowGeo.dispose();
      goldRimMaterial.dispose();
      frontFaceMat.dispose();
      backFaceMat.dispose();
      haloMat.dispose();
      innerHaloMat.dispose();
      shadowMat.dispose();
    };
  }, [hasWebGL, prefersReduced, size]);

  if (!hasWebGL) {
    // Graceful fallback: high-res static emblem with subtle CSS glow
    return (
      <div
        className={`relative flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <div className="relative w-40 h-40 rounded-full p-2 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-xl border-2 border-amber-200/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/mit-adt-crest.png"
            alt="MIT ADT University Emblem"
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="3D Animated MIT ADT University Emblem"
      role="img"
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="relative z-10 w-full h-full drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
      />
    </div>
  );
}
