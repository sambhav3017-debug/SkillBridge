import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, Outfit, Newsreader, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import SpatialPortalFrame from "@/components/motion/SpatialPortalFrame";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://skillbridge.edu"),
  title: {
    default: "SkillBridge — Your Potential. Our Bridge.",
    template: "%s | SkillBridge",
  },
  description:
    "SkillBridge connects students, industry, and academia to build verified skills, launch capstones, create opportunities, and shape accelerated careers.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/icon.svg",
  },
  openGraph: {
    title: "SkillBridge — Your Potential. Our Bridge.",
    description:
      "A unified ecosystem connecting students, universities, and industry partners through verified skills, collaborative projects, and direct career pathways.",
    siteName: "SkillBridge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillBridge — Your Potential. Our Bridge.",
    description:
      "Connecting students, industry, and academia through verified skills and real-world opportunities.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${jakarta.variable} ${inter.variable} ${outfit.variable} ${newsreader.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
              var m=localStorage.getItem('skillbridge-theme-mode')||localStorage.getItem('skillbridge-theme');
              var t='dark';
              if(m==='light'||m==='dark'){t=m;}
              else if(m==='system'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}
              document.documentElement.dataset.theme=t;
              if(t==='light')document.documentElement.classList.add('light');
              if(localStorage.getItem('skillbridge-reduced-motion')==='true')document.documentElement.dataset.reducedMotion='true';
              if(localStorage.getItem('skillbridge-text-size')==='large')document.documentElement.dataset.textSize='large';
              if(localStorage.getItem('skillbridge-high-contrast')==='true')document.documentElement.dataset.highContrast='true';
              var lang=localStorage.getItem('skillbridge-lang')||'en';
              document.documentElement.lang=lang;
            }catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <ThemeProvider>
            <SpatialPortalFrame>{children}</SpatialPortalFrame>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
