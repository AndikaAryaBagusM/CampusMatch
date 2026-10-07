CREATE TABLE "peringkat_qs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "peringkat_qs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"kampus_id" integer NOT NULL,
	"edisi" integer NOT NULL,
	"peringkat" text NOT NULL,
	"peringkat_min" integer NOT NULL,
	"peringkat_max" integer,
	"nama_qs" text NOT NULL,
	"sumber_url" text NOT NULL,
	"tanggal_ambil" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "peringkat_qs_kampus_edisi_unique" UNIQUE("kampus_id","edisi"),
	CONSTRAINT "peringkat_qs_bounds_check" CHECK ("peringkat_qs"."peringkat_min" > 0 AND ("peringkat_qs"."peringkat_max" IS NULL OR "peringkat_qs"."peringkat_max" >= "peringkat_qs"."peringkat_min"))
);
--> statement-breakpoint
ALTER TABLE "peringkat_qs" ADD CONSTRAINT "peringkat_qs_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "peringkat_qs_edisi_idx" ON "peringkat_qs" USING btree ("edisi");