import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/button-link";

export default function NotFound() {
  return (
    <section className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-teal-700">Errore 404</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[#07111f]">Pagina non trovata.</h1>
        <p className="mt-4 text-base font-medium leading-7 text-slate-600">
          Il contenuto che stai cercando non è disponibile oppure è stato spostato.
        </p>
        <ButtonLink href="/" className="mt-7">
          <ArrowLeft size={18} /> Torna alla home
        </ButtonLink>
      </div>
    </section>
  );
}
