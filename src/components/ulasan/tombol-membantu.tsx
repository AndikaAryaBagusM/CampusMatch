"use client";

import { useState, useSyncExternalStore } from "react";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

// The Ulasan this reader marked, remembered in their browser so the button
// stays pressed. The server keeps the count (one per Ulasan per network
// address); this list never leaves the browser.
const KUNCI = "campusmatch:membantu";
const pendengar = new Set<() => void>();
let mentah: string | null = null;
let ditandai: ReadonlySet<string> = new Set();

function snapshot(): ReadonlySet<string> {
  let r: string | null;
  try {
    r = window.localStorage.getItem(KUNCI);
  } catch {
    return ditandai;
  }
  if (r !== mentah) {
    mentah = r;
    try {
      const data: unknown = JSON.parse(r ?? "[]");
      ditandai = new Set(Array.isArray(data) ? data.filter((x): x is string => typeof x === "string") : []);
    } catch {
      ditandai = new Set();
    }
  }
  return ditandai;
}

const KOSONG: ReadonlySet<string> = new Set();

function subscribe(ubah: () => void) {
  pendengar.add(ubah);
  window.addEventListener("storage", ubah);
  return () => {
    pendengar.delete(ubah);
    window.removeEventListener("storage", ubah);
  };
}

function ingat(ulasanId: string) {
  const baru = [...new Set([...snapshot(), ulasanId])].slice(-500);
  mentah = JSON.stringify(baru);
  ditandai = new Set(baru);
  try {
    window.localStorage.setItem(KUNCI, mentah);
  } catch {
    // Without storage the button stays pressed only until the page closes.
  }
  for (const f of pendengar) f();
}

// "Membantu" on an Ulasan, for readers without an account (decisions.md 17s).
// The page is cached, so the pressed state comes from the browser after hydration.
export function TombolMembantu({ ulasanId, jumlah }: { ulasanId: string; jumlah: number }) {
  const sudah = useSyncExternalStore(subscribe, snapshot, () => KOSONG).has(ulasanId);
  const [tampil, setTampil] = useState(jumlah);

  async function tandai() {
    if (sudah) return;
    ingat(ulasanId);
    try {
      const res = await fetch(`/api/ulasan/${ulasanId}/membantu`, { method: "POST" });
      if (res.ok) {
        const data = (await res.json()) as { jumlah?: number };
        if (typeof data.jumlah === "number") setTampil(data.jumlah);
      }
    } catch {
      // The mark is kept in this browser; the count catches up on a later visit.
    }
  }

  return (
    <button
      type="button"
      onClick={tandai}
      aria-pressed={sudah}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-sm px-2.5 text-sm font-semibold transition-colors",
        sudah ? "bg-jade text-on-jade" : "ring-1 ring-foreground/30 hover:bg-secondary",
      )}
    >
      <ThumbsUp className="size-3.5" aria-hidden />
      Membantu
      {tampil > 0 ? <span className="tabular font-plate text-base font-bold">{tampil}</span> : null}
    </button>
  );
}
