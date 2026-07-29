// Utilitários de higienização e formatação de texto para dados extraídos
// do XML do Currículo Lattes, usados na geração dos documentos exportados.

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&nbsp;": " ",
};

// Pontuação Unicode "curva" (aspas tipográficas, travessões, reticências)
// que fontes PDF padrão (Helvetica/WinAnsi) não conseguem desenhar e acabam
// renderizando como "?". Trocamos por equivalentes ASCII seguros.
const CHAR_FIXES: Record<string, string> = {
  "‘": "'", // '
  "’": "'", // '
  "‚": "'", // ‚
  "“": '"', // "
  "”": '"', // "
  "„": '"', // „
  "–": "-", // –
  "—": "-", // —
  "…": "...", // …
  " ": " ", // nbsp
};

/**
 * Limpa texto livre vindo do XML do Lattes: decodifica entidades HTML
 * residuais, troca pontuação Unicode por equivalentes ASCII (evitando o
 * glifo "?" em fontes PDF sem suporte a esses caracteres) e colapsa
 * quebras de linha e espaços redundantes em um único espaço.
 */
export function cleanLattesText(text: string | undefined): string | undefined {
  if (!text) return text;

  let result = text;

  // O fast-xml-parser não decodifica referências numéricas de caractere em
  // valores de atributo (ex: "&#8220;" ou "&#x201c;" para aspas curvas),
  // então isso é feito aqui antes das demais substituições.
  result = result
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)));

  for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
    result = result.split(entity).join(replacement);
  }
  for (const [char, replacement] of Object.entries(CHAR_FIXES)) {
    result = result.split(char).join(replacement);
  }

  return result
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// Rótulos de vínculo que são apenas códigos internos do CNPq e não devem
// ser exibidos crus para o usuário (ex: "LIVRE" para vínculo não formalizado).
const GENERIC_VINCULO_LABELS = new Set(["LIVRE", "OUTRO", "NAO INFORMADO", "N/A", "-", ""]);

function normalizeForComparison(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toUpperCase();
}

interface VinculoLike {
  enquadramentoFuncional?: string;
  outroVinculoInformado?: string;
  tipoDeVinculo?: string;
}

/**
 * Retorna um rótulo legível para o cargo/enquadramento do vínculo, ou
 * `undefined` quando só há disponível um código genérico do Lattes
 * (ex: "LIVRE") que não tem valor informativo para o usuário.
 */
export function formatVinculoLabel(vinculo: VinculoLike): string | undefined {
  const candidates = [vinculo.enquadramentoFuncional, vinculo.outroVinculoInformado, vinculo.tipoDeVinculo];

  for (const candidate of candidates) {
    const cleaned = cleanLattesText(candidate);
    if (cleaned && !GENERIC_VINCULO_LABELS.has(normalizeForComparison(cleaned))) {
      return cleaned;
    }
  }

  return undefined;
}

/** Formata um período ano-início/ano-fim, usando `emAndamento` quando não há fim. */
export function formatPeriodo(anoInicio?: number, anoFim?: number, emAndamento = "atual"): string {
  return `${anoInicio ?? "?"}–${anoFim ?? emAndamento}`;
}

const ORCID_ID_REGEX = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;

/** Valida o formato de um ORCID iD (ex: "0000-0002-1825-0097"). */
export function isValidOrcidId(value: string): boolean {
  return ORCID_ID_REGEX.test(value.trim());
}
