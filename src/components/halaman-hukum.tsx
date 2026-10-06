import { kontainer, Panel } from "@/components/panel";
import { kontakEmail } from "@/lib/kontak";

// Shared layout for /privasi and /ketentuan. Both are drafts until a lawyer
// reviews them (docs/legal-todo.md).

export function HalamanHukum({
  judul,
  diperbarui,
  ringkas,
  children,
}: {
  judul: string;
  // "Terakhir diperbarui" date, e.g. "6 Oktober 2026".
  diperbarui: string;
  ringkas: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`${kontainer} max-w-3xl py-10`}>
      <Panel>
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight">{judul}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Terakhir diperbarui: {diperbarui}</p>
        <p className="mt-4">{ringkas}</p>
        <div className="mt-8 space-y-8">{children}</div>
      </Panel>
    </div>
  );
}

export function Bagian({ id, judul, children }: { id: string; judul: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3 text-[15px] leading-relaxed [&_a]:font-medium [&_a]:text-primary [&_a:hover]:underline [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
      <h2 className="text-xl font-bold">{judul}</h2>
      {children}
    </section>
  );
}

// The contact address from KONTAK_EMAIL, or a plain fallback when it isn't set.
export function TautanKontak() {
  const email = kontakEmail();
  return email ? <a href={`mailto:${email}`}>{email}</a> : <span>email kontak CampusMatch</span>;
}
