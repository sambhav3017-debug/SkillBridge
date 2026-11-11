"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

/**
 * Generates an ultra-detailed, high-resolution procedural micro-pore skin texture
 * with realistic epidermal micro-creases, follicle depth, and natural melanin variance.
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

      // Roughness variance: natural skin is between 0.40 and 0.58
      const roughVal = Math.floor(105 + height * 48);
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
 * Creates academic tweed / herringbone wool fabric bump texture.
 */
function createAcademicTweedTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // Herringbone twill weave
  ctx.strokeStyle = "rgba(25, 25, 25, 0.4)";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 4) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size / 2, i + 8);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/**
 * Creates vintage embossed leather book cover texture.
 */
function createLeatherBookTexture(title: string, color: string): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Rich leather background
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  // Subtle leather grain
  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Gold foil embossed borders
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, width - 60, height - 60);
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Gold embossed title & University insignia crest
  ctx.fillStyle = "#d4af37";
  ctx.font = "bold 24px 'Times New Roman', serif";
  ctx.textAlign = "center";
  ctx.fillText(title, width / 2, 140);

  ctx.font = "italic 16px 'Times New Roman', serif";
  ctx.fillText("Academic Curriculum & Outcomes", width / 2, 180);

  // Embossed University Seal
  ctx.beginPath();
  ctx.arc(width / 2, 280, 48, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = "bold 32px serif";
  ctx.fillText("🏛️", width / 2, 292);

  const texture = new THREE.CanvasTexture(canvas);
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
          rx *= 0.94;
        }

        // 2. Brow ridge & Eye socket recession
        if (normY > 0.52 && normY <= 0.65) {
          const eyeXDist = Math.abs(rx) - 0.075;
          if (Math.abs(eyeXDist) < 0.055) {
            rz *= 0.86; // Orbital cavity depression
          } else {
            rz *= 1.05; // Glabella and supraorbital brow
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
          if (centerDistX >= 0.022 && centerDistX < 0.048 && normY < 0.38) {
            rz += 0.016;
            rx *= 1.1;
          }
        }

        // 4. Philtrum and Upper Lip
        if (normY > 0.24 && normY <= 0.32) {
          const centerDistX = Math.abs(rx);
          if (centerDistX < 0.015) {
            rz -= 0.005;
          }
          if (centerDistX < 0.045) {
            rz += 0.018 * Math.cos(centerDistX * 35);
          }
        }

        // 5. Lower Lip and Mentolabial sulcus
        if (normY > 0.17 && normY <= 0.24) {
          const centerDistX = Math.abs(rx);
          if (centerDistX < 0.042) {
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

interface AcademiaProps {
  isHovered?: boolean;
  onSequenceComplete?: () => void;
  className?: string;
}

export default function AcademiaCharacter3D({
  isHovered = false,
  onSequenceComplete,
  className = "",
}: AcademiaProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  // Animation states
  const [animStage, setAnimStage] = useState<"idle" | "awareness" | "welcoming" | "mentoring" | "poised">("idle");
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
    // Framed for confident portrait: upper torso, academic attire, arms holding books, and expressive face
    camera.position.set(0, 0.38, 2.75);

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

    // 2. Physically Plausible Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.95);
    scene.add(ambientLight);

    // Warm natural key light
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 3.2);
    keyLight.position.set(2.4, 3.4, 2.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Soft neutral fill
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.25);
    fillLight.position.set(-2.4, 1.2, 2.2);
    scene.add(fillLight);

    // SkillBridge Signature Rim Lights: Wisdom Cerulean Blue (#007BA7) & Warm Amber Gold (#D4AF37)
    const blueRimLight = new THREE.DirectionalLight(0x007ba7, 3.6);
    blueRimLight.position.set(-2.4, 1.8, -2.0);
    scene.add(blueRimLight);

    const goldRimLight = new THREE.DirectionalLight(0xd4af37, 2.6);
    goldRimLight.position.set(2.4, 1.6, -1.8);
    scene.add(goldRimLight);

    // Subtle knowledge accent light over the books
    const bookAccentLight = new THREE.PointLight(0xd4af37, 0.8, 1.4);
    bookAccentLight.position.set(-0.25, 0.1, 0.35);
    scene.add(bookAccentLight);

    // 3. Materials and Textures
    const { normalMap: skinNormal, roughnessMap: skinRoughness } = createPhotorealisticSkinTexture();
    const tweedTexture = createAcademicTweedTexture();
    const bookCoverBlue = createLeatherBookTexture("Higher Education", "#14223d");
    const bookCoverCrimson = createLeatherBookTexture("Curriculum & Governance", "#3f1218");

    // Subsurface Skin Material
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

    // Academic Tweed Blazer Material (Charcoal Olive Tweed)
    const blazerMaterial = new THREE.MeshStandardMaterial({
      color: 0x24282c,
      roughness: 0.88,
      metalness: 0.05,
      bumpMap: tweedTexture,
      bumpScale: 0.009,
    });

    // Suede Elbow Patch Material
    const elbowPatchMat = new THREE.MeshStandardMaterial({
      color: 0x422f20,
      roughness: 0.92,
      metalness: 0.02,
    });

    // Oxford Collared Dress Shirt Material
    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.72,
      metalness: 0.02,
    });

    // Dark Silk Tie Material
    const tieMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.45,
      metalness: 0.12,
    });

    // Eye Materials
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25 });
    const irisMat = new THREE.MeshStandardMaterial({ color: 0x24180f, roughness: 0.3 }); // Chestnut hazel
    const corneaMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.15,
      opacity: 0.95,
      transparent: true,
      roughness: 0.04,
      clearcoat: 0.98,
      clearcoatRoughness: 0.02,
    });

    // Distinguished Hair Material (Subtle silver-touched temple highlights)
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x23201d,
      roughness: 0.68,
      metalness: 0.12,
    });

    // Professorial Spectacles Wireframe Materials
    const glassFrameMat = new THREE.MeshStandardMaterial({
      color: 0xb58d3d, // Refined brushed tortoiseshell / gold wire
      metalness: 0.85,
      roughness: 0.2,
    });

    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      clearcoat: 0.95,
      ior: 1.5,
    });

    // 4. Character Hierarchy
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // A. Torso & Spine
    const spinePivot = new THREE.Group();
    spinePivot.position.set(0, -0.42, 0);
    mainGroup.add(spinePivot);

    // Tailored Tweed Blazer
    const blazerGeom = new THREE.CylinderGeometry(0.24, 0.21, 0.52, 24);
    blazerGeom.scale(1.15, 1, 0.78);
    const blazerMesh = new THREE.Mesh(blazerGeom, blazerMaterial);
    blazerMesh.position.set(0, 0.22, 0);
    blazerMesh.castShadow = true;
    spinePivot.add(blazerMesh);

    // Collared Dress Shirt
    const shirtGeom = new THREE.ConeGeometry(0.11, 0.22, 16);
    shirtGeom.scale(1, 1, 0.6);
    const shirtMesh = new THREE.Mesh(shirtGeom, shirtMaterial);
    shirtMesh.position.set(0, 0.36, 0.08);
    shirtMesh.rotation.x = 0.2;
    spinePivot.add(shirtMesh);

    // Tie
    const tieGeom = new THREE.BoxGeometry(0.032, 0.24, 0.012);
    const tieMesh = new THREE.Mesh(tieGeom, tieMaterial);
    tieMesh.position.set(0, 0.3, 0.095);
    tieMesh.rotation.x = 0.15;
    spinePivot.add(tieMesh);

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

    // Refined Professorial Spectacles
    const glassesGroup = new THREE.Group();
    [-0.076, 0.076].forEach((xPos) => {
      // Wire rims
      const rimGeom = new THREE.TorusGeometry(0.032, 0.003, 10, 24);
      const rim = new THREE.Mesh(rimGeom, glassFrameMat);
      rim.position.set(xPos, 0.038, 0.208);
      glassesGroup.add(rim);

      // Glass lens
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.03, 16), lensMat);
      lens.position.set(xPos, 0.038, 0.208);
      glassesGroup.add(lens);
    });

    // Glasses bridge
    const bridgeGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.038, 8);
    const bridge = new THREE.Mesh(bridgeGeom, glassFrameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.044, 0.208);
    glassesGroup.add(bridge);
    headPivot.add(glassesGroup);

    // Distinguished Hair
    const hairGroup = new THREE.Group();
    const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.226, 20, 20), hairMat);
    hairCrown.position.set(0, 0.07, -0.02);
    hairCrown.scale.set(1.04, 1.05, 1.08);
    hairGroup.add(hairCrown);

    // Styled professorial waves & side locks
    const locks = [
      { pos: [-0.08, 0.17, 0.14], rot: [0.2, -0.1, -0.15], scale: [0.09, 0.05, 0.08] },
      { pos: [0.05, 0.18, 0.14], rot: [0.15, 0.1, 0.15], scale: [0.11, 0.06, 0.09] },
      { pos: [0.13, 0.14, 0.11], rot: [0.1, 0.3, 0.3], scale: [0.08, 0.05, 0.07] },
      { pos: [-0.14, 0.13, 0.1], rot: [0.1, -0.3, -0.3], scale: [0.08, 0.05, 0.07] },
    ];
    locks.forEach(({ pos, rot, scale }) => {
      const lockMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10), hairMat);
      lockMesh.position.set(pos[0], pos[1], pos[2]);
      lockMesh.rotation.set(rot[0], rot[1], rot[2]);
      lockMesh.scale.set(scale[0], scale[1], scale[2]);
      hairGroup.add(lockMesh);
    });
    headPivot.add(hairGroup);

    // Warm, Genuine Mentorship Smile & Mouth
    const mouthGroup = new THREE.Group();
    const lipGeom = new THREE.CylinderGeometry(0.0075, 0.0075, 0.048, 12);
    const lipMesh = new THREE.Mesh(lipGeom, new THREE.MeshStandardMaterial({ color: 0x9b5d52, roughness: 0.42 }));
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
      const bicep = new THREE.Mesh(bicepGeom, blazerMaterial);
      bicep.position.set(0, -0.12, 0);
      shoulder.add(bicep);

      const elbow = new THREE.Group();
      elbow.position.set(0, -0.24, 0);
      shoulder.add(elbow);

      // Suede Elbow Patch
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), elbowPatchMat);
      patch.scale.set(0.6, 1.2, 0.8);
      patch.position.set(0, 0, -0.025);
      elbow.add(patch);

      // Forearm
      const forearmGeom = new THREE.CylinderGeometry(0.048, 0.042, 0.22, 16);
      const forearm = new THREE.Mesh(forearmGeom, blazerMaterial);
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

    // D. Academic Props: Leather-Bound Books & Institutional Syllabus Dossier
    const booksGroup = new THREE.Group();
    // Naturally cradled in left arm
    booksGroup.position.set(-0.22, 0.08, 0.22);
    booksGroup.rotation.set(0.35, 0.45, -0.22);
    spinePivot.add(booksGroup);

    // Book 1: Crimson Leather Volume (Bottom)
    const book1Geom = new THREE.BoxGeometry(0.24, 0.05, 0.32);
    const book1Mat = new THREE.MeshStandardMaterial({
      map: bookCoverCrimson,
      roughness: 0.65,
      metalness: 0.15,
    });
    const book1 = new THREE.Mesh(book1Geom, book1Mat);
    book1.castShadow = true;
    booksGroup.add(book1);

    // Gold gilded page edges
    const pagesGeom = new THREE.BoxGeometry(0.23, 0.044, 0.308);
    const pagesMat = new THREE.MeshStandardMaterial({ color: 0xdfc06e, roughness: 0.4, metalness: 0.5 });
    const pages1 = new THREE.Mesh(pagesGeom, pagesMat);
    pages1.position.set(0.006, 0, 0.004);
    book1.add(pages1);

    // Book 2: Navy Leather Bound Volume (Top)
    const book2Geom = new THREE.BoxGeometry(0.22, 0.044, 0.30);
    const book2Mat = new THREE.MeshStandardMaterial({
      map: bookCoverBlue,
      roughness: 0.62,
      metalness: 0.18,
    });
    const book2 = new THREE.Mesh(book2Geom, book2Mat);
    book2.position.set(0.01, 0.048, -0.01);
    book2.castShadow = true;
    booksGroup.add(book2);

    // Bookmark silk ribbon in Cerulean Blue
    const ribbonGeom = new THREE.BoxGeometry(0.014, 0.002, 0.12);
    const ribbonMat = new THREE.MeshStandardMaterial({ color: 0x007ba7, roughness: 0.3 });
    const ribbon = new THREE.Mesh(ribbonGeom, ribbonMat);
    ribbon.position.set(0.04, 0.024, 0.16);
    ribbon.rotation.x = 0.25;
    book2.add(ribbon);

    // Initial resting arm transforms:
    // Left arm securely cradles the books
    armL.shoulder.rotation.set(0.48, -0.32, 0.42);
    armL.elbow.rotation.set(-1.32, 0.25, 0.15);
    armL.wrist.rotation.set(-0.15, 0.35, -0.22);
    // Left fingers curl gently around the underside of the books
    armL.fingerList.forEach((f) => (f.rotation.x = 0.45));

    // Right arm resting poised transform: relaxed, approachable stance
    const defaultShoulderR = { x: 0.25, y: 0.18, z: -0.22 };
    const defaultElbowR = { x: -0.55, y: 0, z: 0 };
    armR.shoulder.rotation.set(defaultShoulderR.x, defaultShoulderR.y, defaultShoulderR.z);
    armR.elbow.rotation.set(defaultElbowR.x, defaultElbowR.y, defaultElbowR.z);
    armR.wrist.rotation.set(0.12, 0.15, -0.1);

    // 5. Kinematics State & Gaze Parallax
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
      targetLookX = x * 0.14;
      targetLookY = y * 0.09;
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });

    // Interaction Sequencer State
    let sequenceActive = false;
    let currentPhase: "idle" | "awareness" | "welcoming" | "mentoring" | "poised" = "idle";
    let phaseTime = 0;

    const startMentorshipSequence = () => {
      if (sequenceActive && currentPhase !== "poised") return;
      sequenceActive = true;
      currentPhase = "awareness";
      phaseTime = 0;
      setIsAnimating(true);
      setAnimStage("awareness");
    };

    triggerSequenceRef.current = startMentorshipSequence;

    // 6. Main Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const totalTime = (now - startTime) / 1000;

      // Parallax gaze tracking
      currentLookX += (targetLookX - currentLookX) * 0.06;
      currentLookY += (targetLookY - currentLookY) * 0.06;

      // Natural, relaxed breathing
      const breath = Math.sin(totalTime * 2.0) * 0.018;
      spinePivot.position.y = -0.42 + breath * 0.12;
      spinePivot.rotation.x = breath * 0.2;

      // Natural eye blinking
      const blinkCycle = totalTime % 3.8;
      const isBlinking = blinkCycle > 3.62 && blinkCycle < 3.75;
      const blinkScale = isBlinking ? 0.08 : 1.0;
      eyeL.scale.y += (blinkScale - eyeL.scale.y) * 0.45;
      eyeR.scale.y += (blinkScale - eyeR.scale.y) * 0.45;

      // Ribbon secondary flutter
      ribbon.rotation.x = 0.25 + Math.sin(totalTime * 2.8) * 0.04;

      // State Machine Handling
      if (!sequenceActive) {
        // Idle composed stance: attentive, confident eye contact
        headPivot.rotation.y = currentLookX * 0.7;
        headPivot.rotation.x = -currentLookY * 0.5;

        // Subtle gentle breathing in right arm
        armR.shoulder.rotation.x = defaultShoulderR.x + breath * 0.2;
        armR.shoulder.rotation.z = defaultShoulderR.z - breath * 0.1;
      } else {
        phaseTime += delta;

        if (currentPhase === "awareness") {
          // Phase 1: Awareness (0.75s)
          // Head turns toward visitor, posture brightens with warm attentiveness
          const p = easeInOutCubic(phaseTime / 0.75);

          headPivot.rotation.y = THREE.MathUtils.lerp(0, 0.08, p) + currentLookX * 0.7;
          headPivot.rotation.x = THREE.MathUtils.lerp(0, -0.04, p) - currentLookY * 0.5;

          // Warm genuine smile begins
          mouthGroup.scale.set(1 + p * 0.12, 1 + p * 0.08, 1);
          mouthGroup.position.y = -0.085 + p * 0.005;

          if (phaseTime >= 0.75) {
            currentPhase = "welcoming";
            phaseTime = 0;
            setAnimStage("welcoming");
          }
        } else if (currentPhase === "welcoming") {
          // Phase 2: Warm Welcoming Gesture (1.15s)
          // Right arm smoothly opens into a dignified, welcoming open-palm gesture
          const p = easeOutCubic(phaseTime / 1.15);

          armR.shoulder.rotation.x = THREE.MathUtils.lerp(defaultShoulderR.x, 0.58, p);
          armR.shoulder.rotation.y = THREE.MathUtils.lerp(defaultShoulderR.y, 0.42, p);
          armR.shoulder.rotation.z = THREE.MathUtils.lerp(defaultShoulderR.z, 0.35, p);

          armR.elbow.rotation.x = THREE.MathUtils.lerp(defaultElbowR.x, -1.25, p);
          armR.wrist.rotation.x = THREE.MathUtils.lerp(0.12, 0.28, p);
          armR.wrist.rotation.y = THREE.MathUtils.lerp(0.15, 0.32, p);

          // Fingers gently open in receptive, encouraging guidance posture
          armR.fingerList.forEach((f, idx) => {
            f.rotation.x = THREE.MathUtils.lerp(0, -0.15 + idx * 0.03, p);
          });
          armR.thumb.rotation.x = THREE.MathUtils.lerp(0, -0.22, p);

          // Head nods subtly in welcoming affirmation
          headPivot.rotation.x = -0.04 + Math.sin(p * Math.PI) * 0.05;

          if (phaseTime >= 1.15) {
            currentPhase = "mentoring";
            phaseTime = 0;
            setAnimStage("mentoring");
            setHasInteracted(true);
          }
        } else if (currentPhase === "mentoring") {
          // Phase 3: Mentorship & Academic Presentation Gesture (1.10s)
          // Right hand presents / gestures toward the academic books, left arm elevates books slightly
          const p = easeInOutCubic(phaseTime / 1.10);

          // Right hand points gently toward the curriculum books
          armR.shoulder.rotation.x = THREE.MathUtils.lerp(0.58, 0.42, p);
          armR.shoulder.rotation.y = THREE.MathUtils.lerp(0.42, -0.15, p);
          armR.elbow.rotation.x = THREE.MathUtils.lerp(-1.25, -1.45, p);
          armR.wrist.rotation.y = THREE.MathUtils.lerp(0.32, -0.25, p);

          // Books lift subtly in proud presentation
          booksGroup.position.y = 0.08 + Math.sin(p * Math.PI) * 0.035;
          booksGroup.rotation.z = -0.22 + Math.sin(p * Math.PI) * 0.08;

          // Head looks toward the books, then back to the student
          headPivot.rotation.y = THREE.MathUtils.lerp(0.08, -0.12, Math.sin(p * Math.PI));

          if (phaseTime >= 1.10) {
            currentPhase = "poised";
            phaseTime = 0;
            setAnimStage("poised");
          }
        } else if (currentPhase === "poised") {
          // Phase 4: Confident Finish & Poised Return (0.95s)
          // Right hand smoothly settles back into relaxed, dignified resting stance
          const p = easeInOutCubic(phaseTime / 0.95);

          armR.shoulder.rotation.x = THREE.MathUtils.lerp(0.42, defaultShoulderR.x, p);
          armR.shoulder.rotation.y = THREE.MathUtils.lerp(-0.15, defaultShoulderR.y, p);
          armR.shoulder.rotation.z = THREE.MathUtils.lerp(0.35, defaultShoulderR.z, p);

          armR.elbow.rotation.x = THREE.MathUtils.lerp(-1.45, defaultElbowR.x, p);
          armR.wrist.rotation.x = THREE.MathUtils.lerp(0.28, 0.12, p);
          armR.wrist.rotation.y = THREE.MathUtils.lerp(-0.25, 0.15, p);

          armR.fingerList.forEach((f) => {
            f.rotation.x = THREE.MathUtils.lerp(-0.1, 0, p);
          });
          armR.thumb.rotation.x = THREE.MathUtils.lerp(-0.22, 0, p);

          booksGroup.position.set(-0.22, 0.08, 0.22);
          booksGroup.rotation.set(0.35, 0.45, -0.22);

          headPivot.rotation.y = THREE.MathUtils.lerp(0.08, 0, p) + currentLookX * 0.7;
          headPivot.rotation.x = -currentLookY * 0.5;

          if (phaseTime >= 0.95) {
            sequenceActive = false;
            setIsAnimating(false);
            setAnimStage("poised");
            if (onSequenceComplete) onSequenceComplete();

            if (shouldReplayOnFinishRef.current) {
              shouldReplayOnFinishRef.current = false;
              startMentorshipSequence();
            }
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
      tweedTexture.dispose();
      bookCoverBlue.dispose();
      bookCoverCrimson.dispose();
    };
  }, [prefersReduced, onSequenceComplete]);

  if (prefersReduced) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="3D Photorealistic Academic Mentor — Hover over card to view mentorship guidance"
      className={`relative overflow-hidden rounded-2xl select-none group/acad pointer-events-none ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full pointer-events-none" />

      {/* Depth Backlight: SkillBridge Cerulean Blue / Gold Glow */}
      <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-24 w-3/4 rounded-full bg-sb-blue/15 blur-2xl" />

      {/* Hover Status Indicator Badge */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 rounded-xl border border-white/10 light:border-black/10 bg-black/60 light:bg-white/85 px-3 py-1.5 backdrop-blur-md transition-all duration-300">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                isAnimating ? "bg-amber-400" : "bg-sb-blue"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isAnimating ? "bg-amber-400" : "bg-sb-blue"
              }`}
            />
          </span>
          <span className="text-[11px] font-semibold tracking-wide text-sb-text">
            {isAnimating
              ? animStage === "awareness"
                ? "Connecting..."
                : animStage === "welcoming"
                ? "Welcome to Academia 🎓"
                : animStage === "mentoring"
                ? "Guiding Excellence 🏛️"
                : "Academic Mentor 🏛️"
              : hasInteracted
              ? "Academic Mentor 🏛️"
              : "Hover to Meet Mentor 🏛️"}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-medium text-sb-muted">
          {hasInteracted ? (
            <CheckCircle2 size={12} className="text-amber-400" />
          ) : (
            <Sparkles size={11} className="text-sb-blue" />
          )}
          <span>{hasInteracted ? "Verified Mentor" : "Hover Reactive"}</span>
        </div>
      </div>
    </div>
  );
}
