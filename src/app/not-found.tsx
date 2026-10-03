import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { kontainer, Panel } from "@/components/panel";
import { SearchForm } from "@/components/search-form";

export default function NotFound() {
  return (
    <div className={`${kontainer} py-10`}>
      <Panel>
        <EmptyState icon={SearchX} title="Halaman tidak ditemukan">
          Alamat ini tidak ada di katalog CampusMatch. Coba cari, atau kembali ke{" "}
          <Link href="/" className="font-medium text-primary hover:underline">
            beranda
          </Link>
          .
        </EmptyState>
        <SearchForm className="mx-auto mt-2 max-w-xl" />
      </Panel>
    </div>
  );
}
