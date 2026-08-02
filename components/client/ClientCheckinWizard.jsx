"use client";

import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const STEPS = [
  "Peso e misure",
  "Energia, sonno e stress",
  "Alimentazione e allenamento",
  "Note e invio"
];

function PreviousValue({ value, suffix = "" }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <p className="mt-1 text-xs font-semibold text-slate-400">
      Ultimo valore: {value}{suffix}
    </p>
  );
}

function ScaleField({ title, field, value, previous, onChange }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-black text-slate-800">{title}</p>
        <PreviousValue value={previous} suffix="/10" />
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1.5 rounded-2xl bg-slate-50 p-1.5">
        {Array.from({ length: 10 }, (_, index) => {
          const option = String(index + 1);
          const selected = String(value || "") === option;
          return (
            <button
              key={`${field}-${option}`}
              type="button"
              onClick={() => onChange(field, option)}
              className={`h-10 rounded-xl text-sm font-black transition active:scale-[.96] ${
                selected
                  ? "bg-[#07111f] text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoiceField({ title, field, value, onChange }) {
  const options = [
    ["no", "No"],
    ["qualche_volta", "Qualche volta"],
    ["si", "Sì"]
  ];

  return (
    <div>
      <p className="text-sm font-black text-slate-800">{title}</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {options.map(([option, label]) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(field, option)}
            className={`min-h-11 rounded-2xl px-2 text-xs font-black transition active:scale-[.97] ${
              value === option
                ? "bg-[#07111f] text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ClientCheckinWizard({
  form,
  setForm,
  latestCheckin,
  onSubmit,
  draftKey
}) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (!draftKey || typeof window === "undefined") {
      setRestored(true);
      return;
    }

    try {
      const raw = window.localStorage.getItem(draftKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.form) setForm((previous) => ({ ...previous, ...saved.form }));
        if (Number.isInteger(saved?.step)) setStep(Math.max(0, Math.min(3, saved.step)));
      }
    } catch (error) {
      console.warn("TMFIT ripristino bozza check-in non riuscito", error?.message || error);
    } finally {
      setRestored(true);
    }
  }, [draftKey, setForm]);

  useEffect(() => {
    if (!restored || !draftKey || typeof window === "undefined") return;

    const timeout = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({ form, step, updatedAt: new Date().toISOString() })
        );
      } catch (error) {
        console.warn("TMFIT salvataggio bozza check-in non riuscito", error?.message || error);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [form, step, draftKey, restored]);

  const progress = ((step + 1) / STEPS.length) * 100;
  const reviewItems = useMemo(
    () => [
      ["Peso", form.weight_kg ? `${form.weight_kg} kg` : "—"],
      ["Energia", form.energy_level ? `${form.energy_level}/10` : "—"],
      ["Sonno", form.sleep_quality ? `${form.sleep_quality}/10` : "—"],
      ["Stress", form.stress_level ? `${form.stress_level}/10` : "—"],
      ["Aderenza dieta", form.diet_adherence ? `${form.diet_adherence}/10` : "—"],
      ["Aderenza allenamento", form.training_adherence ? `${form.training_adherence}/10` : "—"]
    ],
    [form]
  );

  function update(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function submit() {
    if (saving) return;
    setSaving(true);
    const saved = await onSubmit?.();
    setSaving(false);

    if (saved) {
      if (draftKey && typeof window !== "undefined") {
        window.localStorage.removeItem(draftKey);
      }
      setStep(0);
    }
  }

  return (
    <section className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
              Check-in settimanale
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">{STEPS[step]}</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">Circa 2 minuti · salvataggio automatico</p>
          </div>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
            {step + 1}/{STEPS.length}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-5 p-5">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-black text-slate-800">Data</span>
              <input
                type="date"
                value={form.checkin_date || ""}
                onChange={(event) => update("checkin_date", event.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900"
              />
            </label>

            <label className="block">
              <span className="text-sm font-black text-slate-800">Peso</span>
              <input
                type="number"
                inputMode="decimal"
                value={form.weight_kg || ""}
                onChange={(event) => update("weight_kg", event.target.value)}
                placeholder="kg"
                className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900"
              />
              <PreviousValue value={latestCheckin?.weight_kg} suffix=" kg" />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-black text-slate-800">Acqua</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.water_liters || ""}
                  onChange={(event) => update("water_liters", event.target.value)}
                  placeholder="litri"
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900"
                />
                <PreviousValue value={latestCheckin?.water_liters} suffix=" L" />
              </label>
              <label className="block">
                <span className="text-sm font-black text-slate-800">Passi</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={form.steps || ""}
                  onChange={(event) => update("steps", event.target.value)}
                  placeholder="passi"
                  className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-bold text-slate-900"
                />
                <PreviousValue value={latestCheckin?.steps} />
              </label>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <ScaleField title="Energia" field="energy_level" value={form.energy_level} previous={latestCheckin?.energy_level} onChange={update} />
            <ScaleField title="Qualità del sonno" field="sleep_quality" value={form.sleep_quality} previous={latestCheckin?.sleep_quality} onChange={update} />
            <ScaleField title="Stress" field="stress_level" value={form.stress_level} previous={latestCheckin?.stress_level} onChange={update} />
            <ScaleField title="Fame" field="hunger_level" value={form.hunger_level} previous={latestCheckin?.hunger_level} onChange={update} />
            <ScaleField title="Digestione" field="digestion_level" value={form.digestion_level} previous={latestCheckin?.digestion_level} onChange={update} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <ScaleField title="Aderenza alla dieta" field="diet_adherence" value={form.diet_adherence} previous={latestCheckin?.diet_adherence} onChange={update} />
            <ChoiceField title="Hai avuto difficoltà con la dieta?" field="diet_difficulty" value={form.diet_difficulty} onChange={update} />
            {form.diet_difficulty && form.diet_difficulty !== "no" && (
              <label className="block">
                <span className="text-sm font-black text-slate-800">Raccontami cosa è successo</span>
                <textarea
                  value={form.diet_difficulty_notes || ""}
                  onChange={(event) => update("diet_difficulty_notes", event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900"
                />
              </label>
            )}

            <ScaleField title="Aderenza all’allenamento" field="training_adherence" value={form.training_adherence} previous={latestCheckin?.training_adherence} onChange={update} />
            <ChoiceField title="Hai avuto difficoltà con gli allenamenti?" field="training_difficulty" value={form.training_difficulty} onChange={update} />
            {form.training_difficulty && form.training_difficulty !== "no" && (
              <label className="block">
                <span className="text-sm font-black text-slate-800">Descrivi la difficoltà</span>
                <textarea
                  value={form.training_difficulty_notes || ""}
                  onChange={(event) => update("training_difficulty_notes", event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900"
                />
              </label>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {reviewItems.map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>

            <label className="block">
              <span className="text-sm font-black text-slate-800">Note per il coach</span>
              <textarea
                value={form.notes || ""}
                onChange={(event) => update("notes", event.target.value)}
                placeholder="Sensazioni, dubbi, eventi della settimana..."
                className="mt-2 min-h-32 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900"
              />
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-200 bg-slate-50 p-4">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || saving}
          className="flex min-h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 disabled:opacity-40"
        >
          <ChevronLeft size={17} className="mr-1" />
          Indietro
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(STEPS.length - 1, current + 1))}
            className="flex min-h-12 items-center justify-center rounded-2xl bg-[#07111f] px-4 text-sm font-black text-white"
          >
            Continua
            <ChevronRight size={17} className="ml-1" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex min-h-12 items-center justify-center rounded-2xl bg-teal-300 px-4 text-sm font-black text-slate-950 disabled:opacity-50"
          >
            {saving ? <Save size={17} className="mr-2 animate-pulse" /> : <Check size={17} className="mr-2" />}
            {saving ? "Invio..." : "Invia check-in"}
          </button>
        )}
      </div>
    </section>
  );
}
