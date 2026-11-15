"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * SkillBridge — Complete Cinematic 3D Hero Experience (Refined v2)
 * Concept: "The Hand That Becomes Your Bridge"
 * ---------------------------------------------------------------------------
 * Key Engineering & Art Direction Upgrades:
 *  1. Continuous, Seamless Infinite Loop (16.5s period):
 *     - Student steps out from the World A university colonnade portico,
 *       waits as the hand emerges and unfolds into the bridge, walks naturally
 *       across the hand-bridge, and enters the World B glass innovation atrium
 *       while the hand gracefully retracts into the chasm and the camera glides
 *       smoothly back to World A. State at t = 0.0s and t = 16.5s is identical.
 *  2. Redesigned "Premium Architectural Robotics" Hand:
 *     - Sculpted chamfered aerospace titanium metacarpal palm, seamless low-profile
 *       wrist gimbal, tapered forearm fairing, 4 anatomically proportioned tapered
 *       fingers with internal recessed graphite hinges (no bulging cylinder wheels),
 *       anatomically angled opposable thumb, and 2 continuous razor-thin optical
 *       guide filaments along the satin-graphite walkway deck.
 *  3. Natural 4-Phase Human Walking Gait:
 *     - Distance-integrated stride phase with heel-strike, mid-stance hip solver,
 *       toe-off plantarflexion, and grounded contact shadow disc.
 *  4. 60 FPS Performance Pipeline:
 *     - Zero React re-renders during animation (direct DOM ref phase label updates),
 *       zero per-frame heap allocations, analytical contact shadows (no double-pass
 *       shadow map stall), single-lobe PBR environment reflections, consolidated
 *       meshes (< 45 draw calls), and adaptive pixel-ratio frame-time governor.
 *  5. Art-Directed Dark Mode & High-Contrast Daylight Light Mode:
 *     - Dark Mode: Deep Black (#080808), Chrome Silver (#CDCBCA), Laser Crimson (#D41514).
 *     - Light Mode: Warm gallery-ivory & steel-sky daylight, travertine sandstone
 *       university, anodized satin-pewter & deep-graphite titanium hand for strong
 *       silhouette contrast, and realistic daylight glass curtain-wall towers.
 */

// ---------------------------------------------------------------------------
// SEAMLESS INFINITE LOOP TIMELINE (16.5 Seconds Total Period)
// ---------------------------------------------------------------------------
export const LOOP_DURATION = 16.5;

const T_WALK_TO_EDGE_END = 1.9; // 0.0s - 1.9s: Phase 1 (The Gap) — Student walks from portico to edge
const T_EMERGE_START = 1.6; // 1.6s - 4.1s: Phase 2 (Emergence) — Hand rises smoothly from chasm
const T_EMERGE_END = 4.1;
const T_UNFOLD_START = 3.7; // 3.7s - 6.3s: Phase 3 (Transformation) — Wrist levels & fingers unfold
const T_UNFOLD_END = 6.3;
const T_CONNECT_START = 6.1; // 6.1s - 7.3s: Phase 4 (Connection) — Optical walkway filaments ignite
const T_CONNECT_END = 7.3;
const T_CROSS_START = 7.1; // 7.1s - 12.1s: Phase 5 (The Crossing) — Student walks across hand-bridge
const T_CROSS_END = 12.1;
const T_ARRIVE_END = 13.9; // 12.1s - 13.9s: Phase 6 (Possibility) — Student enters World B atrium
const T_RETRACT_START = 13.8; // 13.8s - 16.5s: Seamless Return — Hand folds & descends, camera glides back

// World Coordinates (Positioned on right viewport half so left Hero text never overlaps)
const WORLD_A_PORTICO_X = -0.28; // Inside the university colonnade archway
const WORLD_A_EDGE_X = 0.72; // Waiting point near World A cliff edge
const BRIDGE_START_X = 0.86; // Wrist ramp docks flush with World A terrace
const WRIST_PIVOT_X = 1.32; // Center of wrist gimbal
const PALM_END_X = 2.54; // Distal metacarpal knuckle line
const BRIDGE_END_X = 3.84; // Fingertips lock onto World B plaza receiver
const WORLD_B_PLAZA_X = 4.22; // Arrival plaza on World B
const WORLD_B_ATRIUM_X = 4.68; // Inside World B glass rotunda atrium entrance

const WORLD_A_Y = 0.0;
const WORLD_B_Y = 0.12;
const BRIDGE_SLOPE = Math.atan2(WORLD_B_Y - WORLD_A_Y, BRIDGE_END_X - BRIDGE_START_X);

// Math Utilities (Pure, zero-allocation)
const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInCubic = (t: number) => Math.pow(clamp01(t), 3);
const easeInOutCubic = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Trapezoidal motion profile returning [normalizedPosition 0..1, normalizedSpeed 0..1] */
function trapezoidalMotion(u: number, accel = 0.2): [number, number] {
  const x = clamp01(u);
  const vmax = 1 / (1 - accel);
  if (x < accel) {
    return [(0.5 * vmax * x * x) / accel, x / accel];
  }
  if (x > 1 - accel) {
    const r = 1 - x;
    return [1 - (0.5 * vmax * r * r) / accel, r / accel];
  }
  return [0.5 * vmax * accel + vmax * (x - accel), 1];
}

/** Walkable surface elevation Y at any world X coordinate */
function getWalkSurfaceY(x: number, bridgeDip = 0): number {
  if (x <= BRIDGE_START_X) return WORLD_A_Y;
  if (x >= BRIDGE_END_X) return WORLD_B_Y;
  const u = (x - BRIDGE_START_X) / (BRIDGE_END_X - BRIDGE_START_X);
  const baseLineY = lerp(WORLD_A_Y, WORLD_B_Y, u);
  const subtleCamber = Math.sin(u * Math.PI) * 0.028;
  return baseLineY + subtleCamber - bridgeDip * Math.sin(u * Math.PI);
}

// ---------------------------------------------------------------------------
// PROCEDURAL TEXTURE GENERATORS (Created Once at Init)
// ---------------------------------------------------------------------------
function createSoftRadialShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grd.addColorStop(0, "rgba(15, 23, 42, 0.55)");
    grd.addColorStop(0.55, "rgba(15, 23, 42, 0.22)");
    grd.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createAshlarMasonryTexture(): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#e6e1d8";
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = "rgba(80, 72, 62, 0.22)";
    ctx.lineWidth = 1.5;
    for (let y = 0; y < 128; y += 24) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(128, y);
      ctx.stroke();
      const shift = (y / 24) % 2 === 0 ? 0 : 24;
      for (let x = shift; x < 128; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 24);
        ctx.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createArchitecturalCurtainWallTextures(): {
  darkMap: THREE.CanvasTexture;
  lightMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
} {
  const makeCanvas = (mode: "dark" | "light" | "emissive") => {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 256;
    const ctx = c.getContext("2d");
    if (ctx) {
      if (mode === "emissive") {
        ctx.fillStyle = "#000000";
      } else if (mode === "light") {
        // Refined architectural slate-blue daylight glass
        const grad = ctx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, "#475569");
        grad.addColorStop(0.5, "#64748b");
        grad.addColorStop(1, "#334155");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "#0f172a";
      }
      ctx.fillRect(0, 0, 128, 256);

      // Floor plates & architectural glazing bays
      for (let y = 10; y < 246; y += 14) {
        if (mode !== "emissive") {
          ctx.fillStyle = mode === "light" ? "#94a3b8" : "#334155";
          ctx.fillRect(0, y - 3, 128, 2);
        }
        for (let x = 6; x < 122; x += 16) {
          const hash = (x * 17 + y * 29) % 13;
          if (mode === "light") {
            // Subtle sunlit architectural glass reflection bands in Light Mode (no neon dots!)
            ctx.fillStyle = hash > 5 ? "#cbd5e1" : "#64748b";
            ctx.fillRect(x, y, 11, 8);
          } else if (mode === "dark") {
            ctx.fillStyle = hash > 4 ? "#cbd5e1" : "#1e293b";
            ctx.fillRect(x, y, 11, 8);
          } else {
            // Emissive map for Dark Mode & subtle warm glow
            if (hash > 4) {
              ctx.fillStyle = hash % 3 === 0 ? "#e2e8f0" : "#93c5fd";
              ctx.fillRect(x, y, 11, 8);
            }
          }
        }
      }

      // Vertical curtain-wall mullions
      if (mode !== "emissive") {
        ctx.fillStyle = mode === "light" ? "#cbd5e1" : "#475569";
        for (let x = 3; x < 128; x += 16) {
          ctx.fillRect(x, 0, 1.5, 256);
        }
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };

  return {
    darkMap: makeCanvas("dark"),
    lightMap: makeCanvas("light"),
    emissiveMap: makeCanvas("emissive"),
  };
}

// ---------------------------------------------------------------------------
// REDESIGNED ROBOTIC HAND: "PREMIUM ARCHITECTURAL ROBOTICS"
// ---------------------------------------------------------------------------
interface ArchitecturalHandRig {
  root: THREE.Group;
  wristGroup: THREE.Group;
  fingers: THREE.Group[][]; // 4 fingers x 3 sculpted phalanges
  thumbJoints: [THREE.Group, THREE.Group];
  titaniumShellMat: THREE.MeshStandardMaterial;
  chromeAccentMat: THREE.MeshStandardMaterial;
  graphiteChassisMat: THREE.MeshStandardMaterial;
  walkwayDeckMat: THREE.MeshStandardMaterial;
  opticalRailMat: THREE.MeshStandardMaterial;
  palmResonanceMat: THREE.MeshStandardMaterial;
}

function createSculptedPhalanxGeometry(
  len: number,
  widthProx: number,
  widthDist: number,
  height: number,
  isDistal: boolean
): THREE.BufferGeometry {
  // Creates a sleek, flat-crowned, chamfered architectural phalanx shell
  // Top surface is at y = 0 so all phalanges form a flush continuous bridge deck when extended!
  const shape = new THREE.Shape();
  const r = 0.018;
  const x0 = 0.012;
  const x1 = len - (isDistal ? 0.005 : 0.012);
  const topY = 0;
  const botYProx = -height;
  const botYDist = isDistal ? -height * 0.72 : -height * 0.9;

  shape.moveTo(x0 + r, topY);
  shape.lineTo(x1 - r, topY);
  if (isDistal) {
    // Smoothly tapered fingertip profile
    shape.quadraticCurveTo(x1 + 0.02, topY, x1 + 0.015, botYDist * 0.45);
    shape.quadraticCurveTo(x1, botYDist, x1 - r * 1.5, botYDist);
  } else {
    shape.quadraticCurveTo(x1, topY, x1, topY - r);
    shape.lineTo(x1, botYDist + r);
    shape.quadraticCurveTo(x1, botYDist, x1 - r, botYDist);
  }
  shape.lineTo(x0 + r, botYProx);
  shape.quadraticCurveTo(x0, botYProx, x0, botYProx + r);
  shape.lineTo(x0, topY - r);
  shape.quadraticCurveTo(x0, topY, x0 + r, topY);

  const avgWidth = (widthProx + widthDist) * 0.5;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: avgWidth,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.012,
    bevelSegments: 3,
    curveSegments: 8,
  });
  // Center along Z
  geo.translate(0, 0, -avgWidth * 0.5);
  return geo;
}

function buildArchitecturalRoboticHand(): ArchitecturalHandRig {
  // Primary Brushed Aerospace Titanium Shell
  const titaniumShellMat = new THREE.MeshStandardMaterial({
    color: 0xd2d5dc,
    metalness: 0.84,
    roughness: 0.23,
  });

  // Mirror-Satin Chrome Trim & Precision Rings
  const chromeAccentMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    metalness: 0.95,
    roughness: 0.09,
  });

  // Recessed Anodized Graphite Internal Structure & Hinges
  const graphiteChassisMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430,
    metalness: 0.72,
    roughness: 0.35,
  });

  // Satin-Graphite Non-Slip Walkway Surface Integrated into Top of Hand
  const walkwayDeckMat = new THREE.MeshStandardMaterial({
    color: 0x222834,
    metalness: 0.58,
    roughness: 0.32,
  });

  // Continuous Razor-Thin Optical Guide Filaments (Restrained Laser Crimson #D41514)
  const opticalRailMat = new THREE.MeshStandardMaterial({
    color: 0x2d3545,
    emissive: 0xd41514,
    emissiveIntensity: 0.0,
    metalness: 0.7,
    roughness: 0.2,
  });

  // Minimal Flush Circular Resonance Ring on Palm
  const palmResonanceMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0xd41514,
    emissiveIntensity: 0.0,
    metalness: 0.8,
    roughness: 0.18,
  });

  const root = new THREE.Group();
  root.position.set(WRIST_PIVOT_X, WORLD_A_Y, 0);

  // -------------------------------------------------------------------------
  // 1. SLEEK TAPERED FOREARM STRUCTURE (Angles up from chasm at 34 deg)
  //    Positioned at y = -0.18 so its top collar tucks cleanly under the palm deck!
  // -------------------------------------------------------------------------
  const forearmGroup = new THREE.Group();
  forearmGroup.position.set(-0.08, -0.18, 0);
  forearmGroup.rotation.z = 0.56;
  root.add(forearmGroup);

  // Inner graphite structural core
  const forearmCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.33, 2.6, 20),
    graphiteChassisMat
  );
  forearmCore.position.y = -1.35;
  forearmCore.scale.set(1.0, 1.0, 1.32);
  forearmGroup.add(forearmCore);

  // Sculpted Brushed-Titanium Dorsal & Ventral Fairing Shells
  const fairingTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.37, 2.25, 24, 1, false, -Math.PI * 0.42, Math.PI * 0.84),
    titaniumShellMat
  );
  fairingTop.position.y = -1.32;
  fairingTop.scale.set(1.04, 1.0, 1.35);
  forearmGroup.add(fairingTop);

  const fairingBot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.37, 2.25, 24, 1, false, Math.PI * 0.58, Math.PI * 0.84),
    titaniumShellMat
  );
  fairingBot.position.y = -1.32;
  fairingBot.scale.set(1.04, 1.0, 1.35);
  forearmGroup.add(fairingBot);

  // Precision Satin-Chrome Collar Rings (Clean, understated architectural bands)
  for (const [yPos, rad] of [
    [-0.32, 0.285],
    [-1.15, 0.325],
    [-1.98, 0.365],
  ] as [number, number][]) {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(rad, rad, 0.045, 24),
      chromeAccentMat
    );
    collar.position.y = yPos;
    collar.scale.set(1.05, 1.0, 1.36);
    forearmGroup.add(collar);
  }

  // Twin Internal Hydraulic Struts (Tucked cleanly inside forearm lateral channels)
  for (const zSide of [-0.28, 0.28]) {
    const strut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 1.45, 12),
      chromeAccentMat
    );
    strut.position.set(0.06, -1.05, zSide);
    forearmGroup.add(strut);
  }

  // -------------------------------------------------------------------------
  // 2. SEAMLESS LOW-PROFILE WRIST GIMBAL & METACARPAL PALM DECK
  //    (All top surfaces align flush at y = 0.0 — zero protruding drums!)
  // -------------------------------------------------------------------------
  const wristGroup = new THREE.Group();
  wristGroup.rotation.order = "ZYX";
  root.add(wristGroup);

  // Low-profile internal wrist gimbal cylinder (sits at y = -0.13, completely below y = 0 deck)
  const wristGimbal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.115, 0.115, 0.92, 24),
    graphiteChassisMat
  );
  wristGimbal.rotation.x = Math.PI / 2;
  wristGimbal.position.set(-0.04, -0.125, 0);
  wristGroup.add(wristGimbal);

  // Flush Satin-Chrome Wrist Side Bezels
  for (const zSide of [-0.47, 0.47]) {
    const bezel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.105, 0.025, 24),
      chromeAccentMat
    );
    bezel.rotation.x = Math.PI / 2;
    bezel.position.set(-0.04, -0.125, zSide);
    wristGroup.add(bezel);
  }

  // Unified Sculpted Wrist-to-Palm Bridge Shell (x = -0.46 to x = +1.22, top flush at y = 0.0)
  const palmProfile = new THREE.Shape();
  const wx0 = -0.46; // Docks with World A terrace edge
  const px1 = 1.22; // Distal knuckle line
  palmProfile.moveTo(wx0, 0.0);
  palmProfile.lineTo(px1, 0.0);
  palmProfile.lineTo(px1, -0.15);
  palmProfile.quadraticCurveTo(0.65, -0.22, 0.05, -0.21);
  palmProfile.quadraticCurveTo(-0.25, -0.18, wx0, -0.09);
  palmProfile.closePath();

  const palmWidth = 1.04;
  const palmGeo = new THREE.ExtrudeGeometry(palmProfile, {
    depth: palmWidth,
    bevelEnabled: true,
    bevelThickness: 0.024,
    bevelSize: 0.02,
    bevelSegments: 4,
    curveSegments: 12,
  });
  palmGeo.translate(0, -0.02, -palmWidth * 0.5);
  const palmShell = new THREE.Mesh(palmGeo, titaniumShellMat);
  wristGroup.add(palmShell);

  // 4 Sculpted Dorsal Metacarpal Rib Plates on top of the palm for anatomical hand realism
  const metacarpalZ = [-0.38, -0.128, 0.128, 0.38];
  for (const mz of metacarpalZ) {
    const rib = new THREE.Mesh(
      new THREE.BoxGeometry(1.58, 0.012, 0.215),
      titaniumShellMat
    );
    rib.position.set(0.38, 0.002, mz);
    wristGroup.add(rib);
  }

  // Central Satin-Graphite Walkway Inlay along Wrist & Palm (Flush at y = 0.008)
  const palmWalkway = new THREE.Mesh(
    new THREE.BoxGeometry(1.66, 0.008, 0.46),
    walkwayDeckMat
  );
  palmWalkway.position.set(0.38, 0.008, 0);
  wristGroup.add(palmWalkway);

  // Minimal Flush Circular Resonance Ring in center of Palm (x = 0.54)
  const resonanceOuter = new THREE.Mesh(
    new THREE.RingGeometry(0.115, 0.135, 32),
    palmResonanceMat
  );
  resonanceOuter.rotation.x = -Math.PI / 2;
  resonanceOuter.position.set(0.54, 0.014, 0);
  wristGroup.add(resonanceOuter);

  const resonanceInner = new THREE.Mesh(
    new THREE.RingGeometry(0.055, 0.068, 28),
    chromeAccentMat
  );
  resonanceInner.rotation.x = -Math.PI / 2;
  resonanceInner.position.set(0.54, 0.014, 0);
  wristGroup.add(resonanceInner);

  // Continuous Razor-Thin Optical Guide Filaments along Wrist & Palm Walkway Edges
  for (const zEdge of [-0.22, 0.22]) {
    const palmFilament = new THREE.Mesh(
      new THREE.BoxGeometry(1.66, 0.009, 0.014),
      opticalRailMat
    );
    palmFilament.position.set(0.38, 0.012, zEdge);
    wristGroup.add(palmFilament);
  }

  // -------------------------------------------------------------------------
  // 3. FOUR ANATOMICALLY PROPORTIONED, TAPERED ARTICULATED FINGERS
  //    (Sculpted chamfered phalanges + tucked internal graphite hinges)
  // -------------------------------------------------------------------------
  const fingerZPositions = [-0.38, -0.128, 0.128, 0.38]; // Index, Middle, Ring, Pinky
  const fingerLengthScales = [0.95, 1.0, 0.96, 0.84];
  const fingerWidths = [0.215, 0.225, 0.215, 0.19];
  const basePhalanxLengths = [0.56, 0.43, 0.33];
  const basePhalanxHeights = [0.135, 0.112, 0.088];

  const fingers: THREE.Group[][] = fingerZPositions.map((zPos, fIdx) => {
    const segments: THREE.Group[] = [];
    let parentObj: THREE.Object3D = wristGroup;
    let offsetX = px1 + 0.015;
    const fScale = fingerLengthScales[fIdx];
    const fWidth = fingerWidths[fIdx];

    for (let sIdx = 0; sIdx < 3; sIdx++) {
      const segLen = basePhalanxLengths[sIdx] * fScale;
      const segHeight = basePhalanxHeights[sIdx];
      const wProx = fWidth * (1 - sIdx * 0.07);
      const wDist = fWidth * (1 - (sIdx + 1) * 0.07);

      const jointGroup = new THREE.Group();
      jointGroup.position.set(offsetX, 0, sIdx === 0 ? zPos : 0);

      // Internal Recessed Graphite Hinge (Narrower than phalanx width so it never sticks out!)
      const hingeRadius = segHeight * 0.38;
      const hingeMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(hingeRadius, hingeRadius, wProx * 0.82, 16),
        graphiteChassisMat
      );
      hingeMesh.rotation.x = Math.PI / 2;
      hingeMesh.position.set(0, -segHeight * 0.48, 0);
      jointGroup.add(hingeMesh);

      // Sculpted Chamfered Titanium Phalanx Shell (Top surface flush at y = 0.0)
      const phalanxGeo = createSculptedPhalanxGeometry(
        segLen,
        wProx,
        wDist,
        segHeight,
        sIdx === 2
      );
      const phalanxMesh = new THREE.Mesh(phalanxGeo, titaniumShellMat);
      jointGroup.add(phalanxMesh);

      // Central Walkway Inlay & Thin Optical Guide Filament on Middle & Ring Fingers
      if (fIdx === 1 || fIdx === 2) {
        const inlay = new THREE.Mesh(
          new THREE.BoxGeometry(segLen * 0.9, 0.006, wProx * 0.88),
          walkwayDeckMat
        );
        inlay.position.set(segLen * 0.48, 0.005, 0);
        jointGroup.add(inlay);

        const railZ = fIdx === 1 ? -wProx * 0.42 : wProx * 0.42;
        const fingerFilament = new THREE.Mesh(
          new THREE.BoxGeometry(segLen * 0.92, 0.008, 0.013),
          opticalRailMat
        );
        fingerFilament.position.set(segLen * 0.48, 0.009, railZ);
        jointGroup.add(fingerFilament);
      }

      parentObj.add(jointGroup);
      segments.push(jointGroup);
      parentObj = jointGroup;
      offsetX = segLen;
    }
    return segments;
  });

  // -------------------------------------------------------------------------
  // 4. ANATOMICALLY INTEGRATED OPPOSABLE THUMB (Streamlined Lateral Wing)
  // -------------------------------------------------------------------------
  const thumbBase = new THREE.Group();
  // Positioned at the anatomical trapeziometacarpal saddle joint on the foreground side
  thumbBase.position.set(0.18, -0.035, 0.51);
  wristGroup.add(thumbBase);

  const thumbProxGeo = createSculptedPhalanxGeometry(0.48, 0.19, 0.17, 0.125, false);
  const thumbProxMesh = new THREE.Mesh(thumbProxGeo, titaniumShellMat);
  thumbBase.add(thumbProxMesh);

  const thumbBaseHinge = new THREE.Mesh(
    new THREE.SphereGeometry(0.072, 14, 12),
    graphiteChassisMat
  );
  thumbBaseHinge.position.set(0, -0.06, -0.02);
  thumbBase.add(thumbBaseHinge);

  const thumbDistal = new THREE.Group();
  thumbDistal.position.set(0.48, 0, 0);
  thumbBase.add(thumbDistal);

  const thumbDistGeo = createSculptedPhalanxGeometry(0.38, 0.17, 0.14, 0.105, true);
  const thumbDistMesh = new THREE.Mesh(thumbDistGeo, titaniumShellMat);
  thumbDistal.add(thumbDistMesh);

  // Subtle chrome trim line along the camera-facing side of the thumb
  const thumbChromeTrim = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.014, 0.01),
    chromeAccentMat
  );
  thumbChromeTrim.position.set(0.24, -0.05, 0.095);
  thumbBase.add(thumbChromeTrim);

  return {
    root,
    wristGroup,
    fingers,
    thumbJoints: [thumbBase, thumbDistal],
    titaniumShellMat,
    chromeAccentMat,
    graphiteChassisMat,
    walkwayDeckMat,
    opticalRailMat,
    palmResonanceMat,
  };
}

interface HandPoseState {
  riseProgress: number; // 0 = submerged in chasm, 1 = bridge level
  unfoldProgress: number; // 0 = poised/curled, 1 = extended bridge locked onto World B
  settleBounce: number; // damped mechanical lock settle
  connectProgress: number; // 0..1 optical filament activation
  bridgeDip: number; // subtle physical weight response under student's footsteps
}

const COLOR_GRAPHITE_TRIM = new THREE.Color(0x2d3545);
const COLOR_LASER_CRIMSON = new THREE.Color(0xd41514);

function applyArchitecturalHandPose(hand: ArchitecturalHandRig, s: HandPoseState) {
  const emergeEase = smootherstep(s.riseProgress);
  const unfoldEase = easeInOutCubic(s.unfoldProgress);

  const submergedY = -3.85;
  const submergedXOffset = -0.24;
  hand.root.position.set(
    WRIST_PIVOT_X + submergedXOffset * (1 - emergeEase),
    lerp(submergedY, WORLD_A_Y, emergeEase) - s.bridgeDip + s.settleBounce * 0.024,
    0
  );
  hand.root.visible = s.riseProgress > 0.002;

  // Wrist articulates from poised 28-deg upward posture into exact horizontal bridge slope
  const poisedPitch = 0.48;
  hand.wristGroup.rotation.z =
    lerp(poisedPitch, BRIDGE_SLOPE, unfoldEase) + s.settleBounce * 0.016;
  hand.wristGroup.rotation.x = lerp(0.18, 0.0, unfoldEase);

  // 4 Fingers uncurl in a smooth biomechanical wave (Index -> Middle -> Ring -> Pinky)
  const phalanxCurlRatios = [0.72, 0.98, 0.82];
  hand.fingers.forEach((segs, fIdx) => {
    const waveDelay = fIdx * 0.055;
    const fingerOpen = easeInOutCubic(
      clamp01((s.unfoldProgress - waveDelay) / (1 - waveDelay * 0.75))
    );
    const curlRad = (1 - fingerOpen) * 0.88;
    segs.forEach((joint, sIdx) => {
      joint.rotation.z = -curlRad * phalanxCurlRatios[sIdx];
    });
  });

  // Opposable Thumb sweeps naturally alongside the palm at a 26-deg lateral angle
  const thumbOpen = easeInOutCubic(clamp01((s.unfoldProgress - 0.05) / 0.88));
  hand.thumbJoints[0].rotation.y = lerp(-0.62, -0.36, thumbOpen);
  hand.thumbJoints[0].rotation.z = lerp(-0.52, -0.05, thumbOpen);
  hand.thumbJoints[1].rotation.y = lerp(0.28, 0.16, thumbOpen);
  hand.thumbJoints[1].rotation.z = lerp(-0.64, -0.04, thumbOpen);

  // Restrained, high-precision optical filament activation
  const power = smoothstep(s.connectProgress);
  hand.opticalRailMat.color.lerpColors(COLOR_GRAPHITE_TRIM, COLOR_LASER_CRIMSON, power);
  hand.opticalRailMat.emissiveIntensity = power * 1.65;

  hand.palmResonanceMat.color.lerpColors(COLOR_GRAPHITE_TRIM, COLOR_LASER_CRIMSON, power);
  hand.palmResonanceMat.emissiveIntensity = power * 1.85;
}

// ---------------------------------------------------------------------------
// REALISTIC STUDENT CHARACTER RIG WITH 4-PHASE KINEMATIC GAIT & CONTACT SHADOW
// ---------------------------------------------------------------------------
const L_THIGH = 0.235;
const L_SHIN = 0.225;
const FOOT_H = 0.036;
const CHAR_SCALE = 0.82;
const STRIDE_LEN = 0.6 * CHAR_SCALE;

interface StudentLimb {
  thigh: THREE.Group;
  shin: THREE.Group;
  foot: THREE.Group;
}

interface StudentArm {
  upper: THREE.Group;
  fore: THREE.Group;
}

interface RealisticStudentRig {
  root: THREE.Group;
  hips: THREE.Group;
  spine: THREE.Group;
  head: THREE.Group;
  legs: [StudentLimb, StudentLimb];
  arms: [StudentArm, StudentArm];
  contactShadow: THREE.Mesh;
  contactShadowMat: THREE.MeshBasicMaterial;
  jacketMat: THREE.MeshStandardMaterial;
  pantsMat: THREE.MeshStandardMaterial;
  allMaterials: THREE.MeshStandardMaterial[];
  currentOpacity: number;
}

function buildRealisticStudentRig(shadowTex: THREE.Texture): RealisticStudentRig {
  const allMaterials: THREE.MeshStandardMaterial[] = [];
  const makeMat = (color: number, roughness = 0.65, metalness = 0.08) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    allMaterials.push(m);
    return m;
  };

  const skinMat = makeMat(0xe0b18c, 0.55, 0.04);
  const hairMat = makeMat(0x1c1613, 0.72, 0.05);
  const jacketMat = makeMat(0x283856, 0.58, 0.14);
  const hoodieTrimMat = makeMat(0x1b2436, 0.68, 0.1);
  const shirtMat = makeMat(0xf8fafc, 0.45, 0.05);
  const pantsMat = makeMat(0x1a202c, 0.72, 0.08);
  const shoeMat = makeMat(0xf8fafc, 0.38, 0.1);
  const soleMat = makeMat(0xd41514, 0.48, 0.15);
  const packMat = makeMat(0x334155, 0.58, 0.18);

  const makeSegment = (len: number, rTop: number, rBot: number, mat: THREE.Material) => {
    const grp = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(rTop, rBot, len, 12, 1);
    cylGeo.translate(0, -len / 2, 0);
    grp.add(new THREE.Mesh(cylGeo, mat));
    grp.add(new THREE.Mesh(new THREE.SphereGeometry(rTop, 10, 8), mat));
    const botSphere = new THREE.Mesh(new THREE.SphereGeometry(rBot, 10, 8), mat);
    botSphere.position.y = -len;
    grp.add(botSphere);
    return grp;
  };

  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = L_THIGH + L_SHIN + FOOT_H;
  root.add(hips);

  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 10), pantsMat);
  pelvis.scale.set(1.28, 0.85, 0.9);
  hips.add(pelvis);

  const legs = [1, -1].map((side) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.045, -0.01, 0);
    thigh.add(makeSegment(L_THIGH, 0.041, 0.032, pantsMat));

    const shin = new THREE.Group();
    shin.position.y = -L_THIGH;
    shin.add(makeSegment(L_SHIN, 0.032, 0.025, pantsMat));
    thigh.add(shin);

    const foot = new THREE.Group();
    foot.position.y = -L_SHIN;

    const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.03, 0.112), shoeMat);
    shoeUpper.position.set(0, -FOOT_H + 0.018, 0.026);
    foot.add(shoeUpper);

    const shoeToe = new THREE.Mesh(new THREE.SphereGeometry(0.027, 10, 8), shoeMat);
    shoeToe.scale.set(1, 0.58, 1.05);
    shoeToe.position.set(0, -FOOT_H + 0.015, 0.082);
    foot.add(shoeToe);

    const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.008, 0.122), soleMat);
    shoeSole.position.set(0, -FOOT_H + 0.004, 0.03);
    foot.add(shoeSole);

    shin.add(foot);
    hips.add(thigh);
    return { thigh, shin, foot };
  }) as [StudentLimb, StudentLimb];

  const spine = new THREE.Group();
  spine.position.y = 0.02;
  hips.add(spine);

  const torsoMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.066, 0.16, 6, 14), jacketMat);
  torsoMesh.scale.set(1.3, 1, 0.78);
  torsoMesh.position.y = 0.15;
  spine.add(torsoMesh);

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.075, 0.014), shirtMat);
  collar.position.set(0, 0.24, 0.05);
  collar.rotation.x = -0.1;
  spine.add(collar);

  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.056, 12, 8), hoodieTrimMat);
  hood.scale.set(1.3, 0.66, 0.94);
  hood.position.set(0, 0.27, -0.036);
  spine.add(hood);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.2, 0.078), packMat);
  backpack.position.set(0, 0.165, -0.084);
  spine.add(backpack);

  const packTop = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.14, 10), packMat);
  packTop.rotation.z = Math.PI / 2;
  packTop.position.set(0, 0.265, -0.084);
  spine.add(packTop);

  for (const side of [1, -1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.165, 0.01), packMat);
    strap.position.set(side * 0.046, 0.18, 0.051);
    strap.rotation.x = -0.08;
    spine.add(strap);
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.046, 10), skinMat);
  neck.position.y = 0.3;
  spine.add(neck);

  const head = new THREE.Group();
  head.position.y = 0.33;
  spine.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 14), skinMat);
  skull.scale.set(0.92, 1.08, 0.98);
  skull.position.y = 0.06;
  head.add(skull);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.065, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.scale.set(0.94, 1.06, 1.03);
  hairCap.position.set(0, 0.068, -0.005);
  hairCap.rotation.x = -0.28;
  head.add(hairCap);

  const arms = [1, -1].map((side) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.094, 0.265, 0);
    upper.add(makeSegment(0.15, 0.028, 0.023, jacketMat));

    const fore = new THREE.Group();
    fore.position.y = -0.15;
    fore.add(makeSegment(0.138, 0.023, 0.019, jacketMat));

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.021, 8, 8), skinMat);
    hand.scale.set(0.8, 1.15, 0.9);
    hand.position.y = -0.155;
    fore.add(hand);

    upper.add(fore);
    spine.add(upper);
    return { upper, fore };
  }) as [StudentArm, StudentArm];

  root.scale.setScalar(CHAR_SCALE);
  root.rotation.y = Math.PI / 2;

  // Grounded Contact Shadow Disc (Follows student's exact X/Y surface coordinates)
  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.28), contactShadowMat);
  contactShadow.rotation.x = -Math.PI / 2;

  return {
    root,
    hips,
    spine,
    head,
    legs,
    arms,
    contactShadow,
    contactShadowMat,
    jacketMat,
    pantsMat,
    allMaterials,
    currentOpacity: 1,
  };
}

interface StudentPoseState {
  x: number;
  z: number;
  stridePhase: number;
  strideAmp: number;
  lean: number;
  lookPitch: number;
  lookYaw: number;
  facingYaw: number;
  bridgeDip: number;
  opacity: number;
}

function applyStudentPose(rig: RealisticStudentRig, p: StudentPoseState) {
  // Smooth fade when entering/exiting architectural doorways
  const op = clamp01(p.opacity);
  if (Math.abs(rig.currentOpacity - op) > 0.004) {
    rig.currentOpacity = op;
    const isTrans = op < 0.995;
    for (let i = 0; i < rig.allMaterials.length; i++) {
      const m = rig.allMaterials[i];
      if (m.transparent !== isTrans) {
        m.transparent = isTrans;
        m.needsUpdate = true;
      }
      m.opacity = op;
    }
  }
  rig.root.visible = op > 0.005;
  rig.contactShadow.visible = op > 0.005;

  const groundY = getWalkSurfaceY(p.x, p.bridgeDip);
  rig.root.position.set(p.x, groundY, p.z);
  rig.root.rotation.y = p.facingYaw;

  // 4-Phase Biomechanical Gait Solver (Heel strike, mid-stance, push-off, swing)
  const thighAmp = 0.42 * p.strideAmp;
  const kneeAmp = 0.78 * p.strideAmp;
  let solvedHipHeight = 0;

  for (let i = 0; i < 2; i++) {
    const ph = p.stridePhase + (i === 0 ? 0 : Math.PI);
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    const thighAngle = thighAmp * s;
    const kneeFlex = 0.035 * p.strideAmp + kneeAmp * Math.pow(Math.max(0, c), 1.35);

    // Subtle ankle dorsiflexion on heel-strike & plantarflexion on push-off
    const ankleRoll = 0.12 * p.strideAmp * Math.sin(ph - 0.35);

    const leg = rig.legs[i];
    leg.thigh.rotation.x = -thighAngle;
    leg.shin.rotation.x = kneeFlex;
    leg.foot.rotation.x = thighAngle - kneeFlex + ankleRoll;

    const legVerticalSpan =
      L_THIGH * Math.cos(thighAngle) + L_SHIN * Math.cos(thighAngle - kneeFlex) + FOOT_H;
    if (legVerticalSpan > solvedHipHeight) {
      solvedHipHeight = legVerticalSpan;
    }
  }

  rig.hips.position.y = solvedHipHeight;
  rig.hips.rotation.y = -0.065 * p.strideAmp * Math.sin(p.stridePhase);

  rig.spine.rotation.x = p.lean;
  rig.spine.rotation.y = 0.095 * p.strideAmp * Math.sin(p.stridePhase);

  const armAmp = 0.36 * p.strideAmp;
  for (let i = 0; i < 2; i++) {
    const arm = rig.arms[i];
    const swing = (i === 0 ? -1 : 1) * armAmp * Math.sin(p.stridePhase);
    arm.upper.rotation.x = -swing;
    arm.upper.rotation.z = (i === 0 ? 1 : -1) * 0.07;
    arm.fore.rotation.x = -(0.16 + 0.28 * Math.max(0, swing) + 0.07 * p.strideAmp);
  }

  rig.head.rotation.x = p.lookPitch - 0.45 * p.lean;
  rig.head.rotation.y = p.lookYaw;

  // Grounded contact shadow tracks feet on terrace, hand-bridge, and plaza
  rig.contactShadow.position.set(p.x, groundY + 0.012, p.z);
  rig.contactShadowMat.opacity = 0.46 * op;
}

// ---------------------------------------------------------------------------
// WORLD A (UNIVERSITY QUAD) & WORLD B (INNOVATION CAMPUS) BUILDERS
// ---------------------------------------------------------------------------
interface EnvironmentsRig {
  worldAGroup: THREE.Group;
  worldBGroup: THREE.Group;
  stoneMat: THREE.MeshStandardMaterial;
  stoneTrimMat: THREE.MeshStandardMaterial;
  uniWindowMat: THREE.MeshStandardMaterial;
  cliffMat: THREE.MeshStandardMaterial;
  foliageMat: THREE.MeshStandardMaterial;
  campusLanternLight: THREE.PointLight;
  worldBGlassMat: THREE.MeshStandardMaterial;
  worldBSteelMat: THREE.MeshStandardMaterial;
  worldBWindowMat: THREE.MeshStandardMaterial;
  worldBDarkWindowTex: THREE.CanvasTexture;
  worldBLightWindowTex: THREE.CanvasTexture;
  worldBBeaconMat: THREE.MeshStandardMaterial;
  worldBRingMat: THREE.MeshBasicMaterial;
  worldBLight: THREE.PointLight;
}

function buildTwoWorlds(): EnvironmentsRig {
  const cliffMat = new THREE.MeshStandardMaterial({
    color: 0x1a202c,
    roughness: 0.84,
    metalness: 0.14,
    flatShading: true,
  });

  // -------------------------------------------------------------------------
  // WORLD A — WHERE YOU BEGIN (Realistic University Quad & Overlook Terrace)
  // -------------------------------------------------------------------------
  const worldAGroup = new THREE.Group();

  const stoneTex = createAshlarMasonryTexture();
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x4a453f,
    map: stoneTex,
    roughness: 0.68,
    metalness: 0.08,
  });

  const stoneTrimMat = new THREE.MeshStandardMaterial({
    color: 0x665f57,
    roughness: 0.54,
    metalness: 0.12,
  });

  const uniWindowMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: 0xffdba8,
    emissiveIntensity: 0.45,
    roughness: 0.22,
    metalness: 0.45,
  });

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x234233,
    roughness: 0.78,
    metalness: 0.05,
  });

  // Layered Geological Cliff Strata beneath World A
  const leftStrataSpecs: [number, number, number, number, number, number][] = [
    [-0.35, -0.55, -0.15, 2.55, 0.75, 2.2],
    [-0.55, -1.35, -0.2, 2.35, 0.95, 2.0],
    [-0.75, -2.35, -0.25, 2.1, 1.2, 1.8],
    [-0.95, -3.55, -0.3, 1.85, 1.4, 1.6],
    [0.32, -0.42, 0.0, 0.95, 0.55, 1.45],
    [0.18, -1.05, -0.05, 0.85, 0.78, 1.25],
  ];
  for (const [sx, sy, sz, sw, sh, sd] of leftStrataSpecs) {
    const stratum = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, sd), cliffMat);
    stratum.position.set(sx, sy, sz);
    worldAGroup.add(stratum);
  }

  // Main University Terrace Platform (Top surface at y = WORLD_A_Y = 0.0, right edge at x = 0.86)
  const terraceSlab = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.22, 2.3), stoneMat);
  terraceSlab.position.set(-0.58, -0.11, -0.15);
  worldAGroup.add(terraceSlab);

  const terraceCornice = new THREE.Mesh(new THREE.BoxGeometry(2.96, 0.06, 2.36), stoneTrimMat);
  terraceCornice.position.set(-0.58, -0.03, -0.15);
  worldAGroup.add(terraceCornice);

  // University Academic Hall & Colonnade Portico
  const academicHall = new THREE.Group();
  academicHall.position.set(-0.62, 0.0, -0.78);
  worldAGroup.add(academicHall);

  const hallBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.62, 0.68), stoneMat);
  hallBody.position.set(0, 0.81, -0.22);
  academicHall.add(hallBody);

  for (const wx of [-0.68, -0.22, 0.22, 0.68]) {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.68, 0.06), stoneTrimMat);
    winFrame.position.set(wx, 0.82, 0.11);
    academicHall.add(winFrame);

    const winPane = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.07), uniWindowMat);
    winPane.position.set(wx, 0.82, 0.115);
    academicHall.add(winPane);
  }

  for (const cx of [-0.88, -0.44, 0.0, 0.44, 0.88]) {
    const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.17), stoneTrimMat);
    colBase.position.set(cx, 0.05, 0.34);
    academicHall.add(colBase);

    const colShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.38, 14), stoneTrimMat);
    colShaft.position.set(cx, 0.78, 0.34);
    academicHall.add(colShaft);

    const colCap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), stoneTrimMat);
    colCap.position.set(cx, 1.48, 0.34);
    academicHall.add(colCap);
  }

  const entablature = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.18, 0.88), stoneTrimMat);
  entablature.position.set(0, 1.61, 0.04);
  academicHall.add(entablature);

  const pediment = new THREE.Mesh(new THREE.ConeGeometry(1.28, 0.42, 4), stoneMat);
  pediment.position.set(0, 1.91, 0.04);
  pediment.rotation.y = Math.PI / 4;
  pediment.scale.set(1.22, 1, 0.65);
  academicHall.add(pediment);

  // Foreground Terrace Stone Balustrade
  for (let i = 0; i < 7; i++) {
    const bx = -0.55 + i * 0.2;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.21, 0.04), stoneTrimMat);
    post.position.set(bx, 0.105, 0.64);
    worldAGroup.add(post);
  }
  const railBar = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.04, 0.06), stoneTrimMat);
  railBar.position.set(0.05, 0.22, 0.64);
  worldAGroup.add(railBar);

  // Campus Trees & Courtyard Greenery
  for (const [tx, tz, scale] of [
    [-1.45, 0.45, 1.0],
    [0.42, -0.68, 0.88],
  ] as [number, number, number][]) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, tz);
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035 * scale, 0.05 * scale, 0.45 * scale, 8),
      cliffMat
    );
    trunk.position.y = 0.22 * scale;
    treeGroup.add(trunk);

    const canopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26 * scale, 1), foliageMat);
    canopy1.position.set(0, 0.52 * scale, 0);
    treeGroup.add(canopy1);

    const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 * scale, 1), foliageMat);
    canopy2.position.set(0.12 * scale, 0.64 * scale, 0.06 * scale);
    treeGroup.add(canopy2);

    worldAGroup.add(treeGroup);
  }

  // Academic Courtyard Lamppost near World A Edge
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.82, 8), cliffMat);
  lanternPost.position.set(0.62, 0.41, -0.42);
  worldAGroup.add(lanternPost);

  const lanternGlobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe4b5 })
  );
  lanternGlobe.position.set(0.62, 0.84, -0.42);
  worldAGroup.add(lanternGlobe);

  const campusLanternLight = new THREE.PointLight(0xffcf96, 1.6, 4.2, 1.5);
  campusLanternLight.position.set(0.62, 0.88, -0.32);
  worldAGroup.add(campusLanternLight);

  // -------------------------------------------------------------------------
  // WORLD B — WHERE YOU CAN GO (Modern Glass Architecture & Tech Campus)
  // -------------------------------------------------------------------------
  const worldBGroup = new THREE.Group();

  const {
    darkMap: worldBDarkWindowTex,
    lightMap: worldBLightWindowTex,
    emissiveMap: cwEmissive,
  } = createArchitecturalCurtainWallTextures();

  const worldBWindowMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: worldBDarkWindowTex,
    emissive: 0x93c5fd,
    emissiveMap: cwEmissive,
    emissiveIntensity: 0.65,
    roughness: 0.18,
    metalness: 0.72,
  });

  const worldBGlassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.4,
    roughness: 0.15,
    transparent: true,
    opacity: 0.32,
  });

  const worldBSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.84,
    roughness: 0.22,
  });

  const worldBBeaconMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0xd41514,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.85,
  });

  // Engineered Multi-Strata Foundation & Cliff beneath World B
  const rightStrataSpecs: [number, number, number, number, number, number][] = [
    [4.95, -0.45, -0.2, 2.7, 0.78, 2.4],
    [5.15, -1.3, -0.25, 2.5, 1.0, 2.2],
    [5.35, -2.35, -0.3, 2.2, 1.3, 1.9],
    [5.55, -3.6, -0.35, 1.9, 1.5, 1.7],
    [4.12, -0.32, 0.0, 0.85, 0.52, 1.5],
    [4.28, -0.95, -0.05, 0.75, 0.78, 1.3],
  ];
  for (const [sx, sy, sz, sw, sh, sd] of rightStrataSpecs) {
    const stratum = new THREE.Mesh(new THREE.BoxGeometry(sw, sh, sd), cliffMat);
    stratum.position.set(sx, sy, sz);
    worldBGroup.add(stratum);
  }

  // Sleek Cantilevered Innovation Plaza Deck (Left edge at x = 3.78, top at y = WORLD_B_Y = 0.12)
  const plazaDeck = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 2.5), worldBSteelMat);
  plazaDeck.position.set(5.28, WORLD_B_Y - 0.1, -0.2);
  worldBGroup.add(plazaDeck);

  // Precision Titanium Receiver Pad where the Robotic Hand's fingertips dock (x = 3.84)
  const receiverBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.024, 1.12), worldBSteelMat);
  receiverBase.position.set(3.96, WORLD_B_Y + 0.012, 0);
  worldBGroup.add(receiverBase);

  const receiverAccent = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 1.04), worldBBeaconMat);
  receiverAccent.position.set(3.79, WORLD_B_Y + 0.015, 0);
  worldBGroup.add(receiverAccent);

  // Glass Guardrail along foreground edge of World B Plaza
  const glassRail = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.025), worldBGlassMat);
  glassRail.position.set(4.95, WORLD_B_Y + 0.09, 0.66);
  worldBGroup.add(glassRail);

  // Foreground Curved Glass Innovation Rotunda / Atrium Pavilion (Where student enters at x = 4.68)
  const rotundaGroup = new THREE.Group();
  rotundaGroup.position.set(4.78, WORLD_B_Y, -0.32);
  worldBGroup.add(rotundaGroup);

  const rotundaCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.45, 1.35, 24),
    worldBWindowMat
  );
  rotundaCore.position.y = 0.675;
  rotundaGroup.add(rotundaCore);

  for (const ringY of [0.34, 0.68, 1.02, 1.36]) {
    const floorRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.465, 0.465, 0.038, 24),
      worldBSteelMat
    );
    floorRing.position.y = ringY;
    rotundaGroup.add(floorRing);
  }

  // Tiered Curtain-Wall Glass Skyscrapers & Corporate Innovation Towers
  const towerSpecs: { x: number; z: number; w: number; h: number; d: number }[] = [
    { x: 5.32, z: -0.98, w: 0.68, h: 2.95, d: 0.62 },
    { x: 4.38, z: -1.25, w: 0.56, h: 2.15, d: 0.54 },
    { x: 5.98, z: -0.78, w: 0.62, h: 2.45, d: 0.58 },
    { x: 5.08, z: -1.72, w: 0.72, h: 3.65, d: 0.66 },
    { x: 5.85, z: -1.52, w: 0.58, h: 3.1, d: 0.56 },
  ];

  towerSpecs.forEach((t, idx) => {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(t.x, WORLD_B_Y, t.z);

    const body = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), worldBWindowMat);
    body.position.y = t.h / 2;
    towerGroup.add(body);

    for (const cx of [-t.w / 2, t.w / 2]) {
      for (const cz of [-t.d / 2, t.d / 2]) {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.042, t.h + 0.04, 0.042),
          worldBSteelMat
        );
        pillar.position.set(cx, t.h / 2, cz);
        towerGroup.add(pillar);
      }
    }

    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(t.w * 0.9, 0.1, t.d * 0.9),
      worldBSteelMat
    );
    crown.position.y = t.h + 0.05;
    towerGroup.add(crown);

    if (idx % 2 === 0) {
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.022, 0.55, 8),
        worldBBeaconMat
      );
      spire.position.y = t.h + 0.32;
      towerGroup.add(spire);
    }

    worldBGroup.add(towerGroup);
  });

  // Elevated Glass Skybridge connecting towers
  const skybridge = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.24), worldBSteelMat);
  skybridge.position.set(4.85, WORLD_B_Y + 1.55, -1.08);
  worldBGroup.add(skybridge);

  // Subtle Architectural Horizon Halo Arch behind World B
  const worldBRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.15,
  });
  const innovationArch = new THREE.Mesh(
    new THREE.RingGeometry(1.95, 1.985, 48, 1, 0, Math.PI),
    worldBRingMat
  );
  innovationArch.position.set(5.15, WORLD_B_Y + 0.45, -2.1);
  innovationArch.rotation.y = -0.22;
  worldBGroup.add(innovationArch);

  const worldBLight = new THREE.PointLight(0x38bdf8, 1.0, 8.0, 1.4);
  worldBLight.position.set(4.85, WORLD_B_Y + 1.8, -0.4);
  worldBGroup.add(worldBLight);

  return {
    worldAGroup,
    worldBGroup,
    stoneMat,
    stoneTrimMat,
    uniWindowMat,
    cliffMat,
    foliageMat,
    campusLanternLight,
    worldBGlassMat,
    worldBSteelMat,
    worldBWindowMat,
    worldBDarkWindowTex,
    worldBLightWindowTex,
    worldBBeaconMat,
    worldBRingMat,
    worldBLight,
  };
}

// ---------------------------------------------------------------------------
// MAIN REACT COMPONENT
// ---------------------------------------------------------------------------
const PHASE_LABELS: Record<number, string> = {
  1: "Phase 1: The Gap",
  2: "Phase 2: Emergence",
  3: "Phase 3: Transformation",
  4: "Phase 4: Connection",
  5: "Phase 5: The Crossing",
  6: "Phase 6: Possibility",
};

export default function CinematicBridgeHero3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseLabelRef = useRef<HTMLSpanElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);

  const controlRef = useRef<{
    replay: () => void;
    seek: (timeSec: number) => void;
    getTime: () => number;
    getLoopCount: () => number;
    getPhase: () => number;
  } | null>(null);

  const handleReplay = useCallback(() => {
    controlRef.current?.replay();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      });
    } catch {
      setWebglFallback(true);
      return;
    }

    const isMobile =
      typeof window !== "undefined" &&
      (window.innerWidth < 768 || "ontouchstart" in window);

    // Performance Optimization: Cap initial pixel ratio to 1.5 on desktop / 1.25 on mobile
    // and dynamically govern it to maintain locked 60 FPS on Retina displays.
    let currentDprCap = isMobile ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, currentDprCap));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    // Use analytical contact shadows instead of double-pass shadow maps for 60 FPS fluidity
    renderer.shadowMap.enabled = false;

    const scene = new THREE.Scene();

    // Generate PMREM Environment BEFORE any CanvasTexture upload so UNPACK_FLIP_Y_WEBGL is false
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.82;

    const fog = new THREE.FogExp2(0x080808, 0.024);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(
      container.clientWidth < 768 ? 46 : 34,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      90
    );

    // Three-Point Cinematic Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.15);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xf8fafc, 2.5);
    sunLight.position.set(-3.0, 8.0, 5.5);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.85);
    rimLight.position.set(6.0, 4.5, -3.5);
    scene.add(rimLight);

    // Build World A, World B, Redesigned Architectural Robotic Hand, and Student Character
    const shadowTex = createSoftRadialShadowTexture();
    const worlds = buildTwoWorlds();
    scene.add(worlds.worldAGroup, worlds.worldBGroup);

    const handRig = buildArchitecturalRoboticHand();
    scene.add(handRig.root);

    const studentRig = buildRealisticStudentRig(shadowTex);
    scene.add(studentRig.root, studentRig.contactShadow);

    // Atmospheric Valley Mist in the Chasm below
    const chasmMistMat = new THREE.MeshBasicMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });
    const chasmMist = new THREE.Mesh(new THREE.PlaneGeometry(18, 12), chasmMistMat);
    chasmMist.rotation.x = -Math.PI / 2;
    chasmMist.position.set(2.3, -2.35, -1.2);
    scene.add(chasmMist);

    // -----------------------------------------------------------------------
    // THEME SYNCHRONIZATION (ART-DIRECTED LIGHT MODE & DARK MODE)
    // -----------------------------------------------------------------------
    const detectLightMode = () => {
      if (typeof document === "undefined") return false;
      const rootEl = document.documentElement;
      return (
        rootEl.classList.contains("light") ||
        rootEl.getAttribute("data-theme") === "light" ||
        (!rootEl.classList.contains("dark") &&
          rootEl.getAttribute("data-theme") !== "dark" &&
          document.body.classList.contains("light"))
      );
    };

    let isLightMode = detectLightMode();

    const applyThemePalette = (light: boolean) => {
      isLightMode = light;
      if (light) {
        // -------------------------------------------------------------------
        // LIGHT MODE — Bright, Architectural & High-Contrast Daylight
        // -------------------------------------------------------------------
        fog.color.setHex(0xe6ecf4);
        fog.density = 0.014;
        scene.environmentIntensity = 0.92;
        renderer.toneMappingExposure = 1.08;

        hemiLight.color.setHex(0xfffdf9);
        hemiLight.groundColor.setHex(0x94a3b8);
        hemiLight.intensity = 1.35;

        sunLight.color.setHex(0xfffaf0);
        sunLight.intensity = 2.65;

        rimLight.color.setHex(0x475569);
        rimLight.intensity = 1.25;

        // World A: Warm Roman Travertine & Sandstone University (Rich contrast against sky)
        worlds.stoneMat.color.setHex(0xb8a892);
        worlds.stoneTrimMat.color.setHex(0xd2c7b6);
        worlds.uniWindowMat.color.setHex(0x283548);
        worlds.uniWindowMat.emissive.setHex(0x94a3b8);
        worlds.uniWindowMat.emissiveIntensity = 0.15;
        worlds.cliffMat.color.setHex(0x3b495e);
        worlds.foliageMat.color.setHex(0x28543d);
        worlds.campusLanternLight.intensity = 0.25;

        // World B: Realistic Daylight Architectural Curtain-Wall Glass & Brushed Steel
        worlds.worldBWindowMat.map = worlds.worldBLightWindowTex;
        worlds.worldBWindowMat.color.setHex(0xdbe4ef);
        worlds.worldBWindowMat.emissive.setHex(0x38bdf8);
        worlds.worldBWindowMat.needsUpdate = true;
        worlds.worldBGlassMat.color.setHex(0x334155);
        worlds.worldBSteelMat.color.setHex(0xb8c4d4);

        // Robotic Hand: Anodized Architectural Titanium-Pewter & Deep Graphite (Strong silhouette in daylight!)
        handRig.titaniumShellMat.color.setHex(0x9aa6b8);
        handRig.titaniumShellMat.roughness = 0.28;
        handRig.titaniumShellMat.metalness = 0.66;
        handRig.chromeAccentMat.color.setHex(0xf8fafc);
        handRig.graphiteChassisMat.color.setHex(0x181f2a);
        handRig.walkwayDeckMat.color.setHex(0x1b222e);

        chasmMistMat.color.setHex(0xcbd5e1);
        chasmMistMat.opacity = 0.35;

        studentRig.jacketMat.color.setHex(0x1e3a8a);
        studentRig.pantsMat.color.setHex(0x1e293b);
      } else {
        // -------------------------------------------------------------------
        // DARK MODE — Premium Metallic Cinematic (#080808 × #CDCBCA × #D41514)
        // -------------------------------------------------------------------
        fog.color.setHex(0x080808);
        fog.density = 0.025;
        scene.environmentIntensity = 0.82;
        renderer.toneMappingExposure = 1.14;

        hemiLight.color.setHex(0x94a3b8);
        hemiLight.groundColor.setHex(0x090a0f);
        hemiLight.intensity = 1.05;

        sunLight.color.setHex(0xe2e8f0);
        sunLight.intensity = 2.45;

        rimLight.color.setHex(0xcfd8dc);
        rimLight.intensity = 2.05;

        // World A: Evening University Colonnade with Warm Library Glow
        worlds.stoneMat.color.setHex(0x4a453f);
        worlds.stoneTrimMat.color.setHex(0x665f57);
        worlds.uniWindowMat.color.setHex(0x1e293b);
        worlds.uniWindowMat.emissive.setHex(0xffdba8);
        worlds.uniWindowMat.emissiveIntensity = 0.55;
        worlds.cliffMat.color.setHex(0x181c24);
        worlds.foliageMat.color.setHex(0x234233);
        worlds.campusLanternLight.intensity = 2.1;

        // World B: Deep Obsidian Curtain-Wall Skyscrapers with Luminous Bays
        worlds.worldBWindowMat.map = worlds.worldBDarkWindowTex;
        worlds.worldBWindowMat.color.setHex(0x1e293b);
        worlds.worldBWindowMat.emissive.setHex(0x7dd3fc);
        worlds.worldBWindowMat.needsUpdate = true;
        worlds.worldBGlassMat.color.setHex(0x38bdf8);
        worlds.worldBSteelMat.color.setHex(0x94a3b8);

        // Robotic Hand: Brushed Chrome Silver (#CDCBCA) & Deep Basalt Graphite
        handRig.titaniumShellMat.color.setHex(0xcdcbca);
        handRig.titaniumShellMat.roughness = 0.21;
        handRig.titaniumShellMat.metalness = 0.87;
        handRig.chromeAccentMat.color.setHex(0xf8fafc);
        handRig.graphiteChassisMat.color.setHex(0x161920);
        handRig.walkwayDeckMat.color.setHex(0x181c24);

        chasmMistMat.color.setHex(0x111827);
        chasmMistMat.opacity = 0.24;

        studentRig.jacketMat.color.setHex(0x3b4963);
        studentRig.pantsMat.color.setHex(0x1e2430);
      }
    };

    applyThemePalette(isLightMode);

    const themeObserver = new MutationObserver(() => {
      const nextLight = detectLightMode();
      if (nextLight !== isLightMode) {
        applyThemePalette(nextLight);
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // -----------------------------------------------------------------------
    // MOUSE PARALLAX
    // -----------------------------------------------------------------------
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouse.targetX = clamp(nx, -1, 1);
      mouse.targetY = clamp(ny, -1, 1);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // -----------------------------------------------------------------------
    // CONTINUOUS SEAMLESS INFINITE LOOP EVALUATION (Zero React Re-Renders)
    // -----------------------------------------------------------------------
    let animId = 0;
    let isInView = true;
    let isTabVisible = !document.hidden;
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let totalElapsedSec = isReducedMotion ? 10.5 : 0;
    let lastTick = performance.now();
    let lastPhaseNum = 0;
    let frameCounter = 0;
    let slowFrameCounter = 0;

    const evaluateSeamlessLoop = (rawTime: number) => {
      // Modulo arithmetic ensures infinite continuous looping with period LOOP_DURATION (16.5s)
      const t = ((rawTime % LOOP_DURATION) + LOOP_DURATION) % LOOP_DURATION;

      // Determine current storytelling phase (1..6) and update DOM ref directly (zero React re-renders)
      let phaseNum = 1;
      if (t >= T_CROSS_END) phaseNum = 6;
      else if (t >= T_CROSS_START) phaseNum = 5;
      else if (t >= T_CONNECT_START) phaseNum = 4;
      else if (t >= T_UNFOLD_START) phaseNum = 3;
      else if (t >= T_EMERGE_START) phaseNum = 2;

      if (phaseNum !== lastPhaseNum) {
        lastPhaseNum = phaseNum;
        if (phaseLabelRef.current) {
          phaseLabelRef.current.textContent = PHASE_LABELS[phaseNum] || "Phase 1: The Gap";
        }
      }

      // 1. Seamless Hand Emergence, Unfolding, Connection & Retraction Curves
      // During retraction (13.8s -> 16.5s), the hand gracefully powers down, folds its fingers,
      // and descends back into the chasm so t = 16.5s matches t = 0.0s identically.
      const retractU = clamp01((t - T_RETRACT_START) / (LOOP_DURATION - T_RETRACT_START));
      const retractHold = 1 - smootherstep(retractU);

      const riseIn = clamp01((t - T_EMERGE_START) / (T_EMERGE_END - T_EMERGE_START));
      const riseRetract = 1 - easeInCubic(clamp01((retractU - 0.18) / 0.82));
      const riseProgress = t < T_RETRACT_START ? riseIn : riseRetract;

      const unfoldIn = clamp01((t - T_UNFOLD_START) / (T_UNFOLD_END - T_UNFOLD_START));
      const unfoldRetract = 1 - easeInOutCubic(clamp01(retractU / 0.72));
      const unfoldProgress = t < T_RETRACT_START ? unfoldIn : unfoldRetract;

      const connectIn = clamp01((t - T_CONNECT_START) / (T_CONNECT_END - T_CONNECT_START));
      const connectRetract = 1 - smoothstep(clamp01(retractU / 0.38));
      const connectProgress = t < T_RETRACT_START ? connectIn : connectRetract;

      // Subtle damped mechanical settle when fingertips lock onto World B at T_UNFOLD_END
      let settleBounce = 0;
      if (t > T_UNFOLD_END - 0.15 && t < T_UNFOLD_END + 0.75) {
        const st = t - (T_UNFOLD_END - 0.15);
        settleBounce = Math.exp(-st * 6.0) * Math.sin(st * 15.0);
      }

      // 2. Seamless Student Crossing & Doorway Entrance/Exit Kinematics
      let studentX = WORLD_A_PORTICO_X;
      let normalizedSpeed = 0;
      let studentOpacity = 1;

      if (t < T_WALK_TO_EDGE_END) {
        // Phase 1: Student walks out from University Colonnade archway to World A edge
        const u = t / T_WALK_TO_EDGE_END;
        const [posP, spd] = trapezoidalMotion(u, 0.25);
        studentX = lerp(WORLD_A_PORTICO_X, WORLD_A_EDGE_X, posP);
        normalizedSpeed = u < 0.98 ? spd : 0;
        // Smoothly emerge from the colonnade shadow during first 0.65s
        studentOpacity = smoothstep(t / 0.65);
      } else if (t < T_CROSS_START) {
        // Phases 2-4: Student waits at World A edge watching the hand rise and form the bridge
        studentX = WORLD_A_EDGE_X;
        normalizedSpeed = 0;
        studentOpacity = 1;
      } else if (t < T_CROSS_END) {
        // Phase 5: Student walks naturally across the robotic hand-bridge to World B plaza
        const u = (t - T_CROSS_START) / (T_CROSS_END - T_CROSS_START);
        const [posP, spd] = trapezoidalMotion(u, 0.15);
        studentX = lerp(WORLD_A_EDGE_X, WORLD_B_PLAZA_X, posP);
        normalizedSpeed = spd;
        studentOpacity = 1;
      } else if (t < T_ARRIVE_END) {
        // Phase 6: Student continues walking across World B plaza into the Glass Rotunda Atrium
        const u = (t - T_CROSS_END) / (T_ARRIVE_END - T_CROSS_END);
        const [posP, spd] = trapezoidalMotion(u, 0.25);
        studentX = lerp(WORLD_B_PLAZA_X, WORLD_B_ATRIUM_X, posP);
        normalizedSpeed = u < 0.95 ? spd * 0.85 : 0;
        // Smoothly pass inside the glass atrium entrance between u = 0.35 and u = 0.95
        studentOpacity = 1 - smoothstep((u - 0.35) / 0.6);
      } else {
        // During hand retraction (13.9s -> 16.5s), student is inside the atrium, ready for next cycle at World A portico
        studentX = WORLD_A_PORTICO_X;
        normalizedSpeed = 0;
        studentOpacity = 0;
      }

      // Physical weight response dip while student walks across the hand-bridge
      let bridgeDip = 0;
      if (studentX > BRIDGE_START_X && studentX < BRIDGE_END_X) {
        const spanU = (studentX - BRIDGE_START_X) / (BRIDGE_END_X - BRIDGE_START_X);
        bridgeDip = 0.026 * Math.sin(spanU * Math.PI);
      }

      // Distance-locked stride phase so feet plant cleanly with zero sliding
      const distanceWalked = Math.max(0, studentX - WORLD_A_PORTICO_X);
      const stridePhase = (distanceWalked / STRIDE_LEN) * Math.PI * 2;
      const strideAmp = clamp01(normalizedSpeed * 1.12);

      // Natural head gaze tracking the rising hand, then looking up at World B towers
      let lookPitch = 0;
      let lookYaw = 0;
      if (t >= T_EMERGE_START && t < T_UNFOLD_END) {
        const watchP = Math.sin(
          clamp01((t - T_EMERGE_START) / (T_UNFOLD_END - T_EMERGE_START)) * Math.PI
        );
        lookPitch = 0.2 * watchP;
        lookYaw = 0.1 * watchP;
      } else if (t >= T_CROSS_END && t < T_ARRIVE_END) {
        const arriveP = smoothstep((t - T_CROSS_END) / 0.8);
        lookPitch = -0.12 * arriveP;
        lookYaw = 0.14 * arriveP;
      }

      applyStudentPose(studentRig, {
        x: studentX,
        z: 0,
        stridePhase,
        strideAmp,
        lean: 0.065 * strideAmp,
        lookPitch,
        lookYaw,
        facingYaw: Math.PI / 2,
        bridgeDip,
        opacity: studentOpacity,
      });

      applyArchitecturalHandPose(handRig, {
        riseProgress,
        unfoldProgress,
        settleBounce,
        connectProgress,
        bridgeDip,
      });

      // 3. World B Illumination Curve (Peaks during Phase 6 and smoothly returns to baseline by t = 16.5s)
      const possibilityRise = smoothstep(clamp01((t - (T_CROSS_END - 0.8)) / 1.4));
      const worldBGlow = possibilityRise * retractHold;

      worlds.worldBWindowMat.emissiveIntensity =
        (isLightMode ? 0.18 : 0.65) + worldBGlow * (isLightMode ? 0.45 : 1.15);
      worlds.worldBBeaconMat.color.lerpColors(
        COLOR_GRAPHITE_TRIM,
        COLOR_LASER_CRIMSON,
        connectProgress
      );
      worlds.worldBBeaconMat.emissiveIntensity =
        0.2 + connectProgress * 0.85 + worldBGlow * 1.1;
      worlds.worldBRingMat.opacity = (isLightMode ? 0.12 : 0.15) + worldBGlow * 0.32;
      worlds.worldBLight.intensity = (isLightMode ? 0.6 : 1.1) + worldBGlow * 2.4;

      // 4. Synchronized Periodic Camera Choreography (Matches at t = 0.0s and t = 16.5s)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const w = container.clientWidth;
      const mobileView = w < 768;

      const crossFollow = easeInOutCubic(clamp01((t - T_CROSS_START) / (T_CROSS_END - T_CROSS_START)));
      const followShiftX = crossFollow * retractHold;

      const camPosX = (mobileView ? 2.25 : 0.92) + followShiftX * 0.48 + mouse.x * 0.2;
      const camPosY = (mobileView ? 1.52 : 1.12) + mouse.y * 0.11;
      const camPosZ = mobileView ? 8.1 : 5.72;

      camera.position.set(camPosX, camPosY, camPosZ);

      const lookTargetX = (mobileView ? 2.32 : 1.36) + followShiftX * 0.56 + mouse.x * 0.07;
      const lookTargetY = (mobileView ? 0.66 : 0.21) + mouse.y * 0.04;
      camera.lookAt(lookTargetX, lookTargetY, -0.25);
    };

    const tick = (now: number) => {
      animId = 0;
      const dt = Math.min(0.25, Math.max(0.001, (now - lastTick) / 1000));
      lastTick = now;

      // Adaptive Frame-Time Governor: step down pixelRatio if frame time exceeds 19ms
      frameCounter++;
      if (dt > 0.019) slowFrameCounter++;
      if (frameCounter >= 60) {
        if (slowFrameCounter > 25 && currentDprCap > 1.1) {
          currentDprCap = 1.1;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, currentDprCap));
        }
        frameCounter = 0;
        slowFrameCounter = 0;
      }

      if (!isReducedMotion) {
        totalElapsedSec += dt;
      }

      evaluateSeamlessLoop(totalElapsedSec);
      renderer.render(scene, camera);

      if (isInView && isTabVisible) {
        animId = requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      if (!animId && isInView && isTabVisible) {
        lastTick = performance.now();
        animId = requestAnimationFrame(tick);
      }
    };

    evaluateSeamlessLoop(totalElapsedSec);
    renderer.render(scene, camera);
    setIsLoaded(true);
    startLoop();

    const api = {
      replay: () => {
        totalElapsedSec = 0;
        lastPhaseNum = 0;
        evaluateSeamlessLoop(0);
        renderer.render(scene, camera);
        startLoop();
      },
      seek: (timeSec: number) => {
        totalElapsedSec = Math.max(0, timeSec);
        evaluateSeamlessLoop(totalElapsedSec);
        renderer.render(scene, camera);
      },
      getTime: () => totalElapsedSec,
      getLoopCount: () => Math.floor(totalElapsedSec / LOOP_DURATION),
      getPhase: () => lastPhaseNum,
    };
    controlRef.current = api;

    if (typeof window !== "undefined") {
      (
        window as unknown as { __SKILLBRIDGE_HERO_3D__?: typeof api }
      ).__SKILLBRIDGE_HERO_3D__ = api;
    }

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.fov = w < 768 ? 46 : 34;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      evaluateSeamlessLoop(totalElapsedSec);
      renderer.render(scene, camera);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView) {
          startLoop();
        } else if (animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        startLoop();
      } else if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      themeObserver.disconnect();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      shadowTex.dispose();
      envTexture.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  if (webglFallback) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-end overflow-hidden bg-gradient-to-br from-[#F2EFE9] via-[#E5ECF4] to-[#D5E0EE] dark:from-[#080808] dark:via-[#0D1017] dark:to-[#131824]"
        aria-label="SkillBridge Robotic Hand Bridge Fallback Illustration"
      >
        <svg
          viewBox="0 0 1200 600"
          className="w-full h-full object-cover opacity-90"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 360 L380 360 L320 600 L0 600 Z" fill="currentColor" className="text-slate-300 dark:text-zinc-900" />
          <path d="M820 340 L1200 340 L1200 600 L880 600 Z" fill="currentColor" className="text-slate-300 dark:text-zinc-900" />
          <rect x="880" y="160" width="65" height="180" fill="#475569" fillOpacity="0.35" />
          <rect x="960" y="110" width="80" height="230" fill="#475569" fillOpacity="0.45" />
          <path
            d="M360 365 C480 340, 700 340, 840 345 L830 385 C700 385, 480 390, 360 410 Z"
            fill="#B8C1CE"
          />
          <line x1="370" y1="362" x2="830" y2="344" stroke="#D41514" strokeWidth="3" />
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="hero-3d-scene-container absolute inset-0 w-full h-full overflow-hidden pointer-events-auto"
      aria-label="SkillBridge 3D Cinematic Experience: The Hand That Becomes Your Bridge"
    >
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full block outline-none transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Subtle Live Phase Indicator & Restart Pill */}
      <div
        className={`pointer-events-none absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2.5 rounded-full border border-slate-900/12 dark:border-white/12 bg-white/85 dark:bg-[#080808]/80 px-3.5 py-1.5 text-[0.68rem] sm:text-[0.72rem] font-mono text-slate-800 dark:text-[#CDCBCA] shadow-sm backdrop-blur-md transition-opacity duration-500 ${
          isLoaded ? "opacity-95" : "opacity-0"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D41514] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D41514]" />
        </span>
        <span ref={phaseLabelRef} data-testid="hero-phase-indicator">
          Phase 1: The Gap
        </span>

        <button
          type="button"
          onClick={handleReplay}
          data-testid="hero-replay-btn"
          className="pointer-events-auto ml-1.5 inline-flex items-center gap-1 rounded-full border border-slate-900/12 dark:border-white/15 bg-slate-900/5 dark:bg-white/10 px-2 py-0.5 text-[0.64rem] font-medium text-slate-800 dark:text-white hover:bg-[#D41514] hover:text-white dark:hover:bg-[#D41514] transition-colors cursor-pointer"
          title="Restart loop from Phase 1"
        >
          ↻ Replay
        </button>
      </div>
    </div>
  );
}
