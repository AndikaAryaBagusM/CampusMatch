CREATE TYPE "public"."beasiswa_pengulas" AS ENUM('tidak_ada', 'kip_kuliah', 'kampus', 'lain');--> statement-breakpoint
CREATE TABLE "info_biaya" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "info_biaya_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"prodi_id" integer NOT NULL,
	"status_pengulas" "status_pengulas" NOT NULL,
	"tahun_masuk" smallint NOT NULL,
	"kategori_jalur" "kategori_jalur",
	"tes" "tes_jalur"[],
	"biaya_semester" bigint,
	"kelompok_ukt" smallint,
	"uang_pangkal" bigint,
	"biaya_lain_masuk" bigint,
	"beasiswa" "beasiswa_pengulas",
	"disetujui_at" timestamp with time zone NOT NULL,
	"dikesampingkan_oleh" text,
	"dikesampingkan_at" timestamp with time zone,
	"alasan_dikesampingkan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "info_biaya_user_prodi_unique" UNIQUE("user_id","prodi_id"),
	CONSTRAINT "info_biaya_tahun_masuk_check" CHECK ("info_biaya"."tahun_masuk" BETWEEN 1950 AND 2100),
	CONSTRAINT "info_biaya_jumlah_check" CHECK (("info_biaya"."biaya_semester" IS NULL OR "info_biaya"."biaya_semester" BETWEEN 0 AND 50000000)
        AND ("info_biaya"."uang_pangkal" IS NULL OR "info_biaya"."uang_pangkal" BETWEEN 0 AND 1000000000)
        AND ("info_biaya"."biaya_lain_masuk" IS NULL OR "info_biaya"."biaya_lain_masuk" BETWEEN 0 AND 100000000)
        AND ("info_biaya"."kelompok_ukt" IS NULL OR "info_biaya"."kelompok_ukt" BETWEEN 1 AND 20)),
	CONSTRAINT "info_biaya_ada_jawaban_check" CHECK (num_nonnulls("info_biaya"."kategori_jalur", "info_biaya"."tes", "info_biaya"."biaya_semester", "info_biaya"."uang_pangkal", "info_biaya"."biaya_lain_masuk", "info_biaya"."beasiswa") > 0),
	CONSTRAINT "info_biaya_dikesampingkan_check" CHECK (("info_biaya"."dikesampingkan_at" IS NULL) = ("info_biaya"."alasan_dikesampingkan" IS NULL))
);
--> statement-breakpoint
ALTER TABLE "info_biaya" ADD CONSTRAINT "info_biaya_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "info_biaya" ADD CONSTRAINT "info_biaya_prodi_id_prodi_id_fk" FOREIGN KEY ("prodi_id") REFERENCES "public"."prodi"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "info_biaya" ADD CONSTRAINT "info_biaya_dikesampingkan_oleh_users_id_fk" FOREIGN KEY ("dikesampingkan_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "info_biaya_prodi_tahun_idx" ON "info_biaya" USING btree ("prodi_id","tahun_masuk");