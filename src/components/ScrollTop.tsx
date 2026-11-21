"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * New page via a link: start at the top. Back/forward and reload: leave the browser's restored position alone.
 * (Next skips its own scroll-to-top when the page's first element is already partly in view.)
 */
export function ScrollTop() {
  const path = usePathname();
  const popped = useRef(false);
  const first = useRef(true);

  useEffect(() => {
    const onPop = () => { popped.current = true; };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (popped.current) { popped.current = false; return; }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [path]);

  return null;
}
