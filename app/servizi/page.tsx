import type { Metadata } from "next";
import { ArrowRight, Check } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { ContactCta } from "@/components/contact-cta";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Servizi",
  description:
    "Percorsi TMFIT di nutrizione, allenamento, nutraceutica, biohacking applicabile e gestione nutrizionale delle intolleranze diagnosticate.",
};

const services = [
  {
    number: "01",
    title: "Nutrizione personalizzata",
    summary:
      "Valutazione e strategia alimentare costruite su obiettivi, storia, abitudini, preferenze e sostenibilità quotidiana.",
    includes: [
      "Anamnesi alimentare e raccolta strutturata dei dati",
      "Piano personalizzato e alternative operative",
      "Monitoraggio e aggiornamenti periodici",
      "Supporto tramite TMFIT Platform",
    ],
  },
  {
    number: "02",
    title: "Allenamento e composizione corporea",
    summary:
      "Programmazione progressiva collegata al livello, al tempo disponibile, all’attrezzatura e alla risposta individuale.",
    includes: [
      "Analisi del livello e degli obiettivi",
      "Scheda personalizzata e progressioni",
      "Storico dei carichi e degli allenamenti",
      "Revisione in base a feedback e andamento",
    ],
  },
  {
    number: "03",
    title: "Coaching integrato",
    summary:
      "Un unico percorso per coordinare nutrizione, allenamento, recupero, routine e monitoraggio.",
    includes: [
      "Strategia alimentare e motoria coordinata",
      "Check-in periodici",
      "Gestione delle difficoltà di aderenza",
      "Utilizzo completo della piattaforma",
    ],
  },
  {
    number: "04",
    title: "Nutraceutica",
    summary:
      "Valutazione ragionata dell’integrazione all’interno del percorso nutrizionale, evitando protocolli standardizzati.",
    includes: [
      "Analisi dell’alimentazione e del contesto",
      "Valutazione dell’effettiva utilità",
      "Indicazioni coerenti con il percorso",
      "Rivalutazione nel tempo",
    ],
  },
  {
    number: "05",
    title: "Biohacking applicabile",
    summary:
      "Strategie pratiche su sonno, recupero, luce, attività, organizzazione e dati personali, senza rincorrere mode o gadget.",
    includes: [
      "Routine di sonno e recupero",
      "Organizzazione dell’attività quotidiana",
      "Monitoraggio di abitudini e feedback",
      "Adattamento progressivo delle strategie",
    ],
  },
  {
    number: "06",
    title: "Intolleranze, microbiota e salute intestinale",
    summary:
      "Gestione nutrizionale basata su anamnesi, diagnosi e protocolli validati, con collaborazione medica quando necessaria.",
    includes: [
      "Raccolta della storia clinica e alimentare",
      "Gestione nutrizionale di diagnosi già formulate",
      "Percorsi di esclusione e reintroduzione quando appropriati",
      "Invio o confronto medico nei casi che lo richiedono",
    ],
  },
];

export default function ServiziPage() {
  return (
    <>
      <section className="bg-[#f2f0eb] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl border-t border-black/20 pt-6">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">Servizi TMFIT</p>
          <h1 className="mt-6 max-w-6xl text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.07em] text-[#0b0f14] sm:text-7xl lg:text-[7rem]">
            Il servizio giusto dipende dal problema da risolvere.
          </h1>
          <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8">
            Il percorso viene definito dopo un primo confronto. Le aree possono essere affrontate singolarmente o coordinate quando serve una strategia più completa.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl border-t border-black/20">
          {services.map((service, index) => (
            <Reveal key={service.number} delay={(index % 3) * 60}>
              <article className="service-editorial-row grid gap-7 border-b border-black/20 py-9 lg:grid-cols-[70px_0.72fr_1.28fr] lg:items-start lg:py-12">
                <p className="text-[11px] font-black tracking-[0.2em] text-black/38">{service.number}</p>
                <div>
                  <h2 className="text-3xl font-semibold leading-[1] tracking-[-0.05em] text-[#0b0f14] sm:text-4xl">
                    {service.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-black/58 sm:text-base sm:leading-7">
                    {service.summary}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/42">Il percorso può includere</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {service.includes.map((item) => (
                      <p key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-black/68">
                        <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full border border-black/20">
                          <Check size={11} strokeWidth={3} />
                        </span>
                        {item}
                      </p>
                    ))}
                  </div>
                  <ButtonLink href="/contatti" variant="outline" className="mt-7">
                    Richiedi informazioni <ArrowRight size={17} />
                  </ButtonLink>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#0b0f14] px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 border-y border-white/18 py-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Nota professionale</p>
          <p className="max-w-3xl text-sm font-medium leading-6 text-white/62 sm:text-base sm:leading-7">
            La gestione delle intolleranze non si basa su test alternativi non validati. Quando sono necessari diagnosi, esami o valutazioni cliniche, il percorso nutrizionale viene coordinato con il medico o lo specialista competente.
          </p>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
