"use client";

import {
  createContext,
  useContext,
  useCallback,
  useSyncExternalStore,
  useRef,
  useEffect,
} from "react";

export type Theme = "dark" | "light";
export type ThemeMode = "dark" | "light" | "system";

export interface ThemeOrigin {
  x: number;
  y: number;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: (origin?: ThemeOrigin | React.MouseEvent | HTMLElement) => void;
  setTheme: (t: Theme, origin?: ThemeOrigin) => void;
  setThemeMode: (m: ThemeMode, origin?: ThemeOrigin) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (
        m.type === "attributes" &&
        (m.attributeName === "data-theme" || m.attributeName === "class")
      ) {
        callback();
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "class"],
  });

  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
  const mediaListener = () => callback();
  mediaQuery.addEventListener("change", mediaListener);

  const storageListener = (e: StorageEvent) => {
    if (
      e.key === "skillbridge-theme" ||
      e.key === "skillbridge-theme-mode"
    ) {
      callback();
    }
  };
  window.addEventListener("storage", storageListener);

  return () => {
    observer.disconnect();
    mediaQuery.removeEventListener("change", mediaListener);
    window.removeEventListener("storage", storageListener);
  };
}

export function getThemeModeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const saved = localStorage.getItem("skillbridge-theme-mode");
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  const legacy = localStorage.getItem("skillbridge-theme");
  if (legacy === "light" || legacy === "dark") return legacy;
  return "dark";
}

function resolveTheme(mode: ThemeMode): Theme {
  if (typeof window === "undefined") return "dark";
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return mode;
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";
  const mode = getThemeModeSnapshot();
  return resolveTheme(mode);
}

function getServerSnapshot(): Theme {
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const themeMode = useSyncExternalStore(
    subscribe,
    getThemeModeSnapshot,
    () => "dark" as ThemeMode
  );
  const isTransitioningRef = useRef(false);

  const applyThemeToDom = useCallback((next: Theme) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("skillbridge-theme", next);
      document.documentElement.dataset.theme = next;
      document.documentElement.classList.toggle("light", next === "light");
      document.cookie = `sb_theme=${next}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // ignore
    }
  }, []);

  const setThemeWithTransition = useCallback(
    (next: Theme, origin?: ThemeOrigin) => {
      if (typeof window === "undefined") return;

      if (isTransitioningRef.current) return;

      const prefersReduced =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (
        prefersReduced ||
        !("startViewTransition" in document) ||
        typeof document.startViewTransition !== "function"
      ) {
        applyThemeToDom(next);
        return;
      }

      isTransitioningRef.current = true;

      const x = origin?.x ?? window.innerWidth / 2;
      const y = origin?.y ?? window.innerHeight / 2;

      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      document.documentElement.style.willChange = "clip-path";
      try {
        const transition = document.startViewTransition(() => {
          applyThemeToDom(next);
        });

        transition.ready
          .then(() => {
            document.documentElement.animate(
              {
                clipPath: [
                  `circle(0px at ${x}px ${y}px)`,
                  `circle(${endRadius}px at ${x}px ${y}px)`,
                ],
              },
              {
                duration: 1000,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                pseudoElement: "::view-transition-new(root)",
                fill: "forwards",
              }
            );
          })
          .catch((err: unknown) => {
            console.warn("View transition ready warning:", err);
          });

        transition.finished
          .catch(() => {})
          .finally(() => {
            document.documentElement.style.willChange = "";
            isTransitioningRef.current = false;
          });
      } catch {
        document.documentElement.style.willChange = "";
        isTransitioningRef.current = false;
        applyThemeToDom(next);
      }
    },
    [applyThemeToDom]
  );

  const setTheme = useCallback(
    (next: Theme, origin?: ThemeOrigin) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem("skillbridge-theme-mode", next);
        localStorage.setItem("skillbridge-theme", next);
        setThemeWithTransition(next, origin);
      } catch {
        // ignore
      }
    },
    [setThemeWithTransition]
  );

  const setThemeMode = useCallback(
    (nextMode: ThemeMode, origin?: ThemeOrigin) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem("skillbridge-theme-mode", nextMode);
        const resolved = resolveTheme(nextMode);
        localStorage.setItem("skillbridge-theme", resolved);
        setThemeWithTransition(resolved, origin);
      } catch {
        // ignore
      }
    },
    [setThemeWithTransition]
  );

  // When in system mode, listen to OS color scheme changes and adapt live
  useEffect(() => {
    if (themeMode !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: light)");
    const handler = () => {
      const resolved = media.matches ? "light" : "dark";
      setThemeWithTransition(resolved);
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [themeMode, setThemeWithTransition]);

  const toggleTheme = useCallback(
    (originArg?: ThemeOrigin | React.MouseEvent | HTMLElement) => {
      let origin: ThemeOrigin | undefined;

      if (originArg) {
        if ("clientX" in originArg && "clientY" in originArg) {
          const mouseEv = originArg as React.MouseEvent;
          if (mouseEv.clientX || mouseEv.clientY) {
            origin = { x: mouseEv.clientX, y: mouseEv.clientY };
          } else if (mouseEv.currentTarget && "getBoundingClientRect" in mouseEv.currentTarget) {
            const rect = (mouseEv.currentTarget as HTMLElement).getBoundingClientRect();
            origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          }
        } else if ("x" in originArg && "y" in originArg) {
          origin = originArg as ThemeOrigin;
        } else if ("getBoundingClientRect" in originArg) {
          const rect = (originArg as HTMLElement).getBoundingClientRect();
          origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
      }

      const nextTheme = theme === "dark" ? "light" : "dark";
      setTheme(nextTheme, origin);
    },
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        toggleTheme,
        setTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: "dark" as Theme,
      themeMode: "dark" as ThemeMode,
      toggleTheme: () => {},
      setTheme: () => {},
      setThemeMode: () => {},
    };
  }
  return ctx;
}
