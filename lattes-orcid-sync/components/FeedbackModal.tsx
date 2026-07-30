"use client";

import { useEffect, useState } from "react";

type FeedbackType = "erro" | "sugestao";
type Status = "idle" | "sending" | "success" | "error";

export default function FeedbackModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [type, setType] = useState<FeedbackType>("erro");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setType("erro");
      setMessage("");
      setEmail("");
      setStatus("idle");
      setErrorMessage(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message, email: email || undefined }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha ao enviar feedback.");
      }

      setStatus("success");
      setTimeout(onClose, 2000);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Falha ao enviar feedback.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-white p-6 dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
            Reportar erro ou sugestão
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            ✕
          </button>
        </div>

        {status === "success" ? (
          <p className="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
            Enviado! ✅ Obrigado pelo feedback.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("erro")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  type === "erro"
                    ? "border-black bg-black text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                🐞 Erro no XML
              </button>
              <button
                type="button"
                onClick={() => setType("sugestao")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium transition-colors ${
                  type === "sugestao"
                    ? "border-black bg-black text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-black"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                💡 Sugestão
              </button>
            </div>

            <textarea
              required
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Descreva o erro ou a sua sugestão..."
              className="w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Seu email (opcional, caso queira resposta)"
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />

            {status === "error" && errorMessage && (
              <p className="text-xs text-red-600 dark:text-red-400">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
            >
              {status === "sending" ? "Enviando…" : "Enviar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
