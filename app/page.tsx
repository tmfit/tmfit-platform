import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
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
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Biologo nutrizionista, allenamento e biohacking applicabile",
  description:
    "TMFIT integra nutrizione, movimento, nutraceutica, biohacking e monitoraggio in percorsi personalizzati in studio e online.",
};

const methodSteps = [
  {
    number: "01",
    title: "Leggere il punto di partenza",
    text: "Obiettivi, storia, abitudini, composizione corporea, allenamento, recupero e contesto quotidiano.",
  },
  {
    number: "02",
    title: "Definire le priorità",
    text: "Non aggiungere indicazioni indiscriminate, ma scegliere ciò che può avere più utilità in quella fase.",
  },
  {
    number: "03",
    title: "Costruire il sistema",
    text: "Alimentazione, movimento, integrazione e routine vengono organizzati in una direzione coerente.",
  },
  {
    number: "04",
    title: "Misurare e adattare",
    text: "Feedback, dati e difficoltà reali guidano gli aggiornamenti del percorso nel tempo.",
  },
];

export default function HomePage() {
  const credentials = siteConfig.credentials;

  return (
    <>
      <section className="editorial-hero relative overflow-hidden bg-[#f2f0eb] px-4 pb-12 pt-10 text-[#0b0f14] sm:px-6 sm:pb-16 sm:pt-14 lg:px-8 lg:pb-20">
        <div className="pointer-events-none absolute inset-0 hero-paper-texture" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex items-center justify-between border-b border-black/20 pb-4 text-[10px] font-black uppercase tracking-[0.22em] text-black/55 sm:text-[11px]">
            <span>Biologo nutrizionista · Scienze motorie</span>
            <span className="hidden sm:block">Studio e online · TMFIT</span>
          </div>

          <div className="grid min-h-[74svh] gap-12 py-12 sm:py-16 lg:grid-cols-[1.42fr_0.58fr] lg:items-end lg:gap-16 lg:py-20">
            <div className="hero-copy-enter self-center lg:self-end">
              <p className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.23em] text-black/52">
                <span className="size-2 rounded-full bg-[#83c7ba]" />
                Metodo TMFIT
              </p>
              <h1 className="max-w-5xl text-balance text-[3.5rem] font-semibold leading-[0.89] tracking-[-0.078em] sm:text-[5.4rem] lg:text-[7.1rem]">
                Nutrizione, movimento e biologia individuale.
              </h1>
            </div>

            <div className="hero-copy-enter border-t border-black/20 pt-6 lg:mb-2" style={{ animationDelay: "100ms" }}>
              <p className="text-pretty text-base font-medium leading-7 text-black/68 sm:text-lg sm:leading-8">
                Un percorso costruito su dati, contesto e continuità. Alimentazione, allenamento, nutraceutica e strategie di biohacking applicabili vengono coordinate e aggiornate nel tempo.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <ButtonLink href="/contatti" variant="dark">
                  Richiedi una valutazione <ArrowRight size={17} />
                </ButtonLink>
                <ButtonLink href="#ambiti" variant="outline">
                  Esplora il metodo <ArrowDown size={16} />
                </ButtonLink>
              </div>
            </div>
          </div>

          <div className="grid border-y border-black/20 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/55 sm:grid-cols-4 sm:gap-6 sm:text-[11px]">
            {[
              "Nutrizione personalizzata",
              "Allenamento progressivo",
              "Nutraceutica ragionata",
              "Biohacking applicabile",
            ].map((item) => (
              <div key={item} className="flex items-center justify-between border-b border-black/15 py-3 last:border-b-0 sm:border-b-0 sm:py-0">
                <span>{item}</span>
                <span className="ml-3 text-black/30">↗</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative bg-[#0b0f14] px-4 pb-8 pt-8 text-white sm:px-6 sm:pb-12 sm:pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="relative min-h-[58svh] overflow-hidden sm:min-h-[72svh]">
              <Image
                src={siteConfig.consultationUrl}
                alt="Matteo Trobbiani durante una consulenza nutrizionale"
                fill
                priority
                sizes="100vw"
                className="object-cover object-center grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 grid gap-5 p-6 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:p-12">
                <h2 className="max-w-4xl text-balance text-4xl font-semibold leading-[0.94] tracking-[-0.06em] sm:text-6xl">
                  La strategia parte dalla persona, non dal protocollo.
                </h2>
                <p className="max-w-xl text-sm font-medium leading-6 text-white/72 sm:text-base sm:leading-7 lg:ml-auto">
                  Il primo obiettivo è comprendere cosa sta limitando il percorso e quali variabili meritano davvero attenzione. Solo dopo vengono definiti strumenti, priorità e tempi.
                </p>
              </div>
              <div className="absolute left-6 top-6 border border-white/25 bg-black/30 px-4 py-3 backdrop-blur-md sm:left-10 sm:top-10">
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/62">Approccio</p>
                <p className="mt-1 text-sm font-semibold">Analisi · Strategia · Adattamento</p>
              </div>
            </div>
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
                  Un sistema, non una somma di servizi.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8 lg:ml-auto">
                Le aree vengono collegate in base alla situazione individuale. Non tutte servono sempre e non tutte hanno la stessa priorità.
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
                  Quattro prospettive. Una sola direzione.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8 lg:ml-auto">
                Passa sulle card da desktop oppure toccale da smartphone. Il retro spiega come ogni area entra nel percorso TMFIT.
              </p>
            </div>
          </Reveal>
          <Reveal className="mt-12" delay={100}>
            <PillarFlipCards />
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0b0f14] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-10 border-b border-white/18 pb-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/48">Metodo TMFIT</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
                  Dalla complessità a una direzione comprensibile.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-white/62 sm:text-lg sm:leading-8 lg:ml-auto">
                Il percorso non viene riempito di strumenti: viene organizzato per fasi, verificato e corretto quando la risposta reale richiede un cambiamento.
              </p>
            </div>
          </Reveal>

          <div className="mt-4">
            {methodSteps.map((step, index) => (
              <Reveal key={step.number} delay={index * 70}>
                <article className="method-line grid gap-4 border-b border-white/18 py-7 sm:grid-cols-[64px_0.75fr_1.25fr] sm:items-start sm:py-9">
                  <p className="text-[11px] font-black tracking-[0.2em] text-white/38">{step.number}</p>
                  <h3 className="text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">{step.title}</h3>
                  <p className="max-w-2xl text-sm font-medium leading-6 text-white/58 sm:text-base sm:leading-7">{step.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
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
              Nutrizione e movimento letti nello stesso quadro.
            </h2>
            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8">
              La formazione in nutrizione umana e scienze motorie sostiene un approccio che considera alimentazione, composizione corporea, movimento, recupero e salute intestinale come variabili collegate.
            </p>

            <div className="mt-10 border-t border-black/20">
              {[
                {
                  icon: GraduationCap,
                  title: credentials.masterDegree,
                  text: credentials.masterThesis,
                },
                {
                  icon: BookOpen,
                  title: credentials.bachelorDegree,
                  text: credentials.bachelorThesis,
                },
                {
                  icon: ShieldCheck,
                  title: credentials.register,
                  text: credentials.vat,
                },
                {
                  icon: Microscope,
                  title: "Aree di approfondimento",
                  text: "Microbiota intestinale, nutraceutica, biohacking applicabile e integrazione tra nutrizione e movimento.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="grid gap-4 border-b border-black/20 py-6 sm:grid-cols-[46px_1fr] sm:items-start">
                  <span className="grid size-10 place-items-center rounded-full border border-black/20 text-black/72">
                    <Icon size={18} />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold leading-6 tracking-[-0.025em] text-[#0b0f14]">{title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-black/55">{text}</p>
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
                Prima di iniziare, è giusto avere chiarezza.
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
