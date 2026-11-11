"use client";

/**
 * SkillBridgeStoryScene
 * ---------------------------------------------------------------------------
 * Real-time Three.js layer that sits exactly on top of the painted environment
 * plate (`/hero/skillbridge-environment.jpg`). World units == plate pixels
 * (1376 x 768), so characters and the robotic hand line up with the painted
 * cliffs regardless of the on-screen size of the plate.
 *
 * Everything that moves is procedural geometry, animated every frame:
 *  - Two jointed characters (student / professional) with hips, knees, ankles,
 *    shoulders, elbows and head. The gait is phase-locked to distance travelled
 *    and the hip height is solved from the stance leg, so feet stay planted.
 *  - An articulated robotic arm: forearm, wrist (roll + pitch), palm,
 *    4 fingers x 3 phalanges and a two-segment thumb.
 *  - A clipping-plane "energy sweep" that wipes the student into the
 *    professional bottom-to-top, framed by a blue→purple→pink ring.
 *
 * The story is a pure function of time, so replaying never snaps.
 */

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const PLATE_W = 1376;
export const PLATE_H = 768;

/* ------------------------------------------------------------------------ */
/* World layout (plate pixels, y measured downward in the painting)          */
/* ------------------------------------------------------------------------ */
const LEFT_GROUND = 478;
const RIGHT_GROUND = 456;
const LEFT_EDGE = 640; // where fingertips rest
const WRIST_X = 978; // where the wrist meets the right cliff
const CHAR_H = 228;
const STUDENT_START = 380;
const STUDENT_EDGE = 585;
const PRO_END = 1100;
const TX0 = 890; // transformation sweep begins
const TX1 = 1030; // ...and completes
const STRIDE = 0.766 * CHAR_H; // world units per full gait cycle
const BRIDGE_SLOPE = Math.atan2(LEFT_GROUND - RIGHT_GROUND, WRIST_X - LEFT_EDGE);
const ARM_DIR = new THREE.Vector2(Math.sin(0.4), -Math.cos(0.4)); // forearm axis (down-right)
const ARM_HIDDEN = 720;
const FACING = Math.PI / 2 - 0.45; // walking right, three-quarter towards camera

/* Timeline (seconds) */
const T = {
  fadeIn: [0, 0.8],
  walk1: [0.25, 1.9],
  rise: [2.9, 2.4],
  open: [5.3, 1.4],
  settle: [6.7, 0.8],
  power: [6.5, 1.2],
  cross: [7.6, 4.0],
  pose: [11.6, 1.1],
  glow: [11.8, 1.3],
  reset: [15.2, 2.2],
} as const;
const LOOP = T.reset[0] + T.reset[1];

/* ------------------------------------------------------------------------ */
/* Math helpers                                                              */
/* ------------------------------------------------------------------------ */
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const easeInOutCubic = (t: number) => {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInCubic = (t: number) => Math.pow(clamp01(t), 3);
const win = (t: number, w: readonly [number, number]) => clamp01((t - w[0]) / w[1]);

/** Trapezoidal motion profile: returns [position 0..1, normalised speed 0..1]. */
function trap(u: number, a = 0.22): [number, number] {
  const x = clamp01(u);
  const vmax = 1 / (1 - a);
  if (x < a) return [(0.5 * vmax * x * x) / a, x / a];
  if (x > 1 - a) {
    const r = 1 - x;
    return [1 - (0.5 * vmax * r * r) / a, r / a];
  }
  return [0.5 * vmax * a + vmax * (x - a), 1];
}

/** Keyframe track with smoothstep interpolation. */
function kf(t: number, keys: [number, number][]) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    const [t0, v0] = keys[i - 1];
    if (t <= t1) return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}

/** World-space y (up is +) of the walkable surface under x. */
function groundY(x: number) {
  if (x <= LEFT_EDGE) return -LEFT_GROUND;
  if (x >= WRIST_X) return -RIGHT_GROUND;
  return -lerp(LEFT_GROUND, RIGHT_GROUND, (x - LEFT_EDGE) / (WRIST_X - LEFT_EDGE));
}

function radialTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function verticalBeamTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d")!;
  const lin = g.createLinearGradient(0, 0, 0, 256);
  lin.addColorStop(0, "rgba(255,255,255,0)");
  lin.addColorStop(0.5, "rgba(255,255,255,1)");
  lin.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = lin;
  g.fillRect(0, 0, 64, 256);
  g.globalCompositeOperation = "destination-in";
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,0)");
  h.addColorStop(0.5, "rgba(0,0,0,1)");
  h.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 256);
  return new THREE.CanvasTexture(c);
}

/* ------------------------------------------------------------------------ */
/* Character rig                                                             */
/* ------------------------------------------------------------------------ */
interface Outfit {
  top: string;
  topDark: string;
  bottom: string;
  shoes: string;
  sole: string;
  skin: string;
  hair: string;
  pack: string;
  professional: boolean;
}

interface Limb {
  thigh: THREE.Group;
  shin: THREE.Group;
  foot: THREE.Group;
}
interface Arm {
  upper: THREE.Group;
  fore: THREE.Group;
}
interface Rig {
  root: THREE.Group;
  hips: THREE.Group;
  spine: THREE.Group;
  head: THREE.Group;
  legs: [Limb, Limb];
  arms: [Arm, Arm];
  materials: THREE.MeshStandardMaterial[];
  plane: THREE.Plane;
  keepAbove: boolean;
  shadow: THREE.Mesh;
  opacity: number;
}

const L_THIGH = 0.24;
const L_SHIN = 0.23;
const FOOT_H = 0.04;
const HIP_STAND = L_THIGH + L_SHIN + FOOT_H;

function buildCharacter(o: Outfit, keepAbove: boolean, shadowTex: THREE.Texture): Rig {
  // keepAbove: fragments with y >= h survive (student); otherwise y <= h (professional)
  const plane = keepAbove
    ? new THREE.Plane(new THREE.Vector3(0, 1, 0), 1e6)
    : new THREE.Plane(new THREE.Vector3(0, -1, 0), -1e6);
  const materials: THREE.MeshStandardMaterial[] = [];
  const mat = (color: string, roughness = 0.78, metalness = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, clippingPlanes: [plane] });
    materials.push(m);
    return m;
  };
  const mTop = mat(o.top, o.professional ? 0.62 : 0.88);
  const mTopDark = mat(o.topDark, 0.85);
  const mBottom = mat(o.bottom, 0.8);
  const mShoe = mat(o.shoes, o.professional ? 0.35 : 0.55);
  const mSole = mat(o.sole, 0.6);
  const mSkin = mat(o.skin, 0.6);
  const mHair = mat(o.hair, 0.7);
  const mPack = mat(o.pack, 0.7);
  const mWhite = mat("#F4F6FA", 0.5);
  const mDevice = mat("#C9D2DE", 0.3, 0.4);

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => {
    const me = new THREE.Mesh(g, m);
    return me;
  };
  const limbMesh = (len: number, r0: number, r1: number, m: THREE.Material) => {
    const grp = new THREE.Group();
    const cyl = new THREE.CylinderGeometry(r0, r1, len, 16, 1);
    cyl.translate(0, -len / 2, 0);
    grp.add(mesh(cyl, m));
    grp.add(mesh(new THREE.SphereGeometry(r0, 16, 12), m));
    const end = mesh(new THREE.SphereGeometry(r1, 14, 10), m);
    end.position.y = -len;
    grp.add(end);
    return grp;
  };

  const root = new THREE.Group();
  const hips = new THREE.Group();
  hips.position.y = HIP_STAND;
  root.add(hips);

  const pelvis = mesh(new THREE.SphereGeometry(0.064, 18, 12), mBottom);
  pelvis.scale.set(1.35, 0.85, 0.9);
  hips.add(pelvis);

  const legs = [1, -1].map((side) => {
    const thigh = new THREE.Group();
    thigh.position.set(side * 0.047, -0.012, 0);
    thigh.add(limbMesh(L_THIGH, 0.043, 0.034, mBottom));
    const shin = new THREE.Group();
    shin.position.y = -L_THIGH;
    shin.add(limbMesh(L_SHIN, 0.034, o.professional ? 0.027 : 0.03, mBottom));
    thigh.add(shin);
    const foot = new THREE.Group();
    foot.position.y = -L_SHIN;
    const shoe = mesh(new THREE.BoxGeometry(0.056, 0.034, 0.118), mShoe);
    shoe.position.set(0, -FOOT_H + 0.02, 0.03);
    foot.add(shoe);
    const toe = mesh(new THREE.SphereGeometry(0.029, 14, 10), mShoe);
    toe.scale.set(1, 0.62, 1);
    toe.position.set(0, -FOOT_H + 0.018, 0.088);
    foot.add(toe);
    const sole = mesh(new THREE.BoxGeometry(0.06, 0.01, 0.13), mSole);
    sole.position.set(0, -FOOT_H + 0.003, 0.035);
    foot.add(sole);
    shin.add(foot);
    hips.add(thigh);
    return { thigh, shin, foot };
  }) as [Limb, Limb];

  const spine = new THREE.Group();
  spine.position.y = 0.02;
  hips.add(spine);

  const torsoGeo = new THREE.CapsuleGeometry(0.07, 0.16, 8, 20);
  const torso = mesh(torsoGeo, mTop);
  torso.scale.set(1.32, 1, 0.78);
  torso.position.y = 0.15;
  spine.add(torso);

  if (o.professional) {
    // shirt + tie visible at the open jacket front
    const shirt = mesh(new THREE.BoxGeometry(0.05, 0.11, 0.01), mWhite);
    shirt.position.set(0, 0.235, 0.054);
    shirt.rotation.x = -0.12;
    spine.add(shirt);
    const tie = mesh(new THREE.BoxGeometry(0.016, 0.09, 0.008), mTopDark);
    tie.position.set(0, 0.225, 0.06);
    tie.rotation.x = -0.12;
    spine.add(tie);
    const hem = mesh(new THREE.CylinderGeometry(0.094, 0.096, 0.05, 20), mTop);
    hem.scale.set(1, 1, 0.8);
    hem.position.y = 0.035;
    spine.add(hem);
  } else {
    // hoodie: hood bunched at the back of the neck + front pocket
    const hood = mesh(new THREE.SphereGeometry(0.06, 16, 10), mTopDark);
    hood.scale.set(1.35, 0.7, 0.95);
    hood.position.set(0, 0.272, -0.04);
    spine.add(hood);
    const pocket = mesh(new THREE.BoxGeometry(0.1, 0.05, 0.01), mTopDark);
    pocket.position.set(0, 0.085, 0.056);
    spine.add(pocket);
    const cuff = mesh(new THREE.CylinderGeometry(0.095, 0.092, 0.035, 20), mTopDark);
    cuff.scale.set(1, 1, 0.78);
    cuff.position.y = 0.03;
    spine.add(cuff);
  }

  // backpack with straps
  const pack = mesh(new THREE.CapsuleGeometry(0.05, 0.08, 6, 14), mPack);
  pack.scale.set(1.25, 1, 0.75);
  pack.position.set(0, 0.165, -0.088);
  spine.add(pack);
  for (const side of [1, -1]) {
    const strap = mesh(new THREE.BoxGeometry(0.016, 0.17, 0.008), mPack);
    strap.position.set(side * 0.048, 0.18, 0.054);
    strap.rotation.x = -0.08;
    spine.add(strap);
  }

  const neck = mesh(new THREE.CylinderGeometry(0.024, 0.027, 0.05, 12), mSkin);
  neck.position.y = 0.3;
  spine.add(neck);

  const head = new THREE.Group();
  head.position.y = 0.33;
  spine.add(head);
  const skull = mesh(new THREE.SphereGeometry(0.064, 24, 18), mSkin);
  skull.scale.set(0.9, 1.08, 0.98);
  skull.position.y = 0.062;
  head.add(skull);
  const nose = mesh(new THREE.SphereGeometry(0.011, 10, 8), mSkin);
  nose.position.set(0, 0.055, 0.062);
  head.add(nose);
  for (const side of [1, -1]) {
    const ear = mesh(new THREE.SphereGeometry(0.013, 10, 8), mSkin);
    ear.scale.set(0.6, 1, 0.8);
    ear.position.set(side * 0.058, 0.06, -0.004);
    head.add(ear);
  }
  const hairCap = mesh(new THREE.SphereGeometry(0.069, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.56), mHair);
  hairCap.scale.set(0.92, 1.05, 1.02);
  hairCap.position.set(0, 0.07, -0.006);
  hairCap.rotation.x = -0.32;
  head.add(hairCap);
  if (!o.professional) {
    // tousled student hair
    const tufts: [number, number, number, number][] = [
      [0.02, 0.13, 0.03, 0.026],
      [-0.025, 0.128, 0.015, 0.025],
      [0.0, 0.122, 0.05, 0.022],
      [0.03, 0.11, -0.03, 0.024],
    ];
    for (const [x, y, z, r] of tufts) {
      const t = mesh(new THREE.SphereGeometry(r, 10, 8), mHair);
      t.position.set(x, y, z);
      head.add(t);
    }
  }

  const arms = [1, -1].map((side) => {
    const upper = new THREE.Group();
    upper.position.set(side * 0.098, 0.268, 0);
    upper.add(limbMesh(0.16, 0.03, 0.026, mTop));
    const fore = new THREE.Group();
    fore.position.y = -0.16;
    fore.add(limbMesh(0.145, 0.026, 0.022, mTop));
    const hand = mesh(new THREE.SphereGeometry(0.024, 12, 10), mSkin);
    hand.scale.set(0.8, 1.15, 0.9);
    hand.position.y = -0.17;
    fore.add(hand);
    upper.add(fore);
    spine.add(upper);
    return { upper, fore };
  }) as [Arm, Arm];

  if (o.professional) {
    // tablet / folder carried by the camera-side arm (local -x)
    const tablet = mesh(new THREE.BoxGeometry(0.11, 0.15, 0.012), mDevice);
    tablet.position.set(0.0, -0.13, 0.035);
    tablet.rotation.set(0.15, 0, 0);
    arms[1].fore.add(tablet);
  }

  root.scale.setScalar(CHAR_H);
  root.rotation.y = FACING;

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.5,
      color: "#3a2f45",
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.scale.set(96, 34, 1);
  shadow.renderOrder = 1;

  return { root, hips, spine, head, legs, arms, materials, plane, keepAbove, shadow, opacity: 1 };
}

interface Pose {
  x: number;
  phase: number;
  amp: number;
  lookYaw: number;
  lookPitch: number;
  lean: number;
  confident: number;
  facing: number;
}

function poseRig(rig: Rig, p: Pose, carryTablet: boolean) {
  const gy = groundY(p.x);
  rig.root.position.set(p.x, gy, 0);
  rig.root.rotation.y = p.facing;

  const A = 0.42 * p.amp;
  const B = 0.82 * p.amp;
  let hip = 0;
  for (let i = 0; i < 2; i++) {
    const ph = p.phase + (i === 0 ? 0 : Math.PI);
    const s = Math.sin(ph);
    const c = Math.cos(ph);
    const a = A * s; // thigh forward angle
    const b = 0.04 * p.amp + B * Math.pow(Math.max(0, c), 1.3); // knee flexion, peaks mid-swing
    const leg = rig.legs[i];
    leg.thigh.rotation.x = -a;
    leg.thigh.rotation.z = (i === 0 ? 1 : -1) * 0.035 * p.confident;
    leg.shin.rotation.x = b;
    leg.foot.rotation.x = a - b; // keep sole level with the ground
    const drop = L_THIGH * Math.cos(a) + L_SHIN * Math.cos(a - b) + FOOT_H;
    if (drop > hip) hip = drop;
  }
  rig.hips.position.y = hip;
  rig.hips.rotation.y = -0.07 * p.amp * Math.sin(p.phase);

  rig.spine.rotation.x = p.lean - 0.05 * p.confident;
  rig.spine.rotation.y = 0.11 * p.amp * Math.sin(p.phase);

  const A2 = 0.4 * p.amp;
  for (let i = 0; i < 2; i++) {
    const arm = rig.arms[i];
    const fwd = (i === 0 ? -1 : 1) * A2 * Math.sin(p.phase);
    if (carryTablet && i === 1) {
      arm.upper.rotation.set(-0.22 + fwd * 0.15, 0, -0.12);
      arm.fore.rotation.x = -1.32;
      continue;
    }
    arm.upper.rotation.x = -fwd;
    arm.upper.rotation.z = (i === 0 ? 1 : -1) * (0.07 + 0.03 * p.confident);
    arm.fore.rotation.x = -(0.18 + 0.32 * Math.max(0, fwd) + 0.1 * p.amp);
  }

  rig.head.rotation.y = p.lookYaw;
  rig.head.rotation.x = p.lookPitch - 0.6 * p.lean;

  rig.shadow.position.set(p.x + 6, gy + 0.8, 0);
  const sh = rig.shadow.material as THREE.MeshBasicMaterial;
  sh.opacity = 0.42 * rig.opacity;
}

function setRigOpacity(rig: Rig, o: number) {
  if (Math.abs(rig.opacity - o) < 1e-4) return;
  rig.opacity = o;
  const transparent = o < 0.999;
  for (const m of rig.materials) {
    if (m.transparent !== transparent) {
      m.transparent = transparent;
      m.needsUpdate = true;
    }
    m.opacity = o;
  }
  rig.root.visible = o > 0.002;
}

/** Sweep height h (world y). Student keeps y >= h, professional keeps y <= h. */
function setClip(rig: Rig, h: number) {
  if (rig.keepAbove) rig.plane.constant = -h;
  else rig.plane.constant = h;
}

/* ------------------------------------------------------------------------ */
/* Robotic arm                                                               */
/* ------------------------------------------------------------------------ */
interface Hand {
  arm: THREE.Group;
  wrist: THREE.Group;
  fingers: THREE.Group[][]; // [finger][segment]
  thumb: THREE.Group[];
  thumbBase: THREE.Group;
  glowMats: THREE.MeshBasicMaterial[];
  coreMats: THREE.MeshBasicMaterial[];
  tipShadow: THREE.Mesh;
}

function buildHand(shadowTex: THREE.Texture, glowTex: THREE.Texture): Hand {
  const shell = new THREE.MeshPhysicalMaterial({
    color: "#F2F4F8",
    roughness: 0.24,
    metalness: 0.1,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
  });
  const shellShade = new THREE.MeshPhysicalMaterial({
    color: "#DCE2EC",
    roughness: 0.3,
    metalness: 0.2,
    clearcoat: 0.8,
  });
  const joint = new THREE.MeshStandardMaterial({ color: "#272C38", roughness: 0.3, metalness: 0.8 });
  const glow = (color: string) =>
    new THREE.MeshBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0 });
  const gPink = glow("#FF4FB4");
  const gPurple = glow("#9A6BFF");
  const gCyan = glow("#4FD8FF");
  const gCoreA = glow("#4FD8FF");
  const gCoreB = glow("#FF63C0");

  const arm = new THREE.Group();

  /* Forearm (static relative to the arm root, points down-right) */
  const fore = new THREE.Group();
  fore.rotation.z = 0.4;
  arm.add(fore);
  const foreShell = new THREE.Mesh(new THREE.CylinderGeometry(48, 64, 640, 40, 1), shell);
  foreShell.position.y = -360;
  fore.add(foreShell);
  for (const [y, r, h] of [
    [-44, 52, 26],
    [-250, 58, 14],
    [-470, 62, 14],
  ] as [number, number, number][]) {
    const band = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40), joint);
    band.position.y = y;
    fore.add(band);
  }
  // inner panel (shaded) on the far side for mechanical depth
  const panel = new THREE.Mesh(new THREE.BoxGeometry(46, 380, 10), shellShade);
  panel.position.set(-10, -360, 54);
  panel.rotation.x = 0.03;
  fore.add(panel);
  // neon strips on the camera-facing side
  const stripGeo = new THREE.BoxGeometry(4, 520, 3);
  const s1 = new THREE.Mesh(stripGeo, gPink);
  s1.position.set(18, -380, 60);
  s1.rotation.z = -0.02;
  fore.add(s1);
  const s2 = new THREE.Mesh(stripGeo, gPurple);
  s2.position.set(-2, -380, 61);
  fore.add(s2);
  const s3 = new THREE.Mesh(new THREE.BoxGeometry(3, 300, 3), gCyan);
  s3.position.set(-28, -330, 58);
  fore.add(s3);
  const haloMat = new THREE.MeshBasicMaterial({
    map: glowTex,
    color: "#C77DFF",
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  });
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(90, 560), haloMat);
  halo.position.set(8, -380, 64);
  fore.add(halo);

  /* Wrist: roll (x) applied before pitch (z) */
  const wrist = new THREE.Group();
  wrist.rotation.order = "ZYX";
  arm.add(wrist);
  const wristBall = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 20), joint);
  wristBall.position.set(4, -34, 0);
  wrist.add(wristBall);
  const wristCap = new THREE.Mesh(new THREE.CylinderGeometry(44, 44, 30, 36), shellShade);
  wristCap.rotation.z = Math.PI / 2;
  wristCap.position.set(-6, -30, 0);
  wrist.add(wristCap);

  /* Palm: rounded slab with its top surface at local y = 0 */
  const P = 162;
  const shape = new THREE.Shape();
  const x0 = -P;
  const x1 = -14;
  const hw = 62;
  const r = 22;
  shape.moveTo(x0 + r, -hw);
  shape.lineTo(x1 - r, -hw);
  shape.quadraticCurveTo(x1, -hw, x1, -hw + r);
  shape.lineTo(x1, hw - r);
  shape.quadraticCurveTo(x1, hw, x1 - r, hw);
  shape.lineTo(x0 + r, hw);
  shape.quadraticCurveTo(x0, hw, x0, hw - r);
  shape.lineTo(x0, -hw + r);
  shape.quadraticCurveTo(x0, -hw, x0 + r, -hw);
  const palmGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 22,
    bevelEnabled: true,
    bevelThickness: 6,
    bevelSize: 6,
    bevelSegments: 4,
    curveSegments: 10,
  });
  palmGeo.rotateX(-Math.PI / 2);
  palmGeo.translate(0, -28, 0);
  const palm = new THREE.Mesh(palmGeo, shell);
  wrist.add(palm);
  // knuckle bar
  const knuckle = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 132, 24), joint);
  knuckle.rotation.x = Math.PI / 2;
  knuckle.position.set(-P + 2, -15, 0);
  wrist.add(knuckle);
  // palm energy core (sits flush on the top surface)
  const ring = new THREE.Mesh(new THREE.RingGeometry(15, 21, 40), gCoreA);
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(-82, 0.8, 0);
  wrist.add(ring);
  const core = new THREE.Mesh(new THREE.CircleGeometry(7, 24), gCoreB);
  core.rotation.x = -Math.PI / 2;
  core.position.set(-82, 0.9, 0);
  wrist.add(core);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(120, 1.5, 2), joint);
  seam.position.set(-82, 0.4, 40);
  wrist.add(seam);

  /* Fingers */
  const fingerZ = [-46, -15.5, 15.5, 46];
  const fingerScale = [0.84, 1, 0.95, 0.78];
  const segLen = [72, 56, 44];
  const segR = [15, 14, 12.5];
  const fingers: THREE.Group[][] = fingerZ.map((z, fi) => {
    const segs: THREE.Group[] = [];
    let parent: THREE.Object3D = wrist;
    let offX = -P;
    for (let si = 0; si < 3; si++) {
      const len = segLen[si] * fingerScale[fi];
      const rad = segR[si];
      const g = new THREE.Group();
      g.position.set(offX, si === 0 ? -15 : 0, si === 0 ? z : 0);
      const capsule = new THREE.CapsuleGeometry(rad, Math.max(1, len - rad * 1.2), 6, 18);
      capsule.rotateZ(Math.PI / 2);
      capsule.translate(-len / 2, 0, 0);
      g.add(new THREE.Mesh(capsule, si === 2 ? shellShade : shell));
      const knot = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.98, rad * 0.98, 7, 20), joint);
      knot.rotation.z = Math.PI / 2;
      knot.position.x = -2;
      g.add(knot);
      parent.add(g);
      segs.push(g);
      parent = g;
      offX = -len;
    }
    return segs;
  });

  /* Thumb */
  const thumbBase = new THREE.Group();
  thumbBase.position.set(-44, -16, 62);
  wrist.add(thumbBase);
  const thumb: THREE.Group[] = [];
  let tParent: THREE.Object3D = thumbBase;
  let tOff = 0;
  for (const [len, rad] of [
    [60, 16],
    [46, 14],
  ] as [number, number][]) {
    const g = new THREE.Group();
    g.position.x = tOff;
    const capsule = new THREE.CapsuleGeometry(rad, len - rad, 6, 18);
    capsule.rotateZ(Math.PI / 2);
    capsule.translate(-len / 2, 0, 0);
    g.add(new THREE.Mesh(capsule, shell));
    const knot = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, 7, 20), joint);
    knot.rotation.z = Math.PI / 2;
    g.add(knot);
    tParent.add(g);
    thumb.push(g);
    tParent = g;
    tOff = -len;
  }

  const tipShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0, color: "#3a2f45" }),
  );
  tipShadow.rotation.x = -Math.PI / 2;
  tipShadow.scale.set(150, 60, 1);
  tipShadow.position.set(LEFT_EDGE - 4, -LEFT_GROUND + 0.6, 0);

  return {
    arm,
    wrist,
    fingers,
    thumb,
    thumbBase,
    glowMats: [gPink, gPurple, gCyan, haloMat as unknown as THREE.MeshBasicMaterial],
    coreMats: [gCoreA, gCoreB],
    tipShadow,
  };
}

interface HandState {
  offset: number;
  pitch: number;
  roll: number;
  curl: number[];
  thumbOpen: number;
  glow: number;
  core: number;
  dip: number;
}

function poseHand(h: Hand, s: HandState) {
  h.arm.position.set(WRIST_X + ARM_DIR.x * s.offset, -RIGHT_GROUND + ARM_DIR.y * s.offset - s.dip, 0);
  h.arm.visible = s.offset < ARM_HIDDEN - 1;
  h.wrist.rotation.z = s.pitch;
  h.wrist.rotation.x = s.roll;
  const k = [0.85, 1.15, 0.95];
  h.fingers.forEach((segs, fi) => {
    const c = s.curl[fi];
    segs.forEach((g, si) => {
      g.rotation.z = -c * k[si];
    });
  });
  h.thumbBase.rotation.y = lerp(0.15, -0.75, s.thumbOpen);
  h.thumbBase.rotation.z = lerp(-0.6, -0.08, s.thumbOpen);
  h.thumb[1].rotation.z = lerp(-0.9, -0.12, s.thumbOpen);
  const [pink, purple, cyan, halo] = h.glowMats;
  pink.opacity = s.glow;
  purple.opacity = s.glow * 0.9;
  cyan.opacity = s.glow * 0.8;
  halo.opacity = s.glow * 0.32;
  h.coreMats[0].opacity = s.core;
  h.coreMats[1].opacity = s.core * 0.9;
  (h.tipShadow.material as THREE.MeshBasicMaterial).opacity = 0.32 * clamp01((ARM_HIDDEN * 0.04 - s.offset) / 20) * clamp01(1 - Math.abs(s.pitch - BRIDGE_SLOPE) * 4);
}

/* ------------------------------------------------------------------------ */
/* Story evaluation                                                          */
/* ------------------------------------------------------------------------ */
interface StoryFrame {
  student: Pose;
  pro: Pose;
  studentOpacity: number;
  proOpacity: number;
  studentClip: number;
  proClip: number;
  hand: HandState;
  sweep: { x: number; y: number; u: number; active: boolean };
  pill: number;
  skyGlow: number;
}

const HIDE_ALL = 1e6;

function standingPose(x: number): Pose {
  return { x, phase: 2 * Math.PI * ((x - STUDENT_START) / STRIDE), amp: 0, lookYaw: 0, lookPitch: 0, lean: 0, confident: 0, facing: FACING };
}

function evaluate(t: number, firstLoop: boolean): StoryFrame {
  // --- traveller position ---
  let x = STUDENT_START;
  let speed = 0;
  const u1 = win(t, T.walk1);
  const u2 = win(t, T.cross);
  if (t >= T.cross[0]) {
    const [p, v] = trap(u2, 0.2);
    x = lerp(STUDENT_EDGE, PRO_END, p);
    speed = u2 < 1 ? v : 0;
  } else if (t >= T.walk1[0]) {
    const [p, v] = trap(u1, 0.32);
    x = lerp(STUDENT_START, STUDENT_EDGE, p);
    speed = u1 < 1 ? v : 0;
  }
  const amp = Math.min(1, speed * 1.7);
  const phase = (2 * Math.PI * (x - STUDENT_START)) / STRIDE;

  const confident = smooth(win(t, T.pose));
  const lookPitch = kf(t, [
    [2.1, 0],
    [2.7, 0.3], // glance down into the gap
    [3.4, 0.22],
    [4.6, -0.14], // follow the rising hand
    [6.2, 0.02],
    [7.6, 0.02],
    [11.4, 0],
    [12.5, -0.12], // look up towards the skyline
  ]);
  const lookYaw = kf(t, [
    [2.1, 0],
    [3.0, 0.18],
    [5.2, 0.08],
    [7.6, 0],
    [11.6, 0],
    [12.6, 0.24],
  ]);
  const lean = 0.06 * amp;
  const facing = lerp(FACING, FACING - 0.18, confident);
  const traveller: Pose = { x, phase, amp, lookYaw, lookPitch, lean, confident, facing };

  // --- transformation sweep ---
  const su = clamp01((x - TX0) / (TX1 - TX0));
  const gy = groundY(x);
  const sweepY = gy - 6 + su * (CHAR_H * 1.1);

  let studentClip = -HIDE_ALL; // fully visible
  let proClip = -HIDE_ALL; // fully hidden
  if (su > 0 && su < 1) {
    studentClip = sweepY;
    proClip = sweepY;
  } else if (su >= 1) {
    studentClip = HIDE_ALL;
    proClip = HIDE_ALL;
  }

  let studentOpacity = firstLoop ? smooth(win(t, T.fadeIn)) : 1;
  let proOpacity = su > 0 ? 1 : 0;
  let student = traveller;
  let pro = traveller;

  // --- reset: professional fades out, student fades back in at the start ---
  const ur = win(t, T.reset);
  if (t >= T.reset[0]) {
    proOpacity = 1 - smooth(ur / 0.55);
    studentOpacity = smooth((ur - 0.45) / 0.55);
    student = standingPose(STUDENT_START);
    pro = { ...standingPose(PRO_END), confident: 1, lookPitch: -0.12, lookYaw: 0.24, facing: FACING - 0.18 };
    studentClip = -HIDE_ALL;
    proClip = HIDE_ALL;
  }

  // --- hand ---
  const uRise = win(t, T.rise);
  const uOpen = win(t, T.open);
  const uSet = win(t, T.settle);
  let offset = ARM_HIDDEN * (1 - easeOutCubic(uRise));
  let pitch = lerp(-1.22, BRIDGE_SLOPE, easeInOutCubic(uOpen));
  let roll = lerp(0.72, 0, easeInOutCubic(uOpen * 1.25));
  if (uSet > 0 && uSet < 1) {
    const damp = Math.pow(1 - uSet, 2);
    pitch += 0.045 * Math.sin(uSet * Math.PI * 2.6) * damp;
    offset += 3.5 * Math.sin(uSet * Math.PI * 2.0) * damp;
  }
  const curl = [0, 1, 2, 3].map((i) => 0.95 * (1 - easeInOutCubic((uOpen - 0.07 * i) / 0.68)));
  let thumbOpen = easeInOutCubic((uOpen - 0.1) / 0.75);
  let glow = 0.28 * smooth(uRise * 1.4) + 0.72 * smooth(win(t, T.power));
  let core = smooth(win(t, T.power));
  let dip = 0;
  if (u2 > 0 && x > LEFT_EDGE && x < WRIST_X) dip = 2.2 * Math.sin(Math.PI * ((x - LEFT_EDGE) / (WRIST_X - LEFT_EDGE)));

  if (t >= T.reset[0]) {
    const uh = clamp01((ur - 0.1) / 0.9);
    offset = ARM_HIDDEN * easeInCubic(uh);
    pitch = lerp(BRIDGE_SLOPE, -1.22, easeInOutCubic(uh * 1.2));
    roll = lerp(0, 0.72, easeInOutCubic(uh * 1.2));
    curl.forEach((_, i) => (curl[i] = 0.95 * clamp01(easeInOutCubic(uh * 1.4 - 0.05 * i))));
    thumbOpen = Math.max(0, 1 - easeInOutCubic(uh * 1.4));
    glow = Math.max(0, 1 - smooth(uh * 1.5));
    core = glow;
  }

  const pill = t >= T.reset[0] ? Math.max(0, 1 - smooth(ur / 0.5)) : smooth((t - (T.power[0] + 0.3)) / 0.9);
  const skyGlow = t >= T.reset[0] ? Math.max(0, 1 - smooth(ur / 0.6)) : smooth(win(t, T.glow));

  return {
    student,
    pro,
    studentOpacity,
    proOpacity,
    studentClip,
    proClip,
    hand: { offset, pitch, roll, curl, thumbOpen, glow, core, dip },
    sweep: { x, y: sweepY, u: su, active: su > 0 && su < 1 && t < T.reset[0] },
    pill,
    skyGlow,
  };
}

/** Single-frame "storyboard" for reduced motion: the whole narrative at once. */
function posterFrame(): StoryFrame {
  const student: Pose = { ...standingPose(STUDENT_EDGE - 6), lookPitch: 0.06, lookYaw: 0.1 };
  const pro: Pose = { ...standingPose(PRO_END), confident: 1, lookPitch: -0.12, lookYaw: 0.24, facing: FACING - 0.18 };
  return {
    student,
    pro,
    studentOpacity: 1,
    proOpacity: 1,
    studentClip: -HIDE_ALL,
    proClip: HIDE_ALL,
    hand: { offset: 0, pitch: BRIDGE_SLOPE, roll: 0, curl: [0, 0, 0, 0], thumbOpen: 1, glow: 1, core: 1, dip: 0 },
    sweep: { x: 0, y: 0, u: 0, active: false },
    pill: 1,
    skyGlow: 1,
  };
}

/* ------------------------------------------------------------------------ */
/* React component                                                           */
/* ------------------------------------------------------------------------ */
export interface StorySceneProps {
  reducedMotion: boolean;
  pillRef: RefObject<HTMLDivElement | null>;
  skyGlowRef: RefObject<HTMLDivElement | null>;
  replayToken: number;
  onFinished?: (finished: boolean) => void;
  onReady?: () => void;
  onError?: () => void;
}

export default function SkillBridgeStoryScene({
  reducedMotion,
  pillRef,
  skyGlowRef,
  replayToken,
  onFinished,
  onReady,
  onError,
}: StorySceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controlRef = useRef<{ replay: () => void; seek?: (t: number) => void } | null>(null);
  const cbRef = useRef({ onFinished, onReady, onError });
  useEffect(() => {
    cbRef.current = { onFinished, onReady, onError };
  });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      cbRef.current.onError?.();
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    const canvas = renderer.domElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "none";
    canvas.setAttribute("aria-hidden", "true");
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.55;

    // Orthographic camera pitched slightly downward; the frustum height is
    // compensated so that z = 0 maps exactly onto plate pixels.
    const pitch = THREE.MathUtils.degToRad(11);
    const halfW = PLATE_W / 2;
    const halfH = (PLATE_H / 2) * Math.cos(pitch);
    const camera = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 1, 8000);
    const target = new THREE.Vector3(PLATE_W / 2, -PLATE_H / 2, 0);
    camera.position.set(target.x, target.y + Math.sin(pitch) * 3000, Math.cos(pitch) * 3000);
    camera.lookAt(target);

    // Lighting tuned to the warm sun on the right of the painting
    scene.add(new THREE.HemisphereLight("#E4ECFF", "#D7B8A2", 1.15));
    const sun = new THREE.DirectionalLight("#FFE2C6", 2.5);
    sun.position.set(target.x + 1400, target.y + 900, 900);
    sun.target.position.copy(target);
    scene.add(sun, sun.target);
    const rim = new THREE.DirectionalLight("#A8CCFF", 1.2);
    rim.position.set(target.x - 1500, target.y + 500, -700);
    rim.target.position.copy(target);
    scene.add(rim, rim.target);
    const fill = new THREE.DirectionalLight("#FFD6EC", 0.45);
    fill.position.set(target.x - 600, target.y + 200, 1500);
    fill.target.position.copy(target);
    scene.add(fill, fill.target);

    const shadowTex = radialTexture("rgba(255,255,255,1)", "rgba(255,255,255,0)");
    const glowTex = radialTexture("rgba(255,255,255,0.9)", "rgba(255,255,255,0)");

    const student = buildCharacter(
      {
        top: "#9AA1AD",
        topDark: "#7E8592",
        bottom: "#2F3B52",
        shoes: "#F1F2F4",
        sole: "#B9BEC8",
        skin: "#DDAE88",
        hair: "#2B1F18",
        pack: "#30343E",
        professional: false,
      },
      true,
      shadowTex,
    );
    const pro = buildCharacter(
      {
        top: "#283149",
        topDark: "#3D2C5C",
        bottom: "#1F2535",
        shoes: "#5A3A2A",
        sole: "#2A1D16",
        skin: "#DDAE88",
        hair: "#1E1611",
        pack: "#23262E",
        professional: true,
      },
      false,
      shadowTex,
    );
    scene.add(student.root, pro.root, student.shadow, pro.shadow);

    const hand = buildHand(shadowTex, glowTex);
    scene.add(hand.arm, hand.tipShadow);

    // Transformation ring + soft beam
    const ringGroup = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({ color: "#4FB8FF", transparent: true, toneMapped: false, depthWrite: false });
    const ringGlowMat = new THREE.MeshBasicMaterial({
      color: "#8E6BFF",
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      depthWrite: false,
    });
    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(52, 2.2, 10, 64), ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    const ringGlow = new THREE.Mesh(new THREE.TorusGeometry(52, 9, 10, 64), ringGlowMat);
    ringGlow.rotation.x = Math.PI / 2;
    ringGroup.add(ringMesh, ringGlow);
    const beamMat = new THREE.MeshBasicMaterial({
      map: verticalBeamTexture(),
      color: "#B58CFF",
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(150, CHAR_H * 1.35), beamMat);
    beam.rotation.x = -pitch;
    scene.add(ringGroup, beam);
    ringGroup.visible = false;

    const cBlue = new THREE.Color("#3FA8FF");
    const cPurple = new THREE.Color("#8E5BFF");
    const cPink = new THREE.Color("#FF4FB4");
    const tmpColor = new THREE.Color();

    let lastPill = -1;
    let lastGlow = -1;
    const applyFrame = (f: StoryFrame) => {
      setRigOpacity(student, f.studentOpacity);
      setRigOpacity(pro, f.proOpacity);
      setClip(student, f.studentClip);
      setClip(pro, f.proClip);
      poseRig(student, f.student, false);
      poseRig(pro, f.pro, true);
      // the shadow belongs to whichever body is visible
      const sweepMix = f.sweep.u;
      const proVisible = f.proClip > -HIDE_ALL + 1;
      const stVisible = f.studentClip < HIDE_ALL - 1;
      (student.shadow.material as THREE.MeshBasicMaterial).opacity = stVisible ? 0.42 * f.studentOpacity * (f.sweep.active ? 1 - sweepMix : 1) : 0;
      (pro.shadow.material as THREE.MeshBasicMaterial).opacity = proVisible ? 0.42 * f.proOpacity * (f.sweep.active ? sweepMix : 1) : 0;
      poseHand(hand, f.hand);

      if (f.sweep.active) {
        ringGroup.visible = true;
        const k = Math.sin(Math.PI * f.sweep.u);
        ringGroup.position.set(f.sweep.x + 4, f.sweep.y, 0);
        if (f.sweep.u < 0.5) tmpColor.copy(cBlue).lerp(cPurple, f.sweep.u * 2);
        else tmpColor.copy(cPurple).lerp(cPink, (f.sweep.u - 0.5) * 2);
        ringMat.color.copy(tmpColor);
        ringGlowMat.color.copy(tmpColor);
        ringMat.opacity = 0.95 * Math.sqrt(k);
        ringGlowMat.opacity = 0.28 * k;
        beam.visible = true;
        beam.position.set(f.sweep.x + 4, groundY(f.sweep.x) + CHAR_H * 0.55, -40);
        beamMat.color.copy(tmpColor);
        beamMat.opacity = 0.16 * k;
      } else {
        ringGroup.visible = false;
        beam.visible = false;
      }

      if (pillRef.current && Math.abs(f.pill - lastPill) > 0.004) {
        lastPill = f.pill;
        pillRef.current.style.opacity = f.pill.toFixed(3);
        pillRef.current.style.transform = `translate(-50%, -50%) translateY(${((1 - f.pill) * 10).toFixed(2)}px) scale(${(0.96 + 0.04 * f.pill).toFixed(3)})`;
      }
      if (skyGlowRef.current && Math.abs(f.skyGlow - lastGlow) > 0.004) {
        lastGlow = f.skyGlow;
        skyGlowRef.current.style.opacity = f.skyGlow.toFixed(3);
      }
    };

    /* Sizing ----------------------------------------------------------- */
    let pixelRatioCap = 1.75;
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      const cap = w > 1700 ? Math.min(pixelRatioCap, 1.35) : pixelRatioCap;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
      renderer.setSize(w, h, false);
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* Playback ---------------------------------------------------------- */
    let raf = 0;
    let clock = 0;
    let loops = 0;
    let firstLoop = true;
    let inView = true;
    let pageVisible = !document.hidden;
    let last = 0;
    let slowFrames = 0;
    let frames = 0;

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.08, (now - last) / 1000) : 1 / 60;
      last = now;
      clock += dt;

      // adaptive quality: drop the pixel ratio if we cannot hold ~40fps
      frames++;
      if (dt > 1 / 40) slowFrames++;
      if (frames === 90) {
        if (slowFrames > 45 && pixelRatioCap > 1) {
          pixelRatioCap = 1;
          resize();
        }
        frames = 0;
        slowFrames = 0;
      }

      if (clock >= LOOP) {
        loops++;
        firstLoop = false;
        clock -= LOOP;
      }

      applyFrame(evaluate(clock, firstLoop));
      renderer.render(scene, camera);

      if (clock >= T.pose[0] + T.pose[1]) {
        cbRef.current.onFinished?.(true);
      }

      schedule();
    };

    const schedule = () => {
      if (reducedMotion || !inView || !pageVisible) return;
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reducedMotion) {
        applyFrame(posterFrame());
        renderer.render(scene, camera);
        return;
      }
      applyFrame(evaluate(clock, firstLoop));
      renderer.render(scene, camera);
      last = 0;
      schedule();
    };

    controlRef.current = {
      replay: () => {
        stop();
        clock = 0;
        loops = 0;
        firstLoop = false;
        cbRef.current.onFinished?.(false);
        start();
      },
      seek: (t: number) => {
        stop();
        clock = t;
        applyFrame(evaluate(clock, false));
        renderer.render(scene, camera);
        cbRef.current.onFinished?.(clock >= T.pose[0] + T.pose[1]);
      },
    };

    if (typeof window !== "undefined") {
      (window as unknown as { __SKILLBRIDGE_STORY__?: unknown }).__SKILLBRIDGE_STORY__ = {
        seek: (t: number) => {
          controlRef.current?.seek?.(t);
        },
        getTime: () => clock,
        getLoops: () => loops,
        replay: () => {
          controlRef.current?.replay();
        },
      };
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) {
          last = 0;
          schedule();
        } else if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(mount);

    const onVis = () => {
      pageVisible = !document.hidden;
      if (pageVisible) {
        last = 0;
        schedule();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    document.addEventListener("visibilitychange", onVis);

    resize();
    start();
    cbRef.current.onReady?.();

    return () => {
      stop();
      if (typeof window !== "undefined") {
        delete (window as unknown as { __SKILLBRIDGE_STORY__?: unknown }).__SKILLBRIDGE_STORY__;
      }
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      controlRef.current = null;
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose();
      });
      shadowTex.dispose();
      glowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (canvas.parentElement === mount) mount.removeChild(canvas);
    };
  }, [reducedMotion, pillRef, skyGlowRef]);

  // Replay requests from the UI
  const firstToken = useRef(replayToken);
  useEffect(() => {
    if (replayToken !== firstToken.current) controlRef.current?.replay();
  }, [replayToken]);

  return <div ref={mountRef} className="absolute inset-0" />;
}
