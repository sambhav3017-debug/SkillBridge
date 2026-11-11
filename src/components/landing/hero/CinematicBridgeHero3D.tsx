"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

/**
 * SkillBridge — Cinematic Interactive 3D Hero Experience
 * ---------------------------------------------------------------------------
 * Recreates the monumental architectural bridge, descending opportunity gateway,
 * 3 realistic students, and futuristic city horizon in real-time WebGL via Three.js.
 *
 * Choreographed 6-Stage Timeline:
 *  - Scene 1: Deep black cinematic environment awakens with atmospheric rim lighting.
 *  - Scene 2: Architectural bridge foundation and curved catenary deck assemble dynamically.
 *  - Scene 3: Monolithic gateway descends with physical gravity, settles with micro-impact,
 *             and ignites its Laser Crimson inner neon contour.
 *  - Scene 4: Three students with natural walking kinematics arrive along the bridge deck.
 *  - Scene 5: Gateway interior illuminates, revealing the modern city skyline as students cross.
 *  - Scene 6: Camera settles into final balanced hero composition with mouse parallax.
 */

// Timeline constants (seconds)
const T_ENV_END = 1.2;
const T_BRIDGE_START = 1.0;
const T_BRIDGE_END = 4.0;
const T_GATEWAY_START = 3.6;
const T_GATEWAY_LAND = 6.2;
const T_GATEWAY_GLOW = 7.0;
const T_STUDENTS_START = 6.5;
const T_STUDENTS_CROSS = 12.0;
const T_FINAL_HERO = 13.0;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Student bone hierarchy builder for realistic silhouette proportions
interface StudentRig {
  root: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  torso: THREE.Group;
  speed: number;
  offsetT: number;
}

function createStudentRig(scale = 1.0): StudentRig {
  const root = new THREE.Group();

  const matChar = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.6,
    metalness: 0.3,
  });

  const matCloth = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.7,
    metalness: 0.2,
  });

  // Torso / Jacket
  const torso = new THREE.Group();
  const torsoMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.32 * scale, 0.48 * scale, 0.18 * scale),
    matCloth
  );
  torsoMesh.position.y = 0.95 * scale;
  torsoMesh.castShadow = true;
  torso.add(torsoMesh);

  // Backpack
  const packMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.24 * scale, 0.36 * scale, 0.14 * scale),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  packMesh.position.set(0, 0.98 * scale, -0.14 * scale);
  torso.add(packMesh);

  // Head
  const headMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.11 * scale, 16, 16),
    matChar
  );
  headMesh.position.y = 1.32 * scale;
  torso.add(headMesh);

  // Legs (Hips -> Knees -> Feet)
  const legGeo = new THREE.BoxGeometry(0.1 * scale, 0.4 * scale, 0.1 * scale);
  const footGeo = new THREE.BoxGeometry(0.1 * scale, 0.08 * scale, 0.2 * scale);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.1 * scale, 0.72 * scale, 0);
  const leftLegMesh = new THREE.Mesh(legGeo, matChar);
  leftLegMesh.position.y = -0.2 * scale;
  const leftFootMesh = new THREE.Mesh(footGeo, matChar);
  leftFootMesh.position.set(0, -0.42 * scale, 0.05 * scale);
  leftLeg.add(leftLegMesh, leftFootMesh);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.1 * scale, 0.72 * scale, 0);
  const rightLegMesh = new THREE.Mesh(legGeo, matChar);
  rightLegMesh.position.y = -0.2 * scale;
  const rightFootMesh = new THREE.Mesh(footGeo, matChar);
  rightFootMesh.position.set(0, -0.42 * scale, 0.05 * scale);
  rightLeg.add(rightLegMesh, rightFootMesh);

  // Arms
  const armGeo = new THREE.BoxGeometry(0.08 * scale, 0.42 * scale, 0.08 * scale);
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.21 * scale, 1.15 * scale, 0);
  const leftArmMesh = new THREE.Mesh(armGeo, matCloth);
  leftArmMesh.position.y = -0.2 * scale;
  leftArm.add(leftArmMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.21 * scale, 1.15 * scale, 0);
  const rightArmMesh = new THREE.Mesh(armGeo, matCloth);
  rightArmMesh.position.y = -0.2 * scale;
  rightArm.add(rightArmMesh);

  root.add(torso, leftLeg, rightLeg, leftArm, rightArm);

  return {
    root,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    torso,
    speed: 1.0,
    offsetT: 0,
  };
}

export default function CinematicBridgeHero3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [sequenceProgress, setSequenceProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const replay = useCallback(() => {
    setIsPlaying(false);
    setTimeout(() => setIsPlaying(true), 50);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // WebGL Renderer Setup
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      });
    } catch (e) {
      console.warn("WebGL not supported:", e);
      return;
    }

    const isMobileDevice = typeof window !== "undefined" && (window.innerWidth < 768 || "ontouchstart" in window);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileDevice ? 1.5 : 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    // On mobile devices, disable heavy soft shadow computations to ensure 60fps fluidity
    renderer.shadowMap.enabled = !isMobileDevice;
    if (!isMobileDevice) {
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080808, 0.038);

    // Camera Setup - Perfectly framed matching reference image
    const initialAspect = container.clientWidth / container.clientHeight;
    const initialFov = container.clientWidth < 768 ? 46 : 36;
    const camera = new THREE.PerspectiveCamera(
      initialFov,
      initialAspect,
      0.1,
      120
    );
    const startCamPos = new THREE.Vector3(
      container.clientWidth < 768 ? 0.2 : -0.4,
      container.clientWidth < 768 ? 2.6 : 2.4,
      container.clientWidth < 768 ? 10.4 : 9.4
    );
    const finalCamPos = new THREE.Vector3(
      container.clientWidth < 768 ? -0.2 : -0.8,
      container.clientWidth < 768 ? 2.1 : 1.75,
      container.clientWidth < 768 ? 9.8 : 8.6
    );
    camera.position.copy(startCamPos);

    // Mouse Parallax Damping Variables
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = clamp(nx, -1, 1);
      mouse.targetY = clamp(ny, -1, 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // -------------------------------------------------------------------------
    // LIGHTING RIG (Cinematic Black × Silver × Laser Crimson)
    // -------------------------------------------------------------------------
    const ambientLight = new THREE.AmbientLight(0x08090d, 1.2);
    scene.add(ambientLight);

    // Cool key directional light for architectural top edges
    const keyLight = new THREE.DirectionalLight(0xd4d8e2, 2.0);
    keyLight.position.set(-6, 9, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Rim light catching right-side geometry & student silhouettes
    const rimLight = new THREE.DirectionalLight(0xcfd8dc, 2.8);
    rimLight.position.set(7, 6, -3);
    scene.add(rimLight);

    // Backlit halo light illuminating the city skyline and portal opening
    const portalBacklight = new THREE.PointLight(0xe2e8f0, 4.2, 16, 1.2);
    portalBacklight.position.set(3.4, 2.8, -4.8);
    scene.add(portalBacklight);

    // Laser Crimson Gateway Ambient Glow Light (ignites in Scene 3)
    const crimsonGatewayLight = new THREE.PointLight(0xd41514, 0, 16, 1.6);
    crimsonGatewayLight.position.set(3.2, 2.2, -2.4);
    scene.add(crimsonGatewayLight);

    // -------------------------------------------------------------------------
    // SKYLINE BACKGROUND TRAJECTORY ORBIT ARC (from Reference Image)
    // -------------------------------------------------------------------------
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    const orbitCurve = new THREE.EllipseCurve(
      2.4, 2.0,            // ax, ay
      5.2, 3.4,            // xRadius, yRadius
      Math.PI * 0.12,      // aStartAngle
      Math.PI * 0.92,      // aEndAngle
      false,               // aClockwise
      -0.18                // aRotation
    );
    const orbitPoints = orbitCurve.getPoints(50);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, p.y, -4.5))
    );
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0xd41514,
      transparent: true,
      opacity: 0.38,
      linewidth: 1.5,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitGroup.add(orbitLine);

    // Crimson beacon node on orbital trajectory
    const orbitNodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const orbitNodeMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const orbitNode = new THREE.Mesh(orbitNodeGeo, orbitNodeMat);
    const nodePt = orbitPoints[Math.floor(orbitPoints.length * 0.45)];
    orbitNode.position.set(nodePt.x, nodePt.y, -4.5);
    orbitGroup.add(orbitNode);

    // -------------------------------------------------------------------------
    // GROUND TERRAIN & CRAGGY ROCK BASE BELOW GATEWAY
    // -------------------------------------------------------------------------
    const groundGeo = new THREE.PlaneGeometry(70, 50, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x050507,
      roughness: 0.95,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.set(0, -2.4, -8);
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Dark rocky cliff bluff underneath the portal and bridge touchdown
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x09090c,
      roughness: 0.88,
      metalness: 0.15,
      flatShading: true,
    });
    const rockGroup = new THREE.Group();
    scene.add(rockGroup);

    const cliff1 = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3.0, 8), rockMat);
    cliff1.position.set(3.6, -1.0, -3.4);
    cliff1.rotation.y = 0.5;
    cliff1.scale.set(1.4, 0.9, 1.2);
    rockGroup.add(cliff1);

    const cliff2 = new THREE.Mesh(new THREE.ConeGeometry(2.6, 2.4, 7), rockMat);
    cliff2.position.set(2.4, -1.4, -2.8);
    cliff2.rotation.y = -0.3;
    cliff2.scale.set(1.1, 0.8, 1.0);
    rockGroup.add(cliff2);

    // -------------------------------------------------------------------------
    // ARCHITECTURAL BRIDGE STRUCTURE
    // Sweeps gracefully in right viewport half (x ~ 0.6 to 3.3)
    // Left half (x < 0.4) is open negative space for typography and buttons
    // -------------------------------------------------------------------------
    const bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);

    // The bridge catenary spline: sweeps smoothly upward from center-right to gateway
    const bridgeCurvePoints = [
      new THREE.Vector3(0.5, -2.0, 0.4),
      new THREE.Vector3(1.3, -1.0, -0.4),
      new THREE.Vector3(2.0, -0.2, -1.3),
      new THREE.Vector3(2.6, 0.38, -2.1),
      new THREE.Vector3(3.15, 0.66, -2.8),
      new THREE.Vector3(3.55, 0.72, -3.4), // Smooth entry passing cleanly through portal
    ];
    const bridgeSpline = new THREE.CatmullRomCurve3(bridgeCurvePoints);

    // 1. Curved Foundation Under-Arch (Monumental architectural parabolic arch)
    const archShape = new THREE.Shape();
    archShape.moveTo(-0.55, -0.45);
    archShape.lineTo(0.55, -0.45);
    archShape.lineTo(0.46, 0.12);
    archShape.lineTo(-0.46, 0.12);
    archShape.closePath();

    const archExtrudeSettings = {
      steps: 48,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.04,
      extrudePath: bridgeSpline,
    };
    const archGeo = new THREE.ExtrudeGeometry(archShape, archExtrudeSettings);
    const bridgeMetalMat = new THREE.MeshStandardMaterial({
      color: 0x121215,
      roughness: 0.35,
      metalness: 0.8,
    });
    const archMesh = new THREE.Mesh(archGeo, bridgeMetalMat);
    archMesh.castShadow = true;
    archMesh.receiveShadow = true;
    bridgeGroup.add(archMesh);

    // 2. Roadway Deck Ribbon (Horizontal Architectural Flat Deck)
    const deckWidth = 1.15;
    const deckThickness = 0.08;
    const deckSegments = 60;
    const deckGeo = new THREE.BufferGeometry();
    const deckVerts: number[] = [];
    const deckNorms: number[] = [];
    const deckUvs: number[] = [];

    for (let i = 0; i <= deckSegments; i++) {
      const u = i / deckSegments;
      const pt = bridgeSpline.getPointAt(u);
      const tangent = bridgeSpline.getTangentAt(u).normalize();
      // True horizontal deck cross-vector (prevents any twist)
      const binormal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

      const pL = pt.clone().add(binormal.clone().multiplyScalar(-deckWidth * 0.5));
      const pR = pt.clone().add(binormal.clone().multiplyScalar(deckWidth * 0.5));
      pL.y += deckThickness * 0.5;
      pR.y += deckThickness * 0.5;

      deckVerts.push(pL.x, pL.y, pL.z, pR.x, pR.y, pR.z);
      deckNorms.push(normal.x, normal.y, normal.z, normal.x, normal.y, normal.z);
      deckUvs.push(0, u, 1, u);
    }

    const deckIndices: number[] = [];
    for (let i = 0; i < deckSegments; i++) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      deckIndices.push(a, c, b, b, c, d);
    }
    deckGeo.setIndex(deckIndices);
    deckGeo.setAttribute("position", new THREE.Float32BufferAttribute(deckVerts, 3));
    deckGeo.setAttribute("normal", new THREE.Float32BufferAttribute(deckNorms, 3));
    deckGeo.setAttribute("uv", new THREE.Float32BufferAttribute(deckUvs, 2));

    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x0e0e11,
      roughness: 0.42,
      metalness: 0.7,
    });
    const deckMesh = new THREE.Mesh(deckGeo, deckMat);
    deckMesh.receiveShadow = true;
    bridgeGroup.add(deckMesh);

    // 3. Laser Crimson Optical Guide Rail (Perimeter Line running along bridge edge)
    const railPointsLeft: THREE.Vector3[] = [];
    for (let i = 0; i <= 50; i++) {
      const u = i / 50;
      const pt = bridgeSpline.getPointAt(u);
      const tangent = bridgeSpline.getTangentAt(u).normalize();
      const binormal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      const edgePt = pt.clone().add(binormal.multiplyScalar(-deckWidth * 0.51));
      edgePt.y += deckThickness * 0.65;
      railPointsLeft.push(edgePt);
    }
    const railSpline = new THREE.CatmullRomCurve3(railPointsLeft);
    const railGeo = new THREE.TubeGeometry(railSpline, 48, 0.026, 8, false);
    const crimsonRailMat = new THREE.MeshStandardMaterial({
      color: 0xd41514,
      emissive: 0xd41514,
      emissiveIntensity: 0.0, // Awakens as bridge assembles
      roughness: 0.12,
      metalness: 0.9,
    });
    const railMesh = new THREE.Mesh(railGeo, crimsonRailMat);
    bridgeGroup.add(railMesh);

    // 4. Structural Vertical Strut Pylons
    const strutsGroup = new THREE.Group();
    bridgeGroup.add(strutsGroup);
    const strutMat = new THREE.MeshStandardMaterial({
      color: 0x1c1c20,
      roughness: 0.4,
      metalness: 0.8,
    });
    for (let i = 1; i <= 4; i++) {
      const u = i / 5;
      const pt = bridgeSpline.getPointAt(u);
      const groundY = -2.2;
      const h = pt.y - groundY;
      const strutMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.09, h, 12),
        strutMat
      );
      strutMesh.position.set(pt.x, groundY + h * 0.5, pt.z);
      strutMesh.castShadow = true;
      strutsGroup.add(strutMesh);
    }

    // -------------------------------------------------------------------------
    // MONOLITHIC GATEWAY PORTAL
    // -------------------------------------------------------------------------
    const gatewayGroup = new THREE.Group();
    scene.add(gatewayGroup);

    const gateTargetPos = new THREE.Vector3(3.1, 0.65, -2.8);
    const gateStartPos = new THREE.Vector3(3.1, 14.0, -2.8);
    gatewayGroup.position.copy(gateStartPos);
    gatewayGroup.rotation.y = -0.36;

    // Outer Monolithic Portal Frame (Titanium basalt structure)
    const portalShape = new THREE.Shape();
    const pw = 1.45;
    const ph = 2.15;
    const pThick = 0.32;
    // Outer boundary
    portalShape.moveTo(-pw, 0);
    portalShape.lineTo(pw, 0);
    portalShape.lineTo(pw, ph * 2);
    portalShape.lineTo(-pw, ph * 2);
    portalShape.closePath();

    // Inner doorway cutout
    const holePath = new THREE.Path();
    const iw = pw - pThick;
    const ih = ph * 2 - pThick;
    holePath.moveTo(-iw, 0);
    holePath.lineTo(iw, 0);
    holePath.lineTo(iw, ih);
    holePath.lineTo(-iw, ih);
    holePath.closePath();
    portalShape.holes.push(holePath);

    const portalExtrudeSettings = {
      depth: 0.52,
      bevelEnabled: true,
      bevelSegments: 4,
      bevelThickness: 0.06,
      bevelSize: 0.05,
    };
    const portalGeo = new THREE.ExtrudeGeometry(portalShape, portalExtrudeSettings);
    portalGeo.center();
    portalGeo.translate(0, ph, 0);

    const portalMat = new THREE.MeshStandardMaterial({
      color: 0x141418,
      roughness: 0.28,
      metalness: 0.82,
    });
    const portalMesh = new THREE.Mesh(portalGeo, portalMat);
    portalMesh.castShadow = true;
    portalMesh.receiveShadow = true;
    gatewayGroup.add(portalMesh);

    // Inner Laser Crimson Neon Channel Lining - Pure vivid #D41514 glow
    const neonShape = new THREE.Shape();
    neonShape.moveTo(-iw + 0.03, 0.02);
    neonShape.lineTo(iw - 0.03, 0.02);
    neonShape.lineTo(iw - 0.03, ih - 0.03);
    neonShape.lineTo(-iw + 0.03, ih - 0.03);
    neonShape.closePath();

    const neonInnerHole = new THREE.Path();
    neonInnerHole.moveTo(-iw + 0.12, 0.02);
    neonInnerHole.lineTo(iw - 0.12, 0.02);
    neonInnerHole.lineTo(iw - 0.12, ih - 0.12);
    neonInnerHole.lineTo(-iw + 0.12, ih - 0.12);
    neonInnerHole.closePath();
    neonShape.holes.push(neonInnerHole);

    const neonGeo = new THREE.ExtrudeGeometry(neonShape, { depth: 0.16, bevelEnabled: false });
    neonGeo.center();
    neonGeo.translate(0, ph, 0);

    const neonMat = new THREE.MeshStandardMaterial({
      color: 0xd41514,
      emissive: 0xd41514,
      emissiveIntensity: 0.0, // Ignites upon landing
      roughness: 0.1,
      metalness: 0.9,
    });
    const neonMesh = new THREE.Mesh(neonGeo, neonMat);
    gatewayGroup.add(neonMesh);

    // -------------------------------------------------------------------------
    // FUTURE ILLUMINATED CITYSCAPE SILHOUETTES BEYOND GATEWAY
    // Towers tightly cluster behind and through the gateway opening
    // -------------------------------------------------------------------------
    const cityGroup = new THREE.Group();
    cityGroup.position.set(3.3, 0.4, -5.2);
    cityGroup.rotation.y = -0.36;
    scene.add(cityGroup);

    // Skyscraper window texture generator
    const makeWindowCanvas = () => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 256;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#0c1017";
        ctx.fillRect(0, 0, 128, 256);
        ctx.fillStyle = "#e2e8f0";
        for (let y = 8; y < 248; y += 7) {
          for (let x = 6; x < 122; x += 10) {
            if (Math.random() > 0.4) {
              ctx.fillRect(x, y, 5, 3.5);
            }
          }
        }
      }
      return new THREE.CanvasTexture(c);
    };
    const windowTex = makeWindowCanvas();

    const cityMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      map: windowTex,
      emissive: 0x94a3b8,
      emissiveMap: windowTex,
      emissiveIntensity: 0.6,
      roughness: 0.35,
      metalness: 0.65,
      transparent: true,
      opacity: 0.0,
    });

    const towerGeos = [
      new THREE.BoxGeometry(0.38, 3.6, 0.38),
      new THREE.BoxGeometry(0.52, 4.8, 0.52),
      new THREE.BoxGeometry(0.32, 5.8, 0.32),
      new THREE.BoxGeometry(0.44, 4.2, 0.44),
      new THREE.BoxGeometry(0.60, 3.2, 0.60),
      new THREE.BoxGeometry(0.35, 5.2, 0.35),
    ];
    for (let i = 0; i < 12; i++) {
      const g = towerGeos[i % towerGeos.length];
      const mesh = new THREE.Mesh(g, cityMat);
      mesh.position.set((i - 5.5) * 0.22, (g.parameters.height || 3) * 0.5, (i % 3) * -0.3);
      cityGroup.add(mesh);

      // Antenna spires on tallest towers with beacon lights
      if (i % 2 === 0) {
        const spire = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.018, 1.4, 6),
          new THREE.MeshBasicMaterial({ color: 0xff4d4f })
        );
        spire.position.set(mesh.position.x, (g.parameters.height || 3) + 0.7, mesh.position.z);
        cityGroup.add(spire);
      }
    }

    // -------------------------------------------------------------------------
    // THREE REALISTIC 3D STUDENT CHARACTERS (Standing/Walking on Bridge)
    // -------------------------------------------------------------------------
    const studentsGroup = new THREE.Group();
    scene.add(studentsGroup);

    const studentRigs: StudentRig[] = [
      createStudentRig(0.88), // Student 1 (Left - prominent backpack)
      createStudentRig(0.82), // Student 2 (Center - natural silhouette)
      createStudentRig(0.86), // Student 3 (Right - lead student near gateway)
    ];

    // Offsets along bridge curve (u values: ~0.38, 0.52, 0.66)
    studentRigs[0].offsetT = -0.16;
    studentRigs[1].offsetT = -0.07;
    studentRigs[2].offsetT = 0.05;

    studentRigs.forEach((rig) => {
      rig.root.visible = false;
      studentsGroup.add(rig.root);
    });

    // -------------------------------------------------------------------------
    // ANIMATION TICK LOOP
    // -------------------------------------------------------------------------
    let animId: number;
    let clockStart = performance.now();
    let isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setIsLoaded(true);

    const render = () => {
      const now = performance.now();
      const elapsed = isReduced ? T_FINAL_HERO : (now - clockStart) / 1000;
      setSequenceProgress(Math.min(100, Math.round((elapsed / T_FINAL_HERO) * 100)));

      // 1. Mouse Parallax Interpolation (Smooth Damping)
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;

      // 2. Camera Choreography across the 6 Scenes
      if (elapsed < T_GATEWAY_START) {
        // Scene 1 & 2: Wide panoramic angle watching bridge construction
        const p = easeInOutCubic(clamp(elapsed / T_GATEWAY_START, 0, 1));
        camera.position.lerpVectors(startCamPos, new THREE.Vector3(-0.6, 2.0, 8.6), p);
      } else if (elapsed < T_GATEWAY_LAND) {
        // Scene 3: Camera tracks down as the gateway lands
        const p = easeOutCubic(clamp((elapsed - T_GATEWAY_START) / (T_GATEWAY_LAND - T_GATEWAY_START), 0, 1));
        camera.position.lerpVectors(new THREE.Vector3(-0.6, 2.0, 8.6), finalCamPos, p);
      } else {
        // Scene 4 - 6: Stable hero composition with gentle pointer parallax
        camera.position.set(
          finalCamPos.x + mouse.x * 0.32,
          finalCamPos.y + mouse.y * 0.18,
          finalCamPos.z - Math.abs(mouse.x) * 0.06
        );
      }
      camera.lookAt(1.2 + mouse.x * 0.12, 0.55 + mouse.y * 0.06, -1.8);

      // 3. Scene 2: Bridge Construction Animation (Foundations & Deck Unrolling)
      if (elapsed < T_BRIDGE_START) {
        bridgeGroup.scale.set(0.01, 0.01, 0.01);
        bridgeGroup.position.y = -4.0;
        crimsonRailMat.emissiveIntensity = 0.0;
      } else if (elapsed <= T_BRIDGE_END) {
        const bp = easeOutCubic((elapsed - T_BRIDGE_START) / (T_BRIDGE_END - T_BRIDGE_START));
        bridgeGroup.scale.set(bp, bp, bp);
        bridgeGroup.position.y = (-4.0 * (1 - bp));
        crimsonRailMat.emissiveIntensity = bp * 2.2;
      } else {
        bridgeGroup.scale.set(1, 1, 1);
        bridgeGroup.position.y = 0;
        crimsonRailMat.emissiveIntensity = 2.4;
      }

      // 4. Scene 3: Gateway Descent, Landing Settle & Ignition
      if (elapsed < T_GATEWAY_START) {
        gatewayGroup.position.copy(gateStartPos);
        gatewayGroup.visible = false;
        neonMat.emissiveIntensity = 0.0;
        crimsonGatewayLight.intensity = 0.0;
      } else if (elapsed <= T_GATEWAY_LAND) {
        gatewayGroup.visible = true;
        const gp = easeInOutCubic((elapsed - T_GATEWAY_START) / (T_GATEWAY_LAND - T_GATEWAY_START));
        // Vertical descent with realistic acceleration
        const currY = gateStartPos.y + (gateTargetPos.y - gateStartPos.y) * gp;
        gatewayGroup.position.set(gateTargetPos.x, currY, gateTargetPos.z);
        neonMat.emissiveIntensity = gp * 0.8;
      } else {
        // Settle micro-impact response right after landing
        gatewayGroup.visible = true;
        const settleTime = elapsed - T_GATEWAY_LAND;
        const impactBounce = Math.exp(-settleTime * 6) * Math.cos(settleTime * 14) * 0.08;
        gatewayGroup.position.set(gateTargetPos.x, gateTargetPos.y + impactBounce, gateTargetPos.z);

        // Bridge subtle impact flex
        bridgeGroup.position.y = -impactBounce * 0.35;

        // Laser Crimson ignition - Brilliant #D41514 bloom
        const glowP = clamp((elapsed - T_GATEWAY_LAND) / (T_GATEWAY_GLOW - T_GATEWAY_LAND), 0, 1);
        neonMat.emissiveIntensity = 1.4 + glowP * 3.6;
        crimsonGatewayLight.intensity = glowP * 4.2;
      }

      // 5. Scene 4 & 5: Students Arrive & Walk Toward / Settle in Iconic Composition
      if (elapsed >= T_STUDENTS_START) {
        const walkElapsed = elapsed - T_STUDENTS_START;
        const totalWalkDuration = T_STUDENTS_CROSS - T_STUDENTS_START;
        const walkProgress = clamp(walkElapsed / totalWalkDuration, 0, 1);
        const isSettled = elapsed >= T_STUDENTS_CROSS;

        // Target resting u positions along bridge matching reference image:
        // Student 1 (left with backpack) -> u = 0.36
        // Student 2 (center)             -> u = 0.50
        // Student 3 (right near gateway) -> u = 0.64
        const targetUs = [0.36, 0.50, 0.64];

        studentRigs.forEach((rig, idx) => {
          rig.root.visible = true;

          const startU = 0.04 + idx * 0.06;
          const endU = targetUs[idx];
          const currU = startU + (endU - startU) * easeOutCubic(walkProgress);

          const pos = bridgeSpline.getPointAt(currU);
          const tangent = bridgeSpline.getTangentAt(currU).normalize();
          const binormal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();

          // Staggered lateral offsets across deck width
          const lateralOffset = idx === 0 ? -0.12 : idx === 1 ? 0.08 : -0.04;
          pos.add(binormal.multiplyScalar(lateralOffset));
          pos.y += deckThickness * 0.5 + 0.42; // Foot planted on deck

          rig.root.position.copy(pos);

          // Rotate to face along bridge incline towards portal
          const angle = Math.atan2(tangent.x, tangent.z);
          rig.root.rotation.y = angle;

          if (!isSettled) {
            // Active Walking Cycle Kinematics
            const stridePhase = (walkElapsed * 3.4 + idx * 1.2);
            const legSwing = Math.sin(stridePhase) * 0.45;
            const armSwing = Math.sin(stridePhase + Math.PI) * 0.38;

            rig.leftLeg.rotation.x = legSwing;
            rig.rightLeg.rotation.x = -legSwing;
            rig.leftArm.rotation.x = armSwing;
            rig.rightArm.rotation.x = -armSwing;

            rig.torso.position.y = Math.abs(Math.cos(stridePhase)) * 0.03;
            rig.torso.rotation.y = Math.sin(stridePhase) * 0.05;
          } else {
            // Settled Iconic Standing Poses with subtle breathing kinematics
            const breath = Math.sin(now * 0.0018 + idx) * 0.015;
            rig.leftLeg.rotation.x = idx === 0 ? 0.12 : 0.08;
            rig.rightLeg.rotation.x = idx === 0 ? -0.08 : -0.12;
            rig.leftArm.rotation.x = 0.05;
            rig.rightArm.rotation.x = -0.05;
            rig.torso.position.y = breath;
            rig.torso.rotation.y = idx === 1 ? -0.08 : 0.04;
          }
        });

        // City skyline reveals through the gateway
        const cityAlpha = clamp((walkElapsed - 1.0) / 2.5, 0, 0.95);
        cityMat.opacity = cityAlpha;
      } else {
        studentRigs.forEach((rig) => {
          rig.root.visible = false;
        });
        cityMat.opacity = 0;
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Responsive Resize Handler with dynamic portrait/landscape camera framing
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.fov = w < 768 ? 46 : 36;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    // Visibility observer to conserve GPU resources when scrolled offscreen
    const visObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!animId) animId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animId);
      }
    });
    visObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();
      visObserver.disconnect();
      renderer.dispose();
      scene.clear();
    };
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="hero-3d-scene-container absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      aria-label="SkillBridge Interactive 3D Cinematic Bridge Experience"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Subtle Progress & Sequence Status Indicator */}
      <div
        className={`pointer-events-none absolute bottom-5 right-6 z-20 flex items-center gap-2.5 rounded-full border border-white/10 bg-[#080808]/75 px-3 py-1 text-[0.68rem] font-mono text-[#8E8C8B] backdrop-blur-md transition-opacity duration-700 ${
          isLoaded ? "opacity-90" : "opacity-0"
        }`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D41514] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#D41514]" />
        </span>
        <span>
          {sequenceProgress < 25
            ? "Scene 1: Environment Awake"
            : sequenceProgress < 45
            ? "Scene 2: Bridge Assembling"
            : sequenceProgress < 65
            ? "Scene 3: Gateway Descending"
            : sequenceProgress < 85
            ? "Scene 4: Students Approaching"
            : sequenceProgress < 100
            ? "Scene 5: Crossing Gateway"
            : "SkillBridge 3D Parallax Active"}
        </span>

        {sequenceProgress >= 98 && (
          <button
            type="button"
            onClick={replay}
            className="pointer-events-auto ml-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.62rem] text-[#CDCBCA] hover:text-white hover:bg-white/10 transition-colors"
            title="Replay Cinematic Opening Sequence"
          >
            ↻ Replay
          </button>
        )}
      </div>
    </div>
  );
}
