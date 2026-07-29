import { supabase } from "@/lib/supabase-client";

const FREE_USES_LIMIT = 3;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  let email: unknown;

  try {
    const body = await request.json();
    email = body.email;
  } catch {
    return Response.json(
      { error: "Requisição inválida: envie { email } como JSON." },
      { status: 400 },
    );
  }

  if (typeof email !== "string" || !isValidEmail(email)) {
    return Response.json({ error: "Informe um email válido." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await supabase
    .rpc("consume_usage", { p_email: normalizedEmail, p_limit: FREE_USES_LIMIT })
    .single();

  if (error) {
    return Response.json(
      { error: "Não foi possível verificar seu uso. Tente novamente." },
      { status: 500 },
    );
  }

  return Response.json(data);
}
