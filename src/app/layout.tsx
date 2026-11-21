import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Anek_Malayalam, Bricolage_Grotesque, Figtree } from "next/font/google";
import { SiteHeader, BottomDock } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ChromeGate } from "@/components/ChromeGate";
import { ScrollTop } from "@/components/ScrollTop";
import { LoginHost } from "@/components/LoginSheet";
import { site } from "@/lib/site";
import "./globals.css";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], display: "swap" });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" });
const anek = Anek_Malayalam({ variable: "--font-anek", subsets: ["malayalam", "latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${site.nameEn}, ${site.placeEn} | ${site.nameMl}`,
    template: `%s | ${site.nameEn}`,
  },
  description:
    "Public library in Puthanambalam, Kerala. Search and reserve books, join arts and music classes, register for health camps and events, and shop local at ONV Naattu Vipani.",
};

export const viewport: Viewport = {
  themeColor: "#f6f1e6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Before first paint: if the session hint cookie says we are signed in, switch to the app layout
// (no hero flash, menu instead of the sign-in button). /api/auth/me confirms it right after.
const AUTH_HINT = `try{var m=document.cookie.match(/(?:^|; )onv_role=(member|admin)/);if(m)document.documentElement.dataset.auth=m[1]}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ml-IN" suppressHydrationWarning className={`${bricolage.variable} ${figtree.variable} ${anek.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: AUTH_HINT }} />
      </head>
      <body className="flex min-h-svh flex-col pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-0 app:pb-[calc(76px+env(safe-area-inset-bottom))] app:md:pb-0">
        <Suspense><ScrollTop /></Suspense>
        {/* The chrome reads the URL; on pages with ids in them that happens at request time. */}
        <Suspense fallback={<div aria-hidden className="h-[76px] md:h-20" />}><ChromeGate><SiteHeader /></ChromeGate></Suspense>
        <main className="min-h-svh flex-1">{children}</main>
        <Suspense><ChromeGate><div className="app:max-md:hidden"><Footer /></div></ChromeGate></Suspense>
        <Suspense><ChromeGate><BottomDock /></ChromeGate></Suspense>
        <Suspense><LoginHost /></Suspense>
      </body>
    </html>
  );
}
