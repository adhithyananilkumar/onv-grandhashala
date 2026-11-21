import { useId } from "react";
import { MotifShape } from "./ArtKit";

/*
 * Hand-drawn Kerala doodles that sit around the edges of a hero or banner:
 * Kathakali, Theyyam, a pookalam, an elephant with nettipattam and muthukuda,
 * Chinese fishing nets, a chundan vallam, a kettuvallam, a temple roof,
 * palm-leaf manuscripts, an uruli, the nilavilakku and the chenda.
 * Each doodle floats gently; the centre stays clear for text.
 */

const K = {
  ink: "#3b2f28",
  red: "#c0392b",
  vermilion: "#9b2c1f",
  gold: "#d29a2e",
  goldLight: "#ecc56a",
  green: "#2e7d4f",
  greenLight: "#7fb07f",
  teal: "#2f6e78",
  sepia: "#a8763e",
  paper: "#fffaf1",
  plum: "#5a2a4a",
};

const r2 = (n: number) => Math.round(n * 100) / 100;
const line = { stroke: K.ink, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/* ───────── individual doodles (each drawn in its own viewBox) ───────── */

function Kathakali() {
  return (
    <svg viewBox="0 0 100 110">
      <g {...line}>
        {/* kireedam halo */}
        <circle cx="50" cy="46" r="40" fill={K.gold} fillOpacity="0.35" />
        <circle cx="50" cy="46" r="32" fill="none" strokeDasharray="1 5" />
        {Array.from({ length: 18 }, (_, i) => {
          const a = Math.PI + (i / 17) * Math.PI;
          return <circle key={i} cx={r2(50 + Math.cos(a) * 36)} cy={r2(46 + Math.sin(a) * 36)} r="2.2" fill={K.red} strokeWidth="0.8" />;
        })}
        {/* crown dome */}
        <path d="M28 40 C 30 20 70 20 72 40 Z" fill={K.red} fillOpacity="0.8" />
        <path d="M32 40 H 68" strokeWidth="3" stroke={K.gold} />
        {/* green pacha face */}
        <path d="M32 44 C 32 70 40 84 50 84 C 60 84 68 70 68 44 Z" fill={K.green} fillOpacity="0.75" />
        {/* chutti: white paper ridge framing the jaw */}
        <path d="M30 56 C 26 80 40 96 50 96 C 60 96 74 80 70 56 C 66 74 60 86 50 86 C 40 86 34 74 30 56 Z" fill={K.paper} />
        <path d="M33 66 l -3 2 M36 76 l -3 3 M42 84 l -2 3 M50 87 v 4 M58 84 l 2 3 M64 76 l 3 3 M67 66 l 3 2" strokeWidth="1.2" />
        {/* brows, eyes, tilak, lips */}
        <path d="M36 52 C 40 48 45 48 47 52 M53 52 C 55 48 60 48 64 52" strokeWidth="2.4" />
        <path d="M37 58 C 40 55 45 55 47 58 C 45 61 40 61 37 58 Z M53 58 C 55 55 60 55 63 58 C 60 61 55 61 53 58 Z" fill={K.paper} />
        <circle cx="42" cy="58" r="1.4" fill={K.ink} /><circle cx="58" cy="58" r="1.4" fill={K.ink} />
        <path d="M50 42 v 8" stroke={K.vermilion} strokeWidth="3" />
        <path d="M43 72 C 47 75 53 75 57 72 C 53 70 47 70 43 72 Z" fill={K.red} />
      </g>
    </svg>
  );
}

function Theyyam() {
  return (
    <svg viewBox="0 0 100 110">
      <g {...line}>
        {/* the great round mudi */}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const x = r2(50 + Math.cos(a) * 44), y = r2(48 + Math.sin(a) * 44);
          return <path key={i} d={`M50 48 L ${x} ${y}`} strokeWidth="1" opacity="0.6" />;
        })}
        <circle cx="50" cy="48" r="44" fill="none" strokeWidth="2" />
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return <circle key={i} cx={r2(50 + Math.cos(a) * 44)} cy={r2(48 + Math.sin(a) * 44)} r="3" fill={i % 2 ? K.gold : K.red} strokeWidth="0.8" />;
        })}
        <circle cx="50" cy="48" r="30" fill={K.red} fillOpacity="0.55" />
        <circle cx="50" cy="48" r="22" fill={K.gold} fillOpacity="0.5" />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const x = r2(50 + Math.cos(a) * 26), y = r2(48 + Math.sin(a) * 26);
          return <ellipse key={i} cx={x} cy={y} rx="3" ry="6" transform={`rotate(${r2((a * 180) / Math.PI + 90)} ${x} ${y})`} fill={K.paper} strokeWidth="0.8" />;
        })}
        {/* face */}
        <path d="M38 60 C 38 84 44 96 50 96 C 56 96 62 84 62 60 Z" fill={K.vermilion} fillOpacity="0.8" />
        <path d="M42 68 C 45 66 48 66 49 68 M51 68 C 52 66 55 66 58 68" stroke={K.paper} strokeWidth="2" />
        <path d="M44 80 C 48 83 52 83 56 80" stroke={K.paper} strokeWidth="1.6" fill="none" />
        <path d="M50 62 v 6" stroke={K.goldLight} strokeWidth="2.4" />
      </g>
    </svg>
  );
}

function Pookalam() {
  const ring = (n: number, rad: number, rx: number, ry: number, fill: string) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const x = r2(50 + Math.cos(a) * rad), y = r2(50 + Math.sin(a) * rad);
      return <ellipse key={`${rad}-${i}`} cx={x} cy={y} rx={rx} ry={ry} transform={`rotate(${r2((a * 180) / Math.PI + 90)} ${x} ${y})`} fill={fill} />;
    });
  return (
    <svg viewBox="0 0 100 100">
      <g {...line} strokeWidth="0.9">
        <circle cx="50" cy="50" r="47" fill={K.goldLight} fillOpacity="0.35" strokeWidth="1.6" />
        {ring(20, 40, 4, 7.5, K.gold)}
        <circle cx="50" cy="50" r="32" fill={K.paper} />
        {ring(14, 26, 4, 7, K.red)}
        <circle cx="50" cy="50" r="18" fill={K.green} fillOpacity="0.55" />
        {ring(8, 11, 3, 5.5, K.paper)}
        <circle cx="50" cy="50" r="4" fill={K.gold} />
      </g>
    </svg>
  );
}

function Elephant() {
  return (
    <svg viewBox="0 0 140 120">
      <g {...line}>
        {/* muthukuda: the tall festival umbrella */}
        <path d="M60 4 V 26" />
        <path d="M38 24 C 40 10 80 10 82 24 Z" fill={K.red} fillOpacity="0.8" />
        <path d="M38 24 C 46 30 52 22 60 28 C 68 22 74 30 82 24" fill="none" stroke={K.gold} strokeWidth="2.2" />
        {[42, 50, 58, 66, 74].map((x) => <path key={x} d={`M${x} 26 v 6`} stroke={K.gold} strokeWidth="1.4" />)}
        {/* body */}
        <path d="M24 92 C 18 60 36 40 66 40 C 92 40 108 54 110 74 C 112 88 108 98 104 104 L 96 104 L 94 90 L 78 90 L 76 106 L 66 106 L 64 90 L 46 92 L 44 106 L 34 106 Z" fill={K.sepia} fillOpacity="0.35" />
        {/* trunk */}
        <path d="M110 74 C 122 82 124 98 116 110 C 114 112 110 110 112 106 C 118 96 114 86 106 82" fill={K.sepia} fillOpacity="0.35" />
        {/* ear */}
        <path d="M88 52 C 78 56 76 72 86 80 C 92 74 94 62 88 52 Z" fill={K.sepia} fillOpacity="0.25" />
        {/* nettipattam: the golden caparison on the forehead */}
        <path d="M92 44 L 112 50 L 106 80 Z" fill={K.gold} fillOpacity="0.85" />
        {[[100, 52], [104, 58], [102, 64], [105, 70], [97, 50]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" fill={K.paper} strokeWidth="0.6" />)}
        <circle cx="98" cy="62" r="1.8" fill={K.ink} />
        <path d="M112 88 C 118 90 122 88 124 84" stroke={K.paper} strokeWidth="2.4" />
        {/* rider's cloth */}
        <path d="M48 42 C 52 52 70 54 76 42" fill={K.teal} fillOpacity="0.5" />
        <path d="M60 28 V 40" />
        <path d="M14 112 H 126" strokeWidth="1.2" opacity="0.5" />
      </g>
    </svg>
  );
}

function FishingNet() {
  return (
    <svg viewBox="0 0 140 110">
      <g {...line}>
        {/* cheenavala: the cantilevered Chinese net of Kochi */}
        <path d="M30 98 L 74 18 M44 98 L 74 18" strokeWidth="2.2" />
        <path d="M74 18 L 130 40" strokeWidth="2" />
        <path d="M74 18 L 22 10" strokeWidth="2" />
        <path d="M22 10 V 34" strokeWidth="1" />
        {[16, 22, 28].map((x) => <circle key={x} cx={x} cy={34 + (x - 16) / 2} r="3.4" fill={K.sepia} fillOpacity="0.6" />)}
        <path d="M130 40 L 108 72 M130 40 L 138 74" strokeWidth="1.2" />
        <path d="M104 72 C 112 84 132 84 140 74 Z" fill={K.teal} fillOpacity="0.18" />
        <path d="M108 72 L 122 82 M114 72 L 128 81 M120 72 L 134 79 M126 72 L 138 76 M112 78 L 132 72" strokeWidth="0.7" />
        <path d="M18 98 H 60 L 54 92 H 24 Z" fill={K.sepia} fillOpacity="0.4" />
        <path d="M0 102 C 30 98 60 106 90 100 C 110 97 128 104 140 100" strokeWidth="1.2" stroke={K.teal} />
        <path d="M60 108 C 80 104 100 110 124 106" strokeWidth="1" stroke={K.teal} opacity="0.7" />
      </g>
    </svg>
  );
}

function SnakeBoat() {
  return (
    <svg viewBox="0 0 200 70">
      <g {...line}>
        {/* chundan vallam: long, low, with the tall curled stern */}
        <path d="M6 44 C 50 52 130 54 170 44 C 182 40 188 28 192 6 C 196 30 190 48 176 54 C 130 64 50 62 6 48 Z" fill={K.ink} fillOpacity="0.8" />
        <path d="M188 12 l 6 -4" stroke={K.gold} strokeWidth="2" />
        {Array.from({ length: 14 }, (_, i) => 20 + i * 10).map((x, i) => (
          <g key={x}>
            <circle cx={x} cy={i % 2 ? 37 : 38} r="2.6" fill={i % 3 ? K.ink : K.red} strokeWidth="0.6" />
            <path d={`M${x} 40 L ${x - 7} 62`} stroke={K.sepia} strokeWidth="1.3" />
          </g>
        ))}
        {/* muthukuda on the boat */}
        <path d="M100 32 V 18" strokeWidth="1.2" />
        <path d="M92 19 C 94 12 106 12 108 19 Z" fill={K.gold} strokeWidth="1" />
        <path d="M0 64 C 40 60 80 68 120 64 C 150 61 180 66 200 63" stroke={K.teal} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

function Houseboat() {
  return (
    <svg viewBox="0 0 140 70">
      <g {...line}>
        {/* kettuvallam: thatched rice-barge houseboat */}
        <path d="M8 44 C 30 56 110 56 132 42 L 126 52 C 104 62 34 62 14 52 Z" fill={K.sepia} fillOpacity="0.55" />
        <path d="M22 44 C 22 22 44 18 50 18 C 56 18 62 22 70 18 C 78 22 84 18 90 18 C 96 18 118 22 118 44" fill={K.goldLight} fillOpacity="0.55" />
        {[36, 52, 70, 88, 104].map((x) => <path key={x} d={`M${x} 22 C ${x - 2} 30 ${x - 2} 38 ${x} 44`} strokeWidth="1" />)}
        {[44, 62, 80, 96].map((x) => <rect key={x} x={x - 4} y="32" width="8" height="7" rx="1.5" fill={K.paper} strokeWidth="1" />)}
        <path d="M2 62 C 30 58 60 66 90 62 C 110 60 126 64 140 61" stroke={K.teal} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

function Temple() {
  return (
    <svg viewBox="0 0 110 110">
      <g {...line}>
        {/* Kerala temple: sloping tiled roofs, a gable, the brass finial, and the flagstaff */}
        <path d="M55 4 C 51 8 51 12 55 14 C 59 12 59 8 55 4 Z" fill={K.gold} />
        <path d="M55 14 V 20" />
        <path d="M20 46 L 55 20 L 90 46 C 84 44 78 44 74 46 L 36 46 C 32 44 26 44 20 46 Z" fill={K.vermilion} fillOpacity="0.65" />
        <path d="M44 34 L 55 26 L 66 34 Z" fill={K.gold} fillOpacity="0.7" strokeWidth="1.2" />
        {[30, 40, 50, 60, 70, 80].map((x) => <path key={x} d={`M${x} ${46 - Math.abs(x - 55) * 0.2} L ${x + (x < 55 ? 6 : -6)} ${38 - Math.abs(x - 55) * 0.4}`} strokeWidth="0.8" opacity="0.7" />)}
        <path d="M28 46 V 54 H 82 V 46" fill={K.paper} />
        <path d="M8 74 L 28 54 H 82 L 102 74 C 94 72 88 72 84 74 H 26 C 22 72 16 72 8 74 Z" fill={K.vermilion} fillOpacity="0.5" />
        <rect x="26" y="74" width="58" height="26" fill={K.paper} />
        {[34, 44, 66, 76].map((x) => <path key={x} d={`M${x} 74 V 100`} strokeWidth="1.2" />)}
        <path d="M50 100 V 84 C 50 78 60 78 60 84 V 100" fill={K.gold} fillOpacity="0.4" strokeWidth="1.2" />
        <path d="M18 104 H 92" strokeWidth="2" />
        {/* dhwaja stambham (flagstaff) */}
        <path d="M100 104 V 50" strokeWidth="2" stroke={K.gold} />
        {[58, 66, 74, 82, 90].map((y) => <path key={y} d={`M97 ${y} h 6`} stroke={K.gold} strokeWidth="1.4" />)}
        <path d="M100 50 l -4 -6 h 8 Z" fill={K.gold} strokeWidth="1" />
      </g>
    </svg>
  );
}

function PalmLeaves() {
  return (
    <svg viewBox="0 0 120 80">
      <g {...line}>
        {/* thaliyola: palm-leaf manuscripts tied with a cord, with a stylus */}
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i * 4} ${i * -8}) rotate(${-4 + i * 3} 60 50)`}>
            <rect x="8" y="44" width="100" height="16" rx="8" fill={i === 2 ? K.goldLight : K.sepia} fillOpacity={i === 2 ? 0.75 : 0.4} />
            {i === 2 && <path d="M22 50 h 18 M44 50 h 10 M70 50 h 24 M22 55 h 30 M58 55 h 14 M76 55 h 18" strokeWidth="0.8" />}
            <circle cx="34" cy="52" r="1.6" fill={K.paper} strokeWidth="0.6" />
            <circle cx="84" cy="52" r="1.6" fill={K.paper} strokeWidth="0.6" />
          </g>
        ))}
        <path d="M42 36 C 36 18 52 12 54 22" stroke={K.red} strokeWidth="1.4" fill="none" />
        <path d="M74 74 L 116 14" strokeWidth="2.2" stroke={K.sepia} />
        <path d="M116 14 l 2 -6" strokeWidth="1.2" />
      </g>
    </svg>
  );
}

function Uruli() {
  return (
    <svg viewBox="0 0 120 70">
      <g {...line}>
        {/* uruli: a wide bell-metal bowl with floating flowers */}
        <path d="M8 30 C 14 60 106 60 112 30 Z" fill={K.gold} fillOpacity="0.55" />
        <ellipse cx="60" cy="30" rx="52" ry="8" fill={K.teal} fillOpacity="0.3" />
        <path d="M4 30 H 16 M104 30 H 116" strokeWidth="2.4" />
        <path d="M46 62 h 28" strokeWidth="2" />
        {[[36, 28, K.red], [56, 30, K.goldLight], [76, 28, K.red], [90, 31, K.paper], [26, 31, K.paper]].map(([x, y, c]) => (
          <g key={`${x}`}>
            {[0, 72, 144, 216, 288].map((a) => {
              const rad = ((a as number) * Math.PI) / 180;
              return <circle key={a} cx={r2((x as number) + Math.cos(rad) * 3)} cy={r2((y as number) + Math.sin(rad) * 1.6)} r="2.4" fill={c as string} strokeWidth="0.5" />;
            })}
            <circle cx={x as number} cy={y as number} r="1.2" fill={K.gold} strokeWidth="0" />
          </g>
        ))}
        <path d="M40 22 C 46 12 56 12 60 20 C 64 12 74 12 80 22" stroke={K.green} strokeWidth="1.4" fill="none" />
      </g>
    </svg>
  );
}

function Birds() {
  return (
    <svg viewBox="0 0 120 50">
      <g {...line} strokeWidth="1.6" fill="none">
        <path d="M10 26 q 8 -10 14 0 q 6 -10 14 0" />
        <path d="M50 12 q 6 -8 11 0 q 5 -8 11 0" />
        <path d="M84 30 q 7 -9 12 0 q 5 -9 12 0" />
        <path d="M66 40 q 4 -6 8 0 q 4 -6 8 0" opacity="0.6" />
      </g>
    </svg>
  );
}

function Kolam() {
  return (
    <svg viewBox="0 0 100 100">
      <g {...line} strokeWidth="1.2" fill="none">
        {/* dotted kolam: a single loop drawn around a grid of dots */}
        {[25, 50, 75].flatMap((x) => [25, 50, 75].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r="2" fill={K.ink} stroke="none" />))}
        <path d="M50 8 C 70 8 70 30 50 37 C 30 30 30 8 50 8 Z M92 50 C 92 70 70 70 63 50 C 70 30 92 30 92 50 Z M50 92 C 30 92 30 70 50 63 C 70 70 70 92 50 92 Z M8 50 C 8 30 30 30 37 50 C 30 70 8 70 8 50 Z" stroke={K.vermilion} />
        <path d="M14 14 C 38 14 38 38 50 50 C 62 62 62 86 86 86 M86 14 C 62 14 62 38 50 50 C 38 62 38 86 14 86" />
        <circle cx="50" cy="50" r="30" strokeDasharray="2 4" />
      </g>
    </svg>
  );
}

function MotifDoodle({ m, fill, accent, vb = "0 0 100 100" }: { m: Parameters<typeof MotifShape>[0]["m"]; fill: string; accent: string; vb?: string }) {
  return (
    <svg viewBox={vb}>
      <MotifShape m={m} line={K.ink} fill={fill} accent={accent} />
    </svg>
  );
}

const Lamp = () => <MotifDoodle m="lamp" fill={K.gold} accent={K.goldLight} />;
const Drum = () => <MotifDoodle m="drum" fill={K.teal} accent={K.red} />;
const Lotus = () => <MotifDoodle m="lotus" fill={K.red} accent={K.green} />;
const Palm = () => <MotifDoodle m="palm" fill={K.green} accent={K.sepia} />;
const Book = () => <MotifDoodle m="book" fill={K.goldLight} accent={K.red} />;
const Brush = () => <MotifDoodle m="brush" fill={K.teal} accent={K.gold} />;
const Leaf = () => <MotifDoodle m="leaf" fill={K.green} accent={K.gold} />;

const DOODLES = {
  kathakali: Kathakali, theyyam: Theyyam, pookalam: Pookalam, elephant: Elephant, net: FishingNet, snakeboat: SnakeBoat,
  houseboat: Houseboat, temple: Temple, palmleaf: PalmLeaves, uruli: Uruli, birds: Birds, kolam: Kolam,
  lamp: Lamp, drum: Drum, lotus: Lotus, palm: Palm, book: Book, brush: Brush, leaf: Leaf,
};
type Doodle = keyof typeof DOODLES;

/* ───────── layouts: where each doodle sits, per screen size ───────── */

type Spot = { d: Doodle; cls: string; float?: "a" | "b" | "c"; delay?: number };

// Home hero: the centre ~70% is text, so doodles hug the four edges.
// On phones only the top and bottom bands are used (the sides are too narrow).
const HOME: Spot[] = [
  { d: "kathakali", cls: "top-[7%] left-[4%] w-[22%] sm:top-[11%] sm:left-[3.5%] sm:w-[12%] lg:w-[10.5%]", float: "a" },
  { d: "theyyam", cls: "top-[7%] right-[4%] w-[22%] sm:top-[10%] sm:right-[3.5%] sm:w-[12%] lg:w-[10.5%]", float: "b", delay: 2 },
  { d: "birds", cls: "top-[9%] left-[39%] w-[22%] sm:top-[8%] sm:left-[44%] sm:w-[12%]", float: "c" },
  { d: "pookalam", cls: "hidden sm:block top-[8%] left-[20%] w-[7%] lg:w-[6%]", float: "b", delay: 1 },
  { d: "temple", cls: "hidden sm:block top-[6%] right-[19%] w-[8%] lg:w-[7%]", float: "a", delay: 3 },
  { d: "lamp", cls: "hidden md:block top-[40%] left-[4%] w-[8%]", float: "c", delay: 1 },
  { d: "drum", cls: "hidden md:block top-[42%] right-[4%] w-[8.5%]", float: "a", delay: 2 },
  { d: "palmleaf", cls: "hidden lg:block top-[63%] left-[3%] w-[11%]", float: "b" },
  { d: "uruli", cls: "hidden lg:block top-[64%] right-[3%] w-[11%]", float: "c", delay: 2 },
  { d: "elephant", cls: "bottom-[4%] left-[3%] w-[30%] sm:bottom-[5%] sm:w-[15%]", float: "b", delay: 1 },
  { d: "net", cls: "bottom-[4%] right-[3%] w-[30%] sm:bottom-[5%] sm:w-[15%]", float: "a" },
  { d: "snakeboat", cls: "bottom-[4%] left-[36%] w-[28%] sm:bottom-[5%] sm:left-[22%] sm:w-[20%]", float: "c", delay: 3 },
  { d: "houseboat", cls: "hidden sm:block bottom-[6%] right-[22%] w-[14%]", float: "b", delay: 2 },
  { d: "kolam", cls: "hidden lg:block bottom-[7%] left-[45%] w-[5%] opacity-70", float: "a", delay: 4 },
];

// Page banners are short: two doodles each side on desktop, one small corner each side on phones.
const side = (l1: Doodle, l2: Doodle, r1: Doodle, r2d: Doodle): Spot[] => [
  { d: l1, cls: "top-[14%] left-[4%] w-[17%] opacity-60 sm:top-[16%] sm:left-[4%] sm:w-[10%] sm:opacity-100 lg:w-[8.5%]", float: "a" },
  { d: l2, cls: "hidden sm:block bottom-[10%] left-[13%] w-[11%] lg:w-[10%]", float: "b", delay: 2 },
  { d: r1, cls: "top-[14%] right-[4%] w-[17%] opacity-60 sm:top-[16%] sm:right-[4%] sm:w-[10%] sm:opacity-100 lg:w-[8.5%]", float: "b", delay: 1 },
  { d: r2d, cls: "hidden sm:block bottom-[10%] right-[13%] w-[11%] lg:w-[10%]", float: "c", delay: 3 },
];

const SETS = {
  home: HOME,
  books: side("palmleaf", "lamp", "book", "kolam"),
  classes: side("kathakali", "brush", "drum", "pookalam"),
  events: side("theyyam", "snakeboat", "elephant", "temple"),
  market: side("uruli", "palm", "leaf", "houseboat"),
  join: side("lamp", "pookalam", "kathakali", "book"),
  empty: [] as Spot[],
};
export type SceneSet = keyof typeof SETS;

/** Doodle layer. Parent must be `relative overflow-hidden`. */
export function HeroScene({ set = "home", className = "" }: { set?: SceneSet; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <svg width="0" height="0" className="absolute">
        <filter id={`ink${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {SETS[set].map((s, i) => {
        const D = DOODLES[s.d];
        return (
          <div key={`${s.d}${i}`} className={`absolute ${s.cls}`}>
            <div
              className={`doodle float-${s.float ?? "a"} [&>svg]:h-auto [&>svg]:w-full [&>svg]:overflow-visible`}
              style={{ animationDelay: `${-(s.delay ?? 0) * 2}s`, filter: `url(#ink${id})` }}
            >
              <D />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** A single doodle, for empty states and small decorations. */
export function DoodleArt({ d, className }: { d: Doodle; className?: string }) {
  const D = DOODLES[d];
  return <div aria-hidden="true" className={`[&>svg]:h-auto [&>svg]:w-full ${className ?? ""}`}><D /></div>;
}
