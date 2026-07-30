"use client";

import { useEffect, useState } from "react";

const PIX_KEY = process.env.NEXT_PUBLIC_PIX_KEY ?? "";

export default function PixModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  if (!open) return null;

  async function handleCopy() {
    await navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center dark:bg-zinc-900"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="self-end text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-black dark:text-zinc-50">
          Apoie a Ciência Aberta ☕
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Escaneie o QR Code com o aplicativo do seu banco ou copie a chave
          abaixo.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pix-qrcode.png"
          alt="QR Code Pix"
          width={220}
          height={220}
          className="rounded-lg"
        />

        <div className="flex w-full flex-col gap-2">
          <input
            type="text"
            readOnly
            value={PIX_KEY}
            onFocus={(event) => event.target.select()}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-center text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            {copied ? "Copiado! 🚀" : "Copiar Código PIX"}
          </button>
        </div>
      </div>
    </div>
  );
}
