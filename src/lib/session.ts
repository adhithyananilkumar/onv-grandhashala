"use client";

import { useCallback, useEffect } from "react";
import { api, invalidate, setCache, useApi } from "./api";
import type { User } from "./types";

const ME = "/api/auth/me";
const ASK = "onv-ask-login";

/** Switch the page between the visitor and the signed-in (app) layout. */
export function setAuthAttr(user: User | null) {
  const root = document.documentElement;
  if (user) root.dataset.auth = user.role;
  else delete root.dataset.auth;
}

/** The signed-in member, from the session cookie. `ready` is false until the first check finishes. */
export function useSession() {
  const { data, loading } = useApi<{ user: User | null }>(ME);
  const user = data?.user ?? null;
  useEffect(() => { if (data) setAuthAttr(user); }, [data, user]);
  return { user, ready: !loading, isAdmin: user?.role === "admin" };
}

/** Tell the service worker to forget saved pages and data, so nothing carries over between people. */
function clearUserCaches() {
  try { navigator.serviceWorker?.controller?.postMessage("clear-user-caches"); } catch { /* no worker */ }
}

function signedIn(user: User) {
  clearUserCaches();
  setCache(ME, { user });
  setAuthAttr(user);
  invalidate("/api/me", "/api/admin");
}

export async function login(card: string, pin: string) {
  const { user } = await api<{ user: User }>("/api/auth/login", { body: { card, pin } });
  signedIn(user);
  return user;
}

export async function register(details: Record<string, unknown>) {
  const { user } = await api<{ user: User }>("/api/auth/register", { body: details });
  signedIn(user);
  return user;
}

export async function resetPin(phone: string, otp: string, pin: string) {
  const { user } = await api<{ user: User }>("/api/auth/reset", { body: { phone, otp, pin } });
  signedIn(user);
  return user;
}

export async function logout() {
  await api("/api/auth/logout", { body: {} }).catch(() => undefined);
  clearUserCaches();
  setCache(ME, { user: null });
  setAuthAttr(null);
  invalidate("/api/me", "/api/admin");
}

/** Update the cached user after a profile change. */
export const updateSessionUser = (user: User) => { setCache(ME, { user }); setAuthAttr(user); };

/* ───────── "Sign in to continue" ───────── */

type Ask = { resolve: (ok: boolean) => void; reason?: string };

/** Open the sign-in sheet. Resolves true once signed in, false if closed. */
export function askLogin(reason?: string) {
  return new Promise<boolean>((resolve) => {
    window.dispatchEvent(new CustomEvent<Ask>(ASK, { detail: { resolve, reason } }));
  });
}

export function onAskLogin(fn: (a: Ask) => void) {
  const h = (e: Event) => fn((e as CustomEvent<Ask>).detail);
  window.addEventListener(ASK, h);
  return () => window.removeEventListener(ASK, h);
}

/** Run an action now if signed in; otherwise ask to sign in first, then run it. */
export function useRequireLogin() {
  const { user } = useSession();
  return useCallback(async (run: () => void, reason?: string) => {
    if (user) return run();
    if (await askLogin(reason)) run();
  }, [user]);
}

export const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
