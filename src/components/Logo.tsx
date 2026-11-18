import Image from "next/image";
import { site } from "@/lib/site";

/*
 * All variants use the library's original logo artwork, unchanged.
 * Only the white background was removed (see scripts/brand-cut.cjs).
 *   public/brand/onv-logo.png        full emblem, black, transparent
 *   public/brand/onv-logo-white.png  full emblem, white, for dark backgrounds
 *   public/brand/onv-icon.png        icon only (book + reader), black
 *   public/brand/onv-icon-white.png  icon only, white
 *   public/brand/loader-*.png        icon split into head + book, for the loader
 */

const ICON_W = 604;
const ICON_H = 327;
const LOGO_W = 636;
const LOGO_H = 496;

export function LogoIcon({ className, white = false, priority = false }: { className?: string; white?: boolean; priority?: boolean }) {
  return (
    <Image
      src={white ? "/brand/onv-icon-white.png" : "/brand/onv-icon.png"}
      alt=""
      width={ICON_W}
      height={ICON_H}
      priority={priority}
      className={className}
    />
  );
}

export function LogoFull({ className, white = false }: { className?: string; white?: boolean }) {
  return (
    <Image
      src={white ? "/brand/onv-logo-white.png" : "/brand/onv-logo.png"}
      alt={`${site.nameMl}, ${site.addressMl}, Reg. No. ${site.regNo}`}
      width={LOGO_W}
      height={LOGO_H}
      className={className}
    />
  );
}

/** Header lockup: original icon + name set in type. */
export function LogoLockup() {
  return (
    <span className="flex items-center gap-2.5">
      <LogoIcon className="h-9 w-auto shrink-0" priority />
      <span className="leading-tight">
        <span className="block font-ml text-[15px] font-bold text-ink">{site.nameMl}</span>
        <span className="block text-[10.5px] font-medium text-muted">
          <span className="hidden lg:inline">{site.nameEn} · </span>{site.placeEn}
        </span>
      </span>
    </span>
  );
}

/** Animated loader: the book opens up from the spine, then the reader drops in. */
export function LogoLoader({ className, label = "Loading…" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={`inline-flex flex-col items-center gap-3 ${className ?? ""}`}>
      <span className="onv-loader relative block w-28" style={{ aspectRatio: `${ICON_W} / ${ICON_H}` }} aria-hidden="true">
        <Image src="/brand/loader-book.png" alt="" fill sizes="112px" className="onv-book object-contain" />
        <Image src="/brand/loader-head.png" alt="" fill sizes="112px" className="onv-head object-contain" />
      </span>
      <span className="font-ml text-sm text-muted">{label}</span>
    </span>
  );
}
