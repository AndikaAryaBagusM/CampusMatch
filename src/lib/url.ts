// Builds "path?a=1&b=2", dropping empty values, so filters and pages share one shape.
export function hrefWith(path: string, params: Record<string, string | number | null | undefined | false>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === false || v === "") continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

// The first value of a search param, or undefined.
export function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// "?hal=3" -> 3. Anything that is not a positive integer is page 1.
export function parseHalaman(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function jumlahHalaman(total: number, perHalaman: number): number {
  return Math.max(1, Math.ceil(total / perHalaman));
}
