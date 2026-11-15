"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * SkillBridge — Complete Cinematic 3D Hero Redesign
 * Concept: "The Hand That Becomes Your Bridge"
 * ---------------------------------------------------------------------------
 * Real-time 3D WebGL experience built with Three.js:
 *  - World A (Where You Begin — Left): Realistic university architectural
 *    environment with limestone ashlar masonry, arched library windows,
 *    classical colonnade portico, stone balustrade, campus greenery, and
 *    multi-strata rock cliff overlooking a deep misty chasm.
 *  - World B (Where You Can Go — Right): Modern glass architecture, curtain-wall
 *    innovation skyscrapers, curved glass rotunda atrium, elevated skybridges,
 *    and cantilevered titanium arrival plaza.
 *  - The Giant Futuristic Robotic Hand: Aerospace-grade brushed titanium and
 *    chrome articulated forearm, hydraulic actuators, rotary wrist, sculpted
 *    palm with flush energy core, 4 multi-phalangeal articulated fingers, and
 *    2-segment thumb that rises from the abyss and transforms into a stable,
 *    illuminated walkable bridge.
 *  - Realistic Student Character: Natural human proportions and contemporary
 *    student attire with distance-locked kinematic walking gait.
 *  - 6-Phase Choreographed Sequence + Ambient Idle State + Dual Theme Support.
 */

// ---------------------------------------------------------------------------
// TIMELINE CONSTANTS (Seconds) — 6 Choreographed Phases
// ---------------------------------------------------------------------------
const T_PHASE1_END = 1.8; // Phase 1: The Gap (Student walks to World A edge)
const T_PHASE2_END = 4.4; // Phase 2: Emergence (Giant robotic hand rises from below)
const T_PHASE3_END = 6.8; // Phase 3: Transformation (Wrist levels, fingers uncurl & lock to World B)
const T_PHASE4_END = 8.0; // Phase 4: Connection (Integrated pathway illuminates progressively)
const T_PHASE5_END = 13.0; // Phase 5: The Crossing (Student walks across the hand-bridge to World B)
const T_PHASE6_READY = 14.2; // Phase 6: Possibility (World B illuminates, transitions to ambient idle)

// World X Coordinates (Positioned so left Hero text never overlaps the student or hand)
const WORLD_A_START_X = 0.05;
const WORLD_A_EDGE_X = 0.72;
const BRIDGE_START_X = 0.88; // Forearm/wrist ramp docks at World A ledge
const WRIST_PIVOT_X = 1.28;
const KNUCKLE_X = 2.58;
const BRIDGE_END_X = 3.82; // Fingertips lock onto World B plaza
const WORLD_B_DEST_X = 4.28;

const WORLD_A_Y = 0.0;
const WORLD_B_Y = 0.14;
const BRIDGE_SLOPE = Math.atan2(WORLD_B_Y - WORLD_A_Y, BRIDGE_END_X - BRIDGE_START_X);

// Math Helpers
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOutCubic = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/** Trapezoidal velocity profile returning [normalizedPosition 0..1, normalizedSpeed 0..1] */
function trapezoidalMotion(u: number, accelFraction = 0.2): [number, number] {
  const x = clamp01(u);
  const vmax = 1 / (1 - accelFraction);
  if (x < accelFraction) {
    return [(0.5 * vmax * x * x) / accelFraction, x / accelFraction];
  }
  if (x > 1 - accelFraction) {
    const r = 1 - x;
    return [1 - (0.5 * vmax * r * r) / accelFraction, r / accelFraction];
  }
  return [0.5 * vmax * accelFraction + vmax * (x - accelFraction), 1];
}

/** Walkable surface elevation Y at any world X coordinate */
function getWalkSurfaceY(x: number, bridgeDip = 0): number {
  if (x <= BRIDGE_START_X) return WORLD_A_Y;
  if (x >= BRIDGE_END_X) return WORLD_B_Y;
  const u = (x - BRIDGE_START_X) / (BRIDGE_END_X - BRIDGE_START_X);
  const baseLineY = lerp(WORLD_A_Y, WORLD_B_Y, u);
  const palmArch = Math.sin(u * Math.PI) * 0.035;
  return baseLineY + palmArch - bridgeDip * Math.sin(u * Math.PI);
}

// ---------------------------------------------------------------------------
// PROCEDURAL ARCHITECTURAL TEXTURE GENERATORS
// ---------------------------------------------------------------------------
function createUniversityStoneTexture(isLight: boolean): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext("2d");
  if (ctx) {
    ctx.fillStyle = isLight ? "#ded8ce" : "#2d2a28";
    ctx.fillRect(0, 0, 256, 256);

    // Subtle ashlar stone course lines
    ctx.strokeStyle = isLight ? "rgba(120,110,98,0.28)" : "rgba(15,14,13,0.55)";
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();

      const offset = (y / 32) % 2 === 0 ? 0 : 32;
      for (let x = offset; x < 256; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 32);
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

function createCurtainWallTexture(): {
  map: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
} {
  const cMap = document.createElement("canvas");
  cMap.width = 256;
  cMap.height = 512;
  const ctx = cMap.getContext("2d");

  const cEmissive = document.createElement("canvas");
  cEmissive.width = 256;
  cEmissive.height = 512;
  const eCtx = cEmissive.getContext("2d");

  if (ctx && eCtx) {
    // Deep architectural glass base
    ctx.fillStyle = "#162235";
    ctx.fillRect(0, 0, 256, 512);

    eCtx.fillStyle = "#000000";
    eCtx.fillRect(0, 0, 256, 512);

    // Curtain-wall floor plates & illuminated office bays
    for (let y = 12; y < 500; y += 16) {
      // Metallic horizontal spandrel beam
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, y - 3, 256, 2);

      for (let x = 8; x < 248; x += 20) {
        const seed = (x * 19 + y * 37) % 17;
        if (seed > 5) {
          const isWarm = seed % 4 === 0;
          ctx.fillStyle = isWarm ? "#e2e8f0" : "#bae6fd";
          ctx.fillRect(x, y, 14, 9);

          eCtx.fillStyle = isWarm ? "#f8fafc" : "#7dd3fc";
          eCtx.fillRect(x, y, 14, 9);
        } else {
          ctx.fillStyle = "#1e293b";
          ctx.fillRect(x, y, 14, 9);
        }
      }
    }

    // Vertical aluminum mullions
    ctx.fillStyle = "#475569";
    for (let x = 4; x < 256; x += 20) {
      ctx.fillRect(x, 0, 2, 512);
    }
  }

  const map = new THREE.CanvasTexture(cMap);
  map.colorSpace = THREE.SRGBColorSpace;
  const emissiveMap = new THREE.CanvasTexture(cEmissive);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  return { map, emissiveMap };
}

// ---------------------------------------------------------------------------
// REALISTIC ARTICULATED STUDENT CHARACTER RIG
// ---------------------------------------------------------------------------
const L_THIGH = 0.23;
const L_SHIN = 0.22;
const FOOT_H = 0.038;
const CHAR_SCALE = 0.82;
const STRIDE_LEN = 0.62 * CHAR_SCALE;

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
  jacketMat: THREE.MeshStandardMaterial;
  pantsMat: THREE.MeshStandardMaterial;
  packMat: THREE.MeshStandardMaterial;
}

function buildRealisticStudentRig(): RealisticStudentRig {
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe0b18c, roughness: 0.55, metalness: 0.05 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x1c1613, roughness: 0.7, metalness: 0.05 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: 0x2b3954, roughness: 0.62, metalness: 0.15 });
  const hoodieTrimMat = new THREE.MeshStandardMaterial({ color: 0x1e2738, roughness: 0.7, metalness: 0.1 });
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.48, metalness: 0.05 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.75, metalness: 0.1 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.38, metalness: 0.1 });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xd41514, roughness: 0.5, metalness: 0.2 });
  const packMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6, metalness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xd41514,
    emissive: 0xd41514,
    emissiveIntensity: 0.5,
    roughness: 0.25,
  });

  const makeSegment = (len: number, rTop: number, rBot: number, mat: THREE.Material) => {
    const grp = new THREE.Group();
    const cylGeo = new THREE.CylinderGeometry(rTop, rBot, len, 14, 1);
    cylGeo.translate(0, -len / 2, 0);
    const cyl = new THREE.Mesh(cylGeo, mat);
    cyl.castShadow = true;
    grp.add(cyl);

    const jointTop = new THREE.Mesh(new THREE.SphereGeometry(rTop, 12, 10), mat);
    grp.add(jointTop);

    const jointBot = new THREE.Mesh(new THREE.SphereGeometry(rBot, 12, 10), mat);
    jointBot.position.y = -len;
    grp.add(jointBot);
    return grp;
  };

  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = L_THIGH + L_SHIN + FOOT_H;
  root.add(hips);

  const pelvis = new THREE.Mesh(new THREE.SphereGeometry(0.062, 14, 12), pantsMat);
  pelvis.scale.set(1.3, 0.85, 0.92);
  pelvis.castShadow = true;
  hips.add(pelvis);

  const legs = [1, -1].map((side) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.046, -0.01, 0);
    thigh.add(makeSegment(L_THIGH, 0.042, 0.033, pantsMat));

    const shin = new THREE.Group();
    shin.position.y = -L_THIGH;
    shin.add(makeSegment(L_SHIN, 0.033, 0.026, pantsMat));
    thigh.add(shin);

    const foot = new THREE.Group();
    foot.position.y = -L_SHIN;

    const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.054, 0.032, 0.115), shoeMat);
    shoeUpper.position.set(0, -FOOT_H + 0.019, 0.028);
    shoeUpper.castShadow = true;
    foot.add(shoeUpper);

    const shoeToe = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), shoeMat);
    shoeToe.scale.set(1, 0.6, 1.05);
    shoeToe.position.set(0, -FOOT_H + 0.016, 0.084);
    foot.add(shoeToe);

    const shoeSole = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.009, 0.126), soleMat);
    shoeSole.position.set(0, -FOOT_H + 0.004, 0.032);
    foot.add(shoeSole);

    shin.add(foot);
    hips.add(thigh);
    return { thigh, shin, foot };
  }) as [StudentLimb, StudentLimb];

  const spine = new THREE.Group();
  spine.position.y = 0.02;
  hips.add(spine);

  const torsoMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.16, 8, 16), jacketMat);
  torsoMesh.scale.set(1.32, 1, 0.8);
  torsoMesh.position.y = 0.15;
  torsoMesh.castShadow = true;
  spine.add(torsoMesh);

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.08, 0.016), shirtMat);
  collar.position.set(0, 0.24, 0.052);
  collar.rotation.x = -0.1;
  spine.add(collar);

  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.058, 14, 10), hoodieTrimMat);
  hood.scale.set(1.32, 0.68, 0.95);
  hood.position.set(0, 0.27, -0.038);
  spine.add(hood);

  const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.145, 0.21, 0.082), packMat);
  backpack.position.set(0, 0.165, -0.086);
  backpack.castShadow = true;
  spine.add(backpack);

  const packTop = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.041, 0.145, 12), packMat);
  packTop.rotation.z = Math.PI / 2;
  packTop.position.set(0, 0.27, -0.086);
  spine.add(packTop);

  const packBadge = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.014, 0.01), accentMat);
  packBadge.position.set(0, 0.21, -0.128);
  spine.add(packBadge);

  for (const side of [1, -1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.17, 0.012), packMat);
    strap.position.set(side * 0.048, 0.18, 0.053);
    strap.rotation.x = -0.08;
    spine.add(strap);
  }

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.026, 0.048, 12), skinMat);
  neck.position.y = 0.3;
  spine.add(neck);

  const head = new THREE.Group();
  head.position.y = 0.33;
  spine.add(head);

  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.062, 20, 16), skinMat);
  skull.scale.set(0.92, 1.08, 0.98);
  skull.position.y = 0.06;
  skull.castShadow = true;
  head.add(skull);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.067, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  hairCap.scale.set(0.94, 1.06, 1.03);
  hairCap.position.set(0, 0.068, -0.005);
  hairCap.rotation.x = -0.28;
  head.add(hairCap);

  const arms = [1, -1].map((side) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.096, 0.265, 0);
    upper.add(makeSegment(0.155, 0.029, 0.024, jacketMat));

    const fore = new THREE.Group();
    fore.position.y = -0.155;
    fore.add(makeSegment(0.14, 0.024, 0.02, jacketMat));

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 10), skinMat);
    hand.scale.set(0.8, 1.15, 0.9);
    hand.position.y = -0.16;
    fore.add(hand);

    upper.add(fore);
    spine.add(upper);
    return { upper, fore };
  }) as [StudentArm, StudentArm];

  root.scale.setScalar(CHAR_SCALE);
  root.rotation.y = Math.PI / 2;

  return {
    root,
    hips,
    spine,
    head,
    legs,
    arms,
    jacketMat,
    pantsMat,
    packMat,
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
}

function applyStudentPose(rig: RealisticStudentRig, p: StudentPoseState) {
  const groundY = getWalkSurfaceY(p.x, p.bridgeDip);
  rig.root.position.set(p.x, groundY, p.z);
  rig.root.rotation.y = p.facingYaw;

  const thighAmp = 0.44 * p.strideAmp;
  const kneeAmp = 0.8 * p.strideAmp;
  let solvedHipHeight = 0;

  for (let i = 0; i < 2; i++) {
    const ph = p.stridePhase + (i === 0 ? 0 : Math.PI);
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    const thighAngle = thighAmp * s;
    const kneeFlex = 0.04 * p.strideAmp + kneeAmp * Math.pow(Math.max(0, c), 1.3);

    const leg = rig.legs[i];
    leg.thigh.rotation.x = -thighAngle;
    leg.shin.rotation.x = kneeFlex;
    leg.foot.rotation.x = thighAngle - kneeFlex;

    const legVerticalSpan =
      L_THIGH * Math.cos(thighAngle) + L_SHIN * Math.cos(thighAngle - kneeFlex) + FOOT_H;
    if (legVerticalSpan > solvedHipHeight) {
      solvedHipHeight = legVerticalSpan;
    }
  }

  rig.hips.position.y = solvedHipHeight;
  rig.hips.rotation.y = -0.06 * p.strideAmp * Math.sin(p.stridePhase);

  rig.spine.rotation.x = p.lean;
  rig.spine.rotation.y = 0.1 * p.strideAmp * Math.sin(p.stridePhase);

  const armAmp = 0.38 * p.strideAmp;
  for (let i = 0; i < 2; i++) {
    const arm = rig.arms[i];
    const swing = (i === 0 ? -1 : 1) * armAmp * Math.sin(p.stridePhase);
    arm.upper.rotation.x = -swing;
    arm.upper.rotation.z = (i === 0 ? 1 : -1) * 0.075;
    arm.fore.rotation.x = -(0.18 + 0.3 * Math.max(0, swing) + 0.08 * p.strideAmp);
  }

  rig.head.rotation.x = p.lookPitch - 0.5 * p.lean;
  rig.head.rotation.y = p.lookYaw;
}

// ---------------------------------------------------------------------------
// GIANT FUTURISTIC ROBOTIC HAND BRIDGE RIG
// ---------------------------------------------------------------------------
interface RoboticHandRig {
  root: THREE.Group;
  wristGroup: THREE.Group;
  fingers: THREE.Group[][]; // 4 fingers x 3 phalanges
  thumbJoints: [THREE.Group, THREE.Group];
  pathwayMats: THREE.MeshStandardMaterial[];
  deckChannelMat: THREE.MeshPhysicalMaterial;
  shellMat: THREE.MeshPhysicalMaterial;
  subFrameMat: THREE.MeshStandardMaterial;
  chromeMat: THREE.MeshPhysicalMaterial;
  seamLightMat: THREE.MeshStandardMaterial;
  palmCoreRingMat: THREE.MeshStandardMaterial;
  palmCoreCenterMat: THREE.MeshBasicMaterial;
  handLight: THREE.PointLight;
}

function buildRoboticHandBridge(): RoboticHandRig {
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: 0xd4d8e0,
    metalness: 0.88,
    roughness: 0.19,
    clearcoat: 0.92,
    clearcoatRoughness: 0.12,
  });

  const subFrameMat = new THREE.MeshStandardMaterial({
    color: 0x1c212b,
    metalness: 0.85,
    roughness: 0.3,
  });

  const chromeMat = new THREE.MeshPhysicalMaterial({
    color: 0xf8fafc,
    metalness: 0.97,
    roughness: 0.07,
    clearcoat: 1.0,
  });

  // Recessed smoked-titanium walkway deck surface
  const deckChannelMat = new THREE.MeshPhysicalMaterial({
    color: 0x181c26,
    metalness: 0.65,
    roughness: 0.25,
    clearcoat: 0.8,
  });

  const seamLightMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0xd41514,
    emissiveIntensity: 0.15,
    roughness: 0.2,
    metalness: 0.6,
  });

  const palmCoreRingMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    emissive: 0xd41514,
    emissiveIntensity: 0.0,
    roughness: 0.15,
    metalness: 0.85,
  });

  const palmCoreCenterMat = new THREE.MeshBasicMaterial({
    color: 0xff4d4f,
    transparent: true,
    opacity: 0.0,
  });

  const root = new THREE.Group();
  root.position.set(WRIST_PIVOT_X, WORLD_A_Y, 0);

  // 1. Engineered Forearm Structure (Emerges from deep chasm & docks with World A)
  const forearmGroup = new THREE.Group();
  forearmGroup.rotation.z = 0.5;
  root.add(forearmGroup);

  const forearmMain = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.46, 2.8, 32, 1),
    shellMat
  );
  forearmMain.position.y = -1.45;
  forearmMain.scale.set(1.0, 1.0, 1.35);
  forearmMain.castShadow = true;
  forearmMain.receiveShadow = true;
  forearmGroup.add(forearmMain);

  // Armor segmentation collars along forearm
  for (const [yOff, rad, h] of [
    [-0.28, 0.37, 0.12],
    [-0.95, 0.41, 0.1],
    [-1.68, 0.45, 0.12],
  ] as [number, number, number][]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, h, 32), subFrameMat);
    band.position.y = yOff;
    band.scale.set(1.02, 1.0, 1.37);
    forearmGroup.add(band);
  }

  // Dual Hydraulic Actuators on camera-facing and far sides of forearm
  for (const zSide of [-0.36, 0.36]) {
    const pistonCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.052, 0.062, 1.35, 16),
      subFrameMat
    );
    pistonCylinder.position.set(0.18, -1.35, zSide);
    pistonCylinder.rotation.z = -0.08;
    forearmGroup.add(pistonCylinder);

    const pistonRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.034, 1.05, 16),
      chromeMat
    );
    pistonRod.position.set(0.14, -0.65, zSide);
    pistonRod.rotation.z = -0.08;
    forearmGroup.add(pistonRod);
  }

  // Subtle recessed optical seam on forearm
  const forearmSeam = new THREE.Mesh(new THREE.BoxGeometry(0.025, 2.0, 0.02), seamLightMat);
  forearmSeam.position.set(0.08, -1.25, 0.48);
  forearmGroup.add(forearmSeam);

  // 2. Rotary Wrist & Palm Assembly
  const wristGroup = new THREE.Group();
  wristGroup.rotation.order = "ZYX";
  root.add(wristGroup);

  const wristCore = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.98, 32), subFrameMat);
  wristCore.rotation.x = Math.PI / 2;
  wristCore.position.set(0, -0.22, 0);
  wristGroup.add(wristCore);

  // Precision Chrome Wrist Bearings
  for (const zSide of [-0.51, 0.51]) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.06, 28), chromeMat);
    cap.rotation.x = Math.PI / 2;
    cap.position.set(0, -0.22, zSide);
    wristGroup.add(cap);

    const capRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.014, 12, 28), seamLightMat);
    capRing.position.set(0, -0.22, zSide + (zSide > 0 ? 0.032 : -0.032));
    wristGroup.add(capRing);
  }

  // Wrist-to-World-A Approach Bridge Ramp
  const rampShape = new THREE.Shape();
  rampShape.moveTo(-0.44, -0.46);
  rampShape.lineTo(0.12, -0.52);
  rampShape.lineTo(0.12, 0.52);
  rampShape.lineTo(-0.44, 0.46);
  rampShape.closePath();

  const rampGeo = new THREE.ExtrudeGeometry(rampShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.028,
    bevelSegments: 3,
  });
  rampGeo.rotateX(-Math.PI / 2);
  rampGeo.translate(0, -0.15, 0);
  const wristRamp = new THREE.Mesh(rampGeo, shellMat);
  wristRamp.castShadow = true;
  wristRamp.receiveShadow = true;
  wristGroup.add(wristRamp);

  // 3. Sculpted Titanium Palm Structure
  const palmLength = 1.26;
  const palmHalfWidth = 0.56;
  const palmCorner = 0.14;
  const pShape = new THREE.Shape();
  const px0 = 0.04;
  const px1 = px0 + palmLength;
  pShape.moveTo(px0 + palmCorner, -palmHalfWidth);
  pShape.lineTo(px1 - palmCorner, -palmHalfWidth);
  pShape.quadraticCurveTo(px1, -palmHalfWidth, px1, -palmHalfWidth + palmCorner);
  pShape.lineTo(px1, palmHalfWidth - palmCorner);
  pShape.quadraticCurveTo(px1, palmHalfWidth, px1 - palmCorner, palmHalfWidth);
  pShape.lineTo(px0 + palmCorner, palmHalfWidth);
  pShape.quadraticCurveTo(px0, palmHalfWidth, px0, palmHalfWidth - palmCorner);
  pShape.lineTo(px0, -palmHalfWidth + palmCorner);
  pShape.quadraticCurveTo(px0, -palmHalfWidth, px0 + palmCorner, -palmHalfWidth);

  const palmGeo = new THREE.ExtrudeGeometry(pShape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.042,
    bevelSize: 0.038,
    bevelSegments: 4,
    curveSegments: 14,
  });
  palmGeo.rotateX(-Math.PI / 2);
  palmGeo.translate(0, -0.23, 0);
  const palmMesh = new THREE.Mesh(palmGeo, shellMat);
  palmMesh.castShadow = true;
  palmMesh.receiveShadow = true;
  wristGroup.add(palmMesh);

  // Recessed Smoked-Titanium Walkway Deck Embedded Into Wrist & Palm Top Surface
  const palmWalkway = new THREE.Mesh(
    new THREE.BoxGeometry(1.66, 0.016, 0.62),
    deckChannelMat
  );
  palmWalkway.position.set(0.45, 0.032, 0);
  palmWalkway.receiveShadow = true;
  wristGroup.add(palmWalkway);

  // Under-palm structural sub-chassis
  const underPalm = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.14, 0.96), subFrameMat);
  underPalm.position.set(0.66, -0.26, 0);
  wristGroup.add(underPalm);

  // Palm Central Energy Core (Flush under glass in the center of the palm walkway)
  const coreRecess = new THREE.Mesh(
    new THREE.CylinderGeometry(0.21, 0.21, 0.018, 32),
    subFrameMat
  );
  coreRecess.position.set(0.68, 0.034, 0);
  wristGroup.add(coreRecess);

  const coreRing = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.185, 36), palmCoreRingMat);
  coreRing.rotation.x = -Math.PI / 2;
  coreRing.position.set(0.68, 0.045, 0);
  wristGroup.add(coreRing);

  const coreCenter = new THREE.Mesh(new THREE.CircleGeometry(0.09, 32), palmCoreCenterMat);
  coreCenter.rotation.x = -Math.PI / 2;
  coreCenter.position.set(0.68, 0.046, 0);
  wristGroup.add(coreCenter);

  // Knuckle Actuator Bar at distal edge of palm
  const knuckleBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 1.08, 24),
    subFrameMat
  );
  knuckleBar.rotation.x = Math.PI / 2;
  knuckleBar.position.set(px1, -0.11, 0);
  wristGroup.add(knuckleBar);

  // 4. Four Articulated Multi-Phalangeal Fingers (Index, Middle, Ring, Pinky)
  const fingerZOffsets = [-0.41, -0.14, 0.14, 0.41];
  const fingerScales = [0.95, 1.0, 0.96, 0.86];
  const phalanxLengths = [0.54, 0.42, 0.34];
  const phalanxRadii = [0.102, 0.092, 0.08];

  const fingers: THREE.Group[][] = fingerZOffsets.map((zPos, fIdx) => {
    const segments: THREE.Group[] = [];
    let parentObj: THREE.Object3D = wristGroup;
    let localOffsetX = px1;

    for (let sIdx = 0; sIdx < 3; sIdx++) {
      const segLen = phalanxLengths[sIdx] * fingerScales[fIdx];
      const segRad = phalanxRadii[sIdx];
      const jointGroup = new THREE.Group();
      jointGroup.position.set(localOffsetX, sIdx === 0 ? -0.105 : 0, sIdx === 0 ? zPos : 0);

      // Knuckle Actuator Cylinder + Chrome Pivot Pin
      const knuckleCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(segRad * 0.95, segRad * 0.95, 0.18, 20),
        subFrameMat
      );
      knuckleCyl.rotation.x = Math.PI / 2;
      jointGroup.add(knuckleCyl);

      const pinCyl = new THREE.Mesh(
        new THREE.CylinderGeometry(segRad * 0.42, segRad * 0.42, 0.21, 14),
        chromeMat
      );
      pinCyl.rotation.x = Math.PI / 2;
      jointGroup.add(pinCyl);

      // Sculpted Titanium Phalanx Body
      const phalanxCapsule = new THREE.CapsuleGeometry(
        segRad * 0.88,
        Math.max(0.05, segLen - segRad * 1.3),
        8,
        18
      );
      phalanxCapsule.rotateZ(Math.PI / 2);
      phalanxCapsule.translate(segLen / 2, -0.01, 0);
      const phalanxMesh = new THREE.Mesh(phalanxCapsule, shellMat);
      phalanxMesh.castShadow = true;
      phalanxMesh.receiveShadow = true;
      jointGroup.add(phalanxMesh);

      // Flat-topped Engineered Bridge Deck Plate on each phalanx
      const armorPlate = new THREE.Mesh(
        new THREE.BoxGeometry(segLen * 0.88, 0.04, segRad * 1.7),
        fIdx === 1 || fIdx === 2 ? deckChannelMat : shellMat
      );
      armorPlate.position.set(segLen * 0.5, segRad * 0.88, 0);
      armorPlate.castShadow = true;
      armorPlate.receiveShadow = true;
      jointGroup.add(armorPlate);

      parentObj.add(jointGroup);
      segments.push(jointGroup);
      parentObj = jointGroup;
      localOffsetX = segLen;
    }
    return segments;
  });

  // 5. Two-Segment Articulated Thumb (Foreground side of palm, z = +0.56)
  const thumbBase = new THREE.Group();
  thumbBase.position.set(0.34, -0.12, 0.56);
  wristGroup.add(thumbBase);

  const thumbSeg1Len = 0.48;
  const thumbSeg1Cap = new THREE.CapsuleGeometry(0.108, thumbSeg1Len - 0.14, 8, 18);
  thumbSeg1Cap.rotateZ(Math.PI / 2);
  thumbSeg1Cap.translate(thumbSeg1Len / 2, 0, 0);
  const thumbSeg1Mesh = new THREE.Mesh(thumbSeg1Cap, shellMat);
  thumbSeg1Mesh.castShadow = true;
  thumbBase.add(thumbSeg1Mesh);

  const thumbBaseKnot = new THREE.Mesh(new THREE.SphereGeometry(0.122, 16, 14), subFrameMat);
  thumbBase.add(thumbBaseKnot);

  const thumbDistal = new THREE.Group();
  thumbDistal.position.set(thumbSeg1Len, 0, 0);
  thumbBase.add(thumbDistal);

  const thumbSeg2Len = 0.38;
  const thumbSeg2Cap = new THREE.CapsuleGeometry(0.092, thumbSeg2Len - 0.12, 8, 18);
  thumbSeg2Cap.rotateZ(Math.PI / 2);
  thumbSeg2Cap.translate(thumbSeg2Len / 2, 0, 0);
  const thumbSeg2Mesh = new THREE.Mesh(thumbSeg2Cap, shellMat);
  thumbSeg2Mesh.castShadow = true;
  thumbDistal.add(thumbSeg2Mesh);

  const thumbDistalKnot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.18, 16),
    subFrameMat
  );
  thumbDistalKnot.rotation.x = Math.PI / 2;
  thumbDistal.add(thumbDistalKnot);

  // 6. Precision-Milled Optical Pathway Strips along Wrist -> Palm -> Extended Fingers
  // Unlit base color is dark anthracite (#27272a) so before Phase 4 it blends into the deck channel!
  const pathwayMats: THREE.MeshStandardMaterial[] = [];
  const numPathSegments = 18;

  for (let i = 0; i < numPathSegments; i++) {
    const u = i / (numPathSegments - 1);
    const localX = lerp(-0.36, 2.48, u);
    const segMat = new THREE.MeshStandardMaterial({
      color: 0x272c38,
      emissive: 0xd41514,
      emissiveIntensity: 0.0,
      roughness: 0.2,
      metalness: 0.8,
    });
    pathwayMats.push(segMat);

    const segGroup = new THREE.Group();
    // Sleek thin lateral optical fiber rails + subtle micro-chevron node
    const railGeo = new THREE.BoxGeometry(0.125, 0.01, 0.018);
    const leftRail = new THREE.Mesh(railGeo, segMat);
    leftRail.position.set(0, 0, -0.28);
    const rightRail = new THREE.Mesh(railGeo, segMat);
    rightRail.position.set(0, 0, 0.28);

    const centerTick = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.008, 0.12), segMat);
    segGroup.add(leftRail, rightRail, centerTick);

    if (localX <= px1) {
      const holder = new THREE.Group();
      holder.position.set(localX, 0.043, 0);
      holder.add(segGroup);
      wristGroup.add(holder);
    } else {
      const fingerDist = localX - px1;
      const holder = new THREE.Group();
      if (fingerDist <= phalanxLengths[0]) {
        holder.position.set(fingerDist, 0.115, 0.14);
        holder.add(segGroup);
        fingers[1][0].add(holder);
      } else if (fingerDist <= phalanxLengths[0] + phalanxLengths[1]) {
        holder.position.set(fingerDist - phalanxLengths[0], 0.105, 0.14);
        holder.add(segGroup);
        fingers[1][1].add(holder);
      } else {
        holder.position.set(
          fingerDist - phalanxLengths[0] - phalanxLengths[1],
          0.095,
          0.14
        );
        holder.add(segGroup);
        fingers[1][2].add(holder);
      }
    }
  }

  const handLight = new THREE.PointLight(0xd41514, 0, 6.0, 1.5);
  handLight.position.set(0.68, 0.65, 0.2);
  wristGroup.add(handLight);

  return {
    root,
    wristGroup,
    fingers,
    thumbJoints: [thumbBase, thumbDistal],
    pathwayMats,
    deckChannelMat,
    shellMat,
    subFrameMat,
    chromeMat,
    seamLightMat,
    palmCoreRingMat,
    palmCoreCenterMat,
    handLight,
  };
}

interface HandPoseState {
  riseProgress: number;
  transformProgress: number;
  settleBounce: number;
  connectProgress: number;
  studentX: number;
  bridgeDip: number;
  ambientPulse: number;
}

const COLOR_UNLIT_RAIL = new THREE.Color(0x272c38);
const COLOR_LIT_CRIMSON = new THREE.Color(0xd41514);

function applyRoboticHandPose(hand: RoboticHandRig, s: HandPoseState) {
  const emergeEase = easeOutCubic(s.riseProgress);
  const transformEase = easeInOutCubic(s.transformProgress);

  const hiddenY = -4.3;
  const hiddenXOffset = -0.32;
  hand.root.position.set(
    WRIST_PIVOT_X + hiddenXOffset * (1 - emergeEase),
    lerp(hiddenY, WORLD_A_Y, emergeEase) - s.bridgeDip + s.settleBounce * 0.032,
    0
  );
  hand.root.visible = s.riseProgress > 0.005;

  const startPitch = 0.66;
  const targetPitch = BRIDGE_SLOPE;
  hand.wristGroup.rotation.z =
    lerp(startPitch, targetPitch, transformEase) + s.settleBounce * 0.022;
  hand.wristGroup.rotation.x = lerp(0.3, 0.0, transformEase);

  const phalanxWeights = [0.78, 1.05, 0.88];
  hand.fingers.forEach((segs, fIdx) => {
    const fingerDelay = fIdx * 0.06;
    const fingerOpen = easeInOutCubic((s.transformProgress - fingerDelay) / (1 - fingerDelay * 0.8));
    const curlAngle = (1 - fingerOpen) * 0.92;
    segs.forEach((joint, sIdx) => {
      joint.rotation.z = -curlAngle * phalanxWeights[sIdx];
    });
  });

  const thumbOpen = easeInOutCubic(clamp01((s.transformProgress - 0.08) / 0.85));
  hand.thumbJoints[0].rotation.y = lerp(-0.55, -0.18, thumbOpen);
  hand.thumbJoints[0].rotation.z = lerp(-0.65, -0.06, thumbOpen);
  hand.thumbJoints[1].rotation.z = lerp(-0.75, -0.05, thumbOpen);

  const totalSegs = hand.pathwayMats.length;
  hand.pathwayMats.forEach((mat, idx) => {
    const segU = idx / (totalSegs - 1);
    const segWorldX = lerp(BRIDGE_START_X, BRIDGE_END_X, segU);
    const segActivate = smoothstep((s.connectProgress - segU * 0.75) / 0.25);

    const distToStudent = Math.abs(s.studentX - segWorldX);
    const footstepBoost =
      s.studentX >= BRIDGE_START_X && s.studentX <= BRIDGE_END_X
        ? Math.max(0, 1 - distToStudent / 0.45) * 2.4
        : 0;

    const waveBoost =
      s.connectProgress >= 0.99
        ? (Math.sin(s.ambientPulse * 2.8 - segU * Math.PI * 2.5) * 0.5 + 0.5) * 0.8
        : 0;

    mat.color.lerpColors(COLOR_UNLIT_RAIL, COLOR_LIT_CRIMSON, segActivate);
    mat.emissiveIntensity = segActivate * (1.5 + footstepBoost + waveBoost);
  });

  const corePower = smoothstep(s.connectProgress * 1.2);
  hand.palmCoreRingMat.color.lerpColors(COLOR_UNLIT_RAIL, COLOR_LIT_CRIMSON, corePower);
  hand.palmCoreRingMat.emissiveIntensity = corePower * 2.4;
  hand.palmCoreCenterMat.opacity = corePower * 0.88;
  hand.seamLightMat.color.lerpColors(COLOR_UNLIT_RAIL, COLOR_LIT_CRIMSON, 0.3 + corePower * 0.7);
  hand.seamLightMat.emissiveIntensity = 0.2 + emergeEase * 0.45 + corePower * 1.1;
  hand.handLight.intensity = corePower * 2.2;
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
  campusLanternLight: THREE.PointLight;
  worldBGlassMat: THREE.MeshPhysicalMaterial;
  worldBSteelMat: THREE.MeshStandardMaterial;
  worldBWindowMat: THREE.MeshStandardMaterial;
  worldBBeaconMat: THREE.MeshStandardMaterial;
  worldBRingMat: THREE.MeshBasicMaterial;
  worldBLight: THREE.PointLight;
}

function buildTwoWorlds(): EnvironmentsRig {
  const cliffMat = new THREE.MeshStandardMaterial({
    color: 0x181c24,
    roughness: 0.85,
    metalness: 0.15,
    flatShading: true,
  });

  // -------------------------------------------------------------------------
  // WORLD A — WHERE YOU BEGIN (Realistic University Quad & Overlook Terrace)
  // -------------------------------------------------------------------------
  const worldAGroup = new THREE.Group();

  const stoneTex = createUniversityStoneTexture(false);
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x4a453f,
    map: stoneTex,
    roughness: 0.68,
    metalness: 0.08,
  });

  const stoneTrimMat = new THREE.MeshStandardMaterial({
    color: 0x665f57,
    roughness: 0.55,
    metalness: 0.12,
  });

  const uniWindowMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    emissive: 0xffdba8,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.5,
  });

  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x234233,
    roughness: 0.8,
    metalness: 0.05,
  });

  // Layered Geological Cliff Strata & Retaining Wall beneath World A (x = -1.6 to 0.88)
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
    stratum.receiveShadow = true;
    worldAGroup.add(stratum);
  }

  // Main University Terrace Platform (Top surface at y = WORLD_A_Y = 0.0, right edge at x = 0.86)
  const terraceSlab = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.22, 2.3), stoneMat);
  terraceSlab.position.set(-0.58, -0.11, -0.15);
  terraceSlab.receiveShadow = true;
  terraceSlab.castShadow = true;
  worldAGroup.add(terraceSlab);

  const terraceCornice = new THREE.Mesh(new THREE.BoxGeometry(2.96, 0.06, 2.36), stoneTrimMat);
  terraceCornice.position.set(-0.58, -0.03, -0.15);
  terraceCornice.receiveShadow = true;
  worldAGroup.add(terraceCornice);

  // University Academic Hall & Colonnade Portico (x = -1.7 to 0.15, z = -0.82)
  const academicHall = new THREE.Group();
  academicHall.position.set(-0.62, 0.0, -0.78);
  worldAGroup.add(academicHall);

  // Main Masonry Library Building Backdrop
  const hallBody = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.62, 0.68), stoneMat);
  hallBody.position.set(0, 0.81, -0.22);
  hallBody.castShadow = true;
  hallBody.receiveShadow = true;
  academicHall.add(hallBody);

  // Arched Collegiate Windows on the Academic Hall
  for (const wx of [-0.68, -0.22, 0.22, 0.68]) {
    const winFrame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.68, 0.06), stoneTrimMat);
    winFrame.position.set(wx, 0.82, 0.11);
    academicHall.add(winFrame);

    const winPane = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.07), uniWindowMat);
    winPane.position.set(wx, 0.82, 0.115);
    academicHall.add(winPane);
  }

  // Classical Fluted Columns along the Front Colonnade
  for (const cx of [-0.88, -0.44, 0.0, 0.44, 0.88]) {
    const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.1, 0.17), stoneTrimMat);
    colBase.position.set(cx, 0.05, 0.34);
    academicHall.add(colBase);

    const colShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 1.38, 16), stoneTrimMat);
    colShaft.position.set(cx, 0.78, 0.34);
    colShaft.castShadow = true;
    colShaft.receiveShadow = true;
    academicHall.add(colShaft);

    const colCap = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), stoneTrimMat);
    colCap.position.set(cx, 1.48, 0.34);
    academicHall.add(colCap);
  }

  // Classical Entablature & Cornice Roof
  const entablature = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.18, 0.88), stoneTrimMat);
  entablature.position.set(0, 1.61, 0.04);
  entablature.castShadow = true;
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
    canopy1.castShadow = true;
    treeGroup.add(canopy1);

    const canopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 * scale, 1), foliageMat);
    canopy2.position.set(0.12 * scale, 0.64 * scale, 0.06 * scale);
    treeGroup.add(canopy2);

    worldAGroup.add(treeGroup);
  }

  // Academic Courtyard Lamppost near World A Edge
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.82, 10), cliffMat);
  lanternPost.position.set(0.62, 0.41, -0.42);
  worldAGroup.add(lanternPost);

  const lanternGlobe = new THREE.Mesh(
    new THREE.SphereGeometry(0.052, 14, 14),
    new THREE.MeshBasicMaterial({ color: 0xffe4b5 })
  );
  lanternGlobe.position.set(0.62, 0.84, -0.42);
  worldAGroup.add(lanternGlobe);

  const campusLanternLight = new THREE.PointLight(0xffcf96, 1.8, 4.5, 1.5);
  campusLanternLight.position.set(0.62, 0.88, -0.32);
  worldAGroup.add(campusLanternLight);

  // -------------------------------------------------------------------------
  // WORLD B — WHERE YOU CAN GO (Modern Glass Architecture & Tech Campus)
  // -------------------------------------------------------------------------
  const worldBGroup = new THREE.Group();

  const { map: cwMap, emissiveMap: cwEmissive } = createCurtainWallTexture();
  const worldBWindowMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    map: cwMap,
    emissive: 0x7dd3fc,
    emissiveMap: cwEmissive,
    emissiveIntensity: 0.65,
    roughness: 0.15,
    metalness: 0.65,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
  });

  const worldBGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    metalness: 0.25,
    roughness: 0.1,
    transparent: true,
    opacity: 0.38,
    clearcoat: 1.0,
  });

  const worldBSteelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.86,
    roughness: 0.2,
  });

  const worldBBeaconMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0xd41514,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.85,
  });

  // Engineered Multi-Strata Foundation & Cliff beneath World B (x = 3.80 to 6.5)
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
    stratum.receiveShadow = true;
    worldBGroup.add(stratum);
  }

  // Sleek Cantilevered Innovation Plaza Deck (Left edge at x = 3.78, top at y = WORLD_B_Y = 0.14)
  const plazaDeck = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 2.5), worldBSteelMat);
  plazaDeck.position.set(5.28, WORLD_B_Y - 0.1, -0.2);
  plazaDeck.receiveShadow = true;
  plazaDeck.castShadow = true;
  worldBGroup.add(plazaDeck);

  // Precision Titanium Receiver Pad where the Robotic Hand's fingertips dock (x = 3.85)
  const receiverBase = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.03, 1.16), worldBSteelMat);
  receiverBase.position.set(3.96, WORLD_B_Y + 0.015, 0);
  worldBGroup.add(receiverBase);

  const receiverAccent = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.036, 1.08), worldBBeaconMat);
  receiverAccent.position.set(3.78, WORLD_B_Y + 0.018, 0);
  worldBGroup.add(receiverAccent);

  // Glass Guardrail along foreground edge of World B Plaza
  const glassRail = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.025), worldBGlassMat);
  glassRail.position.set(4.95, WORLD_B_Y + 0.09, 0.66);
  worldBGroup.add(glassRail);

  // Foreground Curved Glass Innovation Rotunda / Atrium Pavilion
  const rotundaGroup = new THREE.Group();
  rotundaGroup.position.set(4.65, WORLD_B_Y, -0.52);
  worldBGroup.add(rotundaGroup);

  const rotundaCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.42, 1.25, 28),
    worldBWindowMat
  );
  rotundaCore.position.y = 0.625;
  rotundaCore.castShadow = true;
  rotundaGroup.add(rotundaCore);

  for (const ringY of [0.32, 0.64, 0.96, 1.26]) {
    const floorRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.435, 0.435, 0.04, 28),
      worldBSteelMat
    );
    floorRing.position.y = ringY;
    rotundaGroup.add(floorRing);
  }

  // Tiered Curtain-Wall Glass Skyscrapers & Corporate Innovation Towers
  const towerSpecs: { x: number; z: number; w: number; h: number; d: number }[] = [
    { x: 5.25, z: -0.95, w: 0.68, h: 2.95, d: 0.62 },
    { x: 4.35, z: -1.25, w: 0.56, h: 2.15, d: 0.54 },
    { x: 5.95, z: -0.75, w: 0.62, h: 2.45, d: 0.58 },
    { x: 5.05, z: -1.72, w: 0.72, h: 3.65, d: 0.66 },
    { x: 5.82, z: -1.52, w: 0.58, h: 3.1, d: 0.56 },
  ];

  towerSpecs.forEach((t, idx) => {
    const towerGroup = new THREE.Group();
    towerGroup.position.set(t.x, WORLD_B_Y, t.z);

    // Curtain-Wall Windowed Skyscraper Body (Directly visible, no opaque wrapper!)
    const body = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), worldBWindowMat);
    body.position.y = t.h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    towerGroup.add(body);

    // Architectural Corner Mullion Pillars
    for (const cx of [-t.w / 2, t.w / 2]) {
      for (const cz of [-t.d / 2, t.d / 2]) {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.045, t.h + 0.04, 0.045),
          worldBSteelMat
        );
        pillar.position.set(cx, t.h / 2, cz);
        towerGroup.add(pillar);
      }
    }

    // Illuminated Crown & Setback Penthouse
    const crown = new THREE.Mesh(
      new THREE.BoxGeometry(t.w * 0.9, 0.1, t.d * 0.9),
      worldBSteelMat
    );
    crown.position.y = t.h + 0.05;
    towerGroup.add(crown);

    if (idx % 2 === 0) {
      const spire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.022, 0.58, 8),
        worldBBeaconMat
      );
      spire.position.y = t.h + 0.34;
      towerGroup.add(spire);
    }

    worldBGroup.add(towerGroup);
  });

  // Elevated Glass Skybridge connecting towers
  const skybridge = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.24), worldBSteelMat);
  skybridge.position.set(4.8, WORLD_B_Y + 1.55, -1.08);
  worldBGroup.add(skybridge);

  // Subtle Architectural Horizon Halo Arch behind World B
  const worldBRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.16,
  });
  const innovationArch = new THREE.Mesh(
    new THREE.RingGeometry(1.95, 1.99, 64, 1, 0, Math.PI),
    worldBRingMat
  );
  innovationArch.position.set(5.15, WORLD_B_Y + 0.45, -2.1);
  innovationArch.rotation.y = -0.22;
  worldBGroup.add(innovationArch);

  const worldBLight = new THREE.PointLight(0x38bdf8, 1.2, 8.5, 1.4);
  worldBLight.position.set(4.85, WORLD_B_Y + 1.8, -0.4);
  worldBGroup.add(worldBLight);

  return {
    worldAGroup,
    worldBGroup,
    stoneMat,
    stoneTrimMat,
    uniWindowMat,
    cliffMat,
    campusLanternLight,
    worldBGlassMat,
    worldBSteelMat,
    worldBWindowMat,
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
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [isSequenceComplete, setIsSequenceComplete] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webglFallback, setWebglFallback] = useState(false);

  const controlRef = useRef<{
    replay: () => void;
    seek: (timeSec: number) => void;
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.shadowMap.enabled = !isMobile;
    if (!isMobile) {
      renderer.shadowMap.type = THREE.PCFShadowMap;
    }

    const scene = new THREE.Scene();

    // Generate PMREM Environment BEFORE any CanvasTexture upload so UNPACK_FLIP_Y_WEBGL is false
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    scene.environmentIntensity = 0.78;

    const fog = new THREE.FogExp2(0x080808, 0.028);
    scene.fog = fog;

    const camera = new THREE.PerspectiveCamera(
      container.clientWidth < 768 ? 46 : 34,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100
    );

    // Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 1.15);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xf8fafc, 2.5);
    sunLight.position.set(-2.5, 7.8, 5.8);
    sunLight.castShadow = !isMobile;
    if (!isMobile) {
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 1;
      sunLight.shadow.camera.far = 25;
      const d = 6.0;
      sunLight.shadow.camera.left = -d;
      sunLight.shadow.camera.right = d;
      sunLight.shadow.camera.top = d;
      sunLight.shadow.camera.bottom = -d;
      sunLight.shadow.bias = -0.0005;
    }
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 1.9);
    rimLight.position.set(6.0, 4.5, -3.5);
    scene.add(rimLight);

    // Build World A, World B, Giant Robotic Hand Bridge, and Student Character
    const worlds = buildTwoWorlds();
    scene.add(worlds.worldAGroup, worlds.worldBGroup);

    const handRig = buildRoboticHandBridge();
    scene.add(handRig.root);

    const studentRig = buildRealisticStudentRig();
    scene.add(studentRig.root);

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
    // THEME SYNCHRONIZATION (LIGHT MODE vs DARK MODE)
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
        // Light Mode: Crisp natural daylight, warm limestone university, gleaming silver-titanium hand
        fog.color.setHex(0xeaf2fb);
        fog.density = 0.018;
        scene.environmentIntensity = 0.98;
        renderer.toneMappingExposure = 1.2;

        hemiLight.color.setHex(0xffffff);
        hemiLight.groundColor.setHex(0xcbd5e1);
        hemiLight.intensity = 1.5;

        sunLight.color.setHex(0xfffbeb);
        sunLight.intensity = 2.9;

        rimLight.color.setHex(0x38bdf8);
        rimLight.intensity = 1.35;

        // World A: Warm natural university limestone in daylight
        worlds.stoneMat.color.setHex(0xe2dcd3);
        worlds.stoneTrimMat.color.setHex(0xf0ece1);
        worlds.uniWindowMat.color.setHex(0x38bdf8);
        worlds.uniWindowMat.emissive.setHex(0xe0f2fe);
        worlds.uniWindowMat.emissiveIntensity = 0.25;
        worlds.cliffMat.color.setHex(0x64748b);
        worlds.campusLanternLight.intensity = 0.4;

        // World B: Bright architectural glass & steel towers in daylight
        worlds.worldBGlassMat.color.setHex(0x0284c7);
        worlds.worldBSteelMat.color.setHex(0xe2e8f0);
        worlds.worldBWindowMat.color.setHex(0x334155);
        worlds.worldBWindowMat.emissive.setHex(0x38bdf8);

        // Robotic Hand: Gleaming titanium-silver shell with slate mechanical joints
        handRig.shellMat.color.setHex(0xf1f5f9);
        handRig.shellMat.roughness = 0.17;
        handRig.shellMat.metalness = 0.82;
        handRig.subFrameMat.color.setHex(0x334155);
        handRig.deckChannelMat.color.setHex(0x334155);
        chasmMistMat.color.setHex(0xdbeafe);
        chasmMistMat.opacity = 0.38;

        studentRig.jacketMat.color.setHex(0x1e3a8a);
        studentRig.pantsMat.color.setHex(0x1e293b);
      } else {
        // Dark Mode: Deep Black (#080808), Chrome Silver (#CDCBCA), Laser Crimson (#D41514)
        fog.color.setHex(0x080808);
        fog.density = 0.028;
        scene.environmentIntensity = 0.78;
        renderer.toneMappingExposure = 1.14;

        hemiLight.color.setHex(0x94a3b8);
        hemiLight.groundColor.setHex(0x090a0f);
        hemiLight.intensity = 1.05;

        sunLight.color.setHex(0xe2e8f0);
        sunLight.intensity = 2.4;

        rimLight.color.setHex(0xcfd8dc);
        rimLight.intensity = 2.1;

        // World A: Cinematic evening university stone colonnade with warm library windows
        worlds.stoneMat.color.setHex(0x4a453f);
        worlds.stoneTrimMat.color.setHex(0x665f57);
        worlds.uniWindowMat.color.setHex(0x1e293b);
        worlds.uniWindowMat.emissive.setHex(0xffdba8);
        worlds.uniWindowMat.emissiveIntensity = 0.55;
        worlds.cliffMat.color.setHex(0x181c24);
        worlds.campusLanternLight.intensity = 2.2;

        // World B: Deep glass skyscrapers with luminous cyan/silver office bays
        worlds.worldBGlassMat.color.setHex(0x38bdf8);
        worlds.worldBSteelMat.color.setHex(0x94a3b8);
        worlds.worldBWindowMat.color.setHex(0x1e293b);
        worlds.worldBWindowMat.emissive.setHex(0x7dd3fc);

        // Robotic Hand: Brushed Chrome Silver (#CDCBCA) & deep basalt joints
        handRig.shellMat.color.setHex(0xcdcbca);
        handRig.shellMat.roughness = 0.19;
        handRig.shellMat.metalness = 0.88;
        handRig.subFrameMat.color.setHex(0x181b22);
        handRig.deckChannelMat.color.setHex(0x14171f);
        chasmMistMat.color.setHex(0x111827);
        chasmMistMat.opacity = 0.25;

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
    // CHOREOGRAPHED 6-PHASE EVALUATION
    // -----------------------------------------------------------------------
    let animId = 0;
    let isInView = true;
    let isTabVisible = !document.hidden;
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let elapsedSec = isReducedMotion ? T_PHASE6_READY : 0;
    let lastTick = performance.now();
    let lastReportedPhase = 0;
    let markedComplete = false;

    const evaluateSceneAtTime = (t: number) => {
      let phaseNum = 1;
      if (t >= T_PHASE5_END) phaseNum = 6;
      else if (t >= T_PHASE4_END) phaseNum = 5;
      else if (t >= T_PHASE3_END) phaseNum = 4;
      else if (t >= T_PHASE2_END) phaseNum = 3;
      else if (t >= T_PHASE1_END) phaseNum = 2;

      if (phaseNum !== lastReportedPhase) {
        lastReportedPhase = phaseNum;
        setCurrentPhase(phaseNum);
      }
      if (t >= T_PHASE5_END && !markedComplete) {
        markedComplete = true;
        setIsSequenceComplete(true);
      }

      const riseU = clamp01((t - T_PHASE1_END) / (T_PHASE2_END - T_PHASE1_END));
      const transformU = clamp01((t - T_PHASE2_END) / (T_PHASE3_END - T_PHASE2_END));
      const connectU = clamp01((t - T_PHASE3_END) / (T_PHASE4_END - T_PHASE3_END));
      const crossU = clamp01((t - T_PHASE4_END) / (T_PHASE5_END - T_PHASE4_END));
      const possibilityU = clamp01((t - T_PHASE5_END) / (T_PHASE6_READY - T_PHASE5_END));

      let settleBounce = 0;
      if (t > T_PHASE3_END - 0.2 && t < T_PHASE3_END + 0.9) {
        const st = t - (T_PHASE3_END - 0.2);
        settleBounce = Math.exp(-st * 5.5) * Math.sin(st * 16.0);
      }

      let studentX = WORLD_A_START_X;
      let normalizedSpeed = 0;

      if (t < T_PHASE1_END) {
        const [posP, spd] = trapezoidalMotion(t / T_PHASE1_END, 0.28);
        studentX = lerp(WORLD_A_START_X, WORLD_A_EDGE_X, posP);
        normalizedSpeed = t < T_PHASE1_END - 0.05 ? spd : 0;
      } else if (t < T_PHASE4_END) {
        studentX = WORLD_A_EDGE_X;
        normalizedSpeed = 0;
      } else if (t < T_PHASE5_END) {
        const [posP, spd] = trapezoidalMotion(crossU, 0.16);
        studentX = lerp(WORLD_A_EDGE_X, WORLD_B_DEST_X, posP);
        normalizedSpeed = crossU < 0.995 ? spd : 0;
      } else {
        studentX = WORLD_B_DEST_X;
        normalizedSpeed = 0;
      }

      let bridgeDip = 0;
      if (studentX > BRIDGE_START_X && studentX < BRIDGE_END_X) {
        const bridgeSpanU = (studentX - BRIDGE_START_X) / (BRIDGE_END_X - BRIDGE_START_X);
        bridgeDip = 0.03 * Math.sin(bridgeSpanU * Math.PI);
      }

      const totalDistanceWalked = Math.max(0, studentX - WORLD_A_START_X);
      const stridePhase = (totalDistanceWalked / STRIDE_LEN) * Math.PI * 2;
      const strideAmp = clamp01(normalizedSpeed * 1.15);

      let lookPitch = 0;
      let lookYaw = 0;
      if (t >= T_PHASE1_END && t < T_PHASE2_END) {
        const p = Math.sin(riseU * Math.PI);
        lookPitch = 0.24 * p;
        lookYaw = 0.12 * p;
      } else if (t >= T_PHASE5_END) {
        lookPitch = -0.14 * smoothstep(possibilityU) + Math.sin(t * 1.6) * 0.025;
        lookYaw = 0.18 * smoothstep(possibilityU) + Math.cos(t * 1.1) * 0.04;
      }

      applyStudentPose(studentRig, {
        x: studentX,
        z: 0,
        stridePhase,
        strideAmp,
        lean: 0.07 * strideAmp,
        lookPitch,
        lookYaw,
        facingYaw: Math.PI / 2 - 0.15 * smoothstep(possibilityU),
        bridgeDip,
      });

      applyRoboticHandPose(handRig, {
        riseProgress: riseU,
        transformProgress: transformU,
        settleBounce,
        connectProgress: connectU,
        studentX,
        bridgeDip,
        ambientPulse: Math.max(0, t - T_PHASE5_END),
      });

      // World B Illumination ("Phase 6 — Possibility")
      const worldBGlow = smoothstep(possibilityU);
      worlds.worldBWindowMat.emissiveIntensity =
        (isLightMode ? 0.55 : 0.75) + worldBGlow * (isLightMode ? 0.85 : 1.35);
      worlds.worldBBeaconMat.color.lerpColors(
        COLOR_UNLIT_RAIL,
        COLOR_LIT_CRIMSON,
        0.3 + connectU * 0.7
      );
      worlds.worldBBeaconMat.emissiveIntensity =
        0.35 + connectU * 0.85 + worldBGlow * 1.5;
      worlds.worldBRingMat.opacity = 0.14 + worldBGlow * 0.38;
      worlds.worldBLight.intensity = 1.1 + worldBGlow * 3.2;

      // Synchronized Camera Framing (Desktop vs Mobile)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const w = container.clientWidth;
      const mobileView = w < 768;

      // Desktop: Frame the chasm & robotic hand cleanly on the right side of the viewport (zero overlap with left text)
      // Mobile: Frame the entire bridge span in the lower half of the viewport below the top text & CTA
      const followShiftX = lerp(0.0, 0.42, easeInOutCubic(crossU));
      const camPosX = (mobileView ? 2.25 : 0.92) + followShiftX * 0.52 + mouse.x * 0.22;
      const camPosY = (mobileView ? 1.55 : 1.12) + mouse.y * 0.12;
      const camPosZ = mobileView ? 8.15 : 5.75;

      camera.position.set(camPosX, camPosY, camPosZ);

      const lookTargetX = (mobileView ? 2.32 : 1.35) + followShiftX * 0.62 + mouse.x * 0.08;
      const lookTargetY = (mobileView ? 0.68 : 0.22) + mouse.y * 0.04;
      camera.lookAt(lookTargetX, lookTargetY, -0.25);
    };

    const tick = (now: number) => {
      animId = 0;
      const dt = Math.min(0.06, Math.max(0.001, (now - lastTick) / 1000));
      lastTick = now;

      if (!isReducedMotion) {
        elapsedSec += dt;
      }

      evaluateSceneAtTime(elapsedSec);
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

    evaluateSceneAtTime(elapsedSec);
    renderer.render(scene, camera);
    setIsLoaded(true);
    startLoop();

    const api = {
      replay: () => {
        elapsedSec = 0;
        lastReportedPhase = 0;
        markedComplete = false;
        setIsSequenceComplete(false);
        setCurrentPhase(1);
        evaluateSceneAtTime(0);
        renderer.render(scene, camera);
        startLoop();
      },
      seek: (timeSec: number) => {
        elapsedSec = Math.max(0, timeSec);
        evaluateSceneAtTime(elapsedSec);
        renderer.render(scene, camera);
      },
      getPhase: () => lastReportedPhase,
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
      evaluateSceneAtTime(elapsedSec);
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
      envTexture.dispose();
      pmremGenerator.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  if (webglFallback) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-end overflow-hidden bg-gradient-to-br from-[#EEF4FB] via-[#E2ECF8] to-[#D5E3F4] dark:from-[#080808] dark:via-[#0D1017] dark:to-[#131824]"
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
          <rect x="880" y="160" width="65" height="180" fill="#38BDF8" fillOpacity="0.25" />
          <rect x="960" y="110" width="80" height="230" fill="#38BDF8" fillOpacity="0.35" />
          <path
            d="M360 365 C480 340, 700 340, 840 345 L830 385 C700 385, 480 390, 360 410 Z"
            fill="#CDCBCA"
          />
          <line x1="370" y1="362" x2="830" y2="344" stroke="#D41514" strokeWidth="4" />
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

      {/* Subtle Phase Storytelling Status & Replay Control */}
      <div
        className={`pointer-events-none absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2.5 rounded-full border border-slate-900/10 dark:border-white/12 bg-white/80 dark:bg-[#080808]/80 px-3.5 py-1.5 text-[0.68rem] sm:text-[0.72rem] font-mono text-slate-700 dark:text-[#CDCBCA] shadow-sm backdrop-blur-md transition-opacity duration-500 ${
          isLoaded ? "opacity-95" : "opacity-0"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#D41514] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#D41514]" />
        </span>
        <span data-testid="hero-phase-indicator">
          {PHASE_LABELS[currentPhase] || "Phase 6: Possibility"}
        </span>

        {isSequenceComplete && (
          <button
            type="button"
            onClick={handleReplay}
            data-testid="hero-replay-btn"
            className="pointer-events-auto ml-1.5 inline-flex items-center gap-1 rounded-full border border-slate-900/10 dark:border-white/15 bg-slate-900/5 dark:bg-white/10 px-2 py-0.5 text-[0.64rem] font-medium text-slate-900 dark:text-white hover:bg-[#D41514] hover:text-white dark:hover:bg-[#D41514] transition-colors cursor-pointer"
            title="Replay the Robotic Hand Bridge sequence"
          >
            ↻ Replay
          </button>
        )}
      </div>
    </div>
  );
}
