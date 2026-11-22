export type PortraitId =
  | "onv" | "guru" | "asan" | "vallathol" | "kunjunni" | "panicker" | "basheer" | "vt"
  | "ayyankali" | "ambedkar" | "tagore" | "gandhi" | "kalam" | "vivekananda";

export type Portrait = {
  src: string;
  nameMl: string;
  years: string;
  /** Part of the image to use, as fractions [x, y, width, height]. Default: all of it. */
  crop?: [number, number, number, number];
  /** Shown when the licence asks for attribution. */
  credit?: { by: string; licence: string; href: string };
};

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

/** Author photos from Wikimedia Commons, kept in public/img/authors. */
export const portraits: Record<PortraitId, Portrait> = {
  onv: { src: "/img/onv.jpg", nameMl: "ഒ.എൻ.വി. കുറുപ്പ്", years: "1931 – 2016" },
  guru: { src: "/img/authors/guru.jpg", nameMl: "ശ്രീനാരായണ ഗുരു", years: "1856 – 1928" },
  asan: { src: "/img/authors/asan.jpg", nameMl: "കുമാരനാശാൻ", years: "1873 – 1924", crop: [0.18, 0.19, 0.64, 0.52] },
  vallathol: { src: "/img/authors/vallathol.jpg", nameMl: "വള്ളത്തോൾ നാരായണമേനോൻ", years: "1878 – 1958", crop: [0.27, 0.0, 0.5, 0.33] },
  kunjunni: {
    src: "/img/authors/kunjunni.jpg", nameMl: "കുഞ്ഞുണ്ണി മാഷ്", years: "1927 – 2006", crop: [0.12, 0.03, 0.76, 0.42],
    credit: { by: "Sreedharantp", licence: "CC BY-SA 3.0", href: commons("Kunhunnimash.jpg") },
  },
  panicker: { src: "/img/authors/panicker.jpg", nameMl: "പി. എൻ. പണിക്കർ", years: "1909 – 1995", crop: [0.2, 0.15, 0.68, 0.5] },
  basheer: {
    src: "/img/authors/basheer.jpg", nameMl: "വൈക്കം മുഹമ്മദ് ബഷീർ", years: "1908 – 1994", crop: [0.05, 0.03, 0.9, 0.8],
    credit: { by: "Sreedharantp", licence: "CC BY-SA 3.0", href: commons("Basheer.jpg") },
  },
  vt: {
    src: "/img/authors/vt.jpg", nameMl: "വി. ടി. ഭട്ടതിരിപ്പാട്", years: "1896 – 1982",
    credit: { by: "Sreedharantp", licence: "CC BY-SA 3.0", href: commons("Vt-bhattathiri.jpg") },
  },
  ayyankali: { src: "/img/authors/ayyankali.jpg", nameMl: "അയ്യങ്കാളി", years: "1863 – 1941", crop: [0.12, 0.04, 0.76, 0.66] },
  ambedkar: { src: "/img/authors/ambedkar.jpg", nameMl: "ബി. ആർ. അംബേദ്കർ", years: "1891 – 1956" },
  tagore: {
    src: "/img/authors/tagore.jpg", nameMl: "രവീന്ദ്രനാഥ ടാഗോർ", years: "1861 – 1941", crop: [0.12, 0.03, 0.76, 0.62],
    credit: { by: "Georges Chevalier", licence: "CC BY 4.0", href: commons("1926_Rabindrath_Tagore.jpg") },
  },
  gandhi: { src: "/img/authors/gandhi.jpg", nameMl: "മഹാത്മാ ഗാന്ധി", years: "1869 – 1948", crop: [0.08, 0.0, 0.84, 0.66] },
  kalam: { src: "/img/authors/kalam.jpg", nameMl: "എ. പി. ജെ. അബ്ദുൽ കലാം", years: "1931 – 2015", crop: [0.05, 0.0, 0.9, 0.78] },
  vivekananda: { src: "/img/authors/vivekananda.jpg", nameMl: "സ്വാമി വിവേകാനന്ദൻ", years: "1863 – 1902", crop: [0.17, 0.09, 0.66, 0.6] },
};

export type Quote = { ml: string; en: string; by: string; portrait: PortraitId };

/**
 * Short lines about reading, learning and community from Kerala and India.
 * The home hero shows them in a fresh random order, each with its author's name and portrait.
 */
export const quotes: Quote[] = [
  { ml: "വായിച്ചു വളരുക, ചിന്തിച്ചു വിവേകം നേടുക", en: "Read and grow. Think and grow wise.", by: "P. N. Panicker, father of Kerala's library movement", portrait: "panicker" },
  { ml: "വിദ്യകൊണ്ട് പ്രബുദ്ധരാകുക", en: "Be enlightened through learning.", by: "Sree Narayana Guru", portrait: "guru" },
  { ml: "സംഘടനകൊണ്ട് ശക്തരാകുക", en: "Grow strong through coming together.", by: "Sree Narayana Guru", portrait: "guru" },
  { ml: "മതമേതായാലും മനുഷ്യൻ നന്നായാൽ മതി", en: "Whatever the faith, it is enough that people be good.", by: "Sree Narayana Guru", portrait: "guru" },
  { ml: "ഒരു ജാതി, ഒരു മതം, ഒരു ദൈവം മനുഷ്യന്", en: "One caste, one faith, one God for humankind.", by: "Sree Narayana Guru", portrait: "guru" },
  { ml: "സ്നേഹമാണഖിലസാരമൂഴിയിൽ", en: "Love is the essence of all the world.", by: "Kumaranasan", portrait: "asan" },
  { ml: "സ്നേഹത്തിൽ നിന്നുദിക്കുന്നു ലോകം", en: "The world rises out of love.", by: "Kumaranasan", portrait: "asan" },
  { ml: "കേരളമെന്നു കേട്ടാലോ തിളയ്ക്കണം ചോര നമുക്കു ഞരമ്പുകളിൽ", en: "Hear the word Kerala, and let the blood stir in our veins.", by: "Vallathol Narayana Menon", portrait: "vallathol" },
  { ml: "വായിച്ചാൽ വിളയും, വായിച്ചില്ലെങ്കിൽ വളയും", en: "Read, and you will flourish. Do not, and you will bend.", by: "Kunjunni Mash", portrait: "kunjunni" },
  { ml: "ഇമ്മിണി ബല്യ ഒന്ന്", en: "One and one make a slightly bigger one.", by: "Vaikom Muhammad Basheer, Balyakalasakhi", portrait: "basheer" },
  { ml: "അടുക്കളയിൽ നിന്ന് അരങ്ങത്തേക്ക്", en: "From the kitchen to the stage.", by: "V. T. Bhattathiripad, title of his 1929 play", portrait: "vt" },
  { ml: "ഞങ്ങളുടെ കുട്ടികളെ പഠിക്കാൻ അനുവദിച്ചില്ലെങ്കിൽ നിങ്ങളുടെ പാടങ്ങളിൽ മുട്ടിപ്പുല്ല് മുളയ്ക്കും", en: "If our children are not allowed to study, weeds will grow in your paddy fields.", by: "Ayyankali", portrait: "ayyankali" },
  { ml: "ഉണരൂ, എഴുന്നേൽക്കൂ, ലക്ഷ്യം നേടുംവരെ നിൽക്കരുത്", en: "Arise, awake, and stop not till the goal is reached.", by: "Swami Vivekananda", portrait: "vivekananda" },
  { ml: "മനുഷ്യനിൽ ഉള്ള പൂർണതയുടെ പ്രകാശനമാണ് വിദ്യാഭ്യാസം", en: "Education is the manifestation of the perfection already in man.", by: "Swami Vivekananda", portrait: "vivekananda" },
  { ml: "പഠിക്കുക, സമരം ചെയ്യുക, സംഘടിക്കുക", en: "Educate, agitate, organise.", by: "B. R. Ambedkar", portrait: "ambedkar" },
  { ml: "മനസ്സിന്റെ വളർച്ചയാകണം മനുഷ്യജീവിതത്തിന്റെ പരമലക്ഷ്യം", en: "Cultivation of mind should be the ultimate aim of human existence.", by: "B. R. Ambedkar", portrait: "ambedkar" },
  { ml: "മനസ്സ് ഭയരഹിതവും ശിരസ്സ് ഉന്നതവുമായിരിക്കുന്നിടത്ത്", en: "Where the mind is without fear and the head is held high.", by: "Rabindranath Tagore", portrait: "tagore" },
  { ml: "നാളെ മരിക്കുമെന്ന പോലെ ജീവിക്കുക, എന്നും ജീവിക്കുമെന്ന പോലെ പഠിക്കുക", en: "Live as if you were to die tomorrow. Learn as if you were to live forever.", by: "Mahatma Gandhi", portrait: "gandhi" },
  { ml: "എന്റെ ജീവിതമാണ് എന്റെ സന്ദേശം", en: "My life is my message.", by: "Mahatma Gandhi", portrait: "gandhi" },
  { ml: "സ്വപ്നങ്ങൾ ചിന്തകളാകുന്നു, ചിന്തകൾ പ്രവൃത്തിയാകുന്നു", en: "Dreams become thoughts, and thoughts become action.", by: "A. P. J. Abdul Kalam", portrait: "kalam" },
  { ml: "പഠനം സർഗാത്മകത തരുന്നു, സർഗാത്മകത ചിന്തയിലേക്ക് നയിക്കുന്നു", en: "Learning gives creativity. Creativity leads to thinking.", by: "A. P. J. Abdul Kalam", portrait: "kalam" },
  { ml: "ഓരോ ഗ്രാമത്തിലും ഒരു ഗ്രന്ഥശാല", en: "A library in every village.", by: "P. N. Panicker, the call of Kerala's library movement", portrait: "panicker" },
  { ml: "ഭൂമിക്കൊരു ചരമഗീതം", en: "An elegy for the Earth.", by: "O. N. V. Kurup, title of his 1984 poem", portrait: "onv" },
];
