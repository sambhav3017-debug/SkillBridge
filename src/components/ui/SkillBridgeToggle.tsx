"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface SkillBridgeToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  id?: string;
  value?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  className?: string;
  accent?: "cyan" | "pink" | "purple" | "green" | "blue";
  title?: string;
}

export function SkillBridgeToggle({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  disabled = false,
  name,
  id,
  value,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  className = "",
  accent = "cyan",
  title,
}: SkillBridgeToggleProps) {
  const isControlled = controlledChecked !== undefined;
  const [internalChecked, setInternalChecked] = useState(
    isControlled ? controlledChecked : defaultChecked
  );
  const [isInit, setIsInit] = useState(false);
  const lastCheckedRef = useRef(isControlled ? controlledChecked : defaultChecked);

  const isCurrentChecked = isControlled ? controlledChecked : internalChecked;

  // Track initial mount so we don't trigger the "off" bounce keyframe on page load
  useEffect(() => {
    if (isControlled && controlledChecked !== lastCheckedRef.current) {
      setIsInit(true);
      lastCheckedRef.current = controlledChecked;
    }
  }, [isControlled, controlledChecked]);

  const handleToggle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      e.stopPropagation();

      setIsInit(true);
      const nextChecked = !isCurrentChecked;

      if (!isControlled) {
        setInternalChecked(nextChecked);
      }
      lastCheckedRef.current = nextChecked;
      onChange?.(nextChecked);
    },
    [disabled, isCurrentChecked, isControlled, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleToggle(e);
      }
    },
    [disabled, handleToggle]
  );

  return (
    <button
      type="button"
      role="switch"
      id={id}
      name={name}
      value={value}
      aria-checked={Boolean(isCurrentChecked)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      disabled={disabled}
      title={title || ariaLabel}
      data-on={isCurrentChecked ? "true" : "false"}
      data-accent={accent}
      tabIndex={disabled ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`p27-toggle t-toggle ${isInit ? "is-init" : ""} ${className}`.trim()}
    >
      <span className="p27-thumb t-toggle-thumb" aria-hidden="true" />
    </button>
  );
}

export default SkillBridgeToggle;
