import type {
  ArtigoPublicado,
  Autor,
  CapituloDeLivro,
  CurriculoLattes,
  LivroPublicado,
  TrabalhoEmEvento,
} from "./lattes-parser";
import { cleanLattesText } from "./lattes-format";

// ---------------------------------------------------------------------------
// Escapamento de caracteres especiais do BibTeX/LaTeX
// ---------------------------------------------------------------------------

// Acentos são mantidos como UTF-8 literal (não convertidos para macros
// clássicos como \'{a}): o alvo principal deste export é o importador de
// BibTeX do ORCID e outras ferramentas modernas, que leem o .bib como texto
// simples em UTF-8, não como LaTeX compilável — macros ASCII apareceriam
// literalmente no lugar do caractere acentuado. Os caracteres abaixo, porém,
// têm significado de sintaxe em qualquer parser de BibTeX e precisam ser
// escapados para não quebrar o arquivo.
const LATEX_ESCAPES: Record<string, string> = {
  "\\": "\\textbackslash{}",
  "&": "\\&",
  "%": "\\%",
  $: "\\$",
  "#": "\\#",
  _: "\\_",
  "{": "\\{",
  "}": "\\}",
  "~": "\\textasciitilde{}",
  "^": "\\textasciicircum{}",
};

function escapeLatex(value: string): string {
  let result = "";
  for (const char of value) {
    result += LATEX_ESCAPES[char] ?? char;
  }
  return result;
}

/** Limpa (colapsa espaços, decodifica entidades) e escapa um campo de texto livre. */
function textField(value: string | undefined): string | undefined {
  const cleaned = cleanLattesText(value);
  return cleaned ? escapeLatex(cleaned) : undefined;
}

// ---------------------------------------------------------------------------
// Nomes de autores
// ---------------------------------------------------------------------------

// Partículas que permanecem grudadas ao sobrenome em nomes em português
// (ex: "João dos Santos" → sobrenome "dos Santos", não só "Santos").
const SURNAME_PARTICLES = new Set(["da", "das", "do", "dos", "de", "e"]);

function splitNome(nomeCompleto: string): { givenName: string; surname: string } {
  const words = nomeCompleto.trim().split(/\s+/);
  if (words.length === 1) return { givenName: "", surname: words[0] };

  let splitIndex = words.length - 1;
  for (let i = words.length - 2; i >= 1; i--) {
    if (SURNAME_PARTICLES.has(words[i].toLowerCase())) {
      splitIndex = i;
    } else {
      break;
    }
  }

  return {
    givenName: words.slice(0, splitIndex).join(" "),
    surname: words.slice(splitIndex).join(" "),
  };
}

function orderedAutores(autores: Autor[]): Autor[] {
  return autores.slice().sort((a, b) => (a.ordemDeAutoria ?? 0) - (b.ordemDeAutoria ?? 0));
}

/** Formata um autor como "Sobrenome, Nome" (padrão BibTeX). */
function formatAutorBibtex(autor: Autor): string | undefined {
  const nomeCompleto = cleanLattesText(autor.nomeCompleto);
  if (nomeCompleto) {
    const { givenName, surname } = splitNome(nomeCompleto);
    const surnameEsc = escapeLatex(surname);
    const givenEsc = givenName ? escapeLatex(givenName) : undefined;
    return givenEsc ? `${surnameEsc}, ${givenEsc}` : surnameEsc;
  }

  const nomeParaCitacao = cleanLattesText(autor.nomeParaCitacao);
  return nomeParaCitacao ? escapeLatex(nomeParaCitacao) : undefined;
}

/** Formata a lista completa de autores como "Sobrenome, Nome and Sobrenome2, Nome2". */
function formatAutoresBibtex(autores: Autor[]): string | undefined {
  const formatted = orderedAutores(autores)
    .map(formatAutorBibtex)
    .filter((name): name is string => Boolean(name));
  return formatted.length > 0 ? formatted.join(" and ") : undefined;
}

/** Sobrenome do primeiro autor, usado para montar a citation key. */
function firstAuthorSurname(autores: Autor[]): string | undefined {
  const first = orderedAutores(autores)[0];
  if (!first) return undefined;

  const nomeCompleto = cleanLattesText(first.nomeCompleto);
  if (nomeCompleto) return splitNome(nomeCompleto).surname;

  const nomeParaCitacao = cleanLattesText(first.nomeParaCitacao);
  return nomeParaCitacao?.split(",")[0]?.trim();
}

// ---------------------------------------------------------------------------
// Campos auxiliares
// ---------------------------------------------------------------------------

function formatPages(inicial: string | undefined, final: string | undefined): string | undefined {
  if (inicial && final) return `${inicial}--${final}`;
  return inicial || final || undefined;
}

/** Remove o prefixo de URL de um DOI, mantendo apenas o identificador puro. */
function bareDoi(doi: string | undefined): string | undefined {
  if (!doi) return undefined;
  const cleaned = doi
    .trim()
    .replace(/^doi:\s*/i, "")
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
  return cleaned || undefined;
}

// ---------------------------------------------------------------------------
// Citation keys
// ---------------------------------------------------------------------------

function slugifyKeyPart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Gera uma citation key única no formato "sobrenomeAno" (ex: "silva2021"),
 * adicionando sufixo a/b/c/... em colisões subsequentes (silva2021a,
 * silva2021b, ...). `usedKeys` deve ser compartilhado entre todas as
 * entradas geradas na mesma exportação.
 */
function buildCitationKey(
  surname: string | undefined,
  ano: number | undefined,
  usedKeys: Map<string, number>,
): string {
  const base = `${slugifyKeyPart(surname || "semautor")}${ano ?? "sd"}`;
  const occurrence = usedKeys.get(base) ?? 0;
  usedKeys.set(base, occurrence + 1);
  return occurrence === 0 ? base : `${base}${String.fromCharCode(96 + occurrence)}`;
}

// ---------------------------------------------------------------------------
// Montagem das entradas BibTeX
// ---------------------------------------------------------------------------

function buildEntry(type: string, key: string, fields: Record<string, string | undefined>): string {
  const lines = Object.entries(fields)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([field, value]) => `  ${field} = {${value}}`);

  return `@${type}{${key},\n${lines.join(",\n")}\n}`;
}

function buildArticleEntry(artigo: ArtigoPublicado, usedKeys: Map<string, number>): string {
  const key = buildCitationKey(firstAuthorSurname(artigo.autores), artigo.ano, usedKeys);
  return buildEntry("article", key, {
    author: formatAutoresBibtex(artigo.autores),
    title: textField(artigo.titulo),
    journal: textField(artigo.periodico),
    year: artigo.ano?.toString(),
    volume: artigo.volume,
    number: artigo.fasciculo,
    pages: formatPages(artigo.paginaInicial, artigo.paginaFinal),
    doi: bareDoi(artigo.doi),
  });
}

function buildBookEntry(livro: LivroPublicado, usedKeys: Map<string, number>): string {
  const key = buildCitationKey(firstAuthorSurname(livro.autores), livro.ano, usedKeys);
  return buildEntry("book", key, {
    author: formatAutoresBibtex(livro.autores),
    title: textField(livro.titulo),
    publisher: textField(livro.editora),
    year: livro.ano?.toString(),
    address: textField(livro.paisDePublicacao),
    isbn: livro.isbn,
  });
}

function buildIncollectionEntry(capitulo: CapituloDeLivro, usedKeys: Map<string, number>): string {
  const key = buildCitationKey(firstAuthorSurname(capitulo.autores), capitulo.ano, usedKeys);
  return buildEntry("incollection", key, {
    author: formatAutoresBibtex(capitulo.autores),
    title: textField(capitulo.titulo),
    booktitle: textField(capitulo.tituloDoLivro),
    publisher: textField(capitulo.editora),
    year: capitulo.ano?.toString(),
    pages: formatPages(capitulo.paginaInicial, capitulo.paginaFinal),
  });
}

function buildInproceedingsEntry(trabalho: TrabalhoEmEvento, usedKeys: Map<string, number>): string {
  const key = buildCitationKey(firstAuthorSurname(trabalho.autores), trabalho.ano, usedKeys);
  const isResumo = /RESUMO/i.test(trabalho.natureza ?? "");

  return buildEntry("inproceedings", key, {
    author: formatAutoresBibtex(trabalho.autores),
    title: textField(trabalho.titulo),
    booktitle: textField(trabalho.nomeDoEvento),
    year: trabalho.ano?.toString(),
    pages: formatPages(trabalho.paginaInicial, trabalho.paginaFinal),
    address: textField(trabalho.cidadeDoEvento),
    note: isResumo ? "Resumo" : undefined,
  });
}

/**
 * Gera um arquivo .bib (BibTeX) a partir da produção bibliográfica extraída
 * do Currículo Lattes, pronto para download e importação em ferramentas como
 * o "Add Works > Import BibTeX" do ORCID.
 */
export function generateBibtex(curriculo: CurriculoLattes): string {
  const usedKeys = new Map<string, number>();
  const { producaoBibliografica } = curriculo;

  const entries = [
    ...producaoBibliografica.artigosPublicados.map((artigo) => buildArticleEntry(artigo, usedKeys)),
    ...producaoBibliografica.livrosPublicados.map((livro) => buildBookEntry(livro, usedKeys)),
    ...producaoBibliografica.capitulosDeLivros.map((capitulo) => buildIncollectionEntry(capitulo, usedKeys)),
    ...producaoBibliografica.trabalhosEmEventos.map((trabalho) => buildInproceedingsEntry(trabalho, usedKeys)),
  ];

  return entries.join("\n\n");
}
