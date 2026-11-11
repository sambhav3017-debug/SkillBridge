import React from "react";
import type { TechIconMeta } from "./tech-icon-types";

export const TECH_ICONS: Record<string, TechIconMeta> = {
  // ==========================================
  // PROGRAMMING LANGUAGES
  // ==========================================
  python: {
    id: "python",
    name: "Python",
    category: "Programming Languages",
    brandColor: "#3776AB",
    secondaryColor: "#FFD43B",
    gradient: "from-[#3776AB]/20 via-[#FFD43B]/10 to-transparent",
    darkGradient: "from-[#3776AB]/30 via-[#FFD43B]/15 to-transparent",
    shadowColor: "rgba(55, 118, 171, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none">
        <path
          d="M11.914 2C9.404 2 7.47 2.213 6.043 2.656C4.646 3.09 3.84 3.791 3.84 5.344v2.016h8.243v1.016H5.35c-1.6 0-3.003.96-3.447 2.766-.51 2.062-.53 3.35-.01 5.484.394 1.604 1.34 2.547 2.94 2.547h1.72v-2.422c0-1.742 1.48-3.219 3.29-3.219h5.506c1.458 0 2.64-1.209 2.64-2.688V5.344C17.989 3.79 17.18 2 11.914 2zm-2.43 1.625a1.047 1.047 0 1 1 0 2.094 1.047 1.047 0 0 1 0-2.094z"
          fill="#3776AB"
        />
        <path
          d="M12.086 22c2.51 0 4.444-.213 5.871-.656 1.397-.434 2.203-1.135 2.203-2.688v-2.016h-8.243v-1.016h6.733c1.6 0 3.003-.96 3.447-2.766.51-2.062.53-3.35.01-5.484-.394-1.604-1.34-2.547-2.94-2.547h-1.72v2.422c0 1.742-1.48 3.219-3.29 3.219H8.65c-1.458 0-2.64 1.209-2.64 2.688v5.14c0 1.555.809 3.344 6.076 3.344zm2.43-1.625a1.047 1.047 0 1 1 0-2.094 1.047 1.047 0 0 1 0 2.094z"
          fill="#FFD43B"
        />
      </g>
    ),
  },

  javascript: {
    id: "javascript",
    name: "JavaScript",
    category: "Programming Languages",
    brandColor: "#F7DF1E",
    secondaryColor: "#000000",
    gradient: "from-[#F7DF1E]/25 via-amber-400/10 to-transparent",
    darkGradient: "from-[#F7DF1E]/30 via-amber-500/15 to-transparent",
    shadowColor: "rgba(247, 223, 30, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <rect width="24" height="24" rx="3.5" fill="#F7DF1E" />
        <path
          d="M12.87 18.25c.38.63.85 1.15 1.71 1.15.8 0 1.3-.4 1.3-1.46v-5.63h2.36v5.66c0 2.22-1.3 3.23-3.41 3.23-1.85 0-2.93-.97-3.47-2.14l1.51-.81zm-7.05-.28c.31.54.72.96 1.45.96.65 0 1.07-.31 1.07-.75 0-.52-.42-.72-1.14-.99l-.4-.15c-1.16-.44-1.92-1-1.92-2.27 0-1.47 1.16-2.58 2.97-2.58 1.3 0 2.23.47 2.81 1.51l-1.43.92c-.24-.43-.53-.67-1.12-.67-.5 0-.85.32-.85.7 0 .44.33.64.96.88l.4.15c1.37.52 2.15 1.08 2.15 2.44 0 1.68-1.34 2.69-3.27 2.69-1.82 0-2.88-.88-3.39-2.03l1.71-.86z"
          fill="#000000"
        />
      </g>
    ),
  },

  typescript: {
    id: "typescript",
    name: "TypeScript",
    category: "Programming Languages",
    brandColor: "#3178C6",
    secondaryColor: "#FFFFFF",
    gradient: "from-[#3178C6]/25 via-blue-400/10 to-transparent",
    darkGradient: "from-[#3178C6]/30 via-cyan-400/15 to-transparent",
    shadowColor: "rgba(49, 120, 198, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <rect width="24" height="24" rx="3.5" fill="#3178C6" />
        <path
          d="M13.88 17.75c.34.56.78 1.03 1.54 1.03.73 0 1.18-.36 1.18-1.31v-5.07h2.12v5.1c0 2-1.17 2.9-3.07 2.9-1.67 0-2.64-.87-3.13-1.93l1.36-.72zM5.5 10.5h6.5v1.85H9.6v7.15H7.3v-7.15H5.5V10.5z"
          fill="#FFFFFF"
        />
      </g>
    ),
  },

  java: {
    id: "java",
    name: "Java",
    category: "Programming Languages",
    brandColor: "#EA2D2E",
    secondaryColor: "#5382A1",
    gradient: "from-[#EA2D2E]/20 via-[#5382A1]/15 to-transparent",
    darkGradient: "from-[#EA2D2E]/30 via-orange-500/15 to-transparent",
    shadowColor: "rgba(234, 45, 46, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none">
        <path
          d="M9.1 19.3s-1.8.2-1.2.9c.7.9 3.5.7 3.5.7s1.3-.2 1.8-.7c-.8-.2-2.9-.4-4.1-.9zm-1-3.1s-2 .4-1.3 1.3c.9 1 4.5.9 4.5.9s1.6-.2 2.2-.9c-1-.2-3.7-.6-5.4-1.3zm6.3-4.2s1.4.3 2.4.9c1 .6.8 1.6-.2 2.3-1.2.9-3 1.1-4.7 1.2-1.9.1-3.6 0-4.6-.3-1.5-.4-1.8-1.5-.7-2.2 1.6-1.1 4.1-1.2 5.1-1.3.4-.3 1.7-.5 2.7-.6zm-5-3.6c-.6 1.3.6 2.4 1.9 3.3 1.2.9 2.5 1.5 2.1 2.8-.5 1.5-2.2 1.4-3.5 1.2-1.2-.2-2.3-.6-3.2-1.2 0 0-.2.6.4.9 1.4.8 3.5 1 5.2.7 2-.3 3.3-1.4 3.2-3.2-.2-2-2.4-2.7-3.9-3.4-1.1-.6-1.9-1.2-1.5-2.1.4-.9 1.6-.8 2.5-.6 0 0 .1-.5-.4-.6-1.2-.2-2.2.3-2.8 1.2zm6.7 4.9c-.8.1-1.4.2-1.9.4.6.4 1.3.7 1.8 1.1 1.1.9 1.4 1.9.7 2.9 1.7-.6 2.5-1.9 2-3.3-.4-1-1.4-1.1-2.6-1.1z"
          fill="#EA2D2E"
        />
        <path
          d="M13.7 2.1c1.3 1.7.5 3.3-.4 4.8-.8 1.4-1.4 2.8-.5 4.3.1.2.4.2.5 0 .7-1.4.5-2.6.2-3.9-.3-1.4.3-2.9 1.2-4.2.2-.3-.6-.8-1-.8zm-3.1 3.5c.9 1.3.3 2.5-.4 3.7-.6 1.1-1.1 2.2-.4 3.4.1.2.3.2.4 0 .5-1.1.4-2 .2-3-.3-1.1.2-2.3.9-3.3.2-.3-.4-.7-.7-.8z"
          fill="#5382A1"
        />
      </g>
    ),
  },

  cpp: {
    id: "cpp",
    name: "C++",
    category: "Programming Languages",
    brandColor: "#00599C",
    secondaryColor: "#659AD2",
    gradient: "from-[#00599C]/25 via-blue-500/10 to-transparent",
    darkGradient: "from-[#00599C]/30 via-cyan-500/15 to-transparent",
    shadowColor: "rgba(0, 89, 156, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#00599C">
        <path d="M12 2L2 7.778v8.444L12 22l10-5.778V7.778L12 2zm0 2.285l7.98 4.608v6.214L12 19.715l-7.98-4.608V9.178L12 4.285z" />
        <path
          d="M11.5 8.5a4 4 0 0 0-4 4 4 4 0 0 0 4 4c1.3 0 2.4-.6 3.1-1.6l-1.4-1c-.4.6-1 1-1.7 1a2.3 2.3 0 0 1-2.3-2.4c0-1.3 1-2.4 2.3-2.4.7 0 1.3.4 1.7 1l1.4-1a3.8 3.8 0 0 0-3.1-1.6zm4 2.5v1h-1v1h1v1h1v-1h1v-1h-1v-1h-1zm3.5 0v1h-1v1h1v1h1v-1h1v-1h-1v-1h-1z"
          fill="#659AD2"
        />
      </g>
    ),
  },

  c: {
    id: "c",
    name: "C",
    category: "Programming Languages",
    brandColor: "#A8B9CC",
    secondaryColor: "#283593",
    gradient: "from-[#283593]/20 via-[#A8B9CC]/15 to-transparent",
    darkGradient: "from-[#283593]/30 via-indigo-500/15 to-transparent",
    shadowColor: "rgba(40, 53, 147, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path d="M12 2L2 7.778v8.444L12 22l10-5.778V7.778L12 2z" fill="#283593" />
        <path
          d="M12 4.285l7.98 4.608v6.214L12 19.715l-7.98-4.608V9.178L12 4.285z"
          fill="#A8B9CC"
        />
        <path
          d="M12.5 8.5c-2.4 0-4.3 1.8-4.3 4.2s1.9 4.2 4.3 4.2c1.6 0 2.9-.8 3.6-2l-1.8-1c-.4.7-1 1.2-1.8 1.2-1.3 0-2.3-1.1-2.3-2.4s1-2.4 2.3-2.4c.8 0 1.4.5 1.8 1.2l1.8-1c-.7-1.2-2-2-3.6-2z"
          fill="#FFFFFF"
        />
      </g>
    ),
  },

  go: {
    id: "go",
    name: "Go",
    category: "Programming Languages",
    brandColor: "#00ADD8",
    secondaryColor: "#FFFFFF",
    gradient: "from-[#00ADD8]/25 via-cyan-400/10 to-transparent",
    darkGradient: "from-[#00ADD8]/30 via-sky-400/15 to-transparent",
    shadowColor: "rgba(0, 173, 216, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#00ADD8">
        <path d="M1.5 10.8c0-.4.3-.7.7-.7h7.2c.4 0 .7.3.7.7v.4c0 .4-.3.7-.7.7H2.2c-.4 0-.7-.3-.7-.7v-.4zm1.5-3.3c0-.4.3-.7.7-.7h4.8c.4 0 .7.3.7.7v.4c0 .4-.3.7-.7.7H3.7c-.4 0-.7-.3-.7-.7v-.4zm.8 6.6c0-.4.3-.7.7-.7h3.8c.4 0 .7.3.7.7v.4c0 .4-.3.7-.7.7H4.5c-.4 0-.7-.3-.7-.7v-.4z" />
        <path d="M12.4 12.8c0-3.3 2.1-5.6 5.3-5.6 2.3 0 4.1 1.3 4.8 3.2.1.3 0 .7-.3.8l-1.5.7c-.3.1-.6 0-.8-.2-.5-1.1-1.3-1.7-2.3-1.7-1.8 0-3 1.3-3 3s1.2 3 3 3c1 0 1.7-.5 2.1-1.3h-2.3c-.4 0-.7-.3-.7-.7v-1.1c0-.4.3-.7.7-.7h4.7c.4 0 .7.3.7.7v2.2c0 3.3-2.1 5.6-5.3 5.6-3.2 0-5.3-2.3-5.3-5.6z" />
      </g>
    ),
  },

  rust: {
    id: "rust",
    name: "Rust",
    category: "Programming Languages",
    brandColor: "#CE422B",
    secondaryColor: "#000000",
    gradient: "from-[#CE422B]/25 via-amber-600/10 to-transparent",
    darkGradient: "from-[#CE422B]/30 via-orange-500/15 to-transparent",
    shadowColor: "rgba(206, 66, 43, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#CE422B">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2.2a7.8 7.8 0 1 1 0 15.6 7.8 7.8 0 0 1 0-15.6zm-3.5 3.3v9h2.2v-3.2h1.6l2 3.2h2.6l-2.4-3.6c1.3-.4 2.1-1.6 2.1-3 0-1.8-1.4-2.4-3.3-2.4H8.5zm2.2 1.9h1.7c.9 0 1.5.3 1.5 1.1s-.6 1.1-1.5 1.1h-1.7v-2.2z" />
      </g>
    ),
  },

  php: {
    id: "php",
    name: "PHP",
    category: "Programming Languages",
    brandColor: "#777BB4",
    secondaryColor: "#232531",
    gradient: "from-[#777BB4]/25 via-indigo-400/10 to-transparent",
    darkGradient: "from-[#777BB4]/30 via-indigo-500/15 to-transparent",
    shadowColor: "rgba(119, 123, 180, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#777BB4">
        <ellipse cx="12" cy="12" rx="11" ry="6.5" fill="#777BB4" />
        <path
          d="M6.2 14.5l.8-4.2h1.8c.9 0 1.5.3 1.3 1.3-.2.9-.8 1.4-1.7 1.4h-.9l-.3 1.5H6.2zm1.4-2.3h.7c.4 0 .7-.2.8-.6.1-.4 0-.6-.4-.6h-.7l-.4 1.2zm4.3 2.3l.8-4.2h1.1l-.3 1.4h.1c.4-.9 1.1-1.5 2-1.5.8 0 1.3.4 1.1 1.3l-.6 3H14.5l.5-2.7c.1-.5-.1-.8-.6-.8-.5 0-.9.4-1.1 1l-.5 2.5h-1.3zm6.5 0l.8-4.2h1.8c.9 0 1.5.3 1.3 1.3-.2.9-.8 1.4-1.7 1.4h-.9l-.3 1.5h-1.3zm1.4-2.3h.7c.4 0 .7-.2.8-.6.1-.4 0-.6-.4-.6h-.7l-.4 1.2z"
          fill="#FFFFFF"
        />
      </g>
    ),
  },

  kotlin: {
    id: "kotlin",
    name: "Kotlin",
    category: "Programming Languages",
    brandColor: "#7F52FF",
    secondaryColor: "#E4485D",
    gradient: "from-[#7F52FF]/25 via-[#E4485D]/15 to-transparent",
    darkGradient: "from-[#7F52FF]/30 via-purple-500/15 to-transparent",
    shadowColor: "rgba(127, 82, 255, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path d="M22 22H2V2h20L12 12l10 10z" fill="#7F52FF" />
        <path d="M2 22l10-10L2 2v20z" fill="#0095D5" />
        <path d="M22 2H2l10 10L22 2z" fill="#E4485D" />
      </g>
    ),
  },

  swift: {
    id: "swift",
    name: "Swift",
    category: "Programming Languages",
    brandColor: "#F05138",
    secondaryColor: "#FFFFFF",
    gradient: "from-[#F05138]/25 via-orange-400/10 to-transparent",
    darkGradient: "from-[#F05138]/30 via-rose-500/15 to-transparent",
    shadowColor: "rgba(240, 81, 56, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#F05138">
        <path d="M21.2 16.8c-.2.4-2.5 3.7-6.2 5.1 4.3-1.6 7-5.1 7-5.1s-.4.6-1.1 1.2c-3.1 2.8-7.5 3.3-10.4 2.2 4.1-.7 7.7-3.4 9.3-6.5-2.2 1.3-4.9 1.7-6.7 1.4-3.4-.6-5.8-3.4-6.4-4.2C8 12.3 9.7 13 11.2 13c-2.3-.9-4.2-2.7-5.2-4.5-1.1-2-1.2-4.1-.6-5.4 0 0 0 .5.3 1.2 1.2 3.1 4.5 5.7 7.6 6.8 1.4.5 3 .6 4.3.4 2.6-.4 4.8-2.1 5.9-4.3-.2 1.4-1 3.2-2.3 4.6 2.3-.8 4.3-2.3 5.4-3.9-.3 3.6-2.9 6.8-5.4 8.9z" />
      </g>
    ),
  },

  // ==========================================
  // WEB & FRONTEND DEVELOPMENT
  // ==========================================
  react: {
    id: "react",
    name: "React",
    category: "Web Development",
    brandColor: "#61DAFB",
    secondaryColor: "#20232A",
    gradient: "from-[#61DAFB]/25 via-sky-400/10 to-transparent",
    darkGradient: "from-[#61DAFB]/30 via-cyan-400/15 to-transparent",
    shadowColor: "rgba(97, 218, 251, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="#61DAFB" strokeWidth="1.6">
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.8" fill="#61DAFB" stroke="none" />
      </g>
    ),
  },

  nextjs: {
    id: "nextjs",
    name: "Next.js",
    category: "Web Development",
    brandColor: "#000000",
    secondaryColor: "#FFFFFF",
    gradient: "from-black/15 via-neutral-500/10 to-transparent",
    darkGradient: "from-white/20 via-neutral-400/10 to-transparent",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path
          d="M15.5 8v8h-1.6V11.2l-4.7 6.4c-.4-.1-.8-.3-1.2-.5L14 9.5H10V8h5.5z"
          fill="var(--next-n-color, #FFFFFF)"
        />
      </g>
    ),
  },

  html: {
    id: "html",
    name: "HTML",
    category: "Web Development",
    brandColor: "#E34F26",
    secondaryColor: "#EF652A",
    gradient: "from-[#E34F26]/25 via-orange-500/10 to-transparent",
    darkGradient: "from-[#E34F26]/30 via-rose-500/15 to-transparent",
    shadowColor: "rgba(227, 79, 38, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path d="M2.5 2l1.8 19.5L12 24l7.7-2.5L21.5 2H2.5z" fill="#E34F26" />
        <path d="M12 21.8l6.2-2 1.5-16.1H12v18.1z" fill="#EF652A" />
        <path
          d="M12 7.7H7.7l.2 2.3h4.1V7.7zm0 4.6H9.9l.2 2.3h1.9v-2.3zm0 4.6h-.1l-1.9-.5-.1-1.3H8.3l.3 2.7 3.4.9V16.9z"
          fill="#EBEBEB"
        />
        <path
          d="M12 7.7v2.3h4.1l-.4 4.6-3.7 1v2.3l6.2-1.7.5-6.2.2-2.3H12z"
          fill="#FFFFFF"
        />
      </g>
    ),
  },

  css: {
    id: "css",
    name: "CSS",
    category: "Web Development",
    brandColor: "#1572B6",
    secondaryColor: "#33A9DC",
    gradient: "from-[#1572B6]/25 via-sky-500/10 to-transparent",
    darkGradient: "from-[#1572B6]/30 via-cyan-500/15 to-transparent",
    shadowColor: "rgba(21, 114, 182, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path d="M2.5 2l1.8 19.5L12 24l7.7-2.5L21.5 2H2.5z" fill="#1572B6" />
        <path d="M12 21.8l6.2-2 1.5-16.1H12v18.1z" fill="#33A9DC" />
        <path
          d="M12 7.7H7.7l.2 2.3h4.1V7.7zm0 4.6H9.9l.2 2.3h1.9v-2.3zm0 4.6h-.1l-1.9-.5-.1-1.3H8.3l.3 2.7 3.4.9V16.9z"
          fill="#EBEBEB"
        />
        <path
          d="M12 7.7v2.3h4.1l-.4 4.6-3.7 1v2.3l6.2-1.7.5-6.2.2-2.3H12z"
          fill="#FFFFFF"
        />
      </g>
    ),
  },

  nodejs: {
    id: "nodejs",
    name: "Node.js",
    category: "Web Development",
    brandColor: "#339933",
    secondaryColor: "#66CC33",
    gradient: "from-[#339933]/25 via-emerald-400/10 to-transparent",
    darkGradient: "from-[#339933]/30 via-green-400/15 to-transparent",
    shadowColor: "rgba(51, 153, 51, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#339933">
        <path d="M12 2l9 5.2v10.4l-9 5.2-9-5.2V7.2L12 2zm0 2.3L4.8 8.5v7l7.2 4.2 7.2-4.2v-7L12 4.3z" />
        <path d="M11 7.5h2v6.2l3-1.8v2.2l-5 3v-9.6z" fill="#66CC33" />
      </g>
    ),
  },

  expressjs: {
    id: "expressjs",
    name: "Express.js",
    category: "Web Development",
    brandColor: "#000000",
    secondaryColor: "#68A063",
    gradient: "from-neutral-700/20 via-neutral-500/10 to-transparent",
    darkGradient: "from-neutral-300/20 via-neutral-500/15 to-transparent",
    shadowColor: "rgba(0, 0, 0, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="currentColor">
        <path d="M3.2 8.5h3.2l2.3 3.6 2.3-3.6h3.2l-3.9 6 4 6.2h-3.2l-2.4-3.7-2.4 3.7H3.1l4-6.2-3.9-6zm12.3 0h3.2v12.2h-3.2V8.5z" />
      </g>
    ),
  },

  // ==========================================
  // CLOUD, DEVOPS & INFRASTRUCTURE
  // ==========================================
  aws: {
    id: "aws",
    name: "AWS",
    category: "Cloud & DevOps",
    brandColor: "#FF9900",
    secondaryColor: "#232F3E",
    gradient: "from-[#FF9900]/25 via-amber-500/10 to-transparent",
    darkGradient: "from-[#FF9900]/30 via-orange-500/15 to-transparent",
    shadowColor: "rgba(255, 153, 0, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path
          d="M6.9 10.4c-.8.8-1.3 1.9-1.3 3.1 0 2.5 1.9 4.3 4.5 4.3 1.5 0 2.7-.6 3.4-1.7v1.4h2.2v-7.9h-2.2v1.3c-.7-.9-1.9-1.5-3.4-1.5-2.6 0-4.5 1.8-4.5 4.3v-.1zm3.2 5.5c-1.5 0-2.6-1.1-2.6-2.5s1.1-2.5 2.6-2.5 2.6 1.1 2.6 2.5-1.1 2.5-2.6 2.5z"
          fill="#232F3E"
          className="dark:fill-white"
        />
        <path
          d="M18.8 17.5c-3.7 2.3-8.8 2.6-13.1.8-.4-.2-.5-.6-.2-.9.2-.3.6-.3.9-.1 3.9 1.6 8.5 1.3 11.9-.8.4-.2.8.1.9.5.1.3-.2.4-.4.5z"
          fill="#FF9900"
        />
        <path
          d="M19.7 16.3c-.3-.4-1.8-.5-2.7-.4-.3 0-.4-.3-.2-.5.8-.8 2.8-.6 3.2-.1.4.5 0 2.5-.8 3.2-.2.2-.4.1-.4-.2.1-.8.2-1.6.9-2z"
          fill="#FF9900"
        />
      </g>
    ),
  },

  docker: {
    id: "docker",
    name: "Docker",
    category: "Cloud & DevOps",
    brandColor: "#2496ED",
    secondaryColor: "#1D63ED",
    gradient: "from-[#2496ED]/25 via-blue-500/10 to-transparent",
    darkGradient: "from-[#2496ED]/30 via-sky-400/15 to-transparent",
    shadowColor: "rgba(36, 150, 237, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#2496ED">
        <path d="M13.4 9.2h2.2V7h-2.2v2.2zm-2.7 0h2.2V7h-2.2v2.2zm-2.7 0h2.2V7H8v2.2zm-2.7 0h2.2V7H5.3v2.2zm8.1-2.7h2.2V4.3h-2.2v2.2zm-2.7 0h2.2V4.3h-2.2v2.2zm-2.7 0h2.2V4.3H8v2.2zM23.5 12c-.5-.4-1.6-.5-2.5-.2-.2-.6-.6-1.1-1.1-1.5l-.7-.4-.4.7c-.5.8-.4 1.8.2 2.5-.5.3-1.4.3-2 .3H1.2c-.4 1.7-.1 4.7 1.7 6.6 1.8 1.9 4.6 2.3 7.8 2.3 6.3 0 10.9-3.2 12.3-8.8.7 0 1.5-.1 2-.6.4-.3.6-.7.6-.8-.6 0-1.5.1-2.1-.1z" />
      </g>
    ),
  },

  kubernetes: {
    id: "kubernetes",
    name: "Kubernetes",
    category: "Cloud & DevOps",
    brandColor: "#326CE5",
    secondaryColor: "#FFFFFF",
    gradient: "from-[#326CE5]/25 via-indigo-500/10 to-transparent",
    darkGradient: "from-[#326CE5]/30 via-blue-400/15 to-transparent",
    shadowColor: "rgba(50, 108, 229, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#326CE5">
        <path d="M12 2l8.7 5v10L12 22l-8.7-5V7L12 2zm0 2.3L5.3 8.2v7.6L12 19.7l6.7-3.9V8.2L12 4.3z" />
        <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
        <path
          d="M12 7.5v2m0 5v2m4.5-5.5l-1.7 1m-5.6 3.2l-1.7 1m0-5.2l1.7 1m5.6 3.2l1.7 1"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />
      </g>
    ),
  },

  linux: {
    id: "linux",
    name: "Linux",
    category: "Cloud & DevOps",
    brandColor: "#FCC624",
    secondaryColor: "#000000",
    gradient: "from-[#FCC624]/25 via-amber-400/10 to-transparent",
    darkGradient: "from-[#FCC624]/30 via-yellow-500/15 to-transparent",
    shadowColor: "rgba(252, 198, 36, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="currentColor">
        <path d="M12 2c-3.1 0-5 2.5-5 5.7 0 1.8.6 3.9 1.1 5.3-.8 1-2.1 2.4-2.1 4.5 0 2.5 2.1 3.5 5 3.5.7 0 1.5-.1 2-.3.5.2 1.3.3 2 .3 2.9 0 5-1 5-3.5 0-2.1-1.3-3.5-2.1-4.5.5-1.4 1.1-3.5 1.1-5.3 0-3.2-1.9-5.7-5-5.7z" />
        <ellipse cx="10" cy="7" rx="1" ry="1.4" fill="#FFFFFF" />
        <ellipse cx="14" cy="7" rx="1" ry="1.4" fill="#FFFFFF" />
        <circle cx="10" cy="7.2" r=".6" fill="#000000" />
        <circle cx="14" cy="7.2" r=".6" fill="#000000" />
        <path d="M11 9.2c.5.5 1.5.5 2 0l-1 1.4-1-1.4z" fill="#FFA500" />
      </g>
    ),
  },

  git: {
    id: "git",
    name: "Git",
    category: "Cloud & DevOps",
    brandColor: "#F05032",
    secondaryColor: "#FFFFFF",
    gradient: "from-[#F05032]/25 via-red-500/10 to-transparent",
    darkGradient: "from-[#F05032]/30 via-rose-500/15 to-transparent",
    shadowColor: "rgba(240, 80, 50, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#F05032">
        <path d="M21.7 10.9L13.1 2.3c-.4-.4-1.1-.4-1.5 0L9.8 4.1l2.3 2.3c.4-.1.9 0 1.2.3.4.4.5 1 .3 1.5l2.2 2.2c.5-.2 1.1-.1 1.5.3.6.6.6 1.5 0 2.1s-1.5.6-2.1 0c-.4-.4-.5-1-.3-1.5l-2.1-2.1v4.8c.2.1.4.3.5.5.6.6.6 1.5 0 2.1s-1.5.6-2.1 0-1.5-.6-2.1 0c-.6-.6-.6-1.5 0-2.1.4-.4 1-.5 1.5-.3V8.8c-.5-.2-.9-.6-1.1-1.1L2.3 12.4c-.4.4-.4 1.1 0 1.5l8.6 8.6c.4.4 1.1.4 1.5 0l9.3-9.3c.4-.4.4-1.1 0-1.5z" />
      </g>
    ),
  },

  github: {
    id: "github",
    name: "GitHub",
    category: "Cloud & DevOps",
    brandColor: "#181717",
    secondaryColor: "#FFFFFF",
    gradient: "from-neutral-800/20 via-neutral-600/10 to-transparent",
    darkGradient: "from-white/20 via-neutral-400/10 to-transparent",
    shadowColor: "rgba(24, 23, 23, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="currentColor">
        <path d="M12 2C6.47 2 2 6.48 2 12.02c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10.02 10.02 0 0 0 22 12.02C22 6.48 17.53 2 12 2z" />
      </g>
    ),
  },

  azure: {
    id: "azure",
    name: "Microsoft Azure",
    category: "Cloud & DevOps",
    brandColor: "#0078D4",
    secondaryColor: "#50E6FF",
    gradient: "from-[#0078D4]/25 via-sky-400/10 to-transparent",
    darkGradient: "from-[#0078D4]/30 via-cyan-400/15 to-transparent",
    shadowColor: "rgba(0, 120, 212, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path d="M13.2 3.5l-6.7 12 3.8 5 9.7-17h-6.8z" fill="#0078D4" />
        <path d="M4 17.5l4-7.2 4.2 7.2H4z" fill="#50E6FF" />
      </g>
    ),
  },

  "google-cloud": {
    id: "google-cloud",
    name: "Google Cloud",
    category: "Cloud & DevOps",
    brandColor: "#4285F4",
    secondaryColor: "#EA4335",
    gradient: "from-[#4285F4]/20 via-[#FBBC05]/15 to-transparent",
    darkGradient: "from-[#4285F4]/30 via-blue-500/15 to-transparent",
    shadowColor: "rgba(66, 133, 244, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path d="M19.3 10.5a6.5 6.5 0 0 0-12-2.3 5 5 0 0 0-4.3 5 5 5 0 0 0 5 4.8h11a4.5 4.5 0 0 0 4.5-4.5 4.5 4.5 0 0 0-4.2-3z" fill="#4285F4" />
        <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
      </g>
    ),
  },

  // ==========================================
  // AI, MACHINE LEARNING & DATA SCIENCE
  // ==========================================
  "machine-learning": {
    id: "machine-learning",
    name: "Machine Learning",
    category: "Artificial Intelligence & Machine Learning",
    brandColor: "#FF6A00",
    secondaryColor: "#7928CA",
    gradient: "from-[#FF6A00]/25 via-[#7928CA]/15 to-transparent",
    darkGradient: "from-[#FF6A00]/30 via-purple-500/15 to-transparent",
    shadowColor: "rgba(255, 106, 0, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="#FF6A00" strokeWidth="1.8">
        <circle cx="6" cy="6" r="3" fill="#FF6A00" stroke="none" />
        <circle cx="18" cy="6" r="3" fill="#FF9F1C" stroke="none" />
        <circle cx="12" cy="18" r="3" fill="#7928CA" stroke="none" />
        <path d="M8.5 7.5l4.5 8m-4.5-8h7m0 0l-4.5 8" stroke="currentColor" />
      </g>
    ),
  },

  "deep-learning": {
    id: "deep-learning",
    name: "Deep Learning",
    category: "Artificial Intelligence & Machine Learning",
    brandColor: "#8A2BE2",
    secondaryColor: "#00F2FE",
    gradient: "from-[#8A2BE2]/25 via-[#00F2FE]/15 to-transparent",
    darkGradient: "from-[#8A2BE2]/30 via-cyan-400/15 to-transparent",
    shadowColor: "rgba(138, 43, 226, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="4" cy="7" r="2.2" fill="#8A2BE2" stroke="none" />
        <circle cx="4" cy="17" r="2.2" fill="#8A2BE2" stroke="none" />
        <circle cx="12" cy="5" r="2.2" fill="#00F2FE" stroke="none" />
        <circle cx="12" cy="12" r="2.2" fill="#00F2FE" stroke="none" />
        <circle cx="12" cy="19" r="2.2" fill="#00F2FE" stroke="none" />
        <circle cx="20" cy="12" r="2.2" fill="#FF007F" stroke="none" />
        <path d="M6 7l4-2m-4 0l4 5m-4 0l4 7m-4 5l4-12m-4 7l4-2m-4 7l4 2m6-12l6 5m-6-2l6 2m-6 5l6-2m-6 2l6-5" opacity=".7" />
      </g>
    ),
  },

  tensorflow: {
    id: "tensorflow",
    name: "TensorFlow",
    category: "Artificial Intelligence & Machine Learning",
    brandColor: "#FF6F00",
    secondaryColor: "#FFA000",
    gradient: "from-[#FF6F00]/25 via-[#FFA000]/15 to-transparent",
    darkGradient: "from-[#FF6F00]/30 via-amber-500/15 to-transparent",
    shadowColor: "rgba(255, 111, 0, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#FF6F00">
        <path d="M12 2l9 5.2v3.7L12 5.7 3 10.9V7.2L12 2z" />
        <path d="M12 7.7l7.5 4.3v7.4l-3-1.7v-4.5L12 10.6v-2.9z" fill="#FFA000" />
        <path d="M12 7.7v2.9L7.5 13.2v4.5l-3 1.7V12L12 7.7z" />
      </g>
    ),
  },

  "generative-ai": {
    id: "generative-ai",
    name: "Generative AI & LLMs",
    category: "Artificial Intelligence & Machine Learning",
    brandColor: "#10A37F",
    secondaryColor: "#6EE7B7",
    gradient: "from-[#10A37F]/25 via-emerald-400/10 to-transparent",
    darkGradient: "from-[#10A37F]/30 via-teal-400/15 to-transparent",
    shadowColor: "rgba(16, 163, 127, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="#10A37F" strokeWidth="2">
        <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2z" fill="#10A37F" />
        <path d="M19 16l1.2 2.8L23 20l-2.8 1.2L19 24l-1.2-2.8L15 20l2.8-1.2L19 16z" fill="#6EE7B7" stroke="none" />
      </g>
    ),
  },

  sql: {
    id: "sql",
    name: "SQL",
    category: "Data Science & Analytics",
    brandColor: "#00758F",
    secondaryColor: "#F29111",
    gradient: "from-[#00758F]/25 via-cyan-500/10 to-transparent",
    darkGradient: "from-[#00758F]/30 via-teal-400/15 to-transparent",
    shadowColor: "rgba(0, 117, 143, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#00758F">
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v5c0 1.7 3.6 3 8 3s8-1.3 8-3V5c0 1.7-3.6 3-8 3S4 6.7 4 5z" />
        <path d="M4 10v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5c0 1.7-3.6 3-8 3s-8-1.3-8-3z" />
        <path d="M4 15v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4c0 1.7-3.6 3-8 3s-8-1.3-8-3z" />
      </g>
    ),
  },

  mysql: {
    id: "mysql",
    name: "MySQL",
    category: "Data Science & Analytics",
    brandColor: "#4479A1",
    secondaryColor: "#00758F",
    gradient: "from-[#4479A1]/25 via-sky-500/10 to-transparent",
    darkGradient: "from-[#4479A1]/30 via-blue-400/15 to-transparent",
    shadowColor: "rgba(68, 121, 161, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#4479A1">
        <path d="M12 3C7 3 3 6 3 9.5c0 1.8 1.1 3.5 3 4.6V18l3.3-1.8c.8.2 1.7.3 2.7.3 5 0 9-3 9-6.5S17 3 12 3zm0 11c-4 0-7-2.2-7-5s3-5 7-5 7 2.2 7 5-3 5-7 5z" />
      </g>
    ),
  },

  mongodb: {
    id: "mongodb",
    name: "MongoDB",
    category: "Data Science & Analytics",
    brandColor: "#47A248",
    secondaryColor: "#13AA52",
    gradient: "from-[#47A248]/25 via-emerald-500/10 to-transparent",
    darkGradient: "from-[#47A248]/30 via-green-400/15 to-transparent",
    shadowColor: "rgba(71, 162, 72, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#47A248">
        <path d="M12 1.5s-6 6.5-6 12.5c0 4.5 3.5 8.5 6 8.5s6-4 6-8.5c0-6-6-12.5-6-12.5zm.5 18.2c-.3 0-.5-.2-.5-.5V3.8c1.8 2.5 4.5 6.5 4.5 10.2 0 3.5-2.2 5.7-4 5.7z" />
      </g>
    ),
  },

  pandas: {
    id: "pandas",
    name: "Pandas",
    category: "Data Science & Analytics",
    brandColor: "#150458",
    secondaryColor: "#E70488",
    gradient: "from-[#150458]/25 via-[#E70488]/15 to-transparent",
    darkGradient: "from-[#150458]/30 via-pink-500/15 to-transparent",
    shadowColor: "rgba(231, 4, 136, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#E70488">
        <rect x="4" y="4" width="4" height="7" rx="1" />
        <rect x="10" y="8" width="4" height="12" rx="1" fill="#150458" className="dark:fill-white" />
        <rect x="16" y="4" width="4" height="9" rx="1" />
      </g>
    ),
  },

  numpy: {
    id: "numpy",
    name: "NumPy",
    category: "Data Science & Analytics",
    brandColor: "#013243",
    secondaryColor: "#4DABCF",
    gradient: "from-[#013243]/25 via-[#4DABCF]/15 to-transparent",
    darkGradient: "from-[#4DABCF]/30 via-sky-400/15 to-transparent",
    shadowColor: "rgba(77, 171, 207, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#4DABCF">
        <path d="M4 4h4.5l6.5 11.5V4H19v16h-4.5L8 8.5V20H4V4z" />
      </g>
    ),
  },

  // ==========================================
  // MOBILE & SOFTWARE ENGINEERING
  // ==========================================
  flutter: {
    id: "flutter",
    name: "Flutter",
    category: "Mobile & Software Development",
    brandColor: "#02569B",
    secondaryColor: "#0175C2",
    gradient: "from-[#02569B]/25 via-[#0175C2]/15 to-transparent",
    darkGradient: "from-[#02569B]/30 via-cyan-400/15 to-transparent",
    shadowColor: "rgba(2, 86, 155, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#02569B">
        <path d="M14.3 2L5 11.3l2.8 2.8L19.9 2h-5.6z" />
        <path d="M14.3 12.8L8.6 18.5l2.8 2.8 8.5-8.5h-5.6z" fill="#0175C2" />
        <path d="M11.5 15.6l2.8-2.8 2.8 2.8-2.8 2.8-2.8-2.8z" fill="#29B6F6" />
      </g>
    ),
  },

  "react-native": {
    id: "react-native",
    name: "React Native",
    category: "Mobile & Software Development",
    brandColor: "#61DAFB",
    secondaryColor: "#02569B",
    gradient: "from-[#61DAFB]/25 via-blue-500/10 to-transparent",
    darkGradient: "from-[#61DAFB]/30 via-sky-400/15 to-transparent",
    shadowColor: "rgba(97, 218, 251, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="#61DAFB" strokeWidth="1.6">
        <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.6" fill="#61DAFB" stroke="none" />
      </g>
    ),
  },

  "android-dev": {
    id: "android-dev",
    name: "Android Development",
    category: "Mobile & Software Development",
    brandColor: "#3DDC84",
    secondaryColor: "#073042",
    gradient: "from-[#3DDC84]/25 via-emerald-400/10 to-transparent",
    darkGradient: "from-[#3DDC84]/30 via-green-400/15 to-transparent",
    shadowColor: "rgba(61, 220, 132, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#3DDC84">
        <path d="M6 18c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9H6v9zm6.5-14.8l1.4-1.4c.2-.2.2-.5 0-.7-.2-.2-.5-.2-.7 0l-1.6 1.6C10.8 4.3 10 4 9 4s-1.8.3-2.6.7L4.8 3.1c-.2-.2-.5-.2-.7 0-.2.2-.2.5 0 .7l1.4 1.4C3.8 6.3 3 8 3 10h12c0-2-0.8-3.7-2.5-4.8zM6 7.5c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8zm6 0c-.4 0-.8-.3-.8-.8s.3-.8.8-.8.8.3.8.8-.4.8-.8.8z" />
      </g>
    ),
  },

  "ios-dev": {
    id: "ios-dev",
    name: "iOS Development",
    category: "Mobile & Software Development",
    brandColor: "#000000",
    secondaryColor: "#999999",
    gradient: "from-neutral-700/20 via-neutral-500/10 to-transparent",
    darkGradient: "from-white/20 via-neutral-400/15 to-transparent",
    shadowColor: "rgba(0, 0, 0, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="currentColor">
        <path d="M18.7 19.5c-.8 1.2-1.7 2.4-3 2.4-1.3 0-1.7-.8-3.2-.8-1.5 0-2 .8-3.2.8-1.3 0-2.3-1.3-3.2-2.5-1.7-2.5-3-7.1-1.3-10.2.9-1.5 2.5-2.5 4.2-2.5 1.3 0 2.5.9 3.3.9.8 0 2.3-1.1 3.9-.9 1.4.1 2.5.6 3.2 1.7-2.9 1.7-2.4 5.6.5 6.9-.6 1.8-1.5 3.5-2.4 4.7zM15.9 5.8c.6-.8 1.1-1.9.9-3-.9.1-2.1.6-2.7 1.4-.6.7-1.1 1.8-.9 2.9 1 .1 2.1-.5 2.7-1.3z" />
      </g>
    ),
  },

  // ==========================================
  // DESIGN & CREATIVE TECHNOLOGIES
  // ==========================================
  figma: {
    id: "figma",
    name: "Figma",
    category: "Design & Creative Technology",
    brandColor: "#F24E1E",
    secondaryColor: "#A259FF",
    gradient: "from-[#F24E1E]/20 via-[#A259FF]/15 to-transparent",
    darkGradient: "from-[#F24E1E]/30 via-[#A259FF]/20 to-transparent",
    shadowColor: "rgba(242, 78, 30, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g>
        <path d="M8 2h4v5H8a2.5 2.5 0 0 1 0-5z" fill="#F24E1E" />
        <path d="M12 2h4a2.5 2.5 0 0 1 0 5h-4V2z" fill="#FF7262" />
        <path d="M12 7h4a2.5 2.5 0 0 1 0 5h-4V7z" fill="#1ABCFE" />
        <path d="M8 7h4v5H8a2.5 2.5 0 0 1 0-5z" fill="#A259FF" />
        <path d="M8 12h4v5a2.5 2.5 0 0 1-4 0v-5z" fill="#0ACF83" />
      </g>
    ),
  },

  blender: {
    id: "blender",
    name: "Blender",
    category: "Design & Creative Technology",
    brandColor: "#EA7600",
    secondaryColor: "#265787",
    gradient: "from-[#EA7600]/25 via-blue-500/10 to-transparent",
    darkGradient: "from-[#EA7600]/30 via-orange-400/15 to-transparent",
    shadowColor: "rgba(234, 118, 0, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="#EA7600">
        <circle cx="12" cy="14" r="5" fill="#265787" />
        <circle cx="12" cy="14" r="2.5" fill="#EA7600" />
        <path d="M12 4l1.5 5h-3L12 4zm6 3l-3.5 4 1.5 2.5 3.5-4-1.5-2.5zm-12 0l1.5 2.5 3.5 4-1.5 2.5L6 7z" />
      </g>
    ),
  },

  unity: {
    id: "unity",
    name: "Unity",
    category: "Design & Creative Technology",
    brandColor: "#000000",
    secondaryColor: "#FFFFFF",
    gradient: "from-neutral-800/20 via-neutral-500/10 to-transparent",
    darkGradient: "from-white/20 via-neutral-400/10 to-transparent",
    shadowColor: "rgba(0, 0, 0, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="currentColor">
        <path d="M12 2L4 7v10l8 5 8-5V7l-8-5zm0 3.2L17.5 8 12 11.2 6.5 8 12 5.2zM6 9.8l4.8 2.8v5.5L6 15.3V9.8zm12 5.5l-4.8 2.8v-5.5l4.8-2.8v5.5z" />
      </g>
    ),
  },

  // ==========================================
  // CYBERSECURITY
  // ==========================================
  cybersecurity: {
    id: "cybersecurity",
    name: "Security Fundamentals",
    category: "Cybersecurity",
    brandColor: "#00C853",
    secondaryColor: "#00E676",
    gradient: "from-[#00C853]/25 via-emerald-500/10 to-transparent",
    darkGradient: "from-[#00C853]/30 via-teal-400/15 to-transparent",
    shadowColor: "rgba(0, 200, 83, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="#00C853" strokeWidth="1.8">
        <path d="M12 2L4 5v6c0 5.5 3.4 10.7 8 12 4.6-1.3 8-6.5 8-12V5l-8-3z" fill="#00C853" fillOpacity=".15" />
        <path d="M9 12l2 2 4-4" stroke="#00C853" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
  },

  "ethical-hacking": {
    id: "ethical-hacking",
    name: "Ethical Hacking",
    category: "Cybersecurity",
    brandColor: "#1B5E20",
    secondaryColor: "#00E676",
    gradient: "from-emerald-700/25 via-emerald-500/10 to-transparent",
    darkGradient: "from-emerald-600/30 via-teal-400/15 to-transparent",
    shadowColor: "rgba(0, 230, 118, 0.4)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="currentColor">
        <path d="M12 2a9 9 0 0 0-9 9c0 3.9 2.5 7.2 6 8.5v2.5h6v-2.5c3.5-1.3 6-4.6 6-8.5a9 9 0 0 0-9-9zm-3 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-5.5 5.5h5v1h-5v-1z" />
      </g>
    ),
  },

  // ==========================================
  // CAREER TRACK MASTER ICONS
  // ==========================================
  "track-fullstack": {
    id: "track-fullstack",
    name: "Full-Stack Web Architect",
    category: "Career Tracks",
    brandColor: "#61DAFB",
    secondaryColor: "#339933",
    gradient: "from-[#61DAFB]/25 via-indigo-600/15 to-[#339933]/15",
    darkGradient: "from-[#61DAFB]/30 via-purple-600/20 to-teal-400/15",
    shadowColor: "rgba(97, 218, 251, 0.45)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="18" height="7" rx="2" fill="#61DAFB" fillOpacity=".2" stroke="#61DAFB" />
        <rect x="3" y="14" width="18" height="7" rx="2" fill="#339933" fillOpacity=".2" stroke="#339933" />
        <path d="M7 6.5h.01M10 6.5h.01M7 17.5h.01M10 17.5h.01" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ),
  },

  "track-ai": {
    id: "track-ai",
    name: "AI & Machine Learning Specialist",
    category: "Career Tracks",
    brandColor: "#FF6A00",
    secondaryColor: "#8A2BE2",
    gradient: "from-[#FF6A00]/25 via-amber-500/15 to-[#8A2BE2]/15",
    darkGradient: "from-[#FF6A00]/30 via-purple-600/20 to-rose-500/15",
    shadowColor: "rgba(255, 106, 0, 0.45)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none">
        <circle cx="12" cy="12" r="9" stroke="#FF6A00" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.5" fill="#FF6A00" />
        <path d="M12 3v4m0 10v4M3 12h4m10 0h4" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },

  "track-cloud": {
    id: "track-cloud",
    name: "Cloud Infrastructure & DevOps Engineer",
    category: "Career Tracks",
    brandColor: "#2496ED",
    secondaryColor: "#FF9900",
    gradient: "from-[#2496ED]/25 via-sky-500/15 to-[#FF9900]/15",
    darkGradient: "from-[#2496ED]/30 via-cyan-500/20 to-amber-500/15",
    shadowColor: "rgba(36, 150, 237, 0.45)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M19.3 11.5a5.5 5.5 0 0 0-10-2 4.5 4.5 0 0 0-3.3 4.5A4.5 4.5 0 0 0 10.5 18h8a4 4 0 0 0 4-4 4 4 0 0 0-3.2-2.5z"
          fill="#2496ED"
          fillOpacity=".2"
          stroke="#2496ED"
        />
        <path d="M12 12v4m-2-2l2 2 2-2" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    ),
  },

  "track-design": {
    id: "track-design",
    name: "UI/UX & Creative Product Designer",
    category: "Career Tracks",
    brandColor: "#F24E1E",
    secondaryColor: "#A259FF",
    gradient: "from-[#F24E1E]/25 via-rose-500/15 to-[#A259FF]/15",
    darkGradient: "from-[#F24E1E]/30 via-pink-600/20 to-purple-500/15",
    shadowColor: "rgba(242, 78, 30, 0.45)",
    viewBox: "0 0 24 24",
    svgPath: (
      <g fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8" stroke="#A259FF" />
        <circle cx="9" cy="9.5" r="1.5" fill="#F24E1E" stroke="none" />
        <circle cx="15" cy="9.5" r="1.5" fill="#0ACF83" stroke="none" />
        <circle cx="12" cy="15" r="1.5" fill="#1ABCFE" stroke="none" />
      </g>
    ),
  },
};

/**
 * Normalizes skill or course name to locate corresponding icon
 */
export function getTechIconMeta(skillIdOrName: string): TechIconMeta {
  const normalized = (skillIdOrName || "")
    .toLowerCase()
    .trim()
    .replace(/\.js$/, "")
    .replace(/\s+/g, "-");

  if (TECH_ICONS[normalized]) {
    return TECH_ICONS[normalized];
  }

  // Common aliases & substrings
  if (normalized.includes("python")) return TECH_ICONS.python;
  if (normalized.includes("javascript") || normalized === "js") return TECH_ICONS.javascript;
  if (normalized.includes("typescript") || normalized === "ts") return TECH_ICONS.typescript;
  if (normalized.includes("react-native")) return TECH_ICONS["react-native"];
  if (normalized.includes("react")) return TECH_ICONS.react;
  if (normalized.includes("next")) return TECH_ICONS.nextjs;
  if (normalized.includes("node")) return TECH_ICONS.nodejs;
  if (normalized.includes("express")) return TECH_ICONS.expressjs;
  if (normalized.includes("html")) return TECH_ICONS.html;
  if (normalized.includes("css")) return TECH_ICONS.css;
  if (normalized.includes("c++") || normalized.includes("cpp")) return TECH_ICONS.cpp;
  if (normalized === "c" || normalized.startsWith("c-")) return TECH_ICONS.c;
  if (normalized.includes("java") && !normalized.includes("javascript")) return TECH_ICONS.java;
  if (normalized.includes("go") || normalized === "golang") return TECH_ICONS.go;
  if (normalized.includes("rust")) return TECH_ICONS.rust;
  if (normalized.includes("php")) return TECH_ICONS.php;
  if (normalized.includes("kotlin")) return TECH_ICONS.kotlin;
  if (normalized.includes("swift")) return TECH_ICONS.swift;
  if (normalized.includes("flutter")) return TECH_ICONS.flutter;
  if (normalized.includes("android")) return TECH_ICONS["android-dev"];
  if (normalized.includes("ios") || normalized.includes("apple")) return TECH_ICONS["ios-dev"];
  if (normalized.includes("figma") || normalized.includes("ui/ux") || normalized.includes("design")) return TECH_ICONS.figma;
  if (normalized.includes("blender") || normalized.includes("3d")) return TECH_ICONS.blender;
  if (normalized.includes("unity") || normalized.includes("game")) return TECH_ICONS.unity;
  if (normalized.includes("docker") || normalized.includes("container")) return TECH_ICONS.docker;
  if (normalized.includes("kubernetes") || normalized.includes("k8s")) return TECH_ICONS.kubernetes;
  if (normalized.includes("aws") || normalized.includes("amazon")) return TECH_ICONS.aws;
  if (normalized.includes("azure")) return TECH_ICONS.azure;
  if (normalized.includes("google-cloud") || normalized.includes("gcp")) return TECH_ICONS["google-cloud"];
  if (normalized.includes("linux")) return TECH_ICONS.linux;
  if (normalized.includes("github")) return TECH_ICONS.github;
  if (normalized.includes("git")) return TECH_ICONS.git;
  if (normalized.includes("sql") || normalized.includes("database")) return TECH_ICONS.sql;
  if (normalized.includes("mysql")) return TECH_ICONS.mysql;
  if (normalized.includes("mongo")) return TECH_ICONS.mongodb;
  if (normalized.includes("pandas")) return TECH_ICONS.pandas;
  if (normalized.includes("numpy")) return TECH_ICONS.numpy;
  if (normalized.includes("tensorflow") || normalized.includes("keras")) return TECH_ICONS.tensorflow;
  if (normalized.includes("generative") || normalized.includes("llm") || normalized.includes("prompt")) return TECH_ICONS["generative-ai"];
  if (normalized.includes("deep-learning")) return TECH_ICONS["deep-learning"];
  if (normalized.includes("machine-learning") || normalized.includes("ml") || normalized.includes("ai")) return TECH_ICONS["machine-learning"];
  if (normalized.includes("security") || normalized.includes("cyber") || normalized.includes("ethical")) return TECH_ICONS.cybersecurity;

  // Career Tracks
  if (normalized.includes("full-stack") || normalized.includes("fullstack")) return TECH_ICONS["track-fullstack"];
  if (normalized.includes("ai-engineer") || normalized.includes("specialist") && normalized.includes("ai")) return TECH_ICONS["track-ai"];
  if (normalized.includes("cloud-infrastructure") || normalized.includes("devops")) return TECH_ICONS["track-cloud"];
  if (normalized.includes("creative-product") || normalized.includes("designer")) return TECH_ICONS["track-design"];

  // Sensible branded fallback based on first letters
  return {
    id: normalized || "tech-skill",
    name: skillIdOrName || "Skill",
    category: "Technology",
    brandColor: "#FF6A00",
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
    darkGradient: "from-sb-cyan/20 via-blue-500/10 to-transparent",
    shadowColor: "rgba(255, 106, 0, 0.35)",
    viewBox: "0 0 24 24",
    svgPath: (
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill="currentColor"
      >
        {(skillIdOrName || "SK").slice(0, 2).toUpperCase()}
      </text>
    ),
  };
}
