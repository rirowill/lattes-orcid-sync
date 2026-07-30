"use client";

import { useState } from "react";
import type { CurriculoLattes } from "@/lib/lattes-parser";
import { isValidOrcidId } from "@/lib/lattes-format";
import { compararProducao, type ItemComparado, type ResultadoComparacao } from "@/lib/orcid-lattes-compare";
import PixModal from "@/components/PixModal";

export default function UploadLattesXML() {
  const [curriculo, setCurriculo] = useState<CurriculoLattes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setLoading(true);
    setError(null);
    setCurriculo(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/lattes/parse", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao processar o arquivo.");
      }

      setCurriculo(data.curriculo as CurriculoLattes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao processar o arquivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-black dark:text-zinc-50">
          Importar Currículo Lattes
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Exporte o XML do seu Currículo Lattes na plataforma do CNPq e envie o
          arquivo abaixo.
        </p>
        <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]">
          Selecionar arquivo XML
          <input
            type="file"
            accept=".xml"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {loading && <p className="text-sm text-zinc-600 dark:text-zinc-400">Processando…</p>}

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {curriculo && <CurriculoPreview curriculo={curriculo} />}
    </div>
  );
}

function CurriculoPreview({ curriculo }: { curriculo: CurriculoLattes }) {
  const { dadosPessoais, formacaoAcademica, atuacaoProfissional, producaoBibliografica } = curriculo;
  const [orcidId, setOrcidId] = useState(dadosPessoais.orcidId ?? "");
  const orcidDetectedFromXml = Boolean(dadosPessoais.orcidId);

  return (
    <div className="flex flex-col gap-8">
      <ExportButtons curriculo={curriculo} orcidId={orcidId} />

      <OrcidPanel
        curriculo={curriculo}
        orcidId={orcidId}
        onOrcidIdChange={setOrcidId}
        detectedFromXml={orcidDetectedFromXml}
      />

      <Section title="Dados pessoais">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Field label="Nome completo" value={dadosPessoais.nomeCompleto} />
          <Field label="Nome em citações" value={dadosPessoais.nomeEmCitacoesBibliograficas} />
          <Field label="Nacionalidade" value={dadosPessoais.nacionalidade} />
          <Field label="Naturalidade" value={[dadosPessoais.cidadeDeNascimento, dadosPessoais.ufNascimento].filter(Boolean).join(" - ")} />
          <Field label="ID Lattes" value={dadosPessoais.identificadorLattes} />
          <Field label="ORCID iD" value={dadosPessoais.orcidId} />
          <Field label="Última atualização" value={dadosPessoais.dataAtualizacao} />
        </dl>
        {dadosPessoais.resumoCv && (
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{dadosPessoais.resumoCv}</p>
        )}
      </Section>

      <Section title={`Formação acadêmica (${formacaoAcademica.length})`}>
        {formacaoAcademica.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {formacaoAcademica.map((formacao, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-medium text-black dark:text-zinc-50">
                  {formacao.nivel} — {formacao.curso}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {formacao.instituicao} ({formacao.anoDeInicio ?? "?"}–{formacao.anoDeConclusao ?? "atual"})
                </p>
                {formacao.tituloDoTrabalho && (
                  <p className="mt-1 text-zinc-500 dark:text-zinc-500">{formacao.tituloDoTrabalho}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Atuação profissional (${atuacaoProfissional.length})`}>
        {atuacaoProfissional.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
            {atuacaoProfissional.map((atuacao, i) => (
              <li key={i} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
                <p className="font-medium text-black dark:text-zinc-50">{atuacao.instituicao}</p>
                {atuacao.vinculos.map((vinculo, j) => (
                  <p key={j} className="text-zinc-600 dark:text-zinc-400">
                    {vinculo.enquadramentoFuncional ?? vinculo.tipoDeVinculo} ({vinculo.anoInicio ?? "?"}–{vinculo.anoFim ?? "atual"})
                  </p>
                ))}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Produção bibliográfica">
        <ProducaoList
          title={`Artigos publicados (${producaoBibliografica.artigosPublicados.length})`}
          items={producaoBibliografica.artigosPublicados.map((a) => ({
            titulo: a.titulo,
            ano: a.ano,
            detalhe: a.periodico,
          }))}
        />
        <ProducaoList
          title={`Livros publicados (${producaoBibliografica.livrosPublicados.length})`}
          items={producaoBibliografica.livrosPublicados.map((l) => ({
            titulo: l.titulo,
            ano: l.ano,
            detalhe: l.editora,
          }))}
        />
        <ProducaoList
          title={`Capítulos de livros (${producaoBibliografica.capitulosDeLivros.length})`}
          items={producaoBibliografica.capitulosDeLivros.map((c) => ({
            titulo: c.titulo,
            ano: c.ano,
            detalhe: c.tituloDoLivro,
          }))}
        />
        <ProducaoList
          title={`Trabalhos em eventos (${producaoBibliografica.trabalhosEmEventos.length})`}
          items={producaoBibliografica.trabalhosEmEventos.map((t) => ({
            titulo: t.titulo,
            ano: t.ano,
            detalhe: t.nomeDoEvento,
          }))}
        />
      </Section>
    </div>
  );
}

type ExportFormat = "pdf" | "docx" | "bib";

const EXPORT_ROUTES: Record<ExportFormat, string> = {
  pdf: "/api/lattes/export/pdf",
  docx: "/api/lattes/export/docx",
  bib: "/api/lattes/export-bib",
};

const EXPORT_LABELS: Record<ExportFormat, { idle: string; loading: string }> = {
  pdf: { idle: "Exportar PDF", loading: "Gerando PDF…" },
  docx: { idle: "Exportar DOCX", loading: "Gerando DOCX…" },
  bib: { idle: "Baixar .bib", loading: "Gerando .bib…" },
};

function ExportButtons({ curriculo, orcidId }: { curriculo: CurriculoLattes; orcidId?: string }) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [pixModalOpen, setPixModalOpen] = useState(false);

  async function handleExport(format: ExportFormat) {
    setExporting(format);
    setExportError(null);

    try {
      const response = await fetch(EXPORT_ROUTES[format], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculo, orcidId: isValidOrcidId(orcidId ?? "") ? orcidId : undefined }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? `Falha ao gerar o arquivo (${format}).`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] ?? `curriculo-lattes.${format}`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      if (format === "pdf" || format === "bib") {
        setPixModalOpen(true);
      }
    } catch (err) {
      setExportError(err instanceof Error ? err.message : `Falha ao gerar o arquivo (${format}).`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        {(Object.keys(EXPORT_ROUTES) as ExportFormat[]).map((format) => (
          <button
            key={format}
            type="button"
            onClick={() => handleExport(format)}
            disabled={exporting !== null}
            className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            {exporting === format ? EXPORT_LABELS[format].loading : EXPORT_LABELS[format].idle}
          </button>
        ))}
      </div>
      {exportError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {exportError}
        </p>
      )}
      <PixModal open={pixModalOpen} onClose={() => setPixModalOpen(false)} />
    </div>
  );
}

function OrcidPanel({
  curriculo,
  orcidId,
  onOrcidIdChange,
  detectedFromXml,
}: {
  curriculo: CurriculoLattes;
  orcidId: string;
  onOrcidIdChange: (value: string) => void;
  detectedFromXml: boolean;
}) {
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoComparacao | null>(null);

  const trimmedOrcidId = orcidId.trim();
  const orcidIdValido = isValidOrcidId(trimmedOrcidId);

  async function handleCompare() {
    setComparing(true);
    setCompareError(null);
    setResultado(null);

    try {
      const response = await fetch(`/api/orcid/works?orcidId=${encodeURIComponent(trimmedOrcidId)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao consultar o ORCID.");
      }

      setResultado(compararProducao(curriculo, data.works));
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : "Falha ao consultar o ORCID.");
    } finally {
      setComparing(false);
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50">ORCID</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="orcid-id" className="text-sm text-zinc-600 dark:text-zinc-400">
          ORCID iD
          {detectedFromXml && <span className="ml-1 text-zinc-400">(detectado no XML do Lattes)</span>}
        </label>
        <div className="flex flex-wrap gap-2">
          <input
            id="orcid-id"
            type="text"
            value={orcidId}
            onChange={(event) => onOrcidIdChange(event.target.value)}
            placeholder="0000-0000-0000-0000"
            className="w-56 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={handleCompare}
            disabled={comparing || !orcidIdValido}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            {comparing ? "Comparando…" : "Comparar com ORCID"}
          </button>
        </div>
        {trimmedOrcidId.length > 0 && !orcidIdValido && (
          <p className="text-xs text-red-600 dark:text-red-400">Formato esperado: 0000-0000-0000-0000</p>
        )}
      </div>

      {compareError && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {compareError}
        </p>
      )}

      {resultado && <ComparacaoDashboard resultado={resultado} />}
    </section>
  );
}

function ComparacaoDashboard({ resultado }: { resultado: ResultadoComparacao }) {
  const { resumo, itens } = resultado;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <StatPill label="Sincronizadas" value={resumo.sincronizado} tone="green" />
        <StatPill label="Só no Lattes" value={resumo.apenasLattes} tone="amber" />
        <StatPill label="Só no ORCID" value={resumo.apenasOrcid} tone="blue" />
      </div>

      {itens.length > 0 && (
        <ul className="flex flex-col gap-2">
          {itens.map((item, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800"
            >
              <div>
                <p className="font-medium text-black dark:text-zinc-50">{item.titulo}</p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {item.ano ?? "—"}
                  {item.doi ? ` · DOI: ${item.doi}` : ""}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const TONE_CLASSES = {
  green: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
} as const;

function StatPill({ label, value, tone }: { label: string; value: number; tone: keyof typeof TONE_CLASSES }) {
  return (
    <div className={`flex flex-1 flex-col items-center rounded-lg px-4 py-3 ${TONE_CLASSES[tone]}`}>
      <span className="text-2xl font-semibold">{value}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

const STATUS_LABELS: Record<ItemComparado["status"], { text: string; tone: keyof typeof TONE_CLASSES }> = {
  sincronizado: { text: "Sincronizado", tone: "green" },
  apenas_lattes: { text: "Só no Lattes", tone: "amber" },
  apenas_orcid: { text: "Só no ORCID", tone: "blue" },
};

function StatusBadge({ status }: { status: ItemComparado["status"] }) {
  const { text, tone } = STATUS_LABELS[status];
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}>{text}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <h2 className="text-lg font-semibold text-black dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-zinc-500 dark:text-zinc-500">{label}</dt>
      <dd className="text-black dark:text-zinc-50">{value}</dd>
    </div>
  );
}

function EmptyState() {
  return <p className="text-sm text-zinc-500 dark:text-zinc-500">Nenhum item encontrado.</p>;
}

function ProducaoList({
  title,
  items,
}: {
  title: string;
  items: { titulo?: string; ano?: number; detalhe?: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</h3>
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
              <p className="font-medium text-black dark:text-zinc-50">{item.titulo}</p>
              <p className="text-zinc-600 dark:text-zinc-400">
                {item.ano ? `${item.ano} — ` : ""}
                {item.detalhe}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
