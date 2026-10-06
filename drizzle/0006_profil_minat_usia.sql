CREATE TABLE "profil_minat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"skor_r" smallint NOT NULL,
	"skor_i" smallint NOT NULL,
	"skor_a" smallint NOT NULL,
	"skor_s" smallint NOT NULL,
	"skor_e" smallint NOT NULL,
	"skor_c" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profil_minat_skor_r_check" CHECK ("skor_r" BETWEEN 0 AND 10),
	CONSTRAINT "profil_minat_skor_i_check" CHECK ("skor_i" BETWEEN 0 AND 10),
	CONSTRAINT "profil_minat_skor_a_check" CHECK ("skor_a" BETWEEN 0 AND 10),
	CONSTRAINT "profil_minat_skor_s_check" CHECK ("skor_s" BETWEEN 0 AND 10),
	CONSTRAINT "profil_minat_skor_e_check" CHECK ("skor_e" BETWEEN 0 AND 10),
	CONSTRAINT "profil_minat_skor_c_check" CHECK ("skor_c" BETWEEN 0 AND 10)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "usia18_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "dikunci_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profil_minat" ADD CONSTRAINT "profil_minat_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "profil_minat_user_id_idx" ON "profil_minat" USING btree ("user_id");