// Mock database: src/mock/db.json is the seed; changes are written to .mock-data/db.json
// so they survive restarts. Delete that folder to start fresh. Swap this file for Supabase later.

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import seed from "@/mock/db.json";
import type { Book, ClassItem, Comment, EventItem, LibRequest, Loan, Notice, Payment, Product, Settings, User } from "@/lib/types";

export type StoredUser = User & { salt: string; hash: string; fails: number; lockUntil: number };
export type Session = { card: string; exp: number };

export type DB = {
  settings: Settings;
  books: Book[];
  classes: ClassItem[];
  events: EventItem[];
  products: Product[];
  users: StoredUser[];
  sessions: Record<string, Session>;
  loans: Loan[];
  requests: LibRequest[];
  payments: Payment[];
  notices: Notice[];
  comments: Comment[];
};

let file = process.env.MOCK_DB_PATH ?? path.join(process.cwd(), ".mock-data", "db.json");

async function load(): Promise<DB> {
  try {
    return JSON.parse(await fs.readFile(/*turbopackIgnore: true*/ file, "utf8")) as DB;
  } catch {
    return structuredClone(seed) as unknown as DB;
  }
}

async function save(db: DB) {
  try {
    await fs.mkdir(/*turbopackIgnore: true*/ path.dirname(file), { recursive: true });
    await fs.writeFile(/*turbopackIgnore: true*/ file, JSON.stringify(db, null, 2));
  } catch {
    // Read-only disk (e.g. serverless): fall back to the temp folder.
    file = path.join(os.tmpdir(), "onv-mock-db.json");
    await fs.writeFile(/*turbopackIgnore: true*/ file, JSON.stringify(db, null, 2));
  }
}

let queue: Promise<unknown> = Promise.resolve();

/** Read the database. */
export const read = () => load();

/** Change the database. Writes are queued so two requests never overwrite each other. */
export function write<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const out = await fn(db);
    await save(db);
    return out;
  });
  queue = run.catch(() => undefined);
  return run;
}

export const publicUser = ({ salt: _s, hash: _h, fails: _f, lockUntil: _l, ...u }: StoredUser): User => u;

export const newId = (prefix: string) => `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;

/** The four digits that identify a card, so "ONV 4821", "4821" and "onv-4821" all match. */
export const cardKey = (c: string) => c.match(/\d{4}/)?.[0] ?? "";
export const findUser = (db: DB, card: string) => db.users.find((u) => cardKey(u.card) === cardKey(card));

export const DAY = 86_400_000;
/** Late fine owed on a loan right now (or when it was returned). */
export function fineFor(l: Loan, perDay: number, now = Date.now()) {
  const end = l.returnedAt ? new Date(l.returnedAt).getTime() : now;
  const late = Math.floor((end - new Date(l.dueAt).getTime()) / DAY);
  return late > 0 ? late * perDay : 0;
}
