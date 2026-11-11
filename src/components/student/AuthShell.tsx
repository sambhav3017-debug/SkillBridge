import Link from "next/link";
import { ArrowLeft, FlaskConical } from "lucide-react";
import Logo, { SkillBridgeWordmark } from "@/components/landing/Logo";
import ThemeToggle from "@/components/theme/ThemeToggle";

/** Shared frame for entry / signup / login / forgot-password. */
export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-sb-blue/20 blur-[130px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[420px] w-[420px] rounded-full bg-sb-pink/15 blur-[130px]" />

      <header className="relative z-10 mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="SkillBridge home">
          <Logo size={30} />
          <SkillBridgeWordmark className="text-lg" portal="auth" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-sb-muted transition-colors hover:text-white">
            <ArrowLeft size={16} aria-hidden="true" /> Back to website
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-12 pt-2 sm:px-8">
        <div className={`rise w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
          <div className="glass p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-sb-muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-5 text-center text-sm text-sb-muted">{footer}</div>}
          <p className="mt-6 flex items-start justify-center gap-2 text-center text-xs text-sb-muted/80">
            <FlaskConical size={14} className="mt-0.5 flex-none" aria-hidden="true" />
            <span>
              Demo mode: accounts are stored in a local file on this server. This is not production authentication.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
}
