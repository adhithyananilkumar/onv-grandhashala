"use client";

// Small fetch layer for the mock API: JSON in and out, a shared cache per URL,
// and invalidate() so every screen showing that data refetches after a change.

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { Catalog } from "./types";

export class ApiError extends Error {
  constructor(public status: number, message: string, public field?: string) { super(message); }
}

export async function api<T>(url: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: init?.method ?? (init?.body !== undefined ? "POST" : "GET"),
      headers: init?.body !== undefined ? { "content-type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "You seem to be offline. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, (data as { error?: string }).error ?? "Something went wrong.", (data as { field?: string }).field);
  return data as T;
}

type Entry = { data?: unknown; error?: ApiError; loading: boolean; at: number; promise?: Promise<void> };
const cache = new Map<string, Entry>();
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
const EMPTY: Entry = { loading: true, at: 0 };

function load(url: string, force = false) {
  const e = cache.get(url);
  if (e?.promise || (!force && e && Date.now() - e.at < 15_000 && !e.error)) return;
  const next: Entry = { ...(e ?? EMPTY), loading: true };
  next.promise = api(url)
    .then((data) => { cache.set(url, { data, loading: false, at: Date.now() }); })
    .catch((err: ApiError) => { cache.set(url, { data: cache.get(url)?.data, error: err, loading: false, at: Date.now() }); })
    .finally(emit);
  cache.set(url, next);
}

/** Refetch every cached URL that starts with one of these prefixes. */
export function invalidate(...prefixes: string[]) {
  for (const url of cache.keys()) if (prefixes.some((p) => url.startsWith(p))) { const e = cache.get(url)!; cache.set(url, { ...e, at: 0 }); load(url, true); }
  emit();
}

/** Put fresh data in the cache without a refetch (after a write that returns it). */
export function setCache(url: string, data: unknown) {
  cache.set(url, { data, loading: false, at: Date.now() });
  emit();
}

/** Fetch JSON from the API and keep it in step with invalidate(). Pass null to skip. */
export function useApi<T>(url: string | null) {
  const subscribe = useCallback((f: () => void) => { subs.add(f); return () => { subs.delete(f); }; }, []);
  const entry = useSyncExternalStore(subscribe, () => (url ? cache.get(url) ?? EMPTY : EMPTY), () => EMPTY);
  useEffect(() => { if (url) { load(url); emit(); } }, [url]);
  return {
    data: entry.data as T | undefined,
    error: entry.error,
    loading: !!url && entry.loading && entry.data === undefined,
    refresh: useCallback(() => { if (url) load(url, true); }, [url]),
  };
}

/** Start fetching a URL into the shared cache without rendering anything (warms the next screen). */
export const prefetchApi = (url: string) => load(url);

/** All public content (books, classes, events, Vipani). */
export const useCatalog = () => useApi<Catalog>("/api/catalog");

/** While `active`, refetch all public content every few seconds (a live auction on screen). */
export function useLivePoll(active: boolean, ms = 4000, until?: string) {
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => { if (!until || Date.now() < new Date(until).getTime() + 5000) invalidate("/api/catalog"); }, ms);
    return () => clearInterval(id);
  }, [active, ms, until]);
}

/** After changing content, refetch everything that shows it. */
export const refreshContent = () => invalidate("/api/catalog", "/api/admin", "/api/me");
