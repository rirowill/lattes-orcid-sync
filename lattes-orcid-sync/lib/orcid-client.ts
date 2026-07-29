// Cliente para a API REST pública do ORCID (pub.orcid.org) — modo somente
// leitura, sem OAuth. Funciona para qualquer ORCID iD com registros públicos.

export interface OrcidWork {
  titulo?: string;
  ano?: number;
  tipo?: string;
  doi?: string;
}

export class OrcidApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "OrcidApiError";
    this.status = status;
  }
}

// biome-ignore lint: resposta da API do ORCID é tratada dinamicamente abaixo
type RawNode = Record<string, any>;

function extractDoi(summary: RawNode): string | undefined {
  const externalIds: RawNode[] = summary?.["external-ids"]?.["external-id"] ?? [];
  const doiEntry = externalIds.find((id) => String(id["external-id-type"]).toLowerCase() === "doi");
  return doiEntry?.["external-id-value"] || undefined;
}

function extractYear(summary: RawNode): number | undefined {
  const year = summary?.["publication-date"]?.year?.value;
  if (!year) return undefined;
  const parsed = Number(year);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function summaryToWork(summary: RawNode): OrcidWork {
  return {
    titulo: summary?.title?.title?.value || undefined,
    ano: extractYear(summary),
    tipo: summary?.type || undefined,
    doi: extractDoi(summary),
  };
}

/**
 * Busca as obras públicas de um pesquisador na API pública do ORCID
 * (https://pub.orcid.org/v3.0/{orcidId}/works). Cada "group" da resposta
 * agrupa registros duplicados da mesma obra (enviados por fontes
 * diferentes); usamos a entrada do grupo que tiver DOI, ou a primeira.
 */
export async function fetchOrcidWorks(orcidId: string): Promise<OrcidWork[]> {
  let response: Response;

  try {
    response = await fetch(`https://pub.orcid.org/v3.0/${encodeURIComponent(orcidId)}/works`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new OrcidApiError("Não foi possível conectar à API pública do ORCID.");
  }

  if (response.status === 404) {
    throw new OrcidApiError(`ORCID iD ${orcidId} não encontrado.`, 404);
  }
  if (!response.ok) {
    throw new OrcidApiError(`Falha ao consultar a API pública do ORCID (HTTP ${response.status}).`, response.status);
  }

  const data: RawNode = await response.json();
  const groups: RawNode[] = Array.isArray(data.group) ? data.group : [];

  return groups
    .map((group) => {
      const summaries: RawNode[] = Array.isArray(group["work-summary"]) ? group["work-summary"] : [];
      const withDoi = summaries.find((summary) => extractDoi(summary));
      const summary = withDoi ?? summaries[0];
      return summary ? summaryToWork(summary) : undefined;
    })
    .filter((work): work is OrcidWork => work !== undefined);
}
