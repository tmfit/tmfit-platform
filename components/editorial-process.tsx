import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const rows = [
  {
    number: "01",
    title: "Valutazione",
    text: "Raccogliamo le informazioni che contano davvero: obiettivi, storia, abitudini, disponibilità, difficoltà e punto di partenza.",
  },
  {
    number: "02",
    title: "Strategia",
    text: "Organizziamo nutrizione e allenamento in una direzione unica, concreta e compatibile con la tua quotidianità.",
  },
  {
    number: "03",
    title: "Monitoraggio",
    text: "Check-in, feedback e progressi rendono leggibile l’andamento e permettono di intervenire con maggiore precisione.",
  },
  {
    number: "04",
    title: "Adattamento",
    text: "Il percorso non resta fermo: viene aggiornato quando i dati, i risultati o le tue esigenze cambiano.",
  },
];

export function EditorialProcess() {
  return (
    <div className="border-t border-slate-300/80">
      {rows.map((row) => (
        <Link
          key={row.title}
          href="/metodo"
          className="editorial-row group grid gap-5 border-b border-slate-300/80 py-7 sm:py-9 lg:grid-cols-[0.14fr_0.36fr_0.5fr] lg:items-start lg:gap-8"
        >
          <span className="text-[11px] font-black tracking-[0.22em] text-slate-400">
            ({row.number})
          </span>
          <span className="flex items-start justify-between gap-5">
            <span className="text-3xl font-medium tracking-[-0.045em] text-[#07111f] transition-transform duration-300 group-hover:translate-x-2 sm:text-4xl lg:text-[2.8rem]">
              {row.title}
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-slate-300 text-[#07111f] transition duration-300 group-hover:rotate-45 group-hover:border-[#07111f] group-hover:bg-[#07111f] group-hover:text-white lg:hidden">
              <ArrowUpRight size={17} />
            </span>
          </span>
          <span className="flex items-start justify-between gap-6">
            <span className="max-w-xl text-sm font-medium leading-6 text-slate-600 sm:text-base sm:leading-7">
              {row.text}
            </span>
            <span className="hidden size-11 shrink-0 place-items-center rounded-full border border-slate-300 text-[#07111f] transition duration-300 group-hover:rotate-45 group-hover:border-[#07111f] group-hover:bg-[#07111f] group-hover:text-white lg:grid">
              <ArrowUpRight size={18} />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
