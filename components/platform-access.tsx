import {
  ArrowRight,
  CalendarCheck2,
  ChartNoAxesCombined,
  Check,
  Dumbbell,
  LockKeyhole,
  Utensils,
} from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { PlatformPreview } from "@/components/platform-preview";
import { siteConfig } from "@/lib/site";

const features = [
  { label: "Piano alimentare", icon: Utensils },
  { label: "Schede allenamento", icon: Dumbbell },
  { label: "Check-in", icon: CalendarCheck2 },
  { label: "Progressi", icon: ChartNoAxesCombined },
];

export function PlatformAccess() {
  const external = siteConfig.appUrl.startsWith("http");

  return (
    <section
      id="tmfit-platform"
      className="relative overflow-hidden bg-[#0b0f14] px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8 lg:py-32"
    >
      <div className="platform-grid pointer-events-none absolute inset-0 opacity-35" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/18 pb-12 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.23em] text-white/48">
              <LockKeyhole size={13} /> Area riservata
            </div>
            <p className="mt-5 text-sm font-semibold text-[#b9e3da]">TMFIT Platform</p>
          </div>
          <h2 className="max-w-5xl text-balance text-4xl font-semibold leading-[0.92] tracking-[-0.065em] sm:text-6xl lg:text-7xl">
            Il percorso continua anche fuori dallo studio.
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div>
            <p className="max-w-xl text-base font-medium leading-7 text-white/64 sm:text-lg sm:leading-8">
              Dieta, allenamenti, check-in, progressi e strumenti operativi sono raccolti in un’unica area personale, progettata per rendere il lavoro più chiaro e continuo.
            </p>

            <div className="mt-9 border-t border-white/18">
              {features.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center justify-between border-b border-white/18 py-4"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold text-white/78">
                    <Icon size={17} className="text-[#b9e3da]" /> {label}
                  </span>
                  <span className="text-white/32">↗</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={siteConfig.appUrl} variant="teal" external={external}>
                Accedi alla piattaforma <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink href="/contatti" variant="darkOutline">
                Richiedi informazioni
              </ButtonLink>
            </div>

            <p className="mt-6 flex items-center gap-3 text-xs font-bold text-white/42">
              <span className="grid size-6 place-items-center rounded-full border border-white/20 text-[#b9e3da]">
                <Check size={12} strokeWidth={3} />
              </span>
              Accesso protetto e riservato ai clienti con percorso attivo.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[760px]">
            <div className="absolute -left-4 top-16 z-20 hidden border border-white/20 bg-[#0b0f14]/85 px-4 py-3 backdrop-blur-lg sm:block">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/42">Design</p>
              <p className="mt-1 text-sm font-semibold">Mobile-first</p>
            </div>
            <PlatformPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
