"use client";

import { useState } from "react";
import { api, ApiError, invalidate, useApi } from "@/lib/api";
import { useRequireLogin } from "@/lib/session";
import { MessageCircle, Send, Star } from "lucide-react";
import { useMember } from "./Actions";

export type Comment = { id: string; name: string; text: string; rating: number; date: string };

const AVATAR_TINTS = ["bg-royal text-mist", "bg-kani text-ink", "bg-teal text-mist", "bg-laterite text-mist", "bg-ink text-mist"];

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
const tint = (n: string) => AVATAR_TINTS[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_TINTS.length];
const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Stars({ value, onChange, size = 16 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const icon = <Star size={size} className={n <= value ? "fill-kani text-kani" : "text-line"} />;
        return onChange ? (
          <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n > 1 ? "s" : ""}`} className="rounded p-0.5 transition-transform hover:scale-110">
            {icon}
          </button>
        ) : (
          <span key={n}>{icon}</span>
        );
      })}
    </span>
  );
}

/** Reader comments for one item, from the API. Posting needs a signed-in member. */
export function Comments({ itemId, title = "What readers say" }: { itemId: string; title?: string }) {
  const url = `/api/comments?item=${encodeURIComponent(itemId)}`;
  const { data, loading } = useApi<Comment[]>(url);
  const member = useMember();
  const requireLogin = useRequireLogin();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const all = data ?? [];
  const avg = all.length ? all.reduce((a, c) => a + c.rating, 0) / all.length : 0;

  const post = async () => {
    if (text.trim().length < 3) return setError("Write a few words first.");
    setBusy(true);
    try {
      await api("/api/comments", { body: { item: itemId, text, rating } });
      setText(""); setError("");
      invalidate(url);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };
  const submit = (e: React.FormEvent) => { e.preventDefault(); requireLogin(post, "Sign in to post a comment."); };

  return (
    <section aria-labelledby="comments-h">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12.5px] font-semibold tracking-[0.16em] text-kani-700 uppercase">Comments</p>
          <h2 id="comments-h" className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        </div>
        {all.length > 0 && (
          <div className="flex items-center gap-3 rounded-full bg-card px-4 py-2 ring-1 ring-line/70">
            <span className="font-display text-xl font-bold">{avg.toFixed(1)}</span>
            <Stars value={Math.round(avg)} />
            <span className="text-[14px] text-muted">{all.length} {all.length === 1 ? "comment" : "comments"}</span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-14">
        <ul className="grid gap-4 sm:grid-cols-2 lg:order-1">
          {loading && [0, 1].map((i) => <li key={i} className="h-36 animate-pulse rounded-3xl bg-mist-2" />)}
          {!loading && all.length === 0 && (
            <li className="col-span-full grid place-items-center rounded-3xl border-2 border-dashed border-line p-10 text-center text-muted">
              <MessageCircle size={28} />
              <p className="mt-2">No comments yet. Be the first to share a thought.</p>
            </li>
          )}
          {all.map((c) => (
            <li key={c.id} className="flex flex-col rounded-3xl bg-card p-5 ring-1 ring-line/70">
              <div className="flex items-center gap-3">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full text-[14px] font-bold ${tint(c.name)}`}>{initials(c.name)}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="text-[13px] text-muted">{fmt(c.date)}</p>
                </div>
                <Stars value={c.rating} size={14} />
              </div>
              <p className="mt-3 text-[15.5px] leading-relaxed text-ink-2">{c.text}</p>
            </li>
          ))}
        </ul>

        <form onSubmit={submit} className="self-start rounded-[28px] bg-royal p-6 text-mist lg:order-2">
          <h3 className="font-display text-xl font-bold">Add a comment</h3>
          <p className="mt-1 text-[14.5px] text-mist/70">Read it already? Tell your neighbours.</p>
          <div className="mt-5 space-y-3">
            <p className="flex h-[50px] items-center rounded-2xl bg-white/10 px-4 text-[15px] text-mist/85">
              {member ? <>Posting as <b className="ml-1 font-semibold text-mist">{member.name}</b></> : "You'll be asked to sign in to post."}
            </p>
            <textarea
              value={text} onChange={(e) => setText(e.target.value)} placeholder="What did you think?" aria-label="Comment" rows={4}
              className="w-full resize-none rounded-2xl bg-white/10 px-4 py-3 text-[16px] text-mist ring-2 ring-transparent placeholder:text-mist/50 focus:bg-white/15 focus:ring-kani focus:outline-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-mist/70">Your rating</span>
              <Stars value={rating} onChange={setRating} size={20} />
            </div>
            {error && <p className="text-[13.5px] font-medium text-kani" role="alert">{error}</p>}
            <button type="submit" disabled={busy} className="disabled:opacity-70flex w-full items-center justify-center gap-2 rounded-full bg-kani py-3.5 font-semibold text-ink transition-all hover:brightness-105 active:scale-[0.99]">
              <Send size={17} /> Post comment
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
