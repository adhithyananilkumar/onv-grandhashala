// Sample data used until the Supabase backend is connected (see PLAN.md, phase 2).

export type Book = {
  id: string;
  title: string;
  titleMl?: string;
  author: string;
  language: "Malayalam" | "English";
  category: string;
  available: number;
  copies: number;
  shelf: string;
  hue: number; // cover colour for the generated placeholder cover
};

export const books: Book[] = [
  { id: "b1", title: "Ujjayini", titleMl: "ഉജ്ജയിനി", author: "O. N. V. Kurup", language: "Malayalam", category: "Poetry", available: 2, copies: 3, shelf: "P-12", hue: 150 },
  { id: "b2", title: "Randamoozham", titleMl: "രണ്ടാമൂഴം", author: "M. T. Vasudevan Nair", language: "Malayalam", category: "Novel", available: 0, copies: 2, shelf: "N-04", hue: 18 },
  { id: "b3", title: "Khasakkinte Itihasam", titleMl: "ഖസാക്കിന്റെ ഇതിഹാസം", author: "O. V. Vijayan", language: "Malayalam", category: "Novel", available: 1, copies: 2, shelf: "N-09", hue: 40 },
  { id: "b4", title: "Balyakalasakhi", titleMl: "ബാല്യകാലസഖി", author: "Vaikom Muhammad Basheer", language: "Malayalam", category: "Novel", available: 3, copies: 4, shelf: "N-01", hue: 200 },
  { id: "b5", title: "Aarachar", titleMl: "ആരാച്ചാർ", author: "K. R. Meera", language: "Malayalam", category: "Novel", available: 1, copies: 1, shelf: "N-15", hue: 350 },
  { id: "b6", title: "Aadujeevitham", titleMl: "ആടുജീവിതം", author: "Benyamin", language: "Malayalam", category: "Novel", available: 0, copies: 3, shelf: "N-17", hue: 30 },
  { id: "b7", title: "Bhoomikkoru Charamageetham", titleMl: "ഭൂമിക്കൊരു ചരമഗീതം", author: "O. N. V. Kurup", language: "Malayalam", category: "Poetry", available: 1, copies: 1, shelf: "P-12", hue: 110 },
  { id: "b8", title: "The God of Small Things", author: "Arundhati Roy", language: "English", category: "Novel", available: 2, copies: 2, shelf: "E-03", hue: 280 },
  { id: "b9", title: "Wings of Fire", author: "A. P. J. Abdul Kalam", language: "English", category: "Biography", available: 1, copies: 2, shelf: "E-11", hue: 220 },
  { id: "b10", title: "Panchatantra Kathakal", titleMl: "പഞ്ചതന്ത്രം കഥകൾ", author: "Retold", language: "Malayalam", category: "Children", available: 4, copies: 5, shelf: "C-02", hue: 60 },
  { id: "b11", title: "Kerala PSC Rank File", author: "Talent Academy", language: "Malayalam", category: "PSC / Reference", available: 0, copies: 4, shelf: "R-01", hue: 5 },
  { id: "b12", title: "Chemmeen", titleMl: "ചെമ്മീൻ", author: "Thakazhi Sivasankara Pillai", language: "Malayalam", category: "Novel", available: 2, copies: 2, shelf: "N-02", hue: 190 },
];

export type ClassItem = {
  id: string;
  title: string;
  titleMl: string;
  teacher: string;
  schedule: string;
  ages: string;
  fee: string;
  seatsLeft: number;
  tone: "green" | "gold" | "clay";
};

export const classes: ClassItem[] = [
  { id: "c1", title: "Carnatic Vocal", titleMl: "കർണാടക സംഗീതം", teacher: "Smt. Lakshmi", schedule: "Sat & Sun · 4:00 PM", ages: "8+", fee: "₹300 / month", seatsLeft: 4, tone: "gold" },
  { id: "c2", title: "Drawing & Painting", titleMl: "ചിത്രരചന", teacher: "Sri. Anil Kumar", schedule: "Sunday · 10:00 AM", ages: "6 – 16", fee: "₹200 / month", seatsLeft: 9, tone: "clay" },
  { id: "c3", title: "Bharatanatyam", titleMl: "ഭരതനാട്യം", teacher: "Smt. Divya", schedule: "Wed & Sat · 5:00 PM", ages: "6+", fee: "₹400 / month", seatsLeft: 2, tone: "green" },
  { id: "c4", title: "Yoga for All", titleMl: "യോഗ", teacher: "Sri. Mohanan", schedule: "Daily · 6:00 AM", ages: "All ages", fee: "Free", seatsLeft: 15, tone: "green" },
  { id: "c5", title: "PSC Coaching", titleMl: "പി.എസ്.സി പരിശീലനം", teacher: "Volunteer team", schedule: "Sunday · 2:00 PM", ages: "18+", fee: "Free", seatsLeft: 6, tone: "gold" },
  { id: "c6", title: "Computer Basics", titleMl: "കമ്പ്യൂട്ടർ പഠനം", teacher: "Akshaya volunteers", schedule: "Tue & Thu · 6:30 PM", ages: "40+", fee: "Free", seatsLeft: 8, tone: "clay" },
];

export type EventItem = {
  id: string;
  title: string;
  titleMl: string;
  date: string; // ISO date
  time: string;
  place: string;
  kind: "Health" | "Camp" | "Literary" | "Culture";
  blurb: string;
};

export const events: EventItem[] = [
  { id: "e1", title: "Free Eye Check-up Camp", titleMl: "സൗജന്യ നേത്ര പരിശോധന ക്യാമ്പ്", date: "2026-11-29", time: "9:00 AM – 1:00 PM", place: "Library Hall", kind: "Health", blurb: "Vision screening and low-cost spectacles. Register for a token slot." },
  { id: "e2", title: "Remembering ONV: Poetry Evening", titleMl: "ഒ.എൻ.വി സ്മൃതി: കാവ്യസന്ധ്യ", date: "2026-12-06", time: "5:30 PM", place: "Open-air stage", kind: "Literary", blurb: "Recitations and songs by students and local poets." },
  { id: "e3", title: "Christmas Holiday Camp for Kids", titleMl: "ക്രിസ്മസ് അവധിക്കാല ക്യാമ്പ്", date: "2026-12-22", time: "3 days · 9:30 AM", place: "Library & grounds", kind: "Camp", blurb: "Stories, crafts, theatre games and a nature walk. Ages 7–14." },
  { id: "e4", title: "Diabetes & BP Screening", titleMl: "പ്രമേഹ, രക്തസമ്മർദ്ദ പരിശോധന", date: "2027-01-10", time: "8:00 AM – 12:00 PM", place: "Library Hall", kind: "Health", blurb: "With the Primary Health Centre. Come fasting for the sugar test." },
];

export type Product = {
  id: string;
  name: string;
  nameMl: string;
  seller: string;
  price: number;
  unit: string;
  emoji: string;
  auction?: { currentBid: number; bids: number; endsAt: string };
};

export const products: Product[] = [
  { id: "p1", name: "Banana chips (fresh, coconut oil)", nameMl: "ഏത്തക്കായ ഉപ്പേരി", seller: "Sreelakshmi Kudumbashree", price: 120, unit: "250 g", emoji: "🍌" },
  { id: "p2", name: "Pure coconut oil, cold pressed", nameMl: "വെളിച്ചെണ്ണ", seller: "Raghavan's Mill", price: 260, unit: "1 L", emoji: "🥥" },
  { id: "p3", name: "Handwoven kasavu mundu", nameMl: "കസവ് മുണ്ട്", seller: "Balaramapuram Weavers", price: 950, unit: "piece", emoji: "🧵", auction: { currentBid: 1150, bids: 7, endsAt: "2026-11-21T18:00:00+05:30" } },
  { id: "p4", name: "Raw jackfruit (whole)", nameMl: "പച്ച ചക്ക", seller: "Thomas, Farmer", price: 80, unit: "each", emoji: "🍈", auction: { currentBid: 140, bids: 4, endsAt: "2026-11-19T20:00:00+05:30" } },
  { id: "p5", name: "Organic turmeric powder", nameMl: "മഞ്ഞൾപ്പൊടി", seller: "Haritha Farm Group", price: 90, unit: "200 g", emoji: "🌿" },
  { id: "p6", name: "Clay water pot (handmade)", nameMl: "മൺകുടം", seller: "Kumaran Potteries", price: 350, unit: "piece", emoji: "🏺", auction: { currentBid: 420, bids: 3, endsAt: "2026-11-23T17:00:00+05:30" } },
];
