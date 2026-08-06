"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
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
  workouts,
  initialWorkoutId,
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

  const workoutSlides =
    Array.isArray(workouts) && workouts.length > 0
      ? workouts
      : nextWorkout
      ? [nextWorkout]
      : [];

  const [activeWorkoutIndex, setActiveWorkoutIndex] = useState(0);
  const workoutSignature = workoutSlides
    .map((workout, index) => String(workout?.id || workout?.title || index))
    .join("|");

  useEffect(() => {
    const requestedIndex = workoutSlides.findIndex(
      (workout) => String(workout?.id) === String(initialWorkoutId)
    );
    setActiveWorkoutIndex(requestedIndex >= 0 ? requestedIndex : 0);
  }, [workoutSignature, initialWorkoutId, weekSelection?.value]);

  function moveToWorkout(direction) {
    setActiveWorkoutIndex((currentIndex) =>
      Math.max(
        0,
        Math.min(currentIndex + direction, workoutSlides.length - 1)
      )
    );
  }

  const activeWorkout = workoutSlides[activeWorkoutIndex] || nextWorkout || null;

  return (
    <div className="space-y-4">
      <section
        className="overflow-hidden border border-white/10 bg-[#07111f] text-white shadow-lg"
        style={{ borderRadius: "2rem" }}
      >
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-300">
              Il tuo prossimo passo
            </p>
            {workoutSlides.length > 1 && (
              <span className="rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 text-[10px] font-black text-slate-200">
                {activeWorkoutIndex + 1}/{workoutSlides.length}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-stretch gap-2" aria-live="polite">
            {workoutSlides.length > 1 && (
              <button
                type="button"
                onClick={() => moveToWorkout(-1)}
                disabled={activeWorkoutIndex === 0}
                className="flex w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white transition active:scale-[.96] disabled:cursor-not-allowed disabled:opacity-25"
                aria-label="Allenamento precedente"
              >
                <ChevronLeft size={22} />
              </button>
            )}

            <div className="min-w-0 flex-1 rounded-[1.45rem] border border-white/10 bg-white/[0.04] px-3 py-3">
              <div className="flex min-h-[82px] items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="truncate text-2xl font-black leading-tight tracking-tight">
                      {activeWorkout?.title || "Nessun allenamento disponibile"}
                    </h1>
                    {activeWorkout?.completed && (
                      <span className="rounded-full bg-teal-300/15 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-teal-200">
                        Completato
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-bold text-slate-300">
                    {activeWorkout?.minutes && <span>{activeWorkout.minutes} min</span>}
                    {activeWorkout?.minutes && activeWorkout?.week && (
                      <span className="text-slate-600">•</span>
                    )}
                    {activeWorkout?.week && <span>Settimana {activeWorkout.week}</span>}
                    {activeWorkout?.planTitle && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="min-w-0 truncate">{activeWorkout.planTitle}</span>
                      </>
                    )}
                  </div>
                </div>

                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-slate-950">
                  <Dumbbell size={19} />
                </span>
              </div>
            </div>

            {workoutSlides.length > 1 && (
              <button
                type="button"
                onClick={() => moveToWorkout(1)}
                disabled={activeWorkoutIndex === workoutSlides.length - 1}
                className="flex w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white transition active:scale-[.96] disabled:cursor-not-allowed disabled:opacity-25"
                aria-label="Allenamento successivo"
              >
                <ChevronRight size={22} />
              </button>
            )}
          </div>

          {workoutSlides.length > 1 && (
            <div className="mt-2 flex items-center justify-center gap-2" aria-label="Posizione allenamento">
              {workoutSlides.map((workout, index) => (
                <span
                  key={`dot-${workout?.id || index}`}
                  className={`h-2 rounded-full transition-all ${
                    activeWorkoutIndex === index ? "w-7 bg-teal-300" : "w-2 bg-white/25"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}

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
            disabled={!activeWorkout?.onStart}
            onClick={activeWorkout?.onStart}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-2xl bg-teal-300 px-4 py-2.5 text-sm font-black text-slate-950 transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Dumbbell size={17} className="mr-2" />
            {activeWorkout?.actionLabel ||
              (activeWorkout?.available ? "Inizia allenamento" : "Apri la scheda")}
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
