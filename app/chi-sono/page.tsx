import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  GraduationCap,
  Microscope,
  ShieldCheck,
} from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { ContactCta } from "@/components/contact-cta";
import { Reveal } from "@/components/reveal";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Matteo Trobbiani | Biologo nutrizionista",
  description:
    "Formazione, iscrizione professionale e approccio di Matteo Trobbiani, biologo nutrizionista e fondatore di TMFIT.",
};

export default function ChiSonoPage() {
  const credentials = siteConfig.credentials;

  return (
    <>
      <section className="bg-[#f2f0eb] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-end lg:gap-16">
            <Reveal>
              <div className="border-t border-black/20 pt-5">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">
                  Matteo Trobbiani · TMFIT
                </p>
                <h1 className="mt-6 max-w-5xl text-balance text-5xl font-semibold leading-[0.91] tracking-[-0.07em] text-[#0b0f14] sm:text-7xl lg:text-[6.6rem]">
                  Nutrizione e movimento, letti nello stesso quadro.
                </h1>
                <p className="mt-7 max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8">
                  Ho creato TMFIT per collegare valutazione nutrizionale, programmazione dell’allenamento, monitoraggio e strumenti digitali in un percorso unico, comprensibile e adattabile.
                </p>
                <ButtonLink href="/contatti" variant="dark" className="mt-8 w-fit">
                  Parliamo del tuo obiettivo <ArrowRight size={18} />
                </ButtonLink>
              </div>
            </Reveal>

            <Reveal className="relative min-h-[520px] overflow-hidden bg-[#d8d6d1] sm:min-h-[680px]" delay={100}>
              <Image
                src={siteConfig.portraitUrl}
                alt="Matteo Trobbiani"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover object-center grayscale"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-6 pt-24 text-white sm:p-9 sm:pt-32">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/62">
                  Biologo nutrizionista
                </p>
                <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                  Iscritto all’Ordine professionale <BadgeCheck size={18} />
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="grid gap-8 border-b border-black/20 pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">Formazione</p>
                <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-[#0b0f14] sm:text-6xl">
                  Competenze costruite tra nutrizione e scienze motorie.
                </h2>
              </div>
              <p className="max-w-2xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8 lg:ml-auto">
                Il percorso accademico ha approfondito il rapporto tra alimentazione, microbiota, movimento, composizione corporea e condizioni che influenzano la qualità di vita.
              </p>
            </div>
          </Reveal>

          <div className="mt-4 border-t border-black/20">
            {[
              {
                number: "01",
                icon: GraduationCap,
                title: credentials.masterDegree,
                text: credentials.masterThesis,
              },
              {
                number: "02",
                icon: BookOpen,
                title: credentials.bachelorDegree,
                text: credentials.bachelorThesis,
              },
              {
                number: "03",
                icon: ShieldCheck,
                title: credentials.register,
                text: credentials.vat,
              },
              {
                number: "04",
                icon: Microscope,
                title: "Approfondimenti professionali",
                text: "Microbiota intestinale, nutraceutica, biohacking applicabile, salute intestinale e integrazione tra nutrizione e movimento.",
              },
            ].map(({ number, icon: Icon, title, text }, index) => (
              <Reveal key={number} delay={index * 70}>
                <article className="grid gap-5 border-b border-black/20 py-7 sm:grid-cols-[52px_52px_1fr_0.8fr] sm:items-start sm:py-9">
                  <p className="text-[11px] font-black tracking-[0.2em] text-black/38">{number}</p>
                  <span className="grid size-11 place-items-center rounded-full border border-black/20 text-black/72">
                    <Icon size={19} />
                  </span>
                  <h3 className="text-xl font-semibold leading-7 tracking-[-0.035em] text-[#0b0f14] sm:text-2xl">
                    {title}
                  </h3>
                  <p className="text-sm font-medium leading-6 text-black/55 sm:text-base sm:leading-7">{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0b0f14] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16">
          <Reveal className="relative min-h-[460px] overflow-hidden sm:min-h-[620px]">
            <Image
              src={siteConfig.consultationUrl}
              alt="Consulenza TMFIT"
              fill
              sizes="(max-width: 1024px) 100vw, 56vw"
              className="object-cover grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </Reveal>

          <Reveal delay={100}>
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">Il modo di lavorare</p>
            <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
              Competenza, ascolto e dati devono lavorare insieme.
            </h2>
            <p className="mt-6 text-base font-medium leading-7 text-white/62 sm:text-lg sm:leading-8">
              Il piano non è il punto di arrivo della consulenza. È uno strumento iniziale che deve essere compreso, applicato, monitorato e modificato quando il contesto o la risposta della persona cambiano.
            </p>
            <div className="mt-9 border-t border-white/18">
              {[
                "Indicazioni spiegate, non soltanto consegnate.",
                "Priorità realistiche e progressivamente organizzate.",
                "Nutraceutica valutata senza protocolli universali.",
                "Biohacking inteso come uso pratico di abitudini e dati.",
                "Collaborazione con il medico quando l’inquadramento lo richiede.",
              ].map((item) => (
                <p key={item} className="border-b border-white/18 py-4 text-sm font-semibold leading-6 text-white/72">
                  {item}
                </p>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <ContactCta />
    </>
  );
}
