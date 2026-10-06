// The Tes Minat items: the 60 work activities of the O*NET® Interest Profiler
// Short Form (v1), translated to Indonesian by CampusMatch and used under the
// O*NET Tools Developer License (ADR 0004). The translation is a modification:
// it is not yet validated, and USDOL/ETA has not approved or tested it.
// Source: https://www.onetcenter.org/dl_tools/ipsf/Interest_Profiler.pdf

export const TIPE = ["R", "I", "A", "S", "E", "C"] as const;
export type Tipe = (typeof TIPE)[number];

export const LABEL_TIPE: Record<Tipe, string> = {
  R: "Realistik",
  I: "Investigatif",
  A: "Artistik",
  S: "Sosial",
  E: "Enterprising",
  C: "Konvensional",
};

// Adapted from the O*NET Interest Profiler Score Report.
export const DESKRIPSI_TIPE: Record<Tipe, string> = {
  R: "Membangun, memperbaiki, merawat, memasang, mengemudi, atau bekerja dengan tangan. Sering menyukai pekerjaan dengan tanaman, hewan, elektronik, bahan nyata seperti kayu, alam terbuka, mesin, dan peralatan.",
  I: "Mempelajari, meneliti, menguji, menganalisis, mendiagnosis, menemukan, dan memecahkan masalah. Sering menyukai sains, pengetahuan, laboratorium, gagasan, dan fakta.",
  A: "Mencipta, tampil, menulis, mendesain, menari, mengarang musik, atau mengekspresikan diri. Sering menyukai seni, media, musik, teater, dan grafis.",
  S: "Membantu, mengajar, mendidik, membimbing, menasihati, atau merawat orang. Sering menyukai pekerjaan dengan orang, layanan, kegiatan sosial, kesehatan, dan komunikasi.",
  E: "Mengelola, mengawasi, bernegosiasi, memasarkan, menjual, memimpin, atau mengarahkan. Sering menyukai pekerjaan dengan karyawan, pelanggan, produk, bisnis, hukum, dan politik.",
  C: "Mengatur, mencatat, mengarsipkan, memilah, memeriksa, dan teliti terhadap detail. Sering menyukai pekerjaan dengan informasi, data, aturan, kantor, prosedur, dan berkas.",
};

// Ten activities per type, in the order of the original form.
const KEGIATAN: Record<Tipe, readonly string[]> = {
  R: [
    "Membuat lemari dapur",
    "Memasang batu bata atau keramik",
    "Memperbaiki peralatan rumah tangga",
    "Membudidayakan ikan di tempat pembenihan",
    "Merakit komponen elektronik",
    "Mengemudikan truk untuk mengantar paket ke kantor dan rumah",
    "Menguji kualitas suku cadang sebelum dikirim",
    "Memperbaiki dan memasang kunci",
    "Menyiapkan dan menjalankan mesin untuk membuat produk",
    "Memadamkan kebakaran hutan",
  ],
  I: [
    "Mengembangkan obat baru",
    "Meneliti cara mengurangi pencemaran air",
    "Melakukan percobaan kimia",
    "Mempelajari pergerakan planet",
    "Memeriksa sampel darah dengan mikroskop",
    "Menyelidiki penyebab kebakaran",
    "Mengembangkan cara memprakirakan cuaca dengan lebih tepat",
    "Bekerja di laboratorium biologi",
    "Menciptakan pengganti gula",
    "Melakukan tes laboratorium untuk mengenali penyakit",
  ],
  A: [
    "Menulis buku atau naskah drama",
    "Memainkan alat musik",
    "Mengarang atau mengaransemen musik",
    "Menggambar",
    "Membuat efek khusus untuk film",
    "Melukis dekorasi panggung untuk pertunjukan teater",
    "Menulis skenario film atau acara televisi",
    "Menampilkan tari jazz atau tap",
    "Bernyanyi dalam sebuah band",
    "Menyunting film",
  ],
  S: [
    "Mengajari seseorang rangkaian latihan olahraga",
    "Membantu orang yang punya masalah pribadi atau emosional",
    "Memberi bimbingan karier kepada orang lain",
    "Memberikan terapi rehabilitasi",
    "Menjadi relawan di organisasi nirlaba",
    "Mengajari anak-anak cara berolahraga",
    "Mengajarkan bahasa isyarat kepada orang tuli atau yang sulit mendengar",
    "Membantu menjalankan sesi terapi kelompok",
    "Mengasuh anak-anak di tempat penitipan anak",
    "Mengajar di kelas SMA",
  ],
  E: [
    "Membeli dan menjual saham dan obligasi",
    "Mengelola toko ritel",
    "Menjalankan salon kecantikan atau pangkas rambut",
    "Memimpin satu departemen di perusahaan besar",
    "Memulai usaha sendiri",
    "Menegosiasikan kontrak bisnis",
    "Mewakili klien dalam perkara di pengadilan",
    "Memasarkan lini pakaian baru",
    "Menjual barang di toserba",
    "Mengelola toko pakaian",
  ],
  C: [
    "Membuat lembar kerja (spreadsheet) di komputer",
    "Memeriksa ketelitian catatan atau formulir",
    "Memasang perangkat lunak di banyak komputer dalam jaringan besar",
    "Menggunakan kalkulator",
    "Mencatat pengiriman dan penerimaan barang",
    "Menghitung gaji karyawan",
    "Mendata persediaan barang dengan komputer genggam",
    "Mencatat pembayaran sewa",
    "Menyimpan catatan persediaan barang",
    "Mencap, memilah, dan membagikan surat untuk sebuah organisasi",
  ],
};

export type Item = { id: number; tipe: Tipe; teks: string };

// Shown interleaved (R, I, A, S, E, C, R, I, ...) so the types aren't grouped
// and labelled as on the paper form. `id` is the position, 1–60.
export const ITEM: readonly Item[] = Array.from({ length: 10 }, (_, k) => TIPE.map((tipe) => ({ tipe, teks: KEGIATAN[tipe][k] })))
  .flat()
  .map((x, i) => ({ id: i + 1, ...x }));

// The notice the O*NET Tools Developer License requires, verbatim, then in Indonesian.
export const ATRIBUSI_ONET_EN =
  "This page includes information from the O*NET Career Exploration Tools by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Tools Developer License. O*NET® is a trademark of USDOL/ETA. CampusMatch has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.";

export const ATRIBUSI_ONET =
  "Halaman ini memuat informasi dari O*NET Career Exploration Tools oleh U.S. Department of Labor, Employment and Training Administration (USDOL/ETA), dipakai di bawah O*NET Tools Developer License. O*NET® adalah merek dagang USDOL/ETA. CampusMatch telah mengubah sebagian atau seluruh informasi ini. USDOL/ETA belum menyetujui, mendukung, atau menguji perubahan tersebut.";
