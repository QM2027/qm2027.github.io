import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Sans_KR, Source_Serif_4 } from "next/font/google";
import { DevNotice } from "@/components/DevNotice";
import { PrefsSync } from "@/components/Edition";
import { AppNav } from "@/components/pwa/AppNav";
import { PwaSupport } from "@/components/pwa/PwaSupport";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { PREFS_SCRIPT } from "@/lib/edition-script";
import { SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

const serif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"] });
const sans = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"] });
// Korean glyphs come in many unicode-range files; let the browser fetch only what a page uses.
const sansKr = IBM_Plex_Sans_KR({ variable: "--font-plex-kr", weight: ["400", "600"], preload: false });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  // Origin only: Next adds the base path to metadata URLs itself.
  metadataBase: new URL(new URL(SITE_URL).origin),
  title: { default: SITE.guideName, template: `%s · ${SITE.guideName}` },
  appleWebApp: { capable: true, title: "QM2027", statusBarStyle: "default" },
  description: `Visitor guide to Jeju for ${SITE.name} participants (${SITE.dates}, ${SITE.venue}): maps, transport, food and the venue. Official conference information is on Indico.`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0e" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} ${sansKr.variable} ${mono.variable} h-full antialiased`}
      // The preview script below adds data-edition / data-notice before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col font-sans has-[[data-fill-viewport]]:h-dvh">
        <PrefsSync />
        <SiteNav />
        <DevNotice />
        <div className="flex min-h-0 flex-1 flex-col pb-[env(safe-area-inset-bottom)] standalone:max-lg:pb-0">
          {children}
          <SiteFooter />
        </div>
        <AppNav />
        <PwaSupport />
      </body>
    </html>
  );
}
