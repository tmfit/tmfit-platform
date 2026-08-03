"use client";

import {
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  FileText,
  MessageSquareText
} from "lucide-react";

function StatusRow({ icon: Icon, title, value, detail, onClick, accent = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition active:scale-[.99]"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
          accent ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600"
        }`}
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-slate-950">{title}</span>
        {detail && (
          <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
            {detail}
          </span>
        )}
      </span>
      <span className={`shrink-0 text-xs font-black ${accent ? "text-teal-700" : "text-slate-600"}`}>
        {value}
      </span>
      <ChevronRight size={17} className="shrink-0 text-slate-300" />
    </button>
  );
}

export default function ClientHomePanel({
  firstName,
  nextWorkout,
  weekSelection,
  checkinStatus,
  dietStatus,
  latestMessage,
  weeklySummary
}) {
  const completed = Number(weeklySummary?.completedWorkouts || 0);
  const planned = Number(weeklySummary?.plannedWorkouts || 0);
  const workoutProgress = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[2rem] bg-[#07111f] text-white shadow-xl">
        <div className="p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-teal-300">
            Il tuo prossimo passo
          </p>

          <div className="mt-5 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-slate-950">
              <Dumbbell size={25} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-300">
                {nextWorkout?.statusLabel || (nextWorkout?.available ? "Allenamento programmato" : `Ciao ${firstName || ""}`.trim())}
              </p>
              <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight">
                {nextWorkout?.title || "Nessun allenamento disponibile"}
              </h1>
              {nextWorkout?.minutes && (
                <p className="mt-2 text-sm font-bold text-slate-300">
                  {nextWorkout.minutes} minuti · Settimana {nextWorkout.week}
                </p>
              )}
              {nextWorkout?.planTitle && (
                <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                  {nextWorkout.planTitle}
                </p>
              )}
            </div>
          </div>

          {weekSelection?.options?.length > 1 && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                  Scegli la settimana
                </p>
                <p className="text-xs font-black text-teal-300">
                  Progressione {weekSelection.value}
                </p>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {weekSelection.options.map((weekNumber) => (
                  <button
                    key={weekNumber}
                    type="button"
                    onClick={() => weekSelection.onChange?.(weekNumber)}
                    className={`min-h-10 rounded-xl text-sm font-black transition active:scale-[.97] ${
                      Number(weekSelection.value) === Number(weekNumber)
                        ? "bg-teal-300 text-slate-950"
                        : "bg-white/10 text-white"
                    }`}
                    aria-pressed={Number(weekSelection.value) === Number(weekNumber)}
                  >
                    {weekNumber}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={!nextWorkout?.onStart}
            onClick={nextWorkout?.onStart}
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-300 px-4 py-3 text-base font-black text-slate-950 transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Dumbbell size={18} className="mr-2" />
            {nextWorkout?.actionLabel || (nextWorkout?.available ? "Inizia allenamento" : "Apri la scheda")}
          </button>
        </div>
      </section>

      <section className="space-y-2">
        <StatusRow
          icon={ClipboardCheck}
          title="Check-in"
          value={checkinStatus?.label || "Da verificare"}
          detail={checkinStatus?.detail}
          onClick={checkinStatus?.onClick}
          accent={Boolean(checkinStatus?.completed)}
        />
        <StatusRow
          icon={FileText}
          title="Dieta"
          value={dietStatus?.label || "Non disponibile"}
          detail={dietStatus?.detail}
          onClick={dietStatus?.onClick}
          accent={Boolean(dietStatus?.active)}
        />
        <StatusRow
          icon={MessageSquareText}
          title="Ultimo messaggio del coach"
          value={latestMessage?.unread ? "Nuovo" : latestMessage?.label || "Apri"}
          detail={latestMessage?.title || "Nessun messaggio"}
          onClick={latestMessage?.onClick}
          accent={Boolean(latestMessage?.unread)}
        />
      </section>

      <section className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
              Questa settimana
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">Riepilogo</h2>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <CheckCircle2 size={20} />
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-slate-600">Allenamenti</span>
              <span className="font-black text-slate-950">{completed}/{planned || "—"}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-400 transition-all"
                style={{ width: `${workoutProgress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Check-in</p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {weeklySummary?.checkinCompleted ? "Completato" : "Da compilare"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aderenza</p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {weeklySummary?.adherencePercent == null
                  ? "—"
                  : `${weeklySummary.adherencePercent}%`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
