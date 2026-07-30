import type { Metadata } from "next";
import UploadLattesXML from "@/components/UploadLattesXML";

export const metadata: Metadata = {
  title: "Importar Currículo Lattes | Lattes → ORCID",
  description:
    "Suba o XML exportado do seu Currículo Lattes e receba um currículo formatado para editais e um arquivo pronto para importar no ORCID.",
};

export default function UploadPage() {
  return (
    <div className="flex flex-1 items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-start px-16 py-16">
        <UploadLattesXML />
      </main>
    </div>
  );
}
