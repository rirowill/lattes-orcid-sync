import { Document, ExternalHyperlink, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import type { Autor, AtuacaoProfissional, CurriculoLattes, FormacaoAcademica } from "./lattes-parser";

const COLOR_MUTED = "6B7280";
const COLOR_EMPTY = "9CA3AF";

function autoresLine(autores: Autor[]): string {
  return autores
    .slice()
    .sort((a, b) => (a.ordemDeAutoria ?? 0) - (b.ordemDeAutoria ?? 0))
    .map((autor) => autor.nomeParaCitacao ?? autor.nomeCompleto)
    .filter(Boolean)
    .join("; ");
}

function heading1(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.TITLE, spacing: { after: 100 } });
}

function heading2(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 120 } });
}

function heading3(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 80 } });
}

function mutedParagraph(text: string, spacingAfter = 60): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, color: COLOR_MUTED })],
    spacing: { after: spacingAfter },
  });
}

function emptyStateParagraph(): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: "Nenhum item encontrado.", italics: true, color: COLOR_EMPTY })],
    spacing: { after: 100 },
  });
}

function orcidParagraph(orcidId: string): Paragraph {
  const url = `https://orcid.org/${orcidId}`;
  return new Paragraph({
    children: [
      new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text: url, style: "Hyperlink" })],
      }),
    ],
    spacing: { after: 100 },
  });
}

function formacaoParagraphs(formacao: FormacaoAcademica): Paragraph[] {
  const paragraphs = [
    new Paragraph({
      children: [new TextRun({ text: `${formacao.nivel} — ${formacao.curso ?? "—"}`, bold: true })],
      spacing: { after: 20 },
    }),
    mutedParagraph(
      `${formacao.instituicao ?? "—"} (${formacao.anoDeInicio ?? "?"}–${formacao.anoDeConclusao ?? "atual"})`,
    ),
  ];
  if (formacao.tituloDoTrabalho) {
    paragraphs.push(mutedParagraph(formacao.tituloDoTrabalho));
  }
  return paragraphs;
}

function atuacaoParagraphs(atuacao: AtuacaoProfissional): Paragraph[] {
  const paragraphs = [
    new Paragraph({
      children: [new TextRun({ text: atuacao.instituicao ?? "—", bold: true })],
      spacing: { after: 20 },
    }),
  ];
  for (const vinculo of atuacao.vinculos) {
    paragraphs.push(
      mutedParagraph(
        `${vinculo.enquadramentoFuncional ?? vinculo.tipoDeVinculo ?? "—"} (${vinculo.anoInicio ?? "?"}–${vinculo.anoFim ?? "atual"})`,
      ),
    );
  }
  return paragraphs;
}

function producaoSection(
  title: string,
  items: { titulo?: string; ano?: number; detalhe?: string; autores: Autor[] }[],
): Paragraph[] {
  const paragraphs = [heading3(`${title} (${items.length})`)];

  if (items.length === 0) {
    paragraphs.push(emptyStateParagraph());
    return paragraphs;
  }

  for (const item of items) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: item.titulo ?? "—", bold: true })],
        spacing: { after: 20 },
      }),
    );
    paragraphs.push(mutedParagraph([item.ano, item.detalhe].filter(Boolean).join(" — ")));
    if (item.autores.length > 0) {
      paragraphs.push(mutedParagraph(autoresLine(item.autores)));
    }
  }

  return paragraphs;
}

export async function generateLattesDocx(curriculo: CurriculoLattes, orcidId?: string): Promise<Buffer> {
  const { dadosPessoais, formacaoAcademica, atuacaoProfissional, producaoBibliografica } = curriculo;

  const subtitleParts = [
    dadosPessoais.nacionalidade && `Nacionalidade: ${dadosPessoais.nacionalidade}`,
    (dadosPessoais.cidadeDeNascimento || dadosPessoais.ufNascimento) &&
      `Naturalidade: ${[dadosPessoais.cidadeDeNascimento, dadosPessoais.ufNascimento].filter(Boolean).join(" - ")}`,
    dadosPessoais.identificadorLattes && `ID Lattes: ${dadosPessoais.identificadorLattes}`,
  ].filter(Boolean);

  const children: Paragraph[] = [heading1(dadosPessoais.nomeCompleto ?? "Currículo")];

  if (orcidId) {
    children.push(orcidParagraph(orcidId));
  }
  if (subtitleParts.length > 0) {
    children.push(mutedParagraph(subtitleParts.join(" · ")));
  }
  if (dadosPessoais.resumoCv) {
    children.push(new Paragraph({ children: [new TextRun(dadosPessoais.resumoCv)], spacing: { after: 100 } }));
  }

  children.push(heading2("Formação acadêmica"));
  if (formacaoAcademica.length === 0) {
    children.push(emptyStateParagraph());
  } else {
    for (const formacao of formacaoAcademica) {
      children.push(...formacaoParagraphs(formacao));
    }
  }

  children.push(heading2("Atuação profissional"));
  if (atuacaoProfissional.length === 0) {
    children.push(emptyStateParagraph());
  } else {
    for (const atuacao of atuacaoProfissional) {
      children.push(...atuacaoParagraphs(atuacao));
    }
  }

  children.push(heading2("Produção bibliográfica"));
  children.push(
    ...producaoSection(
      "Artigos publicados",
      producaoBibliografica.artigosPublicados.map((a) => ({
        titulo: a.titulo,
        ano: a.ano,
        detalhe: a.periodico,
        autores: a.autores,
      })),
    ),
    ...producaoSection(
      "Livros publicados",
      producaoBibliografica.livrosPublicados.map((l) => ({
        titulo: l.titulo,
        ano: l.ano,
        detalhe: l.editora,
        autores: l.autores,
      })),
    ),
    ...producaoSection(
      "Capítulos de livros",
      producaoBibliografica.capitulosDeLivros.map((c) => ({
        titulo: c.titulo,
        ano: c.ano,
        detalhe: c.tituloDoLivro,
        autores: c.autores,
      })),
    ),
    ...producaoSection(
      "Trabalhos em eventos",
      producaoBibliografica.trabalhosEmEventos.map((t) => ({
        titulo: t.titulo,
        ano: t.ano,
        detalhe: t.nomeDoEvento,
        autores: t.autores,
      })),
    ),
  );

  const doc = new Document({
    title: `Currículo - ${dadosPessoais.nomeCompleto ?? ""}`,
    styles: {
      characterStyles: [
        {
          id: "Hyperlink",
          name: "Hyperlink",
          basedOn: "DefaultParagraphFont",
          run: { color: "0563C1", underline: { type: "single" } },
        },
      ],
    },
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}
