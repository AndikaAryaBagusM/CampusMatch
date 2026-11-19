"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Tells the server a page was opened, so it can add one to that page's daily
// total (decisions.md 17t). Sends the pathname only, never the query string,
// plus on the first page where the visitor came from. No cookie, no identifier.
// Visitors who ask not to be tracked (Do Not Track, Global Privacy Control)
// are not counted at all.
export function PencatatKunjungan() {
  const pathname = usePathname();
  const pertama = useRef(true);

  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    if (pathname.startsWith("/akun") || pathname.startsWith("/moderasi")) return;
    // After the first page, moving around the site is always "internal".
    const r = pertama.current ? document.referrer : window.location.origin;
    pertama.current = false;
    const badan = JSON.stringify({ j: pathname, r });
    try {
      if (!navigator.sendBeacon?.("/api/kunjungan", badan)) {
        void fetch("/api/kunjungan", { method: "POST", body: badan, keepalive: true }).catch(() => {});
      }
    } catch {
      // Counting is best-effort.
    }
  }, [pathname]);

  return null;
}
