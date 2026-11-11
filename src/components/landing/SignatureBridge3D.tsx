"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import * as THREE from "three";
import { BookOpen, Briefcase, Sparkles } from "lucide-react";
import { usePrefersReducedMotion } from "@/components/motion/MotionHooks";

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")),
    );
  } catch {
    return false;
  }
}

function Tag({
  side,
  icon,
  title,
  text,
  className,
}: {
  side: "blue" | "pink";
  icon: React.ReactNode;
  title: string;
  text: string;
  className: string;
}) {
  const c = side === "blue" ? "#007BA7" : "#D81B7A";
  const darkC = side === "blue" ? "#19b8e6" : "#ff2d95";
  return (
    <div
      className={`pointer-events-none absolute z-20 hidden items-start gap-3 sm:flex ${className} transition-transform duration-500 hover:scale-105`}
    >
      <span
        className="grid h-10 w-10 flex-none place-items-center rounded-full border bg-black/60 shadow-lg backdrop-blur-md light:bg-[#FFFEFC]/95 light:border-[#D6DBE7] light:shadow-[0_6px_18px_rgba(32,37,54,0.08)]"
        style={{ borderColor: darkC, color: darkC, boxShadow: `0 0 18px -4px ${darkC}` }}
      >
        {icon}
      </span>
      <div className="relative rounded-xl px-2.5 py-1 light:bg-[#FFFEFC]/85 light:backdrop-blur-md light:border light:border-[#E5E7EF] light:shadow-sm">
        <p
          className={`text-sm font-bold tracking-tight ${
            side === "blue" ? "text-[#19b8e6] light:text-[#007BA7]" : "text-[#ff2d95] light:text-[#C41D74]"
          }`}
          data-tone={c}
        >
          {title}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-xs text-sb-muted font-medium light:text-[#596579]">{text}</p>
      </div>
    </div>
  );
}

export default function SignatureBridge3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasWebGL] = useState(() => (typeof window !== "undefined" ? checkWebGLSupport() : true));
  const prefersReduced = usePrefersReducedMotion();
  const show3D = !prefersReduced && hasWebGL;

  useEffect(() => {
    if (!show3D) return;

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
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 2.2, 8.5);

    // Dynamic light rigs
    const cyanLight = new THREE.PointLight(0x19b8e6, 3.5, 15);
    cyanLight.position.set(-4, 2, 2);
    scene.add(cyanLight);

    const pinkLight = new THREE.PointLight(0xff2d95, 3.5, 15);
    pinkLight.position.set(4, 2, 2);
    scene.add(pinkLight);

    const centerLight = new THREE.PointLight(0xffffff, 2, 10);
    centerLight.position.set(0, 1.2, 1.5);
    scene.add(centerLight);

    const ambient = new THREE.AmbientLight(0x0a101d, 1.2);
    scene.add(ambient);

    // Root Group for Mouse Parallax
    const bridgeGroup = new THREE.Group();
    scene.add(bridgeGroup);

    // 1. Deck Cables / Roadway Truss
    const deckPointsLeft: THREE.Vector3[] = [];
    const deckPointsRight: THREE.Vector3[] = [];
    const spanSegments = 40;

    for (let i = 0; i <= spanSegments; i++) {
      const t = i / spanSegments;
      const x = (t - 0.5) * 9.5;
      const y = Math.sin(t * Math.PI) * 0.45 - 0.2;
      const z = (t - 0.5) * 0.4;

      if (t <= 0.5) {
        deckPointsLeft.push(new THREE.Vector3(x, y, z));
      } else {
        if (deckPointsLeft.length && deckPointsRight.length === 0) {
          deckPointsRight.push(deckPointsLeft[deckPointsLeft.length - 1]);
        }
        deckPointsRight.push(new THREE.Vector3(x, y, z));
      }
    }

    const curveLeft = new THREE.CatmullRomCurve3(deckPointsLeft);
    const curveRight = new THREE.CatmullRomCurve3(deckPointsRight);

    const tubeGeoLeft = new THREE.TubeGeometry(curveLeft, 28, 0.05, 8, false);
    const tubeGeoRight = new THREE.TubeGeometry(curveRight, 28, 0.05, 8, false);

    const matLeft = new THREE.MeshStandardMaterial({
      color: 0x19b8e6,
      emissive: 0x007ba7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    const matRight = new THREE.MeshStandardMaterial({
      color: 0xff2d95,
      emissive: 0xc2185b,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
    });

    const meshLeft = new THREE.Mesh(tubeGeoLeft, matLeft);
    const meshRight = new THREE.Mesh(tubeGeoRight, matRight);
    bridgeGroup.add(meshLeft);
    bridgeGroup.add(meshRight);

    // 2. High-Tech Arches (Left Cyan, Right Pink)
    const archPointsLeft: THREE.Vector3[] = [];
    const archPointsRight: THREE.Vector3[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = -4.5 + t * 4.5;
      const y = Math.sin(t * Math.PI) * 1.5;
      archPointsLeft.push(new THREE.Vector3(x, y, -0.2));
    }
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = 0.0 + t * 4.5;
      const y = Math.sin(t * Math.PI) * 1.5;
      archPointsRight.push(new THREE.Vector3(x, y, -0.2));
    }

    const archGeoLeft = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(archPointsLeft),
      24,
      0.035,
      6,
      false,
    );
    const archGeoRight = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(archPointsRight),
      24,
      0.035,
      6,
      false,
    );
    bridgeGroup.add(new THREE.Mesh(archGeoLeft, matLeft));
    bridgeGroup.add(new THREE.Mesh(archGeoRight, matRight));

    // 3. Central Convergence Ring Nexus
    const ringGeo = new THREE.TorusGeometry(0.55, 0.04, 16, 40);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x22d3ee,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.9,
    });
    const centerRing = new THREE.Mesh(ringGeo, ringMat);
    centerRing.position.set(0, 0.45, 0);
    bridgeGroup.add(centerRing);

    const innerRingGeo = new THREE.TorusGeometry(0.35, 0.025, 12, 32);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xff2d95,
      emissive: 0xff2d95,
      emissiveIntensity: 2.0,
      roughness: 0.1,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.position.set(0, 0.45, 0);
    bridgeGroup.add(innerRing);

    // 4. Moving Energy Particles (Flowing between Academia and Industry)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const progress = new Float32Array(particleCount);

    const colorCyan = new THREE.Color(0x19b8e6);
    const colorPink = new THREE.Color(0xff2d95);

    for (let i = 0; i < particleCount; i++) {
      progress[i] = Math.random();
      const t = progress[i];
      const x = (t - 0.5) * 9.0;
      const y = Math.sin(t * Math.PI) * 0.45 - 0.15 + (Math.random() - 0.5) * 0.2;
      const z = (Math.random() - 0.5) * 0.4;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const pCol = t < 0.5 ? colorCyan : colorPink;
      colors[i * 3] = pCol.r;
      colors[i * 3 + 1] = pCol.g;
      colors[i * 3 + 2] = pCol.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.085,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.NormalBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    bridgeGroup.add(particles);

    // 5. Interactive Target Tracking
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isVisible = true;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 0.75;
      targetY = y * 0.45;
    };

    window.addEventListener("mousemove", handlePointerMove);

    // Stop animation loop when container scrolls out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    observer.observe(container);

    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Cinematic Intro: Smooth dolly-in from z: 12 to 8.5
    let introProgress = 0;
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const time = performance.now() * 0.001;

      // Intro interpolation
      if (introProgress < 1) {
        introProgress += 0.015;
        const ease = 1 - Math.pow(1 - introProgress, 3);
        camera.position.z = 11.5 - ease * 3.0;
      }

      // Smooth mouse damping
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;

      bridgeGroup.rotation.y = currentX * 0.6 + Math.sin(time * 0.35) * 0.05;
      bridgeGroup.rotation.x = -currentY * 0.4 + 0.08;

      // Rings rotation
      centerRing.rotation.x = time * 0.8;
      centerRing.rotation.y = time * 0.5;
      innerRing.rotation.y = -time * 1.1;
      innerRing.rotation.z = time * 0.9;

      // Update particle positions along flow
      const posAttr = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        progress[i] = (progress[i] + 0.0035) % 1.0;
        const t = progress[i];
        const x = (t - 0.5) * 9.0;
        const y = Math.sin(t * Math.PI) * 0.45 - 0.15;
        posAttr.setX(i, x);
        posAttr.setY(i, y + Math.sin(time * 2 + i) * 0.06);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      cancelAnimationFrame(frameId);

      tubeGeoLeft.dispose();
      tubeGeoRight.dispose();
      archGeoLeft.dispose();
      archGeoRight.dispose();
      ringGeo.dispose();
      innerRingGeo.dispose();
      particleGeo.dispose();
      matLeft.dispose();
      matRight.dispose();
      ringMat.dispose();
      innerRingMat.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [show3D]);

  return (
    <div
      ref={containerRef}
      className="bridge-viewport relative mx-auto aspect-[16/10] w-full select-none overflow-hidden rounded-3xl"
      aria-label="Interactive 3D SkillBridge Convergence Bridge"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute left-[10%] top-[25%] h-[40%] w-[35%] rounded-full bg-sb-cyan/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[25%] h-[40%] w-[35%] rounded-full bg-sb-pink/15 blur-3xl" />

      {show3D ? (
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab active:cursor-grabbing opacity-100 transition-opacity duration-1000"
        />
      ) : (
        <Image
          src="/bridge-hero.jpg"
          alt="A glowing wireframe bridge, blue on the left and pink on the right, meeting in the middle"
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover light:invert light:hue-rotate-180 light:mix-blend-multiply light:opacity-90"
          style={{
            maskImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 50% 50% at 50% 50%, #000 62%, transparent 100%)",
          }}
        />
      )}

      {/* Floating Interactive Badges */}
      <div className="drift pointer-events-none absolute left-1/2 top-[18%] z-20 -translate-x-1/2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3.5 py-1 text-[11px] font-bold tracking-wider backdrop-blur-md shadow-lg light:border-[#D6DBE7] light:bg-[#FFFEFC]/95 light:shadow-[0_6px_20px_rgba(32,37,54,0.08)]">
          <Sparkles size={12} className="text-sb-cyan light:text-[#007BA7]" />
          <span className="text-sb-cyan light:text-[#007BA7]">Skill</span>
          <span className="text-sb-pink light:text-[#D81B7A]">Bridge</span>
          <span className="ml-1 text-[10px] text-white/70 light:text-[#596579]">Convergence</span>
        </span>
        <span className="mx-auto mt-1 block h-6 w-px bg-gradient-to-b from-white/60 to-transparent light:from-[#007BA7]/45" />
        <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_3px_rgba(255,255,255,0.85)] light:bg-[#007BA7] light:shadow-[0_0_10px_2px_rgba(0,123,167,0.45)]" />
      </div>

      <Tag
        side="blue"
        icon={<BookOpen size={17} />}
        title="Academia &amp; Skills"
        text="Verified Students · Projects · Labs"
        className="left-[4%] top-[10%]"
      />
      <Tag
        side="pink"
        icon={<Briefcase size={17} />}
        title="Industry &amp; Careers"
        text="Real Hiring · Jobs · Internships"
        className="right-[3%] top-[10%]"
      />
    </div>
  );
}
