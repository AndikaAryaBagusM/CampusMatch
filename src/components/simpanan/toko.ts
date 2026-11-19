"use client";

import { useSyncExternalStore } from "react";
import { bacaTersimpan, KUNCI_TERSIMPAN, type ProdiTersimpan } from "@/lib/simpanan/daftar";

// The saved-Prodi list in localStorage, shared by every component on the page
// and kept in step across tabs (the same pattern as the Bandingkan list).
// Where storage is blocked the list still works in memory until the page closes.

const KOSONG: ProdiTersimpan[] = [];
let mentah: string | null = null;
let daftar: ProdiTersimpan[] = KOSONG;
const pendengar = new Set<() => void>();

function baca(): string | null | undefined {
  try {
    return window.localStorage.getItem(KUNCI_TERSIMPAN);
  } catch {
    return undefined;
  }
}

function snapshot(): ProdiTersimpan[] {
  const r = baca();
  if (r !== undefined && r !== mentah) {
    mentah = r;
    daftar = bacaTersimpan(r);
  }
  return daftar;
}

function subscribe(ubah: () => void) {
  pendengar.add(ubah);
  const dariTabLain = (e: StorageEvent) => {
    if (e.key === KUNCI_TERSIMPAN || e.key === null) ubah();
  };
  window.addEventListener("storage", dariTabLain);
  return () => {
    pendengar.delete(ubah);
    window.removeEventListener("storage", dariTabLain);
  };
}

export function tulisTersimpan(baru: ProdiTersimpan[]) {
  mentah = JSON.stringify(baru);
  daftar = bacaTersimpan(mentah);
  try {
    window.localStorage.setItem(KUNCI_TERSIMPAN, mentah);
  } catch {
    // Kept in memory only.
  }
  for (const f of pendengar) f();
}

// Empty on the server and during hydration, then the stored list.
export function useTersimpan(): ProdiTersimpan[] {
  return useSyncExternalStore(subscribe, snapshot, () => KOSONG);
}
