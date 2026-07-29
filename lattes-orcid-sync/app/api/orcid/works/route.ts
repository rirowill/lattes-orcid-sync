import { isValidOrcidId } from "@/lib/lattes-format";
import { fetchOrcidWorks, OrcidApiError } from "@/lib/orcid-client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orcidId = searchParams.get("orcidId")?.trim();

  if (!orcidId || !isValidOrcidId(orcidId)) {
    return Response.json(
      { error: "Informe um ORCID iD válido (formato 0000-0000-0000-0000)." },
      { status: 400 },
    );
  }

  try {
    const works = await fetchOrcidWorks(orcidId);
    return Response.json({ works });
  } catch (error) {
    if (error instanceof OrcidApiError) {
      return Response.json({ error: error.message }, { status: error.status ?? 502 });
    }
    return Response.json({ error: "Falha ao consultar a API do ORCID." }, { status: 502 });
  }
}
