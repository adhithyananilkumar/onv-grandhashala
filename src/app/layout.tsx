import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Mono, Instrument_Serif, Manjari, Noto_Serif_Malayalam } from "next/font/google";
import { SiteHeader, BottomDock } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"], display: "swap" });
const manjari = Manjari({ variable: "--font-manjari", subsets: ["malayalam"], weight: ["400", "700"], display: "swap" });
const notoMl = Noto_Serif_Malayalam({ variable: "--font-noto-ml", subsets: ["malayalam"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: `${site.nameEn}, ${site.placeEn} | ${site.nameMl}`,
    template: `%s · ${site.nameEn}`,
  },
  description:
    "Public library in Puthanambalam, Kerala. Search and reserve books, join arts and music classes, register for health camps and events, and shop local at ONV Naattu Vipani.",
};

export const viewport: Viewport = {
  themeColor: "#f5f2ea",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ml-IN"
      className={`${instrument.variable} ${geist.variable} ${plexMono.variable} ${manjari.variable} ${notoMl.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-0">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Footer />
        <BottomDock />
      </body>
    </html>
  );
}
