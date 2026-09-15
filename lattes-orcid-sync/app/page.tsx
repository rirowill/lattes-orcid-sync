import Link from "next/link";
import type { ReactNode } from "react";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lattes2ORCID",
  url: "https://lattes-orcid-sync.vercel.app",
  description:
    "Suba o XML do seu Currículo Lattes e receba um currículo formatado para editais e um arquivo pronto para importar no ORCID.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
};

const FEATURES = [
  {
    title: "Upload do XML",
    description: "Zero risco: você nunca faz login em nada além do próprio Lattes",
  },
  {
    title: "Currículo formatado",
    description: "Pronto para o edital de amanhã, não daqui a 3 dias",
  },
  {
    title: "Exportar .bib",
    description: "Suas publicações no ORCID em um clique, sem erro de digitação",
  },
];

const STEPS = [
  {
    number: "1",
    title: "Exporte o XML do seu Currículo Lattes",
    description: "Use a função nativa de exportação da plataforma do CNPq.",
  },
  {
    number: "2",
    title: "Suba o arquivo na ferramenta",
    description: "Nós lemos os dados e mostramos tudo formatado na tela.",
  },
  {
    number: "3",
    title: "Baixe o PDF e o .bib — prontos para usar no edital ou no ORCID",
    description: "Currículo formatado para editais e produção pronta para o ORCID.",
  },
];

const LINK_STEPS = [
  {
    icon: "pdf",
    title: "Currículo Lattes resumido em PDF",
    description:
      "Gere, a partir do mesmo XML do Lattes, um currículo resumido e já formatado para o edital — sem editar nada manualmente.",
  },
  {
    icon: "bib",
    title: "Publicações convertidas para .bib",
    description:
      "Toda a sua produção bibliográfica sai pronta em formato .bib, para importar no ORCID de uma vez, sem cadastrar publicação por publicação.",
  },
  {
    icon: "link",
    title: "ORCID vinculado ao Lattes",
    description:
      "Insira seu ORCID iD em Dados Gerais > Identificação > Outras Bases Bibliográficas no Lattes — o vínculo fica salvo permanentemente, e você usa os arquivos gerados aqui sempre que atualizar sua produção.",
  },
];

const LINK_STEP_ICONS: Record<string, ReactNode> = {
  pdf: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 14h6M9 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  bib: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M8 4 4 8l4 4M16 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M10 14a4 4 0 0 0 5.66 0l2.34-2.34a4 4 0 1 0-5.66-5.66L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 10a4 4 0 0 0-5.66 0L6 12.34a4 4 0 1 0 5.66 5.66L13 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const BENEFITS = [
  {
    title: "Economia de tempo",
    description: "O que levaria horas digitando publicação por publicação no ORCID sai pronto em minutos.",
  },
  {
    title: "Segurança de dados",
    description: "Seu XML é processado só na hora de gerar os arquivos e descartado logo em seguida — nunca fica salvo.",
  },
  {
    title: "Compatibilidade internacional",
    description: "O ORCID é o identificador de pesquisador reconhecido internacionalmente — o arquivo .bib gerado segue o padrão aceito por ele.",
  },
  {
    title: "Gratuito para sempre",
    description: "Sem plano pago, sem cartão de crédito: suba o XML e baixe seus arquivos.",
  },
];

const FAQS = [
  {
    question: "Como integrar currículo Lattes e ORCID?",
    answer:
      "O CNPq não oferece sincronização automática entre as duas plataformas, então 'integrar' Lattes e ORCID envolve dois passos: (1) inserir seu ORCID iD no próprio Currículo Lattes, em Dados Gerais > Identificação > Outras Bases Bibliográficas, para associar as duas identidades; e (2) levar sua produção bibliográfica de um lado para o outro sem redigitar tudo, um por um. É nesse segundo passo que esta ferramenta ajuda: você exporta o XML do Lattes e recebe um arquivo .bib pronto para importar direto no ORCID.",
  },
  {
    question: "Como vincular Lattes e ORCID permanentemente?",
    answer:
      "O vínculo é feito uma vez e fica salvo no seu Currículo Lattes: acesse Dados Gerais > Identificação > Outras Bases Bibliográficas, informe o número do seu ORCID, clique em 'Validar ID', confirme e publique o currículo — o link passa a aparecer automaticamente na página pública do seu Lattes. Isso associa as duas identidades permanentemente, mas não sincroniza dados: cada nova publicação ainda precisa ser adicionada nas duas plataformas (ou convertida com uma ferramenta como esta, para não digitar tudo de novo no ORCID).",
  },
  {
    question: "Posso gerar um currículo Lattes resumido?",
    answer:
      "Sim. A emissão padrão da Plataforma Lattes gera o currículo no formato completo da plataforma. Se você precisa de uma versão mais enxuta, já formatada para um edital específico, sem editar nada manualmente, suba o mesmo XML que exportou do Lattes aqui e devolvemos um PDF pronto para anexar.",
  },
  {
    question: "Meus dados ficam seguros?",
    answer:
      "Processamos seu XML apenas para gerar os arquivos — não fazemos login em nenhuma conta sua.",
  },
  {
    question: "Preciso mudar como atualizo meu Lattes?",
    answer:
      "Não. Continue do seu jeito. A ferramenta só traduz o que você já tem para outros formatos.",
  },
];

const FAQ_STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_STRUCTURED_DATA) }}
      />
      <main className="flex flex-1 flex-col items-center">
        <section className="flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:px-16">
          <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            Feito para pesquisadores brasileiros
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl dark:text-zinc-50">
            Pare de digitar seu currículo duas vezes
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Você já preencheu tudo no Lattes. Por que preencher de novo no
            ORCID, um por um? Suba o XML e receba currículo formatado +
            arquivo pronto para importar — em menos de 1 minuto.
          </p>
          <Link
            href="/upload"
            className="mt-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Testar agora, é grátis
          </Link>
        </section>

        <section className="w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-6 py-20 sm:grid-cols-2 sm:px-16">
            <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-500">Antes</h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                30 publicações? São 30 formulários, um por um, com nome de
                revista, ano, coautores... horas perdidas.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-black bg-black p-6 dark:border-zinc-50 dark:bg-zinc-50">
              <h2 className="text-sm font-medium text-zinc-400 dark:text-zinc-600">Depois</h2>
              <p className="text-base font-medium text-white dark:text-black">
                Um upload. Um clique no ORCID. Pronto.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-8 px-6 py-20 sm:grid-cols-3 sm:px-16">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-black dark:text-zinc-50">{feature.title}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-20 sm:px-16">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Como funciona</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-zinc-400 dark:text-zinc-600">{step.number}</span>
                  <h3 className="text-base font-semibold text-black dark:text-zinc-50">{step.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-20 sm:px-16">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Como vincular Lattes e ORCID em 3 passos
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {LINK_STEPS.map((step) => (
                <div
                  key={step.title}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {LINK_STEP_ICONS[step.icon]}
                  </div>
                  <h3 className="text-base font-semibold text-black dark:text-zinc-50">{step.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-20 sm:px-16">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Por que usar o Lattes2ORCID?</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-black dark:text-zinc-50">{benefit.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-20 text-center sm:px-16">
            <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              Seguro
            </span>
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
              Seu currículo não fica guardado em lugar nenhum
            </h2>
            <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              O XML é processado só na hora de gerar seus arquivos (PDF e
              .bib) e descartado logo em seguida — nunca fica salvo em nosso
              banco de dados. Guardamos apenas seu email, pra você receber os
              arquivos e eventuais novidades.
            </p>
          </div>
        </section>

        <section className="w-full border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-20 sm:px-16">
            <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Perguntas frequentes</h2>
            <dl className="flex flex-col gap-6">
              {FAQS.map((faq) => (
                <div key={faq.question} className="flex flex-col gap-1">
                  <dt className="text-base font-bold text-black dark:text-zinc-50">{faq.question}</dt>
                  <dd className="text-sm text-zinc-600 dark:text-zinc-400">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="w-full border-t border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:px-16">
            <h2 className="text-2xl font-semibold text-black sm:text-3xl dark:text-zinc-50">
              Seu próximo edital não vai esperar.
            </h2>
            <Link
              href="/upload"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Testar agora, é grátis
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
