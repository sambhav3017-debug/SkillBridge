"use client";

import React, { useEffect, useRef, useState, useId } from "react";

// Transitions.dev Spinning Counter mathematical physics constants
const STEP = (50 * Math.PI) / 180; // drum angle between two digits
const ENTER_MS = 120;              // rest to rolling
const FADE_END = 1.8;              // steps from the middle where a digit is gone
const LAND_AT = 0.6;               // steps from the middle where the target starts landing
const ARRIVE_AT = 0.29;            // share of the spring where it reaches the middle
const CLEAR_MS = 200;              // blur + neighbours clearing at the start of the spring

function token(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isNaN(v) ? fallback : v;
}

function length(el: HTMLElement, name: string, fallbackEm: number): number {
  if (typeof window === "undefined" || !el) return fallbackEm * 24;
  try {
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;width:var(${name})`;
    el.appendChild(probe);
    const px = probe.getBoundingClientRect().width;
    probe.remove();
    return px || fallbackEm * (parseFloat(getComputedStyle(el).fontSize) || 24);
  } catch {
    return fallbackEm * 24;
  }
}

function bezier([x1, y1, x2, y2]: number[]) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) * (1 - t) + 3 * b * t * t * (1 - t) + t * t * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0,
      hi = 1,
      t = x;
    for (let i = 0; i < 20; i++) {
      if (at(x1, x2, t) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return at(y1, y2, t);
  };
}

function smooth(x: number) {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
}

// Damped wave: starts at 1, crosses 0, swings negative (the bounce), ends at 0.
function wave(s: number) {
  return s >= 1 ? 0 : Math.exp(-3 * s) * Math.cos(3 * Math.PI * s) * (1 - s);
}

const WAVE_TROUGH = (() => {
  let low = 0;
  for (let i = 1; i < 400; i++) low = Math.min(low, wave(i / 400));
  return -low || 0.1;
})();

interface ColumnData {
  colEl: HTMLElement;
  cells: HTMLElement[];
  digit: number;
  from: number;
  done?: boolean;
  landAt?: number;
  landFrom?: { scale: number; back: number };
}

function rest(col: ColumnData, digit: number) {
  col.cells.forEach((cell, d) => {
    cell.style.transform = "none";
    cell.style.filter = "none";
    cell.style.zIndex = "";
    cell.style.opacity = d === digit ? "1" : "0";
  });
}

function look(dist: number, middle: number, o: any) {
  const angle = Math.min(dist * STEP, Math.PI / 2);
  const face = (Math.cos(angle) - Math.cos(STEP)) / (1 - Math.cos(STEP));
  return {
    angle,
    scale: o.sideScale + (middle - o.sideScale) * face,
    back:
      dist <= 1
        ? 1 + (o.sideOpacity - 1) * dist
        : o.sideOpacity * (1 - (dist - 1) / (FADE_END - 1)),
  };
}

function place(col: ColumnData, pos: number, spread: number, middle: number, o: any, land: any) {
  const radius = o.offset / Math.sin(STEP);
  col.cells.forEach((cell, d) => {
    let p = (((d - pos) % 10) + 10) % 10;
    if (p > 5) p -= 10;
    const dist = Math.abs(p);
    if (dist >= FADE_END) {
      cell.style.opacity = "0";
      return;
    }
    const l = look(dist, middle, o);
    let y = (p < 0 ? 1 : -1) * radius * Math.sin(l.angle);
    const blur = (o.centerBlur + (o.sideBlur - o.centerBlur) * Math.min(dist, 1)) * spread;
    const away = Math.max(0, Math.min(1, (dist - 0.3) / 0.5));
    let opacity = l.back * (1 - (1 - spread) * away);
    let scale = l.scale;
    let z = 100 - Math.round(dist * 10);
    if (land && d === col.digit) {
      y = y * land.arrive + land.lift;
      scale = land.scale;
      opacity = land.opacity;
      z = 200;
    }
    cell.style.transform = `translateY(${y.toFixed(2)}px) scale(${scale.toFixed(4)})`;
    cell.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : "none";
    cell.style.opacity = opacity.toFixed(3);
    cell.style.zIndex = String(z);
  });
}

export interface SpinningCounterProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
  autoFormat?: boolean;
}

/**
 * Formats a raw value into a string with optional prefix/suffix, thousands separators, and decimals.
 */
export function formatCounterString(
  value: number | string,
  prefix = "",
  suffix = "",
  decimals?: number,
  autoFormat = true
): string {
  let numStr = "";
  if (typeof value === "number") {
    if (decimals !== undefined) {
      numStr = autoFormat
        ? value.toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : value.toFixed(decimals);
    } else {
      numStr = autoFormat ? value.toLocaleString("en-US") : String(value);
    }
  } else {
    numStr = String(value);
  }
  return `${prefix}${numStr}${suffix}`;
}

export function SpinningCounter({
  value,
  prefix = "",
  suffix = "",
  className = "",
  decimals,
  autoFormat = true,
}: SpinningCounterProps) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const formattedStr = formatCounterString(value, prefix, suffix, decimals, autoFormat);
  const prevStrRef = useRef<string>("");
  const isMountedRef = useRef(false);
  const cancelAnimRef = useRef<(() => void) | null>(null);

  // Parse characters into structured representation
  const items = Array.from(formattedStr);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fromStr = prevStrRef.current || (isMountedRef.current ? formattedStr : "");
    prevStrRef.current = formattedStr;

    if (cancelAnimRef.current) {
      cancelAnimRef.current();
      cancelAnimRef.current = null;
    }

    if (prefersReducedMotion) {
      // Just ensure digits are in rest position immediately
      return;
    }

    const css = getComputedStyle(document.documentElement);
    const m = css.getPropertyValue("--reel-ease").match(/cubic-bezier\(([^)]+)\)/);
    const o = {
      stepDur: token("--reel-step-dur", 130),
      stagger: token("--reel-stagger", 90),
      ease: bezier(m ? m[1].split(",").map(parseFloat) : [0.35, -0.02, 0.43, 1]),
      offset: length(el, "--reel-side-offset", 0.52),
      sideScale: token("--reel-side-scale", 0.7),
      sideBlur: length(el, "--reel-side-blur", 0.083),
      sideOpacity: token("--reel-side-opacity", 0.17),
      centerScale: token("--reel-center-scale", 0.9),
      centerBlur: length(el, "--reel-center-blur", 0.042),
      anticDur: token("--reel-antic-dur", 100),
      anticScale: token("--reel-antic-scale", 0.94),
      anticLift: length(el, "--reel-antic-lift", 0.125),
      landDur: token("--reel-land-dur", 740),
      landPeak: token("--reel-land-peak", 1.03),
    };

    // Find all digit column elements
    const colEls = Array.from(el.querySelectorAll<HTMLElement>(".t-reel-col"));
    const cols: ColumnData[] = [];

    colEls.forEach((colEl) => {
      const targetDigit = parseInt(colEl.getAttribute("data-target-digit") || "0", 10);
      const cells = Array.from(colEl.querySelectorAll<HTMLElement>(".t-reel-digit"));
      cols.push({
        colEl,
        cells,
        digit: targetDigit,
        from: 0,
      });
    });

    if (cols.length === 0) return;

    // Determine starting digits from fromStr (extract only digits)
    const fromDigitsRaw = fromStr.replace(/\D/g, "");
    const toDigitsRaw = formattedStr.replace(/\D/g, "");

    let fromDigitsPadded = "";
    if (fromDigitsRaw.length > 0) {
      fromDigitsPadded = fromDigitsRaw.padStart(cols.length, "0").slice(-cols.length);
    } else {
      // If first spin, start from 0
      fromDigitsPadded = "".padStart(cols.length, "0");
    }

    cols.forEach((c, i) => {
      c.from = parseInt(fromDigitsPadded[i] || "0", 10);
      rest(c, c.from);
      if (c.from === c.digit && isMountedRef.current) {
        c.done = true; // Digit hasn't changed
      }
    });

    // Check if element is in viewport or needs IntersectionObserver
    let observer: IntersectionObserver | null = null;
    let hasStarted = false;

    const startRoll = () => {
      if (hasStarted) return;
      hasStarted = true;

      const t0 = performance.now();
      let raf = 0;

      const tick = () => {
        const t = performance.now() - t0;
        let running = false;

        cols.forEach((c, i) => {
          if (c.done) return;
          const local = t - i * o.stagger;
          if (local <= 0) {
            running = true;
            return;
          }
          const total = (c.digit - c.from + 10) % 10 || 10;
          const pos = c.from + total * o.ease(local / (total * o.stepDur));
          const enter = Math.min(1, local / ENTER_MS);

          if (c.landAt === undefined && c.from + total - pos < LAND_AT) {
            c.landAt = t;
          }
          const since = c.landAt === undefined ? -1 : t - c.landAt;

          if (since >= o.anticDur + o.landDur) {
            rest(c, c.digit);
            c.done = true;
            return;
          }

          running = true;
          const middle = 1 + (o.centerScale - 1) * enter;
          let spread = enter;
          let land: any = null;

          if (since >= 0) {
            if (!c.landFrom) c.landFrom = look(c.from + total - pos, middle, o);
            const arrive = 1 - smooth(since / (o.anticDur + o.landDur * ARRIVE_AT));

            if (since < o.anticDur) {
              const a = smooth(since / o.anticDur);
              land = {
                scale: c.landFrom.scale + (o.anticScale - c.landFrom.scale) * a,
                lift: -o.anticLift * a,
                opacity: c.landFrom.back + (1 - c.landFrom.back) * a,
                arrive,
              };
            } else {
              const sp = since - o.anticDur;
              const sn = sp / o.landDur;
              const w = wave(sn);
              land = {
                scale:
                  sn < 1 / 6
                    ? 1 + (o.anticScale - 1) * w
                    : 1 - ((o.landPeak - 1) * w) / WAVE_TROUGH,
                lift: -o.anticLift * w,
                opacity: 1,
                arrive,
              };
              spread = 1 - Math.min(1, sp / CLEAR_MS);
            }
          }

          place(c, pos, spread, middle, o, land);
        });

        if (running) {
          raf = requestAnimationFrame(tick);
        } else {
          // All done: ensure all columns rest at final target digit
          cols.forEach((c) => rest(c, c.digit));
        }
      };

      tick();

      cancelAnimRef.current = () => {
        cancelAnimationFrame(raf);
        cols.forEach((c) => rest(c, c.digit));
      };
    };

    // Use IntersectionObserver so offscreen counters don't animate until visible
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startRoll();
              observer?.disconnect();
            }
          });
        },
        { threshold: 0.1, rootMargin: "60px" }
      );
      observer.observe(el);
    } else {
      startRoll();
    }

    isMountedRef.current = true;

    return () => {
      if (observer) observer.disconnect();
      if (cancelAnimRef.current) {
        cancelAnimRef.current();
        cancelAnimRef.current = null;
      }
    };
  }, [formattedStr]);

  return (
    <span
      ref={containerRef}
      className={`t-reel select-none ${className}`}
      role="text"
      aria-label={formattedStr}
    >
      {items.map((char, index) => {
        const isDigit = char >= "0" && char <= "9";

        if (isDigit) {
          const targetDigit = parseInt(char, 10);
          return (
            <span
              key={`col-${index}`}
              className="t-reel-col"
              data-target-digit={targetDigit}
              aria-hidden="true"
            >
              <span className="t-reel-sizer">0</span>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <span
                  key={digit}
                  className="t-reel-digit"
                  style={{
                    opacity: digit === targetDigit ? 1 : 0,
                  }}
                >
                  {digit}
                </span>
              ))}
            </span>
          );
        }

        return (
          <span key={`sep-${index}`} className="t-reel-sep" aria-hidden="true">
            {char}
          </span>
        );
      })}
    </span>
  );
}

export default SpinningCounter;
