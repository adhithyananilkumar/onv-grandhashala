"use client";

import { useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { useRequireLogin } from "@/lib/session";

/**
 * A button that opens the action form (reserve, enrol, register, order, bid) in a modal sheet.
 * Visitors are asked to sign in first; signed-in members go straight to the form.
 */
export function ActionModal({ label, title, note, children, className = "" }: {
  label: string; title: string; note?: string; children: React.ReactNode; className?: string;
}) {
  const dlg = useRef<HTMLDialogElement>(null);
  const requireLogin = useRequireLogin();
  // Re-mount the form each time it opens, so a finished booking doesn't stay on screen.
  const [round, setRound] = useState(0);
  const open = () => requireLogin(() => { setRound((r) => r + 1); dlg.current?.showModal(); }, `Sign in to ${label.toLowerCase()}.`);
  return (
    <>
      <button
        type="button"
        onClick={open}
        className={`inline-flex items-center justify-center gap-2.5 rounded-full bg-royal px-7 py-4 text-[16.5px] font-semibold text-mist shadow-lift transition-all hover:bg-royal-700 active:scale-[0.98] ${className}`}
      >
        {label} <ArrowRight size={18} />
      </button>
      <dialog
        ref={dlg}
        onClick={(e) => { if (e.target === dlg.current) dlg.current?.close(); }}
        className="m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto overscroll-contain rounded-[28px] bg-card p-0 text-ink shadow-[0_30px_80px_-20px_rgb(20_30_28/0.5)] backdrop:bg-ink/45 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold">{title}</h2>
              {note && <p className="mt-1 text-[15px] text-muted">{note}</p>}
            </div>
            <button type="button" aria-label="Close" onClick={() => dlg.current?.close()} className="grid size-9 shrink-0 place-items-center rounded-full bg-mist-2 text-ink-2 hover:bg-line">
              <X size={18} />
            </button>
          </div>
          <div className="mt-6" key={round}>{round > 0 && children}</div>
        </div>
      </dialog>
    </>
  );
}
