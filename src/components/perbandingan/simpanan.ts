"use client";

import { useSyncExternalStore } from "react";
import { bacaDaftar, KUNCI_PENYIMPANAN, type ProdiPilihan } from "@/lib/perbandingan/daftar";

// The Bandingkan list in localStorage, shared by every component on the page
// and kept in step across tabs. Where storage is blocked (private windows,
// cleared site data) the list still works in memory until the page closes.

const KOSONG: ProdiPilihan[] = [];
let mentah: string | null = null;
let daftar: ProdiPilihan[] = KOSONG;
const pendengar = new Set<() => void>();

// undefined when storage can't be read.
function baca(): string | null | undefined {
  try {
    return window.localStorage.getItem(KUNCI_PENYIMPANAN);
  } catch {
    return undefined;
  }
}

function snapshot(): ProdiPilihan[] {
  const r = baca();
  if (r !== undefined && r !== mentah) {
    mentah = r;
    daftar = bacaDaftar(r);
  }
  return daftar;
}

function subscribe(ubah: () => void) {
  pendengar.add(ubah);
  const dariTabLain = (e: StorageEvent) => {
    if (e.key === KUNCI_PENYIMPANAN || e.key === null) ubah();
  };
  window.addEventListener("storage", dariTabLain);
  return () => {
    pendengar.delete(ubah);
    window.removeEventListener("storage", dariTabLain);
  };
}

export function simpanDaftar(baru: ProdiPilihan[]) {
  mentah = JSON.stringify(baru);
  daftar = bacaDaftar(mentah);
  try {
    window.localStorage.setItem(KUNCI_PENYIMPANAN, mentah);
  } catch {
    // Kept in memory only.
  }
  for (const f of pendengar) f();
}

// Empty on the server and during hydration, then the stored list.
export function useDaftarBandingkan(): ProdiPilihan[] {
  return useSyncExternalStore(subscribe, snapshot, () => KOSONG);
}
