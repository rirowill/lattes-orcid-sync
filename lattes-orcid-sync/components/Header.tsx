import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex w-full max-w-5xl items-center px-6 py-3 sm:px-16">
        <Link href="/">
          <Image src="/logo-header.png" alt="Lattes2ORCID" width={81} height={44} priority />
        </Link>
      </div>
    </header>
  );
}
