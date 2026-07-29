import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Path,
  G,
  Polygon,
  Link,
  renderToBuffer,
} from "@react-pdf/renderer";
import type {
  Autor,
  AtuacaoProfissional,
  CurriculoLattes,
  FormacaoAcademica,
} from "./lattes-parser";
import { cleanLattesText, formatVinculoLabel, formatPeriodo } from "./lattes-format";

// Evita que a fonte padrão (Helvetica) hifenize palavras no meio ao
// quebrar linha — sem isso o react-pdf corta palavras longas de forma
// abrupta ao invés de simplesmente empurrá-las para a próxima linha.
Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, color: "#111827" },
  h1: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 10, color: "#4b5563", marginBottom: 10 },
  resumo: { fontSize: 9.5, lineHeight: 1.25, marginTop: 4, marginBottom: 2 },
  h2: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 16,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    borderBottomStyle: "solid",
  },
  h3: { fontSize: 10.5, fontWeight: 700, marginTop: 10, marginBottom: 4 },
  item: { marginBottom: 7 },
  itemTitle: { fontWeight: 700 },
  itemMeta: { color: "#4b5563", marginTop: 1 },
  emptyState: { color: "#9ca3af" },
  orcidRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  orcidIcon: { marginRight: 4 },
  orcidLink: { fontSize: 9, color: "#111827", textDecoration: "none" },
});

// Ícone oficial do ORCID iD (círculo verde #A6CE39 com o glifo "iD" em
// branco), reproduzido a partir da arte vetorial publicada pela ORCID.
// Não altere as cores nem as proporções — segue as diretrizes de marca.
function OrcidIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 72 72" width={size} height={size}>
      <Path
        d="M72,36 C72,55.884375 55.884375,72 36,72 C16.115625,72 0,55.884375 0,36 C0,16.115625 16.115625,0 36,0 C55.884375,0 72,16.115625 72,36 Z"
        fill="#A6CE39"
      />
      <G transform="translate(18.868966, 12.910345)" fill="#FFFFFF">
        <Polygon points="5.03734929 39.1250878 0.695429861 39.1250878 0.695429861 9.14431787 5.03734929 9.14431787 5.03734929 22.6930505 5.03734929 39.1250878" />
        <Path d="M11.409257,9.14431787 L23.1380784,9.14431787 C34.303014,9.14431787 39.2088191,17.0664074 39.2088191,24.1486995 C39.2088191,31.846843 33.1470485,39.1530811 23.1944669,39.1530811 L11.409257,39.1530811 L11.409257,9.14431787 Z M15.7511765,35.2620194 L22.6587756,35.2620194 C32.49858,35.2620194 34.7541226,27.8438084 34.7541226,24.1486995 C34.7541226,18.1301509 30.8915059,13.0353795 22.4332213,13.0353795 L15.7511765,13.0353795 L15.7511765,35.2620194 Z" />
        <Path d="M5.71401206,2.90182329 C5.71401206,4.441452 4.44526937,5.72914146 2.86638958,5.72914146 C1.28750978,5.72914146 0.0187670918,4.441452 0.0187670918,2.90182329 C0.0187670918,1.33420133 1.28750978,0.0745051096 2.86638958,0.0745051096 C4.44526937,0.0745051096 5.71401206,1.36219458 5.71401206,2.90182329 Z" />
      </G>
    </Svg>
  );
}

function OrcidBadge({ orcidId }: { orcidId: string }) {
  const url = `https://orcid.org/${orcidId}`;
  return (
    <View style={styles.orcidRow}>
      <View style={styles.orcidIcon}>
        <OrcidIcon />
      </View>
      <Link src={url} style={styles.orcidLink}>
        {url}
      </Link>
    </View>
  );
}

function autoresLine(autores: Autor[]): string {
  return autores
    .slice()
    .sort((a, b) => (a.ordemDeAutoria ?? 0) - (b.ordemDeAutoria ?? 0))
    .map((autor) => cleanLattesText(autor.nomeParaCitacao ?? autor.nomeCompleto))
    .filter(Boolean)
    .join("; ");
}

function FormacaoItem({ formacao }: { formacao: FormacaoAcademica }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>
        {formacao.nivel} — {cleanLattesText(formacao.curso) ?? "—"}
      </Text>
      <Text style={styles.itemMeta}>
        {cleanLattesText(formacao.instituicao)} ({formatPeriodo(formacao.anoDeInicio, formacao.anoDeConclusao)})
      </Text>
      {formacao.tituloDoTrabalho && <Text style={styles.itemMeta}>{cleanLattesText(formacao.tituloDoTrabalho)}</Text>}
    </View>
  );
}

function AtuacaoItem({ atuacao }: { atuacao: AtuacaoProfissional }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemTitle}>{cleanLattesText(atuacao.instituicao) ?? "—"}</Text>
      {atuacao.vinculos.map((vinculo, i) => {
        const label = formatVinculoLabel(vinculo);
        const periodo = formatPeriodo(vinculo.anoInicio, vinculo.anoFim);
        return (
          <Text key={i} style={styles.itemMeta}>
            {label ? `${label} (${periodo})` : periodo}
          </Text>
        );
      })}
    </View>
  );
}

function ProducaoSection({
  title,
  items,
}: {
  title: string;
  items: { titulo?: string; ano?: number; detalhe?: string; autores: Autor[] }[];
}) {
  return (
    <View>
      <Text style={styles.h3}>
        {title} ({items.length})
      </Text>
      {items.length === 0 ? (
        <Text style={styles.emptyState}>Nenhum item encontrado.</Text>
      ) : (
        items.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={styles.itemTitle}>{cleanLattesText(item.titulo) ?? "—"}</Text>
            <Text style={styles.itemMeta}>
              {[item.ano, cleanLattesText(item.detalhe)].filter(Boolean).join(" — ")}
            </Text>
            {item.autores.length > 0 && <Text style={styles.itemMeta}>{autoresLine(item.autores)}</Text>}
          </View>
        ))
      )}
    </View>
  );
}

function CurriculoDocument({ curriculo, orcidId }: { curriculo: CurriculoLattes; orcidId?: string }) {
  const { dadosPessoais, formacaoAcademica, atuacaoProfissional, producaoBibliografica } = curriculo;

  const subtitleParts = [
    dadosPessoais.nacionalidade && `Nacionalidade: ${dadosPessoais.nacionalidade}`,
    (dadosPessoais.cidadeDeNascimento || dadosPessoais.ufNascimento) &&
      `Naturalidade: ${[dadosPessoais.cidadeDeNascimento, dadosPessoais.ufNascimento].filter(Boolean).join(" - ")}`,
    dadosPessoais.identificadorLattes && `ID Lattes: ${dadosPessoais.identificadorLattes}`,
  ].filter(Boolean);

  const resumo = cleanLattesText(dadosPessoais.resumoCv);

  return (
    <Document title={`Currículo - ${dadosPessoais.nomeCompleto ?? ""}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>{cleanLattesText(dadosPessoais.nomeCompleto) ?? "Currículo"}</Text>
        {orcidId && <OrcidBadge orcidId={orcidId} />}
        {subtitleParts.length > 0 && <Text style={styles.subtitle}>{subtitleParts.join(" · ")}</Text>}
        {resumo && <Text style={styles.resumo}>{resumo}</Text>}

        <Text style={styles.h2}>Formação acadêmica</Text>
        {formacaoAcademica.length === 0 ? (
          <Text style={styles.emptyState}>Nenhum item encontrado.</Text>
        ) : (
          formacaoAcademica.map((formacao, i) => <FormacaoItem key={i} formacao={formacao} />)
        )}

        <Text style={styles.h2}>Atuação profissional</Text>
        {atuacaoProfissional.length === 0 ? (
          <Text style={styles.emptyState}>Nenhum item encontrado.</Text>
        ) : (
          atuacaoProfissional.map((atuacao, i) => <AtuacaoItem key={i} atuacao={atuacao} />)
        )}

        <Text style={styles.h2}>Produção bibliográfica</Text>
        <ProducaoSection
          title="Artigos publicados"
          items={producaoBibliografica.artigosPublicados.map((a) => ({
            titulo: a.titulo,
            ano: a.ano,
            detalhe: a.periodico,
            autores: a.autores,
          }))}
        />
        <ProducaoSection
          title="Livros publicados"
          items={producaoBibliografica.livrosPublicados.map((l) => ({
            titulo: l.titulo,
            ano: l.ano,
            detalhe: l.editora,
            autores: l.autores,
          }))}
        />
        <ProducaoSection
          title="Capítulos de livros"
          items={producaoBibliografica.capitulosDeLivros.map((c) => ({
            titulo: c.titulo,
            ano: c.ano,
            detalhe: c.tituloDoLivro,
            autores: c.autores,
          }))}
        />
        <ProducaoSection
          title="Trabalhos em eventos"
          items={producaoBibliografica.trabalhosEmEventos.map((t) => ({
            titulo: t.titulo,
            ano: t.ano,
            detalhe: t.nomeDoEvento,
            autores: t.autores,
          }))}
        />
      </Page>
    </Document>
  );
}

export async function generateLattesPdf(curriculo: CurriculoLattes, orcidId?: string): Promise<Buffer> {
  return renderToBuffer(<CurriculoDocument curriculo={curriculo} orcidId={orcidId} />);
}
