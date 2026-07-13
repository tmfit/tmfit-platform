import { Activity, Apple, CalendarCheck2, ChartNoAxesCombined, Dumbbell, MessageSquareText } from "lucide-react";

export function PlatformPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <div className="absolute -left-6 top-16 hidden w-44 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:block">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-teal-300 text-[#07111f]">
            <ChartNoAxesCombined size={20} />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-400">Progressi</p>
            <p className="text-sm font-black text-white">Sempre visibili</p>
          </div>
        </div>
      </div>

      <div className="absolute -right-4 bottom-20 z-20 hidden w-44 rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:block">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-white text-[#07111f]">
            <MessageSquareText size={20} />
          </span>
          <div>
            <p className="text-xs font-bold text-slate-400">Check-in</p>
            <p className="text-sm font-black text-white">Più chiari</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-[285px] rounded-[2.7rem] border-[9px] border-[#101c2c] bg-[#f5f7fb] p-2 shadow-[0_40px_80px_rgba(0,0,0,0.42)] sm:w-[320px]">
        <div className="overflow-hidden rounded-[2rem] bg-[#f5f7fb]">
          <div className="bg-[#07111f] px-5 pb-5 pt-6 text-white">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-teal-300">Benvenuto</p>
            <p className="mt-1 text-xl font-black tracking-tight">Il tuo percorso</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400">Questa settimana</p>
                  <p className="mt-1 text-sm font-black">Continuità 86%</p>
                </div>
                <Activity className="text-teal-300" size={22} />
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10">
                <div className="h-full w-[86%] rounded-full bg-teal-300" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4">
            {[
              { label: "Dieta", icon: Apple, detail: "Piano attivo" },
              { label: "Allenati", icon: Dumbbell, detail: "3 sessioni" },
              { label: "Check-in", icon: CalendarCheck2, detail: "Da compilare" },
              { label: "Progressi", icon: ChartNoAxesCombined, detail: "Aggiornati" },
            ].map(({ label, icon: Icon, detail }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-[#07111f]">
                  <Icon size={18} />
                </span>
                <p className="mt-3 text-sm font-black text-[#07111f]">{label}</p>
                <p className="mt-0.5 text-[10px] font-bold text-slate-400">{detail}</p>
              </div>
            ))}
          </div>

          <div className="mx-4 mb-5 rounded-2xl bg-[#07111f] p-4 text-white">
            <p className="text-[10px] font-bold text-teal-300">PROSSIMO PASSO</p>
            <p className="mt-1 text-sm font-black">Completa il check-in settimanale</p>
          </div>
        </div>
      </div>
    </div>
  );
}
