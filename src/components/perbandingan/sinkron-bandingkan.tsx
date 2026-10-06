"use client";

import { useEffect } from "react";
import type { ProdiPilihan } from "@/lib/perbandingan/daftar";
import { simpanDaftar } from "./simpanan";

// On the compare page, the list becomes the Prodi being compared, so adding
// and removing carries on from what the visitor sees (also from a shared link).
export function SinkronBandingkan({ daftar }: { daftar: ProdiPilihan[] }) {
  const kunci = JSON.stringify(daftar);
  useEffect(() => {
    simpanDaftar(JSON.parse(kunci) as ProdiPilihan[]);
  }, [kunci]);
  return null;
}
