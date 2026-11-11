"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "./ThemeProvider";
import { SkillBridgeToggle } from "@/components/ui/SkillBridgeToggle";

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function ThemeToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { theme, toggleTheme } = useTheme();
  const mounted = useMounted();

  const isDark = mounted ? theme === "dark" : true;

  const handleToggle = (nextChecked: boolean) => {
    toggleTheme();
  };

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`.trim()}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <SkillBridgeToggle
        checked={isDark}
        onChange={handleToggle}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        accent="cyan"
      />
    </div>
  );
}
