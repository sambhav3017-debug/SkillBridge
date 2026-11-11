"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  portalVariant?: "student" | "academia" | "industry" | "default";
  sizeVariant?: "sm" | "md" | "lg";
  autoFocus?: boolean;
}

/**
 * Apple iOS-inspired Refined Search Field with Transitions.dev Dissolve Remix Integration
 *
 * Design characteristics:
 * - Native iOS continuous squircle curvature (rounded-[10px])
 * - Subtle, understated translucent surface treatments (light: bg-black/[0.04], dark: bg-white/[0.06])
 * - Smooth, natural focus states with hairline borders and soft depth
 * - Apple-style minimal circular clear button with tactile active scale
 * - Preserves exact Transitions.dev Dissolve Clear animation (1000ms lifecycle)
 * - Retains full keyboard accessibility (Escape clear, forwardRef, autoFocus)
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = "Search...",
      className = "",
      inputClassName = "",
      iconClassName = "",
      portalVariant = "default",
      sizeVariant = "md",
      autoFocus = false,
      disabled = false,
      id,
      name,
      onKeyDown,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef
  ) => {
    const internalInputRef = useRef<HTMLInputElement>(null);
    const inputRef = (forwardedRef as React.RefObject<HTMLInputElement>) || internalInputRef;

    const [isDissolving, setIsDissolving] = useState(false);
    const [dissolvingText, setDissolvingText] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Cancel dissolve animation cleanly if user starts typing or on unmount
    useEffect(() => {
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, []);

    const handleClear = useCallback(
      (e?: React.MouseEvent) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }

        if (!value || isDissolving) return;

        // Capture dissolving text for smooth dissolve transition
        setDissolvingText(value);
        setIsDissolving(true);

        // Notify parent state immediately
        onChange("");
        onClear?.();

        // Preserve input focus
        inputRef.current?.focus();

        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Complete dissolve lifecycle
        timerRef.current = setTimeout(() => {
          setIsDissolving(false);
          setDissolvingText("");
          timerRef.current = null;
        }, 1000);
      },
      [value, isDissolving, onChange, onClear, inputRef]
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isDissolving) {
        setIsDissolving(false);
        setDissolvingText("");
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
      onChange(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape" && value.length > 0) {
        e.preventDefault();
        handleClear();
      }
      onKeyDown?.(e);
    };

    // Portal-specific subtle focus accents adhering to restrained Apple guidelines
    const portalFocusStyle =
      portalVariant === "academia"
        ? "focus-within:border-[#743BFF]/60 dark:focus-within:border-[#B57CFF]/50"
        : portalVariant === "industry"
        ? "focus-within:border-[#FF2D95]/60 dark:focus-within:border-[#FF2D95]/50"
        : "focus-within:border-[#007BA7]/60 dark:focus-within:border-[rgba(205,203,202,0.30)]";

    const glowGradient =
      portalVariant === "academia"
        ? "linear-gradient(90deg, transparent, rgba(116, 59, 255, 0.35), rgba(181, 124, 255, 0.25), transparent)"
        : portalVariant === "industry"
        ? "linear-gradient(90deg, transparent, rgba(255, 45, 149, 0.35), rgba(225, 29, 72, 0.25), transparent)"
        : "linear-gradient(90deg, transparent, rgba(0, 123, 167, 0.35), rgba(212, 21, 20, 0.25), transparent)";

    // Sizing variants matching Apple iOS system search proportions
    const sizeStyle =
      sizeVariant === "sm"
        ? "h-8 text-[0.8rem] pl-7 pr-7"
        : sizeVariant === "lg"
        ? "h-11 text-[0.94rem] pl-10 pr-9"
        : "h-[36px] text-[0.86rem] pl-8.5 pr-8";

    const iconSize = sizeVariant === "sm" ? 13 : sizeVariant === "lg" ? 17 : 14;
    const iconLeftPos = sizeVariant === "sm" ? "left-2" : sizeVariant === "lg" ? "left-3" : "left-2.5";
    const clearRightPos = sizeVariant === "sm" ? "right-2" : sizeVariant === "lg" ? "right-3" : "right-2.5";
    const overlayLeftPos = sizeVariant === "sm" ? "left-7 right-7" : sizeVariant === "lg" ? "left-10 right-9" : "left-8.5 right-8";

    const hasContent = value.length > 0;

    return (
      <div
        className={`group relative flex items-center w-full rounded-[10px] border border-black/[0.08] dark:border-white/[0.08] bg-black/[0.035] dark:bg-white/[0.055] hover:bg-black/[0.05] dark:hover:bg-white/[0.075] focus-within:bg-white dark:focus-within:bg-[#121214] focus-within:shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.35)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${portalFocusStyle} ${
          disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        } ${className}`}
      >
        {/* Left Search Icon */}
        <Search
          size={iconSize}
          aria-hidden="true"
          className={`pointer-events-none absolute ${iconLeftPos} top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#8E8C8B] group-focus-within:text-slate-700 dark:group-focus-within:text-[#CDCBCA] transition-colors duration-200 ${iconClassName}`}
        />

        {/* Controlled Input Element */}
        <input
          ref={inputRef}
          type="search"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={isDissolving ? "" : placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className={`w-full bg-transparent font-normal tracking-tight text-slate-900 dark:text-[#F5F5F7] placeholder:text-slate-400 dark:placeholder:text-[#636366] focus:outline-none transition-colors search-input-field ${sizeStyle} ${inputClassName}`}
          {...props}
        />

        {/* Transitions.dev Dissolve Overlay Layer */}
        {isDissolving && (
          <div
            className={`pointer-events-none absolute ${overlayLeftPos} top-0 bottom-0 flex items-center overflow-hidden font-normal tracking-tight`}
            aria-hidden="true"
          >
            {/* Dissolving Text Element: moves downward 12px, blurs 2px, fades out */}
            <span className="search-dissolve-text whitespace-pre truncate text-slate-900 dark:text-[#F5F5F7]">
              {dissolvingText}
            </span>

            {/* Entering Placeholder: enters from -12px above, blurs 2px to 0, fades in */}
            <span className="search-dissolve-placeholder absolute left-0 text-slate-400 dark:text-[#636366] whitespace-pre truncate">
              {placeholder}
            </span>

            {/* Glow Streak Element: understated natural sheen */}
            <div
              className="search-dissolve-glow absolute inset-x-0 h-2.5 rounded-full pointer-events-none opacity-40"
              style={{ background: glowGradient }}
            />
          </div>
        )}

        {/* Apple iOS Native Style Clear Button */}
        {(hasContent || isDissolving) && (
          <button
            type="button"
            onMouseDown={(e) => {
              // Prevent default focus steal so input remains focused
              e.preventDefault();
            }}
            onClick={handleClear}
            disabled={disabled}
            aria-label="Clear search"
            title="Clear search"
            className={`absolute ${clearRightPos} top-1/2 -translate-y-1/2 grid h-4 w-4 place-items-center rounded-full bg-slate-300/90 hover:bg-slate-400 dark:bg-[#3A3A3C] dark:hover:bg-[#48484A] text-white active:scale-90 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black/20 dark:focus-visible:ring-white/30`}
          >
            <X size={10} strokeWidth={2.4} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
