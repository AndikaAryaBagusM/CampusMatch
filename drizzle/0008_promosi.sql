CREATE TYPE "public"."status_promosi" AS ENUM('draf', 'aktif', 'dihentikan');--> statement-breakpoint
CREATE TABLE "promosi" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "promosi_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kampus_id" integer NOT NULL,
	"teks" text,
	"di_beranda" boolean DEFAULT false NOT NULL,
	"mulai" date NOT NULL,
	"selesai" date NOT NULL,
	"status" "status_promosi" DEFAULT 'draf' NOT NULL,
	"catatan_internal" text,
	"dimasukkan_oleh" text,
	"diaktifkan_oleh" text,
	"diaktifkan_at" timestamp with time zone,
	"dihentikan_oleh" text,
	"dihentikan_at" timestamp with time zone,
	"alasan_dihentikan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "promosi_tanggal_check" CHECK ("promosi"."selesai" >= "promosi"."mulai"),
	CONSTRAINT "promosi_teks_check" CHECK ("promosi"."teks" IS NULL OR length("promosi"."teks") BETWEEN 1 AND 140),
	CONSTRAINT "promosi_status_check" CHECK (("promosi"."status" = 'draf' AND "promosi"."diaktifkan_oleh" IS NULL AND "promosi"."diaktifkan_at" IS NULL)
        OR ("promosi"."status" <> 'draf' AND "promosi"."diaktifkan_at" IS NOT NULL AND "promosi"."diaktifkan_oleh" <> "promosi"."dimasukkan_oleh")),
	CONSTRAINT "promosi_dihentikan_check" CHECK (("promosi"."status" = 'dihentikan') = ("promosi"."dihentikan_at" IS NOT NULL AND "promosi"."alasan_dihentikan" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "promosi_jurusan" (
	"promosi_id" integer NOT NULL,
	"jurusan_id" integer NOT NULL,
	CONSTRAINT "promosi_jurusan_promosi_id_jurusan_id_pk" PRIMARY KEY("promosi_id","jurusan_id")
);
--> statement-breakpoint
CREATE TABLE "promosi_klik" (
	"promosi_id" integer NOT NULL,
	"tanggal" date NOT NULL,
	"jumlah" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "promosi_klik_promosi_id_tanggal_pk" PRIMARY KEY("promosi_id","tanggal")
);
--> statement-breakpoint
ALTER TABLE "promosi" ADD CONSTRAINT "promosi_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promosi" ADD CONSTRAINT "promosi_dimasukkan_oleh_users_id_fk" FOREIGN KEY ("dimasukkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promosi" ADD CONSTRAINT "promosi_diaktifkan_oleh_users_id_fk" FOREIGN KEY ("diaktifkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promosi" ADD CONSTRAINT "promosi_dihentikan_oleh_users_id_fk" FOREIGN KEY ("dihentikan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promosi_jurusan" ADD CONSTRAINT "promosi_jurusan_promosi_id_promosi_id_fk" FOREIGN KEY ("promosi_id") REFERENCES "public"."promosi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promosi_jurusan" ADD CONSTRAINT "promosi_jurusan_jurusan_id_jurusan_id_fk" FOREIGN KEY ("jurusan_id") REFERENCES "public"."jurusan"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promosi_klik" ADD CONSTRAINT "promosi_klik_promosi_id_promosi_id_fk" FOREIGN KEY ("promosi_id") REFERENCES "public"."promosi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "promosi_kampus_id_idx" ON "promosi" USING btree ("kampus_id");--> statement-breakpoint
CREATE INDEX "promosi_jurusan_jurusan_id_idx" ON "promosi_jurusan" USING btree ("jurusan_id");