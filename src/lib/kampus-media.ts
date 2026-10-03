// The one place a Kampus logo or banner comes from. We hold no image rights
// yet, so the map is empty and pages fall back to the monogram and a
// text-and-data header. Add entries here (or swap the lookup for a future
// column) and every page picks the images up without changes.

export type KampusMedia = { logoUrl?: string; bannerUrl?: string };

// Keyed by NPSN.
const MEDIA: Record<string, KampusMedia> = {};

export function getKampusMedia(kampus: { npsn: string }): KampusMedia {
  return MEDIA[kampus.npsn] ?? {};
}
