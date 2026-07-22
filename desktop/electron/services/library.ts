import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type LibrarySource = "youtube" | "soundcloud" | "spotify" | "beatport" | "local";

export type LibraryEntry = {
  id: string;
  title: string;
  source: LibrarySource;
  originalUrl: string;
  filePath: string;
  format: string;
  createdAt: number;
};

const LIBRARY_FILE = "library.json";

function getLibraryPath() {
  return path.join(app.getPath("userData"), LIBRARY_FILE);
}

function readAll(): LibraryEntry[] {
  try {
    const p = getLibraryPath();
    if (fs.existsSync(p)) {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      if (Array.isArray(data)) return data as LibraryEntry[];
    }
  } catch {
    // ignore corrupted store
  }
  return [];
}

function writeAll(entries: LibraryEntry[]) {
  const p = getLibraryPath();
  fs.writeFileSync(p, JSON.stringify(entries, null, 2), "utf8");
}

/** Returns entries newest-first, dropping any whose file no longer exists. */
export function listLibrary(): LibraryEntry[] {
  const entries = readAll();
  const existing = entries.filter((e) => {
    try {
      return fs.existsSync(e.filePath);
    } catch {
      return false;
    }
  });
  if (existing.length !== entries.length) {
    writeAll(existing);
  }
  return existing.sort((a, b) => b.createdAt - a.createdAt);
}

export function addLibraryEntry(entry: Omit<LibraryEntry, "id" | "createdAt">): LibraryEntry {
  const entries = readAll();
  const full: LibraryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  // De-dupe: if the same file path already exists, replace it.
  const filtered = entries.filter((e) => e.filePath !== entry.filePath);
  filtered.push(full);
  writeAll(filtered);
  return full;
}

export function removeLibraryEntry(id: string): boolean {
  const entries = readAll();
  const next = entries.filter((e) => e.id !== id);
  writeAll(next);
  return next.length !== entries.length;
}
