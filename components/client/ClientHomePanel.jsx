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
      <span
        className={`shrink-0 text-xs font-black ${
          accent ? "text-teal-700" : "text-slate-600"
        }`}
      >
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
  const workoutProgress =
    planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[1.75rem] bg-[#07111f] text-white shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-300">
                Il tuo prossimo passo
              </p>
              <h1 className="mt-1.5 truncate text-2xl font-black leading-tight tracking-tight">
                {nextWorkout?.title || "Nessun allenamento disponibile"}
              </h1>
              <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-slate-300">
                {nextWorkout?.minutes && <span>{nextWorkout.minutes} min</span>}
                {nextWorkout?.minutes && nextWorkout?.week && (
                  <span className="text-slate-600">•</span>
                )}
                {nextWorkout?.week && <span>Settimana {nextWorkout.week}</span>}
                {nextWorkout?.planTitle && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="min-w-0 truncate">{nextWorkout.planTitle}</span>
                  </>
                )}
              </div>
            </div>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-300 text-slate-950">
              <Dumbbell size={19} />
            </span>
          </div>

          {weekSelection?.options?.length > 1 && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-2">
              <span className="shrink-0 pl-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-300">
                Settimana
              </span>
              <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5">
                {weekSelection.options.map((weekNumber) => (
                  <button
                    key={weekNumber}
                    type="button"
                    onClick={() => weekSelection.onChange?.(weekNumber)}
                    className={`min-h-9 rounded-xl border text-sm font-black transition active:scale-[.97] ${
                      Number(weekSelection.value) === Number(weekNumber)
                        ? "border-teal-300 bg-teal-300 text-slate-950"
                        : "border-white/10 bg-white/[0.06] text-white"
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
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-2xl bg-teal-300 px-4 py-2.5 text-sm font-black text-slate-950 transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Dumbbell size={17} className="mr-2" />
            {nextWorkout?.actionLabel ||
              (nextWorkout?.available ? "Inizia allenamento" : "Apri la scheda")}
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
              <span className="font-black text-slate-950">
                {completed}/{planned || "—"}
              </span>
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
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Check-in
              </p>
              <p className="mt-1 text-sm font-black text-slate-950">
                {weeklySummary?.checkinCompleted ? "Completato" : "Da compilare"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Aderenza
              </p>
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
