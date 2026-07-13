import { ArrowRight, MessageCircle } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { whatsappUrl } from "@/lib/site";

export function ContactCta() {
  return (
    <section className="bg-[#f2f0eb] px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl border-y border-black/20 py-10 sm:py-14 lg:grid lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-14">
        <div className="max-w-4xl">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-black/45">Il primo passo</p>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[0.94] tracking-[-0.06em] text-[#0b0f14] sm:text-6xl">
            Partiamo da ciò che sta accadendo adesso.
          </h2>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-black/60 sm:text-lg sm:leading-8">
            Raccontami il tuo obiettivo, il punto di partenza e le difficoltà che stai incontrando. Valuteremo quale percorso può essere realmente utile.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:justify-end">
          <ButtonLink href="/contatti" variant="dark">
            Richiedi una valutazione <ArrowRight size={18} />
          </ButtonLink>
          <ButtonLink href={whatsappUrl()} variant="outline" external>
            <MessageCircle size={18} /> WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
