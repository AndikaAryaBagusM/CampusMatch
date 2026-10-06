import { GarisRute } from "@/components/trayek/garis-rute";

// Where signing in sits on the Pengulas line, beside the sign-in steps
// (/masuk, /akun/usia). `keterangan` says what this step asks.
export function RuteMasuk({ keterangan, className }: { keterangan: string; className?: string }) {
  return (
    <aside aria-labelledby="rute-masuk" className={className}>
      <div className="rounded-md bg-jade p-5 text-on-jade sm:p-6">
        <h2 id="rute-masuk" className="mb-5 text-lg font-extrabold">
          Rute Pengulas
        </h2>
        <GarisRute
          label="Rute Pengulas"
          diJade
          className="text-sm"
          halte={[
            { label: "Cari Prodi-mu", keadaan: "lewat" },
            { label: "Masuk", keterangan, keadaan: "kini" },
            { label: "Tulis ulasan", keterangan: "Berikutnya", keadaan: "nanti" },
            { label: "Diperiksa", keadaan: "nanti" },
            { label: "Terbit tanpa nama", keadaan: "nanti" },
          ]}
        />
      </div>
    </aside>
  );
}
