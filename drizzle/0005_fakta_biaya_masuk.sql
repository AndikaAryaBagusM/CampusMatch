-- Before biaya_prodi_fk, which references it.
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_id_kampus_unique" UNIQUE("id","kampus_id");--> statement-breakpoint
CREATE TYPE "public"."batas_biaya" AS ENUM('minimal', 'maksimal');--> statement-breakpoint
CREATE TYPE "public"."jenis_biaya" AS ENUM('ukt', 'spp', 'uang_pangkal', 'pendaftaran', 'lain');--> statement-breakpoint
CREATE TYPE "public"."kategori_jalur" AS ENUM('snbp', 'snbt', 'mandiri', 'pts');--> statement-breakpoint
CREATE TYPE "public"."periode_biaya" AS ENUM('per_semester', 'sekali');--> statement-breakpoint
CREATE TYPE "public"."status_fakta" AS ENUM('draf', 'diperiksa', 'ditarik');--> statement-breakpoint
CREATE TYPE "public"."tes_jalur" AS ENUM('utbk', 'tes_kampus', 'rapor', 'portofolio', 'wawancara', 'prestasi', 'lain');--> statement-breakpoint
CREATE TABLE "beasiswa" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "beasiswa_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kampus_id" integer,
	"nama" text NOT NULL,
	"penyelenggara" text NOT NULL,
	"sasaran" text NOT NULL,
	"cakupan" text NOT NULL,
	"url" text,
	"sumber_id" integer NOT NULL,
	"tahun_akademik" smallint NOT NULL,
	"status" "status_fakta" DEFAULT 'draf' NOT NULL,
	"dimasukkan_oleh" text,
	"diperiksa_oleh" text,
	"diperiksa_at" timestamp with time zone,
	"ditarik_oleh" text,
	"ditarik_at" timestamp with time zone,
	"alasan_ditarik" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "beasiswa_tahun_akademik_check" CHECK ("beasiswa"."tahun_akademik" BETWEEN 2000 AND 2100),
	CONSTRAINT "beasiswa_status_check" CHECK (("beasiswa"."status" = 'draf' AND "beasiswa"."diperiksa_oleh" IS NULL AND "beasiswa"."diperiksa_at" IS NULL)
      OR ("beasiswa"."status" <> 'draf' AND "beasiswa"."diperiksa_at" IS NOT NULL AND "beasiswa"."diperiksa_oleh" <> "beasiswa"."dimasukkan_oleh")),
	CONSTRAINT "beasiswa_ditarik_check" CHECK (("beasiswa"."status" = 'ditarik') = ("beasiswa"."ditarik_at" IS NOT NULL AND "beasiswa"."alasan_ditarik" IS NOT NULL)
      AND ("beasiswa"."status" = 'ditarik' OR ("beasiswa"."ditarik_at" IS NULL AND "beasiswa"."alasan_ditarik" IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "beasiswa_kampus" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "beasiswa_kampus_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"beasiswa_id" integer NOT NULL,
	"kampus_id" integer NOT NULL,
	"sumber_id" integer NOT NULL,
	"tahun_akademik" smallint NOT NULL,
	"status" "status_fakta" DEFAULT 'draf' NOT NULL,
	"dimasukkan_oleh" text,
	"diperiksa_oleh" text,
	"diperiksa_at" timestamp with time zone,
	"ditarik_oleh" text,
	"ditarik_at" timestamp with time zone,
	"alasan_ditarik" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "beasiswa_kampus_tahun_akademik_check" CHECK ("beasiswa_kampus"."tahun_akademik" BETWEEN 2000 AND 2100),
	CONSTRAINT "beasiswa_kampus_status_check" CHECK (("beasiswa_kampus"."status" = 'draf' AND "beasiswa_kampus"."diperiksa_oleh" IS NULL AND "beasiswa_kampus"."diperiksa_at" IS NULL)
      OR ("beasiswa_kampus"."status" <> 'draf' AND "beasiswa_kampus"."diperiksa_at" IS NOT NULL AND "beasiswa_kampus"."diperiksa_oleh" <> "beasiswa_kampus"."dimasukkan_oleh")),
	CONSTRAINT "beasiswa_kampus_ditarik_check" CHECK (("beasiswa_kampus"."status" = 'ditarik') = ("beasiswa_kampus"."ditarik_at" IS NOT NULL AND "beasiswa_kampus"."alasan_ditarik" IS NOT NULL)
      AND ("beasiswa_kampus"."status" = 'ditarik' OR ("beasiswa_kampus"."ditarik_at" IS NULL AND "beasiswa_kampus"."alasan_ditarik" IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "biaya" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "biaya_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kampus_id" integer NOT NULL,
	"prodi_id" integer,
	"jenis" "jenis_biaya" NOT NULL,
	"jalur_masuk_id" integer,
	"label" text,
	"jumlah" bigint NOT NULL,
	"batas" "batas_biaya",
	"periode" "periode_biaya" NOT NULL,
	"sumber_id" integer NOT NULL,
	"tahun_akademik" smallint NOT NULL,
	"status" "status_fakta" DEFAULT 'draf' NOT NULL,
	"dimasukkan_oleh" text,
	"diperiksa_oleh" text,
	"diperiksa_at" timestamp with time zone,
	"ditarik_oleh" text,
	"ditarik_at" timestamp with time zone,
	"alasan_ditarik" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "biaya_jumlah_check" CHECK ("biaya"."jumlah" >= 0),
	CONSTRAINT "biaya_periode_check" CHECK (("biaya"."jenis" NOT IN ('ukt', 'spp') OR "biaya"."periode" = 'per_semester')
        AND ("biaya"."jenis" NOT IN ('uang_pangkal', 'pendaftaran') OR "biaya"."periode" = 'sekali')),
	CONSTRAINT "biaya_tahun_akademik_check" CHECK ("biaya"."tahun_akademik" BETWEEN 2000 AND 2100),
	CONSTRAINT "biaya_status_check" CHECK (("biaya"."status" = 'draf' AND "biaya"."diperiksa_oleh" IS NULL AND "biaya"."diperiksa_at" IS NULL)
      OR ("biaya"."status" <> 'draf' AND "biaya"."diperiksa_at" IS NOT NULL AND "biaya"."diperiksa_oleh" <> "biaya"."dimasukkan_oleh")),
	CONSTRAINT "biaya_ditarik_check" CHECK (("biaya"."status" = 'ditarik') = ("biaya"."ditarik_at" IS NOT NULL AND "biaya"."alasan_ditarik" IS NOT NULL)
      AND ("biaya"."status" = 'ditarik' OR ("biaya"."ditarik_at" IS NULL AND "biaya"."alasan_ditarik" IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "jalur_masuk" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jalur_masuk_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kampus_id" integer NOT NULL,
	"nama" text NOT NULL,
	"kategori" "kategori_jalur" NOT NULL,
	"tes" "tes_jalur"[] NOT NULL,
	"pendaftaran_buka" date,
	"pendaftaran_tutup" date,
	"sumber_id" integer NOT NULL,
	"tahun_akademik" smallint NOT NULL,
	"status" "status_fakta" DEFAULT 'draf' NOT NULL,
	"dimasukkan_oleh" text,
	"diperiksa_oleh" text,
	"diperiksa_at" timestamp with time zone,
	"ditarik_oleh" text,
	"ditarik_at" timestamp with time zone,
	"alasan_ditarik" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jalur_masuk_id_kampus_unique" UNIQUE("id","kampus_id"),
	CONSTRAINT "jalur_masuk_pendaftaran_check" CHECK ("jalur_masuk"."pendaftaran_buka" IS NULL OR "jalur_masuk"."pendaftaran_tutup" IS NULL OR "jalur_masuk"."pendaftaran_buka" <= "jalur_masuk"."pendaftaran_tutup"),
	CONSTRAINT "jalur_masuk_tahun_akademik_check" CHECK ("jalur_masuk"."tahun_akademik" BETWEEN 2000 AND 2100),
	CONSTRAINT "jalur_masuk_status_check" CHECK (("jalur_masuk"."status" = 'draf' AND "jalur_masuk"."diperiksa_oleh" IS NULL AND "jalur_masuk"."diperiksa_at" IS NULL)
      OR ("jalur_masuk"."status" <> 'draf' AND "jalur_masuk"."diperiksa_at" IS NOT NULL AND "jalur_masuk"."diperiksa_oleh" <> "jalur_masuk"."dimasukkan_oleh")),
	CONSTRAINT "jalur_masuk_ditarik_check" CHECK (("jalur_masuk"."status" = 'ditarik') = ("jalur_masuk"."ditarik_at" IS NOT NULL AND "jalur_masuk"."alasan_ditarik" IS NOT NULL)
      AND ("jalur_masuk"."status" = 'ditarik' OR ("jalur_masuk"."ditarik_at" IS NULL AND "jalur_masuk"."alasan_ditarik" IS NULL)))
);
--> statement-breakpoint
CREATE TABLE "sumber" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sumber_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kode" text NOT NULL,
	"kampus_id" integer,
	"url" text NOT NULL,
	"judul" text NOT NULL,
	"penerbit" text NOT NULL,
	"diakses_pada" date NOT NULL,
	"arsip_url" text,
	"alasan_tanpa_arsip" text,
	"dimasukkan_oleh" text,
	"catatan_pemeriksa" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sumber_kode_unique" UNIQUE("kode"),
	CONSTRAINT "sumber_arsip_url_check" CHECK ("sumber"."arsip_url" LIKE 'https://web.archive.org/%')
);
--> statement-breakpoint
ALTER TABLE "beasiswa" ADD CONSTRAINT "beasiswa_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa" ADD CONSTRAINT "beasiswa_sumber_id_sumber_id_fk" FOREIGN KEY ("sumber_id") REFERENCES "public"."sumber"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa" ADD CONSTRAINT "beasiswa_dimasukkan_oleh_users_id_fk" FOREIGN KEY ("dimasukkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa" ADD CONSTRAINT "beasiswa_diperiksa_oleh_users_id_fk" FOREIGN KEY ("diperiksa_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa" ADD CONSTRAINT "beasiswa_ditarik_oleh_users_id_fk" FOREIGN KEY ("ditarik_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa_kampus" ADD CONSTRAINT "beasiswa_kampus_beasiswa_id_beasiswa_id_fk" FOREIGN KEY ("beasiswa_id") REFERENCES "public"."beasiswa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa_kampus" ADD CONSTRAINT "beasiswa_kampus_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa_kampus" ADD CONSTRAINT "beasiswa_kampus_sumber_id_sumber_id_fk" FOREIGN KEY ("sumber_id") REFERENCES "public"."sumber"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa_kampus" ADD CONSTRAINT "beasiswa_kampus_dimasukkan_oleh_users_id_fk" FOREIGN KEY ("dimasukkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa_kampus" ADD CONSTRAINT "beasiswa_kampus_diperiksa_oleh_users_id_fk" FOREIGN KEY ("diperiksa_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beasiswa_kampus" ADD CONSTRAINT "beasiswa_kampus_ditarik_oleh_users_id_fk" FOREIGN KEY ("ditarik_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_sumber_id_sumber_id_fk" FOREIGN KEY ("sumber_id") REFERENCES "public"."sumber"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_dimasukkan_oleh_users_id_fk" FOREIGN KEY ("dimasukkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_diperiksa_oleh_users_id_fk" FOREIGN KEY ("diperiksa_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_ditarik_oleh_users_id_fk" FOREIGN KEY ("ditarik_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_prodi_fk" FOREIGN KEY ("prodi_id","kampus_id") REFERENCES "public"."prodi"("id","kampus_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_jalur_masuk_fk" FOREIGN KEY ("jalur_masuk_id","kampus_id") REFERENCES "public"."jalur_masuk"("id","kampus_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalur_masuk" ADD CONSTRAINT "jalur_masuk_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalur_masuk" ADD CONSTRAINT "jalur_masuk_sumber_id_sumber_id_fk" FOREIGN KEY ("sumber_id") REFERENCES "public"."sumber"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalur_masuk" ADD CONSTRAINT "jalur_masuk_dimasukkan_oleh_users_id_fk" FOREIGN KEY ("dimasukkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalur_masuk" ADD CONSTRAINT "jalur_masuk_diperiksa_oleh_users_id_fk" FOREIGN KEY ("diperiksa_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jalur_masuk" ADD CONSTRAINT "jalur_masuk_ditarik_oleh_users_id_fk" FOREIGN KEY ("ditarik_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sumber" ADD CONSTRAINT "sumber_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sumber" ADD CONSTRAINT "sumber_dimasukkan_oleh_users_id_fk" FOREIGN KEY ("dimasukkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "beasiswa_kampus_nama_tahun_unique" ON "beasiswa" USING btree ("kampus_id","nama","tahun_akademik") WHERE "beasiswa"."kampus_id" IS NOT NULL AND "beasiswa"."status" <> 'ditarik';--> statement-breakpoint
CREATE UNIQUE INDEX "beasiswa_nasional_nama_tahun_unique" ON "beasiswa" USING btree ("nama","tahun_akademik") WHERE "beasiswa"."kampus_id" IS NULL AND "beasiswa"."status" <> 'ditarik';--> statement-breakpoint
CREATE INDEX "beasiswa_sumber_id_idx" ON "beasiswa" USING btree ("sumber_id");--> statement-breakpoint
CREATE UNIQUE INDEX "beasiswa_kampus_unique" ON "beasiswa_kampus" USING btree ("beasiswa_id","kampus_id","tahun_akademik") WHERE "beasiswa_kampus"."status" <> 'ditarik';--> statement-breakpoint
CREATE INDEX "beasiswa_kampus_kampus_id_idx" ON "beasiswa_kampus" USING btree ("kampus_id");--> statement-breakpoint
CREATE INDEX "beasiswa_kampus_sumber_id_idx" ON "beasiswa_kampus" USING btree ("sumber_id");--> statement-breakpoint
CREATE INDEX "biaya_kampus_id_idx" ON "biaya" USING btree ("kampus_id");--> statement-breakpoint
CREATE INDEX "biaya_prodi_id_idx" ON "biaya" USING btree ("prodi_id");--> statement-breakpoint
CREATE INDEX "biaya_sumber_id_idx" ON "biaya" USING btree ("sumber_id");--> statement-breakpoint
CREATE UNIQUE INDEX "jalur_masuk_kampus_tahun_nama_unique" ON "jalur_masuk" USING btree ("kampus_id","tahun_akademik","nama") WHERE "jalur_masuk"."status" <> 'ditarik';--> statement-breakpoint
CREATE INDEX "jalur_masuk_sumber_id_idx" ON "jalur_masuk" USING btree ("sumber_id");--> statement-breakpoint
CREATE INDEX "sumber_kampus_id_idx" ON "sumber" USING btree ("kampus_id");--> statement-breakpoint
