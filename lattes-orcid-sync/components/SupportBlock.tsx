"use client";

import { useState } from "react";
import PixModal from "./PixModal";

export default function SupportBlock() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full border-t border-zinc-200 bg-zinc-100/60 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 py-10 text-center sm:px-16">
        <h2 className="text-sm font-semibold text-black dark:text-zinc-50">
          Gostou da ferramenta? Apoie a Ciência Aberta 🔬
        </h2>
        <p className="max-w-md text-xs text-zinc-500 dark:text-zinc-500">
          O sistema é gratuito e sempre será. Se a ferramenta economizou seu
          tempo hoje, considere fazer uma contribuição via PIX para manter o
          servidor no ar.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ⚡ Apoiar via PIX / Ver QR Code
        </button>
      </div>

      <PixModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
