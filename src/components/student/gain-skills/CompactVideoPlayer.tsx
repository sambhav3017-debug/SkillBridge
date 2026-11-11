"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Maximize2,
  Minimize2,
  Play,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  BookOpen,
  Share2,
  Check,
} from "lucide-react";

export interface CompactLectureData {
  videoUrl: string;
  title: string;
  instructor?: string;
  channelName?: string;
  courseOrSkillName: string;
  lessonOrPhaseTitle?: string;
  durationMinutes?: number;
  stage?: string;
  language?: "Hindi" | "Hinglish" | "English";
  isIndianCreator?: boolean;
  isPlaylist?: boolean;
  playlistTitle?: string;
  youtubeUrl?: string;
  summary?: string;
  lessonId?: string;
  skillId?: string;
  isCompleted?: boolean;
}

interface CompactVideoPlayerProps {
  lecture: CompactLectureData;
  onClose: () => void;
  onToggleComplete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function CompactVideoPlayer({
  lecture,
  onClose,
  onToggleComplete,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: CompactVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Derive direct YouTube URL if not provided
  const directYoutubeUrl =
    lecture.youtubeUrl ||
    (lecture.videoUrl.includes("embed/")
      ? `https://www.youtube.com/watch?v=${lecture.videoUrl.split("embed/")[1]?.split("?")[0]}`
      : lecture.videoUrl);

  // Trigger smooth close animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 180);
  }, [onClose]);

  // Fullscreen Toggle using Native Fullscreen API with fallback
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        } else {
          // Fallback CSS fullscreen
          setIsFullscreen((prev) => !prev);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch {
      // If native fullscreen is rejected by browser policy, fallback to CSS fullscreen
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // Listen for fullscreen change events (e.g. user pressed Esc in native mode)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard navigation & Esc handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          handleClose();
        }
      } else if (e.key === "f" || e.key === "F") {
        // Toggle fullscreen with 'f' if not inside an input
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          toggleFullscreen();
        }
      } else if (e.key === "ArrowLeft" && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, toggleFullscreen, hasPrevious, onPrevious, hasNext, onNext]);

  // Prevent background scroll
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Copy direct YouTube URL
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(directYoutubeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const isIndian =
    lecture.isIndianCreator ??
    [
      "CodeWithHarry",
      "Apna College",
      "Chai aur Code",
      "takeUforward (Striver)",
      "takeUforward",
      "Love Babbar",
      "Jenny's Lectures CS/IT",
      "Gate Smashers",
      "CampusX",
      "Krish Naik",
      "5 Minutes Engineering",
      "Gaurav Sen",
      "Concept && Coding",
    ].some((creator) =>
      lecture.instructor?.toLowerCase().includes(creator.toLowerCase())
    );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Video lecture: ${lecture.title}`}
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 transition-all duration-200 ${
        isClosing
          ? "opacity-0 pointer-events-none"
          : "opacity-100 bg-black/70 dark:bg-black/85 backdrop-blur-md"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        ref={containerRef}
        className={`relative flex flex-col bg-white dark:bg-[#11141D] border border-black/[0.08] dark:border-white/10 shadow-2xl transition-all duration-200 ease-out overflow-hidden ${
          isFullscreen
            ? "fixed inset-0 w-screen h-screen z-50 rounded-none border-none max-w-none"
            : `w-full max-w-[740px] rounded-3xl ${
                isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
              }`
        }`}
      >
        {/* COMPACT PLAYER TOP HEADER */}
        <div className="flex-none px-4 py-3 sm:px-5 sm:py-3.5 border-b border-black/[0.08] dark:border-white/10 bg-white/95 dark:bg-[#131722]/95 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sb-muted flex items-center gap-1 truncate">
                <BookOpen size={11} className="text-[#FF6A00] dark:text-sb-cyan shrink-0" />
                {lecture.courseOrSkillName}
                {lecture.lessonOrPhaseTitle && (
                  <>
                    <span className="opacity-40">•</span>
                    <span className="truncate">{lecture.lessonOrPhaseTitle}</span>
                  </>
                )}
              </span>

              {isIndian && (
                <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300 border border-amber-500/20">
                  <span className="text-[9px]">🇮🇳</span> Indian Educator
                </span>
              )}

              {lecture.language && (
                <span className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-black/[0.04] dark:bg-white/5 border border-black/[0.06] dark:border-white/10 text-neutral-600 dark:text-neutral-300">
                  {lecture.language}
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-[#171717] dark:text-white truncate leading-snug">
              {lecture.title}
            </h3>
          </div>

          {/* Action Icons: Fullscreen & Close */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              title={copiedLink ? "Link copied!" : "Copy YouTube link"}
              className="p-2 rounded-xl text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            >
              {copiedLink ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen (Esc or F)" : "Fullscreen Mode (F)"}
              className="p-2 rounded-xl text-sb-muted hover:text-[#FF6A00] dark:hover:text-sb-cyan hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <button
              type="button"
              onClick={handleClose}
              title="Close Player (Esc)"
              aria-label="Close player"
              className="p-2 rounded-xl text-sb-muted hover:text-[#171717] dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* 16:9 VIDEO IFRAME AREA */}
        <div
          className={`relative w-full bg-black flex items-center justify-center overflow-hidden ${
            isFullscreen ? "flex-1 h-full max-h-none" : "aspect-video"
          }`}
        >
          {/* Loading Skeleton */}
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 text-white/70 z-10">
              <div className="relative w-12 h-12 flex items-center justify-center mb-3">
                <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 dark:border-sb-cyan/20 animate-ping" />
                <div className="w-10 h-10 rounded-full border-2 border-[#FF6A00] dark:border-sb-cyan border-t-transparent animate-spin" />
                <Play size={16} className="text-[#FF6A00] dark:text-sb-cyan" fill="currentColor" />
              </div>
              <p className="text-xs font-semibold">Loading lecture stream...</p>
              <span className="text-[11px] text-white/50 mt-1">{lecture.instructor}</span>
            </div>
          )}

          {/* Embed Video Iframe */}
          <iframe
            key={lecture.videoUrl}
            src={lecture.videoUrl}
            title={lecture.title}
            onLoad={() => setIframeLoaded(true)}
            className="w-full h-full border-0 absolute inset-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        </div>

        {/* COMPACT SUPPORTING METADATA & CONTROLS BAR */}
        <div className="flex-none p-3.5 sm:p-4 bg-white dark:bg-[#11141D] border-t border-black/[0.06] dark:border-white/10 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Instructor, Channel & Stats */}
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF6A00]/15 to-[#FF9F1C]/15 dark:from-sb-cyan/20 dark:to-sb-blue/20 text-[#FF6A00] dark:text-sb-cyan font-black text-sm shrink-0 border border-orange-500/25 dark:border-sb-cyan/25">
                {(lecture.instructor || "SB").slice(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#171717] dark:text-white">
                    {lecture.instructor || "Educator"}
                  </h4>
                  {lecture.isPlaylist && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300 border border-purple-500/20">
                      Structured Series
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-sb-muted font-medium mt-0.5">
                  {lecture.durationMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {lecture.durationMinutes} mins
                    </span>
                  )}
                  {lecture.stage && (
                    <>
                      <span>•</span>
                      <span>{lecture.stage}</span>
                    </>
                  )}
                  {lecture.playlistTitle && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[200px]" title={lecture.playlistTitle}>
                        {lecture.playlistTitle}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Completion & Next/Prev Controls */}
            <div className="flex items-center gap-2 justify-end shrink-0">
              {/* Prev / Next buttons */}
              {(onPrevious || onNext) && (
                <div className="inline-flex items-center rounded-xl border border-black/[0.08] dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-0.5">
                  <button
                    type="button"
                    disabled={!hasPrevious}
                    onClick={onPrevious}
                    title="Previous Lecture"
                    className="p-1.5 rounded-lg text-sb-muted hover:text-[#171717] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={!hasNext}
                    onClick={onNext}
                    title="Next Lecture"
                    className="p-1.5 rounded-lg text-sb-muted hover:text-[#171717] dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}

              {/* Mark Completed Button */}
              {onToggleComplete && (
                <button
                  type="button"
                  onClick={onToggleComplete}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-180 active:scale-95 cursor-pointer shadow-xs ${
                    lecture.isCompleted
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "bg-gradient-to-r from-[#FF6A00] to-[#E55A00] dark:from-sb-cyan dark:to-sb-blue text-white dark:text-[#090C12] hover:brightness-105"
                  }`}
                >
                  <CheckCircle2 size={13} />
                  {lecture.isCompleted ? "Completed ✓" : "Mark Complete"}
                </button>
              )}

              {/* Direct YouTube Link */}
              <a
                href={directYoutubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Watch directly on YouTube (if embed is restricted)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-sb-muted hover:text-[#FF6A00] dark:hover:text-sb-cyan hover:bg-orange-500/10 dark:hover:bg-sb-cyan/10 transition cursor-pointer"
              >
                <span className="hidden sm:inline">YouTube</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Lecture Summary / Teaching Focus */}
          {lecture.summary && (
            <div className="pt-2 border-t border-black/[0.04] dark:border-white/5 flex items-start gap-2">
              <Sparkles size={12} className="text-[#FF6A00] dark:text-sb-cyan mt-0.5 shrink-0" />
              <p className="text-[11px] text-neutral-600 dark:text-sb-muted line-clamp-2 leading-relaxed">
                {lecture.summary}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
