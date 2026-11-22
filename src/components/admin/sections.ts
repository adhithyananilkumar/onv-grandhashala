import {
  BadgeIndianRupee, BookOpen, BookUp, CalendarDays, ChartNoAxesColumn, ClipboardList, Gavel, LayoutDashboard, Megaphone,
  Palette, Settings, ShoppingBasket, Users, Wallet,
} from "lucide-react";

export const SECTIONS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Today" },
  { key: "desk", label: "Issue & return", icon: BookUp, group: "Today" },
  { key: "requests", label: "Requests", icon: ClipboardList, group: "Today" },
  { key: "members", label: "Members", icon: Users, group: "People" },
  { key: "events", label: "Events", icon: CalendarDays, group: "People" },
  { key: "books", label: "Books", icon: BookOpen, group: "Library" },
  { key: "classes", label: "Classes", icon: Palette, group: "Library" },
  { key: "products", label: "Vipani", icon: ShoppingBasket, group: "Library" },
  { key: "auctions", label: "Live bidding", icon: Gavel, group: "Library" },
  { key: "accounts", label: "Accounts", icon: Wallet, group: "Money" },
  { key: "payments", label: "Member payments", icon: BadgeIndianRupee, group: "Money" },
  { key: "reports", label: "Reports", icon: ChartNoAxesColumn, group: "Money" },
  { key: "notices", label: "Notices", icon: Megaphone, group: "Site" },
  { key: "settings", label: "Settings", icon: Settings, group: "Site" },
] as const;

export type SectionKey = (typeof SECTIONS)[number]["key"];
export const GROUPS = ["Today", "People", "Library", "Money", "Site"] as const;
export const sectionPath = (k: SectionKey) => (k === "dashboard" ? "/admin" : `/admin/${k}`);
export const isSection = (k: string): k is SectionKey => SECTIONS.some((s) => s.key === k);

/** Something a screen should do when you arrive from a shortcut (open the add form, search for a name…). */
export type Pending = { section: SectionKey; action?: string; q?: string; id?: string };
