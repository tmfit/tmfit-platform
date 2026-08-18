import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Microscope,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { ContactCta } from "@/components/contact-cta";
import { ExpertiseIndex } from "@/components/expertise-index";
import { FAQ } from "@/components/faq";
import { PillarFlipCards } from "@/components/pillar-flip-cards";
import { PlatformAccess } from "@/components/platform-access";
import { Reveal } from "@/components/reveal";
import { ResultsShowcase } from "@/components/results-showcase";
import { StrategySystemVisual } from "@/components/strategy-system-visual";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Biologo nutrizionista, nutrizione e movimento personalizzati",
  description:
    "TMFIT costruisce percorsi personalizzati di nutrizione e movimento a partire dalla persona, dalle sue abitudini e dalla risposta nel tempo.",
};

const methodSteps = [
  { number: "01", title: "Osservare", text: "Capire il punto di partenza." },
  { number: "02", title: "Dare priorità", text: "Scegliere cosa conta adesso." },
  { number: "03", title: "Costruire", text: "Trasformare le priorità in azioni." },
  { number: "04", title: "Adattare", text: "Correggere in base alla risposta." },
];


export default function HomePage() {
  const credentials = siteConfig.credentials;

  return (
    <>
      <section className="editorial-hero relative overflow-hidden bg-[#f2f0eb] px-4 pb-14 pt-10 text-[#0b0f14] sm:px-6 sm:pb-18 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-18">
        <div className="pointer-events-none absolute inset-0 hero-paper-texture" />
        <div className="pointer-events-none absolute left-[-8%] top-[8%] size-[26rem] rounded-full bg-[#b9e3da]/18 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-12%] right-[-8%] size-[22rem] rounded-full bg-white/60 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <div className="hero-opening-grid grid min-h-[76svh] gap-12 py-8 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-18 lg:py-14">
            <div className="hero-copy-enter self-center lg:self-end">
              <h1 className="max-w-5xl text-balance text-[3.5rem] font-semibold leading-[0.89] tracking-[-0.078em] sm:text-[5.4rem] lg:text-[7.1rem]">
                Nutrizione e movimento, costruiti intorno alla persona.
              </h1>
              <p className="mt-7 max-w-2xl text-pretty text-base font-medium leading-7 text-black/68 sm:text-lg sm:leading-8">
                Ogni percorso parte da obiettivi, abitudini, composizione corporea e risposta nel tempo.
                Alimentazione, allenamento e stile di vita vengono organizzati in modo chiaro, concreto e sostenibile.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/contatti" variant="dark">
                  Richiedi una valutazione <ArrowRight size={17} />
                </ButtonLink>
                <ButtonLink href="#ambiti" variant="outline">
                  Esplora il metodo <ArrowDown size={16} />
                </ButtonLink>
              </div>
            </div>

            <div className="hero-copy-enter lg:pb-2" style={{ animationDelay: "120ms" }}>
              <div className="rounded-[2rem] border border-black/12 bg-white/35 p-6 backdrop-blur-sm sm:p-8">
                <p className="mt-4 text-2xl font-semibold leading-[1.02] tracking-[-0.045em] text-[#0b0f14] sm:text-[2rem]">
                  Un approccio che parte dalla lettura del contesto e si rifinisce nel tempo.
                </p>
                <p className="mt-4 text-sm font-medium leading-6 text-black/58 sm:text-base sm:leading-7">
                  Ogni indicazione viene collocata con misura: ciò che conta non è aggiungere elementi,
                  ma dare ordine, continuità e qualità al percorso.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-[#111214] px-4 py-8 text-white sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <StrategySystemVisual />
          </Reveal>
        </div>
      </section>

      <section id="ambiti" className="bg-[#f7f6f2] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 grid gap-8 border-b border-black/20 pb-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">Ambiti di lavoro</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#0b0f14] sm:text-6xl">
                  Ogni area entra nel percorso quando serve davvero.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8 lg:ml-auto">
                Nutrizione, movimento, abitudini, microbiota e integrazione non vengono sommati per forza:
                trovano spazio con tempi e priorità diversi, in base alla persona.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ExpertiseIndex />
          </Reveal>
        </div>
      </section>

      <section className="border-y border-black/15 bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">I quattro pilastri</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#0b0f14] sm:text-6xl">
                  Quattro prospettive che si parlano tra loro.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8 lg:ml-auto">
                Il metodo unisce ciò che mangi, come ti muovi, le abitudini che riesci a mantenere e gli strumenti
                che possono essere davvero utili nel tuo percorso.
              </p>
            </div>
          </Reveal>
          <Reveal className="mt-12" delay={100}>
            <PillarFlipCards />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0b0f14] px-4 py-20 text-white sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-8 border-b border-white/18 pb-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/48">Metodo TMFIT</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
                  Capire, scegliere, costruire, adattare.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-white/62 sm:text-lg sm:leading-8 lg:ml-auto">
                Il metodo serve a rendere il percorso più chiaro: si parte da ciò che emerge e si corregge solo quando serve.
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-px overflow-hidden border border-white/16 bg-white/16 sm:grid-cols-2 lg:grid-cols-4">
            {methodSteps.map((step, index) => (
              <Reveal key={step.number} delay={index * 60} className="bg-[#0b0f14]">
                <article className="method-summary-card h-full p-6 sm:p-7">
                  <p className="text-[11px] font-black tracking-[0.2em] text-white/38">{step.number}</p>
                  <h3 className="mt-10 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">{step.title}</h3>
                  <p className="mt-3 text-sm font-medium leading-6 text-white/58">{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-8">
            <ButtonLink href="/metodo" variant="darkOutline">
              Approfondisci il Metodo TMFIT <ArrowRight size={17} />
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="results-section overflow-hidden bg-[#ece9e2] py-20 text-[#0b0f14] sm:py-28 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-8 border-b border-black/15 pb-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/45">Percorsi reali</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
                  Evoluzioni individuali nel tempo.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-black/60 sm:text-lg sm:leading-8 lg:ml-auto">
                Alcuni esempi visivi di percorsi seguiti nel tempo. Ogni cambiamento nasce da un punto di partenza diverso e viene letto nel suo contesto.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-10 sm:mt-12" delay={80}>
          <ResultsShowcase />
        </Reveal>

        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="max-w-3xl text-xs font-medium leading-5 text-black/48 sm:text-sm sm:leading-6">
            Immagini pubblicate con autorizzazione. I risultati sono individuali e possono variare in relazione alle condizioni di partenza, all’aderenza e alle caratteristiche del percorso.
          </p>
        </div>
      </section>

      <section className="bg-[#f2f0eb] px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch lg:gap-16">
          <Reveal className="relative min-h-[520px] overflow-hidden bg-[#d9d7d2] lg:min-h-[760px]">
            <Image
              src={siteConfig.measurementUrl}
              alt="Matteo Trobbiani con strumento per la valutazione antropometrica"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover object-center grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-white/35 pt-4 text-white sm:bottom-8 sm:left-8 sm:right-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/65">Matteo Trobbiani</p>
                <p className="mt-1 text-lg font-semibold">Biologo nutrizionista</p>
              </div>
              <BadgeCheck size={22} />
            </div>
          </Reveal>

          <Reveal className="flex flex-col justify-center" delay={100}>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">Formazione e professione</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#0b0f14] sm:text-6xl">
              Formazione accademica e iscrizione professionale.
            </h2>
            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8">
              Il percorso professionale si sviluppa tra nutrizione umana, scienze motorie, microbiota intestinale,
              composizione corporea e relazione tra intervento nutrizionale, movimento e qualità di vita.
            </p>

            <div className="mt-10 border-t border-black/20">
              {[
                {
                  icon: GraduationCap,
                  title: credentials.masterDegree,
                },
                {
                  icon: BookOpen,
                  title: credentials.bachelorDegree,
                },
                {
                  icon: ShieldCheck,
                  title: credentials.register,
                  text: credentials.vat,
                },
                {
                  icon: Microscope,
                  title: "Aree di approfondimento",
                  text: "Microbiota intestinale, nutraceutica, biohacking applicabile, intolleranze e integrazione tra nutrizione, composizione corporea e movimento.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="grid gap-4 border-b border-black/20 py-6 sm:grid-cols-[46px_1fr] sm:items-start">
                  <span className="grid size-10 place-items-center rounded-full border border-black/20 text-black/72">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold leading-6 tracking-[-0.025em] text-[#0b0f14]">{title}</h3>
                    {text ? <p className="mt-1 text-sm font-medium leading-6 text-black/55">{text}</p> : null}
                  </div>
                </div>
              ))}
            </div>

            <ButtonLink href="/chi-sono" variant="outline" className="mt-8 w-fit">
              Conosci il percorso professionale <ArrowRight size={17} />
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <PlatformAccess />
      </Reveal>


      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">Domande frequenti</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#0b0f14] sm:text-6xl">
                Prima di iniziare, è corretto avere chiarezza.
              </h2>
            </div>
          </Reveal>
          <Reveal className="mt-10" delay={100}>
            <FAQ />
          </Reveal>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
