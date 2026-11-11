"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * Creates a soft radial shadow canvas texture to ground the 3D achievement pedestal.
 */
function createShadowTexture(isLight: boolean): THREE.CanvasTexture {
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
    grad.addColorStop(0, "rgba(36, 39, 53, 0.22)");
    grad.addColorStop(0.35, "rgba(157, 73, 59, 0.09)");
    grad.addColorStop(0.7, "rgba(246, 214, 198, 0.03)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
  } else {
    grad.addColorStop(0, "rgba(0, 0, 0, 0.65)");
    grad.addColorStop(0.35, "rgba(10, 16, 28, 0.35)");
    grad.addColorStop(0.7, "rgba(0, 123, 167, 0.08)");
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Creates a delicate holographic particle circle texture.
 */
function createParticleTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.3, "rgba(25, 184, 230, 0.8)");
  grad.addColorStop(0.7, "rgba(255, 45, 149, 0.35)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  return new THREE.CanvasTexture(canvas);
}

interface DashboardAchievementProps {
  className?: string;
}

export default function DashboardAchievementScene3D({ className = "" }: DashboardAchievementProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();
  const { theme } = useTheme();
  const isLight = theme === "light";

  const isHoveredRef = useRef(false);
  const themeRef = useRef(isLight);

  useEffect(() => {
    themeRef.current = isLight;
  }, [isLight]);

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

    let width = container.clientWidth || 140;
    let height = container.clientHeight || 140;

    // 1. Scene, Camera, and High-Performance Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.42, 3.2);
    camera.lookAt(0, 0.04, 0);

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
    renderer.toneMappingExposure = isLight ? 1.18 : 1.25;

    // 2. Controlled Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(isLight ? 0xfff6ee : 0x0c1220, isLight ? 1.4 : 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(isLight ? 0xfff9f4 : 0xf0f4ff, isLight ? 2.4 : 2.6);
    keyLight.position.set(1.4, 3.5, 2.5);
    scene.add(keyLight);

    // Cerulean Blue rim light (Left side)
    const cyanLight = new THREE.PointLight(0x007ba7, isLight ? 2.6 : 4.0, 8);
    cyanLight.position.set(-2.4, 1.2, 1.4);
    scene.add(cyanLight);

    // Neon Pink rim light (Right side)
    const pinkLight = new THREE.PointLight(0xff2d95, isLight ? 2.4 : 3.8, 8);
    pinkLight.position.set(2.4, 1.2, 1.4);
    scene.add(pinkLight);

    // Top subtle white specular highlight
    const topSpot = new THREE.PointLight(0xffffff, isLight ? 0.9 : 1.3, 5);
    topSpot.position.set(0, 1.8, 0.8);
    scene.add(topSpot);

    // 3. Root Interactive Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 4. Ground Anchor Shadow
    let shadowTex = createShadowTexture(isLight);
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: isLight ? 0.75 : 0.65,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -0.48, 0);
    rootGroup.add(shadowMesh);

    // 5. Minimal Transparent Glass Pedestal
    // Outer beveled glass pedestal
    const pedestalGeo = new THREE.CylinderGeometry(0.68, 0.74, 0.045, 36);
    const pedestalMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0xffffff : 0x161d2c,
      roughness: isLight ? 0.1 : 0.16,
      metalness: isLight ? 0.12 : 0.22,
      transmission: isLight ? 0.82 : 0.65,
      opacity: 0.96,
      ior: 1.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      emissive: isLight ? 0x007ba7 : 0x19b8e6,
      emissiveIntensity: isLight ? 0.12 : 0.35,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(0, -0.44, 0);
    rootGroup.add(pedestal);

    // Inner frosted ring on the pedestal
    const pedestalRingGeo = new THREE.TorusGeometry(0.58, 0.012, 16, 48);
    const pedestalRingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: isLight ? 0x007ba7 : 0x19b8e6,
      emissiveIntensity: isLight ? 0.6 : 1.2,
      roughness: 0.2,
      metalness: 0.6,
    });
    const pedestalRing = new THREE.Mesh(pedestalRingGeo, pedestalRingMat);
    pedestalRing.rotation.x = Math.PI / 2;
    pedestalRing.position.set(0, -0.415, 0);
    rootGroup.add(pedestalRing);

    // 6. Holographic Orbit Rings (Achievements)
    const ringGroup = new THREE.Group();
    ringGroup.position.set(0, 0.04, 0);
    ringGroup.rotation.x = 0.38; // Inclined orbital plane
    rootGroup.add(ringGroup);

    // Outer Cerulean Blue Orbit Ring
    const orbitRing1Geo = new THREE.TorusGeometry(0.88, 0.009, 16, 64);
    const orbitRing1Mat = new THREE.MeshStandardMaterial({
      color: 0x19b8e6,
      emissive: 0x007ba7,
      emissiveIntensity: isLight ? 0.8 : 1.4,
      roughness: 0.2,
      metalness: 0.8,
    });
    const orbitRing1 = new THREE.Mesh(orbitRing1Geo, orbitRing1Mat);
    ringGroup.add(orbitRing1);

    // Inner Neon Pink Orbit Ring
    const orbitRing2Geo = new THREE.TorusGeometry(0.72, 0.007, 16, 64);
    const orbitRing2Mat = new THREE.MeshStandardMaterial({
      color: 0xff2d95,
      emissive: 0xff2d95,
      emissiveIntensity: isLight ? 0.75 : 1.3,
      roughness: 0.2,
      metalness: 0.8,
    });
    const orbitRing2 = new THREE.Mesh(orbitRing2Geo, orbitRing2Mat);
    orbitRing2.rotation.y = 0.42;
    ringGroup.add(orbitRing2);

    // 7. Holographic Mini Certificate Outline Badge (Achievement Accent)
    const certGroup = new THREE.Group();
    certGroup.position.set(0.68, -0.12, 0.22);
    certGroup.rotation.y = -0.45;
    certGroup.rotation.z = 0.15;
    rootGroup.add(certGroup);

    const certParchmentGeo = new THREE.BoxGeometry(0.24, 0.18, 0.012);
    const certParchmentMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0xffffff : 0x1b2234,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.75,
      opacity: 0.92,
      ior: 1.5,
      clearcoat: 0.8,
      emissive: isLight ? 0x007ba7 : 0x19b8e6,
      emissiveIntensity: isLight ? 0.25 : 0.6,
    });
    const certMesh = new THREE.Mesh(certParchmentGeo, certParchmentMat);
    certGroup.add(certMesh);

    // Certificate Ribbon Seal
    const certSealGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.014, 16);
    const certSealMat = new THREE.MeshStandardMaterial({
      color: 0xff2d95,
      emissive: 0xff2d95,
      emissiveIntensity: isLight ? 0.8 : 1.4,
      roughness: 0.2,
      metalness: 0.5,
    });
    const certSeal = new THREE.Mesh(certSealGeo, certSealMat);
    certSeal.rotation.x = Math.PI / 2;
    certSeal.position.set(0.06, -0.04, 0.01);
    certGroup.add(certSeal);

    // 8. The Central Hero: Premium Graduation Cap (Mortarboard)
    const capGroup = new THREE.Group();
    capGroup.position.set(0, 0.08, 0);
    rootGroup.add(capGroup);

    // Cap Satin/Felt Material
    const capMat = new THREE.MeshPhysicalMaterial({
      color: isLight ? 0x1c2130 : 0x121622,
      roughness: 0.28,
      metalness: 0.18,
      clearcoat: 0.35,
      clearcoatRoughness: 0.12,
      emissive: 0x0c1220,
      emissiveIntensity: 0.2,
    });

    // Beveled Mortarboard Diamond Top Plate
    const mortarboardGeo = new THREE.BoxGeometry(0.82, 0.028, 0.82);
    const mortarboard = new THREE.Mesh(mortarboardGeo, capMat);
    mortarboard.rotation.y = Math.PI / 4; // Diamond orientation
    mortarboard.position.set(0, 0.12, 0);
    capGroup.add(mortarboard);

    // Mortarboard Edge Trim (High-detail subtle specular rim)
    const rimEdgeGeo = new THREE.BoxGeometry(0.832, 0.008, 0.832);
    const rimEdgeMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x2e384d : 0x253046,
      roughness: 0.2,
      metalness: 0.6,
      emissive: isLight ? 0x007ba7 : 0x19b8e6,
      emissiveIntensity: isLight ? 0.25 : 0.45,
    });
    const rimEdge = new THREE.Mesh(rimEdgeGeo, rimEdgeMat);
    rimEdge.rotation.y = Math.PI / 4;
    rimEdge.position.set(0, 0.12, 0);
    capGroup.add(rimEdge);

    // Fitted Skull Crown beneath the plate
    const crownGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.16, 32);
    const crown = new THREE.Mesh(crownGeo, capMat);
    crown.position.set(0, 0.025, 0);
    capGroup.add(crown);

    // Center Cap Button / Stud
    const buttonGeo = new THREE.CylinderGeometry(0.046, 0.046, 0.028, 20);
    const buttonMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0x2a3244 : 0x20283a,
      roughness: 0.2,
      metalness: 0.7,
      emissive: isLight ? 0x007ba7 : 0x19b8e6,
      emissiveIntensity: isLight ? 0.3 : 0.6,
    });
    const capButton = new THREE.Mesh(buttonGeo, buttonMat);
    capButton.position.set(0, 0.144, 0);
    capGroup.add(capButton);

    // Flowing Drape Tassel
    const tasselGroup = new THREE.Group();
    tasselGroup.position.set(0, 0.144, 0);
    capGroup.add(tasselGroup);

    const tasselMat = new THREE.MeshStandardMaterial({
      color: isLight ? 0xff2d95 : 0xff3e9f,
      emissive: 0xd81b7a,
      emissiveIntensity: isLight ? 0.5 : 0.9,
      roughness: 0.25,
      metalness: 0.4,
    });

    // Cord draping across top plate toward the corner
    const cordGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.44, 10);
    const cord = new THREE.Mesh(cordGeo, tasselMat);
    cord.position.set(-0.20, -0.022, 0.16);
    cord.rotation.z = 1.08;
    cord.rotation.y = 0.46;
    tasselGroup.add(cord);

    // Metallic Tassel Ring / Ferrule
    const ferruleGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.03, 14);
    const ferruleMat = new THREE.MeshStandardMaterial({
      color: 0x19b8e6,
      emissive: 0x007ba7,
      emissiveIntensity: isLight ? 0.6 : 1.1,
      roughness: 0.15,
      metalness: 0.9,
    });
    const ferrule = new THREE.Mesh(ferruleGeo, ferruleMat);
    ferrule.position.set(-0.38, -0.14, 0.28);
    tasselGroup.add(ferrule);

    // Hanging Tassel Skirt / Fringe
    const skirtGeo = new THREE.ConeGeometry(0.042, 0.18, 16);
    const skirt = new THREE.Mesh(skirtGeo, tasselMat);
    skirt.position.set(-0.38, -0.23, 0.28);
    skirt.rotation.z = 0.04;
    tasselGroup.add(skirt);

    // 9. Floating Achievement Particles & Light Trails
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleAngles = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleSpeeds = new Float32Array(particleCount);
    const particleBaseY = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particleAngles[i] = Math.random() * Math.PI * 2;
      particleRadii[i] = 0.45 + Math.random() * 0.55;
      particleSpeeds[i] = 0.4 + Math.random() * 0.6;
      particleBaseY[i] = -0.3 + Math.random() * 0.65;

      particlePos[i * 3] = Math.cos(particleAngles[i]) * particleRadii[i];
      particlePos[i * 3 + 1] = particleBaseY[i];
      particlePos[i * 3 + 2] = Math.sin(particleAngles[i]) * particleRadii[i];
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));

    const particleTex = createParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      map: particleTex,
      transparent: true,
      opacity: isLight ? 0.7 : 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particles);

    // 10. Interactive Hover & Animation State
    let currentHover = 0.0; // 0.0 = idle, 1.0 = fully hovered
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = Math.max(-1, Math.min(1, x));
      targetMouseY = Math.max(-1, Math.min(1, y));
    };

    const onPointerEnter = () => {
      isHoveredRef.current = true;
    };

    const onPointerLeave = () => {
      isHoveredRef.current = false;
      targetMouseX = 0;
      targetMouseY = 0;
    };

    const onTouchStart = () => {
      isHoveredRef.current = !isHoveredRef.current;
    };

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseenter", onPointerEnter);
    container.addEventListener("mouseleave", onPointerLeave);
    container.addEventListener("touchstart", onTouchStart, { passive: true });

    // 11. Render Animation Loop
    let animId: number;
    let lastTime = performance.now();
    let prevTheme = themeRef.current;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const time = now * 0.001;

      // Real-time dynamic theme switch detection
      const activeTheme = themeRef.current;
      if (activeTheme !== prevTheme) {
        prevTheme = activeTheme;
        renderer.toneMappingExposure = activeTheme ? 1.18 : 1.25;
        ambientLight.color.setHex(activeTheme ? 0xfff6ee : 0x0c1220);
        ambientLight.intensity = activeTheme ? 1.4 : 0.9;
        keyLight.color.setHex(activeTheme ? 0xfff9f4 : 0xf0f4ff);
        keyLight.intensity = activeTheme ? 2.4 : 2.6;

        cyanLight.intensity = activeTheme ? 2.6 : 4.0;
        pinkLight.intensity = activeTheme ? 2.4 : 3.8;

        shadowTex.dispose();
        shadowTex = createShadowTexture(activeTheme);
        shadowMat.map = shadowTex;
        shadowMat.opacity = activeTheme ? 0.75 : 0.65;
        shadowMat.needsUpdate = true;

        pedestalMat.color.setHex(activeTheme ? 0xffffff : 0x161d2c);
        pedestalMat.transmission = activeTheme ? 0.82 : 0.65;
        pedestalMat.needsUpdate = true;

        capMat.color.setHex(activeTheme ? 0x1c2130 : 0x121622);
        capMat.needsUpdate = true;
      }

      // Smooth hover progress transition (~650ms target)
      const targetHover = isHoveredRef.current ? 1.0 : 0.0;
      currentHover += (targetHover - currentHover) * Math.min(delta * 4.4, 1.0);

      // Smooth mouse parallax interpolation
      currentMouseX += (targetMouseX - currentMouseX) * Math.min(delta * 5.0, 1.0);
      currentMouseY += (targetMouseY - currentMouseY) * Math.min(delta * 5.0, 1.0);

      // Scene perspective tilt
      rootGroup.rotation.x = 0.18 - currentMouseY * 0.08;
      rootGroup.rotation.y = -0.15 + currentMouseX * 0.14;

      // Smoothstep easing for hover elevation & tilt
      const easedHover = currentHover * currentHover * (3 - 2 * currentHover);

      // Idle floating animation
      const idleFloatY = Math.sin(time * 1.6) * 0.032;
      const idleYaw = Math.sin(time * 0.7) * 0.08;

      // Cap position: rises from resting float (0.08 + idle) to elevated hover position (+0.10)
      capGroup.position.y = 0.08 + idleFloatY + (easedHover * 0.09);

      // Cap rotation: rotates slightly in 3D on hover to reveal its diamond form & tassel
      capGroup.rotation.y = idleYaw + (easedHover * 0.32);
      capGroup.rotation.x = -easedHover * 0.14;
      capGroup.rotation.z = Math.sin(time * 1.4) * 0.015 + (easedHover * 0.06);

      // Tassel natural secondary physics sway
      const tasselSway = Math.sin(time * 1.6 - 0.5) * 0.038 * (1.0 - easedHover * 0.5);
      skirt.rotation.z = 0.04 + tasselSway;

      // Orbit rings continuous gentle rotation
      orbitRing1.rotation.z = time * 0.28 + (easedHover * 0.4);
      orbitRing2.rotation.z = -time * 0.32 - (easedHover * 0.4);
      ringGroup.scale.setScalar(1.0 + easedHover * 0.08);

      // Orbit rings glow increases on hover
      orbitRing1Mat.emissiveIntensity = (prevTheme ? 0.8 : 1.4) + (easedHover * 0.5);
      orbitRing2Mat.emissiveIntensity = (prevTheme ? 0.75 : 1.3) + (easedHover * 0.5);

      // Certificate badge floating tilt
      certGroup.position.y = -0.12 + Math.sin(time * 1.3 + 1.2) * 0.02 + (easedHover * 0.04);
      certGroup.rotation.y = -0.45 + Math.cos(time * 0.9) * 0.05 + (easedHover * 0.12);

      // Animate floating achievement particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      const speedMult = 1.0 + easedHover * 0.8;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += particleSpeeds[i] * delta * 0.8 * speedMult;
        const ang = particleAngles[i];
        const rad = particleRadii[i] + Math.sin(time * 1.5 + i) * 0.03;

        positions[i * 3] = Math.cos(ang) * rad;
        positions[i * 3 + 1] = particleBaseY[i] + Math.sin(time * 1.2 + i * 0.5) * 0.06;
        positions[i * 3 + 2] = Math.sin(ang) * rad;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Ground shadow expands softly when cap rises
      const shadowScale = 1.0 - (easedHover * 0.06);
      shadowMesh.scale.set(shadowScale, shadowScale, 1.0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 140;
      height = container.clientHeight || 140;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseenter", onPointerEnter);
      container.removeEventListener("mouseleave", onPointerLeave);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);

      renderer.dispose();
      pedestalGeo.dispose();
      pedestalMat.dispose();
      pedestalRingGeo.dispose();
      pedestalRingMat.dispose();
      orbitRing1Geo.dispose();
      orbitRing1Mat.dispose();
      orbitRing2Geo.dispose();
      orbitRing2Mat.dispose();
      certParchmentGeo.dispose();
      certParchmentMat.dispose();
      certSealGeo.dispose();
      certSealMat.dispose();
      mortarboardGeo.dispose();
      rimEdgeGeo.dispose();
      rimEdgeMat.dispose();
      crownGeo.dispose();
      buttonGeo.dispose();
      buttonMat.dispose();
      cordGeo.dispose();
      tasselMat.dispose();
      ferruleGeo.dispose();
      ferruleMat.dispose();
      skirtGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTex.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
    };
  }, [prefersReduced, hasWebGL, isLight]);

  if (prefersReduced || !hasWebGL) {
    // Accessible, high-contrast fallback for reduced-motion or systems without WebGL
    return (
      <div
        className={`relative flex items-center justify-center p-2 select-none ${className}`}
        role="img"
        aria-label="SkillBridge student graduation cap achievement emblem"
      >
        <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="capGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#19b8e6" />
              <stop offset="100%" stopColor="#ff2d95" />
            </linearGradient>
            <radialGradient id="pedestalGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#19b8e6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff2d95" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Glass pedestal reflection */}
          <ellipse cx="80" cy="125" rx="48" ry="12" fill="url(#pedestalGlow)" />
          {/* Achievement orbit ring */}
          <ellipse cx="80" cy="85" rx="60" ry="24" fill="none" stroke="url(#capGlow)" strokeWidth="1.8" opacity="0.65" />
          {/* Skull cap crown */}
          <path d="M 58 84 Q 80 96 102 84 L 98 98 Q 80 108 62 98 Z" fill="#1c2130" stroke="#2e384d" strokeWidth="1.5" />
          {/* Mortarboard diamond top plate */}
          <polygon points="80,52 128,74 80,94 32,74" fill="#151924" stroke="url(#capGlow)" strokeWidth="2.2" />
          {/* Cap button */}
          <circle cx="80" cy="73" r="4.5" fill="#19b8e6" />
          {/* Tassel cord & skirt */}
          <path d="M 80 73 Q 56 70 46 86 L 44 105" fill="none" stroke="#ff2d95" strokeWidth="2.2" strokeLinecap="round" />
          <polygon points="44,103 48,114 40,114" fill="#ff2d95" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Interactive 3D Student Achievement Scene featuring holographic graduation cap. Hover to inspect."
      className={`relative select-none cursor-pointer ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full pointer-events-none" />

      {/* Atmospheric ambient glow behind the scene */}
      <div className="pointer-events-none absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4/5 w-4/5 rounded-full bg-gradient-to-tr from-[#007ba7]/16 via-[#007ba7]/08 to-transparent blur-2xl -z-10 light:from-[#007ba7]/10" />
      <div className="pointer-events-none absolute right-1/3 top-1/2 translate-x-1/2 -translate-y-1/2 h-4/5 w-4/5 rounded-full bg-gradient-to-bl from-[#ff2d95]/16 via-[#ff2d95]/08 to-transparent blur-2xl -z-10 light:from-[#ff2d95]/10" />
    </div>
  );
}
