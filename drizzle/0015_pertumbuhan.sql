CREATE TABLE "kunjungan_harian" (
	"tanggal" date NOT NULL,
	"jalur" text NOT NULL,
	"asal" text NOT NULL,
	"jumlah" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "kunjungan_harian_tanggal_jalur_asal_pk" PRIMARY KEY("tanggal","jalur","asal")
);
--> statement-breakpoint
CREATE TABLE "ulasan_membantu" (
	"ulasan_id" uuid NOT NULL,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ulasan_membantu_ulasan_id_ip_hash_pk" PRIMARY KEY("ulasan_id","ip_hash")
);
--> statement-breakpoint
ALTER TABLE "ulasan_revisi" ALTER COLUMN "judul" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ulasan_revisi" ALTER COLUMN "isi" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ulasan_membantu" ADD CONSTRAINT "ulasan_membantu_ulasan_id_ulasan_id_fk" FOREIGN KEY ("ulasan_id") REFERENCES "public"."ulasan"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ulasan_revisi" ADD CONSTRAINT "ulasan_revisi_teks_check" CHECK (("ulasan_revisi"."judul" IS NULL) = ("ulasan_revisi"."isi" IS NULL));