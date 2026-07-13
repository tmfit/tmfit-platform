import type { Metadata } from "next";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { siteConfig, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contatti",
  description:
    "Contatta TMFIT e richiedi una valutazione iniziale per individuare il percorso più adatto.",
};

export default function ContattiPage() {
  return (
    <>
      <section className="bg-[#f2f0eb] px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl border-t border-black/20 pt-6">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/48">Contatti</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <h1 className="max-w-6xl text-balance text-5xl font-semibold leading-[0.9] tracking-[-0.07em] text-[#0b0f14] sm:text-7xl lg:text-[7rem]">
              Raccontami il tuo punto di partenza.
            </h1>
            <p className="max-w-xl text-base font-medium leading-7 text-black/62 sm:text-lg sm:leading-8 lg:ml-auto">
              Non devi scegliere subito un pacchetto. Il primo confronto serve a capire obiettivo, situazione attuale e modalità più sensata per iniziare.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
          <div className="border-t border-black/20">
            {[
              { label: "WhatsApp", value: siteConfig.phoneDisplay, href: whatsappUrl(), icon: MessageCircle },
              { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}`, icon: Mail },
              { label: "Telefono", value: siteConfig.phoneDisplay, href: `tel:${siteConfig.phoneHref}`, icon: Phone },
            ].map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className="group grid grid-cols-[44px_1fr_30px] items-center gap-4 border-b border-black/20 py-6"
              >
                <span className="grid size-10 place-items-center rounded-full border border-black/20"><Icon size={18} /></span>
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-black/38">{label}</span>
                  <span className="mt-1 block text-base font-semibold text-[#0b0f14]">{value}</span>
                </span>
                <ArrowUpRight size={17} className="transition group-hover:rotate-45" />
              </a>
            ))}
          </div>

          <div className="bg-[#0b0f14] p-7 text-white sm:p-10 lg:p-14">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/42">Richiesta di valutazione</p>
            <h2 className="mt-5 text-balance text-4xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-6xl">
              Il questionario rende il primo confronto più concreto.
            </h2>
            <p className="mt-6 max-w-2xl text-base font-medium leading-7 text-white/62 sm:text-lg sm:leading-8">
              Compilalo con calma. Le risposte servono a comprendere obiettivi, storia, abitudini e difficoltà prima di proporre una modalità di lavoro.
            </p>
            <div className="mt-9 border-t border-white/18">
              {[
                "Obiettivo e situazione attuale",
                "Abitudini alimentari e allenamento",
                "Disponibilità e organizzazione quotidiana",
                "Informazioni utili al primo inquadramento",
              ].map((item) => (
                <p key={item} className="border-b border-white/18 py-4 text-sm font-semibold text-white/68">{item}</p>
              ))}
            </div>
            <ButtonLink href={siteConfig.questionnaireUrl} external variant="teal" className="mt-8">
              Compila il questionario <ArrowUpRight size={18} />
            </ButtonLink>
            <p className="mt-5 text-xs font-medium leading-5 text-white/35">
              La compilazione non comporta l’acquisto automatico di alcun servizio.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
