import UploadLattesXML from "@/components/UploadLattesXML";

export default function UploadPage() {
  return (
    <div className="flex flex-1 items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-start px-16 py-16">
        <UploadLattesXML />
      </main>
    </div>
  );
}
