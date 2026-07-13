import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { ContactCta } from "@/components/contact-cta";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Metodo",
  description:
    "Scopri il Metodo TMFIT: valutazione, priorità, strategia, monitoraggio e adattamento del percorso.",
};

const phases = [
  {
    number: "01",
    title: "Valutazione",
    text: "Obiettivi, storia, alimentazione, movimento, recupero, abitudini e contesto vengono letti insieme prima di proporre una soluzione.",
    details: "Anamnesi · Priorità · Punto di partenza",
  },
  {
    number: "02",
    title: "Strategia",
    text: "Le informazioni diventano un piano applicabile. Nutrizione, allenamento, nutraceutica e routine vengono organizzati senza sovraccaricare la persona.",
    details: "Direzione · Progressione · Strumenti utili",
  },
  {
    number: "03",
    title: "Monitoraggio",
    text: "Check-in, misure, andamento degli allenamenti e feedback permettono di capire cosa sta funzionando e cosa richiede attenzione.",
    details: "Dati · Feedback · Comprensione",
  },
  {
    number: "04",
    title: "Adattamento",
    text: "Il programma cambia quando il contesto o la risposta reale lo richiedono, non per abitudine e non secondo scadenze arbitrarie.",
    details: "Correzioni · Nuove esigenze · Continuità",
  },
];

export default function MetodoPage() {
  return (
    <>
      <section className="bg-[#f2f0eb] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl border-t border-black/20 pt-6">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">Metodo TMFIT</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.18fr_0.82fr] lg:items-end">
            <h1 className="max-w-6xl text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.07em] text-[#0b0f14] sm:text-7xl lg:text-[7rem]">
              Capire prima. Organizzare meglio. Correggere quando serve.
            </h1>
            <p className="max-w-xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8 lg:ml-auto">
              Un metodo non è una lista di regole. È il modo con cui le informazioni diventano decisioni, le decisioni diventano azioni e le azioni vengono verificate nel tempo.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl border-t border-black/20">
          {phases.map((phase, index) => (
            <Reveal key={phase.number} delay={index * 70}>
              <article className="service-editorial-row grid gap-6 border-b border-black/20 py-9 lg:grid-cols-[70px_0.7fr_1.3fr] lg:items-start lg:py-12">
                <p className="text-[11px] font-black tracking-[0.2em] text-black/38">{phase.number}</p>
                <div>
                  <h2 className="text-4xl font-semibold tracking-[-0.055em] text-[#0b0f14] sm:text-5xl">{phase.title}</h2>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-black/38">{phase.details}</p>
                </div>
                <p className="max-w-3xl text-base font-medium leading-7 text-black/60 sm:text-lg sm:leading-8">{phase.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#0b0f14] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 border-y border-white/18 py-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/42">Cosa cambia</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
              Il piano è uno strumento. Il percorso è il sistema che lo rende utile.
            </h2>
          </div>
          <div className="border-t border-white/18 lg:border-t-0">
            {[
              "Niente standardizzazione automatica",
              "Niente modifiche senza una ragione",
              "Niente strumenti scollegati",
              "Niente promesse rapide o protocolli universali",
            ].map((item) => (
              <p key={item} className="border-b border-white/18 py-5 text-base font-semibold text-white/68">{item}</p>
            ))}
            <ButtonLink href="/servizi" variant="darkOutline" className="mt-8">
              Scopri i servizi <ArrowRight size={18} />
            </ButtonLink>
          </div>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
