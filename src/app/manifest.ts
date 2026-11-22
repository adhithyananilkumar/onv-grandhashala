import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** Makes the site installable: home-screen icon, full-screen app window, shortcuts. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${site.nameEn}, ${site.placeEn}`,
    short_name: "ONV Library",
    description: "Search and reserve books, join classes and events, and shop local at Naattu Vipani.",
    lang: "ml-IN",
    dir: "ltr",
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#f6f1e6",
    theme_color: "#f6f1e6",
    categories: ["books", "education", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Find a book", short_name: "Books", url: "/catalogue", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Events and camps", short_name: "Events", url: "/events", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "My library card", short_name: "My card", url: "/me/card", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
