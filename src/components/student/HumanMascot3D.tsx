"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

export interface MascotAnimState {
  isPasswordFocused: boolean;
  isPasswordVisible: boolean;
  isEmailFocused: boolean;
  pointer: { x: number; y: number } | null;
}

// Coordinated animation states as requested
export type MascotAnimationState =
  | "idle"
  | "greeting"
  | "passwordFocusedCoverEyes"
  | "passwordVisiblePeek"
  | "passwordHiddenCoverEyes"
  | "returnToIdle";

export default function HumanMascot3D({
  className = "",
  animState,
}: {
  className?: string;
  animState: MascotAnimState;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReduced = usePrefersReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  // References to keep animation loop in sync with live prop changes without re-creating scene
  const animStateRef = useRef(animState);
  useEffect(() => {
    animStateRef.current = animState;
  }, [animState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, and WebGL Renderer
    const scene = new THREE.Scene();
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 20);
    // Framed from chest/shoulders upward with room for gesturing hands and wave
    camera.position.set(0, 0.44, 1.48);
    camera.lookAt(0, 0.42, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 2. High-End Studio Lighting with SkillBridge Signature Rims
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3e8, 2.0);
    keyLight.position.set(1.4, 1.8, 1.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9ebff, 1.1);
    fillLight.position.set(-1.4, 1.0, 1.2);
    scene.add(fillLight);

    // SkillBridge Signature Rim Lighting
    const cyanRim = new THREE.DirectionalLight(0x19b8e6, 2.2);
    cyanRim.position.set(-1.8, 0.5, -1.2);
    scene.add(cyanRim);

    const pinkRim = new THREE.DirectionalLight(0xff2d95, 1.9);
    pinkRim.position.set(1.8, 0.6, -1.2);
    scene.add(pinkRim);

    // 3. Materials
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: 0xf6c8a8,
      roughness: 0.48,
      metalness: 0.04,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: 0x241815,
      roughness: 0.68,
      metalness: 0.05,
    });

    const hoodieMaterial = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.72,
      metalness: 0.08,
    });

    const hoodieTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x007ba7,
      roughness: 0.5,
      metalness: 0.15,
    });

    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.02,
    });

    const irisMaterial = new THREE.MeshStandardMaterial({
      color: 0x0088cc,
      roughness: 0.18,
      metalness: 0.08,
    });

    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x07090e });
    const eyeHighlightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const eyebrowMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f1412,
      roughness: 0.7,
    });

    const mouthMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8646b,
      roughness: 0.4,
    });

    const blushMaterial = new THREE.MeshBasicMaterial({
      color: 0xff4d88,
      transparent: true,
      opacity: 0,
      blending: THREE.NormalBlending,
    });

    // 4. Hierarchical Kinematic Rig
    const characterRoot = new THREE.Group();
    scene.add(characterRoot);

    // Spine / Chest / Shoulders (framed from chest upward)
    const chestGroup = new THREE.Group();
    chestGroup.position.set(0, 0, 0);
    characterRoot.add(chestGroup);

    // Modern Tech Hoodie Torso
    const torsoGeom = new THREE.CylinderGeometry(0.36, 0.44, 0.45, 32);
    const torsoMesh = new THREE.Mesh(torsoGeom, hoodieMaterial);
    torsoMesh.position.set(0, 0.05, 0);
    torsoMesh.scale.set(1.18, 1, 0.88);
    chestGroup.add(torsoMesh);

    // Hoodie Collar / Hood Trim
    const collarGeom = new THREE.TorusGeometry(0.18, 0.055, 16, 32);
    const collarMesh = new THREE.Mesh(collarGeom, hoodieTrimMaterial);
    collarMesh.position.set(0, 0.26, 0.02);
    collarMesh.rotation.x = Math.PI / 2 + 0.15;
    chestGroup.add(collarMesh);

    // Neck
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.105, 0.14, 24), skinMaterial);
    neckMesh.position.set(0, 0.32, 0);
    chestGroup.add(neckMesh);

    // Head Pivot (Articulated for nod, tilt, gaze)
    const headPivot = new THREE.Group();
    headPivot.position.set(0, 0.38, 0);
    chestGroup.add(headPivot);

    // Cranium / Face Mesh
    const headGeom = new THREE.SphereGeometry(0.21, 36, 36);
    headGeom.scale(0.96, 1.14, 1.02);
    const headMesh = new THREE.Mesh(headGeom, skinMaterial);
    headMesh.position.set(0, 0.18, 0);
    headPivot.add(headMesh);

    // Nose
    const noseGeom = new THREE.ConeGeometry(0.032, 0.075, 16);
    const noseMesh = new THREE.Mesh(noseGeom, skinMaterial);
    noseMesh.position.set(0, 0.165, 0.21);
    noseMesh.rotation.x = -Math.PI / 2 - 0.25;
    headPivot.add(noseMesh);

    // Stylized Modern Hair Volume
    const hairGroup = new THREE.Group();
    headPivot.add(hairGroup);

    const hairCrown = new THREE.Mesh(new THREE.SphereGeometry(0.222, 32, 28), hairMaterial);
    hairCrown.position.set(0, 0.24, -0.015);
    hairCrown.scale.set(0.98, 1.08, 1.05);
    hairGroup.add(hairCrown);

    // Stylized Front Hair Wave / Swoop
    const hairWave = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), hairMaterial);
    hairWave.position.set(-0.06, 0.33, 0.14);
    hairWave.scale.set(1.4, 0.75, 0.9);
    hairWave.rotation.z = -0.25;
    hairGroup.add(hairWave);

    const hairWave2 = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), hairMaterial);
    hairWave2.position.set(0.08, 0.32, 0.13);
    hairWave2.scale.set(1.2, 0.65, 0.85);
    hairWave2.rotation.z = 0.2;
    hairGroup.add(hairWave2);

    // Sculpted Ears
    const earGeom = new THREE.SphereGeometry(0.045, 16, 16);
    earGeom.scale(0.5, 1, 0.8);
    const earL = new THREE.Mesh(earGeom, skinMaterial);
    earL.position.set(-0.2, 0.18, 0.02);
    earL.rotation.y = 0.25;
    headPivot.add(earL);

    const earR = new THREE.Mesh(earGeom, skinMaterial);
    earR.position.set(0.2, 0.18, 0.02);
    earR.rotation.y = -0.25;
    headPivot.add(earR);

    // Subtle Cheek Blush (Animated on Password Focus & Peek)
    const blushGeom = new THREE.CircleGeometry(0.038, 20);
    const blushL = new THREE.Mesh(blushGeom, blushMaterial);
    blushL.position.set(-0.105, 0.135, 0.198);
    blushL.rotation.y = -0.3;
    headPivot.add(blushL);

    const blushR = new THREE.Mesh(blushGeom, blushMaterial);
    blushR.position.set(0.105, 0.135, 0.198);
    blushR.rotation.y = 0.3;
    headPivot.add(blushR);

    // Mouth / Smile Assembly
    const mouthPivot = new THREE.Group();
    mouthPivot.position.set(0, 0.105, 0.2);
    headPivot.add(mouthPivot);

    const smileGeom = new THREE.TorusGeometry(0.048, 0.012, 12, 24, Math.PI * 0.9);
    const smileMesh = new THREE.Mesh(smileGeom, mouthMaterial);
    smileMesh.rotation.z = Math.PI + 0.15;
    smileMesh.rotation.x = -0.35;
    mouthPivot.add(smileMesh);

    // Expressive Eyes Assembly with Independent Look-At & Eyelids
    // Note: sock.x = -0.076 is Left Eye (mascot's right, facing the form on the left)
    //       sock.x = +0.076 is Right Eye (mascot's left, away from form)
    const eyeSockets = [
      { name: "left", x: -0.076, y: 0.195, z: 0.17 },
      { name: "right", x: 0.076, y: 0.195, z: 0.17 },
    ];

    interface EyeRig {
      eyeball: THREE.Group;
      eyelidUpper: THREE.Mesh;
      eyebrow: THREE.Group;
    }

    const eyeRigs: EyeRig[] = [];

    eyeSockets.forEach((sock, sIdx) => {
      const eyeRigGroup = new THREE.Group();
      eyeRigGroup.position.set(sock.x, sock.y, sock.z);
      headPivot.add(eyeRigGroup);

      // Eyeball
      const eyeball = new THREE.Group();
      eyeRigGroup.add(eyeball);

      const scleraMesh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 24, 24), eyeWhiteMaterial);
      eyeball.add(scleraMesh);

      const irisMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 20), irisMaterial);
      irisMesh.position.set(0, 0, 0.035);
      irisMesh.rotation.x = Math.PI / 2;
      eyeball.add(irisMesh);

      const pupilMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.01, 16), pupilMaterial);
      pupilMesh.position.set(0, 0, 0.036);
      pupilMesh.rotation.x = Math.PI / 2;
      eyeball.add(pupilMesh);

      // Catchlight / Specular Sparkle
      const highlight = new THREE.Mesh(new THREE.SphereGeometry(0.005, 10, 10), eyeHighlightMaterial);
      highlight.position.set(0.006, 0.008, 0.037);
      eyeball.add(highlight);

      // Upper Eyelid for Blinking & Expressions
      const eyelidGeom = new THREE.SphereGeometry(0.041, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const eyelidUpper = new THREE.Mesh(eyelidGeom, skinMaterial);
      eyelidUpper.rotation.x = -Math.PI / 2 + 0.35; // Default resting eyelid position
      eyeRigGroup.add(eyelidUpper);

      // Eyebrow
      const eyebrow = new THREE.Group();
      eyebrow.position.set(sock.x * 0.95, sock.y + 0.06, sock.z + 0.02);
      headPivot.add(eyebrow);

      const browMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.068, 12), eyebrowMaterial);
      browMesh.rotation.z = (sIdx === 0 ? 1 : -1) * 1.45;
      browMesh.rotation.x = 0.2;
      eyebrow.add(browMesh);

      eyeRigs.push({ eyeball, eyelidUpper, eyebrow });
    });

    // 5. FULL BILATERAL ARTICULATED ARM & HAND KINEMATIC RIGS
    interface FingerJoint {
      group: THREE.Group;
      mesh: THREE.Mesh;
    }

    interface ArmRig {
      clavicle: THREE.Group;
      shoulder: THREE.Group;
      elbow: THREE.Group;
      wrist: THREE.Group;
      palm: THREE.Mesh;
      fingers: FingerJoint[];
      thumb: THREE.Group;
    }

    function createArmRig(side: "left" | "right"): ArmRig {
      const isRight = side === "right";
      const sign = isRight ? 1 : -1;

      // Clavicle
      const clavicle = new THREE.Group();
      clavicle.position.set(sign * 0.18, 0.24, 0);
      chestGroup.add(clavicle);

      // Shoulder pivot
      const shoulder = new THREE.Group();
      clavicle.add(shoulder);

      // Upper arm in hoodie sleeve
      const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.22, 16), hoodieMaterial);
      upperArm.position.set(0, -0.11, 0);
      shoulder.add(upperArm);

      // Elbow pivot
      const elbow = new THREE.Group();
      elbow.position.set(0, -0.22, 0);
      shoulder.add(elbow);

      // Forearm in hoodie sleeve
      const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.20, 16), hoodieMaterial);
      forearm.position.set(0, -0.10, 0);
      elbow.add(forearm);

      // Wrist & hand pivot
      const wrist = new THREE.Group();
      wrist.position.set(0, -0.20, 0);
      elbow.add(wrist);

      // Palm mesh
      const palm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.068, 0.028), skinMaterial);
      palm.position.set(0, -0.035, 0);
      wrist.add(palm);

      // 4 Articulated fingers with individual knuckle groups for peeking and spread
      const fingers: FingerJoint[] = [];
      for (let f = 0; f < 4; f++) {
        const fingerGroup = new THREE.Group();
        // Index is nearest thumb/center, pinky is outer
        const fingerX = isRight ? -0.022 + f * 0.015 : 0.022 - f * 0.015;
        fingerGroup.position.set(fingerX, -0.068, 0);
        wrist.add(fingerGroup);

        const fingerMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.008, 0.05, 10), skinMaterial);
        fingerMesh.position.set(0, -0.025, 0);
        fingerGroup.add(fingerMesh);

        fingers.push({ group: fingerGroup, mesh: fingerMesh });
      }

      // Thumb
      const thumb = new THREE.Group();
      thumb.position.set(sign * -0.038, -0.042, 0.008);
      thumb.rotation.z = sign * 0.65;
      wrist.add(thumb);

      const thumbMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.009, 0.038, 10), skinMaterial);
      thumbMesh.position.set(0, -0.019, 0);
      thumb.add(thumbMesh);

      return { clavicle, shoulder, elbow, wrist, palm, fingers, thumb };
    }

    const armRigL = createArmRig("left");
    const armRigR = createArmRig("right");

    // Kinematic Joint Rotational Targets for Poses
    const restArmR = {
      shoulderX: 0.10,
      shoulderY: 0.00,
      shoulderZ: -0.25,
      elbowX: 0.35,
      elbowZ: 0.10,
      wristX: 0.00,
      wristY: 0.00,
      wristZ: 0.00,
    };

    const restArmL = {
      shoulderX: 0.10,
      shoulderY: 0.00,
      shoulderZ: 0.25,
      elbowX: 0.35,
      elbowZ: -0.10,
      wristX: 0.00,
      wristY: 0.00,
      wristZ: 0.00,
    };

    // Covering Eyes Pose: Both hands rise in front of face, palms inwards, fingers upwards over eyes
    const coverArmR = {
      shoulderX: -1.70,
      shoulderY: -1.30,
      shoulderZ: 0.40,
      elbowX: -1.00,
      elbowZ: 0.60,
      wristX: 0.15,
      wristY: -0.20,
      wristZ: 0.10,
    };

    const coverArmL = {
      shoulderX: -1.70,
      shoulderY: 1.30,
      shoulderZ: -0.40,
      elbowX: -1.00,
      elbowZ: -0.60,
      wristX: 0.15,
      wristY: 0.20,
      wristZ: -0.10,
    };

    // Peek Pose: Left arm shifts slightly, index & middle fingers separate to reveal the left eye
    const peekArmL = {
      shoulderX: -1.62,
      shoulderY: 1.24,
      shoulderZ: -0.28,
      elbowX: -1.20,
      elbowZ: -0.80,
      wristX: 0.10,
      wristY: 0.15,
      wristZ: -0.05,
    };

    // Initialize arms at resting posture
    armRigR.shoulder.rotation.set(restArmR.shoulderX, restArmR.shoulderY, restArmR.shoulderZ);
    armRigR.elbow.rotation.set(restArmR.elbowX, 0, restArmR.elbowZ);
    armRigL.shoulder.rotation.set(restArmL.shoulderX, restArmL.shoulderY, restArmL.shoulderZ);
    armRigL.elbow.rotation.set(restArmL.elbowX, 0, restArmL.elbowZ);

    setIsLoaded(true);

    // 6. Kinematic State Engine
    const startTime = performance.now();
    let lastTime = startTime;

    // Greeting Wave sequence starts automatically on mount (unless interrupted by password focus)
    let greetingActive = !prefersReduced;
    let greetingTime = 0;
    const GREETING_DURATION = 3.2;

    // Natural Irregular Blinking Tracker
    let nextBlinkTime = 1.5;
    let isBlinking = false;
    let blinkStartTime = 0;

    // Smooth Continuous Interpolation Values (Zero-snap Guarantee)
    const curArmR = { ...restArmR };
    const curArmL = { ...restArmL };
    const curFingersL = [
      { z: 0, x: 0 },
      { z: 0, x: 0 },
      { z: 0, x: 0 },
      { z: 0, x: 0 },
    ];

    let curHeadRotY = 0;
    let curHeadRotX = 0;
    let curHeadRotZ = 0;
    let curEyeX = 0;
    let curEyeY = 0;
    let curEyelidL = -Math.PI / 2 + 0.35;
    let curEyelidR = -Math.PI / 2 + 0.35;
    let curBrowTiltL = 0;
    let curBrowTiltR = 0;
    let curBlushOpacity = 0;
    let curSmileScale = 1;

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 7. 60 FPS Continuous Render & Animation Loop
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const now = performance.now();
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      const totalTime = (now - startTime) / 1000;

      const { isPasswordFocused, isPasswordVisible, isEmailFocused, pointer } = animStateRef.current;
      const isPasswordActive = isPasswordFocused || (isPasswordVisible && !isEmailFocused);

      // When the user focuses password field or toggles password visibility, blend from greeting into gesture
      if (isPasswordActive && greetingActive) {
        greetingActive = false;
      }

      // Natural Breathing Kinematics
      const breath = Math.sin(totalTime * 2.0) * 0.012;
      chestGroup.position.y = breath;

      // Natural Irregular Blinking Logic (suppressed during peek/cover when eyes are held)
      if (totalTime >= nextBlinkTime && !isBlinking && !isPasswordActive) {
        isBlinking = true;
        blinkStartTime = totalTime;
        nextBlinkTime = totalTime + 2.8 + Math.random() * 2.2;
      }

      let blinkProgress = 0;
      if (isBlinking) {
        const bTime = totalTime - blinkStartTime;
        if (bTime < 0.22) {
          blinkProgress = Math.sin((bTime / 0.22) * Math.PI);
        } else {
          isBlinking = false;
        }
      }

      // Determine Target Posture and Gestures
      let targetArmR = { ...restArmR };
      let targetArmL = { ...restArmL };
      let targetFingerL0_Z = 0;
      let targetFingerL0_X = 0;
      let targetFingerL1_Z = 0;
      let targetFingerL1_X = 0;
      let targetFingerL2_Z = 0;
      let targetFingerL2_X = 0;
      let targetFingerL3_Z = 0;
      let targetFingerL3_X = 0;

      let targetHeadX = 0;
      let targetHeadY = 0;
      let targetHeadZ = 0;
      let targetEyeX = 0;
      let targetEyeY = 0;
      let targetEyelidBaseL = -Math.PI / 2 + 0.35;
      let targetEyelidBaseR = -Math.PI / 2 + 0.35;
      let targetBlush = 0;
      let targetBrowTiltL = 0;
      let targetBrowTiltR = 0;
      let targetSmileScale = 1.0;

      if (isPasswordActive) {
        if (isPasswordVisible) {
          // --- GESTURE 2: SHOW PASSWORD ENABLED — FUNNY PEEK THROUGH FINGERS ---
          // Left hand creates peek aperture right in front of the left eye
          targetArmR = coverArmR;
          targetArmL = peekArmL;

          // Fingers split open: index spreads inward, middle spreads outward creating a clear eye window
          targetFingerL0_Z = 0.45;
          targetFingerL0_X = -0.18;
          targetFingerL1_Z = -0.45;
          targetFingerL1_X = -0.18;
          targetFingerL2_Z = -0.22;
          targetFingerL2_X = -0.06;
          targetFingerL3_Z = -0.10;
          targetFingerL3_X = 0.00;

          // Curious, humorous head tilt towards the password form on the left
          targetHeadX = -0.04;
          targetHeadY = -0.16;
          targetHeadZ = 0.07;

          // One-eye peek: Left eye opens wide and peeks through the gap directly at the password field!
          targetEyelidBaseL = -Math.PI / 2 + 0.06; // Wide curious eye
          targetEyelidBaseR = -Math.PI / 2 + 0.54; // Right eye stays shyly covered behind right hand

          // Glances through the gap directly toward the password input on the left
          targetEyeX = -0.25;
          targetEyeY = -0.06;

          // Left eyebrow arches high with curiosity, right eyebrow stays relaxed/shy
          targetBrowTiltL = 0.28;
          targetBrowTiltR = -0.05;

          // Playful blush & charming mischievous half-smirk
          targetBlush = 0.48;
          targetSmileScale = 1.22;
        } else {
          // --- GESTURE 1 & 3: PASSWORD FOCUSED / HIDDEN — COVERS BOTH EYES ---
          // Both hands rise smoothly and cover both eyes
          targetArmR = coverArmR;
          targetArmL = coverArmL;

          // Fingers rest together closed over eyes
          targetFingerL0_Z = 0;
          targetFingerL0_X = 0;
          targetFingerL1_Z = 0;
          targetFingerL1_X = 0;
          targetFingerL2_Z = 0;
          targetFingerL2_X = 0;
          targetFingerL3_Z = 0;
          targetFingerL3_X = 0;

          // Shy, polite posture: turns slightly away and tilts down
          targetHeadX = -0.12;
          targetHeadY = -0.20;
          targetHeadZ = -0.06;

          // Both eyes closed / squinted playfully behind the hands
          targetEyelidBaseL = -Math.PI / 2 + 0.52;
          targetEyelidBaseR = -Math.PI / 2 + 0.52;

          targetEyeX = -0.18;
          targetEyeY = -0.12;

          // Shy soft blush on cheeks & cute half-smile
          targetBlush = 0.65;
          targetBrowTiltL = -0.14;
          targetBrowTiltR = -0.14;
          targetSmileScale = 0.95;
        }
      } else if (isEmailFocused) {
        // Attentive posture looking down toward the email input
        targetArmR = restArmR;
        targetArmL = restArmL;
        targetHeadX = -0.08;
        targetHeadY = -0.12;
        targetHeadZ = 0;
        targetEyeX = -0.14;
        targetEyeY = -0.08;
        targetEyelidBaseL = -Math.PI / 2 + 0.32;
        targetEyelidBaseR = -Math.PI / 2 + 0.32;
        targetBlush = 0;
        targetSmileScale = 1.05;
      } else if (greetingActive && !prefersReduced) {
        // --- INITIAL GREETING WAVE (First 3.2s on page mount) ---
        greetingTime += delta;

        if (greetingTime < 0.6) {
          const p = easeOutCubic(greetingTime / 0.6);
          targetArmR.shoulderX = THREE.MathUtils.lerp(restArmR.shoulderX, -0.45, p);
          targetArmR.shoulderZ = THREE.MathUtils.lerp(restArmR.shoulderZ, 1.48, p);
          targetArmR.shoulderY = THREE.MathUtils.lerp(restArmR.shoulderY, 0.35, p);
          targetArmR.elbowX = THREE.MathUtils.lerp(restArmR.elbowX, 1.55, p);
          targetArmR.elbowZ = THREE.MathUtils.lerp(restArmR.elbowZ, 0.45, p);

          targetHeadY = Math.sin(p * Math.PI * 0.5) * 0.08;
          targetSmileScale = THREE.MathUtils.lerp(1, 1.25, p);
        } else if (greetingTime < 2.5) {
          const wavePhase = (greetingTime - 0.6) * 9.0;
          const waveAngle = Math.sin(wavePhase) * 0.32;

          targetArmR.shoulderX = -0.45 + Math.sin(wavePhase * 0.5) * 0.04;
          targetArmR.shoulderZ = 1.48;
          targetArmR.shoulderY = 0.35;
          targetArmR.elbowX = 1.55 + Math.sin(wavePhase * 0.5) * 0.05;
          targetArmR.elbowZ = 0.45;
          targetArmR.wristZ = waveAngle;
          targetArmR.wristX = -0.15 + Math.sin(wavePhase * 0.5) * 0.08;

          targetHeadZ = Math.sin(wavePhase * 0.5) * 0.04;
          targetSmileScale = 1.28;
        } else if (greetingTime < GREETING_DURATION) {
          const p = easeInOutCubic((greetingTime - 2.5) / (GREETING_DURATION - 2.5));
          targetArmR.shoulderX = THREE.MathUtils.lerp(-0.45, restArmR.shoulderX, p);
          targetArmR.shoulderZ = THREE.MathUtils.lerp(1.48, restArmR.shoulderZ, p);
          targetArmR.shoulderY = THREE.MathUtils.lerp(0.35, restArmR.shoulderY, p);
          targetArmR.elbowX = THREE.MathUtils.lerp(1.55, restArmR.elbowX, p);
          targetArmR.elbowZ = THREE.MathUtils.lerp(0.45, restArmR.elbowZ, p);
          targetArmR.wristZ = THREE.MathUtils.lerp(targetArmR.wristZ, restArmR.wristZ, p);

          targetHeadZ = THREE.MathUtils.lerp(targetHeadZ, 0, p);
          targetSmileScale = THREE.MathUtils.lerp(1.28, 1.0, p);
        } else {
          greetingActive = false;
        }
      } else if (pointer && !prefersReduced) {
        // --- INTERACTIVE POINTER EYE TRACKING (Default Idle) ---
        targetArmR = restArmR;
        targetArmL = restArmL;
        targetEyeX = pointer.x * 0.22;
        targetEyeY = pointer.y * 0.16;
        targetHeadY = pointer.x * 0.12;
        targetHeadX = -pointer.y * 0.09;
        targetEyelidBaseL = -Math.PI / 2 + 0.35;
        targetEyelidBaseR = -Math.PI / 2 + 0.35;
        targetBlush = 0;
        targetSmileScale = 1.0;
      } else {
        // Neutral Relaxed Idle
        targetArmR = restArmR;
        targetArmL = restArmL;
        targetHeadX = 0;
        targetHeadY = 0;
        targetEyeX = 0;
        targetEyeY = 0;
        targetEyelidBaseL = -Math.PI / 2 + 0.35;
        targetEyelidBaseR = -Math.PI / 2 + 0.35;
        targetBlush = 0;
        targetSmileScale = 1.0;
      }

      // Smooth, Framerate-Independent Damping (Zero Snapping & Fluid Transitions)
      // Main hand raising / lowering targets ~600-750ms
      const armRate = 6.2;
      const fingerRate = 8.0;
      const facialRate = 8.5;
      const headRate = 5.5;

      const lerpVal = (cur: number, target: number, rate: number) =>
        cur + (target - cur) * (1 - Math.exp(-rate * delta));

      // Interpolate Right Arm
      curArmR.shoulderX = lerpVal(curArmR.shoulderX, targetArmR.shoulderX, armRate);
      curArmR.shoulderY = lerpVal(curArmR.shoulderY, targetArmR.shoulderY, armRate);
      curArmR.shoulderZ = lerpVal(curArmR.shoulderZ, targetArmR.shoulderZ, armRate);
      curArmR.elbowX = lerpVal(curArmR.elbowX, targetArmR.elbowX, armRate);
      curArmR.elbowZ = lerpVal(curArmR.elbowZ, targetArmR.elbowZ, armRate);
      curArmR.wristX = lerpVal(curArmR.wristX, targetArmR.wristX, armRate);
      curArmR.wristY = lerpVal(curArmR.wristY, targetArmR.wristY, armRate);
      curArmR.wristZ = lerpVal(curArmR.wristZ, targetArmR.wristZ, armRate);

      armRigR.shoulder.rotation.set(curArmR.shoulderX, curArmR.shoulderY, curArmR.shoulderZ);
      armRigR.elbow.rotation.set(curArmR.elbowX, 0, curArmR.elbowZ);
      armRigR.wrist.rotation.set(curArmR.wristX, curArmR.wristY, curArmR.wristZ);

      // Interpolate Left Arm
      curArmL.shoulderX = lerpVal(curArmL.shoulderX, targetArmL.shoulderX, armRate);
      curArmL.shoulderY = lerpVal(curArmL.shoulderY, targetArmL.shoulderY, armRate);
      curArmL.shoulderZ = lerpVal(curArmL.shoulderZ, targetArmL.shoulderZ, armRate);
      curArmL.elbowX = lerpVal(curArmL.elbowX, targetArmL.elbowX, armRate);
      curArmL.elbowZ = lerpVal(curArmL.elbowZ, targetArmL.elbowZ, armRate);
      curArmL.wristX = lerpVal(curArmL.wristX, targetArmL.wristX, armRate);
      curArmL.wristY = lerpVal(curArmL.wristY, targetArmL.wristY, armRate);
      curArmL.wristZ = lerpVal(curArmL.wristZ, targetArmL.wristZ, armRate);

      armRigL.shoulder.rotation.set(curArmL.shoulderX, curArmL.shoulderY, curArmL.shoulderZ);
      armRigL.elbow.rotation.set(curArmL.elbowX, 0, curArmL.elbowZ);
      armRigL.wrist.rotation.set(curArmL.wristX, curArmL.wristY, curArmL.wristZ);

      // Interpolate Left Hand Fingers (for peek aperture)
      curFingersL[0].z = lerpVal(curFingersL[0].z, targetFingerL0_Z, fingerRate);
      curFingersL[0].x = lerpVal(curFingersL[0].x, targetFingerL0_X, fingerRate);
      curFingersL[1].z = lerpVal(curFingersL[1].z, targetFingerL1_Z, fingerRate);
      curFingersL[1].x = lerpVal(curFingersL[1].x, targetFingerL1_X, fingerRate);
      curFingersL[2].z = lerpVal(curFingersL[2].z, targetFingerL2_Z, fingerRate);
      curFingersL[2].x = lerpVal(curFingersL[2].x, targetFingerL2_X, fingerRate);
      curFingersL[3].z = lerpVal(curFingersL[3].z, targetFingerL3_Z, fingerRate);
      curFingersL[3].x = lerpVal(curFingersL[3].x, targetFingerL3_X, fingerRate);

      armRigL.fingers.forEach((f, idx) => {
        f.group.rotation.z = curFingersL[idx].z;
        f.group.rotation.x = curFingersL[idx].x;
      });

      // Right Hand Fingers stay naturally closed
      armRigR.fingers.forEach((f) => {
        f.group.rotation.z = 0;
        f.group.rotation.x = 0;
      });

      // Interpolate Head Rotation
      curHeadRotX = lerpVal(curHeadRotX, targetHeadX, headRate);
      curHeadRotY = lerpVal(curHeadRotY, targetHeadY, headRate);
      curHeadRotZ = lerpVal(curHeadRotZ, targetHeadZ, headRate);
      headPivot.rotation.set(curHeadRotX, curHeadRotY, curHeadRotZ);

      // Interpolate Eyes (Direction, Eyelids, Eyebrows)
      curEyeX = lerpVal(curEyeX, targetEyeX, facialRate);
      curEyeY = lerpVal(curEyeY, targetEyeY, facialRate);

      const blinkOffset = blinkProgress * 0.75;
      curEyelidL = lerpVal(curEyelidL, targetEyelidBaseL + blinkOffset, facialRate);
      curEyelidR = lerpVal(curEyelidR, targetEyelidBaseR + blinkOffset, facialRate);

      curBrowTiltL = lerpVal(curBrowTiltL, targetBrowTiltL, facialRate);
      curBrowTiltR = lerpVal(curBrowTiltR, targetBrowTiltR, facialRate);

      // Apply to Eye Rigs
      eyeRigs.forEach((rig, idx) => {
        rig.eyeball.rotation.y = curEyeX;
        rig.eyeball.rotation.x = curEyeY;

        rig.eyelidUpper.rotation.x = idx === 0 ? curEyelidL : curEyelidR;

        const browTilt = idx === 0 ? curBrowTiltL : curBrowTiltR;
        rig.eyebrow.position.y = 0.195 + 0.06 + (browTilt > 0 ? browTilt * 0.05 : browTilt * 0.02);
        rig.eyebrow.rotation.z = (idx === 0 ? 1 : -1) * (1.45 + browTilt);
      });

      // Interpolate Blush & Smile
      curBlushOpacity = lerpVal(curBlushOpacity, targetBlush, headRate);
      blushMaterial.opacity = curBlushOpacity;

      curSmileScale = lerpVal(curSmileScale, targetSmileScale, facialRate);
      mouthPivot.scale.set(curSmileScale, curSmileScale, 1);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [prefersReduced]);

  return (
    <div className={`relative h-full w-full select-none ${className}`}>
      {/* 3D Canvas Mounting Viewport */}
      <div ref={containerRef} className="h-full w-full min-h-[380px] sm:min-h-[420px] lg:min-h-[460px]" />

      {/* Elegant Loading Skeleton until 3D Canvas is Initialized */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-sb-cyan border-t-transparent" />
        </div>
      )}
    </div>
  );
}

// Easing Functions
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
