// Campus email domains (decisions.md 17o). A Kampus's domain comes from the
// reviewed data/domain-kampus.csv; an address on that domain or any of its
// subdomains (mail.ugm.ac.id for ugm.ac.id) proves a link to the Kampus.

// Indonesian campuses use .ac.id; a few (upi.edu, uph.edu, uksw.edu) use .edu.
const HOST = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:ac\.id|edu)$/;

export function domainSah(domain: string): boolean {
  return HOST.test(domain);
}

// "Nama@Mail.UGM.ac.id " -> "mail.ugm.ac.id"; null if it isn't an address.
export function domainEmail(email: string): string | null {
  const m = /^[^\s@]{1,64}@([^\s@]{1,253})$/.exec(email.trim());
  if (!m) return null;
  const domain = m[1].toLowerCase();
  return domainSah(domain) ? domain : null;
}

// Whether an address's domain belongs to a Kampus domain.
export function cocokDomain(domainAlamat: string, domainKampus: string): boolean {
  return domainAlamat === domainKampus || domainAlamat.endsWith(`.${domainKampus}`);
}

export type BarisDomain = { npsn: string; domain: string };

// Rows of domain-kampus.csv -> the domains to load. With `usulan`, a blank
// `domain` falls back to `domain_usulan` (development only).
export function bacaDomain(rows: Record<string, string>[], usulan: boolean): { baris: BarisDomain[]; galat: string[] } {
  const galat: string[] = [];
  const baris: BarisDomain[] = [];
  const dipakai = new Map<string, string>();
  rows.forEach((r, i) => {
    const npsn = (r.npsn ?? "").trim();
    const domain = ((r.domain ?? "").trim() || (usulan ? (r.domain_usulan ?? "").trim() : "")).toLowerCase();
    if (!npsn || !domain) return;
    if (!domainSah(domain)) galat.push(`row ${i + 2}: "${domain}" is not a .ac.id or .edu host name`);
    const lain = dipakai.get(domain);
    if (lain) galat.push(`row ${i + 2}: "${domain}" is also used by NPSN ${lain}`);
    dipakai.set(domain, npsn);
    baris.push({ npsn, domain });
  });
  return { baris, galat };
}
