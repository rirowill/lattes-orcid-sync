import Link from "next/link";

const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Lattes → ORCID",
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

const FAQS = [
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

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
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
