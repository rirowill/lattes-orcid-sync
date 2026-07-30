import { supabase } from "@/lib/supabase-client";

const MAX_MESSAGE_LENGTH = 2000;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let body: { type?: unknown; message?: unknown; email?: unknown };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Requisição inválida: envie { type, message, email? } como JSON." },
      { status: 400 },
    );
  }

  const { type, message, email } = body;

  if (type !== "erro" && type !== "sugestao") {
    return Response.json({ error: "Informe type como \"erro\" ou \"sugestao\"." }, { status: 400 });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "A mensagem não pode ficar vazia." }, { status: 400 });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return Response.json(
      { error: `A mensagem deve ter no máximo ${MAX_MESSAGE_LENGTH} caracteres.` },
      { status: 400 },
    );
  }

  if (email !== undefined && email !== "" && (typeof email !== "string" || !isValidEmail(email))) {
    return Response.json({ error: "Email inválido." }, { status: 400 });
  }

  const { error } = await supabase.rpc("submit_feedback", {
    p_type: type,
    p_message: message.trim(),
    p_email: typeof email === "string" ? email.trim() : "",
  });

  if (error) {
    return Response.json(
      { error: "Não foi possível enviar seu feedback agora. Tente novamente." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
