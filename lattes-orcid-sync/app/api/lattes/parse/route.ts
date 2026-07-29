import { parseLattesXML } from "@/lib/lattes-parser";

/**
 * O CNPq exporta o Currículo Lattes em ISO-8859-1 (Latin-1), então decodificar
 * como UTF-8 direto corrompe acentos. Lemos o encoding declarado na própria
 * declaração <?xml ... encoding="..."?> e decodificamos de acordo.
 */
async function readXmlText(file: Blob): Promise<string> {
  const buffer = await file.arrayBuffer();
  const preview = new TextDecoder("iso-8859-1").decode(buffer.slice(0, 200));
  const encoding = preview.match(/encoding=["']([^"']+)["']/i)?.[1] ?? "utf-8";

  try {
    return new TextDecoder(encoding).decode(buffer);
  } catch {
    return new TextDecoder("utf-8").decode(buffer);
  }
}

export async function POST(request: Request) {
  let file: FormDataEntryValue | null;

  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return Response.json(
      { error: "Requisição inválida: envie o arquivo como multipart/form-data no campo \"file\"." },
      { status: 400 },
    );
  }

  if (!(file instanceof Blob)) {
    return Response.json(
      { error: "Nenhum arquivo enviado. Envie o XML exportado do Currículo Lattes no campo \"file\"." },
      { status: 400 },
    );
  }

  const xml = await readXmlText(file);

  if (!xml.trim()) {
    return Response.json({ error: "O arquivo enviado está vazio." }, { status: 400 });
  }

  try {
    const curriculo = parseLattesXML(xml);
    return Response.json({ curriculo });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao processar o XML do Lattes.";
    return Response.json({ error: message }, { status: 422 });
  }
}
