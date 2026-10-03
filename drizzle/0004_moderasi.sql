CREATE TYPE "public"."aksi_moderasi" AS ENUM('screening', 'disetujui', 'ditolak', 'diturunkan', 'laporan_ditutup', 'dihapus_pengulas');--> statement-breakpoint
CREATE TABLE "batas_laju" (
	"kunci" text NOT NULL,
	"mulai" timestamp with time zone NOT NULL,
	"jumlah" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "batas_laju_kunci_mulai_pk" PRIMARY KEY("kunci","mulai")
);
--> statement-breakpoint
CREATE TABLE "riwayat_moderasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ulasan_id" uuid NOT NULL,
	"revisi_id" uuid,
	"laporan_id" uuid,
	"aksi" "aksi_moderasi" NOT NULL,
	"oleh" text,
	"alasan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ulasan_revisi" ADD COLUMN "model_screening" text;--> statement-breakpoint
ALTER TABLE "riwayat_moderasi" ADD CONSTRAINT "riwayat_moderasi_ulasan_id_ulasan_id_fk" FOREIGN KEY ("ulasan_id") REFERENCES "public"."ulasan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_moderasi" ADD CONSTRAINT "riwayat_moderasi_revisi_id_ulasan_revisi_id_fk" FOREIGN KEY ("revisi_id") REFERENCES "public"."ulasan_revisi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_moderasi" ADD CONSTRAINT "riwayat_moderasi_laporan_id_laporan_id_fk" FOREIGN KEY ("laporan_id") REFERENCES "public"."laporan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_moderasi" ADD CONSTRAINT "riwayat_moderasi_oleh_users_id_fk" FOREIGN KEY ("oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "riwayat_moderasi_ulasan_id_idx" ON "riwayat_moderasi" USING btree ("ulasan_id");--> statement-breakpoint
CREATE UNIQUE INDEX "laporan_ulasan_pelapor_baru_unique" ON "laporan" USING btree ("ulasan_id","pelapor_id") WHERE "laporan"."status" = 'baru';