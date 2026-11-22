/**
 * Line-art doodle for the offline screen: an open book, a paper plane looping above it on a dashed
 * trail (the message waits until you are back online), a crescent moon and a few stars.
 * Peacock-green ink with gold accents, round caps, no fills to speak of: quiet and light.
 * Motion is a slow float on whole groups (cheap transforms only); none with reduced motion.
 */
export function OfflineDoodle({ className = "" }: { className?: string }) {
  const ink = "var(--color-royal)";
  const gold = "var(--color-kani)";
  return (
    <svg viewBox="0 0 260 200" fill="none" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {/* Soft ground wash. */}
      <ellipse cx="130" cy="178" rx="92" ry="9" fill="var(--color-mist-2)" />

      {/* Moon and stars. */}
      <g className="offline-float-slow">
        <path d="M62 26a16 16 0 1 0 14 24 13 13 0 1 1-14-24Z" stroke={gold} strokeWidth="2.2" fill="var(--color-kani-50)" />
      </g>
      <g stroke={gold} strokeWidth="1.8">
        <path className="offline-twinkle" d="M232 98v8M228 102h8" />
        <path className="offline-twinkle [animation-delay:1.2s]" d="M178 22v6M175 25h6" />
        <path className="offline-twinkle [animation-delay:2.1s]" d="M34 92v5M31.5 94.5h5" />
      </g>

      {/* Dashed trail looping up from the book to the plane. */}
      <path d="M128 132c-6-24-34-30-42-14-9 18 22 28 40 6 14-17 24-42 52-50" stroke={ink} strokeWidth="1.6" strokeDasharray="3 6" opacity="0.45" />

      {/* Paper plane, hovering. */}
      <g className="offline-float">
        <g transform="translate(176 52) rotate(-14)">
          <path d="M0 14 34 0 22 30 15 19Z" stroke={ink} strokeWidth="2.2" fill="var(--color-card)" />
          <path d="M34 0 15 19l-2 11 7-8" stroke={ink} strokeWidth="2.2" />
        </g>
      </g>

      {/* Open book. */}
      <g stroke={ink} strokeWidth="2.4">
        <path d="M130 172c-16-9-38-12-64-9v-46c26-3 48 0 64 10" fill="var(--color-card)" />
        <path d="M130 172c16-9 38-12 64-9v-46c-26-3-48 0-64 10" fill="var(--color-card)" />
        <path d="M130 127v45" />
        {/* Page lines. */}
        <g strokeWidth="1.6" opacity="0.5">
          <path d="M78 130c16-1 30 1 42 6M78 141c16-1 30 1 42 6M78 152c12-1 22 0 30 3" />
          <path d="M182 130c-16-1-30 1-42 6M182 141c-16-1-30 1-42 6M182 152c-12-1-22 0-30 3" />
        </g>
      </g>
      {/* A small gold bookmark ribbon. */}
      <path d="M164 121v20l5-4 5 4v-21" stroke={gold} strokeWidth="2" fill="var(--color-kani-50)" />
    </svg>
  );
}
