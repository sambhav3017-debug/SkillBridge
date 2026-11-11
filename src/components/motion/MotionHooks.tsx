"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

function subscribeMedia(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getMediaSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getMediaServerSnapshot() {
  return false;
}

/** Checks if the user prefers reduced motion (React 19 strict compliant) */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeMedia, getMediaSnapshot, getMediaServerSnapshot);
}

/** Observes when an element enters the viewport with IntersectionObserver */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit,
  triggerOnce = true,
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  const threshold = options?.threshold ?? 0.01;
  const rootMargin = options?.rootMargin ?? "120px 0px 120px 0px";
  const root = options?.root;

  useEffect(() => {
    if (inView && triggerOnce) return;

    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    // Immediate check if element is already intersecting or near viewport
    try {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top <= vh + 100 && rect.bottom >= -100) {
        setInView(true);
        if (triggerOnce) return;
      }
    } catch {
      // fallback
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (triggerOnce) observer.disconnect();
        } else if (!triggerOnce) {
          setInView(false);
        }
      },
      { threshold, rootMargin, root },
    );

    observer.observe(el);

    // Fail-safe: if after 800ms the element hasn't triggered, check position or reveal
    const timer = setTimeout(() => {
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        if (r.top <= vh && r.bottom >= 0) {
          setInView(true);
          if (triggerOnce) observer.disconnect();
        }
      }
    }, 800);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [threshold, rootMargin, root, triggerOnce]);

  return { ref, inView };
}

/** Counts up a numerical metric smoothly when triggered */
export function useCountUp(targetNumber: number, durationMs = 1100, active = true): number {
  const [current, setCurrent] = useState(0);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!active || targetNumber === 0 || reducedMotion) {
      return;
    }

    let startTimestamp: number | null = null;
    let animId: number;

    const step = (now: number) => {
      if (!startTimestamp) startTimestamp = now;
      const progress = Math.min((now - startTimestamp) / durationMs, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.round(ease * targetNumber));

      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [targetNumber, durationMs, active, reducedMotion]);

  if (reducedMotion || !active || targetNumber === 0) {
    return targetNumber;
  }

  return current;
}

/** Subtle 3D tilt / parallax based on mouse movement */
export function useMouseParallax(intensity = 15) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const reducedMotion = usePrefersReducedMotion();

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * intensity;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * intensity;
    setTilt({ x: -y, y: x });
  };

  const onMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return { tilt, onMouseMove, onMouseLeave };
}

/** Smoothly tracks the position and dimensions of an active tab inside a container for sliding glass pills */
export function useSlidingPill(
  containerRef: React.RefObject<HTMLElement | null>,
  activeId: string,
  dataAttr = "data-track-id",
) {
  const [pillStyle, setPillStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updatePill = () => {
      const container = containerRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(`[${dataAttr}="${activeId}"]`);
      if (!target) return;
      setPillStyle({
        left: target.offsetLeft,
        top: target.offsetTop,
        width: target.offsetWidth,
        height: target.offsetHeight,
        opacity: 1,
      });
      setIsReady(true);
    };

    updatePill();
    const timer = setTimeout(updatePill, 60);
    window.addEventListener("resize", updatePill, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updatePill);
    };
  }, [containerRef, activeId, dataAttr]);

  return { pillStyle, isReady };
}

