<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
Contexto do projeto: lattes-orcid-sync

Estou construindo um micro SaaS em Next.js (TypeScript + Tailwind, App Router) 
para ajudar pesquisadores brasileiros a manter e formatar seus currículos 
acadêmicos (Currículo Lattes e ORCID).

IMPORTANTE - restrições legais/técnicas:
- NÃO há API pública para automatizar login ou preenchimento no Lattes (CNPq). 
  Não fazer scraping nem automação de login na conta do usuário.
- O usuário SEMPRE exporta manualmente o XML do próprio Currículo Lattes 
  (função nativa da plataforma) e faz upload no nosso app. Todo processamento 
  do Lattes parte desse XML já exportado.
- ORCID TEM API pública com OAuth (https://info.orcid.org/documentation/) - 
  aqui podemos integrar de verdade, com autorização do usuário.

MVP - ordem de construção:
1. Upload de XML do Lattes → parsing → exibir dados extraídos na tela
   (dados pessoais, formação acadêmica, atuação profissional, produção 
   bibliográfica). Usar a estrutura do XSD oficial do CNPq como referência.
2. Gerar PDF formatado a partir dos dados extraídos (biosketch, currículo 
   resumido para editais, etc.)
3. Integração OAuth com ORCID (via sandbox.orcid.org para testes) para 
   importar publicações e comparar com os dados do Lattes, apontando 
   divergências/duplicatas.

Estrutura de pastas planejada:
- lib/lattes-parser.ts       → parsing do XML do Lattes
- lib/orcid-client.ts        → wrapper da API ORCID
- lib/pdf-generator.ts       → geração do PDF final (usar @react-pdf/renderer)
- app/api/lattes/parse/route.ts   → recebe upload do XML, chama o parser
- app/api/orcid/callback/route.ts → callback OAuth
- app/api/orcid/sync/route.ts     → busca dados via API ORCID
- components/UploadLattesXML.tsx
- components/ComparisonTable.tsx

Estado atual: projeto Next.js já criado e rodando (npm run dev funciona), 
git configurado e conectado a https://github.com/rirowill/lattes-orcid-sync.git

Próximo passo: comece pelo lib/lattes-parser.ts - preciso de uma função que 
receba o XML do Currículo Lattes (formato oficial do CNPq) como string e 
retorne um objeto TypeScript tipado com: dados pessoais, formação acadêmica, 
atuação profissional e produção bibliográfica (artigos, livros, capítulos, 
trabalhos em eventos). Pode usar a lib fast-xml-parser (ainda não instalada - 
instale se precisar).