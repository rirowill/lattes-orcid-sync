import Link from "next/link";

const FEATURES = [
  {
    title: "Upload do XML",
    description: "Exporte do próprio Lattes, sem login de terceiros.",
  },
  {
    title: "Currículo formatado",
    description: "PDF pronto para editais, biosketch e resumo.",
  },
  {
    title: "Exportar .bib",
    description: "Importe todas as publicações no ORCID de uma vez.",
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
    title: "Baixe o PDF e o .bib prontos para uso",
    description: "Currículo formatado para editais e produção pronta para o ORCID.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 flex-col items-center">
        <section className="flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:px-16">
          <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            Para pesquisadores brasileiros
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-black sm:text-5xl dark:text-zinc-50">
            Do Lattes ao ORCID, sem digitar tudo de novo
          </h1>
          <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            Suba o XML exportado do seu Currículo Lattes e receba um currículo
            formatado para editais e um arquivo pronto para importar no
            ORCID.
          </p>
          <Link
            href="/upload"
            className="mt-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Experimentar grátis
          </Link>
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
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:px-16">
            <h2 className="text-2xl font-semibold text-black sm:text-3xl dark:text-zinc-50">
              Pronto para atualizar seu currículo?
            </h2>
            <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              Leva menos de um minuto: suba o XML e veja tudo formatado na
              hora.
            </p>
            <Link
              href="/upload"
              className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Experimentar grátis
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
