"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Posso seguire il percorso completamente online?",
    answer:
      "Sì. Valutazione iniziale, confronti e monitoraggio possono essere organizzati a distanza. La modalità viene scelta in base alle esigenze e agli strumenti realmente utili.",
  },
  {
    question: "Nutraceutica significa che riceverò molti integratori?",
    answer:
      "No. L’integrazione viene considerata solo quando può avere una funzione coerente con alimentazione, fabbisogni e contesto. Non vengono utilizzati protocolli uguali per tutti.",
  },
  {
    question: "Cosa intendi per biohacking?",
    answer:
      "L’uso ragionato di sonno, recupero, luce, attività, routine e dati di monitoraggio per rendere il percorso più applicabile. Non è una raccolta di gadget o promesse rapide.",
  },
  {
    question: "Come vengono affrontate le intolleranze alimentari?",
    answer:
      "Si parte da anamnesi, eventuali diagnosi ed esami validati. Quando servono diagnosi o valutazioni cliniche, il percorso nutrizionale viene coordinato con il medico o lo specialista competente.",
  },
  {
    question: "A cosa serve TMFIT Platform?",
    answer:
      "Raccoglie piano alimentare, allenamenti, check-in, progressi e strumenti pratici in un’unica area personale, così il percorso resta ordinato e semplice da seguire.",
  },
  {
    question: "Come capisco quale servizio è adatto a me?",
    answer:
      "Puoi partire da una richiesta di valutazione. Obiettivi, situazione attuale e principali difficoltà permettono di definire la modalità più sensata, senza scegliere un pacchetto in anticipo.",
  },
];

export function FAQ() {
  const [active, setActive] = useState<number | null>(0);

  return (
    <div className="mx-auto mt-10 max-w-4xl border-t border-black/20">
      {faqs.map((item, index) => {
        const isOpen = active === index;
        return (
          <div key={item.question} className="border-b border-black/20">
            <button
              type="button"
              onClick={() => setActive(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-5 py-6 text-left sm:py-8"
              aria-expanded={isOpen}
            >
              <span className="grid gap-2 sm:grid-cols-[42px_1fr] sm:items-start">
                <span className="text-[10px] font-black tracking-[0.2em] text-black/36">0{index + 1}</span>
                <span className="text-lg font-semibold leading-6 tracking-[-0.025em] text-[#0b0f14] sm:text-xl">
                  {item.question}
                </span>
              </span>
              <ChevronDown
                size={20}
                className={`shrink-0 text-black/38 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen ? (
              <p className="max-w-3xl pb-7 pl-0 text-sm font-medium leading-6 text-black/57 sm:pl-[42px] sm:text-base sm:leading-7">
                {item.answer}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
