import type { CurriculoLattes } from "@/lib/lattes-parser";
import { generateBibtex } from "@/lib/bib-exporter";

export async function POST(request: Request) {
  let curriculo: CurriculoLattes;

  try {
    const body = await request.json();
    curriculo = body.curriculo;
  } catch {
    return Response.json({ error: "Corpo inválido: envie { curriculo } em JSON." }, { status: 400 });
  }

  if (!curriculo || typeof curriculo !== "object") {
    return Response.json({ error: "Currículo ausente no corpo da requisição." }, { status: 400 });
  }

  try {
    const bib = generateBibtex(curriculo);

    return new Response(bib, {
      headers: {
        "Content-Type": "application/x-bibtex",
        "Content-Disposition": 'attachment; filename="minha-producao.bib"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao gerar o arquivo .bib.";
    return Response.json({ error: message }, { status: 500 });
  }
}
