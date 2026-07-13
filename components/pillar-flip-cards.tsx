"use client";

import Image from "next/image";
import { ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";

const cards = [
  {
    number: "01",
    title: "Metodo",
    image: "/images/card-metodo.png",
    headline: "La direzione prima del programma.",
    text: "Partiamo da obiettivi, abitudini, disponibilità e condizioni reali. Il percorso nasce dall’analisi, non da un formato preconfezionato.",
    points: ["Valutazione iniziale", "Priorità definite", "Strategia progressiva"],
  },
  {
    number: "02",
    title: "Allenamento",
    image: "/images/card-allenamento.png",
    headline: "Progressione leggibile e sostenibile.",
    text: "Programmi costruiti sul tuo livello, sul contesto in cui ti alleni e sulla risposta che mostri nel tempo.",
    points: ["Programmazione su misura", "Storico dei carichi", "Adattamenti periodici"],
  },
  {
    number: "03",
    title: "Nutrizione",
    image: "/images/card-nutrizione.png",
    headline: "Una strategia che entra nella vita reale.",
    text: "Indicazioni alimentari organizzate intorno a esigenze, abitudini e obiettivi, con eventuale nutraceutica valutata all’interno del percorso.",
    points: ["Piano personalizzato", "Nutraceutica ragionata", "Controlli mirati"],
  },
  {
    number: "04",
    title: "Stile di vita",
    image: "/images/card-stile-vita.png",
    headline: "Biohacking significa rendere misurabili le abitudini utili.",
    text: "Sonno, luce, recupero, routine, stress e dati di monitoraggio vengono usati in modo pratico, senza trasformare il percorso in una raccolta di gadget.",
    points: ["Sonno e recupero", "Routine e monitoraggio", "Continuità nel tempo"],
  },
];

export function PillarFlipCards() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="pillar-card-grid grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {cards.map((card, index) => {
        const flipped = active === index;

        return (
          <article
            key={card.title}
            className={`flip-card ${flipped ? "is-flipped" : ""}`}
          >
            <button
              type="button"
              onClick={() => setActive(flipped ? null : index)}
              className="flip-card-inner group"
              aria-pressed={flipped}
              aria-label={`${card.title}: ${flipped ? "mostra immagine" : "mostra dettagli"}`}
            >
              <span className="flip-card-face flip-card-front">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 640px) 94vw, (max-width: 1024px) 48vw, 24vw"
                  className="object-cover"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
                <span className="absolute left-5 top-5 text-[11px] font-black tracking-[0.24em] text-white/70">
                  {card.number}
                </span>
                <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full border border-white/35 bg-black/20 text-white backdrop-blur-md transition group-hover:rotate-45">
                  <ArrowUpRight size={18} />
                </span>
              </span>

              <span className="flip-card-face flip-card-back">
                <span className="flex h-full flex-col p-6 text-left sm:p-7">
                  <span className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-[0.24em] text-teal-200">
                      {card.number} · {card.title}
                    </span>
                    <span className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 text-teal-200">
                      <ArrowUpRight size={17} />
                    </span>
                  </span>

                  <span className="mt-auto block">
                    <span className="block text-2xl font-black leading-[1.05] tracking-[-0.04em] text-white">
                      {card.headline}
                    </span>
                    <span className="mt-4 block text-sm font-medium leading-6 text-slate-300">
                      {card.text}
                    </span>
                    <span className="mt-5 grid gap-2.5 border-t border-white/10 pt-5">
                      {card.points.map((point) => (
                        <span key={point} className="flex items-center gap-2.5 text-xs font-extrabold text-white">
                          <span className="grid size-5 place-items-center rounded-full bg-teal-300 text-[#07111f]">
                            <Check size={11} strokeWidth={3} />
                          </span>
                          {point}
                        </span>
                      ))}
                    </span>
                  </span>
                </span>
              </span>
            </button>
          </article>
        );
      })}
    </div>
  );
}
