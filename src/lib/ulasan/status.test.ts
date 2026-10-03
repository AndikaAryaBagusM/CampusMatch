import { describe, expect, test } from "vitest";
import { MAKS_PUTARAN_SCREENING, transisi, TransisiTidakSah, type Keadaan, type Peristiwa, type StatusUlasan } from "./status";

const k = (status: StatusUlasan, percobaan = 0): Keadaan => ({ status, percobaan });

describe("legal transitions", () => {
  test.each<[Keadaan, Peristiwa, Keadaan]>([
    [k("menunggu"), { jenis: "screening", tingkatRisiko: "rendah" }, k("terbit")],
    [k("menunggu"), { jenis: "screening", tingkatRisiko: "perlu_dicek" }, k("ditinjau")],
    // melanggar goes to a Moderator, never straight to ditolak (ADR 0002).
    [k("menunggu"), { jenis: "screening", tingkatRisiko: "melanggar" }, k("ditinjau")],
    [k("menunggu", 1), { jenis: "screening", tingkatRisiko: "rendah" }, k("terbit", 1)],
    [k("menunggu"), { jenis: "screening_gagal" }, k("menunggu", 1)],
    [k("menunggu", 1), { jenis: "screening_gagal" }, k("menunggu", 2)],
    [k("menunggu", 2), { jenis: "screening_gagal" }, k("ditinjau", 3)],
    [k("ditinjau"), { jenis: "setujui" }, k("terbit")],
    [k("ditinjau"), { jenis: "tolak", alasan: "Menyebut nama dosen" }, k("ditolak")],
    [k("terbit"), { jenis: "turunkan", alasan: "Laporan valid" }, k("ditolak")],
  ])("%o + %o -> %o", (dari, peristiwa, ke) => {
    expect(transisi(dari, peristiwa)).toEqual(ke);
  });

  test("the last failed round hands over to a Moderator", () => {
    let s = k("menunggu");
    for (let i = 0; i < MAKS_PUTARAN_SCREENING; i++) s = transisi(s, { jenis: "screening_gagal" });
    expect(s).toEqual(k("ditinjau", MAKS_PUTARAN_SCREENING));
  });
});

describe("illegal transitions", () => {
  test.each<[StatusUlasan, Peristiwa]>([
    ["terbit", { jenis: "screening", tingkatRisiko: "rendah" }],
    ["ditinjau", { jenis: "screening", tingkatRisiko: "rendah" }],
    ["ditolak", { jenis: "screening", tingkatRisiko: "rendah" }],
    ["ditinjau", { jenis: "screening_gagal" }],
    ["menunggu", { jenis: "setujui" }],
    ["ditolak", { jenis: "setujui" }],
    ["terbit", { jenis: "setujui" }],
    ["menunggu", { jenis: "tolak", alasan: "x" }],
    ["terbit", { jenis: "tolak", alasan: "x" }],
    ["ditinjau", { jenis: "tolak", alasan: "  " }],
    ["ditinjau", { jenis: "turunkan", alasan: "x" }],
    ["terbit", { jenis: "turunkan", alasan: "" }],
  ])("%s + %o throws", (status, peristiwa) => {
    expect(() => transisi(k(status), peristiwa)).toThrow(TransisiTidakSah);
  });

  test("no failure path ever reaches terbit", () => {
    for (let p = 0; p < 10; p++) {
      expect(transisi(k("menunggu", p), { jenis: "screening_gagal" }).status).not.toBe("terbit");
    }
  });
});
