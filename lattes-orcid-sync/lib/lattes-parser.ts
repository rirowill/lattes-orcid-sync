import { XMLParser } from "fast-xml-parser";

// ---------------------------------------------------------------------------
// Tipos públicos — estrutura normalizada do Currículo Lattes
// ---------------------------------------------------------------------------

export interface DadosPessoais {
  identificadorLattes?: string;
  orcidId?: string;
  nomeCompleto?: string;
  nomeEmCitacoesBibliograficas?: string;
  nacionalidade?: string;
  paisDeNascimento?: string;
  ufNascimento?: string;
  cidadeDeNascimento?: string;
  resumoCv?: string;
  dataAtualizacao?: string;
}

export type NivelFormacao =
  | "GRADUACAO"
  | "ESPECIALIZACAO"
  | "MESTRADO"
  | "DOUTORADO"
  | "POS-DOUTORADO"
  | "LIVRE-DOCENCIA";

export interface FormacaoAcademica {
  nivel: NivelFormacao;
  instituicao?: string;
  curso?: string;
  statusDoCurso?: string;
  anoDeInicio?: number;
  anoDeConclusao?: number;
  tituloDoTrabalho?: string;
}

export interface Vinculo {
  tipoDeVinculo?: string;
  outroVinculoInformado?: string;
  enquadramentoFuncional?: string;
  anoInicio?: number;
  anoFim?: number;
  cargaHorariaSemanal?: string;
}

export interface AtuacaoProfissional {
  instituicao?: string;
  vinculos: Vinculo[];
}

export interface Autor {
  nomeCompleto?: string;
  nomeParaCitacao?: string;
  ordemDeAutoria?: number;
}

export interface ArtigoPublicado {
  titulo?: string;
  ano?: number;
  idioma?: string;
  paisDePublicacao?: string;
  doi?: string;
  issn?: string;
  periodico?: string;
  volume?: string;
  fasciculo?: string;
  paginaInicial?: string;
  paginaFinal?: string;
  autores: Autor[];
}

export interface LivroPublicado {
  titulo?: string;
  ano?: number;
  idioma?: string;
  paisDePublicacao?: string;
  isbn?: string;
  editora?: string;
  numeroDePaginas?: string;
  autores: Autor[];
}

export interface CapituloDeLivro {
  titulo?: string;
  ano?: number;
  tituloDoLivro?: string;
  paginaInicial?: string;
  paginaFinal?: string;
  isbn?: string;
  editora?: string;
  autores: Autor[];
}

export interface TrabalhoEmEvento {
  natureza?: string;
  titulo?: string;
  ano?: number;
  idioma?: string;
  nomeDoEvento?: string;
  cidadeDoEvento?: string;
  paisDoEvento?: string;
  paginaInicial?: string;
  paginaFinal?: string;
  autores: Autor[];
}

export interface ProducaoBibliografica {
  artigosPublicados: ArtigoPublicado[];
  livrosPublicados: LivroPublicado[];
  capitulosDeLivros: CapituloDeLivro[];
  trabalhosEmEventos: TrabalhoEmEvento[];
}

export interface CurriculoLattes {
  dadosPessoais: DadosPessoais;
  formacaoAcademica: FormacaoAcademica[];
  atuacaoProfissional: AtuacaoProfissional[];
  producaoBibliografica: ProducaoBibliografica;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

// Tags que devem sempre virar array, mesmo quando há apenas uma ocorrência
// no XML (o XSD do CNPq permite 0..N para todas elas).
const REPEATING_TAGS = new Set([
  "GRADUACAO",
  "ESPECIALIZACAO",
  "MESTRADO",
  "DOUTORADO",
  "POS-DOUTORADO",
  "LIVRE-DOCENCIA",
  "ATUACAO-PROFISSIONAL",
  "VINCULOS",
  "ARTIGO-PUBLICADO",
  "LIVRO-PUBLICADO-OU-ORGANIZADO",
  "CAPITULO-DE-LIVRO-PUBLICADO",
  "TRABALHO-EM-EVENTOS",
  "AUTORES",
]);

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  parseAttributeValue: false,
  trimValues: true,
  isArray: (tagName) => REPEATING_TAGS.has(tagName),
});

// biome-ignore lint: XML parseado é essencialmente `any` até ser normalizado abaixo
type RawNode = Record<string, any>;

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function toStr(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

/** Retorna o primeiro atributo definido entre variações de nome conhecidas. */
function pick(node: RawNode | undefined, ...keys: string[]): string | undefined {
  if (!node) return undefined;
  for (const key of keys) {
    const value = node[key];
    if (value !== undefined && value !== null && value !== "") return String(value);
  }
  return undefined;
}

/**
 * Exportações recentes do Lattes podem trazer o ORCID iD como URI completa
 * (ex: "https://orcid.org/0000-0002-1825-0097") em vez do identificador puro.
 */
function normalizeOrcidId(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.replace(/^https?:\/\/(www\.)?orcid\.org\//i, "").trim() || undefined;
}

function parseDadosPessoais(curriculoVitae: RawNode): DadosPessoais {
  const dadosGerais: RawNode = curriculoVitae["DADOS-GERAIS"] ?? {};
  const resumoCv: RawNode = dadosGerais["RESUMO-CV"] ?? {};

  return {
    identificadorLattes: pick(curriculoVitae, "NUMERO-IDENTIFICADOR"),
    orcidId: normalizeOrcidId(pick(dadosGerais, "ORCID-ID", "ORCID", "NUMERO-ORCID")),
    nomeCompleto: pick(dadosGerais, "NOME-COMPLETO") ?? pick(curriculoVitae, "NOME-COMPLETO"),
    nomeEmCitacoesBibliograficas: pick(dadosGerais, "NOME-EM-CITACOES-BIBLIOGRAFICAS"),
    nacionalidade: pick(dadosGerais, "NACIONALIDADE"),
    paisDeNascimento: pick(dadosGerais, "PAIS-DE-NASCIMENTO"),
    ufNascimento: pick(dadosGerais, "UF-NASCIMENTO"),
    cidadeDeNascimento: pick(dadosGerais, "CIDADE-NASCIMENTO"),
    resumoCv: pick(resumoCv, "TEXTO-RESUMO-CV-RH"),
    dataAtualizacao: pick(curriculoVitae, "DATA-ATUALIZACAO"),
  };
}

const NIVEIS_FORMACAO: NivelFormacao[] = [
  "GRADUACAO",
  "ESPECIALIZACAO",
  "MESTRADO",
  "DOUTORADO",
  "POS-DOUTORADO",
  "LIVRE-DOCENCIA",
];

function parseFormacaoAcademica(curriculoVitae: RawNode): FormacaoAcademica[] {
  const container: RawNode = curriculoVitae["DADOS-GERAIS"]?.["FORMACAO-ACADEMICA-TITULACAO"] ?? {};
  const formacoes: FormacaoAcademica[] = [];

  for (const nivel of NIVEIS_FORMACAO) {
    for (const item of asArray<RawNode>(container[nivel])) {
      formacoes.push({
        nivel,
        instituicao: pick(item, "NOME-INSTITUICAO"),
        curso: pick(item, "NOME-CURSO"),
        statusDoCurso: pick(item, "STATUS-DO-CURSO"),
        anoDeInicio: toNumber(pick(item, "ANO-DE-INICIO")),
        anoDeConclusao: toNumber(pick(item, "ANO-DE-CONCLUSAO")),
        tituloDoTrabalho: pick(
          item,
          "TITULO-DO-TRABALHO-DE-CONCLUSAO-DE-CURSO",
          "TITULO-DA-DISSERTACAO-TESE",
          "TITULO-DO-TRABALHO",
        ),
      });
    }
  }

  return formacoes;
}

function parseAtuacaoProfissional(curriculoVitae: RawNode): AtuacaoProfissional[] {
  const container: RawNode = curriculoVitae["DADOS-GERAIS"]?.["ATUACOES-PROFISSIONAIS"] ?? {};

  return asArray<RawNode>(container["ATUACAO-PROFISSIONAL"]).map((atuacao) => ({
    instituicao: pick(atuacao, "NOME-INSTITUICAO"),
    vinculos: asArray<RawNode>(atuacao["VINCULOS"]).map((vinculo) => ({
      tipoDeVinculo: pick(vinculo, "TIPO-DE-VINCULO"),
      outroVinculoInformado: pick(vinculo, "OUTRO-VINCULO-INFORMADO"),
      enquadramentoFuncional: pick(vinculo, "ENQUADRAMENTO-FUNCIONAL"),
      anoInicio: toNumber(pick(vinculo, "ANO-INICIO")),
      anoFim: toNumber(pick(vinculo, "ANO-FIM")),
      cargaHorariaSemanal: pick(vinculo, "CARGA-HORARIA-SEMANAL"),
    })),
  }));
}

function parseAutores(item: RawNode): Autor[] {
  return asArray<RawNode>(item["AUTORES"]).map((autor) => ({
    nomeCompleto: pick(autor, "NOME-COMPLETO-DO-AUTOR"),
    nomeParaCitacao: pick(autor, "NOME-PARA-CITACAO"),
    ordemDeAutoria: toNumber(pick(autor, "ORDEM-DE-AUTORIA")),
  }));
}

function parseArtigosPublicados(producao: RawNode): ArtigoPublicado[] {
  const container: RawNode = producao["ARTIGOS-PUBLICADOS"] ?? {};

  return asArray<RawNode>(container["ARTIGO-PUBLICADO"]).map((artigo) => {
    const basicos: RawNode = artigo["DADOS-BASICOS-DO-ARTIGO"] ?? {};
    const detalhes: RawNode = artigo["DETALHAMENTO-DO-ARTIGO"] ?? {};

    return {
      titulo: pick(basicos, "TITULO-DO-ARTIGO"),
      ano: toNumber(pick(basicos, "ANO-DO-ARTIGO")),
      idioma: pick(basicos, "IDIOMA"),
      paisDePublicacao: pick(basicos, "PAIS-DE-PUBLICACAO"),
      doi: pick(basicos, "DOI"),
      issn: pick(detalhes, "ISSN"),
      periodico: pick(detalhes, "TITULO-DO-PERIODICO-OU-REVISTA"),
      volume: pick(detalhes, "VOLUME"),
      fasciculo: pick(detalhes, "FASCICULO"),
      paginaInicial: pick(detalhes, "PAGINA-INICIAL"),
      paginaFinal: pick(detalhes, "PAGINA-FINAL"),
      autores: parseAutores(artigo),
    };
  });
}

function parseLivrosPublicados(producao: RawNode): LivroPublicado[] {
  const container: RawNode = producao["LIVROS-E-CAPITULOS"]?.["LIVROS-PUBLICADOS-OU-ORGANIZADOS"] ?? {};

  return asArray<RawNode>(container["LIVRO-PUBLICADO-OU-ORGANIZADO"]).map((livro) => {
    const basicos: RawNode = livro["DADOS-BASICOS-DO-LIVRO"] ?? {};
    const detalhes: RawNode = livro["DETALHAMENTO-DO-LIVRO"] ?? {};

    return {
      titulo: pick(basicos, "TITULO-DO-LIVRO"),
      ano: toNumber(pick(basicos, "ANO")),
      idioma: pick(basicos, "IDIOMA"),
      paisDePublicacao: pick(basicos, "PAIS-DE-PUBLICACAO"),
      isbn: pick(detalhes, "ISBN"),
      editora: pick(detalhes, "NOME-DA-EDITORA", "EDITORA"),
      numeroDePaginas: pick(detalhes, "NUMERO-DE-PAGINAS"),
      autores: parseAutores(livro),
    };
  });
}

function parseCapitulosDeLivros(producao: RawNode): CapituloDeLivro[] {
  const container: RawNode = producao["LIVROS-E-CAPITULOS"]?.["CAPITULOS-DE-LIVROS-PUBLICADOS"] ?? {};

  return asArray<RawNode>(container["CAPITULO-DE-LIVRO-PUBLICADO"]).map((capitulo) => {
    const basicos: RawNode = capitulo["DADOS-BASICOS-DO-CAPITULO"] ?? {};
    const detalhes: RawNode = capitulo["DETALHAMENTO-DO-CAPITULO"] ?? {};

    return {
      titulo: pick(basicos, "TITULO-DO-CAPITULO-DO-LIVRO"),
      ano: toNumber(pick(basicos, "ANO")),
      tituloDoLivro: pick(detalhes, "TITULO-DO-LIVRO"),
      paginaInicial: pick(detalhes, "PAGINA-INICIAL"),
      paginaFinal: pick(detalhes, "PAGINA-FINAL"),
      isbn: pick(detalhes, "ISBN"),
      editora: pick(detalhes, "NOME-DA-EDITORA", "EDITORA"),
      autores: parseAutores(capitulo),
    };
  });
}

function parseTrabalhosEmEventos(producao: RawNode): TrabalhoEmEvento[] {
  const container: RawNode = producao["TRABALHOS-EM-EVENTOS"] ?? {};

  return asArray<RawNode>(container["TRABALHO-EM-EVENTOS"]).map((trabalho) => {
    const basicos: RawNode = trabalho["DADOS-BASICOS-DO-TRABALHO"] ?? {};
    const detalhes: RawNode = trabalho["DETALHAMENTO-DO-TRABALHO"] ?? {};

    return {
      natureza: pick(basicos, "NATUREZA"),
      titulo: pick(basicos, "TITULO-DO-TRABALHO"),
      ano: toNumber(pick(basicos, "ANO-DO-TRABALHO")),
      idioma: pick(basicos, "IDIOMA"),
      paisDoEvento: pick(basicos, "PAIS-DO-EVENTO"),
      nomeDoEvento: pick(detalhes, "NOME-DO-EVENTO"),
      cidadeDoEvento: pick(detalhes, "CIDADE-DO-EVENTO"),
      paginaInicial: pick(detalhes, "PAGINA-INICIAL"),
      paginaFinal: pick(detalhes, "PAGINA-FINAL"),
      autores: parseAutores(trabalho),
    };
  });
}

function parseProducaoBibliografica(curriculoVitae: RawNode): ProducaoBibliografica {
  const producao: RawNode = curriculoVitae["PRODUCAO-BIBLIOGRAFICA"] ?? {};

  return {
    artigosPublicados: parseArtigosPublicados(producao),
    livrosPublicados: parseLivrosPublicados(producao),
    capitulosDeLivros: parseCapitulosDeLivros(producao),
    trabalhosEmEventos: parseTrabalhosEmEventos(producao),
  };
}

/**
 * Recebe o XML do Currículo Lattes (exportado manualmente pelo usuário na
 * plataforma do CNPq) e retorna um objeto tipado com os dados extraídos.
 */
export function parseLattesXML(xml: string): CurriculoLattes {
  const parsed = xmlParser.parse(xml);
  const curriculoVitae: RawNode = parsed["CURRICULO-VITAE"];

  if (!curriculoVitae) {
    throw new Error("XML inválido: elemento raiz <CURRICULO-VITAE> não encontrado.");
  }

  return {
    dadosPessoais: parseDadosPessoais(curriculoVitae),
    formacaoAcademica: parseFormacaoAcademica(curriculoVitae),
    atuacaoProfissional: parseAtuacaoProfissional(curriculoVitae),
    producaoBibliografica: parseProducaoBibliografica(curriculoVitae),
  };
}
