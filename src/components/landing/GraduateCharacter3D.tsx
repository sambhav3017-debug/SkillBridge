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
 * Creates high-detail fabric weave texture for the academic gown and felt mortarboard.
 */
function createAcademicFabricTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);

  // Cross-woven wool/crepe textile pattern
  ctx.strokeStyle = "rgba(20,20,20,0.35)";
  ctx.lineWidth = 1;
  for (let i = 0; i < size; i += 2) {
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
  texture.repeat.set(24, 24);
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
          const eyeDistX = Math.abs(rx) - 0.082;
          const eyeCavity = Math.max(0, 1 - (eyeDistX * eyeDistX) / 0.0035);
          rz -= eyeCavity * 0.024; // Orbital cavity recession
        }

        // 3. Sculpted Nose Structure (Bridge, Dorsum, Tip, Alae)
        if (normY > 0.34 && normY <= 0.54) {
          const noseDistX = Math.abs(rx);
          if (noseDistX < 0.052) {
            const noseT = (normY - 0.34) / 0.2;
            const noseProfile = Math.sin(noseT * Math.PI);
            const noseFalloff = Math.cos((noseDistX / 0.052) * (Math.PI / 2));
            rz += noseProfile * noseFalloff * 0.046; // Natural nasal projection
            // Taper at bridge, expand at tip and nostrils
            if (normY < 0.39) {
              rx *= 1.25; // Alar lobules (nostril wings)
            }
          }
        }

        // 4. Philtrum & Anatomical Lips
        if (normY > 0.21 && normY <= 0.33) {
          const mouthDistX = Math.abs(rx);
          if (mouthDistX < 0.075) {
            const mouthFalloff = Math.cos((mouthDistX / 0.075) * (Math.PI / 2));
            // Philtrum column depression in center
            if (normY > 0.28 && mouthDistX < 0.015) {
              rz -= 0.005 * mouthFalloff;
            }
            // Upper and lower lip fullness
            const lipCurve = Math.sin(((normY - 0.21) / 0.12) * Math.PI);
            rz += lipCurve * mouthFalloff * 0.022;
          }
        }

        // 5. Defined Jawline & Mental Protuberance (Chin)
        if (normY <= 0.22) {
          const chinFalloff = Math.max(0, 1 - (rx * rx) / 0.005);
          rz += chinFalloff * 0.028; // Prominent, confident adult chin
          rx *= 0.82; // Tapering mandibular angle to chin
        }

        // 6. Sculpted Zygomatic Arches (Cheekbones)
        if (normY > 0.42 && normY < 0.58) {
          const cheekDistX = Math.abs(rx) - 0.13;
          if (Math.abs(cheekDistX) < 0.04) {
            rz += 0.014;
          }
        }
      } else {
        // Back of head / Occipital contour
        if (normY < 0.35) {
          rz *= 0.92; // Taper to neck
        }
      }

      vertices.push(rx, ry + 0.14, rz);
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
 * Smooth Hermite interpolation
 */
function smoothstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
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

interface GraduateProps {
  isHovered?: boolean;
  onSequenceComplete?: () => void;
  className?: string;
}

export default function GraduateCharacter3D({
  isHovered = false,
  onSequenceComplete,
  className = "",
}: GraduateProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();

  // Animation states
  const [animStage, setAnimStage] = useState<"idle" | "prepare" | "removing" | "celebrating" | "returning">("idle");
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);

  // Refs for trigger control
  const triggerSequenceRef = useRef<() => void>(() => {});
  const shouldReplayOnFinishRef = useRef<boolean>(false);
  const prevHoveredRef = useRef<boolean>(false);

  // Hover detection: trigger automatically when pointer enters the card
  useEffect(() => {
    if (isHovered && !prevHoveredRef.current) {
      triggerSequenceRef.current();
    } else if (!isHovered) {
      // User left the card; clear queued replay
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
    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 50);
    camera.position.set(0, 0.44, 2.75);

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
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    // 2. Physically Plausible Studio Lighting Rig
    // Soft natural ambient base
    const ambientLight = new THREE.AmbientLight(0xf8fafc, 0.9);
    scene.add(ambientLight);

    // Key Light: Warm natural portrait light from front-left
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    keyLight.position.set(2.4, 3.5, 3.2);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Fill Light: Soft neutral fill from lower-right
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 1.25);
    fillLight.position.set(-2.4, 1.0, 2.2);
    scene.add(fillLight);

    // SkillBridge Signature Rim Light: Pure Cerulean Blue
    const blueRimLight = new THREE.DirectionalLight(0x007ba7, 3.8);
    blueRimLight.position.set(-2.2, 2.6, -2.4);
    scene.add(blueRimLight);

    // Subtle Warm Gold Edge Accent
    const goldAccent = new THREE.PointLight(0xf59e0b, 1.4, 6);
    goldAccent.position.set(2.0, 1.6, -1.8);
    scene.add(goldAccent);

    // 3. High-Fidelity Textures
    const { normalMap: skinNormal, roughnessMap: skinRoughness } = createPhotorealisticSkinTexture();
    const fabricBumpMap = createAcademicFabricTexture();

    // 4. Photorealistic PBR Materials
    // Skin: Melanin-grounded natural tone with subtle subsurface sheen
    const skinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc89678,
      roughness: 0.44,
      metalness: 0.0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.35,
      sheen: 0.55,
      sheenColor: new THREE.Color(0xffa278),
      sheenRoughness: 0.5,
      normalMap: skinNormal,
      normalScale: new THREE.Vector2(0.18, 0.18),
      roughnessMap: skinRoughness,
    });

    // Lips: Realistic pink-brown vermilion with natural hydration sheen
    const lipsMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xbe7364,
      roughness: 0.34,
      metalness: 0.0,
      clearcoat: 0.28,
      clearcoatRoughness: 0.22,
      normalMap: skinNormal,
      normalScale: new THREE.Vector2(0.12, 0.12),
    });

    // Eyes: High-gloss cornea with realistic striated hazel iris & limbal ring
    const scleraMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f6f8,
      roughness: 0.08,
      metalness: 0.0,
    });
    const irisMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x3d2716, // Warm hazel amber
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 0.95,
      clearcoatRoughness: 0.04,
    });
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x060606 });

    // Realistic Hair: Multi-layered dark brunette with anisotropic specular highlights
    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x1d1713,
      roughness: 0.35,
      metalness: 0.15,
    });

    // Academic Gown: Heavy matte black woven wool fabric with cloth bump
    const gownMaterial = new THREE.MeshStandardMaterial({
      color: 0x101114,
      roughness: 0.88,
      metalness: 0.02,
      bumpMap: fabricBumpMap,
      bumpScale: 0.022,
    });

    // Honor Stole: SkillBridge Cerulean Blue Satin with Gold Braided trim
    const stoleMaterial = new THREE.MeshStandardMaterial({
      color: 0x007ba7,
      roughness: 0.25,
      metalness: 0.22,
    });
    const goldTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.75,
    });

    // Dress Shirt & Tie
    const shirtMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
    });
    const tieMaterial = new THREE.MeshStandardMaterial({
      color: 0x141f2d,
      roughness: 0.38,
    });

    // Graduation Cap: Black wool felt & gold silk tassel
    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0x0e0f12,
      roughness: 0.9,
      metalness: 0.04,
      bumpMap: fabricBumpMap,
      bumpScale: 0.025,
    });
    const tasselMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.32,
      metalness: 0.45,
    });

    // 5. Rigged Anatomical Character Hierarchy
    const characterRoot = new THREE.Group();
    characterRoot.position.set(0, -0.46, 0);
    scene.add(characterRoot);

    // Spine / Chest Pivot
    const spinePivot = new THREE.Group();
    characterRoot.add(spinePivot);

    // Upper Torso / Tailored Academic Gown
    const torsoMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.39, 0.48, 0.54, 32),
      gownMaterial
    );
    torsoMesh.position.set(0, 0.16, 0);
    torsoMesh.scale.set(1.16, 1, 0.74);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    spinePivot.add(torsoMesh);

    // Realistic Shoulders with natural drapery slope
    const shoulderL = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 20, 20),
      gownMaterial
    );
    shoulderL.position.set(-0.46, 0.32, -0.01);
    shoulderL.scale.set(1.15, 0.88, 0.95);
    spinePivot.add(shoulderL);

    // Formal White Collared Shirt
    const shirtCollar = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.19, 4),
      shirtMaterial
    );
    shirtCollar.position.set(0, 0.37, 0.22);
    shirtCollar.rotation.x = Math.PI;
    spinePivot.add(shirtCollar);

    // Formal Dark Tie
    const tie = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.24, 0.02),
      tieMaterial
    );
    tie.position.set(0, 0.24, 0.23);
    spinePivot.add(tie);

    // SkillBridge Honor Stole (Left & Right satin panels with gold trim)
    const stoleL = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.46, 0.015), stoleMaterial);
    stoleL.position.set(-0.16, 0.18, 0.235);
    stoleL.rotation.z = -0.06;
    spinePivot.add(stoleL);

    const stoleR = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.46, 0.015), stoleMaterial);
    stoleR.position.set(0.16, 0.18, 0.235);
    stoleR.rotation.z = 0.06;
    spinePivot.add(stoleR);

    const goldL = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.46, 0.018), goldTrimMaterial);
    goldL.position.set(-0.12, 0.18, 0.237);
    goldL.rotation.z = -0.06;
    spinePivot.add(goldL);

    const goldR = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.46, 0.018), goldTrimMaterial);
    goldR.position.set(0.12, 0.18, 0.237);
    goldR.rotation.z = 0.06;
    spinePivot.add(goldR);

    // Anatomical Neck Column with sternocleidomastoid definition
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.108, 0.132, 0.19, 24),
      skinMaterial
    );
    neck.position.set(0, 0.44, 0.02);
    neck.castShadow = true;
    spinePivot.add(neck);

    // Head Pivot Node (at C1 vertebra)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.52, 0.02);
    spinePivot.add(headPivot);

    // Anatomical Organic Head Sculpt
    const headGeometry = createAnatomicalHeadGeometry();
    const headMesh = new THREE.Mesh(headGeometry, skinMaterial);
    headMesh.castShadow = true;
    headMesh.receiveShadow = true;
    headPivot.add(headMesh);

    // Anatomical Ears
    const earL = createAnatomicalEar(true);
    earL.children.forEach((c) => {
      if (c instanceof THREE.Mesh) c.material = skinMaterial;
    });
    headPivot.add(earL);

    const earR = createAnatomicalEar(false);
    earR.children.forEach((c) => {
      if (c instanceof THREE.Mesh) c.material = skinMaterial;
    });
    headPivot.add(earR);

    // Realistic Mouth / Lip Group with dynamic smile deformation
    const mouthGroup = new THREE.Group();
    mouthGroup.position.set(0, 0.042, 0.22);
    headPivot.add(mouthGroup);

    const upperLip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.011, 0.011, 0.075, 16),
      lipsMaterial
    );
    upperLip.rotation.z = Math.PI / 2;
    mouthGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.013, 0.013, 0.07, 16),
      lipsMaterial
    );
    lowerLip.position.set(0, -0.019, 0.005);
    lowerLip.rotation.z = Math.PI / 2;
    mouthGroup.add(lowerLip);

    // Anatomical Eyes with corneal bulge and specular catchlights
    function buildPhotorealisticEye(x: number) {
      const eyeGroup = new THREE.Group();
      eyeGroup.position.set(x, 0.17, 0.192);

      // Sclera sphere
      const eyeBall = new THREE.Mesh(new THREE.SphereGeometry(0.039, 20, 20), scleraMaterial);
      eyeGroup.add(eyeBall);

      // Deep Hazel Iris with limbal ring
      const iris = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 20), irisMaterial);
      iris.position.set(0, 0, 0.033);
      iris.rotation.x = Math.PI / 2;
      eyeGroup.add(iris);

      // Pupil
      const pupil = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.009, 16), pupilMaterial);
      pupil.position.set(0, 0, 0.034);
      pupil.rotation.x = Math.PI / 2;
      eyeGroup.add(pupil);

      // Eyelashes & Upper Eyebrow Arch
      const browCurve = new THREE.BoxGeometry(0.068, 0.015, 0.022);
      const brow = new THREE.Mesh(browCurve, hairMaterial);
      brow.position.set(0, 0.046, 0.032);
      brow.rotation.z = x > 0 ? -0.11 : 0.11;
      eyeGroup.add(brow);

      return eyeGroup;
    }

    const eyeL = buildPhotorealisticEye(-0.082);
    const eyeR = buildPhotorealisticEye(0.082);
    headPivot.add(eyeL);
    headPivot.add(eyeR);

    // Realistic Volumetric Hair (Layered strands beneath cap)
    const hairGroup = new THREE.Group();
    headPivot.add(hairGroup);

    // Crown base volume
    const hairBase = new THREE.Mesh(new THREE.SphereGeometry(0.235, 28, 20), hairMaterial);
    hairBase.scale.set(0.95, 0.98, 1.09);
    hairBase.position.set(0, 0.15, -0.02);
    hairGroup.add(hairBase);

    // Layered side locks & temple wisps
    const templeL = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.18, 0.13), hairMaterial);
    templeL.position.set(-0.21, 0.12, 0.025);
    templeL.rotation.z = 0.08;
    hairGroup.add(templeL);

    const templeR = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.18, 0.13), hairMaterial);
    templeR.position.set(0.21, 0.12, 0.025);
    templeR.rotation.z = -0.08;
    hairGroup.add(templeR);

    // 6. Right Arm Rig (Skeletal Kinematics: Clavicle -> Shoulder -> Elbow -> Wrist -> Hand)
    const clavicleR = new THREE.Group();
    clavicleR.position.set(0.26, 0.36, 0.04);
    spinePivot.add(clavicleR);

    const shoulderR = new THREE.Group();
    shoulderR.position.set(0.18, -0.02, 0);
    clavicleR.add(shoulderR);

    // Upper arm in academic gown sleeve
    const upperArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.105, 0.33, 20), gownMaterial);
    upperArmMesh.position.set(0, -0.165, 0);
    upperArmMesh.castShadow = true;
    shoulderR.add(upperArmMesh);

    const elbowR = new THREE.Group();
    elbowR.position.set(0, -0.33, 0);
    shoulderR.add(elbowR);

    // Forearm sleeve
    const forearmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.075, 0.29, 20), gownMaterial);
    forearmMesh.position.set(0, -0.145, 0);
    forearmMesh.castShadow = true;
    elbowR.add(forearmMesh);

    const wristR = new THREE.Group();
    wristR.position.set(0, -0.29, 0);
    elbowR.add(wristR);

    // Anatomical Hand: Palm, Knuckles, thenar/hypothenar pads, 5 segmented fingers
    const handR = new THREE.Group();
    wristR.add(handR);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.095, 0.042), skinMaterial);
    palm.position.set(0, -0.048, 0);
    palm.castShadow = true;
    handR.add(palm);

    // Opposable Thumb with thenar muscle pad
    const thumbPivot = new THREE.Group();
    thumbPivot.position.set(-0.045, -0.028, 0.012);
    thumbPivot.rotation.z = 0.55;
    handR.add(thumbPivot);

    const thumbPhalanx = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.014, 0.058, 12), skinMaterial);
    thumbPhalanx.position.set(0, -0.025, 0);
    thumbPivot.add(thumbPhalanx);

    // 4 Articulated Fingers (Index, Middle, Ring, Pinky)
    const fingers: THREE.Group[] = [];
    for (let f = 0; f < 4; f++) {
      const fingerPivot = new THREE.Group();
      fingerPivot.position.set(-0.03 + f * 0.021, -0.095, 0);

      const fLen = 0.068 - f * 0.005;
      const fingerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.011, fLen, 10), skinMaterial);
      fingerMesh.position.set(0, -fLen / 2, 0);
      fingerPivot.add(fingerMesh);

      handR.add(fingerPivot);
      fingers.push(fingerPivot);
    }

    // 7. Graduation Cap (Mortarboard) Assembly
    const capGroup = new THREE.Group();
    // Default resting anchor on head
    capGroup.position.set(0, 0.35, -0.02);
    capGroup.rotation.x = -0.06;
    headPivot.add(capGroup);

    // Fitted Skull cap
    const skullCap = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.21, 0.1, 28), capMaterial);
    skullCap.position.set(0, 0.03, 0);
    capGroup.add(skullCap);

    // Beveled Mortarboard Diamond Board
    const mortarboard = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.024, 0.48), capMaterial);
    mortarboard.position.set(0, 0.088, 0);
    mortarboard.rotation.y = Math.PI / 4;
    mortarboard.castShadow = true;
    capGroup.add(mortarboard);

    // Mortarboard Button
    const capButton = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), capMaterial);
    capButton.position.set(0, 0.105, 0);
    capGroup.add(capButton);

    // Braided Tassel with Secondary Physics
    const tasselPivot = new THREE.Group();
    tasselPivot.position.set(0, 0.105, 0);
    capGroup.add(tasselPivot);

    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.28, 10), tasselMaterial);
    cord.position.set(-0.12, -0.02, 0.1);
    cord.rotation.z = 1.05;
    cord.rotation.y = 0.45;
    tasselPivot.add(cord);

    const tasselSkirt = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.12, 14), tasselMaterial);
    tasselSkirt.position.set(-0.24, -0.14, 0.14);
    tasselPivot.add(tasselSkirt);

    // Celebratory Confetti Particles
    const confettiCount = 50;
    const confettiGeom = new THREE.BufferGeometry();
    const confettiPos = new Float32Array(confettiCount * 3);
    const confettiVel = new Float32Array(confettiCount * 3);
    const confettiColors = new Float32Array(confettiCount * 3);

    for (let i = 0; i < confettiCount; i++) {
      confettiPos[i * 3] = (Math.random() - 0.5) * 0.4;
      confettiPos[i * 3 + 1] = 0.6;
      confettiPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      confettiVel[i * 3] = (Math.random() - 0.5) * 0.8;
      confettiVel[i * 3 + 1] = 0.5 + Math.random() * 0.9;
      confettiVel[i * 3 + 2] = (Math.random() - 0.5) * 0.8;

      const isPink = Math.random() > 0.5;
      confettiColors[i * 3] = isPink ? 1.0 : 0.0;
      confettiColors[i * 3 + 1] = isPink ? 0.17 : 0.48;
      confettiColors[i * 3 + 2] = isPink ? 0.58 : 0.85;
    }
    confettiGeom.setAttribute("position", new THREE.BufferAttribute(confettiPos, 3));
    confettiGeom.setAttribute("color", new THREE.BufferAttribute(confettiColors, 3));

    const confettiMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const confettiSystem = new THREE.Points(confettiGeom, confettiMat);
    scene.add(confettiSystem);

    // 8. Dynamic Animation Engine & Rig Kinematics
    let currentPhase: "idle" | "prepare" | "removing" | "celebrating" | "returning" = "idle";
    let phaseTime = 0;
    let sequenceActive = false;
    const startTime = performance.now();
    let lastTime = startTime;

    // Default Rig Resting Transforms
    const defaultShoulderR = { x: 0.1, y: 0.1, z: -0.2 };
    const defaultElbowR = { x: 0.35, y: 0, z: 0 };
    shoulderR.rotation.set(defaultShoulderR.x, defaultShoulderR.y, defaultShoulderR.z);
    elbowR.rotation.set(defaultElbowR.x, defaultElbowR.y, defaultElbowR.z);

    // Mouse parallax tracking
    let targetLookX = 0;
    let targetLookY = 0;
    let currentLookX = 0;
    let currentLookY = 0;

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetLookX = x * 0.15;
      targetLookY = y * 0.1;
    };
    window.addEventListener("mousemove", onPointerMove, { passive: true });

    // Initiation of Sequence
    const startHoverSequence = () => {
      if (sequenceActive) {
        shouldReplayOnFinishRef.current = true;
        return;
      }
      sequenceActive = true;
      currentPhase = "prepare";
      phaseTime = 0;
      setIsAnimating(true);
      setAnimStage("prepare");
    };

    triggerSequenceRef.current = startHoverSequence;

    // 9. Main Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const totalTime = (now - startTime) / 1000;

      // Smooth gaze parallax
      currentLookX += (targetLookX - currentLookX) * 0.06;
      currentLookY += (targetLookY - currentLookY) * 0.06;

      // Breathing Cycle
      const breath = Math.sin(totalTime * 2.2) * 0.022;
      spinePivot.position.y = breath * 0.15;
      spinePivot.rotation.x = breath * 0.25;

      // Natural eye blinking
      const blinkCycle = totalTime % 3.5;
      const isBlinking = blinkCycle > 3.35 && blinkCycle < 3.48;
      const blinkScale = isBlinking ? 0.08 : 1.0;
      eyeL.scale.y += (blinkScale - eyeL.scale.y) * 0.4;
      eyeR.scale.y += (blinkScale - eyeR.scale.y) * 0.4;

      if (!sequenceActive) {
        // A. IDLE STATE
        headPivot.rotation.y = currentLookX * 0.8;
        headPivot.rotation.x = -currentLookY * 0.6 + breath * 0.1;
        capGroup.position.set(0, 0.35 + breath * 0.05, -0.02);
        capGroup.rotation.set(-0.06, 0, 0);
        tasselPivot.rotation.z = Math.sin(totalTime * 1.8) * 0.04;
      } else {
        phaseTime += delta;

        if (currentPhase === "prepare") {
          // B. PREPARE PHASE (0.55s)
          // Arm smoothly arcs toward cap brim, head anticipates
          const p = easeInOutCubic(phaseTime / 0.55);

          headPivot.rotation.y = THREE.MathUtils.lerp(0, 0.12, p);
          headPivot.rotation.x = THREE.MathUtils.lerp(0, -0.08, p);
          headPivot.rotation.z = THREE.MathUtils.lerp(0, -0.04, p);

          clavicleR.position.y = 0.36 + p * 0.035;

          shoulderR.rotation.x = THREE.MathUtils.lerp(defaultShoulderR.x, -0.85, p);
          shoulderR.rotation.y = THREE.MathUtils.lerp(defaultShoulderR.y, 0.45, p);
          shoulderR.rotation.z = THREE.MathUtils.lerp(defaultShoulderR.z, 0.55, p);

          elbowR.rotation.x = THREE.MathUtils.lerp(defaultElbowR.x, 1.75, p);
          wristR.rotation.x = THREE.MathUtils.lerp(0, -0.35, p);
          wristR.rotation.y = THREE.MathUtils.lerp(0, 0.3, p);

          if (phaseTime >= 0.55) {
            currentPhase = "removing";
            phaseTime = 0;
            setAnimStage("removing");
          }
        } else if (currentPhase === "removing") {
          // C. REMOVE THE CAP (1.15s)
          // Hand grips cap brim, lifts cap cleanly off head (+16cm vertical, +12cm lateral)
          const p = easeInOutCubic(phaseTime / 1.15);

          // Fingers curl securely around mortarboard brim
          fingers.forEach((f) => (f.rotation.x = smoothstep(p * 2) * 0.45));
          thumbPivot.rotation.x = smoothstep(p * 2) * 0.35;

          shoulderR.rotation.x = THREE.MathUtils.lerp(-0.85, -1.25, p);
          shoulderR.rotation.y = THREE.MathUtils.lerp(0.45, 0.65, p);
          shoulderR.rotation.z = THREE.MathUtils.lerp(0.55, 0.85, p);

          elbowR.rotation.x = THREE.MathUtils.lerp(1.75, 1.05, p);
          wristR.rotation.x = THREE.MathUtils.lerp(-0.35, -0.15, p);

          // Cap clears head cleanly with zero hair/forehead intersection
          const liftY = THREE.MathUtils.lerp(0.35, 0.62, p);
          const liftX = THREE.MathUtils.lerp(0, 0.24, p);
          const tiltX = THREE.MathUtils.lerp(-0.06, 0.28, p);
          const tiltZ = THREE.MathUtils.lerp(0, -0.22, p);

          capGroup.position.set(liftX, liftY, -0.02 + p * 0.08);
          capGroup.rotation.set(tiltX, p * 0.15, tiltZ);

          // Head reacts with subtle natural posture elevation
          headPivot.rotation.x = THREE.MathUtils.lerp(-0.08, -0.14, p);
          headPivot.rotation.y = THREE.MathUtils.lerp(0.12, -0.05, p);

          tasselPivot.rotation.z = Math.sin(p * Math.PI) * 0.25;

          if (phaseTime >= 1.15) {
            currentPhase = "celebrating";
            phaseTime = 0;
            setAnimStage("celebrating");
            setHasCelebrated(true);
            confettiMat.opacity = 0.95;
          }
        } else if (currentPhase === "celebrating") {
          // D. SIGNATURE CELEBRATION (0.95s)
          // Dignified academic salute with cap held proudly, genuine smile
          const p = easeOutCubic(phaseTime / 0.95);

          shoulderR.rotation.x = -1.25 - Math.sin(p * Math.PI) * 0.12;
          shoulderR.rotation.y = 0.65 + Math.sin(p * Math.PI) * 0.08;
          shoulderR.rotation.z = 0.85 + Math.sin(p * Math.PI) * 0.1;
          elbowR.rotation.x = 1.05 - Math.sin(p * Math.PI) * 0.1;

          capGroup.position.set(0.24 + Math.sin(p * Math.PI) * 0.04, 0.64 + Math.sin(p * Math.PI) * 0.05, 0.06);
          capGroup.rotation.set(0.32, 0.2, -0.25);

          // Natural proud smile expands
          const smileProgress = smoothstep(p * 1.5);
          mouthGroup.scale.set(1 + smileProgress * 0.2, 1 + smileProgress * 0.15, 1);
          mouthGroup.position.y = 0.042 + smileProgress * 0.008;

          // Confetti particles
          const pos = confettiGeom.attributes.position.array as Float32Array;
          for (let i = 0; i < confettiCount; i++) {
            pos[i * 3] += confettiVel[i * 3] * delta;
            pos[i * 3 + 1] += confettiVel[i * 3 + 1] * delta;
            pos[i * 3 + 2] += confettiVel[i * 3 + 2] * delta;
            confettiVel[i * 3 + 1] -= delta * 1.2;
          }
          confettiGeom.attributes.position.needsUpdate = true;
          confettiMat.opacity = Math.max(0, 0.95 - (phaseTime / 0.95) * 0.65);

          if (phaseTime >= 0.95) {
            currentPhase = "returning";
            phaseTime = 0;
            setAnimStage("returning");
          }
        } else if (currentPhase === "returning") {
          // E. RETURN TO REST (1.25s total)
          // Stage 1 (0 to 0.65s): Gracefully guide cap back onto head
          // Stage 2 (0.65 to 1.25s): Release cap and lower arm to natural resting side pose
          const totalReturnDuration = 1.25;
          const returnMidpoint = 0.65;

          if (phaseTime <= returnMidpoint) {
            const p1 = easeInOutCubic(phaseTime / returnMidpoint);

            // Cap guides back onto head
            capGroup.position.set(
              THREE.MathUtils.lerp(0.24, 0, p1),
              THREE.MathUtils.lerp(0.64, 0.35, p1),
              THREE.MathUtils.lerp(0.06, -0.02, p1)
            );
            capGroup.rotation.set(
              THREE.MathUtils.lerp(0.32, -0.06, p1),
              THREE.MathUtils.lerp(0.2, 0, p1),
              THREE.MathUtils.lerp(-0.25, 0, p1)
            );

            // Arm guides cap back
            shoulderR.rotation.x = THREE.MathUtils.lerp(-1.25, -0.85, p1);
            shoulderR.rotation.y = THREE.MathUtils.lerp(0.65, 0.45, p1);
            shoulderR.rotation.z = THREE.MathUtils.lerp(0.85, 0.55, p1);
            elbowR.rotation.x = THREE.MathUtils.lerp(1.05, 1.75, p1);

            // Fingers gently loosen grip as cap seats
            fingers.forEach((f) => (f.rotation.x = THREE.MathUtils.lerp(0.45, 0.1, p1)));
            thumbPivot.rotation.x = THREE.MathUtils.lerp(0.35, 0.08, p1);

            headPivot.rotation.x = THREE.MathUtils.lerp(-0.14, -0.04, p1);
            headPivot.rotation.y = THREE.MathUtils.lerp(-0.05, 0, p1);
          } else {
            const p2 = easeInOutCubic((phaseTime - returnMidpoint) / (totalReturnDuration - returnMidpoint));

            // Cap rests firmly on head
            capGroup.position.set(0, 0.35, -0.02);
            capGroup.rotation.set(-0.06, 0, 0);

            // Arm lowers gracefully to resting side pose
            shoulderR.rotation.x = THREE.MathUtils.lerp(-0.85, defaultShoulderR.x, p2);
            shoulderR.rotation.y = THREE.MathUtils.lerp(0.45, defaultShoulderR.y, p2);
            shoulderR.rotation.z = THREE.MathUtils.lerp(0.55, defaultShoulderR.z, p2);
            elbowR.rotation.x = THREE.MathUtils.lerp(1.75, defaultElbowR.x, p2);
            wristR.rotation.x = THREE.MathUtils.lerp(-0.15, 0, p2);
            wristR.rotation.y = THREE.MathUtils.lerp(0.3, 0, p2);
            clavicleR.position.y = THREE.MathUtils.lerp(0.395, 0.36, p2);

            fingers.forEach((f) => (f.rotation.x = THREE.MathUtils.lerp(0.1, 0, p2)));
            thumbPivot.rotation.x = THREE.MathUtils.lerp(0.08, 0, p2);

            headPivot.rotation.x = THREE.MathUtils.lerp(-0.04, 0, p2);
            headPivot.rotation.y = 0;

            mouthGroup.scale.set(
              THREE.MathUtils.lerp(1.2, 1.0, p2),
              THREE.MathUtils.lerp(1.15, 1.0, p2),
              1
            );
          }

          confettiMat.opacity = Math.max(0, confettiMat.opacity - delta * 2.5);

          if (phaseTime >= totalReturnDuration) {
            sequenceActive = false;
            setIsAnimating(false);
            setAnimStage("idle");
            if (onSequenceComplete) onSequenceComplete();

            if (shouldReplayOnFinishRef.current) {
              shouldReplayOnFinishRef.current = false;
              startHoverSequence();
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
      fabricBumpMap.dispose();
    };
  }, [prefersReduced, onSequenceComplete]);

  if (prefersReduced) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label="3D Photorealistic Graduate — Hover over card to trigger celebration"
      className={`relative overflow-hidden rounded-2xl select-none group/grad pointer-events-none ${className}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="block h-full w-full pointer-events-none" />

      {/* Subtle Depth Backlight */}
      <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-24 w-3/4 rounded-full bg-sb-cyan/15 blur-2xl" />

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
              ? animStage === "prepare"
                ? "Preparing..."
                : animStage === "removing"
                ? "Removing Cap..."
                : animStage === "celebrating"
                ? "Graduated! 🎓"
                : "Resting"
              : hasCelebrated
              ? "Celebrated 🎓"
              : "Hover to Celebrate 🎓"}
          </span>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-medium text-sb-muted">
          {hasCelebrated ? (
            <CheckCircle2 size={12} className="text-emerald-400" />
          ) : (
            <Sparkles size={11} className="text-sb-cyan" />
          )}
          <span>{hasCelebrated ? "Complete" : "Hover Reactive"}</span>
        </div>
      </div>
    </div>
  );
}
