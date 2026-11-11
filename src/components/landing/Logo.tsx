export function BridgeArchIcon({
  className = "w-5 h-3.5 text-[#D41514]",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 30 18"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M0 0h30v18h-6c-1.5-7.5-5-11-9-11s-7.5 3.5-9 11H0V0z" />
    </svg>
  );
}

/**
 * SkillBridge Brand Symbol: Interlocking S-curves
 * Upper arc: White (#FFFFFF)
 * Lower arc: Laser Crimson Red (#D41514)
 * Center nexus: White (#FFFFFF)
 */
export default function Logo({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="sb-logo-white" x1="4" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E5E5E5" />
        </linearGradient>
        <linearGradient id="sb-logo-crimson" x1="6" y1="6" x2="36" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF2D2D" />
          <stop offset="1" stopColor="#D41514" />
        </linearGradient>
      </defs>
      {/* interlocking S: upper arc (White) + lower arc (Laser Crimson Red), bridged by a deck line */}
      <path d="M31 12.5C28.5 8 22 6 16.5 8.6 11 11.2 10.5 17 15.5 19.6l9 4.4" stroke="url(#sb-logo-white)" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M9 27.5C11.5 32 18 34 23.5 31.4 29 28.8 29.5 23 24.5 20.4l-9-4.4" stroke="url(#sb-logo-crimson)" strokeWidth="3.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="2" fill="#FFFFFF" />
    </svg>
  );
}

export { SkillBridgeWordmark } from "@/components/ui/SkillBridgeWordmark";
