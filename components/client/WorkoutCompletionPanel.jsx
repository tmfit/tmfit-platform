"use client";

import { Check, Clock3, Dumbbell, ListChecks } from "lucide-react";

export default function WorkoutCompletionPanel({
  completedCount,
  totalPlannedSets,
  exerciseCount,
  durationLabel,
  feedback,
  setFeedback,
  onConfirm,
  busy
}) {
  const complete = completedCount >= totalPlannedSets;

  function update(field, value) {
    setFeedback((previous) => ({ ...previous, [field]: value }));
  }

  return (
    <div className="space-y-4 pb-36">
      <section className="rounded-[1.8rem] bg-[#07111f] p-5 text-center text-white shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-300 text-slate-950">
          <Check size={28} />
        </div>
        <h3 className="mt-4 text-2xl font-black">Allenamento completato</h3>
        <p className="mt-2 text-sm font-semibold text-slate-300">
          {complete
            ? "Hai completato tutte le serie programmate."
            : `Hai completato ${completedCount} serie su ${totalPlannedSets}.`}
        </p>
      </section>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <Clock3 size={18} className="mx-auto text-teal-700" />
          <p className="mt-2 text-lg font-black text-slate-950">{durationLabel}</p>
          <p className="text-[10px] font-black uppercase text-slate-400">Durata</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <ListChecks size={18} className="mx-auto text-teal-700" />
          <p className="mt-2 text-lg font-black text-slate-950">{completedCount}/{totalPlannedSets}</p>
          <p className="text-[10px] font-black uppercase text-slate-400">Serie</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
          <Dumbbell size={18} className="mx-auto text-teal-700" />
          <p className="mt-2 text-lg font-black text-slate-950">{exerciseCount}</p>
          <p className="text-[10px] font-black uppercase text-slate-400">Esercizi</p>
        </div>
      </div>

      <section className="space-y-5 rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-sm font-black text-slate-800">RPE della sessione</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Quanto è stato impegnativo l’allenamento nel complesso?</p>
          <div className="mt-3 grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }, (_, index) => {
              const value = String(index + 1);
              const selected = String(feedback.session_rpe || "") === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => update("session_rpe", value)}
                  className={`h-10 rounded-xl text-sm font-black ${
                    selected
                      ? "bg-[#07111f] text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-black text-slate-800">Come ti sei sentito?</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[
              ["ottime", "Molto bene"],
              ["buone", "Bene"],
              ["normali", "Normale"],
              ["scarse", "Male"]
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => update("feeling", value)}
                className={`min-h-11 rounded-2xl px-3 text-sm font-black ${
                  feedback.feeling === value
                    ? "bg-teal-300 text-slate-950"
                    : "border border-slate-200 bg-slate-50 text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-black text-slate-800">Note per il coach</span>
          <textarea
            value={feedback.notes || ""}
            onChange={(event) => update("notes", event.target.value)}
            placeholder="Carichi, fastidi, esercizi difficili o sensazioni utili..."
            className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900"
          />
        </label>
      </section>

      <button
        type="button"
        onClick={onConfirm}
        disabled={busy}
        className="w-full rounded-2xl bg-[#07111f] px-4 py-4 text-base font-black text-white shadow-sm disabled:opacity-50"
      >
        {busy ? "Salvataggio riepilogo..." : "Salva e termina"}
      </button>
    </div>
  );
}
