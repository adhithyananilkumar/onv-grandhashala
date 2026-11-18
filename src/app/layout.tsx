import type { Metadata, Viewport } from "next";
import { Anek_Malayalam, Bricolage_Grotesque, Figtree } from "next/font/google";
import { SiteHeader, BottomDock } from "@/components/Nav";
import { Footer } from "@/components/Footer";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ml-IN" className={`${bricolage.variable} ${figtree.variable} ${anek.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-0">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomDock />
      </body>
    </html>
  );
}
