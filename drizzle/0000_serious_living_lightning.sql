CREATE TYPE "public"."alasan_laporan" AS ENUM('sara_kebencian', 'hinaan', 'menyebut_individu', 'tidak_relevan', 'promosi_spam', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."bentuk_kampus" AS ENUM('Universitas', 'Institut', 'Sekolah Tinggi', 'Politeknik', 'Akademi', 'Akademi Komunitas');--> statement-breakpoint
CREATE TYPE "public"."jenjang" AS ENUM('D3', 'D4', 'S1');--> statement-breakpoint
CREATE TYPE "public"."peran" AS ENUM('pengulas', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."riasec_tipe" AS ENUM('R', 'I', 'A', 'S', 'E', 'C');--> statement-breakpoint
CREATE TYPE "public"."status_laporan" AS ENUM('baru', 'ditangani');--> statement-breakpoint
CREATE TYPE "public"."status_pengulas" AS ENUM('mahasiswa_aktif', 'alumni');--> statement-breakpoint
CREATE TYPE "public"."status_ulasan" AS ENUM('menunggu', 'terbit', 'ditinjau', 'ditolak');--> statement-breakpoint
CREATE TYPE "public"."tingkat_risiko" AS ENUM('rendah', 'perlu_dicek', 'melanggar');--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp with time zone,
	"image" text,
	"peran" "peran" DEFAULT 'pengulas' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "jurusan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "jurusan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"slug" text NOT NULL,
	"deskripsi" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jurusan_nama_unique" UNIQUE("nama"),
	CONSTRAINT "jurusan_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "kampus" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kampus_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"npsn" varchar(10) NOT NULL,
	"nama" text NOT NULL,
	"slug" text NOT NULL,
	"bentuk" "bentuk_kampus" NOT NULL,
	"kota_id" integer NOT NULL,
	"akreditasi" text,
	"unggulan" boolean DEFAULT false NOT NULL,
	"domain_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kampus_npsn_unique" UNIQUE("npsn"),
	CONSTRAINT "kampus_slug_unique" UNIQUE("slug"),
	CONSTRAINT "kampus_akreditasi_check" CHECK ("kampus"."akreditasi" IN ('Unggul', 'Baik Sekali', 'Baik', 'A', 'B', 'C', 'Terakreditasi', 'Terakreditasi Sementara'))
);
--> statement-breakpoint
CREATE TABLE "kode_prodi_jurusan" (
	"kode_prodi" varchar(10) PRIMARY KEY NOT NULL,
	"jurusan_id" integer NOT NULL,
	"diubah_oleh" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kota" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "kota_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"nama" text NOT NULL,
	"provinsi" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kota_slug_unique" UNIQUE("slug"),
	CONSTRAINT "kota_nama_provinsi_unique" UNIQUE("nama","provinsi")
);
--> statement-breakpoint
CREATE TABLE "prodi" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "prodi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kampus_id" integer NOT NULL,
	"kode_prodi" varchar(10) NOT NULL,
	"nama" text NOT NULL,
	"jenjang" "jenjang" NOT NULL,
	"bidang" text,
	"slug" text NOT NULL,
	"jurusan_override_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prodi_slug_unique" UNIQUE("slug"),
	CONSTRAINT "prodi_kampus_kode_jenjang_nama_unique" UNIQUE("kampus_id","kode_prodi","jenjang","nama")
);
--> statement-breakpoint
CREATE TABLE "verifikasi_kampus" (
	"user_id" text NOT NULL,
	"kampus_id" integer NOT NULL,
	"email" text NOT NULL,
	"verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "verifikasi_kampus_user_id_kampus_id_pk" PRIMARY KEY("user_id","kampus_id")
);
--> statement-breakpoint
CREATE TABLE "kode_riasec" (
	"jurusan_id" integer NOT NULL,
	"urutan" smallint NOT NULL,
	"tipe" "riasec_tipe" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "kode_riasec_jurusan_id_urutan_pk" PRIMARY KEY("jurusan_id","urutan"),
	CONSTRAINT "kode_riasec_jurusan_tipe_unique" UNIQUE("jurusan_id","tipe"),
	CONSTRAINT "kode_riasec_urutan_check" CHECK ("kode_riasec"."urutan" BETWEEN 1 AND 3)
);
--> statement-breakpoint
CREATE TABLE "laporan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ulasan_id" uuid NOT NULL,
	"revisi_id" uuid NOT NULL,
	"alasan" "alasan_laporan" NOT NULL,
	"catatan" text,
	"pelapor_id" text,
	"ip_hash" text,
	"status" "status_laporan" DEFAULT 'baru' NOT NULL,
	"ditangani_oleh" text,
	"ditangani_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ulasan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pengulas_id" text NOT NULL,
	"prodi_id" integer NOT NULL,
	"status_pengulas" "status_pengulas" NOT NULL,
	"tahun_masuk" smallint NOT NULL,
	"revisi_terbit_id" uuid,
	"dihapus_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ulasan_tahun_masuk_check" CHECK ("ulasan"."tahun_masuk" BETWEEN 1950 AND 2100)
);
--> statement-breakpoint
CREATE TABLE "ulasan_revisi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ulasan_id" uuid NOT NULL,
	"nomor" smallint NOT NULL,
	"judul" text NOT NULL,
	"isi" text NOT NULL,
	"bintang" smallint NOT NULL,
	"aspek_kurikulum" smallint NOT NULL,
	"aspek_dosen" smallint NOT NULL,
	"aspek_fasilitas" smallint NOT NULL,
	"aspek_suasana_belajar" smallint NOT NULL,
	"aspek_organisasi" smallint NOT NULL,
	"aspek_biaya_kualitas" smallint NOT NULL,
	"rekomendasi" boolean NOT NULL,
	"status" "status_ulasan" DEFAULT 'menunggu' NOT NULL,
	"tingkat_risiko" "tingkat_risiko",
	"alasan_screening" text,
	"percobaan_screening" smallint DEFAULT 0 NOT NULL,
	"discreening_at" timestamp with time zone,
	"diputuskan_oleh" text,
	"diputuskan_at" timestamp with time zone,
	"alasan_moderator" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ulasan_revisi_ulasan_nomor_unique" UNIQUE("ulasan_id","nomor"),
	CONSTRAINT "ulasan_revisi_ulasan_id_id_unique" UNIQUE("ulasan_id","id"),
	CONSTRAINT "ulasan_revisi_bintang_check" CHECK ("bintang" BETWEEN 1 AND 5),
	CONSTRAINT "ulasan_revisi_aspek_kurikulum_check" CHECK ("aspek_kurikulum" BETWEEN 1 AND 5),
	CONSTRAINT "ulasan_revisi_aspek_dosen_check" CHECK ("aspek_dosen" BETWEEN 1 AND 5),
	CONSTRAINT "ulasan_revisi_aspek_fasilitas_check" CHECK ("aspek_fasilitas" BETWEEN 1 AND 5),
	CONSTRAINT "ulasan_revisi_aspek_suasana_belajar_check" CHECK ("aspek_suasana_belajar" BETWEEN 1 AND 5),
	CONSTRAINT "ulasan_revisi_aspek_organisasi_check" CHECK ("aspek_organisasi" BETWEEN 1 AND 5),
	CONSTRAINT "ulasan_revisi_aspek_biaya_kualitas_check" CHECK ("aspek_biaya_kualitas" BETWEEN 1 AND 5)
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kampus" ADD CONSTRAINT "kampus_kota_id_kota_id_fk" FOREIGN KEY ("kota_id") REFERENCES "public"."kota"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kode_prodi_jurusan" ADD CONSTRAINT "kode_prodi_jurusan_jurusan_id_jurusan_id_fk" FOREIGN KEY ("jurusan_id") REFERENCES "public"."jurusan"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kode_prodi_jurusan" ADD CONSTRAINT "kode_prodi_jurusan_diubah_oleh_users_id_fk" FOREIGN KEY ("diubah_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prodi" ADD CONSTRAINT "prodi_jurusan_override_id_jurusan_id_fk" FOREIGN KEY ("jurusan_override_id") REFERENCES "public"."jurusan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifikasi_kampus" ADD CONSTRAINT "verifikasi_kampus_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifikasi_kampus" ADD CONSTRAINT "verifikasi_kampus_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kode_riasec" ADD CONSTRAINT "kode_riasec_jurusan_id_jurusan_id_fk" FOREIGN KEY ("jurusan_id") REFERENCES "public"."jurusan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_ulasan_id_ulasan_id_fk" FOREIGN KEY ("ulasan_id") REFERENCES "public"."ulasan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_revisi_id_ulasan_revisi_id_fk" FOREIGN KEY ("revisi_id") REFERENCES "public"."ulasan_revisi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_pelapor_id_users_id_fk" FOREIGN KEY ("pelapor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_ditangani_oleh_users_id_fk" FOREIGN KEY ("ditangani_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulasan" ADD CONSTRAINT "ulasan_pengulas_id_users_id_fk" FOREIGN KEY ("pengulas_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulasan" ADD CONSTRAINT "ulasan_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulasan" ADD CONSTRAINT "ulasan_revisi_terbit_fk" FOREIGN KEY ("id","revisi_terbit_id") REFERENCES "public"."ulasan_revisi"("ulasan_id","id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulasan_revisi" ADD CONSTRAINT "ulasan_revisi_ulasan_id_ulasan_id_fk" FOREIGN KEY ("ulasan_id") REFERENCES "public"."ulasan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulasan_revisi" ADD CONSTRAINT "ulasan_revisi_diputuskan_oleh_users_id_fk" FOREIGN KEY ("diputuskan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kampus_kota_id_idx" ON "kampus" USING btree ("kota_id");--> statement-breakpoint
CREATE INDEX "prodi_kode_prodi_idx" ON "prodi" USING btree ("kode_prodi");--> statement-breakpoint
CREATE INDEX "laporan_status_idx" ON "laporan" USING btree ("status");--> statement-breakpoint
CREATE INDEX "laporan_ulasan_id_idx" ON "laporan" USING btree ("ulasan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ulasan_pengulas_prodi_aktif_unique" ON "ulasan" USING btree ("pengulas_id","prodi_id") WHERE "ulasan"."dihapus_at" IS NULL;--> statement-breakpoint
CREATE INDEX "ulasan_prodi_id_idx" ON "ulasan" USING btree ("prodi_id");--> statement-breakpoint
CREATE INDEX "ulasan_revisi_status_idx" ON "ulasan_revisi" USING btree ("status");