import { ImageResponse } from "next/og";
import { LABEL_TIPE } from "@/lib/riasec/item";
import { bacaProfil, SKOR_MAKS, urutkanTipe } from "@/lib/riasec/skor";

// The picture shown when a Tes Minat result link is shared (WhatsApp, Instagram,
// X): the three strongest interests and the six scores. Drawn from the scores
// in the link, like the result page itself; nothing is stored.
export async function GET(request: Request) {
  const profil = bacaProfil(new URL(request.url).searchParams.get("p"));
  if (!profil) return new Response("Profil tidak sah", { status: 400 });

  const urutan = urutkanTipe(profil);
  const teratas = urutan.slice(0, 3);
  const jade = "#0b6b4e";
  const jadeGelap = "#08513b";
  const tinta = "#13201a";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: jade, color: "#ffffff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, padding: 64 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, opacity: 0.85 }}>Hasil Tes Minat</div>
            <div style={{ display: "flex", marginTop: 20, gap: 14 }}>
              {teratas.map((t) => (
                <div
                  key={t.tipe}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 112,
                    height: 112,
                    borderRadius: 12,
                    background: "#ffffff",
                    color: tinta,
                    fontSize: 76,
                    fontWeight: 800,
                  }}
                >
                  {t.tipe}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 38, fontWeight: 700, lineHeight: 1.2 }}>
              {teratas.map((t) => LABEL_TIPE[t.tipe]).join(" · ")}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>CampusMatch</div>
            <div style={{ display: "flex", fontSize: 24, opacity: 0.85 }}>Minatmu apa? Coba tes 5 menit, tanpa akun.</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1, padding: "64px 64px 64px 48px", background: jadeGelap }}>
          {urutan.map(({ tipe, skor }, i) => (
            <div key={tipe} style={{ display: "flex", flexDirection: "column", marginTop: i === 0 ? 0 : 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: i < 3 ? 700 : 400 }}>
                <div style={{ display: "flex" }}>{LABEL_TIPE[tipe]}</div>
                <div style={{ display: "flex", opacity: 0.85 }}>
                  {skor}/{SKOR_MAKS}
                </div>
              </div>
              <div style={{ display: "flex", marginTop: 8, height: 18, borderRadius: 4, background: "rgba(255,255,255,0.18)" }}>
                <div
                  style={{
                    display: "flex",
                    width: `${(skor / SKOR_MAKS) * 100}%`,
                    borderRadius: 4,
                    background: i < 3 ? "#ffffff" : "rgba(255,255,255,0.55)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // The picture depends only on the scores in the link.
      headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable" },
    },
  );
}
