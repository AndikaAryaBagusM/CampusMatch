// The site's public origin, for absolute links in emails, share messages, the
// sitemap and structured data. AUTH_URL is set explicitly on Railway.
export const ASAL_SITUS = new URL(process.env.AUTH_URL ?? "https://www.campusmatch.site").origin;

export const urlSitus = (jalur: string) => `${ASAL_SITUS}${jalur}`;

// A wa.me link that opens WhatsApp with the message ready and no recipient,
// so the visitor picks who gets it. Nothing passes through CampusMatch.
export const tautanWhatsApp = (pesan: string) => `https://wa.me/?text=${encodeURIComponent(pesan)}`;
