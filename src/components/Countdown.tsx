"use client";

import { useEffect, useState } from "react";

function format(ms: number) {
  if (ms <= 0) return "Auction closed";
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return d > 0 ? `Ends in ${d}d ${h}h ${m}m` : `Ends in ${h}h ${m}m ${sec.toString().padStart(2, "0")}s`;
}

export function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = new Date(to).getTime();
    const tick = () => setLeft(end - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [to]);
  return (
    <p className="mt-1 font-mono text-[11px] text-clay tabular-nums" suppressHydrationWarning>
      {left === null ? " " : format(left)}
    </p>
  );
}
