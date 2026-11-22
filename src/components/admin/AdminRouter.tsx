"use client";

import { Desk, Dashboard, Requests } from "./AdminOps";
import { AccountsPanel, ReportsPanel } from "./AdminMoney";
import { AuctionsPanel } from "./AdminAuctions";
import { BooksPanel, EventsPanel } from "./AdminBooksEvents";
import { ContentManager, MembersPanel, NoticesPanel, PaymentsPanel, SettingsPanel } from "./AdminContent";
import { BookDetail, ClassDetail, EventDetail, ProductDetail } from "./AdminDetails";
import { ClassesPanel } from "./AdminBooksEvents";
import { useAdmin } from "./AdminShell";

/** Picks the screen for the current /admin/… address. */
export function AdminRouter() {
  const { d, section, id } = useAdmin();
  if (id) {
    if (section === "events") return <EventDetail d={d} id={id} />;
    if (section === "classes") return <ClassDetail d={d} id={id} />;
    if (section === "books") return <BookDetail d={d} id={id} />;
    if (section === "products") return <ProductDetail d={d} id={id} />;
  }
  switch (section) {
    case "desk": return <Desk d={d} />;
    case "requests": return <Requests d={d} />;
    case "members": return <MembersPanel d={d} />;
    case "events": return <EventsPanel d={d} />;
    case "books": return <BooksPanel d={d} />;
    case "classes": return <ClassesPanel d={d} />;
    case "products": return <ContentManager d={d} type="products" />;
    case "auctions": return <AuctionsPanel d={d} />;
    case "accounts": return <AccountsPanel d={d} />;
    case "payments": return <PaymentsPanel d={d} />;
    case "reports": return <ReportsPanel d={d} />;
    case "notices": return <NoticesPanel d={d} />;
    case "settings": return <SettingsPanel d={d} />;
    default: return <Dashboard d={d} />;
  }
}
