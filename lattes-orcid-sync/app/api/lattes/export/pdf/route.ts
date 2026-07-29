import type { CurriculoLattes } from "@/lib/lattes-parser";
import { isValidOrcidId } from "@/lib/lattes-format";
import { generateLattesPdf } from "@/lib/pdf-generator";

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function slugifyFileName(nome: string | undefined): string {
  if (!nome) return "curriculo-lattes";
  return (
    nome
      .normalize("NFD")
      .replace(DIACRITICS_REGEX, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "curriculo-lattes"
  );
}

export async function POST(request: Request) {
  let curriculo: CurriculoLattes;
  let orcidId: string | undefined;

  try {
    const body = await request.json();
    curriculo = body.curriculo;
    orcidId = typeof body.orcidId === "string" ? body.orcidId.trim() : undefined;
  } catch {
    return Response.json({ error: "Corpo inválido: envie { curriculo } em JSON." }, { status: 400 });
  }

  if (!curriculo || typeof curriculo !== "object") {
    return Response.json({ error: "Currículo ausente no corpo da requisição." }, { status: 400 });
  }

  if (orcidId && !isValidOrcidId(orcidId)) {
    return Response.json(
      { error: "ORCID iD inválido. Use o formato 0000-0000-0000-0000." },
      { status: 400 },
    );
  }

  try {
    const pdf = await generateLattesPdf(curriculo, orcidId || undefined);
    const fileName = `${slugifyFileName(curriculo.dadosPessoais?.nomeCompleto)}.pdf`;

    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao gerar o PDF.";
    return Response.json({ error: message }, { status: 500 });
  }
}
