import type { CurriculoLattes } from "./lattes-parser";
import type { OrcidWork } from "./orcid-client";

export type StatusSincronizacao = "sincronizado" | "apenas_lattes" | "apenas_orcid";

export interface ItemComparado {
  titulo: string;
  ano?: number;
  doi?: string;
  status: StatusSincronizacao;
}

export interface ResumoComparacao {
  sincronizado: number;
  apenasLattes: number;
  apenasOrcid: number;
}

export interface ResultadoComparacao {
  itens: ItemComparado[];
  resumo: ResumoComparacao;
}

interface LattesItem {
  titulo?: string;
  ano?: number;
  doi?: string;
}

/** Remove o prefixo de URL e normaliza caixa para comparar DOIs de fontes diferentes. */
function normalizeDoi(doi: string | undefined): string | undefined {
  if (!doi) return undefined;
  const cleaned = doi
    .trim()
    .toLowerCase()
    .replace(/^doi:\s*/, "")
    .replace(/^https?:\/\/(dx\.)?doi\.org\//, "");
  return cleaned || undefined;
}

/** Normaliza título para comparação aproximada quando não há DOI disponível. */
function normalizeTitulo(titulo: string | undefined): string | undefined {
  if (!titulo) return undefined;
  const cleaned = titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return cleaned || undefined;
}

function collectLattesItems(curriculo: CurriculoLattes): LattesItem[] {
  const { producaoBibliografica } = curriculo;
  return [
    ...producaoBibliografica.artigosPublicados.map((a) => ({ titulo: a.titulo, ano: a.ano, doi: a.doi })),
    ...producaoBibliografica.livrosPublicados.map((l) => ({ titulo: l.titulo, ano: l.ano })),
    ...producaoBibliografica.capitulosDeLivros.map((c) => ({ titulo: c.titulo, ano: c.ano })),
    ...producaoBibliografica.trabalhosEmEventos.map((t) => ({ titulo: t.titulo, ano: t.ano })),
  ];
}

/**
 * Cruza a produção bibliográfica extraída do XML do Lattes com as obras
 * públicas obtidas na API do ORCID. O casamento principal é por DOI
 * normalizado; quando não há DOI dos dois lados, cai para comparação
 * aproximada por título normalizado.
 */
export function compararProducao(curriculo: CurriculoLattes, orcidWorks: OrcidWork[]): ResultadoComparacao {
  const lattesItems = collectLattesItems(curriculo).filter((item) => item.titulo);

  const orcidByDoi = new Map<string, OrcidWork>();
  const orcidByTitulo = new Map<string, OrcidWork>();
  for (const work of orcidWorks) {
    const doi = normalizeDoi(work.doi);
    if (doi && !orcidByDoi.has(doi)) orcidByDoi.set(doi, work);
    const titulo = normalizeTitulo(work.titulo);
    if (titulo && !orcidByTitulo.has(titulo)) orcidByTitulo.set(titulo, work);
  }

  const matchedOrcidWorks = new Set<OrcidWork>();
  const itens: ItemComparado[] = [];

  for (const item of lattesItems) {
    const doi = normalizeDoi(item.doi);
    const tituloNorm = normalizeTitulo(item.titulo);
    const match = (doi && orcidByDoi.get(doi)) ?? (tituloNorm && orcidByTitulo.get(tituloNorm));

    if (match) {
      matchedOrcidWorks.add(match);
      itens.push({ titulo: item.titulo!, ano: item.ano, doi: item.doi, status: "sincronizado" });
    } else {
      itens.push({ titulo: item.titulo!, ano: item.ano, doi: item.doi, status: "apenas_lattes" });
    }
  }

  for (const work of orcidWorks) {
    if (matchedOrcidWorks.has(work)) continue;
    itens.push({ titulo: work.titulo ?? "(sem título)", ano: work.ano, doi: work.doi, status: "apenas_orcid" });
  }

  const resumo: ResumoComparacao = {
    sincronizado: itens.filter((i) => i.status === "sincronizado").length,
    apenasLattes: itens.filter((i) => i.status === "apenas_lattes").length,
    apenasOrcid: itens.filter((i) => i.status === "apenas_orcid").length,
  };

  return { itens, resumo };
}
