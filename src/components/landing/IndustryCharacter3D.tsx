"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

/**
 * Generates an ultra-detailed, high-resolution procedural micro-pore skin texture
 * with realistic epidermal micro-creases, follicle depth, and melanin variance.
 */
function createPhotorealisticSkinTexture(): {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const rCanvas = document.createElement("canvas");
  rCanvas.width = size;
  rCanvas.height = size;
  const rCtx = rCanvas.getContext("2d");

  if (!ctx || !rCtx) {
    const fallback = new THREE.CanvasTexture(canvas);
    return { normalMap: fallback, roughnessMap: fallback };
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  const rData = rCtx.createImageData(size, size);
  const rPixels = rData.data;

  // Multi-scale cellular noise for realistic human skin pores
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Primary skin pore layer
      const p1 = Math.sin(x * 0.75) * Math.cos(y * 0.75);
      // Secondary fine epidermal tension lines
      const p2 = Math.sin((x + y) * 1.5) * 0.45;
      // High-frequency skin grain
      const p3 = (Math.random() - 0.5) * 0.35;
      const height = (p1 + p2 + p3) * 0.5 + 0.5;

      // Normal map encoding: normal vectors with subtle perturbation
      const nx = Math.sin(x * 1.2) * 14;
      const ny = Math.cos(y * 1.2) * 14;
      data[idx] = Math.min(255, Math.max(0, 128 + nx));
      data[idx + 1] = Math.min(255, Math.max(0, 128 + ny));
      data[idx + 2] = Math.min(255, Math.max(0, 220 + height * 35));
      data[idx + 3] = 255;

      // Roughness variance: natural skin is between 0.38 and 0.58
      const roughVal = Math.floor(100 + height * 50);
      rPixels[idx] = roughVal;
      rPixels[idx + 1] = roughVal;
      rPixels[idx + 2] = roughVal;
      rPixels[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  rCtx.putImageData(rData, 0, 0);

  const normalMap = new THREE.CanvasTexture(canvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(10, 10);

  const roughnessMap = new THREE.CanvasTexture(rCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(10, 10);

  return { normalMap, roughnessMap };
}

/**
 * Creates high-detail tailored suit fabric weave texture.
 */
function createSuitFabricTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#222630";
  ctx.fillRect(0, 0, size, size);

  // Micro herringbone suit weave pattern
  ctx.strokeStyle = "rgba(45, 52, 68, 0.4)";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 3) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(18, 18);
  return texture;
}

/**
 * Creates high-resolution SkillBridge Recruiter ATS screen texture
 * with authentic recruitment dashboard, candidate match pills, and metrics.
 */
function createLaptopScreenTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 640;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // High-tech dark IDE / ATS interface background
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, "#090c12");
  bgGrad.addColorStop(1, "#0d131c");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Window header / title bar
  ctx.fillStyle = "#121824";
  ctx.fillRect(0, 0, width, 44);

  // Traffic lights
  ctx.fillStyle = "#ff5f56";
  ctx.beginPath();
  ctx.arc(24, 22, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffbd2e";
  ctx.beginPath();
  ctx.arc(44, 22, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#27c93f";
  ctx.beginPath();
  ctx.arc(64, 22, 6, 0, Math.PI * 2);
  ctx.fill();

  // SkillBridge Recruiter Portal Header
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("SkillBridge Talent Intelligence · Direct ATS Pipeline", 110, 28);

  // Live indicator badge
  ctx.fillStyle = "#ff2d95";
  ctx.beginPath();
  ctx.arc(930, 22, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#94a3b8";
  ctx.font = "12px sans-serif";
  ctx.fillText("LIVE SYNC", 945, 26);

  // Left Sidebar: Pipeline stages
  ctx.fillStyle = "#0e141f";
  ctx.fillRect(0, 44, 210, height - 44);

  const menuItems = ["Candidates (38)", "Active Capstones", "Interview Queue (12)", "Offer Pipeline", "Analytics & ROI"];
  menuItems.forEach((item, idx) => {
    const y = 80 + idx * 38;
    if (idx === 0) {
      ctx.fillStyle = "rgba(255, 45, 149, 0.15)";
      ctx.fillRect(12, y - 18, 186, 30);
      ctx.fillStyle = "#ff2d95";
      ctx.fillRect(12, y - 18, 3, 30);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
    } else {
      ctx.fillStyle = "#94a3b8";
      ctx.font = "13px sans-serif";
    }
    ctx.fillText(item, 30, y);
  });

  // Main Candidate Stream Cards
  const candidates = [
    { name: "Aarav Sharma", role: "Full-Stack Engineer", match: "99% Match", tags: ["Next.js", "TypeScript", "PostgreSQL"], tone: "#007ba7" },
    { name: "Priya Nair", role: "AI / ML Research Lead", match: "98% Match", tags: ["PyTorch", "AlphaFold", "CUDA"], tone: "#ff2d95" },
    { name: "Rohan Patel", role: "Cloud Systems Architect", match: "96% Match", tags: ["Kubernetes", "GCP", "Rust"], tone: "#007ba7" },
  ];

  candidates.forEach((cand, idx) => {
    const cardY = 64 + idx * 115;
    // Card background
    ctx.fillStyle = "#141c2b";
    ctx.beginPath();
    ctx.roundRect(230, cardY, 480, 100, 10);
    ctx.fill();
    ctx.strokeStyle = idx === 0 ? "rgba(255, 45, 149, 0.4)" : "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Avatar dot
    ctx.fillStyle = cand.tone;
    ctx.beginPath();
    ctx.arc(260, cardY + 36, 18, 0, Math.PI * 2);
    ctx.fill();

    // Name & Role
    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(cand.name, 290, cardY + 32);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.fillText(cand.role, 290, cardY + 50);

    // Match badge
    ctx.fillStyle = idx === 0 ? "rgba(255, 45, 149, 0.2)" : "rgba(0, 123, 167, 0.2)";
    ctx.beginPath();
    ctx.roundRect(610, cardY + 20, 85, 22, 6);
    ctx.fill();

    ctx.fillStyle = idx === 0 ? "#ff2d95" : "#38bdf8";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(cand.match, 622, cardY + 35);

    // Skill chips
    cand.tags.forEach((tag, tIdx) => {
      const chipX = 290 + tIdx * 90;
      ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
      ctx.beginPath();
      ctx.roundRect(chipX, cardY + 68, 80, 20, 4);
      ctx.fill();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "11px sans-serif";
      ctx.fillText(tag, chipX + 8, cardY + 82);
    });
  });

  // Right Side Analytics Panel: Placement ROI & Velocity
  ctx.fillStyle = "#121a28";
  ctx.beginPath();
  ctx.roundRect(730, 64, 270, 360, 12);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.stroke();

  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 14px sans-serif";
  ctx.fillText("Hiring Velocity & Metrics", 750, 96);

  // Mini Chart Bars
  const barHeights = [45, 65, 90, 125, 160, 195];
  barHeights.forEach((h, bIdx) => {
    const x = 755 + bIdx * 38;
    const y = 300 - h;
    const grad = ctx.createLinearGradient(x, y, x, 300);
    grad.addColorStop(0, bIdx > 3 ? "#ff2d95" : "#007ba7");
    grad.addColorStop(1, "rgba(14, 20, 31, 0.2)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, 24, h);
  });

  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px sans-serif";
  ctx.fillText("+142% Faster Candidate Placement", 750, 345);

  // Bottom Status Banner
  ctx.fillStyle = "rgba(255, 45, 149, 0.1)";
  ctx.fillRect(230, 435, 770, 48);
  ctx.fillStyle = "#ff2d95";
  ctx.font = "bold 13px sans-serif";
  ctx.fillText("⚡ Real-time campus hiring drive connected to 300+ accredited universities", 250, 464);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Constructs an anatomically contoured organic adult human head mesh
 * with sculpted brow, cheekbones, nose, philtrum, lips, and defined jawline.
 */
function createAnatomicalHeadGeometry(): THREE.BufferGeometry {
  const latBands = 54;
  const lonBands = 54;
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let lon = 0; lon <= lonBands; lon++) {
      const phi = (lon * 2 * Math.PI) / lonBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      // Base anatomical cranial sphere
      let rx = 0.205 * sinTheta * cosPhi;
      const ry = 0.235 * cosTheta;
      let rz = 0.225 * sinTheta * sinPhi;

      const isFace = rz > 0;
      const normY = (ry + 0.2) / 0.44; // 0 (chin) to 1 (top of head)

      if (isFace) {
        // 1. Forehead & Temples
        if (normY > 0.65) {
          rx *= 0.94; // natural temple indentation
        }

        // 2. Brow ridge & Eye socket recession
        if (normY > 0.52 && normY <= 0.65) {
          const eyeXDist = Math.abs(rx) - 0.075;
          if (Math.abs(eyeXDist) < 0.055) {
            // Orbital cavity depression
            rz *= 0.86;
          } else {
            // Glabella and supraorbital brow prominence
            rz *= 1.05;
          }
        }

        // 3. Nasal bone, bridge, and apex (nose tip)
        if (normY > 0.32 && normY <= 0.54) {
          const centerDistX = Math.abs(rx);
          if (centerDistX < 0.038) {
            const noseT = (normY - 0.32) / 0.22;
            const noseBridgeZ = Math.sin(noseT * Math.PI) * 0.082;
            rz += noseBridgeZ;
          }
          // Alar lobule flare (nostril curvature)
          if (centerDistX >= 0.022 && centerDistX < 0.048 && normY < 0.38) {
            rz += 0.016;
            rx *= 1.1;
          }
        }

        // 4. Philtrum and Upper Lip
        if (normY > 0.24 && normY <= 0.32) {
          const centerDistX = Math.abs(rx);
          if (centerDistX < 0.015) {
            // Philtrum vertical groove
            rz -= 0.005;
          }
          if (centerDistX < 0.045) {
            // Upper lip fullness & Cupid's bow
            rz += 0.018 * Math.cos(centerDistX * 35);
          }
        }

        // 5. Lower Lip and Mentolabial sulcus
        if (normY > 0.17 && normY <= 0.24) {
          const centerDistX = Math.abs(rx);
          if (centerDistX < 0.042) {
            // Vermilion lower lip fullness
            rz += 0.022;
          }
        }

        // 6. Chin (Mental protuberance)
        if (normY > 0.05 && normY <= 0.17) {
          if (Math.abs(rx) < 0.04) {
            rz += 0.028;
            rx *= 0.88;
          }
        }

        // 7. Zygomatic arch flare (cheekbones)
        if (normY > 0.35 && normY < 0.52 && Math.abs(rx) > 0.08) {
          rx *= 1.06;
          rz += 0.012;
        }

        // 8. Mandibular contour (jawline taper)
        if (normY < 0.28) {
          rx *= 0.84 + normY * 0.45;
        }
      }

      vertices.push(rx, ry, rz);
      uvs.push(lon / lonBands, lat / latBands);
    }
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const first = lat * (lonBands + 1) + lon;
      const second = first + lonBands + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Creates anatomically sculpted adult human ear geometry.
 */
function createAnatomicalEar(isLeft: boolean): THREE.Group {
  const ear = new THREE.Group();
  const sign = isLeft ? -1 : 1;

  // Outer Helix curve
  const helixCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.045, 0),
    new THREE.Vector3(sign * 0.02, -0.015, -0.01),
    new THREE.Vector3(sign * 0.022, 0.03, -0.012),
    new THREE.Vector3(sign * 0.012, 0.05, 0),
    new THREE.Vector3(0, 0.045, 0.015),
  ]);
  const helixGeom = new THREE.TubeGeometry(helixCurve, 20, 0.007, 8, false);
  const helixMesh = new THREE.Mesh(helixGeom);
  ear.add(helixMesh);

  // Conchal bowl & Fleshy lobule (earlobe)
  const lobeGeom = new THREE.SphereGeometry(0.016, 12, 12);
  const lobe = new THREE.Mesh(lobeGeom);
  lobe.position.set(sign * 0.006, -0.04, 0.004);
  lobe.scale.set(1, 1.25, 0.7);
  ear.add(lobe);

  ear.position.set(sign * 0.205, 0.13, 0.02);
  ear.rotation.y = sign * 0.25;
  ear.rotation.z = sign * -0.1;
  return ear;
}

/**
 * Cubic easing in-out for natural biomechanical acceleration
 */
function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Cubic easing out for graceful settling
 */
function easeOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 3);
}

interface IndustryProps {
  isHovered?: boolean;
  onSequenceComplete?: () => void;
  className?: string;
}

export default function IndustryCharacter3D({
  isHovered = false,
  onSequenceComplete,
  className = "",
}: IndustryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  // Animation states
  const [animStage, setAnimStage] = useState<"idle" | "opening" | "typing" | "settled">("idle");
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Refs for trigger control
  const triggerSequenceRef = useRef<() => void>(() => {});
  const shouldReplayOnFinishRef = useRef<boolean>(false);
  const prevHoveredRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(isHovered);

  // Sync isHoveredRef
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Hover detection: trigger automatically when pointer enters the card
  useEffect(() => {
    if (isHovered && !prevHoveredRef.current) {
      triggerSequenceRef.current();
    } else if (!isHovered) {
      // Pointer left the card; reset queued replay
      shouldReplayOnFinishRef.current = false;
    }
    prevHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || prefersReduced) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 280;

    // 1. Scene, Camera, and High-Performance Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 50);
    // Framed to showcase the upper torso, face, hands, and the open glowing laptop
    camera.position.set(0, 0.32, 2.75);

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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // 2. Physically Plausible Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xf1f5f9, 0.95);
    scene.add(ambientLight);

    // Key Light: Warm natural portrait key light
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 3.0);
    keyLight.position.set(2.2, 3.4, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Fill Light: Soft neutral cool fill
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.2);
    fillLight.position.set(-2.2, 1.2, 2.2);
    scene.add(fillLight);

    // SkillBridge Signature Rim Lights: Neon Pink (#FF2D95) & Cerulean Blue (#007BA7)
    const pinkRimLight = new THREE.DirectionalLight(0xff2d95, 3.6);
    pinkRimLight.position.set(2.4, 1.8, -2.0);
    scene.add(pinkRimLight);

    const blueRimLight = new THREE.DirectionalLight(0x007ba7, 2.8);
    blueRimLight.position.set(-2.4, 1.6, -1.8);
    scene.add(blueRimLight);

    // Laptop Screen Emission Point Light (Casts soft pink/cyan glow onto hands and face)
    const screenEmissionLight = new THREE.PointLight(0xff2d95, 0, 1.6);
    screenEmissionLight.position.set(0, 0.15, 0.35);
    scene.add(screenEmissionLight);

    // 3. Materials and Textures
    const { normalMap: skinNormal, roughnessMap: skinRoughness } = createPhotorealisticSkinTexture();
    const suitTexture = createSuitFabricTexture();
    const screenTexture = createLaptopScreenTexture();

    // Photorealistic Subsurface Skin Material
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdfa98e, // Warm healthy adult tone
      roughness: 0.48,
      metalness: 0.0,
      clearcoat: 0.18,
      clearcoatRoughness: 0.35,
      normalMap: skinNormal,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughnessMap: skinRoughness,
    });

    // Tailored Charcoal Navy Suit Material
    const suitMaterial = new THREE.MeshStandardMaterial({
      color: 0x181e29,
      roughness: 0.82,
      metalness: 0.08,
      bumpMap: suitTexture,
      bumpScale: 0.008,
    });

    // Formal Shirt Material
    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Contemporary midnight tech inner
      roughness: 0.75,
      metalness: 0.05,
    });

    // Realistic Eye Material
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x2d1a0e, roughness: 0.3 }); // Dark amber hazel
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.15,
      opacity: 0.95,
      transparent: true,
      roughness: 0.04,
      clearcoat: 0.98,
      clearcoatRoughness: 0.02,
    });

    // Modern Styled Hair Material
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x1a1512,
      roughness: 0.65,
      metalness: 0.15,
    });

    // Laptop Materials
    const laptopChassisMat = new THREE.MeshStandardMaterial({
      color: 0x222630, // Space gray anodized aluminum
      metalness: 0.85,
      roughness: 0.28,
    });

    const laptopTrackpadMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a303c,
      metalness: 0.65,
      roughness: 0.15,
      clearcoat: 0.8,
    });

    const laptopKeyMat = new THREE.MeshStandardMaterial({
      color: 0x11141a,
      roughness: 0.5,
      metalness: 0.2,
    });

    const laptopScreenMat = new THREE.MeshStandardMaterial({
      map: screenTexture,
      emissive: new THREE.Color(0xff2d95),
      emissiveMap: screenTexture,
      emissiveIntensity: 0.0, // Off initially; increases as lid opens
      roughness: 0.18,
      metalness: 0.1,
    });

    // 4. Build Hierarchy: Character & Prop Rig
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // A. Torso & Spine
    const spinePivot = new THREE.Group();
    spinePivot.position.set(0, -0.42, 0);
    mainGroup.add(spinePivot);

    // Sculpted Suit Body
    const suitGeom = new THREE.CylinderGeometry(0.24, 0.21, 0.52, 24);
    suitGeom.scale(1.15, 1, 0.78);
    const suitMesh = new THREE.Mesh(suitGeom, suitMaterial);
    suitMesh.position.set(0, 0.22, 0);
    suitMesh.castShadow = true;
    spinePivot.add(suitMesh);

    // Inner Shirt Collar Opening
    const shirtGeom = new THREE.ConeGeometry(0.11, 0.22, 16);
    shirtGeom.scale(1, 1, 0.6);
    const shirtMesh = new THREE.Mesh(shirtGeom, shirtMaterial);
    shirtMesh.position.set(0, 0.36, 0.08);
    shirtMesh.rotation.x = 0.2;
    spinePivot.add(shirtMesh);

    // Neck
    const neckGeom = new THREE.CylinderGeometry(0.082, 0.096, 0.16, 20);
    const neck = new THREE.Mesh(neckGeom, skinMaterial);
    neck.position.set(0, 0.46, -0.01);
    neck.castShadow = true;
    spinePivot.add(neck);

    // B. Anatomical Head
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.62, 0);
    spinePivot.add(headPivot);

    const headGeometry = createAnatomicalHeadGeometry();
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    // Anatomical Ears
    headPivot.add(createAnatomicalEar(true));
    headPivot.add(createAnatomicalEar(false));

    // Dual-Layered Eyes
    function createRealisticEye(isLeft: boolean): THREE.Group {
      const eyeGroup = new THREE.Group();
      const xSign = isLeft ? -1 : 1;

      const scleraGeom = new THREE.SphereGeometry(0.024, 16, 16);
      const sclera = new THREE.Mesh(scleraGeom, eyeWhiteMat);
      eyeGroup.add(sclera);

      const irisGeom = new THREE.CircleGeometry(0.013, 16);
      const iris = new THREE.Mesh(irisGeom, irisMat);
      iris.position.set(0, 0, 0.023);
      eyeGroup.add(iris);

      const pupilGeom = new THREE.CircleGeometry(0.006, 12);
      const pupil = new THREE.Mesh(pupilGeom, new THREE.MeshBasicMaterial({ color: 0x050505 }));
      pupil.position.set(0, 0, 0.0235);
      eyeGroup.add(pupil);

      const corneaGeom = new THREE.SphereGeometry(0.025, 16, 16);
      const cornea = new THREE.Mesh(corneaGeom, corneaMat);
      eyeGroup.add(cornea);

      eyeGroup.position.set(xSign * 0.076, 0.038, 0.178);
      return eyeGroup;
    }

    const eyeL = createRealisticEye(true);
    const eyeR = createRealisticEye(false);
    headPivot.add(eyeL);
    headPivot.add(eyeR);

    // Styled Professional Hair
    const hairGroup = new THREE.Group();
    const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.228, 20, 20), hairMat);
    hairCrown.position.set(0, 0.07, -0.02);
    hairCrown.scale.set(1.04, 1.05, 1.08);
    hairGroup.add(hairCrown);

    // Textured side sweep & parted locks
    const locks = [
      { pos: [-0.07, 0.17, 0.14], rot: [0.2, -0.1, -0.2], scale: [0.09, 0.05, 0.08] },
      { pos: [0.04, 0.18, 0.14], rot: [0.15, 0.1, 0.15], scale: [0.11, 0.06, 0.09] },
      { pos: [0.13, 0.15, 0.11], rot: [0.1, 0.3, 0.35], scale: [0.08, 0.05, 0.07] },
      { pos: [-0.14, 0.13, 0.1], rot: [0.1, -0.3, -0.35], scale: [0.08, 0.05, 0.07] },
    ];
    locks.forEach(({ pos, rot, scale }) => {
      const lockMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), hairMat);
      lockMesh.position.set(pos[0], pos[1], pos[2]);
      lockMesh.rotation.set(rot[0], rot[1], rot[2]);
      lockMesh.scale.set(scale[0], scale[1], scale[2]);
      hairGroup.add(lockMesh);
    });
    headPivot.add(hairGroup);

    // Mouth group for focused professional micro-expressions
    const mouthGroup = new THREE.Group();
    const lipGeom = new THREE.CylinderGeometry(0.007, 0.007, 0.046, 12);
    const lipMesh = new THREE.Mesh(lipGeom, new THREE.MeshStandardMaterial({ color: 0x9b5d52, roughness: 0.4 }));
    lipMesh.rotation.z = Math.PI / 2;
    mouthGroup.add(lipMesh);
    mouthGroup.position.set(0, -0.085, 0.198);
    headPivot.add(mouthGroup);

    // C. Arm & Articulated Hands Hierarchy
    function buildArticulatedArm(isRight: boolean) {
      const sign = isRight ? 1 : -1;
      const clavicle = new THREE.Group();
      clavicle.position.set(sign * 0.14, 0.35, 0);
      spinePivot.add(clavicle);

      const shoulder = new THREE.Group();
      shoulder.position.set(sign * 0.11, -0.04, 0);
      clavicle.add(shoulder);

      // Upper Arm
      const bicepGeom = new THREE.CylinderGeometry(0.058, 0.052, 0.24, 16);
      const bicep = new THREE.Mesh(bicepGeom, suitMaterial);
      bicep.position.set(0, -0.12, 0);
      shoulder.add(bicep);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.24, 0);
      shoulder.add(elbow);

      // Forearm with suit sleeve cuff
      const forearmGeom = new THREE.CylinderGeometry(0.048, 0.042, 0.22, 16);
      const forearm = new THREE.Mesh(forearmGeom, suitMaterial);
      forearm.position.set(0, -0.11, 0);
      elbow.add(forearm);

      const wrist = new THREE.Group();
      wrist.position.set(0, -0.22, 0);
      elbow.add(wrist);

      // Articulated Hand
      const handGroup = new THREE.Group();
      wrist.add(handGroup);

      const palmGeom = new THREE.BoxGeometry(0.055, 0.065, 0.022);
      const palm = new THREE.Mesh(palmGeom, skinMaterial);
      palm.position.set(0, -0.032, 0);
      palm.castShadow = true;
      handGroup.add(palm);

      // Thumb
      const thumb = new THREE.Group();
      thumb.position.set(sign * -0.026, -0.02, 0.008);
      const thumbMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.009, 0.038, 8), skinMaterial);
      thumbMesh.position.set(0, -0.018, 0);
      thumb.add(thumbMesh);
      handGroup.add(thumb);

      // 4 Articulated Fingers
      const fingerList: THREE.Group[] = [];
      for (let f = 0; f < 4; f++) {
        const finger = new THREE.Group();
        const fX = (f - 1.5) * 0.013;
        finger.position.set(fX, -0.065, 0);

        const fMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0085, 0.0075, 0.042, 8),
          skinMaterial
        );
        fMesh.position.set(0, -0.02, 0);
        finger.add(fMesh);

        handGroup.add(finger);
        fingerList.push(finger);
      }

      return { clavicle, shoulder, elbow, wrist, handGroup, thumb, fingerList };
    }

    const armL = buildArticulatedArm(false);
    const armR = buildArticulatedArm(true);

    // Initial resting arm transforms (ready on keyboard home row)
    armL.shoulder.rotation.set(0.65, -0.22, 0.28);
    armL.elbow.rotation.set(-1.15, 0, 0);
    armL.wrist.rotation.set(-0.25, -0.18, 0.12);

    armR.shoulder.rotation.set(0.65, 0.22, -0.28);
    armR.elbow.rotation.set(-1.15, 0, 0);
    armR.wrist.rotation.set(-0.25, 0.18, -0.12);

    // D. 3D Sleek Aluminum Unibody Laptop
    const laptopGroup = new THREE.Group();
    // Positioned conveniently on the desk in front of the professional
    laptopGroup.position.set(0, -0.14, 0.44);
    mainGroup.add(laptopGroup);

    // Laptop Base Chassis
    const baseGeom = new THREE.BoxGeometry(0.42, 0.016, 0.28);
    const baseMesh = new THREE.Mesh(baseGeom, laptopChassisMat);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    laptopGroup.add(baseMesh);

    // Trackpad
    const trackpadGeom = new THREE.PlaneGeometry(0.12, 0.075);
    const trackpad = new THREE.Mesh(trackpadGeom, laptopTrackpadMat);
    trackpad.rotation.x = -Math.PI / 2;
    trackpad.position.set(0, 0.009, 0.075);
    laptopGroup.add(trackpad);

    // Recessed Keyboard Well
    const keyboardWellGeom = new THREE.PlaneGeometry(0.36, 0.13);
    const keyboardWell = new THREE.Mesh(keyboardWellGeom, laptopKeyMat);
    keyboardWell.rotation.x = -Math.PI / 2;
    keyboardWell.position.set(0, 0.009, -0.04);
    laptopGroup.add(keyboardWell);

    // Key rows representation for realistic chiclet keys
    for (let r = 0; r < 5; r++) {
      const rowZ = -0.088 + r * 0.024;
      const keyRowGeom = new THREE.BoxGeometry(0.34, 0.004, 0.018);
      const keyRow = new THREE.Mesh(keyRowGeom, laptopKeyMat);
      keyRow.position.set(0, 0.011, rowZ);
      laptopGroup.add(keyRow);
    }

    // Display Lid Hinge Group (Pivot at rear of base)
    const hingeGroup = new THREE.Group();
    hingeGroup.position.set(0, 0.008, -0.14);
    laptopGroup.add(hingeGroup);

    // Hinge Cylinder
    const hingeCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.006, 0.006, 0.38, 16),
      laptopChassisMat
    );
    hingeCyl.rotation.z = Math.PI / 2;
    hingeGroup.add(hingeCyl);

    // Lid Display Assembly
    const lidAssembly = new THREE.Group();
    hingeGroup.add(lidAssembly);

    // Aluminum Back Cover
    const lidBackGeom = new THREE.BoxGeometry(0.42, 0.27, 0.008);
    const lidBack = new THREE.Mesh(lidBackGeom, laptopChassisMat);
    lidBack.position.set(0, 0.135, -0.004);
    lidBack.castShadow = true;
    lidAssembly.add(lidBack);

    // Inner Display Screen (Illuminated 16:10 aspect display)
    const screenGeom = new THREE.PlaneGeometry(0.40, 0.25);
    const screenMesh = new THREE.Mesh(screenGeom, laptopScreenMat);
    screenMesh.position.set(0, 0.135, 0.001);
    lidAssembly.add(screenMesh);

    // Initial Lid State: Slightly open at rest (~15 deg)
    let currentLidAngle = 0.26; // ~15 degrees
    hingeGroup.rotation.x = currentLidAngle;

    // Subtle Desk Surface Reflection
    const deskGeom = new THREE.PlaneGeometry(1.6, 1.2);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0a0d14,
      roughness: 0.25,
      metalness: 0.4,
    });
    const desk = new THREE.Mesh(deskGeom, deskMat);
    desk.rotation.x = -Math.PI / 2;
    desk.position.set(0, -0.148, 0.35);
    desk.receiveShadow = true;
    mainGroup.add(desk);

    // 5. Kinematics State & Parallax Tracking
    const startTime = performance.now();
    let lastTime = startTime;

    let targetLookX = 0;
    let targetLookY = 0;
    let currentLookX = 0;
    let currentLookY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetLookX = x * 0.12;
      targetLookY = y * 0.08;
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });

    // Interaction Sequencer
    let sequenceActive = false;
    let currentPhase: "idle" | "opening" | "typing" = "idle";
    let phaseTime = 0;

    const startInteractionSequence = () => {
      if (sequenceActive && currentPhase === "typing") {
        // If already in active typing loop, refresh attention without snapping
        return;
      }
      sequenceActive = true;
      currentPhase = "opening";
      phaseTime = 0;
      setIsAnimating(true);
      setAnimStage("opening");
    };

    triggerSequenceRef.current = startInteractionSequence;

    // 6. Main Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const totalTime = (now - startTime) / 1000;

      // Parallax smooth interpolation
      currentLookX += (targetLookX - currentLookX) * 0.06;
      currentLookY += (targetLookY - currentLookY) * 0.06;

      // Natural subtle breathing cycle
      const breath = Math.sin(totalTime * 2.1) * 0.016;
      spinePivot.position.y = -0.42 + breath * 0.1;
      spinePivot.rotation.x = breath * 0.15;

      // Realistic eye blinking
      const blinkCycle = totalTime % 3.6;
      const isBlinking = blinkCycle > 3.42 && blinkCycle < 3.55;
      const blinkScale = isBlinking ? 0.08 : 1.0;
      eyeL.scale.y += (blinkScale - eyeL.scale.y) * 0.45;
      eyeR.scale.y += (blinkScale - eyeR.scale.y) * 0.45;

      // State Machine Handling
      if (!sequenceActive) {
        // Resting Calm State
        headPivot.rotation.y = currentLookX * 0.6;
        headPivot.rotation.x = -currentLookY * 0.5 - 0.05;

        // Lid rests at slight angle (~15 deg)
        currentLidAngle += (0.26 - currentLidAngle) * 0.05;
        hingeGroup.rotation.x = currentLidAngle;

        // Screen is dim / standby
        laptopScreenMat.emissiveIntensity = Math.max(0, laptopScreenMat.emissiveIntensity - delta * 1.5);
        screenEmissionLight.intensity = Math.max(0, screenEmissionLight.intensity - delta * 1.5);

        // Hands rest lightly beside trackpad
        armL.shoulder.rotation.set(0.62, -0.2, 0.25);
        armL.elbow.rotation.set(-1.18, 0, 0);

        armR.shoulder.rotation.set(0.62, 0.2, -0.25);
        armR.elbow.rotation.set(-1.18, 0, 0);
      } else {
        phaseTime += delta;

        if (currentPhase === "opening") {
          // Phase 1 & 2: Reaching to lid and smoothly opening to ergonomic viewing angle (1.8s)
          const p = easeInOutCubic(phaseTime / 1.8);

          // Lid opens from 15 deg (0.26 rad) to 112 deg (1.95 rad)
          currentLidAngle = THREE.MathUtils.lerp(0.26, 1.95, p);
          hingeGroup.rotation.x = currentLidAngle;

          // As lid opens past 45 deg, screen emission illuminates cleanly
          const screenPower = easeOutCubic(Math.max(0, (p - 0.25) / 0.75));
          laptopScreenMat.emissiveIntensity = screenPower * 0.85;
          screenEmissionLight.intensity = screenPower * 1.8;

          // Right arm reaches up to lid edge, then guides it open
          if (p < 0.6) {
            const reachP = easeInOutCubic(p / 0.6);
            armR.shoulder.rotation.x = THREE.MathUtils.lerp(0.62, 0.85, reachP);
            armR.shoulder.rotation.y = THREE.MathUtils.lerp(0.2, 0.05, reachP);
            armR.elbow.rotation.x = THREE.MathUtils.lerp(-1.18, -0.92, reachP);
            armR.wrist.rotation.x = THREE.MathUtils.lerp(-0.25, -0.1, reachP);
          } else {
            const settleP = easeInOutCubic((p - 0.6) / 0.4);
            // Hand settles from lid back toward keyboard home row
            armR.shoulder.rotation.x = THREE.MathUtils.lerp(0.85, 0.68, settleP);
            armR.shoulder.rotation.y = THREE.MathUtils.lerp(0.05, 0.18, settleP);
            armR.elbow.rotation.x = THREE.MathUtils.lerp(-0.92, -1.22, settleP);
            armR.wrist.rotation.x = THREE.MathUtils.lerp(-0.1, -0.22, settleP);
          }

          // Left hand slides into home-row position
          armL.shoulder.rotation.x = THREE.MathUtils.lerp(0.62, 0.68, p);
          armL.elbow.rotation.x = THREE.MathUtils.lerp(-1.18, -1.22, p);

          // Head angles downward with focused gaze toward the emerging screen
          headPivot.rotation.x = THREE.MathUtils.lerp(-0.05, 0.16, p);
          headPivot.rotation.y = THREE.MathUtils.lerp(currentLookX * 0.6, -0.02, p);

          if (phaseTime >= 1.8) {
            currentPhase = "typing";
            phaseTime = 0;
            setAnimStage("typing");
            setHasInteracted(true);
          }
        } else if (currentPhase === "typing") {
          // Phase 3 & 4: Continuous Organic Typing & Professional Working Pose
          // Steady open lid
          hingeGroup.rotation.x = 1.95;

          // Screen active with subtle data activity flicker
          const dataPulse = Math.sin(totalTime * 3.5) * 0.05;
          laptopScreenMat.emissiveIntensity = 0.85 + dataPulse;
          screenEmissionLight.intensity = 1.8 + dataPulse * 2;

          // Head maintains focused reading posture, with natural gaze shift between candidate columns
          const gazeShift = Math.sin(totalTime * 0.8) * 0.04;
          headPivot.rotation.x = 0.15 + breath * 0.3;
          headPivot.rotation.y = gazeShift + currentLookX * 0.3;

          // Realistic organic typing rhythm on home row
          // Left hand fingers alternate keystrokes
          const tL1 = Math.sin(totalTime * 7.5);
          const tL2 = Math.sin(totalTime * 7.5 + 1.6);
          const tL3 = Math.sin(totalTime * 7.5 + 3.2);

          armL.fingerList[0].rotation.x = Math.max(0, tL1 * 0.18); // Index
          armL.fingerList[1].rotation.x = Math.max(0, tL2 * 0.22); // Middle
          armL.fingerList[2].rotation.x = Math.max(0, tL3 * 0.15); // Ring
          armL.thumb.rotation.x = Math.max(0, Math.sin(totalTime * 3.2) * 0.12);

          // Right hand fingers alternate keystrokes
          const tR1 = Math.cos(totalTime * 8.2);
          const tR2 = Math.cos(totalTime * 8.2 + 1.4);
          const tR3 = Math.cos(totalTime * 8.2 + 2.8);

          armR.fingerList[0].rotation.x = Math.max(0, tR1 * 0.20); // Index
          armR.fingerList[1].rotation.x = Math.max(0, tR2 * 0.17); // Middle
          armR.fingerList[2].rotation.x = Math.max(0, tR3 * 0.22); // Ring
          armR.thumb.rotation.x = Math.max(0, Math.cos(totalTime * 3.5) * 0.14);

          // Subtle wrist micro-motion while typing
          armL.wrist.rotation.x = -0.22 + Math.sin(totalTime * 4.0) * 0.015;
          armR.wrist.rotation.x = -0.22 + Math.cos(totalTime * 4.2) * 0.015;

          // If pointer left the card while typing, settle into comfortable working idle
          if (!isHoveredRef.current && phaseTime > 2.5) {
            // Calm working idle: hands rest on keyboard, gentle breathing
            armL.fingerList.forEach((f) => (f.rotation.x *= 0.88));
            armR.fingerList.forEach((f) => (f.rotation.x *= 0.88));
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 320;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      headGeometry.dispose();
      skinNormal.dispose();
      skinRoughness.dispose();
      suitTexture.dispose();
      screenTexture.dispose();
    };
  }, [prefersReduced, onSequenceComplete]);

  if (prefersReduced) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="3D Photorealistic Industry Recruiter — Hover over card to view live interaction"
      className={`relative overflow-hidden rounded-2xl select-none group/ind pointer-events-none ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full pointer-events-none" />

      {/* Subtle Depth Backlight: SkillBridge Neon Pink Glow */}
      <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-24 w-3/4 rounded-full bg-sb-pink/15 blur-2xl" />

      {/* Hover Status Indicator Badge */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 rounded-xl border border-white/10 light:border-black/10 bg-black/60 light:bg-white/85 px-3 py-1.5 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                isAnimating ? "bg-sb-pink" : "bg-sb-cyan"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isAnimating ? "bg-sb-pink" : "bg-sb-cyan"
              }`}
            />
          </span>
          <span className="text-[11px] font-semibold tracking-wide text-sb-text">
            {isAnimating
              ? animStage === "opening"
                ? "Opening Pipeline..."
                : "Active Recruiter 💻"
              : hasInteracted
              ? "Pipeline Active 💻"
              : "Hover to Review Pipeline 💻"}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-medium text-sb-muted">
          {hasInteracted ? (
            <CheckCircle2 size={12} className="text-sb-pink" />
          ) : (
            <Sparkles size={11} className="text-sb-pink" />
          )}
          <span>{hasInteracted ? "Connected" : "Hover Reactive"}</span>
        </div>
      </div>
    </div>
  );
}
