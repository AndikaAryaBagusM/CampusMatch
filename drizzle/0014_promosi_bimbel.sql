CREATE TYPE "public"."jenis_promosi" AS ENUM('kampus', 'bimbel');--> statement-breakpoint
ALTER TABLE "promosi" ALTER COLUMN "kampus_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "promosi" ADD COLUMN "jenis" "jenis_promosi" DEFAULT 'kampus' NOT NULL;--> statement-breakpoint
ALTER TABLE "promosi" ADD COLUMN "nama_pengiklan" text;--> statement-breakpoint
ALTER TABLE "promosi" ADD COLUMN "tautan" text;--> statement-breakpoint
ALTER TABLE "promosi" ADD CONSTRAINT "promosi_jenis_check" CHECK (("promosi"."jenis" = 'kampus' AND "promosi"."kampus_id" IS NOT NULL AND "promosi"."nama_pengiklan" IS NULL AND "promosi"."tautan" IS NULL)
        OR ("promosi"."jenis" = 'bimbel' AND "promosi"."kampus_id" IS NULL AND "promosi"."nama_pengiklan" IS NOT NULL AND "promosi"."teks" IS NOT NULL
          AND "promosi"."tautan" IS NOT NULL AND length("promosi"."nama_pengiklan") BETWEEN 1 AND 80
          AND "promosi"."tautan" LIKE 'https://%' AND length("promosi"."tautan") <= 500));