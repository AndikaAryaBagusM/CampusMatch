// Unstyled search page that proves catalogue search works. The real design
// comes in step 3 from Figma.
import { withDb } from "@/db";
import { MIN_QUERY_LENGTH, searchKatalog } from "@/lib/search";

export default async function CariPage(props: PageProps<"/cari">) {
  const { q } = await props.searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const results =
    query.length >= MIN_QUERY_LENGTH
      ? await withDb((db) => searchKatalog(db, query))
      : null;

  return (
    <main>
      <h1>Cari</h1>
      <form method="get" action="/cari">
        <input type="search" name="q" defaultValue={query} placeholder="Jurusan, Kampus atau Prodi" />
        <button type="submit">Cari</button>
      </form>

      {results && (
        <>
          <h2>Jurusan</h2>
          <ul>
            {results.jurusan.map((j) => (
              <li key={j.id}>{j.nama}</li>
            ))}
          </ul>
          {results.jurusan.length === 0 && <p>Tidak ada.</p>}

          <h2>Kampus</h2>
          <ul>
            {results.kampus.map((k) => (
              <li key={k.id}>
                {k.nama}
                {k.akreditasi ? ` (Akreditasi ${k.akreditasi})` : ""}
              </li>
            ))}
          </ul>
          {results.kampus.length === 0 && <p>Tidak ada.</p>}

          <h2>Prodi</h2>
          <ul>
            {results.prodi.map((p) => (
              <li key={p.id}>
                {p.jenjang} {p.nama}, {p.kampusNama}
              </li>
            ))}
          </ul>
          {results.prodi.length === 0 && <p>Tidak ada.</p>}
        </>
      )}
    </main>
  );
}
