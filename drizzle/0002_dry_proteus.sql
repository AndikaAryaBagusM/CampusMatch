CREATE TABLE "impor_katalog" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "impor_katalog_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tanggal_data" date NOT NULL,
	"sumber" jsonb NOT NULL,
	"jumlah_kota" integer NOT NULL,
	"jumlah_kampus" integer NOT NULL,
	"jumlah_prodi" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "jurusan_nama_trgm_idx" ON "jurusan" USING gin ("nama" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "kampus_nama_trgm_idx" ON "kampus" USING gin ("nama" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "prodi_nama_trgm_idx" ON "prodi" USING gin ("nama" gin_trgm_ops);