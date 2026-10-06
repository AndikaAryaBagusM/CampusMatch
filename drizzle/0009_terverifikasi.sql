CREATE TABLE "token_verifikasi_kampus" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "token_verifikasi_kampus_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" text NOT NULL,
	"kampus_id" integer NOT NULL,
	"domain" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "token_verifikasi_kampus_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "token_verifikasi_kampus" ADD CONSTRAINT "token_verifikasi_kampus_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_verifikasi_kampus" ADD CONSTRAINT "token_verifikasi_kampus_kampus_id_kampus_id_fk" FOREIGN KEY ("kampus_id") REFERENCES "public"."kampus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "token_verifikasi_kampus_user_id_idx" ON "token_verifikasi_kampus" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "kampus_domain_email_unique" ON "kampus" USING btree ("domain_email") WHERE "kampus"."domain_email" IS NOT NULL;--> statement-breakpoint
-- Keep only the domain of a verified campus email, never the address (decisions.md 17o). The table is empty.
ALTER TABLE "verifikasi_kampus" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "verifikasi_kampus" ADD COLUMN "domain" text NOT NULL;