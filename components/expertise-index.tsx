"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";

const expertise = [
  {
    number: "01",
    title: "Nutrizione",
    keyword: "PERSONA",
    text: "Piani alimentari costruiti su obiettivi, storia, abitudini, preferenze e sostenibilità quotidiana, con aggiornamenti basati sull’andamento reale.",
  },
  {
    number: "02",
    title: "Allenamento",
    keyword: "MOVIMENTO",
    text: "Programmazione progressiva collegata al livello, alla disponibilità, alla composizione corporea e alla risposta individuale al carico.",
  },
  {
    number: "03",
    title: "Nutraceutica",
    keyword: "CRITERIO",
    text: "Integrazione valutata in modo ragionato, all’interno del percorso nutrizionale e sulla base di necessità, alimentazione e contesto: non protocolli standard.",
  },
  {
    number: "04",
    title: "Biohacking",
    keyword: "DATI",
    text: "Strategie applicabili su sonno, recupero, routine, luce, attività e monitoraggio per rendere più leggibile e sostenibile il percorso.",
  },
  {
    number: "05",
    title: "Intolleranze e microbiota",
    keyword: "INQUADRAMENTO",
    text: "Gestione nutrizionale basata su anamnesi, diagnosi e protocolli validati, con attenzione alla salute intestinale e collaborazione medica quando necessaria.",
  },
];

export function ExpertiseIndex() {
  const [active, setActive] = useState(0);
  const current = expertise[active];

  return (
    <div className="expertise-layout grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
      <div className="border-t border-black/20">
        {expertise.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.title}
              type="button"
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className={`expertise-row group grid w-full gap-4 border-b border-black/20 py-6 text-left transition sm:grid-cols-[56px_0.72fr_1.28fr_34px] sm:items-start sm:py-8 ${
                selected ? "is-active" : ""
              }`}
              aria-pressed={selected}
            >
              <span className="text-[11px] font-black tracking-[0.18em] text-black/45">
                {item.number}
              </span>
              <span className="text-2xl font-semibold tracking-[-0.045em] text-[#0b0f14] sm:text-3xl">
                {item.title}
              </span>
              <span className="max-w-xl text-sm font-medium leading-6 text-black/58 sm:pr-4">
                {item.text}
              </span>
              <span className="hidden size-8 place-items-center rounded-full border border-black/20 text-black transition group-hover:rotate-45 group-hover:bg-black group-hover:text-white sm:grid">
                <ArrowUpRight size={15} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="expertise-visual relative aspect-[4/5] overflow-hidden bg-[#0b0f14] p-7 text-white sm:p-10">
          <div className="expertise-grid pointer-events-none absolute inset-0" />
          <div className="expertise-orbit expertise-orbit-a" />
          <div className="expertise-orbit expertise-orbit-b" />
          <div className="expertise-orbit expertise-orbit-c" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/18 pb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/58">
                Ambito attivo
              </p>
              <p className="text-[11px] font-black tracking-[0.2em] text-white/58">
                {current.number} / 05
              </p>
            </div>

            <div className="my-auto">
              <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#b9e3da]">
                {current.keyword}
              </p>
              <p
                key={current.title}
                className="expertise-word mt-4 text-balance text-5xl font-semibold leading-[0.92] tracking-[-0.07em] sm:text-6xl"
              >
                {current.title}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-white/18 pt-5 text-[9px] font-black uppercase tracking-[0.18em] text-white/48">
              <span>Analisi</span>
              <span>Strategia</span>
              <span>Adattamento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
