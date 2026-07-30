"use client";

import { useState } from "react";
import FeedbackModal from "./FeedbackModal";

export default function FeedbackBlock() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 py-10 text-center sm:px-16">
        <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-500">
          Encontrou um erro no seu XML ou tem alguma sugestão para melhorar a
          ferramenta?
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          💬 Reportar Erro ou Sugestão
        </button>
      </div>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
