// Library facts. Values marked PLACEHOLDER must be replaced with real details.
export const site = {
  nameEn: "ONV Grameena Grandhashala",
  nameMl: "ഒ.എൻ.വി ഗ്രാമീണ ഗ്രന്ഥശാല",
  placeEn: "Puthanambalam",
  placeMl: "പുത്തനമ്പലം",
  tagline: "Read. Learn. Gather. Grow.",
  taglineMl: "വായിച്ചു വളരുക, ചിന്തിച്ചു വിവേകം നേടുക",
  phone: "+91 00000 00000", // PLACEHOLDER
  whatsapp: "910000000000", // PLACEHOLDER
  email: "contact@example.org", // PLACEHOLDER
  address: "Aivarkala Padinjattu Vadakku, Puthanambalam P.O., Kerala", // from the logo; add district + PIN
  addressMl: "ഐവർകാല, പടി: വടക്ക്, പുത്തനമ്പലം പി.ഒ",
  regNo: "02KNT9008",
  hours: [
    { days: "Mon – Sat", time: "8:00 AM – 1:00 PM · 3:00 PM – 8:00 PM" }, // PLACEHOLDER
    { days: "Sunday", time: "8:00 AM – 12:00 PM" }, // PLACEHOLDER
  ],
  stats: [
    { value: "12,000+", label: "Books", ml: "പുസ്തകങ്ങൾ" }, // PLACEHOLDER
    { value: "1,500+", label: "Members", ml: "അംഗങ്ങൾ" }, // PLACEHOLDER
    { value: "8", label: "Weekly classes", ml: "ക്ലാസുകൾ" }, // PLACEHOLDER
    { value: "40+", label: "Local sellers", ml: "വിൽപനക്കാർ" }, // PLACEHOLDER
  ],
};

export const nav = [
  { href: "/", label: "Home", ml: "ഹോം", icon: "home" },
  { href: "/catalogue", label: "Books", ml: "പുസ്തകം", icon: "book" },
  { href: "/classes", label: "Classes", ml: "ക്ലാസുകൾ", icon: "music" },
  { href: "/events", label: "Events", ml: "പരിപാടി", icon: "calendar" },
  { href: "/vipani", label: "Vipani", ml: "വിപണി", icon: "basket" },
] as const;
