ALTER TYPE "public"."periode_biaya" ADD VALUE 'per_sks';--> statement-breakpoint
ALTER TABLE "biaya" DROP CONSTRAINT "biaya_periode_check";--> statement-breakpoint
ALTER TABLE "biaya" ADD CONSTRAINT "biaya_periode_check" CHECK (("biaya"."jenis" <> 'ukt' OR "biaya"."periode" = 'per_semester')
        AND ("biaya"."jenis" <> 'spp' OR "biaya"."periode"::text IN ('per_semester', 'per_sks'))
        AND ("biaya"."jenis" NOT IN ('uang_pangkal', 'pendaftaran') OR "biaya"."periode" = 'sekali'));