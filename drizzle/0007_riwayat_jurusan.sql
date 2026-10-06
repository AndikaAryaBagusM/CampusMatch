CREATE TABLE "riwayat_jurusan" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "riwayat_jurusan_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"jenis" text NOT NULL,
	"kode_prodi" varchar(10) NOT NULL,
	"prodi_id" integer,
	"jurusan_lama_id" integer,
	"jurusan_baru_id" integer,
	"alasan" text NOT NULL,
	"oleh" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "riwayat_jurusan_jenis_check" CHECK ("riwayat_jurusan"."jenis" IN ('kode', 'prodi') AND ("riwayat_jurusan"."jenis" = 'prodi') = ("riwayat_jurusan"."prodi_id" IS NOT NULL)),
	CONSTRAINT "riwayat_jurusan_alasan_check" CHECK (length(trim("riwayat_jurusan"."alasan")) > 0)
);
--> statement-breakpoint
ALTER TABLE "riwayat_jurusan" ADD CONSTRAINT "riwayat_jurusan_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_jurusan" ADD CONSTRAINT "riwayat_jurusan_jurusan_lama_id_jurusan_id_fk" FOREIGN KEY ("jurusan_lama_id") REFERENCES "public"."jurusan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_jurusan" ADD CONSTRAINT "riwayat_jurusan_jurusan_baru_id_jurusan_id_fk" FOREIGN KEY ("jurusan_baru_id") REFERENCES "public"."jurusan"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riwayat_jurusan" ADD CONSTRAINT "riwayat_jurusan_oleh_users_id_fk" FOREIGN KEY ("oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "riwayat_jurusan_kode_prodi_idx" ON "riwayat_jurusan" USING btree ("kode_prodi");