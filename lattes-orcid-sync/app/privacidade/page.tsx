import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Lattes → ORCID",
  description:
    "Como o Lattes → ORCID coleta, usa e armazena seus dados.",
};

const SECTIONS = [
  {
    title: "1. O que coletamos",
    body: "Coletamos o arquivo XML do Currículo Lattes que você faz upload voluntariamente, e o email que você informa para receber os arquivos gerados (currículo formatado em PDF e arquivo .bib).",
  },
  {
    title: "2. Como usamos seus dados",
    body: "O XML é processado para extrair as informações do seu currículo (formação, atuação profissional, produção bibliográfica) e gerar os arquivos solicitados. O email é usado para contato relacionado à ferramenta, incluindo atualizações e novidades — você pode pedir remoção a qualquer momento.",
  },
  {
    title: "3. Armazenamento",
    body: "Não armazenamos o conteúdo do seu Currículo Lattes. O arquivo XML é processado apenas durante a geração dos arquivos solicitados (PDF e .bib) e descartado imediatamente após — não fica salvo em nosso banco de dados nem em qualquer outro lugar. Apenas seu email fica registrado, para contato relacionado à ferramenta.",
  },
  {
    title: "4. Compartilhamento com terceiros",
    body: "Não vendemos nem compartilhamos seus dados pessoais com terceiros para fins de marketing. Usamos Supabase como infraestrutura de banco de dados para armazenar emails de contato.",
  },
  {
    title: "5. Seus direitos (LGPD)",
    body: "Você pode solicitar a qualquer momento a exclusão dos seus dados, entrando em contato pelo email rirowill@outlook.com.",
  },
  {
    title: "6. Contato",
    body: "Dúvidas sobre esta política: rirowill@outlook.com",
  },
];

export default function PrivacidadePage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-24 sm:px-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Política de Privacidade
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            Última atualização: 29 de julho de 2026
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {section.body}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
