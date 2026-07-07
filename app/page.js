"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  Camera,
  Check,
  ClipboardCheck,
  Dumbbell,
  FileText,
  HomeIcon,
  Link as LinkIcon,
  LogOut,
  Megaphone,
  Plus,
  Save,
  Search,
  Scale,
  Timer,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const LEGAL_VERSION = "tmfit-v1.0";
const APP_VERSION = "v4.9";
const APP_VERSION_LABEL = "TMFIT Pro v4.9";
const LEGAL_DOCUMENTS = {
  terms: {
    title: "Termini e condizioni",
    label: "Termini",
    eyebrow: "Utilizzo piattaforma",
    text: [
      "La piattaforma TM FIT è uno strumento digitale riservato alla gestione del percorso di coaching, allenamento, alimentazione e monitoraggio dei progressi.",
      "L’utente si impegna a utilizzare la piattaforma in modo corretto, a non condividere le proprie credenziali e a comunicare dati veritieri e aggiornati.",
      "La piattaforma non sostituisce il parere medico, una diagnosi clinica o una prescrizione sanitaria. In presenza di patologie, sintomi o condizioni particolari è necessario rivolgersi al proprio medico."
    ]
  },
  privacy: {
    title: "Privacy policy",
    label: "Privacy",
    eyebrow: "Dati personali",
    text: [
      "I dati personali inseriti nella piattaforma vengono trattati per consentire la gestione del percorso di coaching, la comunicazione tra professionista e cliente e il monitoraggio dei risultati.",
      "I dati possono includere informazioni anagrafiche, contatti, check-in, misurazioni, fotografie di progresso, dati relativi ad allenamento e alimentazione.",
      "I dati sono utilizzati esclusivamente per le finalità connesse al servizio TM FIT e non vengono ceduti a terzi per finalità commerciali."
    ]
  },
  consent: {
    title: "Consenso trattamento dati coaching",
    label: "Consenso coaching",
    eyebrow: "Allenamento · dieta · progressi",
    text: [
      "L’utente autorizza il trattamento dei dati necessari alla gestione del proprio percorso personalizzato.",
      "Il consenso riguarda dati utili alla valutazione dei progressi, alla programmazione dell’allenamento, alla gestione dell’alimentazione, dei check-in e delle comunicazioni interne.",
      "Il consenso può essere revocato secondo le modalità previste dall’informativa privacy, fermo restando che alcuni dati potrebbero essere necessari per erogare correttamente il servizio."
    ]
  }
};
const today = () => new Date().toISOString().slice(0, 10);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function fullName(client) {
  return `${client?.first_name || ""} ${client?.last_name || ""}`.trim() || "Cliente";
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function sortByOrder(items = [], field = "sort_order") {
  return [...items].sort((a, b) => {
    const left = a?.[field] ?? 999;
    const right = b?.[field] ?? 999;
    return left - right;
  });
}

function normalizePlans(plans = []) {
  return plans.map((plan) => ({
    ...plan,
    workout_weeks: sortByOrder(plan.workout_weeks || [], "week_number").map(
      (week) => ({
        ...week,
        workout_days: sortByOrder(week.workout_days || []).map((day) => ({
          ...day,
          workout_blocks: sortByOrder(day.workout_blocks || []).map((block) => ({
            ...block,
            workout_exercises: sortByOrder(block.workout_exercises || []).map(
              (exercise) => ({
                ...exercise,
                workout_exercise_sets: sortByOrder(
                  exercise.workout_exercise_sets || [],
                  "set_number"
                ),
                workout_exercise_progressions: sortByOrder(
                  exercise.workout_exercise_progressions || [],
                  "week_number"
                )
              })
            )
          }))
        }))
      })
    )
  }));
}

function usePersistedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;
    return window.localStorage.getItem(key) || initialValue;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, value || "");
    }
  }, [key, value]);

  return [value, setValue];
}

function Button({ children, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-[1.6rem] border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-300 ${className}`}
    />
  );
}
function BuilderCellInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`h-10 w-full min-w-[72px] rounded-xl border border-slate-200 bg-white px-2 text-center text-sm font-black text-slate-950 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100 ${className}`}
    />
  );
}
function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-300 ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-300 ${className}`}
    >
      {children}
    </select>
  );
}

function Label({ title, children, className = "", labelClassName = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className={`mb-1 block text-xs font-black uppercase tracking-wider text-slate-400 ${labelClassName}`}>
        {title}
      </span>
      {children}
    </label>
  );
}

function Empty({ title, text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <p className="font-black text-slate-800">{title}</p>
      {text && (
        <p className="mt-1 text-sm font-semibold text-slate-500">{text}</p>
      )}
    </div>
  );
}

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}
    >
      {children}
    </span>
  );
}
function BrandLogo({
  className = "",
  white = true,
  compact = false,
  size = "default"
}) {
  let sizeClass = "h-14 md:h-16";

  if (compact) {
    sizeClass = "h-9 md:h-10";
  }

  if (size === "login") {
    sizeClass = "h-28 md:h-36";
  }

  return (
    <img
      src="/tmfit-logo.png"
      alt="TM FIT"
      className={`${sizeClass} w-auto object-contain ${
        white ? "brightness-0 invert" : ""
      } ${className}`}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}
function AppFooter({ role = "coach" }) {
  return (
    <footer className="mt-8 border-t border-white/10 bg-[#07111f] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 pb-32 md:flex-row md:items-center md:justify-between md:px-6 md:pb-7">
        <div>
          <p className="text-sm font-black tracking-wide">
            TM FIT Coaching Platform
          </p>

          <p className="mt-1 text-xs font-semibold text-slate-400">
            Allenamento · nutrizione · monitoraggio · progressi
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Pill className="bg-white/10 text-white">
            {role === "coach" ? "Area professionista" : "Area cliente"}
          </Pill>

          <Pill className="bg-teal-300 text-slate-950">
            Webapp privata
          </Pill>

          <Pill className="bg-white/10 text-white">
  {APP_VERSION}
</Pill>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
          <button type="button" className="hover:text-white">
            Termini
          </button>

          <button type="button" className="hover:text-white">
            Privacy
          </button>

          <button type="button" className="hover:text-white">
            Assistenza
          </button>
        </div>
      </div>
    </footer>
  );
}function LegalDrawerSection({ userProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [openLegal, setOpenLegal] = useState(null);

  const legalItems = [
    {
      key: "terms",
      label: "Termini",
      accepted:
        userProfile?.terms_version === LEGAL_VERSION &&
        Boolean(userProfile?.terms_accepted_at),
      date: userProfile?.terms_accepted_at
    },
    {
      key: "privacy",
      label: "Privacy",
      accepted:
        userProfile?.privacy_version === LEGAL_VERSION &&
        Boolean(userProfile?.privacy_accepted_at),
      date: userProfile?.privacy_accepted_at
    },
    {
      key: "consent",
      label: "Consenso coaching",
      accepted:
        userProfile?.coaching_consent_version === LEGAL_VERSION &&
        Boolean(userProfile?.coaching_consent_accepted_at),
      date: userProfile?.coaching_consent_accepted_at
    }
  ];

  const acceptedCount = legalItems.filter((item) => item.accepted).length;

  function formatDate(value) {
    if (!value) return "";

    try {
      return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }).format(new Date(value));
    } catch {
      return "";
    }
  }

  return (
    <>
      <div className="mb-3 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-300">
              Documenti legali
            </p>

            <p className="mt-1 text-xs font-bold text-slate-400">
              Termini, Privacy e consenso coaching
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-black ${
                acceptedCount === 3
                  ? "bg-teal-300 text-slate-950"
                  : "bg-white/10 text-white"
              }`}
            >
              {acceptedCount}/3
            </span>

            <span className="text-lg font-black text-white">
              {expanded ? "−" : "+"}
            </span>
          </div>
        </button>

        {expanded && (
          <div className="border-t border-white/10 px-4 pb-4 pt-3">
            <div className="space-y-2">
              {legalItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
                        item.accepted
                          ? "bg-teal-300 text-slate-950"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {item.accepted ? "✓" : "!"}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-white">
                        {item.label}
                      </p>

                      <p
                        className={`mt-0.5 text-[11px] font-bold ${
                          item.accepted ? "text-teal-300" : "text-slate-400"
                        }`}
                      >
                        {item.accepted
                          ? `Accettato ${formatDate(item.date)}`
                          : "Non accettato"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpenLegal(item.key)}
                    className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-black text-teal-300 transition hover:bg-white/15"
                  >
                    Leggi
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LegalDocumentModal
        documentKey={openLegal}
        onClose={() => setOpenLegal(null)}
      />
    </>
  );
}
function SideDrawer({
  open,
  onClose,
  tabs,
  active,
  onChange,
  role = "coach",
  onLogout,
  userProfile,
  side = "left"
}) {
  const drawerSideClass = side === "right" ? "right-0" : "left-0";
  const drawerClosedClass = side === "right" ? "translate-x-full" : "-translate-x-full";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Chiudi menu"
          onClick={onClose}
          className="fixed inset-0 z-[70] bg-slate-950/50 backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed bottom-0 top-0 z-[80] w-[86%] max-w-sm transform bg-[#07111f] text-white shadow-2xl transition md:w-96 ${drawerSideClass} ${
          open ? "translate-x-0" : drawerClosedClass
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 p-5 tmfit-safe-drawer">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
                  Menu
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  TM FIT
                </h2>

                <p className="mt-1 text-sm font-semibold text-slate-400">
                  {role === "coach" ? "Area professionista" : "Area cliente"}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-white/10 p-3"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onChange(tab.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-3xl px-4 py-4 text-left text-sm font-black ${
                  active === tab.id
                    ? "bg-teal-300 text-slate-950"
                    : "bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <LegalDrawerSection userProfile={userProfile} />
              
            <Button
              onClick={onLogout}
              className="w-full bg-white text-slate-950"
            >
              <LogOut size={17} className="mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
function TopTabs({ tabs, active, onChange, contained = false }) {
  const mobileGridClass =
    tabs.length <= 4
      ? "grid-cols-4"
      : tabs.length === 5
      ? "grid-cols-5"
      : tabs.length === 6
      ? "grid-cols-6"
      : "grid-cols-4";

  return (
    <>
      <div className="sticky top-0 z-20 hidden border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-xl md:block md:px-6">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${
                active === tab.id
                  ? "bg-[#07111f] text-white shadow-lg"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className={`fixed bottom-0 z-50 bg-transparent px-3 pb-[calc(0.35rem+env(safe-area-inset-bottom))] pt-0 md:hidden ${
          contained
            ? "left-1/2 w-full max-w-[480px] -translate-x-1/2"
            : "left-0 right-0"
        }`}
      >
        <div className={`grid ${mobileGridClass} gap-1 rounded-[1.35rem] border border-slate-200 bg-white/95 p-1 shadow-[0_-6px_22px_rgba(15,23,42,0.10)] backdrop-blur-xl`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex h-11 min-w-0 flex-col items-center justify-center rounded-[1rem] px-0.5 text-[8.5px] font-black leading-none transition active:scale-[.96] ${
                active === tab.id
                  ? "bg-[#07111f] text-white"
                  : "text-slate-500"
              }`}
            >
              <span className="mb-0.5 scale-[.82]">{tab.icon}</span>
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function RestTimer({ seconds = 90, autoStart = false, prominent = false }) {
  const initialSeconds = Number(seconds) || 90;
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundPlayed, setSoundPlayed] = useState(false);

  useEffect(() => {
    setRemaining(initialSeconds);
    setRunning(autoStart);
    setSoundPlayed(false);
  }, [initialSeconds, autoStart]);

  function playTimerSound() {
    if (typeof window === "undefined") return;

    try {
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([250, 120, 250]);
      }
    } catch (error) {
      console.warn("Timer vibration unavailable", error?.message || error);
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, context.currentTime);
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.35, context.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.75);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.8);
    } catch (error) {
      console.warn("Timer sound unavailable", error?.message || error);
    }
  }

  useEffect(() => {
    if (remaining === 0 && soundEnabled && !soundPlayed) {
      setSoundPlayed(true);
      playTimerSound();
    }
  }, [remaining, soundEnabled, soundPlayed]);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [running]);

  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const completed = remaining === 0;

  return (
    <div
      id={prominent ? "tmfit-rest-timer" : undefined}
      className={
        prominent
          ? "sticky top-0 z-20 rounded-[1.8rem] border-2 border-teal-300 bg-[#07111f] p-4 text-white shadow-xl"
          : "rounded-3xl border border-slate-200 bg-white p-4 text-slate-950"
      }
    >
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={
                prominent
                  ? "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-slate-950"
                  : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"
              }
            >
              <Timer size={24} />
            </div>

            <div className="min-w-0">
              <p
                className={
                  prominent
                    ? "text-[11px] font-black uppercase tracking-[0.25em] text-teal-300"
                    : "text-[11px] font-black uppercase tracking-[0.25em] text-slate-400"
                }
              >
                Recupero
              </p>

              <p
                className={
                  prominent
                    ? "mt-1 text-5xl font-black leading-none tracking-tight text-white"
                    : "mt-1 text-3xl font-black leading-none tracking-tight text-slate-950"
                }
              >
                {minutes}:{String(secs).padStart(2, "0")}
              </p>

              <p
                className={
                  prominent
                    ? "mt-1 text-xs font-bold text-slate-300"
                    : "mt-1 text-xs font-bold text-slate-500"
                }
              >
                {completed
                  ? soundEnabled
                    ? "Recupero finito: avviso inviato."
                    : "Recupero finito."
                  : running
                  ? "Timer in corso"
                  : "Pronto per partire"}
              </p>
            </div>
          </div>

          {prominent && (
            <div className="rounded-2xl bg-white/10 px-3 py-2 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                Avviso
              </p>
              <p className="mt-1 text-xs font-black text-white">
                {soundEnabled ? "ON" : "OFF"}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setRunning(true);
              setSoundPlayed(false);
            }}
            className={
              prominent
                ? "h-12 rounded-2xl bg-teal-300 px-3 text-xs font-black text-slate-950 active:scale-[.97]"
                : "h-11 rounded-xl bg-[#07111f] px-3 text-xs font-black text-white active:scale-[.97]"
            }
          >
            Start
          </button>

          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemaining(initialSeconds);
              setSoundPlayed(false);
            }}
            className={
              prominent
                ? "h-12 rounded-2xl bg-white/10 px-3 text-xs font-black text-white active:scale-[.97]"
                : "h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 active:scale-[.97]"
            }
          >
            Reset
          </button>

          <button
            type="button"
            onClick={() => {
              setSoundEnabled((current) => !current);
              setSoundPlayed(false);
            }}
            className={
              soundEnabled
                ? "h-12 rounded-2xl bg-amber-300 px-3 text-xs font-black text-slate-950 active:scale-[.97]"
                : prominent
                ? "h-12 rounded-2xl bg-white/10 px-3 text-xs font-black text-white active:scale-[.97]"
                : "h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-700 active:scale-[.97]"
            }
          >
            {soundEnabled ? "Avviso ON" : "Avviso OFF"}
          </button>
        </div>

        {prominent && (
          <p className="text-center text-[11px] font-bold leading-5 text-slate-400">
            Per sentire il suono tieni aperta l’app durante il recupero.
          </p>
        )}
      </div>
    </div>
  );
}
function LegalDocumentModal({ documentKey, onClose }) {
  const selectedDocument = documentKey ? LEGAL_DOCUMENTS[documentKey] : null;

  if (!selectedDocument) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4 py-8">
      <button
        type="button"
        aria-label="Chiudi documento legale"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
      />

      <div className="relative z-[121] max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#07111f] p-6 text-white shadow-2xl md:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
              {selectedDocument.eyebrow}
            </p>

            <h2 className="mt-2 text-2xl font-black">
              {selectedDocument.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl bg-white/10 p-3"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {selectedDocument.text.map((paragraph, index) => (
            <p
              key={index}
              className="text-sm font-semibold leading-7 text-slate-300"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-white/10 p-4">
          <p className="text-xs font-semibold leading-5 text-slate-400">
            Versione documenti: {LEGAL_VERSION}. I testi sono una base
            operativa e andranno validati prima dell’utilizzo reale con clienti.
          </p>
        </div>

        <Button
          onClick={onClose}
          className="mt-5 w-full bg-teal-300 text-slate-950 hover:bg-teal-200"
        >
          Ho letto
        </Button>
      </div>
    </div>
  );
}
function LegalLinksPanel() {
  const [expanded, setExpanded] = useState(false);
  const [openLegal, setOpenLegal] = useState(null);

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[.06] text-left">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-300">
              Documenti legali
            </p>

            <p className="mt-1 text-xs font-semibold text-slate-300">
              Termini, Privacy e consenso coaching
            </p>
          </div>

          <span className="text-lg font-black text-white">
            {expanded ? "−" : "+"}
          </span>
        </button>

        {expanded && (
          <div className="border-t border-white/10 px-4 pb-4 pt-3">
            <div className="grid gap-2">
              {Object.entries(LEGAL_DOCUMENTS).map(([key, item]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOpenLegal(key)}
                  className="flex w-full items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-left text-xs font-black text-white transition hover:bg-white/15"
                >
                  <span>{item.label}</span>
                  <span className="text-teal-300">Leggi</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <LegalDocumentModal
        documentKey={openLegal}
        onClose={() => setOpenLegal(null)}
      />
    </>
  );
}
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase non configurato.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    if (error) setError(error.message);
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <form
          onSubmit={handleLogin}
          className="w-full rounded-[2rem] border border-white/10 bg-white/[.06] p-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-8 text-center">
  <div className="flex justify-center">
    <BrandLogo size="login" className="-mb-5 drop-shadow-2xl md:-mb-7" white />
  </div>

  <p className="mt-0 text-lg font-black tracking-tight text-white">
    Dott. Matteo Trobbiani
  </p>

  <p className="mt-1 text-sm font-bold text-slate-300">
    Allenamento & Nutrizione
  </p>

  <div className="mt-4 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.25em] text-teal-300">
    Webapp Coaching
  </div>
</div>
          {error && (
            <div className="mb-4 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-semibold outline-none"
              placeholder="Email"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 font-semibold outline-none"
              placeholder="Password"
            />

            <Button
  type="submit"
  disabled={loading}
  className="w-full bg-teal-300 text-slate-950 hover:bg-teal-200"
>
  {loading ? "Accesso..." : "Accedi"}
</Button>
              <LegalLinksPanel />
          </div>
        </form>
      </div>
    </div>
  );
}
function LegalAcceptanceScreen({ session, onAccepted, onLogout }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [coachingConsentAccepted, setCoachingConsentAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canContinue =
    termsAccepted && privacyAccepted && coachingConsentAccepted;

  async function acceptLegal(event) {
    event.preventDefault();

    if (!canContinue) {
      setError("Devi accettare Termini, Privacy e consenso trattamento dati.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/accept-legal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          terms_accepted: termsAccepted,
          privacy_accepted: privacyAccepted,
          coaching_consent_accepted: coachingConsentAccepted
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Errore durante accettazione consensi.");
        return;
      }
if (typeof window !== "undefined") {
  window.localStorage.setItem(
    "tmfit_legal_status",
    JSON.stringify({
      termsAccepted: true,
      privacyAccepted: true,
      coachingConsentAccepted: true,
      version: LEGAL_VERSION,
      updatedAt: new Date().toISOString()
    })
  );
}
      onAccepted(result.profile);
    } catch (error) {
      setError(error.message || "Errore imprevisto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07111f] px-5 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center">
        <form
          onSubmit={acceptLegal}
          className="w-full rounded-[2rem] border border-white/10 bg-white/[.06] p-6 shadow-2xl backdrop-blur-xl md:p-8"
        >
          <div className="mb-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.35em] text-teal-300">
              TM FIT
            </p>

            <h1 className="mt-3 text-3xl font-black">
              Prima di continuare
            </h1>

            <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
              Per usare la piattaforma devi accettare Termini, Privacy e
              consenso al trattamento dei dati necessari alla gestione del
              percorso di coaching.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <label className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1"
              />

              <span>
                <span className="block font-black">
                  Accetto Termini e condizioni
                </span>

                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-300">
                  Confermo di aver letto e accettato le condizioni di utilizzo
                  della piattaforma TM FIT.
                </span>
              </span>
            </label>

            <label className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
              <input
                type="checkbox"
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                className="mt-1"
              />

              <span>
                <span className="block font-black">
                  Accetto la Privacy policy
                </span>

                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-300">
                  Confermo di aver letto l’informativa privacy relativa al
                  trattamento dei dati personali.
                </span>
              </span>
            </label>

            <label className="flex gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
              <input
                type="checkbox"
                checked={coachingConsentAccepted}
                onChange={(event) =>
                  setCoachingConsentAccepted(event.target.checked)
                }
                className="mt-1"
              />

              <span>
                <span className="block font-black">
                  Acconsento al trattamento dati per il percorso coaching
                </span>

                <span className="mt-1 block text-sm font-semibold leading-6 text-slate-300">
                  Acconsento al trattamento dei dati necessari alla gestione di
                  allenamento, dieta, check-in, misurazioni e progressi.
                </span>
              </span>
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <Button
              type="submit"
              disabled={!canContinue || loading}
              className="flex-1 bg-teal-300 text-slate-950 hover:bg-teal-200"
            >
              {loading ? "Salvataggio..." : "Accetta e continua"}
            </Button>

            <Button
              onClick={onLogout}
              className="border border-white/10 bg-white/10 text-white"
            >
              Esci
            </Button>
          </div>

          <p className="mt-5 text-xs font-semibold leading-5 text-slate-400">
            Versione documenti: {LEGAL_VERSION}. I testi legali definitivi
            dovranno essere caricati e validati prima dell’utilizzo reale con
            clienti.
          </p>
        </form>
      </div>
    </div>
  );
}
function defaultProgressions() {
  return [1, 2, 3, 4].map((week) => ({
    temp_id: uid(),
    week_number: week,
    target_sets: "",
    target_reps: "",
    target_load_text: "",
    target_load_kg: "",
    target_rpe: "",
    target_rir: "",
    recovery_seconds: "",
    notes: ""
  }));
}

function defaultExerciseRow() {
  return {
    temp_id: uid(),
    exercise_name: "",
    exercise_media_id: "",
    sets: "3",
    reps: "8-10",
    recovery_seconds: 90,
    target_rpe: "",
    target_rir: "",
    execution_mode: "",
    video_url: "",
    image_url: "",
    notes: "",
    has_weekly_progression: false,
    progressions: defaultProgressions()
  };
}

function defaultWorkoutDay(letter = "A") {
  return {
    temp_id: uid(),
    title: `Allenamento ${letter}`,
    estimated_minutes: 60,
    notes: "",
    exercises: [defaultExerciseRow()]
  };
}

function createSmartBuilder() {
  return {
    title: "Programma allenamento",
    goal: "",
    start_date: today(),
    end_date: "",
    duration_weeks: 4,
    level: "intermedio",
    location: "palestra",
    notes: "",
    days: [defaultWorkoutDay("A")]
  };
}

function ExerciseMediaPreview({ media }) {
  if (!media) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-xs font-black text-slate-400">
        IMG
      </div>
    );
  }

  if (media.image_url) {
    return (
      <img
        src={media.image_url}
        alt={media.name}
        className="h-16 w-16 rounded-2xl border border-slate-200 object-cover"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-center text-[10px] font-black text-teal-700">
      TMFIT
    </div>
  );
}

const DIET_TYPE_OPTIONS = [
  { value: "daily_pdf", label: "Giornaliera" },
  { value: "weekly_pdf", label: "Settimanale" },
  { value: "options_pdf", label: "A opzioni" },
  { value: "file", label: "PDF dieta" }
];

function dietTypeLabel(value) {
  const found = DIET_TYPE_OPTIONS.find((item) => item.value === value);
  return found?.label || "PDF dieta";
}

function dietPeriodLabel(diet) {
  if (!diet?.start_date && !diet?.end_date) return "Periodo non impostato";
  return `${diet?.start_date || "—"} → ${diet?.end_date || "—"}`;
}

function dietDisplayTitle(diet) {
  return diet?.title || diet?.file_name || "Piano alimentare";
}

function dietIsPdf(diet) {
  const fileName = String(diet?.file_name || "").toLowerCase();
  const filePath = String(diet?.file_path || "").toLowerCase();
  return fileName.endsWith(".pdf") || filePath.includes(".pdf");
}

function safePdfDownloadName(value, fallback = "TMFIT-piano-alimentare.pdf") {
  const clean = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9À-ÿ._ -]/g, "")
    .replace(/\s+/g, "-");

  if (!clean) return fallback;
  return clean.toLowerCase().endsWith(".pdf") ? clean : `${clean}.pdf`;
}

const DIET_EXTRACT_START = "TMFIT_DIET_EXTRACT_START";
const DIET_EXTRACT_END = "TMFIT_DIET_EXTRACT_END";
const DIET_PARSER_SKIP_INTRO_PAGES = 6;
const DIET_DAY_NAMES = [
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
  "Domenica"
];
const DIET_MEAL_BASES = ["COLAZIONE", "PRANZO", "MERENDA", "CENA"];
const DIET_SECTION_BASES = [
  "COLAZIONE",
  "COLAZIONE 1",
  "COLAZIONE 2",
  "COLAZIONE 3",
  "PRANZO",
  "PRANZO 1",
  "PRANZO 2",
  "MERENDA",
  "SPUNTINO",
  "SPUNTINO 1",
  "SPUNTINO 2",
  "PRE WORKOUT",
  "POST WORKOUT",
  "INTRA WORKOUT",
  "PRE NANNA",
  "CENA",
  "CENA 1",
  "CENA 2",
  "CENA 3",
  "PASTO LIBERO"
];

function stripDietExtractBlock(value) {
  const raw = String(value || "");
  const startIndex = raw.indexOf(DIET_EXTRACT_START);
  const endIndex = raw.indexOf(DIET_EXTRACT_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return raw.trim();
  }

  return `${raw.slice(0, startIndex)}${raw.slice(endIndex + DIET_EXTRACT_END.length)}`.trim();
}

function dietExtractedInfo(diet) {
  const raw = String(diet?.notes || "");
  const startIndex = raw.indexOf(DIET_EXTRACT_START);
  const endIndex = raw.indexOf(DIET_EXTRACT_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }

  const jsonText = raw
    .slice(startIndex + DIET_EXTRACT_START.length, endIndex)
    .trim();

  if (!jsonText) return null;

  try {
    const parsed = JSON.parse(jsonText);
    const hasDailyCards = Array.isArray(parsed.days) && parsed.days.length > 0;
    const hasOptionCards =
      Array.isArray(parsed.optionGroups) && parsed.optionGroups.length > 0;

    if (!hasDailyCards && !hasOptionCards) return null;

    const sanitized = sanitizeExtractedDietForMeals(parsed);
    const hasSanitizedDailyCards = Array.isArray(sanitized?.days) && sanitized.days.length > 0;
    const hasSanitizedOptionCards =
      Array.isArray(sanitized?.optionGroups) && sanitized.optionGroups.length > 0;

    if (!hasSanitizedDailyCards && !hasSanitizedOptionCards) return null;

    return sanitized;
  } catch (error) {
    console.warn("TMFIT dieta: estrazione PDF non leggibile", error?.message || error);
    return null;
  }
}

function dietStructuredInfo(diet) {
  const rawNotes = stripDietExtractBlock(diet?.notes || "");
  const info = {
    calorieTarget: "",
    summary: "",
    coachNotes: "",
    extraNotes: "",
    rawNotes
  };

  if (!rawNotes) return info;

  const chunks = rawNotes
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  const extra = [];

  chunks.forEach((chunk) => {
    const normalized = chunk.toLowerCase();

    if (normalized.startsWith("target kcal:")) {
      info.calorieTarget = chunk.replace(/^target kcal:\s*/i, "").trim();
      return;
    }

    if (normalized.startsWith("riepilogo:")) {
      info.summary = chunk.replace(/^riepilogo:\s*/i, "").trim();
      return;
    }

    if (normalized.startsWith("note coach:")) {
      info.coachNotes = chunk.replace(/^note coach:\s*/i, "").trim();
      return;
    }

    extra.push(chunk);
  });

  info.extraNotes = extra.join("\n\n");

  if (!info.coachNotes && !info.summary && !info.calorieTarget && rawNotes) {
    info.coachNotes = rawNotes;
  }

  return info;
}

function normalizeDietToken(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function cleanDietPdfLine(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function titleCaseDietLabel(value) {
  return String(value || "")
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dietMealLabel(value) {
  const normalized = normalizeDietToken(value);

  if (normalized.startsWith("COLAZIONE")) return "Colazione";
  if (normalized.startsWith("PRANZO")) return "Pranzo";
  if (normalized.startsWith("MERENDA")) return "Merenda";
  if (normalized.startsWith("SPUNTINO")) return "Spuntino";
  if (normalized.startsWith("PRE WORKOUT")) return "Pre workout";
  if (normalized.startsWith("POST WORKOUT")) return "Post workout";
  if (normalized.startsWith("INTRA WORKOUT")) return "Intra workout";
  if (normalized.startsWith("PRE NANNA")) return "Pre nanna";
  if (normalized.startsWith("CENA")) return "Cena";
  if (normalized.startsWith("PASTO LIBERO")) return "Pasto libero";

  return titleCaseDietLabel(value) || "Pasto";
}

function detectDynamicDietSectionBase(line) {
  const normalized = normalizeDietToken(line);
  const match = normalized.match(
    /^(COLAZIONE|PRANZO|MERENDA|SPUNTINO|PRE WORKOUT|POST WORKOUT|INTRA WORKOUT|PRE NANNA|CENA|PASTO LIBERO)(?:\s+\d+)?(?:\s*[-:]\s*.+)?$/
  );

  if (!match) return null;

  return dietMealLabel(match[1]);
}

function isDietFoodStart(value) {
  return /^\d+[,.]?\d*\s*(g|gr|kg|ml|l|kcal|cal)\b/i.test(String(value || "").trim());
}

function isDietAlternativeLine(value) {
  const normalized = normalizeDietToken(value);
  return normalized.startsWith("OPPURE") || normalized.startsWith("O ");
}

function isDietNoteLine(value) {
  const normalized = normalizeDietToken(value);
  return (
    normalized.startsWith("NOTE AL PASTO") ||
    normalized.startsWith("NOTA AL PASTO") ||
    normalized.startsWith("NOTE") ||
    normalized.startsWith("NOTA")
  );
}

function isDietMealNoteHeadingLine(value) {
  const normalized = normalizeDietToken(value);
  return (
    normalized.startsWith("NOTE AL PASTO") ||
    normalized.startsWith("NOTA AL PASTO")
  );
}

function extractDietMealNoteIntro(value) {
  const clean = cleanDietPdfLine(value);

  if (!isDietMealNoteHeadingLine(clean)) return null;

  return clean
    .replace(/^note\s+al\s+pasto\s*/i, "")
    .replace(/^nota\s+al\s+pasto\s*/i, "")
    .replace(/^[:\-–—]+\s*/i, "")
    .trim();
}

function splitDietItemsAndMealNotes(items = []) {
  const foodItems = [];
  const notes = [];
  let readingMealNotes = false;

  (items || []).map(cleanDietPdfLine).filter(Boolean).forEach((line) => {
    const introNote = extractDietMealNoteIntro(line);

    if (introNote !== null) {
      readingMealNotes = true;
      if (introNote) notes.push(introNote);
      return;
    }

    if (readingMealNotes) {
      notes.push(line);
      return;
    }

    foodItems.push(line);
  });

  return { foodItems, notes };
}

function findDietSectionBase(line) {
  const dynamicBase = detectDynamicDietSectionBase(line);
  if (dynamicBase) return dynamicBase;

  const normalized = normalizeDietToken(line);

  const base = DIET_SECTION_BASES
    .slice()
    .sort((a, b) => b.length - a.length)
    .find((item) => {
      const token = normalizeDietToken(item);
      return (
        normalized === token ||
        normalized.startsWith(`${token} `) ||
        normalized.startsWith(`${token} -`) ||
        normalized.startsWith(`${token}:`)
      );
    });

  if (!base) return null;

  const cleanBase = normalizeDietToken(base).replace(/\s+\d+$/, "");
  return dietMealLabel(cleanBase);
}

function isDietNonMealHeading(line) {
  const normalized = normalizeDietToken(line);

  if (!normalized) return true;

  const blockedStarts = [
    "PIANO ALIMENTARE",
    "ALLENAMENTO",
    "TM FIT",
    "TMFIT",
    "LINEE GUIDA",
    "IDRATAZIONE",
    "REGOLE GENERALI",
    "FRUTTA E VERDURA",
    "CONDIMENTI",
    "BEVANDE",
    "TABELLA STAGIONALITA",
    "TABELLA STAGIONALITA'",
    "TABELLA STAGIONALITA’",
    "RIPARTIZIONE CALORICA",
    "GRASSI",
    "CARBOIDRATI",
    "PROTEINE",
    "INTEGRAZIONE",
    "NOTE GENERALI",
    "PESO:",
    "DURATA PROGRAMMA",
    "STRUTTURATO SU",
    "OBIETTIVO:",
    "LISTA DELLA SPESA",
    "LISTA ALIMENTI",
    "ALTRO",
    "BEVANDE ANALCOLICHE",
    "CARNE",
    "CEREALI E TUBERI",
    "DOLCI",
    "FARINE",
    "FRUTTA",
    "FRUTTA SECCA",
    "GRASSI E CONDIMENTI",
    "LATTE E DERIVATI",
    "LEGUMI",
    "ORTAGGI E VERDURE",
    "PESCE",
    "UOVA"
  ];

  return blockedStarts.some((item) => normalized.startsWith(normalizeDietToken(item)));
}

function dietLineLooksLikeMealFood(line) {
  const normalized = normalizeDietToken(line);

  if (!normalized) return false;
  if (isDietFoodStart(line)) return true;
  if (isDietAlternativeLine(line) && /\d+[,.]?\d*\s*(G|GR|KG|ML|L|KCAL|CAL)\b/.test(normalized)) return true;
  if (/\d+[,.]?\d*\s*(G|GR|KG|ML|L|KCAL|CAL)\b/.test(normalized)) return true;

  const foodWords = [
    "YOGURT",
    "PANE",
    "PASTA",
    "RISO",
    "COUS COUS",
    "PATATE",
    "GALLETTE",
    "WASA",
    "UOVA",
    "ALBUME",
    "POLLO",
    "TACCHINO",
    "TONNO",
    "MERLUZZO",
    "NASELLO",
    "SALMONE",
    "BRESAOLA",
    "FESA",
    "PROSCIUTTO",
    "RICOTTA",
    "LATTE",
    "FRUTTA",
    "VERDURE",
    "ORTAGGI",
    "OLIO",
    "PARMIGIANO",
    "PIADINA",
    "GNOCCHI",
    "FIOCCHI",
    "MUESLI",
    "AVENA",
    "QUINOA",
    "FARRO",
    "CECI",
    "FAGIOLI",
    "LENTICCHIE",
    "MOZZARELLA",
    "FIOCCHI DI LATTE"
  ];

  return foodWords.some((word) => normalized.includes(word));
}

function dietSectionHasMealFood(items = []) {
  const { foodItems } = splitDietItemsAndMealNotes(items || []);
  return foodItems.some((item) => dietLineLooksLikeMealFood(item));
}

function normalizeDietMealSection(section) {
  if (!section) return null;

  const title = section.name || section.title || "";
  if (isDietNonMealHeading(title)) return null;

  const split = splitDietItemsAndMealNotes(section.items || []);
  const existingNotes = Array.isArray(section.notes)
    ? section.notes.map(cleanDietPdfLine).filter(Boolean)
    : section.notes
    ? [cleanDietPdfLine(section.notes)].filter(Boolean)
    : [];
  const notes = [...existingNotes, ...split.notes].filter(Boolean);

  if (!dietSectionHasMealFood(split.foodItems)) return null;

  return {
    ...section,
    items: split.foodItems,
    notes
  };
}

function sanitizeExtractedDietForMeals(parsed) {
  if (!parsed || typeof parsed !== "object") return parsed;

  const cloned = { ...parsed };
  const hiddenWarnings = [];

  const days = Array.isArray(cloned.days) ? cloned.days : [];
  cloned.days = days
    .map((day) => {
      const sections = day.meals || day.sections || [];
      const cleanSections = sections
        .map((section) => normalizeDietMealSection(section))
        .filter(Boolean);

      return {
        ...day,
        meals: cleanSections,
        sections: cleanSections
      };
    })
    .filter((day) => (day.meals || day.sections || []).length > 0);

  const optionGroups = Array.isArray(cloned.optionGroups) ? cloned.optionGroups : [];
  cloned.optionGroups = optionGroups
    .map((group) => {
      const title = group.meal || group.title || "";
      if (isDietNonMealHeading(title)) {
        hiddenWarnings.push(`Sezione non pasto esclusa: ${title}`);
        return null;
      }

      const cleanOptions = (group.options || [])
        .map((option) => normalizeDietMealSection(option))
        .filter(Boolean);

      if (cleanOptions.length === 0) return null;

      return {
        ...group,
        options: cleanOptions
      };
    })
    .filter(Boolean);

  cloned.warnings = [
    ...(Array.isArray(cloned.warnings) ? cloned.warnings : []),
    ...hiddenWarnings
  ].filter(Boolean);

  return cloned;
}

function detectDietGenericHeading(line) {
  const clean = cleanDietPdfLine(line);

  if (!clean) return null;
  if (clean.length > 72) return null;
  if (isDietNonMealHeading(clean)) return null;
  if (isDietFoodStart(clean) || isDietAlternativeLine(clean) || isDietNoteLine(clean)) return null;
  if (/\d+\s*(g|gr|kg|ml|l)\b/i.test(clean)) return null;

  const base = findDietSectionBase(clean);

  if (!base) return null;

  return {
    base,
    title: clean
  };
}

function detectDietDayLine(line) {
  const normalized = normalizeDietToken(line);
  return DIET_DAY_NAMES.find((day) => normalizeDietToken(day) === normalized) || null;
}

function detectDailyMealHeading(line) {
  const heading = detectDietGenericHeading(line);
  return heading?.title ? dietMealLabel(heading.title) : null;
}

function detectOptionMealHeading(line) {
  return detectDietGenericHeading(line);
}

function detectDietOptionMarker(line) {
  const clean = cleanDietPdfLine(line);
  const normalized = normalizeDietToken(clean);

  if (/^OPZIONE\s+\d+/i.test(clean)) return clean;
  if (normalized === "OPZIONE" || normalized.startsWith("OPZIONE ")) return clean;

  return null;
}

function compactDietItems(lines = []) {
  const ignoredStarts = [
    "PIANO ALIMENTARE",
    "ALLENAMENTO",
    "TM FIT",
    "TMFIT",
    "LISTA GIORNALIERA",
    "WEEK 1 - ALIMENTI"
  ];

  return lines
    .map(cleanDietPdfLine)
    .filter(Boolean)
    .filter((line) => {
      const normalized = normalizeDietToken(line);
      if (isDietNonMealHeading(line)) return false;
      return !ignoredStarts.some((start) => normalized.startsWith(start));
    })
    .slice(0, 80);
}

function pushDietMeal(target, meal) {
  if (!meal) return;

  const split = splitDietItemsAndMealNotes(compactDietItems(meal.items || []));
  const items = split.foodItems;
  const existingNotes = Array.isArray(meal.notes)
    ? meal.notes.map(cleanDietPdfLine).filter(Boolean)
    : meal.notes
    ? [cleanDietPdfLine(meal.notes)].filter(Boolean)
    : [];
  const notes = [...existingNotes, ...split.notes].filter(Boolean);

  if (items.length === 0) return;
  if (isDietNonMealHeading(meal.name || meal.title || "")) return;
  if (!dietSectionHasMealFood(items)) return;

  target.push({
    name: meal.name,
    title: meal.title || meal.name,
    items,
    notes
  });
}

function cutDietLinesForDaily(lines) {
  const startIndex = lines.findIndex((line) =>
    normalizeDietToken(line).startsWith("LISTA GIORNALIERA")
  );
  const safeStart = startIndex >= 0 ? startIndex + 1 : 0;

  const nextListIndex = lines.findIndex((line, index) => {
    if (index <= safeStart + 20) return false;
    return normalizeDietToken(line).startsWith("LISTA GIORNALIERA");
  });

  return lines.slice(safeStart, nextListIndex > safeStart ? nextListIndex : undefined);
}

function cutDietLinesForOptions(lines) {
  const weekStart = lines.findIndex((line) =>
    normalizeDietToken(line).startsWith("WEEK 1 - ALIMENTI")
  );
  const safeStart = weekStart >= 0 ? weekStart + 1 : 0;

  const endIndex = lines.findIndex((line, index) => {
    if (index <= safeStart + 20) return false;
    return normalizeDietToken(line) === "WEEK 1" || normalizeDietToken(line) === "ALTRO";
  });

  return lines.slice(safeStart, endIndex > safeStart ? endIndex : undefined);
}

function splitDietEmbeddedParserLine(line) {
  const clean = cleanDietPdfLine(line);
  if (!clean) return [];

  const dayPattern = DIET_DAY_NAMES.join("|");
  const mealPattern =
    "COLAZIONE|PRANZO|MERENDA|SPUNTINO|PRE WORKOUT|POST WORKOUT|INTRA WORKOUT|PRE NANNA|CENA|PASTO LIBERO";

  let prepared = clean
    .replace(/\s+/g, " ")
    .replace(new RegExp(`([^\n\s])(${dayPattern})(?=\b)`, "g"), "$1\n$2")
    .replace(new RegExp(`([a-zà-ÿ0-9\)])(${mealPattern})(?=\s*\d|\d|\s|$)`, "g"), "$1\n$2")
    .replace(new RegExp(`\b(${mealPattern})(?=\d)`, "g"), "$1\n")
    .replace(/([a-zà-ÿ0-9\)])(Opzione\s+\d+)/g, "$1\n$2")
    .replace(/([a-zà-ÿ0-9\)])(Note\s*al\s*pasto)/gi, "$1\n$2")
    .replace(/([a-zà-ÿ0-9\)])(Nota\s*al\s*pasto)/gi, "$1\n$2")
    .replace(/\b(Note|Nota)\s*al\s*pasto\s*[:\-–—]?\s*/gi, "Note al pasto ")
    .replace(/(Note\s+al\s+pasto)(?=\s*(COLAZIONE|PRANZO|MERENDA|SPUNTINO|PRE WORKOUT|POST WORKOUT|INTRA WORKOUT|PRE NANNA|CENA|PASTO LIBERO|Opzione\s+\d+|Lunedì|Martedì|Mercoledì|Giovedì|Venerdì|Sabato|Domenica)\b)/gi, "$1\n")
    .replace(/((?:COLAZIONE|PRANZO|MERENDA|SPUNTINO|PRE WORKOUT|POST WORKOUT|INTRA WORKOUT|PRE NANNA|CENA|PASTO LIBERO)\s+\d+\s*[-:][^0-9]{2,48})\s+(?=\d+[,.]?\d*\s*(?:g|gr|kg|ml|l)\b)/gi, "$1\n");

  return prepared
    .split(/\n+/)
    .map(cleanDietPdfLine)
    .filter(Boolean);
}

function mergeSplitDietMealNoteHeadings(lines = []) {
  const merged = [];

  for (let index = 0; index < lines.length; index += 1) {
    const current = cleanDietPdfLine(lines[index]);
    const next = cleanDietPdfLine(lines[index + 1]);
    const normalizedCurrent = normalizeDietToken(current);
    const normalizedNext = normalizeDietToken(next);

    if (normalizedCurrent === "NOTE" && normalizedNext.startsWith("AL PASTO")) {
      const rest = next.replace(/^al\s+pasto\s*/i, "").trim();
      merged.push(rest ? `Note al pasto ${rest}` : "Note al pasto");
      index += 1;
      continue;
    }

    merged.push(current);
  }

  return merged.filter(Boolean);
}

function expandDietLinesForParsing(lines = [], mode = "daily") {
  const expanded = [];
  const preparedLines = mergeSplitDietMealNoteHeadings(
    lines.flatMap((line) => splitDietEmbeddedParserLine(line))
  );

  preparedLines.forEach((line) => {
    const clean = cleanDietPdfLine(line);
    if (!clean) return;

    const normalized = normalizeDietToken(clean);
    let handled = false;

    DIET_DAY_NAMES.forEach((day) => {
      if (handled) return;

      const dayToken = normalizeDietToken(day);
      if (normalized === dayToken) {
        expanded.push(day);
        handled = true;
        return;
      }

      if (normalized.startsWith(`${dayToken} `)) {
        expanded.push(day);
        const rest = clean.slice(day.length).trim();
        if (rest) expanded.push(...splitDietEmbeddedParserLine(rest));
        handled = true;
      }
    });

    if (handled) return;

    const headingBase = DIET_SECTION_BASES
      .slice()
      .sort((a, b) => b.length - a.length)
      .find((meal) => normalized.startsWith(`${normalizeDietToken(meal)} `));

    if (headingBase) {
      const rest = clean.slice(headingBase.length).trim();

      if (rest && isDietFoodStart(rest)) {
        expanded.push(dietMealLabel(headingBase));
        expanded.push(rest);
        return;
      }
    }

    const dynamicHeading = normalized.match(
      /^(COLAZIONE|PRANZO|MERENDA|SPUNTINO|PRE WORKOUT|POST WORKOUT|INTRA WORKOUT|PRE NANNA|CENA|PASTO LIBERO)(?:\s+\d+)?\s+(.+)$/
    );

    if (dynamicHeading && isDietFoodStart(dynamicHeading[2])) {
      expanded.push(dietMealLabel(dynamicHeading[1]));
      expanded.push(clean.slice(clean.toUpperCase().indexOf(dynamicHeading[2])).trim());
      return;
    }

    expanded.push(clean);
  });

  return mergeSplitDietMealNoteHeadings(expanded);
}

function extractionHasCards(extractedDiet) {
  if (!extractedDiet) return false;

  const hasDailyCards =
    Array.isArray(extractedDiet.days) && extractedDiet.days.length > 0;
  const hasOptionCards =
    Array.isArray(extractedDiet.optionGroups) &&
    extractedDiet.optionGroups.length > 0;

  return hasDailyCards || hasOptionCards;
}

function parseDailyDietLines(lines, sourceName) {
  const scopedLines = expandDietLinesForParsing(cutDietLinesForDaily(lines), "daily");
  const days = [];
  let currentDay = null;
  let currentMeal = null;
  let readingMealNotes = false;

  function addCurrentMealNote(line) {
    if (!currentMeal) return;

    const clean = cleanDietPdfLine(line);
    if (!clean) return;

    currentMeal.notes = Array.isArray(currentMeal.notes) ? currentMeal.notes : [];
    currentMeal.notes.push(clean);
  }

  scopedLines.forEach((line) => {
    const dayName = detectDietDayLine(line);

    if (dayName) {
      if (currentDay) {
        pushDietMeal(currentDay.meals, currentMeal);
        days.push(currentDay);
      }

      currentDay = {
        day: dayName,
        meals: []
      };
      currentMeal = null;
      readingMealNotes = false;
      return;
    }

    if (!currentDay) return;

    const mealName = detectDailyMealHeading(line);

    if (mealName) {
      pushDietMeal(currentDay.meals, currentMeal);
      currentMeal = {
        name: mealName,
        items: [],
        notes: []
      };
      readingMealNotes = false;
      return;
    }

    if (!currentMeal) return;

    const introNote = extractDietMealNoteIntro(line);

    if (introNote !== null) {
      readingMealNotes = true;
      if (introNote) addCurrentMealNote(introNote);
      return;
    }

    if (readingMealNotes) {
      addCurrentMealNote(line);
      return;
    }

    currentMeal.items.push(line);
  });

  if (currentDay) {
    pushDietMeal(currentDay.meals, currentMeal);
    days.push(currentDay);
  }

  return {
    version: 1,
    format: "daily_pdf",
    sourceName,
    extractedAt: new Date().toISOString(),
    days: days.filter((day) => day.meals.length > 0),
    optionGroups: [],
    warnings: days.length === 0 ? ["Nessun giorno riconosciuto nel PDF."] : []
  };
}

function parseOptionsDietLines(lines, sourceName) {
  const scopedLines = expandDietLinesForParsing(cutDietLinesForOptions(lines), "options");
  const groupsMap = new Map();
  let currentOption = null;
  let readingMealNotes = false;

  function addCurrentOptionNote(line) {
    if (!currentOption) return;

    const clean = cleanDietPdfLine(line);
    if (!clean) return;

    currentOption.notes = Array.isArray(currentOption.notes)
      ? currentOption.notes
      : [];
    currentOption.notes.push(clean);
  }

  function pushCurrentOption() {
    if (!currentOption) return;

    const split = splitDietItemsAndMealNotes(compactDietItems(currentOption.items || []));
    const items = split.foodItems;
    const existingNotes = Array.isArray(currentOption.notes)
      ? currentOption.notes.map(cleanDietPdfLine).filter(Boolean)
      : [];
    const notes = [...existingNotes, ...split.notes].filter(Boolean);

    if (
      items.length === 0 ||
      isDietNonMealHeading(currentOption.base || currentOption.title || "") ||
      !dietSectionHasMealFood(items)
    ) {
      currentOption = null;
      readingMealNotes = false;
      return;
    }

    if (!groupsMap.has(currentOption.base)) {
      groupsMap.set(currentOption.base, []);
    }

    groupsMap.get(currentOption.base).push({
      title: currentOption.title,
      items,
      notes
    });

    currentOption = null;
    readingMealNotes = false;
  }

  scopedLines.forEach((line) => {
    const optionMarker = detectDietOptionMarker(line);

    if (optionMarker && currentOption) {
      const base = currentOption.base;

      if ((currentOption.items || []).length > 0 || (currentOption.notes || []).length > 0) {
        pushCurrentOption();
      } else {
        currentOption = null;
      }

      currentOption = {
        base,
        title: optionMarker,
        items: [],
        notes: []
      };
      readingMealNotes = false;
      return;
    }

    const heading = detectOptionMealHeading(line);

    if (heading) {
      pushCurrentOption();
      currentOption = {
        base: heading.base,
        title: heading.title,
        items: [],
        notes: []
      };
      readingMealNotes = false;
      return;
    }

    if (!currentOption) return;

    const introNote = extractDietMealNoteIntro(line);

    if (introNote !== null) {
      readingMealNotes = true;
      if (introNote) addCurrentOptionNote(introNote);
      return;
    }

    if (readingMealNotes) {
      addCurrentOptionNote(line);
      return;
    }

    currentOption.items.push(line);
  });

  pushCurrentOption();

  const optionGroups = Array.from(groupsMap.entries())
    .map(([meal, options]) => ({
      meal,
      options
    }))
    .filter((group) => group.options.length > 0);

  return {
    version: 1,
    format: "options_pdf",
    sourceName,
    extractedAt: new Date().toISOString(),
    days: [],
    optionGroups,
    warnings: optionGroups.length === 0 ? ["Nessuna opzione riconosciuta nel PDF."] : []
  };
}

async function loadPdfJsForDietExtraction() {
  if (typeof window === "undefined") {
    throw new Error("Lettura PDF disponibile solo nel browser.");
  }

  function configurePdfJs(pdfjsLib) {
    if (!pdfjsLib) return null;

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    return pdfjsLib;
  }

  if (window.pdfjsLib) {
    return configurePdfJs(window.pdfjsLib);
  }

  await new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[data-tmfit-pdfjs='true']");

    if (existingScript) {
      if (window.pdfjsLib) {
        resolve();
        return;
      }

      const timeout = window.setTimeout(() => {
        if (window.pdfjsLib) {
          resolve();
          return;
        }

        reject(new Error("Il lettore PDF sta impiegando troppo tempo a caricarsi."));
      }, 12000);

      existingScript.addEventListener(
        "load",
        () => {
          window.clearTimeout(timeout);
          resolve();
        },
        { once: true }
      );
      existingScript.addEventListener(
        "error",
        () => {
          window.clearTimeout(timeout);
          reject(new Error("Impossibile caricare il lettore PDF automatico."));
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.dataset.tmfitPdfjs = "true";

    const timeout = window.setTimeout(() => {
      reject(new Error("Il lettore PDF sta impiegando troppo tempo a caricarsi."));
    }, 12000);

    script.onload = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Impossibile caricare il lettore PDF automatico."));
    };
    document.head.appendChild(script);
  });

  if (!window.pdfjsLib) {
    throw new Error("Lettore PDF automatico non disponibile.");
  }

  return configurePdfJs(window.pdfjsLib);
}

function pdfTextItemsToLines(items = []) {
  const rows = [];

  items.forEach((item) => {
    const text = cleanDietPdfLine(item?.str || "");
    if (!text) return;

    const transform = item?.transform || [];
    const x = Number(transform[4] || 0);
    const y = Number(transform[5] || 0);
    const existing = rows.find((row) => Math.abs(row.y - y) < 3);

    if (existing) {
      existing.items.push({ x, text });
    } else {
      rows.push({ y, items: [{ x, text }] });
    }
  });

  return rows
    .sort((a, b) => b.y - a.y)
    .map((row) =>
      row.items
        .sort((a, b) => a.x - b.x)
        .map((item) => item.text)
        .join(" ")
        .trim()
    )
    .filter(Boolean);
}

async function extractDietTextFromPdfFile(file, options = {}) {
  const pdfjsLib = await loadPdfJsForDietExtraction();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageCount = Number(pdf.numPages || 0);
  const skipIntroPages = Number.isFinite(Number(options.skipIntroPages))
    ? Math.max(0, Number(options.skipIntroPages))
    : DIET_PARSER_SKIP_INTRO_PAGES;
  const parseStartPage = pageCount > skipIntroPages ? skipIntroPages + 1 : 1;
  const pages = [];

  for (let pageNumber = parseStartPage; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(...pdfTextItemsToLines(content.items || []));
  }

  return {
    lines: pages.map(cleanDietPdfLine).filter(Boolean),
    pageCount,
    parseStartPage,
    skippedIntroPages: Math.max(0, parseStartPage - 1)
  };
}

function scoreDietExtraction(extractedDiet) {
  if (!extractedDiet) return 0;

  const days = Array.isArray(extractedDiet.days) ? extractedDiet.days : [];
  const optionGroups = Array.isArray(extractedDiet.optionGroups)
    ? extractedDiet.optionGroups
    : [];
  const dailyMeals = days.reduce(
    (sum, day) => sum + ((day.meals || day.sections || []).length || 0),
    0
  );
  const optionCount = optionGroups.reduce(
    (sum, group) => sum + ((group.options || []).length || 0),
    0
  );
  const foodRows = [
    ...days.flatMap((day) => day.meals || day.sections || []),
    ...optionGroups.flatMap((group) => group.options || [])
  ].reduce((sum, section) => sum + ((section.items || []).length || 0), 0);

  return days.length * 25 + dailyMeals * 8 + optionGroups.length * 18 + optionCount * 8 + Math.min(foodRows, 120);
}

async function extractDietPdfForApp(file, dietType) {
  const textExtraction = await extractDietTextFromPdfFile(file);
  const lines = textExtraction.lines || [];
  const extractionMeta = {
    pageCount: textExtraction.pageCount || 0,
    parseStartPage: textExtraction.parseStartPage || 1,
    skippedIntroPages: textExtraction.skippedIntroPages || 0,
    parseScope: textExtraction.skippedIntroPages > 0
      ? `pagine ${textExtraction.parseStartPage}-${textExtraction.pageCount}`
      : "intero PDF"
  };
  const daily = sanitizeExtractedDietForMeals(parseDailyDietLines(lines, file.name));
  const options = sanitizeExtractedDietForMeals(parseOptionsDietLines(lines, file.name));
  const wantsOptions = dietType === "options_pdf";
  const primary = wantsOptions ? options : daily;
  const fallback = wantsOptions ? daily : options;
  const primaryScore = scoreDietExtraction(primary);
  const fallbackScore = scoreDietExtraction(fallback);

  if (primaryScore > 0 && primaryScore >= fallbackScore * 0.72) {
    return {
      ...primary,
      ...extractionMeta,
      parseScore: primaryScore,
      alternativeScore: fallbackScore
    };
  }

  if (fallbackScore > 0) {
    return {
      ...fallback,
      ...extractionMeta,
      parseScore: fallbackScore,
      alternativeScore: primaryScore,
      warnings: [
        ...(fallback.warnings || []),
        "Formato selezionato non riconosciuto perfettamente: TMFIT ha usato il parsing alternativo più leggibile."
      ]
    };
  }

  return {
    ...primary,
    ...extractionMeta,
    parseScore: primaryScore,
    alternativeScore: fallbackScore,
    warnings: [
      ...(primary.warnings || []),
      "PDF letto, ma non sono state riconosciute card pasti. Verifica che il PDF sia esportato come testo e non come immagine."
    ]
  };
}

async function extractDietPdfFromUrlForApp(url, sourceName, dietType) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Non riesco a scaricare il PDF per l’analisi automatica.");
  }

  const blob = await response.blob();
  const file = new File([blob], sourceName || "dieta.pdf", {
    type: blob.type || "application/pdf"
  });

  return extractDietPdfForApp(file, dietType);
}

function dietExtractToNotesBlock(extractedDiet) {
  if (!extractedDiet) return null;

  const hasDailyCards = Array.isArray(extractedDiet.days) && extractedDiet.days.length > 0;
  const hasOptionCards =
    Array.isArray(extractedDiet.optionGroups) && extractedDiet.optionGroups.length > 0;

  if (!hasDailyCards && !hasOptionCards) return null;

  return `${DIET_EXTRACT_START}\n${JSON.stringify(extractedDiet)}\n${DIET_EXTRACT_END}`;
}
function DietInfoGrid({ diet, compact = false }) {
  const info = dietStructuredInfo(diet);
  const cardClass = compact
    ? "rounded-2xl border border-slate-200 bg-white p-3"
    : "rounded-2xl border border-slate-200 bg-white p-4";

  const items = [
    {
      label: "Formato",
      value: dietTypeLabel(diet?.diet_type),
      helper: dietIsPdf(diet) ? "PDF consultabile" : "File allegato"
    },
    {
      label: "Kcal",
      value: info.calorieTarget || "Nel PDF",
      helper: info.calorieTarget ? "Target indicato" : "Leggi piano completo"
    },
    {
      label: "Periodo",
      value: dietPeriodLabel(diet),
      helper: diet?.created_at
        ? `Caricata ${new Date(diet.created_at).toLocaleDateString("it-IT")}`
        : "Dieta attiva"
    },
    {
      label: "File",
      value: diet?.file_name || "PDF dieta",
      helper: "Originale SIFA"
    }
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className={cardClass}>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {item.label}
          </p>
          <p className="mt-1 truncate text-sm font-black text-slate-950">
            {item.value}
          </p>
          <p className="mt-1 truncate text-[11px] font-bold text-slate-500">
            {item.helper}
          </p>
        </div>
      ))}
    </div>
  );
}

function DietCoachNoteBox({ diet, emptyTitle = "Nessuna nota aggiuntiva" }) {
  const info = dietStructuredInfo(diet);
  const coachText = info.coachNotes || info.extraNotes;

  if (!coachText) {
    return (
      <Empty
        title={emptyTitle}
        text="Consulta il PDF completo per tutti i dettagli del piano."
      />
    );
  }

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">
        Note coach
      </p>
      <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-slate-600">
        {coachText}
      </p>
    </div>
  );
}

function DietSummaryBox({ diet }) {
  const info = dietStructuredInfo(diet);

  if (!info.summary) return null;

  return (
    <div className="rounded-[1.5rem] border border-teal-100 bg-teal-50 p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-700">
        Riepilogo piano
      </p>
      <p className="mt-3 whitespace-pre-line text-sm font-semibold leading-7 text-slate-700">
        {info.summary}
      </p>
    </div>
  );
}


function buildDietFoodGroups(items = [], mealNotes = []) {
  const groups = [];
  const split = splitDietItemsAndMealNotes(items || []);
  const notes = [
    ...split.notes,
    ...(Array.isArray(mealNotes) ? mealNotes : mealNotes ? [mealNotes] : [])
  ]
    .map(cleanDietPdfLine)
    .filter(Boolean)
    .filter((note, index, array) => array.indexOf(note) === index);

  split.foodItems.forEach((line) => {
    if (isDietAlternativeLine(line) && groups.length > 0) {
      groups[groups.length - 1].alternatives.push(line);
      return;
    }

    groups.push({
      text: line,
      alternatives: []
    });
  });

  return { groups, notes };
}

function DietFoodLines({ items = [], notes: mealNotes = [] }) {
  const { groups, notes } = buildDietFoodGroups(items, mealNotes);

  if (groups.length === 0 && notes.length === 0) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-400">
        Nessun alimento disponibile in questa card.
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-2.5">
      {groups.map((group, index) => (
        <div
          key={`${group.text}-${index}`}
          className="rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
        >
          <div className="flex gap-2.5">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
            <p className="text-sm font-black leading-6 text-slate-800">
              {group.text}
            </p>
          </div>

          {group.alternatives.length > 0 && (
            <div className="mt-2 space-y-1.5 border-l-2 border-slate-200 pl-4">
              {group.alternatives.map((alternative, altIndex) => (
                <p
                  key={`${alternative}-${altIndex}`}
                  className="text-xs font-bold leading-5 text-slate-500"
                >
                  {alternative}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}

      {notes.map((note, index) => (
        <div
          key={`${note}-${index}`}
          className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">
            Note al pasto
          </p>
          <p className="mt-1 text-xs font-bold leading-5 text-amber-900">
            {note}
          </p>
        </div>
      ))}
    </div>
  );
}

function DietExtractedPlan({ diet, compact = false }) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeOptionGroupIndex, setActiveOptionGroupIndex] = useState(0);
  const extracted = dietExtractedInfo(diet);

  if (!extracted) return null;

  const dailyDays = Array.isArray(extracted.days) ? extracted.days : [];
  const optionGroups = Array.isArray(extracted.optionGroups)
    ? extracted.optionGroups
    : [];
  const isOptions =
    extracted.format === "options_pdf" ||
    (optionGroups.length > 0 && dailyDays.length === 0);

  const sourceLabel = extracted.sourceName || diet?.file_name || "PDF dieta";
  const visibleDays = compact ? dailyDays.slice(0, 2) : dailyDays;
  const visibleOptionGroups = compact ? optionGroups.slice(0, 3) : optionGroups;
  const warnings = Array.isArray(extracted.warnings) ? extracted.warnings.filter(Boolean) : [];
  const totalMeals = dailyDays.reduce(
    (sum, day) => sum + (day.meals?.length || day.sections?.length || 0),
    0
  );
  const totalOptions = optionGroups.reduce(
    (sum, group) => sum + (group.options?.length || 0),
    0
  );
  const totalFoodRows = dailyDays.reduce((sum, day) => {
    const meals = day.meals || day.sections || [];
    return sum + meals.reduce((mealSum, meal) => mealSum + (meal.items?.length || 0), 0);
  }, 0) + optionGroups.reduce((sum, group) => {
    return sum + (group.options || []).reduce(
      (optionSum, option) => optionSum + (option.items?.length || 0),
      0
    );
  }, 0);

  const safeActiveDayIndex = dailyDays.length
    ? Math.min(activeDayIndex, dailyDays.length - 1)
    : 0;
  const safeActiveOptionGroupIndex = optionGroups.length
    ? Math.min(activeOptionGroupIndex, optionGroups.length - 1)
    : 0;
  const activeDay = dailyDays[safeActiveDayIndex] || null;
  const activeDayMeals = activeDay ? activeDay.meals || activeDay.sections || [] : [];
  const activeOptionGroup = optionGroups[safeActiveOptionGroupIndex] || null;
  const activeOptions = activeOptionGroup?.options || [];

  function renderMealCard(meal, key) {
    const items = meal.items || [];

    return (
      <div
        key={key}
        className="rounded-[1.25rem] border border-slate-200 bg-white p-3.5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">
              {meal.name || meal.title || "Pasto"}
            </p>

          </div>

        </div>
        <DietFoodLines items={items} notes={meal.notes || []} />
      </div>
    );
  }

  function renderOptionCard(group, option, optionIndex) {
    const items = option.items || [];

    return (
      <div
        key={`${group?.meal || group?.title || "gruppo"}-${option.title}-${optionIndex}`}
        className="rounded-[1.25rem] border border-slate-200 bg-white p-3.5 shadow-sm"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-teal-700">
              {option.title || `Opzione ${optionIndex + 1}`}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-400">
              {group?.meal || group?.title || "Sezione"}
            </p>
          </div>

        </div>
        <DietFoodLines items={items} notes={option.notes || []} />
      </div>
    );
  }

  return (
    <div className="rounded-[1.6rem] border border-teal-100 bg-teal-50/70 p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-700">
            Pasti in app
          </p>
          <h3 className="mt-1 text-lg font-black text-slate-950">
            {isOptions ? "Opzioni alimentari" : "Piano giornaliero"}
          </h3>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
            Visualizzazione pronta per il cliente, organizzata in card semplici da consultare.
          </p>
        </div>

        {!compact && (
          <div className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-teal-700 shadow-sm">
            {isOptions ? "Scegli una sezione per consultare le alternative." : "Scegli un giorno per consultare i pasti."}
          </div>
        )}
      </div>



      {!isOptions && (
        <div className="mt-4 space-y-3">
          {!compact && dailyDays.length > 0 && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {dailyDays.map((day, dayIndex) => {
                const dayMeals = day.meals || day.sections || [];
                const isActive = safeActiveDayIndex === dayIndex;

                return (
                  <button
                    key={`${day.day || day.title}-${dayIndex}`}
                    type="button"
                    onClick={() => setActiveDayIndex(dayIndex)}
                    className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition active:scale-[.98] ${
                      isActive
                        ? "border-[#07111f] bg-[#07111f] text-white shadow-lg"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="text-sm font-black">{day.day || day.title}</p>

                  </button>
                );
              })}
            </div>
          )}

          {!compact && activeDay && (
            <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Giorno selezionato
                  </p>
                  <h4 className="mt-1 text-xl font-black text-slate-950">
                    {activeDay.day || activeDay.title}
                  </h4>
                </div>

              </div>

              <div className="grid gap-3 bg-slate-50 p-3 md:grid-cols-2">
                {activeDayMeals.length === 0 && (
                  <Empty
                    title="Nessun pasto riconosciuto"
                    text="Consulta il PDF originale per verificare questa giornata."
                  />
                )}

                {activeDayMeals.map((meal, mealIndex) =>
                  renderMealCard(
                    meal,
                    `${activeDay.day || activeDay.title}-${meal.name || meal.title}-${mealIndex}`
                  )
                )}
              </div>
            </div>
          )}

          {compact && visibleDays.map((day, dayIndex) => {
            const dayMeals = day.meals || day.sections || [];

            return (
              <details
                key={`${day.day || day.title}-${dayIndex}`}
                open={dayIndex === 0}
                className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="font-black text-slate-950">{day.day || day.title}</p>

                  </div>
                  <span className="rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black text-teal-700">
                    Apri
                  </span>
                </summary>

                <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                  {dayMeals.map((meal, mealIndex) =>
                    renderMealCard(
                      meal,
                      `${day.day || day.title}-${meal.name || meal.title}-${mealIndex}`
                    )
                  )}
                </div>
              </details>
            );
          })}


        </div>
      )}

      {isOptions && (
        <div className="mt-4 space-y-3">
          {!compact && optionGroups.length > 0 && (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {optionGroups.map((group, groupIndex) => {
                const isActive = safeActiveOptionGroupIndex === groupIndex;
                const optionCount = group.options?.length || 0;

                return (
                  <button
                    key={`${group.meal || group.title}-${groupIndex}`}
                    type="button"
                    onClick={() => setActiveOptionGroupIndex(groupIndex)}
                    className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition active:scale-[.98] ${
                      isActive
                        ? "border-[#07111f] bg-[#07111f] text-white shadow-lg"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="text-sm font-black">{group.meal || group.title}</p>

                  </button>
                );
              })}
            </div>
          )}

          {!compact && activeOptionGroup && (
            <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Sezione selezionata
                  </p>
                  <h4 className="mt-1 text-xl font-black text-slate-950">
                    {activeOptionGroup.meal || activeOptionGroup.title}
                  </h4>
                </div>

              </div>

              <div className="grid gap-3 bg-slate-50 p-3 md:grid-cols-2">
                {activeOptions.length === 0 && (
                  <Empty
                    title="Nessuna opzione riconosciuta"
                    text="Consulta il PDF originale per verificare questa sezione."
                  />
                )}

                {activeOptions.map((option, optionIndex) =>
                  renderOptionCard(activeOptionGroup, option, optionIndex)
                )}
              </div>
            </div>
          )}

          {compact && visibleOptionGroups.map((group, groupIndex) => (
            <details
              key={`${group.meal || group.title}-${groupIndex}`}
              open={groupIndex === 0}
              className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-black text-slate-950">{group.meal || group.title}</p>

                </div>
                <span className="rounded-full bg-teal-100 px-3 py-1 text-[11px] font-black text-teal-700">
                  Apri
                </span>
              </summary>

              <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-3">
                {(group.options || []).map((option, optionIndex) =>
                  renderOptionCard(group, option, optionIndex)
                )}
              </div>
            </details>
          ))}


        </div>
      )}
    </div>
  );
}

function dietExtractionStats(diet) {
  const extracted = dietExtractedInfo(diet);

  if (!extracted) {
    return {
      hasCards: false,
      isOptions: false,
      statusLabel: "Da analizzare",
      statusText: "Il PDF è presente, ma non ci sono ancora card pasti salvate.",
      statusClass: "bg-amber-100 text-amber-800",
      formatLabel: dietTypeLabel(diet?.diet_type),
      primaryCount: 0,
      primaryLabel: "Sezioni",
      secondaryCount: 0,
      secondaryLabel: "Card",
      totalItems: 0,
      warnings: diet?.file_path
        ? ["Premi Analizza PDF o Rigenera card per creare la visualizzazione pasti."]
        : ["Nessun PDF collegato a questa dieta."],
      confidence: 0,
      parserScopeLabel: "Prime 6 pagine escluse dal parsing Pasti"
    };
  }

  const days = Array.isArray(extracted.days) ? extracted.days : [];
  const optionGroups = Array.isArray(extracted.optionGroups)
    ? extracted.optionGroups
    : [];
  const isOptions =
    extracted.format === "options_pdf" ||
    (optionGroups.length > 0 && days.length === 0);

  const totalMeals = days.reduce(
    (sum, day) => sum + ((day.meals || day.sections || []).length || 0),
    0
  );
  const totalOptions = optionGroups.reduce(
    (sum, group) => sum + ((group.options || []).length || 0),
    0
  );
  const totalDailyItems = days.reduce((sum, day) => {
    const meals = day.meals || day.sections || [];
    return (
      sum +
      meals.reduce((mealSum, meal) => mealSum + ((meal.items || []).length || 0), 0)
    );
  }, 0);
  const totalOptionItems = optionGroups.reduce((sum, group) => {
    return (
      sum +
      (group.options || []).reduce(
        (optionSum, option) => optionSum + ((option.items || []).length || 0),
        0
      )
    );
  }, 0);

  const warnings = Array.isArray(extracted.warnings)
    ? extracted.warnings.filter(Boolean)
    : [];
  const rawConfidence = Number(
    extracted.confidence || extracted.score || extracted.parseScore || 0
  );
  const confidence =
    rawConfidence > 100
      ? Math.min(99, Math.max(30, Math.round((rawConfidence / (rawConfidence + 60)) * 100)))
      : rawConfidence;
  const totalCards = isOptions ? totalOptions : totalMeals;
  const totalItems = isOptions ? totalOptionItems : totalDailyItems;
  const skippedIntroPages = Number(extracted.skippedIntroPages || 0);
  const parseStartPage = Number(extracted.parseStartPage || 1);
  const pageCount = Number(extracted.pageCount || 0);
  const parserScopeLabel = skippedIntroPages > 0
    ? `Pasti letti da pagina ${parseStartPage}${pageCount ? ` a ${pageCount}` : ""}. Prime ${skippedIntroPages} pagine escluse.`
    : "Pasti letti dall’intero PDF.";

  let statusLabel = "Card pronte";
  let statusText = "La dieta ha card generate e consultabili nel tab Pasti.";
  let statusClass = "bg-teal-100 text-teal-800";

  if (totalCards === 0) {
    statusLabel = "Da rigenerare";
    statusText = "Il PDF è stato letto, ma le card generate sono insufficienti.";
    statusClass = "bg-amber-100 text-amber-800";
  } else if (warnings.length > 0 || confidence < 70) {
    statusLabel = "Da controllare";
    statusText = "Le card sono state create, ma conviene fare un controllo rapido.";
    statusClass = "bg-amber-100 text-amber-800";
  }

  return {
    hasCards: totalCards > 0,
    isOptions,
    statusLabel,
    statusText,
    statusClass,
    formatLabel: isOptions ? "Formato opzioni" : "Formato giorni",
    primaryCount: isOptions ? optionGroups.length : days.length,
    primaryLabel: isOptions ? "Sezioni" : "Giorni",
    secondaryCount: totalCards,
    secondaryLabel: isOptions ? "Opzioni" : "Pasti",
    totalItems,
    warnings,
    confidence,
    parserScopeLabel
  };
}

function DietParseQualityCard({ diet, compact = false, onAnalyze, analyzing = false }) {
  const stats = dietExtractionStats(diet);

  return (
    <div
      className={`rounded-[1.35rem] border border-slate-200 bg-white ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
            Controllo card
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="font-black text-slate-950">
              Visualizzazione cliente
            </p>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${stats.statusClass}`}>
              {stats.statusLabel}
            </span>
          </div>
          {!compact && (
            <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
              {stats.statusText}
            </p>
          )}
        </div>

        {onAnalyze && (
          <Button
            onClick={onAnalyze}
            disabled={analyzing || !diet?.file_path}
            className="shrink-0 border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800"
          >
            {analyzing ? "Preparazione..." : stats.hasCards ? "Rigenera vista" : "Genera vista"}
          </Button>
        )}
      </div>

      <div className={`mt-3 grid gap-2 text-center ${compact ? "grid-cols-2" : "grid-cols-2"}`}>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm font-black text-slate-950">{stats.primaryCount}</p>
          <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
            {stats.primaryLabel}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <p className="text-sm font-black text-slate-950">{stats.secondaryCount}</p>
          <p className="mt-0.5 text-[9px] font-black uppercase tracking-wider text-slate-400">
            {stats.secondaryLabel}
          </p>
        </div>
      </div>



      {!compact && (
        <p className="mt-3 text-[11px] font-semibold leading-5 text-slate-500">
          Questa è l’anteprima della sezione Pasti che vedrà il cliente. Il PDF resta sempre disponibile nel tab dedicato.
        </p>
      )}
    </div>
  );
}

function pdfViewerSrc(url) {
  if (!url) return "";
  return `${url}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`;
}

function DietPdfPageCanvas({ pdf, pageNumber, mode = "inline" }) {
  const [canvasNode, setCanvasNode] = useState(null);
  const [renderError, setRenderError] = useState("");

  useEffect(() => {
    let cancelled = false;
    let renderTask = null;

    async function renderPage() {
      if (!pdf || !canvasNode) return;

      setRenderError("");

      try {
        const page = await pdf.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(
          280,
          Math.min(
            mode === "fullscreen" ? window.innerWidth - 24 : window.innerWidth - 48,
            mode === "fullscreen" ? 980 : 860
          )
        );
        const scale = availableWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });
        const pixelRatio = window.devicePixelRatio || 1;
        const context = canvasNode.getContext("2d");

        canvasNode.width = Math.floor(viewport.width * pixelRatio);
        canvasNode.height = Math.floor(viewport.height * pixelRatio);
        canvasNode.style.width = `${Math.floor(viewport.width)}px`;
        canvasNode.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, viewport.width, viewport.height);

        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
      } catch (error) {
        if (!cancelled) {
          setRenderError(error?.message || "Pagina PDF non renderizzata.");
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      if (renderTask) {
        try {
          renderTask.cancel();
        } catch {
          // rendering already completed
        }
      }
    };
  }, [pdf, pageNumber, canvasNode, mode]);

  return (
    <div className="mx-auto w-full max-w-[980px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          Pagina {pageNumber}
        </p>
        {renderError && (
          <p className="text-[10px] font-bold text-red-600">
            Errore rendering
          </p>
        )}
      </div>

      {renderError ? (
        <div className="p-4 text-sm font-bold leading-6 text-red-700">
          {renderError}
        </div>
      ) : (
        <div className="overflow-x-auto bg-slate-100 p-2">
          <canvas
            ref={setCanvasNode}
            className="mx-auto block max-w-none bg-white"
          />
        </div>
      )}
    </div>
  );
}

function DietPdfPagesViewer({ url, mode = "inline" }) {
  const [pdfState, setPdfState] = useState({
    loading: false,
    error: "",
    pdf: null,
    pageCount: 0
  });

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;

    async function loadPdf() {
      if (!url) {
        setPdfState({ loading: false, error: "", pdf: null, pageCount: 0 });
        return;
      }

      setPdfState({ loading: true, error: "", pdf: null, pageCount: 0 });

      try {
        const pdfjsLib = await loadPdfJsForDietExtraction();
        loadingTask = pdfjsLib.getDocument({
          url,
          withCredentials: false,
          disableAutoFetch: false,
          disableStream: false
        });
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        setPdfState({
          loading: false,
          error: "",
          pdf,
          pageCount: pdf.numPages || 0
        });
      } catch (error) {
        if (!cancelled) {
          setPdfState({
            loading: false,
            error:
              error?.message ||
              "Non riesco a leggere il PDF dentro l’app. Usa Scarica PDF come fallback.",
            pdf: null,
            pageCount: 0
          });
        }
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (loadingTask) {
        try {
          loadingTask.destroy();
        } catch {
          // pdf loading already completed
        }
      }
    };
  }, [url]);

  if (pdfState.loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 text-center">
        <div>
          <FileText className="mx-auto text-teal-700" size={32} />
          <p className="mt-3 font-black text-slate-950">
            Rendering PDF in corso...
          </p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Sto caricando tutte le pagine, non solo la prima.
          </p>
        </div>
      </div>
    );
  }

  if (pdfState.error) {
    return (
      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
        {pdfState.error}
      </div>
    );
  }

  if (!pdfState.pdf || pdfState.pageCount === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <FileText className="mx-auto text-slate-400" />
        <p className="mt-3 font-black text-slate-950">
          PDF non ancora caricato.
        </p>
      </div>
    );
  }

  return (
    <div className={mode === "fullscreen" ? "space-y-4 pb-4" : "space-y-4"}>
      <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3">
        <p className="text-xs font-black text-teal-900">
          PDF renderizzato dentro TMFIT · {pdfState.pageCount} pagine
        </p>
        <p className="mt-1 text-[11px] font-bold leading-5 text-teal-800">
          Scorri verticalmente: ogni pagina viene disegnata nell’app per migliorare la lettura mobile.
        </p>
      </div>

      {Array.from({ length: pdfState.pageCount }, (_, index) => (
        <DietPdfPageCanvas
          key={`${url}-${index + 1}`}
          pdf={pdfState.pdf}
          pageNumber={index + 1}
          mode={mode}
        />
      ))}
    </div>
  );
}

function DietPdfInlineViewer({ url, title = "PDF dieta", onOpenFull, onOpenExternal }) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-700">
            Lettura integrata
          </p>
          <p className="mt-1 truncate text-sm font-black text-slate-950">
            {title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
          <button
            type="button"
            onClick={onOpenFull}
            className="rounded-xl bg-[#07111f] px-3 py-2 text-xs font-black text-white active:scale-[.98]"
          >
            Schermo interno
          </button>

          <button
            type="button"
            onClick={onOpenExternal}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 active:scale-[.98]"
          >
            Scarica PDF
          </button>
        </div>
      </div>

      <div className="block border-b border-slate-200 bg-teal-50 px-4 py-3 md:hidden">
        <p className="text-xs font-bold leading-5 text-teal-900">
          Su smartphone usa “Schermo interno” per leggere il PDF a pieno schermo dentro l’app.
        </p>
      </div>

      <div className="max-h-[72dvh] overflow-y-auto bg-slate-100 p-3 md:max-h-[82vh] md:p-4">
        <DietPdfPagesViewer url={url} mode="inline" />
      </div>
    </div>
  );
}

function DietPdfFullscreenModal({
  open,
  title = "Piano alimentare",
  fileName = "PDF dieta",
  preview,
  onClose,
  onOpenExternal
}) {
  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex h-[100dvh] flex-col bg-[#07111f] text-white">
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-[#07111f] px-4 py-4 pt-[calc(1rem+env(safe-area-inset-top))] md:px-6">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-300">
            Modalità lettura
          </p>
          <h2 className="mt-1 truncate text-lg font-black leading-tight md:text-2xl">
            {title}
          </h2>
          <p className="mt-1 truncate text-xs font-semibold text-slate-400 md:text-sm">
            {fileName}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {preview?.url && (
            <button
              type="button"
              onClick={onOpenExternal}
              className="hidden rounded-2xl bg-white/10 px-4 py-3 text-xs font-black text-white md:inline-flex"
            >
              Scarica PDF
            </button>
          )}

          <button
            type="button"
            aria-label="Chiudi PDF"
            onClick={onClose}
            className="rounded-2xl bg-white/10 p-3 text-white active:scale-[.98]"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-slate-950 p-2 md:p-4">
        {preview?.loading && (
          <div className="grid h-full place-items-center rounded-[1.5rem] border border-white/10 bg-white/5 text-sm font-black text-slate-300">
            Caricamento PDF...
          </div>
        )}

        {!preview?.loading && preview?.error && (
          <div className="m-3 rounded-2xl border border-red-300/30 bg-red-500/10 p-4 text-sm font-bold leading-6 text-red-100">
            {preview.error}
          </div>
        )}

        {!preview?.loading && preview?.url && (
          <div className="h-full overflow-y-auto rounded-[1.4rem] bg-slate-100 p-3 shadow-2xl md:p-4">
            <DietPdfPagesViewer url={preview.url} mode="fullscreen" />
          </div>
        )}

        {!preview?.loading && !preview?.url && !preview?.error && (
          <div className="grid h-full place-items-center rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-center">
            <div>
              <FileText className="mx-auto text-teal-300" size={34} />
              <p className="mt-3 font-black text-white">
                PDF non ancora caricato nel viewer.
              </p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-400">
                Chiudi e riapri la modalità lettura dalla card dieta.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-white/10 bg-[#07111f] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
        <button
          type="button"
          onClick={onOpenExternal}
          disabled={!preview?.url}
          className="rounded-2xl bg-white/10 px-3 py-3 text-xs font-black text-white disabled:opacity-40"
        >
          Scarica PDF
        </button>

        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl bg-teal-300 px-3 py-3 text-xs font-black text-slate-950"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") return;

    const registerServiceWorker = () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => {
          console.warn("TMFIT service worker non registrato", error?.message || error);
        });
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
      return;
    }

    window.addEventListener("load", registerServiceWorker);

    return () => window.removeEventListener("load", registerServiceWorker);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoadingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingSession(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user) {
        setProfile(null);
        return;
      }

      setLoadingProfile(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .maybeSingle();

      if (error) console.warn(error.message);

      setProfile(data || null);
      setLoadingProfile(false);
    }

    loadProfile();
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }

  if (!supabase) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111f] p-6 text-white">
        <Card className="max-w-xl p-8 text-center text-slate-950">
          <h1 className="text-2xl font-black">Supabase non configurato</h1>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Controlla NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        </Card>
      </div>
    );
  }

  if (loadingSession || loadingProfile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111f] text-white">
        Caricamento TMFIT...
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <Card className="max-w-xl p-8 text-center">
          <h1 className="text-2xl font-black">Profilo non configurato</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            L’utente esiste in Supabase Auth, ma manca la riga nella tabella
            profiles.
          </p>

          <Button onClick={handleLogout} className="mt-5 bg-[#07111f] text-white">
            Esci
          </Button>
        </Card>
      </div>
    );
  }

  const legalAccepted =
  profile.terms_version === LEGAL_VERSION &&
  profile.privacy_version === LEGAL_VERSION &&
  profile.coaching_consent_version === LEGAL_VERSION &&
  profile.terms_accepted_at &&
  profile.privacy_accepted_at &&
  profile.coaching_consent_accepted_at;

if (!legalAccepted) {
  return (
    <LegalAcceptanceScreen
      session={session}
      onAccepted={(updatedProfile) => setProfile(updatedProfile)}
      onLogout={handleLogout}
    />
  );
}

if (profile.role === "professional") {
  return (
    <ProfessionalDashboard
      session={session}
      userProfile={profile}
      onLogout={handleLogout}
    />
  );
}

return (
  <ClientDashboard
    session={session}
    userProfile={profile}
    onLogout={handleLogout}
  />
);
}
function ProfessionalDashboard({ session, userProfile, onLogout }) {
  const [activeTab, setActiveTab] = usePersistedState("tmfit_pro_tab", "dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = usePersistedState(
    "tmfit_selected_client",
    ""
  );
  const [clientPanel, setClientPanel] = usePersistedState(
    "tmfit_clients_panel",
    "overview"
  );
  const [programPanel, setProgramPanel] = usePersistedState(
    "tmfit_programs_panel",
    "builder"
  );
  const [builderStep, setBuilderStep] = usePersistedState(
    "tmfit_builder_step",
    "setup"
  );

  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
const [coachControlLoading, setCoachControlLoading] = useState(false);
const [coachControlData, setCoachControlData] = useState({
  plans: [],
  diets: [],
  checkins: [],
  photos: [],
  sessions: []
});
  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [diets, setDiets] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loadHistory, setLoadHistory] = useState([]);
  const [privateNotes, setPrivateNotes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [exerciseMedia, setExerciseMedia] = useState([]);
  const [templates, setTemplates] = useState([]);
const [savingTemplate, setSavingTemplate] = useState(false);
const [deletingTemplateId, setDeletingTemplateId] = useState("");

  const [credentials, setCredentials] = useState(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [clientError, setClientError] = useState("");
  const [deletingClient, setDeletingClient] = useState(false);
  const [deletingProgramId, setDeletingProgramId] = useState("");
  const [updatingProgramId, setUpdatingProgramId] = useState("");
const [editingProgramId, setEditingProgramId] = useState("");
const [editingProgramTitle, setEditingProgramTitle] = useState("");
  const [newClient, setNewClient] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    gender: "uomo",
    birth_date: "",
    height_cm: "",
    goal: "",
    notes: ""
  });

  const [builder, setBuilder] = useState(createSmartBuilder());
  const [savingPlan, setSavingPlan] = useState(false);

  const [dietForm, setDietForm] = useState({
    title: "",
    diet_type: "daily_pdf",
    calorie_target: "",
    summary: "",
    start_date: "",
    end_date: "",
    notes: ""
  });
  const [dietFile, setDietFile] = useState(null);
  const [extractingDietPdf, setExtractingDietPdf] = useState(false);
  const [analyzingDietId, setAnalyzingDietId] = useState("");
  const [dietPreview, setDietPreview] = useState({
    dietId: "",
    url: "",
    loading: false,
    error: ""
  });
  const [dietFullscreenOpen, setDietFullscreenOpen] = useState(false);

  const [measurementForm, setMeasurementForm] = useState({
    measurement_date: today(),
    weight_kg: "",
    body_fat_percentage: "",
    lean_mass_kg: "",
    waist_cm: "",
    hips_cm: "",
    chest_cm: "",
    abdomen_cm: "",
    right_arm_cm: "",
    left_arm_cm: "",
    right_thigh_cm: "",
    left_thigh_cm: "",
    notes: ""
  });
const [privateNoteText, setPrivateNoteText] = useState("");
const [savingPrivateNote, setSavingPrivateNote] = useState(false);
  const [postForm, setPostForm] = useState({
    title: "",
    body: "",
    client_scope: "selected",
    is_pinned: false
  });

  const selectedClient =
    clients.find((client) => String(client.id) === String(selectedClientId)) ||
    null;
  const previewDietForModal =
    diets.find((diet) => String(diet.id) === String(dietPreview.dietId)) ||
    diets[0] ||
    null;

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const text = `${fullName(client)} ${client.email || ""} ${
        client.goal || ""
      }`.toLowerCase();

      return text.includes(query.toLowerCase());
    });
  }, [clients, query]);

  const mediaById = useMemo(() => {
    const map = new Map();
    exerciseMedia.forEach((item) => map.set(item.id, item));
    return map;
  }, [exerciseMedia]);

  const professionalTabs = [
    { id: "dashboard", label: "Oggi", icon: <Activity size={17} /> },
    { id: "clients", label: "Clienti", icon: <Users size={17} /> },
    { id: "programs", label: "Programmi", icon: <Dumbbell size={17} /> },
    { id: "monitor", label: "Monitor", icon: <ClipboardCheck size={17} /> },
    { id: "measurements", label: "Misure", icon: <Scale size={17} /> },
    { id: "diets", label: "Diete", icon: <FileText size={17} /> },
    { id: "posts", label: "Bacheca", icon: <Megaphone size={17} /> }
  ];

  useEffect(() => {
  loadClients();
  loadPosts();
  loadExerciseMedia();
  loadTemplates();
}, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientBundle(selectedClient.id);
    }
  }, [selectedClientId, clients.length]);

  async function loadClients() {
    setLoading(true);

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.warn(error.message);

    const rows = data || [];
    setClients(rows);

   if (rows.length && !selectedClientId) {
  setSelectedClientId(String(rows[0].id));
}

await loadCoachControlCenter(rows);

setLoading(false);
  }
async function loadCoachControlCenter(rows = clients) {
  const clientIds = rows
    .map((client) => Number(client.id))
    .filter((id) => !Number.isNaN(id));

  if (clientIds.length === 0) {
    setCoachControlData({
      plans: [],
      diets: [],
      checkins: [],
      photos: [],
      sessions: []
    });
    return;
  }

  setCoachControlLoading(true);

  try {
    const [
      plansResult,
      dietsResult,
      checkinsResult,
      photosResult,
      sessionsResult
    ] = await Promise.all([
      supabase
        .from("workout_plans")
        .select("*")
        .in("client_id", clientIds)
        .order("created_at", { ascending: false }),

      supabase
        .from("diets")
        .select("*")
        .in("client_id", clientIds)
        .order("created_at", { ascending: false }),

      supabase
        .from("client_checkins")
        .select("*")
        .in("client_id", clientIds)
        .order("checkin_date", { ascending: false }),

      supabase
        .from("progress_photos")
        .select("*")
        .in("client_id", clientIds)
        .order("photo_date", { ascending: false }),

      supabase
        .from("workout_sessions")
        .select("*")
        .in("client_id", clientIds)
        .order("session_date", { ascending: false })
    ]);

    if (plansResult.error) console.warn(plansResult.error.message);
    if (dietsResult.error) console.warn(dietsResult.error.message);
    if (checkinsResult.error) console.warn(checkinsResult.error.message);
    if (photosResult.error) console.warn(photosResult.error.message);
    if (sessionsResult.error) console.warn(sessionsResult.error.message);

    setCoachControlData({
      plans: plansResult.data || [],
      diets: dietsResult.data || [],
      checkins: checkinsResult.data || [],
      photos: photosResult.data || [],
      sessions: sessionsResult.data || []
    });
  } finally {
    setCoachControlLoading(false);
  }
}
  async function loadExerciseMedia() {
    const { data, error } = await supabase
      .from("exercise_media_library")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.warn(error.message);
      return;
    }

    setExerciseMedia(data || []);
  }
async function loadTemplates() {
  const { data, error } = await supabase
    .from("workout_program_templates")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn(error.message);
    return;
  }

  setTemplates(data || []);
}
  async function loadClientBundle(clientId) {
    const numericClientId = Number(clientId);

    const { data: planData, error: planError } = await supabase
      .from("workout_plans")
      .select(
        `
        *,
        workout_weeks (
          *,
          workout_days (
            *,
            workout_blocks (
              *,
              workout_exercises (
                *,
                exercise_media_library (*),
                workout_exercise_sets (*),
                workout_exercise_progressions (*)
              )
            )
          )
        )
      `
      )
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    if (planError) console.warn(planError.message);
    setPlans(normalizePlans(planData || []));

    const { data: sessionData } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false })
      .limit(30);

    setSessions(sessionData || []);

    const { data: logData } = await supabase
      .from("workout_set_logs")
      .select(
        "*, workout_exercises(exercise_name), workout_sessions!inner(client_id, session_date)"
      )
      .eq("workout_sessions.client_id", numericClientId)
      .order("created_at", { ascending: false })
      .limit(50);

    setLogs(logData || []);

    const { data: dietData } = await supabase
      .from("diets")
      .select("*")
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    setDiets(dietData || []);

    const { data: checkinData } = await supabase
      .from("client_checkins")
      .select("*")
      .eq("client_id", numericClientId)
      .order("checkin_date", { ascending: false })
      .limit(30);

    setCheckins(checkinData || []);

    const { data: measurementData } = await supabase
      .from("client_measurements")
      .select("*")
      .eq("client_id", numericClientId)
      .order("measurement_date", { ascending: false });

    setMeasurements(measurementData || []);

    const { data: photoData } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("client_id", numericClientId)
      .order("photo_date", { ascending: false });

    setPhotos(photoData || []);
    const { data: historyData, error: historyError } = await supabase
  .from("workout_set_logs")
  .select(
    "*, workout_exercises(exercise_name), workout_sessions!inner(client_id, session_date)"
  )
  .eq("workout_sessions.client_id", numericClientId)
  .order("created_at", { ascending: false })
  .limit(500);

if (historyError) {
  console.warn(historyError.message);
} else {
  setLoadHistory(historyData || []);
}

    const { data: noteData } = await supabase
      .from("client_private_notes")
      .select("*")
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    setPrivateNotes(noteData || []);
  }

  async function loadPosts() {
    const { data } = await supabase
      .from("coach_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setPosts(data || []);
  }

  function normalizeName(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function findMediaForExercise(name) {
    const normalized = normalizeName(name);

    if (!normalized) return null;

    const exact = exerciseMedia.find((item) => normalizeName(item.name) === normalized);
    if (exact) return exact;

    return (
      exerciseMedia.find((item) => {
        const mediaName = normalizeName(item.name);
        return mediaName.includes(normalized) || normalized.includes(mediaName);
      }) || null
    );
  }
function getBuilderStats() {
  const totalDays = builder.days.length;

  const totalExercises = builder.days.reduce((sum, day) => {
    return sum + day.exercises.filter((exercise) => exercise.exercise_name.trim()).length;
  }, 0);

  const totalProgressions = builder.days.reduce((sum, day) => {
    return (
      sum +
      day.exercises.filter(
        (exercise) =>
          exercise.exercise_name.trim() && exercise.has_weekly_progression
      ).length
    );
  }, 0);

  const estimatedMinutes = builder.days.reduce((sum, day) => {
    return sum + (Number(day.estimated_minutes) || 0);
  }, 0);

  return {
    totalDays,
    totalExercises,
    totalProgressions,
    estimatedMinutes
  };
}

function getBuilderQualityReport() {
  const warnings = [];
  const suggestions = [];
  const days = Array.isArray(builder.days) ? builder.days : [];

  const filledExercises = days.flatMap((day) =>
    (day.exercises || []).filter((exercise) =>
      String(exercise.exercise_name || "").trim()
    )
  );

  const daysWithoutExercises = days.filter((day) =>
    !(day.exercises || []).some((exercise) =>
      String(exercise.exercise_name || "").trim()
    )
  );

  const exercisesWithoutBasics = filledExercises.filter(
    (exercise) => !String(exercise.sets || "").trim() || !String(exercise.reps || "").trim()
  );

  const exercisesWithoutRecovery = filledExercises.filter(
    (exercise) => !Number(exercise.recovery_seconds)
  );

  const exercisesWithoutIntensity = filledExercises.filter(
    (exercise) => !String(exercise.target_rpe || "").trim() && !String(exercise.target_rir || "").trim()
  );

  const progressionExercises = filledExercises.filter(
    (exercise) => exercise.has_weekly_progression
  );

  const longDays = days.filter((day) => Number(day.estimated_minutes) > 90);
  const shortDays = days.filter((day) => Number(day.estimated_minutes) && Number(day.estimated_minutes) < 35);

  if (!selectedClient) {
    warnings.push("Seleziona un cliente prima di salvare il programma.");
  }

  if (!String(builder.title || "").trim()) {
    warnings.push("Manca il titolo del programma.");
  }

  if (filledExercises.length === 0) {
    warnings.push("Inserisci almeno un esercizio prima di salvare.");
  }

  if (daysWithoutExercises.length > 0) {
    warnings.push(
      `${daysWithoutExercises.length} allenamento/i non hanno ancora esercizi compilati.`
    );
  }

  if (exercisesWithoutBasics.length > 0) {
    warnings.push(
      `${exercisesWithoutBasics.length} esercizio/i hanno serie o ripetizioni mancanti.`
    );
  }

  if (!String(builder.goal || "").trim()) {
    suggestions.push("Aggiungi un obiettivo chiaro: ipertrofia, forza, ricomposizione, dimagrimento.");
  }

  if (exercisesWithoutRecovery.length > 0) {
    suggestions.push("Completa i recuperi: aiutano il cliente nella modalità Allenati.");
  }

  if (exercisesWithoutIntensity.length > 0) {
    suggestions.push("Aggiungi RPE o RIR almeno sugli esercizi principali.");
  }

  if (Number(builder.duration_weeks) >= 4 && progressionExercises.length === 0) {
    suggestions.push("Valuta una progressione settimanale per i multiarticolari principali.");
  }

  if (longDays.length > 0) {
    suggestions.push("Alcuni allenamenti superano 90 minuti: valuta se snellire volume o recuperi.");
  }

  if (shortDays.length > 0) {
    suggestions.push("Alcuni allenamenti sono molto brevi: controlla che volume e focus siano sufficienti.");
  }

  const baseScore = 100;
  const score = Math.max(
    0,
    baseScore - warnings.length * 18 - suggestions.length * 7
  );

  let statusLabel = "Pronto";
  let statusText = "La scheda è ordinata e pronta per essere assegnata.";
  let statusClass = "bg-teal-300 text-slate-950";

  if (warnings.length > 0) {
    statusLabel = "Da completare";
    statusText = "Sistema gli elementi obbligatori prima di salvare.";
    statusClass = "bg-amber-300 text-slate-950";
  } else if (suggestions.length > 0) {
    statusLabel = "Buono, da rifinire";
    statusText = "La scheda può essere salvata, ma ci sono ottimizzazioni consigliate.";
    statusClass = "bg-sky-100 text-sky-700";
  }

  return {
    score,
    statusLabel,
    statusText,
    statusClass,
    warnings,
    suggestions,
    checks: [
      {
        label: "Cliente",
        done: Boolean(selectedClient),
        helper: selectedClient ? fullName(selectedClient) : "Non selezionato"
      },
      {
        label: "Setup",
        done: Boolean(String(builder.title || "").trim()),
        helper: builder.title || "Titolo mancante"
      },
      {
        label: "Esercizi",
        done: filledExercises.length > 0,
        helper: `${filledExercises.length} compilati`
      },
      {
        label: "Progressioni",
        done: progressionExercises.length > 0,
        helper: `${progressionExercises.length} attive`
      }
    ]
  };
}
  function updateBuilder(mutator) {
    setBuilder((prev) => {
      const next = clone(prev);
      mutator(next);
      return next;
    });
  }

  function updateDurationWeeks(value) {
    const weeks = Number(value) || 1;

    updateBuilder((next) => {
      next.duration_weeks = weeks;

      next.days.forEach((day) => {
        day.exercises.forEach((exercise) => {
          const current = exercise.progressions || [];
          const updated = [];

          for (let index = 1; index <= weeks; index += 1) {
            const existing = current.find(
              (item) => Number(item.week_number) === index
            );

            updated.push(
              existing || {
                temp_id: uid(),
                week_number: index,
                target_sets: "",
                target_reps: "",
                target_load_text: "",
                target_load_kg: "",
                target_rpe: "",
                target_rir: "",
                recovery_seconds: "",
                notes: ""
              }
            );
          }

          exercise.progressions = updated;
        });
      });
    });
  }

  function addWorkoutDay() {
    updateBuilder((next) => {
      const letter = String.fromCharCode(65 + next.days.length);
      next.days.push(defaultWorkoutDay(letter));
    });
  }

  function removeWorkoutDay(dayIndex) {
    updateBuilder((next) => {
      if (next.days.length > 1) {
        next.days.splice(dayIndex, 1);
      }
    });
  }
  function duplicateWorkoutDay(dayIndex) {
  updateBuilder((next) => {
    const sourceDay = next.days[dayIndex];
    const copy = clone(sourceDay);

    copy.temp_id = uid();
    copy.title = `${sourceDay.title || `Allenamento ${dayIndex + 1}`} copia`;

    copy.exercises = copy.exercises.map((exercise) => ({
      ...exercise,
      temp_id: uid(),
      progressions: (exercise.progressions || []).map((progression) => ({
        ...progression,
        temp_id: uid()
      }))
    }));

    next.days.splice(dayIndex + 1, 0, copy);
  });
}

function moveWorkoutDay(dayIndex, direction) {
  updateBuilder((next) => {
    const targetIndex = dayIndex + direction;

    if (targetIndex < 0 || targetIndex >= next.days.length) return;

    const [removedDay] = next.days.splice(dayIndex, 1);
    next.days.splice(targetIndex, 0, removedDay);
  });
}

function moveExerciseRow(dayIndex, exerciseIndex, direction) {
  updateBuilder((next) => {
    const exercises = next.days[dayIndex].exercises;
    const targetIndex = exerciseIndex + direction;

    if (targetIndex < 0 || targetIndex >= exercises.length) return;

    const [removedExercise] = exercises.splice(exerciseIndex, 1);
    exercises.splice(targetIndex, 0, removedExercise);
  });
}

  function addExerciseRow(dayIndex) {
    updateBuilder((next) => {
      next.days[dayIndex].exercises.push(defaultExerciseRow());
    });
  }

  function duplicateExerciseRow(dayIndex, exerciseIndex) {
    updateBuilder((next) => {
      const copy = clone(next.days[dayIndex].exercises[exerciseIndex]);
      copy.temp_id = uid();
      copy.exercise_name = `${copy.exercise_name} copia`;
      copy.progressions = copy.progressions.map((progression) => ({
        ...progression,
        temp_id: uid()
      }));
      next.days[dayIndex].exercises.splice(exerciseIndex + 1, 0, copy);
    });
  }

  function removeExerciseRow(dayIndex, exerciseIndex) {
    updateBuilder((next) => {
      if (next.days[dayIndex].exercises.length > 1) {
        next.days[dayIndex].exercises.splice(exerciseIndex, 1);
      }
    });
  }

  function toggleExerciseProgression(dayIndex, exerciseIndex, checked) {
    updateBuilder((next) => {
      const exercise = next.days[dayIndex].exercises[exerciseIndex];
      exercise.has_weekly_progression = checked;

      if (!exercise.progressions || exercise.progressions.length === 0) {
        exercise.progressions = defaultProgressions();
      }

      const weeks = Number(next.duration_weeks) || 4;

      while (exercise.progressions.length < weeks) {
        exercise.progressions.push({
          temp_id: uid(),
          week_number: exercise.progressions.length + 1,
          target_sets: "",
          target_reps: "",
          target_load_text: "",
          target_load_kg: "",
          target_rpe: "",
          target_rir: "",
          recovery_seconds: "",
          notes: ""
        });
      }

      exercise.progressions = exercise.progressions.slice(0, weeks);
    });
  }
function updateExerciseField(dayIndex, exerciseIndex, field, value) {
  updateBuilder((next) => {
    next.days[dayIndex].exercises[exerciseIndex][field] = value;
  });
}

function updateProgressionField(
  dayIndex,
  exerciseIndex,
  progressionIndex,
  field,
  value
) {
  updateBuilder((next) => {
    next.days[dayIndex].exercises[exerciseIndex].progressions[
      progressionIndex
    ][field] = value;
  });
}
  async function createClient(event) {
    event.preventDefault();

    setClientError("");
    setCredentials(null);
    setCreatingClient(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.access_token) {
        setClientError(
          "Sessione non valida. Esci e rientra con il login professionista."
        );
        return;
      }

      const response = await fetch("/api/create-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify(newClient)
      });

      const result = await response.json();

      if (!response.ok) {
        setClientError(result.error || "Errore creazione cliente.");
        return;
      }

      setCredentials({
        email: result.login_email,
        password: result.temporary_password
      });

      setClients((prev) => [result.client, ...prev]);
      setSelectedClientId(String(result.client.id));

      setNewClient({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        gender: "uomo",
        birth_date: "",
        height_cm: "",
        goal: "",
        notes: ""
      });
    } catch (error) {
      setClientError(
        error.message || "Errore imprevisto durante la creazione cliente."
      );
    } finally {
      setCreatingClient(false);
    }
  }

  async function deleteSelectedClient() {
    if (!selectedClient) return;

    const confirmed = window.confirm(
      `Vuoi davvero eliminare ${fullName(
        selectedClient
      )}? Verranno eliminati login, schede, log, diete, check-in, foto e misurazioni.`
    );

    if (!confirmed) return;

    setDeletingClient(true);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.access_token) {
        alert("Sessione non valida. Esci e rientra.");
        return;
      }

      const response = await fetch("/api/delete-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({ client_id: selectedClient.id })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Errore eliminazione cliente.");
        return;
      }

      const remainingClients = clients.filter(
        (client) => String(client.id) !== String(selectedClient.id)
      );

      setClients(remainingClients);
      setSelectedClientId(
        remainingClients[0]?.id ? String(remainingClients[0].id) : ""
      );
      setPlans([]);
      setLogs([]);
      setSessions([]);
      setDiets([]);
      setCheckins([]);
      setMeasurements([]);
      setPhotos([]);
      setPrivateNotes([]);
    } catch (error) {
      alert(error.message || "Errore imprevisto durante eliminazione cliente.");
    } finally {
      setDeletingClient(false);
    }
  }

  async function deleteProgram(program) {
    if (!program) return;

    const confirmed = window.confirm(
      `Vuoi davvero eliminare il programma "${program.title}"?`
    );

    if (!confirmed) return;

    setDeletingProgramId(program.id);

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.access_token) {
        alert("Sessione non valida. Esci e rientra.");
        return;
      }

      const response = await fetch("/api/delete-program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionData.session.access_token}`
        },
        body: JSON.stringify({ program_id: program.id })
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Errore eliminazione programma.");
        return;
      }

      setPlans((prev) => prev.filter((item) => item.id !== program.id));

      if (selectedClient) {
        await loadClientBundle(selectedClient.id);
      }
    } catch (error) {
      alert(error.message || "Errore imprevisto durante eliminazione programma.");
    } finally {
      setDeletingProgramId("");
    }
  }
async function updateProgramStatus(program, status) {
  if (!program) return;

  const label = status === "active" ? "riattivare" : "archiviare";

  const confirmed = window.confirm(
    `Vuoi davvero ${label} il programma "${program.title}"?`
  );

  if (!confirmed) return;

  setUpdatingProgramId(program.id);

  try {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError || !sessionData.session?.access_token) {
      alert("Sessione non valida. Esci e rientra.");
      return;
    }

    const response = await fetch("/api/update-program-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({
        program_id: program.id,
        status
      })
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.error || "Errore aggiornamento programma.");
      return;
    }

    if (selectedClient) {
      await loadClientBundle(selectedClient.id);
    }
  } catch (error) {
    alert(error.message || "Errore imprevisto durante aggiornamento programma.");
  } finally {
    setUpdatingProgramId("");
  }
}

function buildProgressionsFromExercise(exercise, weeks) {
  const existing = exercise.workout_exercise_progressions || [];

  return Array.from({ length: weeks }).map((_, index) => {
    const weekNumber = index + 1;

    const found = existing.find(
      (item) => Number(item.week_number) === weekNumber
    );

    return {
      temp_id: uid(),
      week_number: weekNumber,
      target_sets: found?.target_sets || "",
      target_reps: found?.target_reps || "",
      target_load_text: found?.target_load_text || "",
      target_load_kg: found?.target_load_kg || "",
      target_rpe: found?.target_rpe || "",
      target_rir: found?.target_rir || "",
      recovery_seconds: found?.recovery_seconds || "",
      notes: found?.notes || ""
    };
  });
}

function duplicateProgramToBuilder(program) {
  if (!program) return;

  const weeks = Number(program.duration_weeks) || 4;

  const days =
    program.workout_weeks
      ?.flatMap((week) => week.workout_days || [])
      ?.map((day, dayIndex) => {
        const exercises =
          day.workout_blocks
            ?.flatMap((block) => block.workout_exercises || [])
            ?.map((exercise) => ({
              temp_id: uid(),
              exercise_name: exercise.exercise_name || "",
              exercise_media_id:
                exercise.exercise_media_id ||
                exercise.exercise_media_library?.id ||
                "",
              sets: exercise.sets || "3",
              reps: exercise.reps || "8-10",
              recovery_seconds: exercise.recovery_seconds || 90,
              target_rpe: exercise.target_rpe || "",
              target_rir: exercise.target_rir || "",
              execution_mode: exercise.execution_mode || "",
              video_url: exercise.video_url || "",
              image_url: exercise.image_url || "",
              notes: exercise.notes || "",
              has_weekly_progression: !!exercise.has_weekly_progression,
              progressions: buildProgressionsFromExercise(exercise, weeks)
            })) || [];

        return {
          temp_id: uid(),
          title: day.title || `Allenamento ${String.fromCharCode(65 + dayIndex)}`,
          estimated_minutes: day.estimated_minutes || 60,
          notes: day.notes || "",
          exercises: exercises.length ? exercises : [defaultExerciseRow()]
        };
      }) || [];

  setBuilder({
    title: `${program.title || "Programma"} copia`,
    goal: program.goal || "",
    start_date: today(),
    end_date: "",
    duration_weeks: weeks,
    level: program.level || "intermedio",
    location: program.location || "palestra",
    notes: program.notes || "",
    days: days.length ? days : [defaultWorkoutDay("A")]
  });

  setActiveTab("programs");
  setProgramPanel("builder");

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, 100);

  alert("Programma copiato nel builder. Modificalo e poi salvalo come nuovo programma.");
}
  function editProgramInBuilder(program) {
  if (!program) return;

  const weeks = Number(program.duration_weeks) || 4;

  const days =
    program.workout_weeks
      ?.flatMap((week) => week.workout_days || [])
      ?.map((day, dayIndex) => {
        const exercises =
          day.workout_blocks
            ?.flatMap((block) => block.workout_exercises || [])
            ?.map((exercise) => ({
              temp_id: uid(),
              exercise_name: exercise.exercise_name || "",
              exercise_media_id:
                exercise.exercise_media_id ||
                exercise.exercise_media_library?.id ||
                "",
              sets: exercise.sets || "3",
              reps: exercise.reps || "8-10",
              recovery_seconds: exercise.recovery_seconds || 90,
              target_rpe: exercise.target_rpe || "",
              target_rir: exercise.target_rir || "",
              execution_mode: exercise.execution_mode || "",
              video_url: exercise.video_url || "",
              image_url: exercise.image_url || "",
              notes: exercise.notes || "",
              has_weekly_progression: !!exercise.has_weekly_progression,
              progressions: buildProgressionsFromExercise(exercise, weeks)
            })) || [];

        return {
          temp_id: uid(),
          title: day.title || `Allenamento ${String.fromCharCode(65 + dayIndex)}`,
          estimated_minutes: day.estimated_minutes || 60,
          notes: day.notes || "",
          exercises: exercises.length ? exercises : [defaultExerciseRow()]
        };
      }) || [];

  setBuilder({
    title: program.title || "Programma allenamento",
    goal: program.goal || "",
    start_date: program.start_date || today(),
    end_date: program.end_date || "",
    duration_weeks: weeks,
    level: program.level || "intermedio",
    location: program.location || "palestra",
    notes: program.notes || "",
    days: days.length ? days : [defaultWorkoutDay("A")]
  });

  setEditingProgramId(program.id);
  setEditingProgramTitle(program.title || "Programma");
  setActiveTab("programs");
  setProgramPanel("builder");

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, 100);

  alert("Programma caricato nel builder. Modificalo e poi premi Aggiorna programma.");
}

function cancelProgramEditing() {
  setEditingProgramId("");
  setEditingProgramTitle("");
  setBuilder(createSmartBuilder());
}
  async function replaceExistingProgram() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.access_token) {
    throw new Error("Sessione non valida. Esci e rientra.");
  }

  const response = await fetch("/api/replace-program", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionData.session.access_token}`
    },
    body: JSON.stringify({
      program_id: editingProgramId,
      builder
    })
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Errore aggiornamento programma.");
  }

  setEditingProgramId("");
  setEditingProgramTitle("");
  setBuilder(createSmartBuilder());

  if (selectedClient) {
    await loadClientBundle(selectedClient.id);
  }

  alert("Programma aggiornato.");
}
  function hydrateBuilderFromTemplate(templateData) {
  const data = templateData || createSmartBuilder();
  const weeks = Number(data.duration_weeks) || 4;

  const days =
    Array.isArray(data.days) && data.days.length > 0
      ? data.days.map((day, dayIndex) => ({
          temp_id: uid(),
          title: day.title || `Allenamento ${String.fromCharCode(65 + dayIndex)}`,
          estimated_minutes: day.estimated_minutes || 60,
          notes: day.notes || "",
          exercises:
            Array.isArray(day.exercises) && day.exercises.length > 0
              ? day.exercises.map((exercise) => ({
                  temp_id: uid(),
                  exercise_name: exercise.exercise_name || "",
                  exercise_media_id: exercise.exercise_media_id || "",
                  sets: exercise.sets || "3",
                  reps: exercise.reps || "8-10",
                  recovery_seconds: exercise.recovery_seconds || 90,
                  target_rpe: exercise.target_rpe || "",
                  target_rir: exercise.target_rir || "",
                  execution_mode: exercise.execution_mode || "",
                  video_url: exercise.video_url || "",
                  image_url: exercise.image_url || "",
                  notes: exercise.notes || "",
                  has_weekly_progression: !!exercise.has_weekly_progression,
                  progressions: Array.from({ length: weeks }).map((_, index) => {
                    const weekNumber = index + 1;
                    const found = (exercise.progressions || []).find(
                      (item) => Number(item.week_number) === weekNumber
                    );

                    return {
                      temp_id: uid(),
                      week_number: weekNumber,
                      target_sets: found?.target_sets || "",
                      target_reps: found?.target_reps || "",
                      target_load_text: found?.target_load_text || "",
                      target_load_kg: found?.target_load_kg || "",
                      target_rpe: found?.target_rpe || "",
                      target_rir: found?.target_rir || "",
                      recovery_seconds: found?.recovery_seconds || "",
                      notes: found?.notes || ""
                    };
                  })
                }))
              : [defaultExerciseRow()]
        }))
      : [defaultWorkoutDay("A")];

  return {
    title: data.title || "Programma allenamento",
    goal: data.goal || "",
    start_date: today(),
    end_date: "",
    duration_weeks: weeks,
    level: data.level || "intermedio",
    location: data.location || "palestra",
    notes: data.notes || "",
    days
  };
}

async function saveBuilderAsTemplate() {
  const hasExercise = builder.days.some((day) =>
    day.exercises.some((exercise) => exercise.exercise_name.trim())
  );

  if (!hasExercise) {
    alert("Inserisci almeno un esercizio prima di salvare il template.");
    return;
  }

  const title = window.prompt(
    "Nome del template",
    builder.title || "Template allenamento"
  );

  if (!title) return;

  setSavingTemplate(true);

  try {
    const templateData = clone(builder);
    templateData.title = title;
    templateData.start_date = "";
    templateData.end_date = "";

    const { error } = await supabase.from("workout_program_templates").insert({
      professional_id: session.user.id,
      title,
      description: builder.notes || null,
      goal: builder.goal || null,
      level: builder.level || null,
      location: builder.location || null,
      duration_weeks: Number(builder.duration_weeks) || 4,
      template_data: templateData,
      is_global: false,
      is_active: true
    });

    if (error) {
      alert(error.message);
      return;
    }

    await loadTemplates();
    alert("Template salvato.");
  } finally {
    setSavingTemplate(false);
  }
}

function useTemplateInBuilder(template) {
  if (!template?.template_data) return;

  const confirmed = window.confirm(
    `Vuoi caricare il template "${template.title}" nel builder? I dati attuali del builder verranno sostituiti.`
  );

  if (!confirmed) return;

  setEditingProgramId("");
  setEditingProgramTitle("");
  setBuilder(hydrateBuilderFromTemplate(template.template_data));

  setActiveTab("programs");
  setProgramPanel("builder");

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, 100);
}

async function deleteTemplate(template) {
  if (!template) return;

  const confirmed = window.confirm(
    `Vuoi davvero eliminare il template "${template.title}"?`
  );

  if (!confirmed) return;

  setDeletingTemplateId(template.id);

  try {
    const { error } = await supabase
      .from("workout_program_templates")
      .delete()
      .eq("id", template.id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadTemplates();
  } finally {
    setDeletingTemplateId("");
  }
}
  async function saveWorkoutPlan(event) {
    event.preventDefault();

    if (!selectedClient) {
      alert("Seleziona un cliente.");
      return;
    }

    const hasExercise = builder.days.some((day) =>
      day.exercises.some((exercise) => exercise.exercise_name.trim())
    );

    if (!hasExercise) {
      alert("Inserisci almeno un esercizio.");
      return;
    }

    setSavingPlan(true);

try {
  if (editingProgramId) {
    await replaceExistingProgram();
    return;
  }

  const { data: plan, error: planError } = await supabase
        .from("workout_plans")
        .insert({
          client_id: Number(selectedClient.id),
          professional_id: session.user.id,
          title: builder.title || "Programma allenamento",
          goal: builder.goal || null,
          notes: builder.notes || null,
          start_date: builder.start_date || null,
          end_date: builder.end_date || null,
          duration_weeks: Number(builder.duration_weeks) || 4,
          level: builder.level || null,
          location: builder.location || null,
          status: "active"
        })
        .select()
        .single();

      if (planError) throw planError;

      const { data: weekRow, error: weekError } = await supabase
        .from("workout_weeks")
        .insert({
          plan_id: plan.id,
          week_number: 1,
          title: "Programma base",
          goal: builder.goal || null,
          notes: "Settimana tecnica usata per organizzare la scheda.",
          sort_order: 1
        })
        .select()
        .single();

      if (weekError) throw weekError;

      for (let dayIndex = 0; dayIndex < builder.days.length; dayIndex += 1) {
        const day = builder.days[dayIndex];

        const { data: dayRow, error: dayError } = await supabase
          .from("workout_days")
          .insert({
            plan_id: plan.id,
            week_id: weekRow.id,
            title: day.title || `Allenamento ${dayIndex + 1}`,
            day_type: "training",
            estimated_minutes: numberOrNull(day.estimated_minutes),
            notes: day.notes || null,
            sort_order: dayIndex + 1
          })
          .select()
          .single();

        if (dayError) throw dayError;

        const { data: blockRow, error: blockError } = await supabase
          .from("workout_blocks")
          .insert({
            day_id: dayRow.id,
            title: "Esercizi",
            block_type: "normal",
            instructions: null,
            sort_order: 1
          })
          .select()
          .single();

        if (blockError) throw blockError;

        for (
          let exerciseIndex = 0;
          exerciseIndex < day.exercises.length;
          exerciseIndex += 1
        ) {
          const exercise = day.exercises[exerciseIndex];

          if (!exercise.exercise_name.trim()) continue;

          const matchedMedia = exercise.exercise_media_id
            ? mediaById.get(exercise.exercise_media_id)
            : findMediaForExercise(exercise.exercise_name);

          const mediaId =
            exercise.exercise_media_id || matchedMedia?.id || null;

          const { data: exerciseRow, error: exerciseError } = await supabase
            .from("workout_exercises")
            .insert({
              day_id: dayRow.id,
              block_id: blockRow.id,
              exercise_media_id: mediaId,
              exercise_name: exercise.exercise_name.trim(),
              sets: exercise.sets || null,
              reps: exercise.reps || null,
              recovery_seconds: Number(exercise.recovery_seconds) || 90,
              execution_mode: exercise.execution_mode || null,
              target_rpe: exercise.target_rpe || null,
              target_rir: exercise.target_rir || null,
              video_url: exercise.video_url || null,
              image_url: exercise.image_url || matchedMedia?.image_url || null,
              notes: exercise.notes || null,
              smart_notes: exercise.notes || null,
              sort_order: exerciseIndex + 1,
              exercise_type: "normal",
              tracking_type: "load_reps",
              has_weekly_progression: !!exercise.has_weekly_progression,
              progression_mode: exercise.has_weekly_progression
                ? "weekly"
                : "none",
              is_active: true
            })
            .select()
            .single();

          if (exerciseError) throw exerciseError;

          const setsCount = Number(exercise.sets) || 1;

          const setRows = Array.from({ length: setsCount }).map((_, index) => ({
            workout_exercise_id: exerciseRow.id,
            set_number: index + 1,
            target_reps: exercise.reps || null,
            target_load_kg: null,
            target_rpe: numberOrNull(exercise.target_rpe),
            target_rir: numberOrNull(exercise.target_rir),
            rest_seconds: Number(exercise.recovery_seconds) || 90,
            notes: null
          }));

          const { error: setsError } = await supabase
            .from("workout_exercise_sets")
            .insert(setRows);

          if (setsError) throw setsError;

          if (exercise.has_weekly_progression) {
            const progressionRows = (exercise.progressions || []).map(
              (progression, index) => ({
                workout_exercise_id: exerciseRow.id,
                week_number: Number(progression.week_number) || index + 1,
                target_sets: progression.target_sets || null,
                target_reps: progression.target_reps || null,
                target_load_text: progression.target_load_text || null,
                target_load_kg: numberOrNull(progression.target_load_kg),
                target_rpe: progression.target_rpe || null,
                target_rir: progression.target_rir || null,
                recovery_seconds: numberOrNull(progression.recovery_seconds),
                notes: progression.notes || null,
                sort_order: index + 1
              })
            );

            const { error: progressionError } = await supabase
              .from("workout_exercise_progressions")
              .insert(progressionRows);

            if (progressionError) throw progressionError;
          }
        }
      }

      setBuilder(createSmartBuilder());
      await loadClientBundle(selectedClient.id);
      alert("Programma salvato.");
    } catch (error) {
      alert(error.message || "Errore salvataggio programma.");
    } finally {
      setSavingPlan(false);
    }
  }
    async function saveMeasurement(event) {
    event.preventDefault();

    if (!selectedClient) return;

    const payload = {
      client_id: Number(selectedClient.id),
      professional_id: session.user.id,
      measurement_date: measurementForm.measurement_date || today(),
      weight_kg: numberOrNull(measurementForm.weight_kg),
      body_fat_percentage: numberOrNull(measurementForm.body_fat_percentage),
      lean_mass_kg: numberOrNull(measurementForm.lean_mass_kg),
      waist_cm: numberOrNull(measurementForm.waist_cm),
      hips_cm: numberOrNull(measurementForm.hips_cm),
      chest_cm: numberOrNull(measurementForm.chest_cm),
      abdomen_cm: numberOrNull(measurementForm.abdomen_cm),
      right_arm_cm: numberOrNull(measurementForm.right_arm_cm),
      left_arm_cm: numberOrNull(measurementForm.left_arm_cm),
      right_thigh_cm: numberOrNull(measurementForm.right_thigh_cm),
      left_thigh_cm: numberOrNull(measurementForm.left_thigh_cm),
      notes: measurementForm.notes || null
    };

    const { error } = await supabase.from("client_measurements").insert(payload);

    if (error) {
      alert(error.message);
      return;
    }

    setMeasurementForm({
      measurement_date: today(),
      weight_kg: "",
      body_fat_percentage: "",
      lean_mass_kg: "",
      waist_cm: "",
      hips_cm: "",
      chest_cm: "",
      abdomen_cm: "",
      right_arm_cm: "",
      left_arm_cm: "",
      right_thigh_cm: "",
      left_thigh_cm: "",
      notes: ""
    });

    await loadClientBundle(selectedClient.id);
  }

  async function uploadDiet(event) {
    event.preventDefault();

    if (!selectedClient || !dietFile) {
      alert("Seleziona cliente e file dieta.");
      return;
    }

    if (!String(dietFile.name || "").toLowerCase().endsWith(".pdf")) {
      alert("Carica un file PDF generato da SIFA Dieta.");
      return;
    }

    let extractedDiet = null;

    setExtractingDietPdf(true);

    try {
      extractedDiet = await extractDietPdfForApp(
        dietFile,
        dietForm.diet_type || "daily_pdf"
      );
    } catch (error) {
      console.warn("TMFIT dieta: estrazione automatica non completata", error?.message || error);
    } finally {
      setExtractingDietPdf(false);
    }

    const safeName = dietFile.name.replaceAll(" ", "-");
    const path = `${selectedClient.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("diets")
      .upload(path, dietFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const extractBlock = dietExtractToNotesBlock(extractedDiet);

    const richNotes = [
      dietForm.calorie_target ? `Target kcal: ${dietForm.calorie_target}` : null,
      dietForm.summary ? `Riepilogo: ${dietForm.summary}` : null,
      dietForm.notes ? `Note coach: ${dietForm.notes}` : null,
      extractBlock
    ]
      .filter(Boolean)
      .join("\n\n");

    const { error } = await supabase.from("diets").insert({
      client_id: Number(selectedClient.id),
      professional_id: session.user.id,
      title: dietForm.title || dietFile.name,
      file_name: dietFile.name,
      file_path: path,
      start_date: dietForm.start_date || null,
      end_date: dietForm.end_date || null,
      notes: richNotes || null,
      status: "active",
      diet_type: dietForm.diet_type || "file"
    });

    if (error) {
      alert(error.message);
      return;
    }

    setDietForm({
      title: "",
      diet_type: "daily_pdf",
      calorie_target: "",
      summary: "",
      start_date: "",
      end_date: "",
      notes: ""
    });

    setDietFile(null);

    await loadClientBundle(selectedClient.id);
  }

  async function analyzeDietPdfToCards(diet) {
    if (!selectedClient || !diet?.file_path) {
      alert("Seleziona una dieta PDF valida.");
      return;
    }

    setAnalyzingDietId(String(diet.id));

    try {
      const { data, error } = await supabase.storage
        .from("diets")
        .createSignedUrl(diet.file_path, 3600);

      if (error) {
        alert(error.message);
        return;
      }

      const extractedDiet = await extractDietPdfFromUrlForApp(
        data.signedUrl,
        diet.file_name || diet.title || "dieta.pdf",
        diet.diet_type || "daily_pdf"
      );
      const extractBlock = dietExtractToNotesBlock(extractedDiet);

      if (!extractBlock) {
        alert(
          "PDF letto, ma non ho trovato abbastanza dati per creare card pasti. Il PDF resta consultabile come documento completo."
        );
        return;
      }

      const cleanNotes = stripDietExtractBlock(diet.notes || "");
      const nextNotes = [cleanNotes, extractBlock].filter(Boolean).join("\n\n");

      const { error: updateError } = await supabase
        .from("diets")
        .update({ notes: nextNotes || null })
        .eq("id", diet.id);

      if (updateError) {
        alert(updateError.message);
        return;
      }

      await loadClientBundle(selectedClient.id);

      alert("Card pasti generate e salvate. Ora il cliente le vede nel tab Pasti.");
    } catch (error) {
      alert(error.message || "Errore durante l’analisi del PDF dieta.");
    } finally {
      setAnalyzingDietId("");
    }
  }
async function savePrivateNote(event) {
  event.preventDefault();

  if (!selectedClient) {
    alert("Seleziona un cliente.");
    return;
  }

  if (!privateNoteText.trim()) {
    alert("Scrivi una nota.");
    return;
  }

  setSavingPrivateNote(true);

  try {
    const { error } = await supabase.from("client_private_notes").insert({
      client_id: Number(selectedClient.id),
      professional_id: session.user.id,
      note: privateNoteText.trim()
    });

    if (error) {
      alert(error.message);
      return;
    }

    setPrivateNoteText("");
    await loadClientBundle(selectedClient.id);
  } finally {
    setSavingPrivateNote(false);
  }
}
  async function deletePrivateNote(note) {
  if (!note) return;

  const confirmed = window.confirm("Vuoi eliminare questa nota privata?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("client_private_notes")
    .delete()
    .eq("id", note.id);

  if (error) {
    alert(error.message);
    return;
  }

  if (selectedClient) {
    await loadClientBundle(selectedClient.id);
  }
}
  async function savePost(event) {
    event.preventDefault();

    const clientId =
      postForm.client_scope === "selected" && selectedClient
        ? Number(selectedClient.id)
        : null;

    const { error } = await supabase.from("coach_posts").insert({
      professional_id: session.user.id,
      client_id: clientId,
      title: postForm.title,
      body: postForm.body || null,
      post_type: "message",
      is_pinned: postForm.is_pinned,
      published: true
    });

    if (error) {
      alert(error.message);
      return;
    }

    setPostForm({
      title: "",
      body: "",
      client_scope: "selected",
      is_pinned: false
    });

    await loadPosts();
  }

  async function openStorageFile(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 120);

    if (error) {
      alert(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function downloadStorageFile(bucket, path, fileName = "TMFIT-piano-alimentare.pdf") {
    if (!path) return;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 120);

    if (error) {
      alert(error.message);
      return;
    }

    try {
      const response = await fetch(data.signedUrl);

      if (!response.ok) throw new Error("Download non riuscito.");

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = safePdfDownloadName(fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      console.warn("Download PDF non riuscito", downloadError?.message || downloadError);
      window.open(data.signedUrl, "_blank");
    }
  }

  async function previewDietInApp(diet) {
    if (!diet?.file_path) return;

    setDietPreview({
      dietId: String(diet.id),
      url: "",
      loading: true,
      error: ""
    });

    const { data, error } = await supabase.storage
      .from("diets")
      .createSignedUrl(diet.file_path, 3600);

    if (error) {
      setDietPreview({
        dietId: String(diet.id),
        url: "",
        loading: false,
        error: error.message
      });
      return;
    }

    setDietPreview({
      dietId: String(diet.id),
      url: data.signedUrl,
      loading: false,
      error: ""
    });
  }

  function openDietFullscreen(diet) {
    setDietFullscreenOpen(true);

    if (!diet?.file_path) return;

    if (dietPreview.dietId === String(diet.id) && dietPreview.url) return;

    previewDietInApp(diet);
  }

  function CoachTodayDashboard() {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    function toDate(value) {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatShortDate(value) {
      const date = toDate(value);
      if (!date) return "Data non disponibile";
      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "2-digit"
      });
    }

    function isRecent(value) {
      const date = toDate(value);
      if (!date) return false;
      return now - date.getTime() <= sevenDaysMs;
    }

    function isActiveRecord(item) {
      const status = String(item?.status || "active").toLowerCase();
      return !["archived", "deleted", "inactive"].includes(status);
    }

    function clientNameFromId(clientId) {
      const found = clients.find(
        (client) => String(client.id) === String(clientId)
      );
      return found ? fullName(found) : "Cliente";
    }

    function openClient(clientId, tab = "clients", panel = "overview") {
      setSelectedClientId(String(clientId));
      setActiveTab(tab);

      if (tab === "clients") setClientPanel(panel);
      if (tab === "programs") setProgramPanel("builder");
    }

    const activePlans = coachControlData.plans.filter(isActiveRecord);
    const activeDiets = coachControlData.diets.filter(isActiveRecord);

    const activePlanClientIds = new Set(
      activePlans.map((plan) => String(plan.client_id))
    );

    const activeDietClientIds = new Set(
      activeDiets.map((diet) => String(diet.client_id))
    );

    const recentCheckins = coachControlData.checkins
      .filter((checkin) => isRecent(checkin.checkin_date || checkin.created_at))
      .slice(0, 6);

    function criticalCheckinReason(checkin) {
      const reasons = [];

      if (Number(checkin.energy_level) > 0 && Number(checkin.energy_level) <= 4) {
        reasons.push(`energia ${checkin.energy_level}/10`);
      }

      if (Number(checkin.sleep_quality) > 0 && Number(checkin.sleep_quality) <= 4) {
        reasons.push(`sonno ${checkin.sleep_quality}/10`);
      }

      if (Number(checkin.stress_level) >= 8) {
        reasons.push(`stress ${checkin.stress_level}/10`);
      }

      if (Number(checkin.diet_adherence) > 0 && Number(checkin.diet_adherence) <= 5) {
        reasons.push(`aderenza dieta ${checkin.diet_adherence}/10`);
      }

      if (Number(checkin.training_adherence) > 0 && Number(checkin.training_adherence) <= 5) {
        reasons.push(`aderenza allenamento ${checkin.training_adherence}/10`);
      }

      return reasons.join(" · ");
    }

    const criticalCheckins = coachControlData.checkins
      .map((checkin) => ({
        ...checkin,
        criticalReason: criticalCheckinReason(checkin)
      }))
      .filter((checkin) => checkin.criticalReason)
      .slice(0, 6);

    const recentSessions = coachControlData.sessions
      .filter((sessionItem) =>
        isRecent(sessionItem.session_date || sessionItem.created_at)
      )
      .slice(0, 6);

    const recentPhotos = coachControlData.photos
      .filter((photo) => isRecent(photo.photo_date || photo.created_at))
      .slice(0, 6);

    const lastSessionByClient = new Map();

    coachControlData.sessions.forEach((sessionItem) => {
      const date = toDate(sessionItem.session_date || sessionItem.created_at);
      const clientId = String(sessionItem.client_id || "");

      if (!date || !clientId) return;

      const current = lastSessionByClient.get(clientId);

      if (!current || date.getTime() > current.getTime()) {
        lastSessionByClient.set(clientId, date);
      }
    });

    const clientsWithoutActivePlan = clients
      .filter((client) => !activePlanClientIds.has(String(client.id)))
      .slice(0, 5);

    const clientsWithoutDiet = clients
      .filter((client) => !activeDietClientIds.has(String(client.id)))
      .slice(0, 5);

    const inactiveClients = clients
      .filter((client) => {
        const lastSession = lastSessionByClient.get(String(client.id));
        if (!lastSession) return true;
        return now - lastSession.getTime() > sevenDaysMs;
      })
      .slice(0, 5);

    const reminderItems = [
      ...clientsWithoutActivePlan.map((client) => ({
        id: `reminder-plan-${client.id}`,
        priority: "Alta",
        title: `${fullName(client)} senza programma`,
        text: "Crea una scheda attiva per avviare o proseguire il percorso.",
        actionLabel: "Crea programma",
        tone: "red",
        onAction: () => openClient(client.id, "programs")
      })),
      ...clientsWithoutDiet.map((client) => ({
        id: `reminder-diet-${client.id}`,
        priority: "Media",
        title: `${fullName(client)} senza dieta`,
        text: "Carica il piano alimentare o aggiorna quello attuale.",
        actionLabel: "Vai a diete",
        tone: "amber",
        onAction: () => openClient(client.id, "diets")
      })),
      ...inactiveClients.map((client) => {
        const lastSession = lastSessionByClient.get(String(client.id));

        return {
          id: `reminder-inactive-${client.id}`,
          priority: "Alta",
          title: `${fullName(client)} poco attivo`,
          text: lastSession
            ? `Ultimo allenamento registrato: ${lastSession.toLocaleDateString("it-IT")}.`
            : "Nessun allenamento ancora registrato.",
          actionLabel: "Apri cliente",
          tone: "red",
          onAction: () => openClient(client.id, "clients", "overview")
        };
      }),
      ...criticalCheckins.map((checkin) => ({
        id: `reminder-critical-checkin-${checkin.id}`,
        priority: "Critico",
        title: `${clientNameFromId(checkin.client_id)} da attenzionare`,
        text: `Check-in critico: ${checkin.criticalReason}. Valuta scarico, recupero o modifica del percorso.`,
        actionLabel: "Apri monitor",
        tone: "red",
        onAction: () => openClient(checkin.client_id, "monitor")
      })),
      ...recentCheckins.slice(0, 3).map((checkin) => ({
        id: `reminder-checkin-${checkin.id}`,
        priority: "Nuovo",
        title: `${clientNameFromId(checkin.client_id)} ha inviato un check-in`,
        text: `Ricevuto ${formatShortDate(checkin.checkin_date || checkin.created_at)}. Valutalo e aggiorna il percorso se serve.`,
        actionLabel: "Leggi",
        tone: "teal",
        onAction: () => openClient(checkin.client_id, "monitor")
      }))
    ].slice(0, 8);

    const urgentReminderCount = reminderItems.filter((item) =>
      ["Alta", "Nuovo"].includes(item.priority)
    ).length;

    function MetricCard({ title, value, text, icon, tone = "slate" }) {
      const toneClass =
        tone === "teal"
          ? "bg-teal-50 text-teal-700"
          : tone === "red"
          ? "bg-red-50 text-red-700"
          : tone === "amber"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-700";

      return (
        <Card className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                {title}
              </p>

              <p className="mt-2 text-3xl font-black leading-none text-slate-950 md:text-4xl">
                {value}
              </p>

              <p className="mt-2 text-sm font-semibold leading-5 text-slate-500">
                {text}
              </p>
            </div>

            <div className={`shrink-0 rounded-2xl p-3 ${toneClass}`}>{icon}</div>
          </div>
        </Card>
      );
    }

    function ActionRow({ clientId, title, text, tag, actionLabel, onAction }) {
      return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-black text-slate-950">{title}</p>
              <Pill className="bg-amber-100 text-amber-700">{tag}</Pill>
            </div>

            <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">{text}</p>
          </div>

          <Button
            onClick={onAction || (() => openClient(clientId))}
            className="w-full shrink-0 bg-[#07111f] text-white md:w-auto"
          >
            {actionLabel || "Apri cliente"}
          </Button>
        </div>
      );
    }

    function ReminderItem({ item }) {
      const toneClass =
        item.tone === "red"
          ? "bg-red-50 text-red-700"
          : item.tone === "amber"
          ? "bg-amber-50 text-amber-700"
          : item.tone === "teal"
          ? "bg-teal-50 text-teal-700"
          : "bg-slate-100 text-slate-700";

      return (
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${toneClass}`}>
                {item.priority}
              </span>

              <p className="font-black text-slate-950">{item.title}</p>
            </div>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {item.text}
            </p>
          </div>

          <Button onClick={item.onAction} className="w-full shrink-0 bg-[#07111f] text-white md:w-auto">
            {item.actionLabel}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <Card className="overflow-hidden border-none bg-[#07111f] text-white shadow-xl">
          <div className="p-5 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.35em] text-teal-300">
                  Dashboard professionista
                </p>

                <h2 className="mt-3 text-3xl font-black leading-tight md:text-5xl">
                  Oggi su TMFIT Pro
                </h2>

                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 md:text-base">
                  Vista operativa per capire subito priorità, nuovi check-in e
                  clienti da seguire negli ultimi 7 giorni.
                </p>

                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Clienti
                    </p>
                    <p className="mt-1 text-2xl font-black text-white">{clients.length}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Da fare
                    </p>
                    <p className="mt-1 text-2xl font-black text-teal-300">{reminderItems.length}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Urgenti
                    </p>
                    <p className="mt-1 text-2xl font-black text-red-200">{urgentReminderCount}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[330px]">
                <Button
                  onClick={() => {
                    setActiveTab("clients");
                    setClientPanel("new");
                  }}
                  className="bg-teal-300 text-slate-950 hover:bg-teal-200"
                >
                  <UserPlus size={17} className="mr-2" />
                  Nuovo cliente
                </Button>

                <Button
                  onClick={() => loadCoachControlCenter(clients)}
                  disabled={coachControlLoading}
                  className="border border-white/10 bg-white/10 text-white"
                >
                  {coachControlLoading ? "Aggiorno..." : "Aggiorna dati"}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Clienti"
            value={clients.length}
            text="totali gestiti"
            icon={<Users size={20} />}
            tone="teal"
          />

          <MetricCard
            title="Programmi attivi"
            value={activePlans.length}
            text={`${clientsWithoutActivePlan.length} da programmare`}
            icon={<Dumbbell size={20} />}
          />

          <MetricCard
            title="Check-in recenti"
            value={recentCheckins.length}
            text="ultimi 7 giorni"
            icon={<ClipboardCheck size={20} />}
            tone="amber"
          />

          <MetricCard
            title="Allenamenti"
            value={recentSessions.length}
            text="completati ultimi 7 giorni"
            icon={<Activity size={20} />}
          />
        </div>

        <Card className="overflow-hidden border-none shadow-lg">
          <div className="bg-white p-5 md:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">
                  Centro promemoria
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  Cose da fare adesso
                </h3>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  Priorità generate dai dati già presenti: programmi, diete,
                  check-in recenti e aderenza da controllare.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <div className="rounded-2xl bg-red-50 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-red-700">{urgentReminderCount}</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                    urgenti
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center">
                  <p className="text-2xl font-black text-slate-950">{reminderItems.length}</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    totali
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {reminderItems.map((item) => (
                <ReminderItem key={item.id} item={item} />
              ))}

              {reminderItems.length === 0 && (
                <Empty
                  title="Nessun promemoria operativo"
                  text="Programmi, dieta, check-in e aderenza risultano sotto controllo."
                />
              )}
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
          <Card className="p-5">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-black">Richiede attenzione</h3>
                <p className="text-sm font-semibold text-slate-500">
                  Le azioni più importanti da fare prima.
                </p>
              </div>

              <Pill className="bg-slate-100 text-slate-700">
                {clientsWithoutActivePlan.length + inactiveClients.length} alert
              </Pill>
            </div>

            <div className="space-y-3">
              {clientsWithoutActivePlan.map((client) => (
                <ActionRow
                  key={`no-plan-${client.id}`}
                  clientId={client.id}
                  title={fullName(client)}
                  text="Cliente senza programma attivo: crea o assegna una scheda."
                  tag="programma mancante"
                  actionLabel="Crea programma"
                  onAction={() => openClient(client.id, "programs")}
                />
              ))}

              {inactiveClients.map((client) => {
                const lastSession = lastSessionByClient.get(String(client.id));

                return (
                  <ActionRow
                    key={`inactive-${client.id}`}
                    clientId={client.id}
                    title={fullName(client)}
                    text={
                      lastSession
                        ? `Ultimo allenamento: ${lastSession.toLocaleDateString("it-IT")}`
                        : "Nessun allenamento registrato nello storico."
                    }
                    tag="aderenza da controllare"
                    actionLabel="Apri cliente"
                    onAction={() => openClient(client.id, "clients", "overview")}
                  />
                );
              })}

              {clientsWithoutActivePlan.length === 0 && inactiveClients.length === 0 && (
                <Empty
                  title="Tutto sotto controllo"
                  text="Non ci sono clienti senza programma o inattivi negli ultimi 7 giorni."
                />
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">Setup percorso</h3>
                <p className="text-sm font-semibold text-slate-500">
                  Clienti con elementi ancora mancanti.
                </p>
              </div>

              <Pill className="bg-teal-100 text-teal-700">Focus</Pill>
            </div>

            <div className="space-y-3">
              {clientsWithoutDiet.map((client) => (
                <ActionRow
                  key={`no-diet-${client.id}`}
                  clientId={client.id}
                  title={fullName(client)}
                  text="Nessuna dieta attiva caricata per questo cliente."
                  tag="dieta mancante"
                  actionLabel="Vai a diete"
                  onAction={() => openClient(client.id, "diets")}
                />
              ))}

              {clientsWithoutDiet.length === 0 && (
                <Empty
                  title="Percorsi configurati"
                  text="Tutti i clienti risultano coperti da una dieta attiva."
                />
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">Ultimi check-in</h3>
                <p className="text-xs font-bold text-slate-400">Aggiornamenti clienti</p>
              </div>
              <ClipboardCheck size={18} className="text-teal-600" />
            </div>

            <div className="space-y-3">
              {recentCheckins.map((checkin) => (
                <button
                  key={checkin.id}
                  type="button"
                  onClick={() => openClient(checkin.client_id, "monitor")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white"
                >
                  <p className="font-black text-slate-950">
                    {clientNameFromId(checkin.client_id)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {formatShortDate(checkin.checkin_date || checkin.created_at)}
                  </p>
                </button>
              ))}

              {recentCheckins.length === 0 && (
                <Empty title="Nessun check-in recente" text="Ultimi 7 giorni." />
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">Ultimi allenamenti</h3>
                <p className="text-xs font-bold text-slate-400">Sessioni completate</p>
              </div>
              <Dumbbell size={18} className="text-teal-600" />
            </div>

            <div className="space-y-3">
              {recentSessions.map((sessionItem) => (
                <button
                  key={sessionItem.id}
                  type="button"
                  onClick={() => openClient(sessionItem.client_id, "monitor")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white"
                >
                  <p className="font-black text-slate-950">
                    {clientNameFromId(sessionItem.client_id)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {formatShortDate(sessionItem.session_date || sessionItem.created_at)}
                  </p>
                </button>
              ))}

              {recentSessions.length === 0 && (
                <Empty title="Nessun allenamento recente" text="Ultimi 7 giorni." />
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">Foto progressi</h3>
                <p className="text-xs font-bold text-slate-400">Materiale recente</p>
              </div>
              <Camera size={18} className="text-teal-600" />
            </div>

            <div className="space-y-3">
              {recentPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => openClient(photo.client_id, "measurements")}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white"
                >
                  <p className="font-black text-slate-950">
                    {clientNameFromId(photo.client_id)}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {formatShortDate(photo.photo_date || photo.created_at)}
                  </p>
                </button>
              ))}

              {recentPhotos.length === 0 && (
                <Empty title="Nessuna foto recente" text="Ultimi 7 giorni." />
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  function SelectedClientHero() {
  if (!selectedClient) return null;
    return (
      <Card className="overflow-hidden">
        <div className="bg-[#07111f] p-5 text-white md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
                Cliente selezionato
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                {fullName(selectedClient)}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                <Pill className="bg-teal-300 text-slate-950">
                  {selectedClient.status || "active"}
                </Pill>

                <Pill className="bg-white/10 text-white">
                  {selectedClient.goal || "Obiettivo non impostato"}
                </Pill>
              </div>
            </div>

            <Button
              disabled={deletingClient}
              onClick={deleteSelectedClient}
              className="border border-red-300 bg-red-50 text-red-700 hover:bg-red-100"
            >
              <Trash2 size={17} className="mr-2" />
              {deletingClient ? "Eliminazione..." : "Elimina cliente"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }
function SelectedClientCompactBar() {
  if (!selectedClient) return null;

  return (
    <Card className="p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            Cliente selezionato
          </p>

          <h2 className="truncate text-lg font-black text-slate-950">
            {fullName(selectedClient)}
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
  <Pill className="bg-teal-100 text-teal-700">
    {selectedClient.status || "active"}
  </Pill>

  <Pill className="bg-slate-100 text-slate-700">
    {selectedClient.goal || "Obiettivo non impostato"}
  </Pill>

  <Button
    onClick={() => setActiveTab("clients")}
    className="border border-slate-200 bg-white text-slate-700"
  >
    Cambia cliente
  </Button>
</div>
      </div>
    </Card>
  );
}
const builderStats = getBuilderStats();
const builderQuality = getBuilderQualityReport();
  return (
  <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
  <header className="sticky top-0 z-30 bg-[#07111f] px-4 py-4 text-white shadow-xl md:relative md:px-6 md:py-5">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
         <div className="flex items-center gap-3">
  <button
  type="button"
  onClick={() => setDrawerOpen(true)}
  className="tmfit-tap flex shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg transition hover:bg-white/15 active:scale-[.96]"
  aria-label="Apri menu"
>
  <span className="block h-0.5 w-6 rounded bg-white" />
  <span className="mt-1.5 block h-0.5 w-6 rounded bg-white" />
  <span className="mt-1.5 block h-0.5 w-6 rounded bg-white" />
</button>

  <div>
    <h1 className="text-2xl font-black tracking-tight">TM FIT</h1>
    <p className="text-sm font-bold text-slate-300">
      Area professionista · Smart Builder V4
    </p>
  </div>
</div>

          <Button
            onClick={onLogout}
            className="border border-white/10 bg-white/10 text-white"
          >
            <LogOut size={17} className="mr-2" />
            Esci
          </Button>
        </div>
      </header>

      <TopTabs tabs={professionalTabs} active={activeTab} onChange={setActiveTab} />
<SideDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  tabs={professionalTabs}
  active={activeTab}
  onChange={setActiveTab}
  role="coach"
  onLogout={onLogout}
  userProfile={userProfile}
/>
    <main
  className={`mx-auto grid gap-4 p-3 pb-28 md:p-5 ${
    activeTab === "programs" || activeTab === "dashboard"
      ? "max-w-[1800px] xl:grid-cols-1"
      : "max-w-7xl xl:grid-cols-[260px_minmax(0,1fr)]"
  }`}
>
        <aside
  className={`min-w-0 space-y-3 xl:sticky xl:top-24 xl:self-start ${
    activeTab === "programs" || activeTab === "dashboard" ? "hidden" : ""
  }`}
>
          <Card className="p-3">
            <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
              <Search size={17} className="text-slate-400" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca"
                className="w-full bg-transparent text-sm font-bold outline-none"
              />
            </div>

            <div
  className={`space-y-1.5 overflow-y-auto pr-1 ${
    activeTab === "programs" ? "max-h-[300px]" : "max-h-[420px]"
  }`}
>
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(String(client.id))}
                  className={`w-full rounded-xl border p-2.5 text-left transition ${
                    String(selectedClientId) === String(client.id)
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="truncate text-sm font-black">{fullName(client)}</p>

                  {activeTab !== "programs" && (
  <p className="mt-0.5 truncate text-[11px] font-bold text-slate-500">
    {client.email || "—"}
  </p>
)}
                </button>
              ))}

              {!loading && filteredClients.length === 0 && (
                <Empty title="Nessun cliente" text="Crea il primo cliente." />
              )}
            </div>
          </Card>
        </aside>

        <section className="min-w-0 space-y-5">
          {activeTab === "programs" ? (
  <SelectedClientCompactBar />
) : activeTab === "dashboard" ? null : (
  <SelectedClientHero />
)}
          {activeTab === "dashboard" && <CoachTodayDashboard />}

          {activeTab === "clients" && (
            <div className="space-y-5">
              <Card className="overflow-hidden border border-slate-300 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 md:px-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                          Area clienti
                        </p>

                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-500">
                          CRM professionista
                        </span>
                      </div>

                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                        Gestione clienti
                      </h2>

                      <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                        Tieni sotto controllo profilo, percorso, note interne e azioni principali senza appesantire la schermata.
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3 xl:w-[520px]">
                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Clienti
                        </p>
                        <p className="mt-1 text-lg font-black text-slate-950">{clients.length}</p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Selezionato
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-slate-950">
                          {selectedClient ? fullName(selectedClient) : "Nessuno"}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Note
                        </p>
                        <p className="mt-1 text-lg font-black text-slate-950">{privateNotes.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3">
                  {[
                    { id: "overview", label: "Panoramica", helper: "Stato e azioni" },
                    { id: "new", label: "Nuovo", helper: "Crea accesso" },
                    { id: "notes", label: "Note", helper: "Solo coach" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setClientPanel(item.id)}
                      className={`rounded-2xl border px-2 py-3 text-center transition ${
                        clientPanel === item.id
                          ? "border-[#07111f] bg-[#07111f] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:bg-teal-50"
                      }`}
                    >
                      <span className="block text-xs font-black">{item.label}</span>
                      <span
                        className={`mt-0.5 hidden text-[10px] font-bold sm:block ${
                          clientPanel === item.id ? "text-slate-300" : "text-slate-400"
                        }`}
                      >
                        {item.helper}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {clientPanel === "overview" && (
                <CoachClientSnapshot
                  selectedClient={selectedClient}
                  plans={plans}
                  checkins={checkins}
                  measurements={measurements}
                  sessions={sessions}
                  diets={diets}
                  photos={photos}
                  logs={logs}
                  privateNotes={privateNotes}
                  deletingClient={deletingClient}
                  onCreateClient={() => setClientPanel("new")}
                  onCreateProgram={() => {
                    setActiveTab("programs");
                    setProgramPanel("builder");
                  }}
                  onOpenDiets={() => setActiveTab("diets")}
                  onOpenMeasurements={() => setActiveTab("measurements")}
                  onOpenMonitor={() => setActiveTab("monitor")}
                  onAddNote={() => setClientPanel("notes")}
                  onDeleteClient={deleteSelectedClient}
                />
              )}

              {clientPanel === "new" && (
                <Card className="overflow-hidden border border-slate-300 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                            <UserPlus size={20} />
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-700">
                              Nuovo profilo
                            </p>
                            <h2 className="mt-0.5 text-xl font-black text-slate-950">
                              Crea cliente
                            </h2>
                          </div>
                        </div>

                        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                          Inserisci solo i dati essenziali. Le credenziali cliente vengono generate dopo il salvataggio.
                        </p>
                      </div>

                      <Pill className="bg-[#07111f] text-white">
                        Login automatico
                      </Pill>
                    </div>
                  </div>

                  <div className="p-5">
                    {clientError && (
                      <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                        {clientError}
                      </div>
                    )}

                    {credentials && (
                      <div className="mb-4 rounded-3xl border border-teal-200 bg-teal-50 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-teal-300 text-slate-950">
                            <Check size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-black text-teal-800">
                              Credenziali create
                            </p>

                            <p className="mt-2 break-all text-sm font-bold text-slate-800">
                              Email: {credentials.email}
                            </p>

                            <p className="text-sm font-bold text-slate-800">
                              Password: {credentials.password}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <form onSubmit={createClient} className="space-y-4">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                          Anagrafica
                        </p>

                        <div className="grid gap-3 md:grid-cols-2">
                          <Label title="Nome" labelClassName="text-slate-500">
                            <Input
                              required
                              placeholder="Nome"
                              value={newClient.first_name}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  first_name: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Cognome" labelClassName="text-slate-500">
                            <Input
                              required
                              placeholder="Cognome"
                              value={newClient.last_name}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  last_name: event.target.value
                                })
                              }
                            />
                          </Label>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                          Contatti e dati base
                        </p>

                        <div className="grid gap-3 md:grid-cols-2">
                          <Label title="Email" labelClassName="text-slate-500">
                            <Input
                              type="email"
                              placeholder="Email cliente opzionale"
                              value={newClient.email}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  email: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Telefono" labelClassName="text-slate-500">
                            <Input
                              placeholder="Telefono"
                              value={newClient.phone}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  phone: event.target.value
                                })
                              }
                            />
                          </Label>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <Label title="Genere" labelClassName="text-slate-500">
                            <Select
                              value={newClient.gender}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  gender: event.target.value
                                })
                              }
                            >
                              <option value="uomo">Uomo</option>
                              <option value="donna">Donna</option>
                              <option value="altro">Altro</option>
                            </Select>
                          </Label>

                          <Label title="Data nascita" labelClassName="text-slate-500">
                            <Input
                              type="date"
                              value={newClient.birth_date}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  birth_date: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Altezza" labelClassName="text-slate-500">
                            <Input
                              type="number"
                              placeholder="cm"
                              value={newClient.height_cm}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  height_cm: event.target.value
                                })
                              }
                            />
                          </Label>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-slate-200 bg-white p-4">
                        <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                          Percorso
                        </p>

                        <div className="grid gap-3">
                          <Label title="Obiettivo" labelClassName="text-slate-500">
                            <Input
                              placeholder="Esempio: ricomposizione, dimagrimento, forza..."
                              value={newClient.goal}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  goal: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Note interne" labelClassName="text-slate-500">
                            <Textarea
                              placeholder="Note interne visibili solo al professionista"
                              value={newClient.notes}
                              onChange={(event) =>
                                setNewClient({
                                  ...newClient,
                                  notes: event.target.value
                                })
                              }
                            />
                          </Label>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs font-bold leading-5 text-slate-500">
                          Dopo la creazione, copia le credenziali generate e consegnale al cliente.
                        </p>

                        <Button
                          type="submit"
                          disabled={creatingClient}
                          className="w-full bg-[#07111f] text-white md:w-auto"
                        >
                          {creatingClient ? "Creazione..." : "Crea cliente e login"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </Card>
              )}

              {clientPanel === "notes" && (
                <Card className="overflow-hidden border border-slate-300 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.22em] text-teal-700">
                          Area riservata coach
                        </p>

                        <h2 className="mt-2 text-xl font-black text-slate-950">
                          Note private
                        </h2>

                        <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                          Appunti interni sul cliente: preferenze, feedback, criticità o promemoria. Il cliente non le vede.
                        </p>
                      </div>

                      <Pill className="bg-slate-100 text-slate-700">
                        {privateNotes.length} note
                      </Pill>
                    </div>
                  </div>

                  <div className="p-5">
                    <form
                      onSubmit={savePrivateNote}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <Label title="Nuova nota" labelClassName="text-slate-500">
                        <Textarea
                          placeholder="Esempio: preferenze allenamento, fastidi, feedback visita, note anamnestiche..."
                          value={privateNoteText}
                          onChange={(event) => setPrivateNoteText(event.target.value)}
                          className="bg-white"
                        />
                      </Label>

                      <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs font-bold leading-5 text-slate-500">
                          Usa note brevi e operative, così restano facili da consultare durante i check.
                        </p>

                        <Button
                          type="submit"
                          disabled={savingPrivateNote}
                          className="w-full bg-[#07111f] text-white md:w-auto"
                        >
                          <Save size={17} className="mr-2" />
                          {savingPrivateNote ? "Salvataggio..." : "Salva nota"}
                        </Button>
                      </div>
                    </form>

                    <div className="mt-5 space-y-3">
                      {privateNotes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold leading-6 text-slate-700">
                                {note.note}
                              </p>

                              <p className="mt-3 text-xs font-bold text-slate-400">
                                {new Date(note.created_at).toLocaleString("it-IT")}
                              </p>
                            </div>

                            <Button
                              onClick={() => deletePrivateNote(note)}
                              className="shrink-0 border border-red-200 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {privateNotes.length === 0 && (
                        <Empty
                          title="Nessuna nota privata"
                          text="Aggiungi appunti interni sul cliente selezionato."
                        />
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "programs" && (
            <div className="space-y-4 pb-6">
              <Card className="overflow-hidden border border-slate-300 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                          Programmi
                        </p>

                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-black text-slate-500">
                          Area professionista
                        </span>
                      </div>

                      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                        Builder schede
                      </h2>

                      <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                        Crea, assegna e riutilizza programmi senza appesantire la schermata.
                        I pannelli restano separati per lavorare più velocemente.
                      </p>
                    </div>

                    <div className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm lg:w-[360px]">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                          Cliente attivo
                        </p>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                          {clients.length} clienti
                        </span>
                      </div>

                      <Select
                        value={selectedClientId || ""}
                        onChange={(event) => setSelectedClientId(event.target.value)}
                        className="border-slate-300 bg-white text-slate-950"
                      >
                        <option value="">Seleziona cliente</option>
                        {clients.map((client) => (
                          <option key={client.id} value={String(client.id)}>
                            {fullName(client)}
                          </option>
                        ))}
                      </Select>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Pill className="bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                          {selectedClient?.status || "nessun cliente"}
                        </Pill>

                        <Pill className="max-w-full bg-slate-100 text-slate-600">
                          {selectedClient?.goal || "Obiettivo non impostato"}
                        </Pill>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2.5 p-3 md:grid-cols-3">
                  {[
                    {
                      id: "builder",
                      label: "Crea",
                      meta: "Compila scheda",
                      count: builderStats.totalExercises
                    },
                    {
                      id: "saved",
                      label: "Salvati",
                      meta: "Schede cliente",
                      count: plans.length
                    },
                    {
                      id: "templates",
                      label: "Template",
                      meta: "Modelli rapidi",
                      count: templates.length
                    }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProgramPanel(item.id)}
                      className={`flex min-h-[74px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[.99] ${
                        programPanel === item.id
                          ? "border-[#07111f] bg-[#07111f] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black">
                          {item.label}
                        </span>
                        <span
                          className={`mt-0.5 block truncate text-[11px] font-bold ${
                            programPanel === item.id ? "text-slate-300" : "text-slate-400"
                          }`}
                        >
                          {item.meta}
                        </span>
                      </span>

                      <span
                        className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl px-2 text-xs font-black ${
                          programPanel === item.id
                            ? "bg-teal-300 text-slate-950"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>

              {!selectedClient && programPanel === "builder" && (
                <Card className="overflow-hidden border border-slate-300 bg-white shadow-sm">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                      Prima azione
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      {clients.length === 0
                        ? "Crea prima un cliente"
                        : "Seleziona un cliente per iniziare"}
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                      {clients.length === 0
                        ? "Per assegnare una scheda serve almeno un cliente registrato nella piattaforma."
                        : "Il builder è pronto: scegli il cliente e poi compila dati base, giorni ed esercizi."}
                    </p>
                  </div>

                  <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,.6fr)]">
                    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-black text-slate-950">
                        {clients.length === 0 ? "Nessun cliente disponibile" : "Cliente da assegnare"}
                      </p>

                      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                        {clients.length === 0
                          ? "Vai nella sezione Clienti, crea il profilo e poi torna qui per costruire la scheda."
                          : "Puoi cambiare cliente anche dal box in alto senza uscire dalla sezione Programmi."}
                      </p>

                      {clients.length > 0 && (
                        <div className="mt-3">
                          <Select
                            value={selectedClientId || ""}
                            onChange={(event) => setSelectedClientId(event.target.value)}
                            className="border-slate-300 bg-white text-slate-950"
                          >
                            <option value="">Seleziona cliente</option>
                            {clients.map((client) => (
                              <option key={client.id} value={String(client.id)}>
                                {fullName(client)}
                              </option>
                            ))}
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.4rem] border border-teal-100 bg-teal-50 p-4">
                      <p className="text-sm font-black text-teal-900">
                        Flusso consigliato
                      </p>

                      <div className="mt-3 space-y-2 text-xs font-bold text-teal-800">
                        <p>1. Seleziona cliente.</p>
                        <p>2. Inserisci dati base e durata.</p>
                        <p>3. Compila giorni, esercizi e recuperi.</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {selectedClient && programPanel === "builder" && (
                <form onSubmit={saveWorkoutPlan} className="space-y-4 pb-20 md:pb-6">
                  <Card className="border border-slate-300 bg-white p-3 shadow-sm sm:p-4">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                          Scheda cliente
                        </p>
                        <h2 className="mt-1 truncate text-2xl font-black text-slate-950">
                          {editingProgramId
                            ? `Modifica: ${editingProgramTitle}`
                            : builder.title || "Nuovo programma"}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {builderStats.totalDays} giorni · {builderStats.totalExercises} esercizi · {builder.duration_weeks || 4} settimane
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end [&_button]:min-h-11">
                        {editingProgramId && (
                          <Button
                            type="button"
                            onClick={cancelProgramEditing}
                            className="w-full border border-amber-200 bg-amber-50 text-amber-700 sm:w-auto"
                          >
                            <X size={16} className="mr-2" />
                            Annulla
                          </Button>
                        )}

                        <Button
                          type="button"
                          onClick={addWorkoutDay}
                          className="w-full border border-slate-200 bg-white text-slate-900 sm:w-auto"
                        >
                          <Plus size={16} className="mr-2" />
                          Giorno
                        </Button>

                        <Button
                          type="button"
                          onClick={saveBuilderAsTemplate}
                          disabled={savingTemplate}
                          className="w-full border border-teal-200 bg-teal-50 text-teal-700 sm:w-auto"
                        >
                          <Save size={16} className="mr-2" />
                          {savingTemplate ? "Salvataggio..." : "Template"}
                        </Button>

                        <Button
                          type="submit"
                          disabled={savingPlan || builderQuality.warnings.length > 0}
                          className="w-full bg-[#07111f] text-white sm:w-auto"
                        >
                          {savingPlan
                            ? "Salvataggio..."
                            : editingProgramId
                            ? "Aggiorna"
                            : "Salva"}
                        </Button>
                      </div>
                    </div>

                    {builderQuality.warnings.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">
                        {builderQuality.warnings[0]}
                        {builderQuality.warnings.length > 1 ? ` +${builderQuality.warnings.length - 1} avvisi` : ""}
                      </div>
                    )}

                    {builderStats.totalExercises === 0 && (
                      <div className="mt-3 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-3">
                        {[
                          ["1", "Dati base", "Titolo, obiettivo, durata"],
                          ["2", "Giorni", "Aggiungi sedute ordinate"],
                          ["3", "Esercizi", "Serie, reps, recuperi"]
                        ].map(([step, title, text]) => (
                          <div
                            key={step}
                            className="flex items-start gap-2 rounded-xl bg-slate-50 p-3"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#07111f] text-[11px] font-black text-white">
                              {step}
                            </span>

                            <span>
                              <span className="block text-xs font-black text-slate-950">
                                {title}
                              </span>
                              <span className="mt-0.5 block text-[11px] font-bold leading-4 text-slate-500">
                                {text}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card className="overflow-hidden border border-slate-300 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                            Setup programma
                          </p>
                          <h3 className="mt-1 text-lg font-black text-slate-950">
                            Dati base
                          </h3>
                          <p className="mt-1 text-sm font-semibold text-slate-500">
                            Compila le informazioni essenziali prima di costruire i giorni di allenamento.
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Pill className="bg-white text-slate-700 ring-1 ring-slate-200">
                            {builder.duration_weeks || 4} settimane
                          </Pill>
                          <Pill className="bg-[#07111f] text-white">
                            {builderStats.totalDays} giorni
                          </Pill>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,.85fr)]">
                      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <Label title="Titolo programma">
                            <Input
                              value={builder.title}
                              onChange={(event) =>
                                setBuilder({
                                  ...builder,
                                  title: event.target.value
                                })
                              }
                              placeholder="Programma allenamento"
                            />
                          </Label>

                          <Label title="Obiettivo">
                            <Input
                              value={builder.goal}
                              onChange={(event) =>
                                setBuilder({
                                  ...builder,
                                  goal: event.target.value
                                })
                              }
                              placeholder="Ipertrofia, forza, ricomposizione..."
                            />
                          </Label>

                          <Label title="Note generali" className="md:col-span-2">
                            <Input
                              value={builder.notes}
                              onChange={(event) =>
                                setBuilder({
                                  ...builder,
                                  notes: event.target.value
                                })
                              }
                              placeholder="Indicazioni generali, gestione carichi, focus tecnico..."
                            />
                          </Label>
                        </div>
                      </div>

                      <div className="rounded-[1.4rem] border border-slate-900 bg-[#07111f] p-4 text-white shadow-sm">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-300">
                              Parametri
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-400">
                              Durata, livello, luogo e date.
                            </p>
                          </div>
                          <Pill className="bg-teal-300 text-slate-950">
                            Setup
                          </Pill>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Label
                            title="Settimane"
                            labelClassName="text-slate-300"
                          >
                            <Input
                              type="number"
                              min="1"
                              max="12"
                              value={builder.duration_weeks}
                              onChange={(event) => updateDurationWeeks(event.target.value)}
                              className="border-white/10 bg-white text-slate-950"
                            />
                          </Label>

                          <Label
                            title="Livello"
                            labelClassName="text-slate-300"
                          >
                            <Select
                              value={builder.level}
                              onChange={(event) =>
                                setBuilder({
                                  ...builder,
                                  level: event.target.value
                                })
                              }
                              className="border-white/10 bg-white text-slate-950"
                            >
                              <option value="principiante">Principiante</option>
                              <option value="intermedio">Intermedio</option>
                              <option value="avanzato">Avanzato</option>
                            </Select>
                          </Label>

                          <Label
                            title="Luogo"
                            labelClassName="text-slate-300"
                          >
                            <Select
                              value={builder.location}
                              onChange={(event) =>
                                setBuilder({
                                  ...builder,
                                  location: event.target.value
                                })
                              }
                              className="border-white/10 bg-white text-slate-950"
                            >
                              <option value="palestra">Palestra</option>
                              <option value="casa">Casa</option>
                              <option value="ibrido">Ibrido</option>
                            </Select>
                          </Label>

                          <Label
                            title="Inizio"
                            labelClassName="text-slate-300"
                          >
                            <Input
                              type="date"
                              value={builder.start_date}
                              onChange={(event) =>
                                setBuilder({
                                  ...builder,
                                  start_date: event.target.value
                                })
                              }
                              className="border-white/10 bg-white text-slate-950"
                            />
                          </Label>

                          <Label
                            title="Fine"
                            className="sm:col-span-2"
                            labelClassName="text-slate-300"
                          >
                            <Input
                              type="date"
                              value={builder.end_date}
                              onChange={(event) =>
                                setBuilder({
                                  ...builder,
                                  end_date: event.target.value
                                })
                              }
                              className="border-white/10 bg-white text-slate-950"
                            />
                          </Label>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    {builder.days.map((day, dayIndex) => (
                      <Card
                        key={day.temp_id}
                        className="overflow-hidden border border-slate-300 bg-white shadow-sm"
                      >
                        <div className="border-b border-slate-200 bg-[#07111f] p-4 text-white">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.5fr)_120px_minmax(0,1fr)]">
                              <Label title="Giorno" className="text-white [&_span]:text-slate-300">
                                <Input
                                  value={day.title}
                                  onChange={(event) =>
                                    updateBuilder((next) => {
                                      next.days[dayIndex].title = event.target.value;
                                    })
                                  }
                                  className="border-white/10 bg-white text-slate-950"
                                />
                              </Label>

                              <Label title="Minuti" className="text-white [&_span]:text-slate-300">
                                <Input
                                  type="number"
                                  value={day.estimated_minutes}
                                  onChange={(event) =>
                                    updateBuilder((next) => {
                                      next.days[dayIndex].estimated_minutes = event.target.value;
                                    })
                                  }
                                  className="border-white/10 bg-white text-slate-950"
                                />
                              </Label>

                              <Label title="Note giorno" className="text-white [&_span]:text-slate-300">
                                <Input
                                  value={day.notes}
                                  onChange={(event) =>
                                    updateBuilder((next) => {
                                      next.days[dayIndex].notes = event.target.value;
                                    })
                                  }
                                  placeholder="Upper, lower, push..."
                                  className="border-white/10 bg-white text-slate-950"
                                />
                              </Label>
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                              <Button
                                type="button"
                                onClick={() => moveWorkoutDay(dayIndex, -1)}
                                disabled={dayIndex === 0}
                                className="w-full border border-white/10 bg-white/10 px-3 text-white sm:w-auto"
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                onClick={() => moveWorkoutDay(dayIndex, 1)}
                                disabled={dayIndex === builder.days.length - 1}
                                className="w-full border border-white/10 bg-white/10 px-3 text-white sm:w-auto"
                              >
                                ↓
                              </Button>
                              <Button
                                type="button"
                                onClick={() => duplicateWorkoutDay(dayIndex)}
                                className="w-full border border-white/10 bg-white/10 text-white sm:w-auto"
                              >
                                Duplica
                              </Button>
                              <Button
                                type="button"
                                onClick={() => addExerciseRow(dayIndex)}
                                className="w-full bg-teal-300 text-slate-950 sm:w-auto"
                              >
                                <Plus size={16} className="mr-2" />
                                Esercizio
                              </Button>
                              <Button
                                type="button"
                                onClick={() => removeWorkoutDay(dayIndex)}
                                className="w-full border border-red-300 bg-white text-red-600 sm:w-auto"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-4">
                          <div className="flex flex-col gap-2 rounded-[1.25rem] border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-black text-slate-950">
                                Esercizi del giorno
                              </p>
                              <p className="mt-0.5 text-xs font-bold text-slate-500">
                                Mantieni ordinati volume, recuperi e progressioni.
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Pill className="bg-slate-100 text-slate-600">
                                {day.exercises.length} esercizi
                              </Pill>
                              <Pill className="bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                                {day.estimated_minutes || 0} min
                              </Pill>
                            </div>
                          </div>

                          {day.exercises.map((exercise, exerciseIndex) => (
                            <div
                              key={exercise.temp_id}
                              className="overflow-hidden rounded-[1.45rem] border border-slate-200 bg-white shadow-sm"
                            >
                              <div className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-white">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Pill className="bg-teal-300 text-slate-950">
                                        Esercizio {exerciseIndex + 1}
                                      </Pill>
                                      {exercise.has_weekly_progression && (
                                        <Pill className="bg-white/10 text-teal-300">
                                          Progressione attiva
                                        </Pill>
                                      )}
                                    </div>

                                    <p className="mt-2 truncate text-base font-black text-white">
                                      {exercise.exercise_name?.trim() || "Nuovo esercizio"}
                                    </p>
                                    <p className="mt-0.5 text-xs font-bold text-slate-400">
                                      Compila i campi principali. I dettagli restano opzionali.
                                    </p>
                                  </div>

                                  <div className="grid grid-cols-[42px_42px_minmax(0,1fr)_42px] gap-1.5 sm:flex sm:flex-wrap sm:justify-end">
                                    <Button
                                      type="button"
                                      onClick={() => moveExerciseRow(dayIndex, exerciseIndex, -1)}
                                      disabled={exerciseIndex === 0}
                                      className="w-full border border-white/10 bg-white/10 px-2 py-2 text-xs text-white sm:w-auto"
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => moveExerciseRow(dayIndex, exerciseIndex, 1)}
                                      disabled={exerciseIndex === day.exercises.length - 1}
                                      className="w-full border border-white/10 bg-white/10 px-2 py-2 text-xs text-white sm:w-auto"
                                    >
                                      ↓
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => duplicateExerciseRow(dayIndex, exerciseIndex)}
                                      className="w-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-white sm:w-auto"
                                    >
                                      Duplica
                                    </Button>
                                    <Button
                                      type="button"
                                      onClick={() => removeExerciseRow(dayIndex, exerciseIndex)}
                                      className="w-full border border-red-200 bg-white px-3 py-2 text-xs text-red-600 sm:w-auto"
                                    >
                                      <X size={14} />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4">
                                <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-3 ring-1 ring-white">
                                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
                                    <Label title="Nome esercizio" className="sm:col-span-2 lg:col-span-4">
                                      <Input
                                        placeholder="Panca piana, Squat, Lat machine..."
                                        value={exercise.exercise_name}
                                        onChange={(event) =>
                                          updateExerciseField(
                                            dayIndex,
                                            exerciseIndex,
                                            "exercise_name",
                                            event.currentTarget.value
                                          )
                                        }
                                        className="bg-white"
                                      />
                                    </Label>

                                    <Label title="Serie" className="lg:col-span-1">
                                      <Input
                                        value={exercise.sets || ""}
                                        onChange={(event) =>
                                          updateExerciseField(dayIndex, exerciseIndex, "sets", event.target.value)
                                        }
                                        placeholder="3"
                                        className="bg-white text-center"
                                      />
                                    </Label>

                                    <Label title="Reps" className="lg:col-span-2">
                                      <Input
                                        value={exercise.reps || ""}
                                        onChange={(event) =>
                                          updateExerciseField(dayIndex, exerciseIndex, "reps", event.target.value)
                                        }
                                        placeholder="8-10"
                                        className="bg-white text-center"
                                      />
                                    </Label>

                                    <Label title="Recupero" className="lg:col-span-2">
                                      <Input
                                        value={exercise.recovery_seconds || ""}
                                        onChange={(event) =>
                                          updateExerciseField(
                                            dayIndex,
                                            exerciseIndex,
                                            "recovery_seconds",
                                            event.target.value
                                          )
                                        }
                                        placeholder="90 sec"
                                        className="bg-white text-center"
                                      />
                                    </Label>

                                    <Label title="RPE" className="lg:col-span-1">
                                      <Input
                                        value={exercise.target_rpe || ""}
                                        onChange={(event) =>
                                          updateExerciseField(dayIndex, exerciseIndex, "target_rpe", event.target.value)
                                        }
                                        placeholder="8"
                                        className="bg-white text-center"
                                      />
                                    </Label>

                                    <Label title="RIR" className="lg:col-span-2">
                                      <Input
                                        value={exercise.target_rir || ""}
                                        onChange={(event) =>
                                          updateExerciseField(dayIndex, exerciseIndex, "target_rir", event.target.value)
                                        }
                                        placeholder="1-2"
                                        className="bg-white text-center"
                                      />
                                    </Label>
                                  </div>
                                </div>

                                <details className="mt-3 rounded-3xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)]">
                                  <summary className="flex cursor-pointer flex-col gap-2 px-4 py-3 text-sm font-black text-slate-800 sm:flex-row sm:items-center sm:justify-between">
                                    <span>Dettagli opzionali</span>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                      Video · Note · Progressione
                                    </span>
                                  </summary>

                                  <div className="border-t border-slate-100 p-4">
                                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                      <Label title="Note esecuzione" className="md:col-span-2 xl:col-span-2">
                                        <Input
                                          value={exercise.notes || ""}
                                          onChange={(event) =>
                                            updateExerciseField(dayIndex, exerciseIndex, "notes", event.target.value)
                                          }
                                          placeholder="Cue tecnici, range, varianti..."
                                        />
                                      </Label>

                                      <Label title="Video URL">
                                        <Input
                                          value={exercise.video_url || ""}
                                          onChange={(event) =>
                                            updateExerciseField(dayIndex, exerciseIndex, "video_url", event.target.value)
                                          }
                                          placeholder="Link video"
                                        />
                                      </Label>

                                      <Label title="Immagine URL">
                                        <Input
                                          value={exercise.image_url || ""}
                                          onChange={(event) =>
                                            updateExerciseField(dayIndex, exerciseIndex, "image_url", event.target.value)
                                          }
                                          placeholder="Link immagine"
                                        />
                                      </Label>

                                      <Label title="Media esercizio" className="md:col-span-2">
                                        <Select
                                          value={exercise.exercise_media_id || ""}
                                          onChange={(event) =>
                                            updateExerciseField(
                                              dayIndex,
                                              exerciseIndex,
                                              "exercise_media_id",
                                              event.currentTarget.value
                                            )
                                          }
                                        >
                                          <option value="">Immagine auto/opzionale</option>
                                          {exerciseMedia.map((media) => (
                                            <option key={media.id} value={media.id}>
                                              {media.name}
                                            </option>
                                          ))}
                                        </Select>
                                      </Label>

                                      <label className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-3 text-sm font-black text-teal-800 md:col-span-2">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(exercise.has_weekly_progression)}
                                          onChange={(event) =>
                                            toggleExerciseProgression(
                                              dayIndex,
                                              exerciseIndex,
                                              event.target.checked
                                            )
                                          }
                                        />
                                        Progressione settimanale su questo esercizio
                                      </label>
                                    </div>

                                    {exercise.has_weekly_progression && (
                                      <div className="mt-4 rounded-3xl border border-teal-200 bg-teal-50 p-3 shadow-inner">
                                        <div className="mb-3 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
                                          <div>
                                            <p className="text-sm font-black text-slate-900">
                                              Progressione settimanale
                                            </p>
                                            <p className="text-xs font-bold text-slate-500">
                                              Compila solo i valori che cambiano rispetto alla base.
                                            </p>
                                          </div>
                                          <Pill className="bg-teal-300 text-slate-950">
                                            {exercise.progressions?.length || 0} settimane
                                          </Pill>
                                        </div>

                                        <div className="space-y-2">
                                          {(exercise.progressions || []).map((progression, progressionIndex) => (
                                            <div
                                              key={progression.temp_id || progressionIndex}
                                              className="rounded-2xl border border-teal-200 bg-white p-3 shadow-sm"
                                            >
                                              <div className="mb-3 flex items-center justify-between gap-3">
                                                <Pill className="bg-teal-300 text-slate-950">
                                                  W{progression.week_number || progressionIndex + 1}
                                                </Pill>
                                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                                                  Target settimana
                                                </p>
                                              </div>

                                              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-12">
                                                {[
                                                  ["target_sets", "Serie", "lg:col-span-1"],
                                                  ["target_reps", "Reps", "lg:col-span-2"],
                                                  ["target_load_text", "Kg/target", "lg:col-span-2"],
                                                  ["target_rpe", "RPE", "lg:col-span-1"],
                                                  ["target_rir", "RIR", "lg:col-span-1"],
                                                  ["recovery_seconds", "Recupero", "lg:col-span-2"]
                                                ].map(([field, label, fieldClassName]) => (
                                                  <Label key={field} title={label} className={fieldClassName}>
                                                    <Input
                                                      value={progression[field] || ""}
                                                      onChange={(event) =>
                                                        updateProgressionField(
                                                          dayIndex,
                                                          exerciseIndex,
                                                          progressionIndex,
                                                          field,
                                                          event.target.value
                                                        )
                                                      }
                                                      className="text-center"
                                                    />
                                                  </Label>
                                                ))}

                                                <Label title="Note" className="sm:col-span-2 lg:col-span-3">
                                                  <Input
                                                    value={progression.notes || ""}
                                                    onChange={(event) =>
                                                      updateProgressionField(
                                                        dayIndex,
                                                        exerciseIndex,
                                                        progressionIndex,
                                                        "notes",
                                                        event.target.value
                                                      )
                                                    }
                                                  />
                                                </Label>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </details>
                              </div>
                            </div>
                          ))}

                          <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <p className="text-sm font-black text-slate-950">
                                  Aggiungi un altro esercizio
                                </p>
                                <p className="mt-0.5 text-xs font-bold text-slate-500">
                                  Rimani nello stesso giorno senza tornare all’header della seduta.
                                </p>
                              </div>

                              <Button
                                type="button"
                                onClick={() => addExerciseRow(dayIndex)}
                                className="w-full bg-[#07111f] px-4 py-2.5 text-white sm:w-auto"
                              >
                                <Plus size={15} className="mr-2" />
                                Esercizio
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="grid gap-3 xl:grid-cols-2">
                    <details className="group rounded-[1.5rem] border border-slate-300 bg-white p-4 shadow-sm transition open:shadow-md">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-950">
                            Anteprima cliente
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            Controlla come verrà letta la scheda lato cliente.
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600 group-open:bg-[#07111f] group-open:text-white">
                          Apri
                        </span>
                      </summary>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <ClientProgramPreviewPanel
                          builder={builder}
                          selectedClient={selectedClient}
                        />
                      </div>
                    </details>

                    <details className="group rounded-[1.5rem] border border-slate-300 bg-white p-4 shadow-sm transition open:shadow-md">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-950">
                            Controllo qualità
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-500">
                            {builderQuality.warnings.length > 0
                              ? `${builderQuality.warnings.length} avviso/i da sistemare prima del salvataggio.`
                              : builderQuality.suggestions.length > 0
                              ? `${builderQuality.suggestions.length} consiglio/i di rifinitura.`
                              : "Scheda pronta per il salvataggio."}
                          </p>
                        </div>

                        <Pill className={builderQuality.statusClass}>
                          {builderQuality.statusLabel}
                        </Pill>
                      </summary>

                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <BuilderQualityPanel
                          builder={builder}
                          quality={builderQuality}
                          selectedClient={selectedClient}
                          stats={builderStats}
                          savingPlan={savingPlan}
                          editingProgramId={editingProgramId}
                        />
                      </div>
                    </details>
                  </div>

                  <Card className="sticky bottom-[5.35rem] z-20 border border-slate-300 bg-white/95 p-3 shadow-[0_-18px_45px_rgba(15,23,42,0.14)] backdrop-blur md:bottom-3">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                            builderQuality.warnings.length > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {builderQuality.warnings.length > 0 ? "!" : <Check size={18} />}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">
                            {builderStats.totalDays} giorni · {builderStats.totalExercises} esercizi · {builder.duration_weeks || 4} settimane
                          </p>
                          <p className="mt-0.5 text-xs font-bold text-slate-500">
                            {builderQuality.warnings.length > 0
                              ? builderQuality.warnings[0]
                              : builderQuality.statusText}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                        <Button
                          type="button"
                          onClick={addWorkoutDay}
                          className="w-full border border-slate-200 bg-white px-4 py-2.5 text-slate-900 sm:w-auto"
                        >
                          <Plus size={15} className="mr-2" />
                          Giorno
                        </Button>

                        <Button
                          type="submit"
                          disabled={savingPlan || builderQuality.warnings.length > 0}
                          className="w-full bg-[#07111f] px-5 py-2.5 text-white sm:w-auto"
                        >
                          {savingPlan
                            ? "Salvataggio..."
                            : editingProgramId
                            ? "Aggiorna programma"
                            : "Salva programma"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </form>
              )}

              {programPanel === "templates" && (
                <TemplatesPanel
                  templates={templates}
                  savingTemplate={savingTemplate}
                  deletingTemplateId={deletingTemplateId}
                  onSaveTemplate={saveBuilderAsTemplate}
                  onUseTemplate={useTemplateInBuilder}
                  onDeleteTemplate={deleteTemplate}
                />
              )}

              {programPanel === "saved" && (
                <PlansList
                  plans={plans}
                  onDeleteProgram={deleteProgram}
                  deletingProgramId={deletingProgramId}
                  onUpdateProgramStatus={updateProgramStatus}
                  updatingProgramId={updatingProgramId}
                  onDuplicateProgram={duplicateProgramToBuilder}
                  onEditProgram={editProgramInBuilder}
                />
              )}
            </div>
          )}
          {activeTab === "monitor" && (
            <CoachMonitorPanel
              selectedClient={selectedClient}
              checkins={checkins}
              logs={logs}
              photos={photos}
              openStorageFile={openStorageFile}
            />
          )}

          {activeTab === "measurements" && (
            <div className="space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Cliente attivo
                  </p>
                  <p className="mt-2 truncate text-xl font-black text-slate-950">
                    {selectedClient ? fullName(selectedClient) : "Nessun cliente"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Misure visibili solo lato professionista.
                  </p>
                </Card>

                <Card className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Storico
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {measurements.length}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    misurazioni registrate
                  </p>
                </Card>

                <Card className="p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                    Ultimo peso
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {measurements[0]?.weight_kg ? `${measurements[0].weight_kg} kg` : "—"}
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {measurements[0]?.measurement_date || "Nessun dato recente"}
                  </p>
                </Card>
              </div>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <Card className="overflow-hidden">
                  <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                      Nuova misurazione
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      Dati corporei e circonferenze
                    </h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                      Compila solo i valori disponibili. I campi vuoti vengono salvati come non presenti.
                    </p>
                  </div>

                  {!selectedClient ? (
                    <div className="p-5">
                      <Empty
                        title="Seleziona un cliente"
                        text="Prima scegli un cliente dalla sidebar o dalla sezione Clienti."
                      />
                    </div>
                  ) : (
                    <form onSubmit={saveMeasurement} className="grid gap-5 p-5">
                      <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              Composizione
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                              Data, peso, massa grassa e massa magra.
                            </p>
                          </div>
                          <Pill className="bg-teal-50 text-teal-700">
                            Base
                          </Pill>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <Label title="Data misurazione">
                            <Input
                              type="date"
                              value={measurementForm.measurement_date}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  measurement_date: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Peso kg">
                            <Input
                              type="number"
                              value={measurementForm.weight_kg}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  weight_kg: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Body fat %">
                            <Input
                              type="number"
                              value={measurementForm.body_fat_percentage}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  body_fat_percentage: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Massa magra kg">
                            <Input
                              type="number"
                              value={measurementForm.lean_mass_kg}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  lean_mass_kg: event.target.value
                                })
                              }
                            />
                          </Label>
                        </div>
                      </div>

                      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              Circonferenze
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                              Vita, fianchi, arti e distretti principali.
                            </p>
                          </div>
                          <Pill className="bg-white text-slate-700">
                            cm
                          </Pill>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          <Label title="Vita cm">
                            <Input
                              type="number"
                              value={measurementForm.waist_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  waist_cm: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Fianchi cm">
                            <Input
                              type="number"
                              value={measurementForm.hips_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  hips_cm: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Petto cm">
                            <Input
                              type="number"
                              value={measurementForm.chest_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  chest_cm: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Addome cm">
                            <Input
                              type="number"
                              value={measurementForm.abdomen_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  abdomen_cm: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Braccio dx cm">
                            <Input
                              type="number"
                              value={measurementForm.right_arm_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  right_arm_cm: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Braccio sx cm">
                            <Input
                              type="number"
                              value={measurementForm.left_arm_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  left_arm_cm: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Coscia dx cm">
                            <Input
                              type="number"
                              value={measurementForm.right_thigh_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  right_thigh_cm: event.target.value
                                })
                              }
                            />
                          </Label>

                          <Label title="Coscia sx cm">
                            <Input
                              type="number"
                              value={measurementForm.left_thigh_cm}
                              onChange={(event) =>
                                setMeasurementForm({
                                  ...measurementForm,
                                  left_thigh_cm: event.target.value
                                })
                              }
                            />
                          </Label>
                        </div>
                      </div>

                      <Label title="Note misurazione">
                        <Textarea
                          placeholder="Es. condizioni del check, orario, ciclo, ritenzione, percezione visiva, indicazioni per il prossimo controllo..."
                          value={measurementForm.notes}
                          onChange={(event) =>
                            setMeasurementForm({
                              ...measurementForm,
                              notes: event.target.value
                            })
                          }
                        />
                      </Label>

                      <Button type="submit" className="w-full bg-[#07111f] text-white">
                        <Save size={16} className="mr-2" />
                        Salva misurazione
                      </Button>
                    </form>
                  )}
                </Card>

                <Card className="overflow-hidden">
                  <div className="border-b border-slate-200 bg-white px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                      Storico misure
                    </p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">
                      Progressi registrati
                    </h2>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                      Ultime misurazioni salvate per il cliente selezionato.
                    </p>
                  </div>

                  <div className="space-y-3 p-5">
                    {measurements.length > 0 && (
                      <div className="rounded-[1.4rem] border border-teal-100 bg-teal-50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-700">
                              Ultima rilevazione
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-950">
                              {measurements[0].measurement_date}
                            </p>
                          </div>
                          <Pill className="bg-white text-teal-700">
                            {measurements[0].weight_kg ? `${measurements[0].weight_kg} kg` : "Peso —"}
                          </Pill>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              BF
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              {measurements[0].body_fat_percentage || "—"}%
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Magra
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              {measurements[0].lean_mass_kg || "—"} kg
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white p-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Vita
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              {measurements[0].waist_cm || "—"} cm
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {measurements.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-950">
                              {item.measurement_date}
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                              Peso {item.weight_kg || "—"} kg · BF {item.body_fat_percentage || "—"}% · Massa magra {item.lean_mass_kg || "—"} kg
                            </p>
                          </div>
                          <Pill className="bg-slate-100 text-slate-700">
                            Check misure
                          </Pill>
                        </div>

                        <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2">
                          <p className="rounded-2xl bg-slate-50 px-3 py-2">
                            Vita {item.waist_cm || "—"} cm · Fianchi {item.hips_cm || "—"} cm
                          </p>
                          <p className="rounded-2xl bg-slate-50 px-3 py-2">
                            Petto {item.chest_cm || "—"} cm · Addome {item.abdomen_cm || "—"} cm
                          </p>
                          <p className="rounded-2xl bg-slate-50 px-3 py-2">
                            Braccia dx/sx {item.right_arm_cm || "—"}/{item.left_arm_cm || "—"} cm
                          </p>
                          <p className="rounded-2xl bg-slate-50 px-3 py-2">
                            Cosce dx/sx {item.right_thigh_cm || "—"}/{item.left_thigh_cm || "—"} cm
                          </p>
                        </div>

                        {item.notes && (
                          <p className="mt-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
                            {item.notes}
                          </p>
                        )}
                      </div>
                    ))}

                    {measurements.length === 0 && (
                      <Empty
                        title="Nessuna misurazione"
                        text="Inserisci la prima misurazione del cliente selezionato."
                      />
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "diets" && (
            <div className="space-y-5">
              <DietPdfFullscreenModal
                open={dietFullscreenOpen}
                title={dietDisplayTitle(previewDietForModal)}
                fileName={previewDietForModal?.file_name || "PDF dieta"}
                preview={dietPreview}
                onClose={() => setDietFullscreenOpen(false)}
                onOpenExternal={() => {
                  if (previewDietForModal?.file_path) {
                    downloadStorageFile(
                      "diets",
                      previewDietForModal.file_path,
                      previewDietForModal.file_name || dietDisplayTitle(previewDietForModal)
                    );
                  }
                }}
              />

              <Card className="overflow-hidden border-slate-200">
                <div className="bg-[#07111f] p-5 text-white md:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
                        Diete PDF
                      </p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                        Piano alimentare cliente
                      </h2>
                      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                        Carica il PDF generato da SIFA Dieta e trasformalo in una sezione consultabile in app, con riepilogo, note coach e anteprima integrata.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Cliente
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-white">
                          {selectedClient ? fullName(selectedClient) : "—"}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/10 p-3">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Diete
                        </p>
                        <p className="mt-1 text-sm font-black text-white">
                          {diets.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-teal-300 p-3 text-slate-950">
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
                          Attiva
                        </p>
                        <p className="mt-1 truncate text-sm font-black">
                          {diets[0] ? dietTypeLabel(diets[0].diet_type) : "Nessuna"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Card className="overflow-hidden">
                  <div className="border-b border-slate-200 bg-white px-5 py-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                      Upload PDF
                    </p>
                    <h3 className="mt-1 text-xl font-black text-slate-950">
                      Carica dieta SIFA
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                      Usa il PDF giornaliero, settimanale o a opzioni. Il cliente lo vedrà in modo ordinato nella sua area Dieta.
                    </p>
                  </div>

                  <form onSubmit={uploadDiet} className="space-y-4 p-5">
                    {!selectedClient && (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-800">
                        Seleziona un cliente prima di caricare una dieta.
                      </div>
                    )}

                    <Label title="Titolo piano">
                      <Input
                        placeholder="Es. Piano alimentare 5 settimane"
                        value={dietForm.title}
                        onChange={(event) =>
                          setDietForm({
                            ...dietForm,
                            title: event.target.value
                          })
                        }
                      />
                    </Label>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Label title="Formato dieta">
                        <Select
                          value={dietForm.diet_type}
                          onChange={(event) =>
                            setDietForm({
                              ...dietForm,
                              diet_type: event.target.value
                            })
                          }
                        >
                          {DIET_TYPE_OPTIONS.filter((item) => item.value !== "file").map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </Select>
                        <p className="mt-2 text-[11px] font-bold leading-5 text-slate-500">
                          Formato 1: giorni Lun-Dom. Formato 2: opzioni tipo Colazione 1, Pranzo 2, Cena 3.
                        </p>
                      </Label>

                      <Label title="Target kcal / nota calorie">
                        <Input
                          placeholder="Es. 2200 ON / 1950 OFF"
                          value={dietForm.calorie_target}
                          onChange={(event) =>
                            setDietForm({
                              ...dietForm,
                              calorie_target: event.target.value
                            })
                          }
                        />
                      </Label>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <Label title="Data inizio">
                        <Input
                          type="date"
                          value={dietForm.start_date}
                          onChange={(event) =>
                            setDietForm({
                              ...dietForm,
                              start_date: event.target.value
                            })
                          }
                        />
                      </Label>

                      <Label title="Data fine">
                        <Input
                          type="date"
                          value={dietForm.end_date}
                          onChange={(event) =>
                            setDietForm({
                              ...dietForm,
                              end_date: event.target.value
                            })
                          }
                        />
                      </Label>
                    </div>

                    <Label title="Riepilogo visibile in app">
                      <Textarea
                        placeholder="Es. 4 pasti giornalieri, ricomposizione corporea, pasto libero 1 volta a settimana."
                        value={dietForm.summary}
                        onChange={(event) =>
                          setDietForm({
                            ...dietForm,
                            summary: event.target.value
                          })
                        }
                      />
                    </Label>

                    <Label title="PDF dieta">
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) =>
                          setDietFile(event.target.files?.[0] || null)
                        }
                        className="w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-black text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-[#07111f] file:px-4 file:py-2 file:text-xs file:font-black file:text-white"
                      />
                    </Label>

                    {dietFile && (
                      <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-teal-700">
                          File selezionato
                        </p>
                        <p className="mt-1 truncate text-sm font-black text-slate-950">
                          {dietFile.name}
                        </p>
                        <p className="mt-2 text-xs font-bold leading-5 text-teal-900">
                          Al caricamento proverò a leggere automaticamente tutte le pagine del PDF e a generare card dinamiche. Se il risultato va rifinito, potrai rigenerarle dallo storico.
                        </p>
                      </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Comandi parser
                      </p>
                      <div className="mt-3 grid gap-2 text-xs font-bold leading-5 text-slate-600 sm:grid-cols-4">
                        <div className="rounded-xl bg-white p-3">1. Carica PDF</div>
                        <div className="rounded-xl bg-white p-3">2. Genera card</div>
                        <div className="rounded-xl bg-white p-3">3. Controlla qualità</div>
                        <div className="rounded-xl bg-white p-3">4. Verifica in Pasti</div>
                      </div>
                      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                        Dopo il caricamento puoi generare la vista cliente e controllare subito la sezione Pasti prima di farla usare al cliente.
                      </p>
                    </div>

                    <Label title="Note coach">
                      <Textarea
                        placeholder="Indicazioni aggiuntive, integrazione, sostituzioni o messaggi per il cliente."
                        value={dietForm.notes}
                        onChange={(event) =>
                          setDietForm({
                            ...dietForm,
                            notes: event.target.value
                          })
                        }
                      />
                    </Label>

                    <Button
                      type="submit"
                      disabled={!selectedClient || !dietFile || extractingDietPdf}
                      className="w-full bg-[#07111f] text-white hover:bg-slate-800"
                    >
                      <Upload size={17} className="mr-2" />
                      {extractingDietPdf ? "Lettura PDF in corso..." : "Carica PDF dieta"}
                    </Button>
                  </form>
                </Card>

                <div className="space-y-5">
                  <Card className="overflow-hidden">
                    <div className="border-b border-slate-200 bg-white px-5 py-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                        Dieta attiva
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        Anteprima cliente
                      </h3>
                    </div>

                    <div className="p-5">
                      {diets[0] ? (
                        <div className="rounded-[1.6rem] border border-[#07111f] bg-slate-50 p-5">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <Pill className="bg-[#07111f] text-white">Attiva</Pill>
                                <Pill className="bg-teal-100 text-teal-700">
                                  {dietTypeLabel(diets[0].diet_type)}
                                </Pill>
                                {dietIsPdf(diets[0]) && (
                                  <Pill className="bg-white text-slate-700">PDF</Pill>
                                )}
                              </div>

                              <h4 className="mt-3 text-2xl font-black leading-tight text-slate-950">
                                {dietDisplayTitle(diets[0])}
                              </h4>
                              <p className="mt-1 text-sm font-bold text-slate-500">
                                {dietPeriodLabel(diets[0])}
                              </p>

                              <div className="mt-4 space-y-3">
                                <DietSummaryBox diet={diets[0]} />
                                <DietInfoGrid diet={diets[0]} compact />
                                <DietParseQualityCard
                                  diet={diets[0]}
                                  compact
                                  onAnalyze={() => analyzeDietPdfToCards(diets[0])}
                                  analyzing={analyzingDietId === String(diets[0].id)}
                                />
                                <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white">
                                  <div className="border-b border-slate-200 px-4 py-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-teal-700">
                                      Vista cliente
                                    </p>
                                    <p className="mt-1 text-sm font-black text-slate-950">
                                      Sezione Pasti
                                    </p>
                                  </div>
                                  <div className="p-3">
                                    <DietExtractedPlan diet={diets[0]} />
                                  </div>
                                </div>
                                <DietCoachNoteBox diet={diets[0]} emptyTitle="Nessuna nota coach" />
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col gap-2 sm:min-w-40">
                              <Button
                                onClick={() => previewDietInApp(diets[0])}
                                className="bg-teal-300 text-slate-950 hover:bg-teal-200"
                              >
                                Visualizza sotto
                              </Button>
                              <Button
                                onClick={() => openDietFullscreen(diets[0])}
                                className="bg-[#07111f] text-white"
                              >
                                Schermo interno
                              </Button>
                              <Button
                                onClick={() => analyzeDietPdfToCards(diets[0])}
                                disabled={analyzingDietId === String(diets[0].id)}
                                className="border border-teal-200 bg-white text-teal-700"
                              >
                                {analyzingDietId === String(diets[0].id)
                                  ? "Analisi..."
                                  : dietExtractedInfo(diets[0])
                                  ? "Rigenera vista"
                                  : "Genera vista"}
                              </Button>
                              <Button
                                onClick={() =>
                                  downloadStorageFile(
                                    "diets",
                                    diets[0].file_path,
                                    diets[0].file_name || dietDisplayTitle(diets[0])
                                  )
                                }
                                className="border border-slate-200 bg-white text-slate-950"
                              >
                                Scarica PDF
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Empty
                          title="Nessuna dieta attiva"
                          text="Carica un PDF SIFA per creare la visualizzazione cliente."
                        />
                      )}
                    </div>
                  </Card>

                  <Card className="overflow-hidden">
                    <div className="border-b border-slate-200 bg-white px-5 py-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                        Viewer integrato
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        PDF dentro TMFIT
                      </h3>
                    </div>

                    <div className="p-5">
                      {dietPreview.loading && (
                        <div className="grid min-h-[280px] place-items-center rounded-[1.6rem] border border-slate-200 bg-slate-50 text-sm font-black text-slate-500">
                          Preparazione anteprima PDF...
                        </div>
                      )}

                      {!dietPreview.loading && dietPreview.error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                          {dietPreview.error}
                        </div>
                      )}

                      {!dietPreview.loading && dietPreview.url && (
                        <DietPdfInlineViewer
                          url={dietPreview.url}
                          title={previewDietForModal?.file_name || "Anteprima PDF dieta"}
                          onOpenFull={() => setDietFullscreenOpen(true)}
                          onOpenExternal={() => {
                            if (previewDietForModal?.file_path) {
                              downloadStorageFile(
                                "diets",
                                previewDietForModal.file_path,
                                previewDietForModal.file_name || dietDisplayTitle(previewDietForModal)
                              );
                            }
                          }}
                        />
                      )}

                      {!dietPreview.loading && !dietPreview.url && !dietPreview.error && (
                        <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                          <FileText className="mx-auto text-slate-400" />
                          <p className="mt-3 font-black text-slate-950">
                            Seleziona “Visualizza in app” su una dieta.
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                            Il PDF verrà aperto qui, senza uscire dalla piattaforma.
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              <Card className="overflow-hidden">
                <div className="border-b border-slate-200 bg-white px-5 py-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                    Storico
                  </p>
                  <h3 className="mt-1 text-xl font-black text-slate-950">
                    Diete caricate
                  </h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    L’ultima dieta caricata resta la più visibile lato cliente.
                  </p>
                </div>

                <div className="grid gap-3 p-5 lg:grid-cols-2">
                  {diets.map((diet, index) => (
                    <div
                      key={diet.id}
                      className={`rounded-[1.4rem] border p-4 shadow-sm ${
                        index === 0
                          ? "border-teal-200 bg-teal-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-black text-slate-950">
                              {dietDisplayTitle(diet)}
                            </p>
                            {index === 0 && (
                              <Pill className="bg-[#07111f] text-white">Attiva</Pill>
                            )}
                          </div>
                          <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                            {diet.file_name || "PDF dieta"}
                          </p>
                          <p className="mt-1 text-xs font-bold text-slate-400">
                            {dietTypeLabel(diet.diet_type)} · {dietStructuredInfo(diet).calorieTarget || dietPeriodLabel(diet)}
                          </p>

                          <div className="mt-3">
                            <DietParseQualityCard
                              diet={diet}
                              compact
                              onAnalyze={() => analyzeDietPdfToCards(diet)}
                              analyzing={analyzingDietId === String(diet.id)}
                            />
                          </div>
                        </div>

                        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
                          <Button
                            onClick={() => previewDietInApp(diet)}
                            className="bg-teal-300 px-3 py-2 text-xs text-slate-950"
                          >
                            In app
                          </Button>
                          <Button
                            onClick={() => analyzeDietPdfToCards(diet)}
                            disabled={analyzingDietId === String(diet.id)}
                            className="border border-teal-200 bg-white px-3 py-2 text-xs text-teal-700"
                          >
                            {analyzingDietId === String(diet.id)
                              ? "Analisi"
                              : dietExtractedInfo(diet)
                              ? "Rigenera"
                              : "Genera"}
                          </Button>
                          <Button
                            onClick={() =>
                              downloadStorageFile(
                                "diets",
                                diet.file_path,
                                diet.file_name || dietDisplayTitle(diet)
                              )
                            }
                            className="bg-[#07111f] px-3 py-2 text-xs text-white"
                          >
                            Scarica
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {diets.length === 0 && (
                    <div className="lg:col-span-2">
                      <Empty
                        title="Nessuna dieta"
                        text="Carica il primo PDF dieta per il cliente selezionato."
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-5">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="bg-[#07111f] p-5 text-white md:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.28em] text-teal-300">
                        Comunicazioni
                      </p>

                      <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
                        Bacheca coach
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                        Pubblica aggiornamenti, promemoria o comunicazioni per tutti i clienti oppure solo per il cliente selezionato.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
                      <div className="rounded-2xl bg-white/10 px-3 py-3">
                        <p className="text-lg font-black text-white">{posts.length}</p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Totali
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/10 px-3 py-3">
                        <p className="text-lg font-black text-white">
                          {posts.filter((post) => post.is_pinned).length}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Fissati
                        </p>
                      </div>

                      <div className="rounded-2xl bg-teal-300 px-3 py-3 text-slate-950">
                        <p className="text-lg font-black">
                          {posts.filter((post) => !post.client_id).length}
                        </p>
                        <p className="mt-1 text-[10px] font-black uppercase tracking-[0.18em]">
                          Globali
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
                <Card className="overflow-hidden">
                  <div className="border-b border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                          Nuovo post
                        </p>

                        <h3 className="mt-1 text-xl font-black text-slate-950">
                          Nuovo messaggio bacheca
                        </h3>

                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                          Scrivi un messaggio breve, chiaro e leggibile anche da mobile.
                        </p>
                      </div>

                      <div className="hidden rounded-2xl bg-white px-3 py-2 text-center shadow-sm sm:block">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Target
                        </p>
                        <p className="mt-1 text-xs font-black text-slate-800">
                          {postForm.client_scope === "all" ? "Tutti" : selectedClient ? fullName(selectedClient) : "Cliente"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={savePost} className="space-y-4 p-5">
                    <Label title="Titolo comunicazione">
                      <Input
                        required
                        placeholder="Es. Aggiornamento dieta, check-in, promemoria"
                        value={postForm.title}
                        onChange={(event) =>
                          setPostForm({
                            ...postForm,
                            title: event.target.value
                          })
                        }
                      />
                    </Label>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                      <Label title="Destinatari">
                        <Select
                          value={postForm.client_scope}
                          onChange={(event) =>
                            setPostForm({
                              ...postForm,
                              client_scope: event.target.value
                            })
                          }
                        >
                          <option value="selected">Solo cliente selezionato</option>
                          <option value="all">Tutti i clienti</option>
                        </Select>
                      </Label>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                          Cliente selezionato
                        </p>
                        <p className="mt-1 max-w-[220px] truncate text-sm font-black text-slate-800">
                          {selectedClient ? fullName(selectedClient) : "Nessun cliente"}
                        </p>
                      </div>
                    </div>

                    <Label title="Testo messaggio">
                      <Textarea
                        placeholder="Scrivi il messaggio che il cliente vedrà nella sua area Bacheca."
                        value={postForm.body}
                        onChange={(event) =>
                          setPostForm({
                            ...postForm,
                            body: event.target.value
                          })
                        }
                        className="min-h-40"
                      />
                    </Label>

                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <input
                        type="checkbox"
                        checked={postForm.is_pinned}
                        onChange={(event) =>
                          setPostForm({
                            ...postForm,
                            is_pinned: event.target.checked
                          })
                        }
                        className="mt-1"
                      />
                      <span>
                        <span className="block text-sm font-black text-slate-800">
                          Messaggio fissato
                        </span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">
                          Utile per comunicazioni importanti che devono restare in evidenza nella bacheca cliente.
                        </span>
                      </span>
                    </label>

                    <Button type="submit" className="w-full bg-[#07111f] text-white hover:bg-slate-800">
                      <Megaphone size={17} className="mr-2" />
                      Pubblica messaggio
                    </Button>
                  </form>
                </Card>

                <Card className="overflow-hidden">
                  <div className="border-b border-slate-200 bg-white p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                          Storico
                        </p>

                        <h3 className="mt-1 text-xl font-black text-slate-950">
                          Messaggi pubblicati
                        </h3>
                      </div>

                      <Pill className="bg-slate-100 text-slate-700">
                        {posts.length} messaggi
                      </Pill>
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className={`rounded-[1.35rem] border p-4 transition ${
                          post.is_pinned
                            ? "border-teal-200 bg-teal-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-base font-black text-slate-950">
                                {post.title}
                              </h4>

                              {post.is_pinned && (
                                <Pill className="bg-teal-300 text-slate-950">
                                  Fissato
                                </Pill>
                              )}
                            </div>

                            <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-6 text-slate-600">
                              {post.body || "Nessun testo inserito."}
                            </p>
                          </div>

                          <div className="shrink-0 rounded-2xl bg-slate-100 px-3 py-2 text-left sm:text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                              Visibilità
                            </p>
                            <p className="mt-1 text-xs font-black text-slate-700">
                              {post.client_id ? "Cliente specifico" : "Tutti i clienti"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-400">
                          <span>
                            {post.created_at
                              ? new Intl.DateTimeFormat("it-IT", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric"
                                }).format(new Date(post.created_at))
                              : "Data non disponibile"}
                          </span>
                          <span>•</span>
                          <span>{post.client_id ? "Messaggio mirato" : "Messaggio globale"}</span>
                        </div>
                      </article>
                    ))}

                    {posts.length === 0 && (
                      <Empty
                        title="Nessun messaggio"
                        text="Pubblica il primo messaggio per iniziare a usare la bacheca clienti."
                      />
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

        </section>
            </main>

      <AppFooter role="coach" />
    </div>
  );
}
function CoachControlCenter({
  clients,
  coachData,
  loading,
  onOpenClient,
  onRefresh
}) {
  const plans = coachData?.plans || [];
  const diets = coachData?.diets || [];
  const checkins = coachData?.checkins || [];
  const photos = coachData?.photos || [];
  const sessions = coachData?.sessions || [];

  function sameClient(row, client) {
    return String(row.client_id) === String(client.id);
  }

  function latestForClient(rows, client, dateKeys = ["created_at"]) {
    const filtered = rows.filter((row) => sameClient(row, client));

    return filtered.sort((a, b) => {
      const left = getDateValue(a, dateKeys);
      const right = getDateValue(b, dateKeys);

      return new Date(right || 0).getTime() - new Date(left || 0).getTime();
    })[0];
  }

  function getDateValue(row, keys) {
    for (const key of keys) {
      if (row?.[key]) return row[key];
    }

    return null;
  }

  function daysSince(value) {
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const diff = Date.now() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function isActivePlan(plan) {
    const status = String(plan?.status || "active").toLowerCase();
    return !["archived", "inactive", "deleted"].includes(status);
  }

  const activePlanClientIds = new Set(
    plans.filter(isActivePlan).map((plan) => String(plan.client_id))
  );

  const dietClientIds = new Set(diets.map((diet) => String(diet.client_id)));

  const clientsWithoutPlan = clients.filter(
    (client) => !activePlanClientIds.has(String(client.id))
  );

  const clientsWithoutDiet = clients.filter(
    (client) => !dietClientIds.has(String(client.id))
  );

  const staleCheckinClients = clients.filter((client) => {
    const latest = latestForClient(checkins, client, [
      "checkin_date",
      "created_at"
    ]);
    const days = daysSince(getDateValue(latest, ["checkin_date", "created_at"]));

    return days === null || days >= 7;
  });

  const stalePhotoClients = clients.filter((client) => {
    const latest = latestForClient(photos, client, ["photo_date", "created_at"]);
    const days = daysSince(getDateValue(latest, ["photo_date", "created_at"]));

    return days === null || days >= 30;
  });

  const inactiveWorkoutClients = clients.filter((client) => {
    const latest = latestForClient(sessions, client, [
      "session_date",
      "created_at"
    ]);
    const days = daysSince(getDateValue(latest, ["session_date", "created_at"]));

    return days === null || days >= 7;
  });

  const priorityItems = clients
    .flatMap((client) => {
      const items = [];

      const latestCheckin = latestForClient(checkins, client, [
        "checkin_date",
        "created_at"
      ]);
      const latestPhoto = latestForClient(photos, client, [
        "photo_date",
        "created_at"
      ]);
      const latestSession = latestForClient(sessions, client, [
        "session_date",
        "created_at"
      ]);

      const checkinDays = daysSince(
        getDateValue(latestCheckin, ["checkin_date", "created_at"])
      );
      const photoDays = daysSince(
        getDateValue(latestPhoto, ["photo_date", "created_at"])
      );
      const sessionDays = daysSince(
        getDateValue(latestSession, ["session_date", "created_at"])
      );

      if (!activePlanClientIds.has(String(client.id))) {
        items.push({
          client,
          level: "Alta",
          title: "Manca programma attivo",
          text: "Crea o assegna una scheda allenamento.",
          tab: "programs",
          score: 100
        });
      }

      if (!dietClientIds.has(String(client.id))) {
        items.push({
          client,
          level: "Media",
          title: "Manca dieta",
          text: "Carica o aggiorna il piano alimentare.",
          tab: "diets",
          score: 80
        });
      }

      if (checkinDays === null || checkinDays >= 7) {
        items.push({
          client,
          level: "Media",
          title:
            checkinDays === null
              ? "Nessun check-in"
              : `Check-in fermo da ${checkinDays} giorni`,
          text: "Da ricontattare o stimolare al check-in.",
          tab: "monitor",
          score: 70
        });
      }

      if (sessionDays === null || sessionDays >= 7) {
        items.push({
          client,
          level: "Media",
          title:
            sessionDays === null
              ? "Nessun allenamento registrato"
              : `Nessun allenamento da ${sessionDays} giorni`,
          text: "Controlla aderenza e completamento scheda.",
          tab: "programs",
          score: 60
        });
      }

      if (photoDays === null || photoDays >= 30) {
        items.push({
          client,
          level: "Bassa",
          title:
            photoDays === null
              ? "Nessuna foto progressi"
              : `Foto progressi ferma da ${photoDays} giorni`,
          text: "Utile per valutare il percorso visivamente.",
          tab: "monitor",
          score: 40
        });
      }

      return items;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const kpis = [
    {
      label: "Clienti",
      value: clients.length,
      icon: <Users size={18} />
    },
    {
      label: "Senza programma",
      value: clientsWithoutPlan.length,
      icon: <Dumbbell size={18} />
    },
    {
      label: "Senza dieta",
      value: clientsWithoutDiet.length,
      icon: <FileText size={18} />
    },
    {
      label: "Check-in da sollecitare",
      value: staleCheckinClients.length,
      icon: <ClipboardCheck size={18} />
    },
    {
      label: "Foto da aggiornare",
      value: stalePhotoClients.length,
      icon: <Camera size={18} />
    },
    {
      label: "Allenamenti fermi",
      value: inactiveWorkoutClients.length,
      icon: <Activity size={18} />
    }
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-100 bg-[#07111f] p-5 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
              Coach Control Center
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Priorità operative
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-300">
              Una panoramica rapida per capire chi seguire, cosa manca e dove
              intervenire.
            </p>
          </div>

          <Button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="bg-white text-slate-950"
          >
            {loading ? "Aggiornamento..." : "Aggiorna dati"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((item) => (
          <div
            key={item.label}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
              {item.icon}
            </div>

            <p className="text-3xl font-black text-slate-950">
              {item.value}
            </p>

            <p className="mt-1 text-[11px] font-black uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 border-t border-slate-100 p-4 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-black">Da fare oggi</h3>

            <Pill className="bg-teal-100 text-teal-700">
              {priorityItems.length} priorità
            </Pill>
          </div>

          <div className="space-y-2">
            {priorityItems.map((item, index) => (
              <div
                key={`${item.client.id}-${item.title}-${index}`}
                className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-black text-slate-950">
                      {fullName(item.client)}
                    </p>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                        item.level === "Alta"
                          ? "bg-red-100 text-red-700"
                          : item.level === "Media"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.level}
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-black text-slate-800">
                    {item.title}
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {item.text}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => onOpenClient(item.client.id, item.tab)}
                  className="shrink-0 bg-[#07111f] text-white"
                >
                  Apri
                </Button>
              </div>
            ))}

            {priorityItems.length === 0 && (
              <Empty
                title="Tutto sotto controllo"
                text="Non ci sono priorità operative evidenti sui clienti."
              />
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-lg font-black">Sistema coaching</h3>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-300 text-xs font-black text-slate-950">
                1
              </span>

              <div>
                <p className="text-sm font-black">Prima crea copertura</p>
                <p className="text-xs font-bold leading-5 text-slate-500">
                  Ogni cliente dovrebbe avere programma attivo, dieta o nota
                  alimentare e check-in periodico.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-300 text-xs font-black text-slate-950">
                2
              </span>

              <div>
                <p className="text-sm font-black">Poi controlla aderenza</p>
                <p className="text-xs font-bold leading-5 text-slate-500">
                  Se non ci sono sessioni o check-in recenti, il cliente va
                  richiamato prima che molli.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-teal-300 text-xs font-black text-slate-950">
                3
              </span>

              <div>
                <p className="text-sm font-black">Infine monitora progressi</p>
                <p className="text-xs font-bold leading-5 text-slate-500">
                  Foto, misure, carichi e check-in sono quello che rende il
                  percorso professionale e dimostrabile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
function BuilderWorkflowNav({ activeStep, onChange, quality }) {
  const steps = [
    {
      id: "setup",
      label: "Setup",
      text: "Titolo, obiettivo, durata"
    },
    {
      id: "workouts",
      label: "Allenamenti",
      text: "Giorni, esercizi, recuperi"
    },
    {
      id: "progressions",
      label: "Progressioni",
      text: "Solo dove serve"
    },
    {
      id: "summary",
      label: "Riepilogo",
      text: "Controllo qualità"
    }
  ];

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-700">
            Percorso guidato
          </p>
          <h3 className="mt-1 text-xl font-black text-slate-950">
            Crea la scheda senza effetto Excel
          </h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Segui gli step, controlla gli avvisi e salva solo quando la scheda è completa.
          </p>
        </div>

        <div className="rounded-3xl bg-slate-50 p-3 text-center">
          <p className="text-2xl font-black text-slate-950">{quality.score}/100</p>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            Qualità scheda
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onChange(step.id)}
            className={`rounded-2xl border p-3 text-left transition ${
              activeStep === step.id
                ? "border-teal-300 bg-teal-50 shadow-sm"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
                  activeStep === step.id
                    ? "bg-teal-300 text-slate-950"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {index + 1}
              </span>
              <p className="font-black text-slate-950">{step.label}</p>
            </div>
            <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
              {step.text}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 rounded-3xl bg-[#07111f] p-4 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-black">{quality.statusLabel}</p>
          <p className="mt-1 text-xs font-semibold text-slate-300">
            {quality.statusText}
          </p>
        </div>
        <Pill className={quality.statusClass}>{quality.statusLabel}</Pill>
      </div>
    </Card>
  );
}


function ClientProgramPreviewPanel({ builder, selectedClient }) {
  const firstDay = builder.days?.[0] || null;
  const visibleExercises = firstDay?.exercises?.filter((exercise) =>
    String(exercise.exercise_name || "").trim()
  ) || [];

  return (
    <Card className="overflow-hidden border-2 border-[#07111f]/10 bg-white shadow-md">
      <div className="bg-[#07111f] p-4 text-white md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
              Anteprima cliente
            </p>
            <h3 className="mt-2 text-xl font-black">
              Come vedrà la scheda il cliente
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-300">
              {selectedClient ? fullName(selectedClient) : "Cliente non selezionato"} · {builder.title || "Programma allenamento"}
            </p>
          </div>

          <Pill className="bg-teal-300 text-slate-950">
            Preview app
          </Pill>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[.8fr_1.2fr]">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
            Prossimo allenamento
          </p>
          <h4 className="mt-2 text-2xl font-black text-slate-950">
            {firstDay?.title || "Allenamento A"}
          </h4>
          <p className="mt-2 text-sm font-bold text-slate-500">
            {visibleExercises.length} esercizi · {firstDay?.estimated_minutes || 60} min · {builder.duration_weeks || 4} settimane
          </p>
          <div className="mt-4 rounded-2xl bg-[#07111f] px-4 py-3 text-center text-sm font-black text-white">
            Inizia allenamento
          </div>
        </div>

        <div className="space-y-2">
          {visibleExercises.slice(0, 6).map((exercise, index) => (
            <div
              key={exercise.temp_id || index}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-black text-slate-950">
                  {index + 1}. {exercise.exercise_name}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  {exercise.sets || "—"} serie · {exercise.reps || "—"} reps · recupero {exercise.recovery_seconds || 90}s
                </p>
              </div>
              {exercise.has_weekly_progression && (
                <Pill className="bg-teal-100 text-teal-700">Progressione</Pill>
              )}
            </div>
          ))}

          {visibleExercises.length === 0 && (
            <Empty
              title="Anteprima vuota"
              text="Inserisci almeno un esercizio per vedere come apparirà lato cliente."
            />
          )}
        </div>
      </div>
    </Card>
  );
}

function BuilderQualityPanel({
  builder,
  quality,
  selectedClient,
  stats,
  savingPlan,
  editingProgramId
}) {
  const hasWarnings = quality.warnings.length > 0;
  const hasSuggestions = quality.suggestions.length > 0;

  return (
    <Card className="overflow-hidden border border-slate-300 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-4 md:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
              Riepilogo finale
            </p>
            <h3 className="mt-1 truncate text-xl font-black text-slate-950">
              {builder.title || "Programma allenamento"}
            </h3>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
              {selectedClient ? fullName(selectedClient) : "Cliente non selezionato"} · {stats.totalDays} allenamenti · {stats.totalExercises} esercizi · {builder.duration_weeks || 4} settimane
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-right">
              <p className="text-2xl font-black text-slate-950">{quality.score}/100</p>
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                qualità
              </p>
            </div>
            <Pill className={quality.statusClass}>{quality.statusLabel}</Pill>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr] md:p-5">
        <div className="space-y-2">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h4 className="font-black text-slate-950">Checklist</h4>
            <span className="text-xs font-black text-slate-400">
              {quality.checks.filter((check) => check.done).length}/{quality.checks.length}
            </span>
          </div>

          {quality.checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  check.done ? "bg-teal-300 text-slate-950" : "bg-amber-100 text-amber-700"
                }`}
              >
                {check.done ? <Check size={15} /> : "!"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black text-slate-950">{check.label}</p>
                <p className="truncate text-xs font-bold text-slate-500">
                  {check.helper}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-950">Avvisi scheda</h4>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Mostra solo ciò che serve prima di salvare.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black text-slate-600">
                {hasWarnings ? `${quality.warnings.length} avvisi` : hasSuggestions ? `${quality.suggestions.length} consigli` : "OK"}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {hasWarnings &&
                quality.warnings.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-bold leading-6 text-amber-800"
                  >
                    {item}
                  </div>
                ))}

              {!hasWarnings && hasSuggestions &&
                quality.suggestions.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm font-bold leading-6 text-sky-800"
                  >
                    {item}
                  </div>
                ))}

              {!hasWarnings && !hasSuggestions && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 px-3 py-2.5">
                  <p className="text-sm font-black text-teal-800">
                    Scheda completa e ordinata.
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-teal-700">
                    Puoi salvarla e assegnarla al cliente.
                  </p>
                </div>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={savingPlan || hasWarnings}
            className="w-full bg-[#07111f] text-white"
          >
            {savingPlan
              ? "Salvataggio..."
              : editingProgramId
              ? "Aggiorna programma"
              : "Salva programma"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function SmartBuilderOverview({
  builder,
  editingProgramId,
  editingProgramTitle,
  stats,
  savingPlan,
  savingTemplate,
  onSaveTemplate,
  onCancelEditing
}) {
  return (
    <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">
            {editingProgramId ? "Modalità modifica" : "Smart Builder"}
          </p>

          <h3 className="mt-1 text-2xl font-black text-slate-950">
            {editingProgramId
              ? editingProgramTitle || "Modifica programma"
              : builder.title || "Nuovo programma"}
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            {builder.goal || "Obiettivo non impostato"} ·{" "}
            {builder.duration_weeks || 4} settimane · {builder.location}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-2xl font-black">{stats.totalDays}</p>
            <p className="text-[11px] font-black uppercase text-slate-400">
              Allenamenti
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-2xl font-black">{stats.totalExercises}</p>
            <p className="text-[11px] font-black uppercase text-slate-400">
              Esercizi
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-2xl font-black">{stats.totalProgressions}</p>
            <p className="text-[11px] font-black uppercase text-slate-400">
              Progressioni
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-2xl font-black">{stats.estimatedMinutes}</p>
            <p className="text-[11px] font-black uppercase text-slate-400">
              Min totali
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Button
          type="button"
          onClick={onSaveTemplate}
          disabled={savingTemplate}
          className="border border-slate-200 bg-slate-50 text-slate-900"
        >
          <Save size={16} className="mr-2" />
          {savingTemplate ? "Salvataggio template..." : "Salva come template"}
        </Button>

        {editingProgramId && (
          <Button
            type="button"
            onClick={onCancelEditing}
            className="border border-amber-200 bg-amber-50 text-amber-700"
          >
            <X size={16} className="mr-2" />
            Annulla modifica
          </Button>
        )}

        <div className="ml-auto hidden items-center rounded-2xl bg-teal-50 px-4 py-3 text-xs font-black uppercase tracking-wider text-teal-700 md:flex">
          {editingProgramId
            ? "Stai aggiornando una scheda esistente"
            : "Stai creando una nuova scheda"}
        </div>
      </div>
    </div>
  );
}
function CoachClientSnapshot({
  selectedClient,
  plans,
  checkins,
  measurements,
  sessions,
  diets,
  photos,
  logs,
  privateNotes,
  deletingClient = false,
  onCreateClient,
  onCreateProgram,
  onOpenDiets,
  onOpenMeasurements,
  onOpenMonitor,
  onAddNote,
  onDeleteClient
}) {
  const activePlans = plans.filter((plan) => {
    const status = String(plan?.status || "active").toLowerCase();
    return !["archived", "deleted", "inactive"].includes(status);
  });

  const activeDiets = diets.filter((diet) => {
    const status = String(diet?.status || "active").toLowerCase();
    return !["archived", "deleted", "inactive"].includes(status);
  });

  const latestCheckin = checkins[0];
  const latestMeasurement = measurements[0];
  const latestSession = sessions[0];
  const latestLog = logs[0];
  const latestPhoto = photos[0];
  const latestPrivateNote = privateNotes[0];
  const activePlan = activePlans[0];
  const activeDiet = activeDiets[0] || diets[0];

  function toDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    const date = toDate(value);
    if (!date) return "—";

    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function daysSince(value) {
    const date = toDate(value);
    if (!date) return null;

    const diff = Date.now() - date.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  function recencyText(value, empty = "Mai registrato") {
    const days = daysSince(value);

    if (days === null) return empty;
    if (days === 0) return "Oggi";
    if (days === 1) return "Ieri";
    return `${days} giorni fa`;
  }

  const lastWorkoutDate = latestSession?.session_date || latestSession?.created_at;
  const lastCheckinDate = latestCheckin?.checkin_date || latestCheckin?.created_at;
  const lastMeasurementDate =
    latestMeasurement?.measurement_date || latestMeasurement?.created_at;
  const lastPhotoDate = latestPhoto?.photo_date || latestPhoto?.created_at;
  const lastWorkoutDays = daysSince(lastWorkoutDate);
  const lastCheckinDays = daysSince(lastCheckinDate);

  let clientStatus = {
    label: "In ordine",
    text: "Programma attivo e percorso sotto controllo.",
    className: "bg-teal-300 text-slate-950"
  };

  if (activePlans.length === 0) {
    clientStatus = {
      label: "Da configurare",
      text: "Manca un programma attivo da assegnare.",
      className: "bg-amber-300 text-slate-950"
    };
  } else if (lastWorkoutDays === null) {
    clientStatus = {
      label: "Da avviare",
      text: "Programma presente, ma nessun allenamento registrato.",
      className: "bg-sky-300 text-slate-950"
    };
  } else if (lastWorkoutDays > 10) {
    clientStatus = {
      label: "A rischio drop",
      text: `Nessun allenamento registrato da ${lastWorkoutDays} giorni.`,
      className: "bg-red-100 text-red-700"
    };
  } else if (lastCheckinDays !== null && lastCheckinDays <= 3) {
    clientStatus = {
      label: "Da seguire",
      text: "Check-in recente da valutare e trasformare in feedback.",
      className: "bg-violet-100 text-violet-700"
    };
  }

  const quickStats = [
    {
      label: "Programma",
      value: activePlan?.title || "Nessun programma attivo",
      helper: activePlan?.duration_weeks
        ? `${activePlan.duration_weeks} settimane`
        : "Crea o assegna una scheda"
    },
    {
      label: "Dieta",
      value: activeDiet?.title || "Nessuna dieta caricata",
      helper: activeDiet?.created_at
        ? `Caricata ${formatDate(activeDiet.created_at)}`
        : "Carica piano o PDF"
    },
    {
      label: "Check-in",
      value: latestCheckin?.weight_kg ? `${latestCheckin.weight_kg} kg` : "—",
      helper: recencyText(lastCheckinDate, "Nessun check-in")
    },
    {
      label: "Allenamento",
      value: latestSession?.session_date ? formatDate(latestSession.session_date) : "—",
      helper: recencyText(lastWorkoutDate, "Nessuna sessione")
    }
  ];

  const timelineItems = [
    {
      title: "Ultima misurazione",
      value: latestMeasurement?.weight_kg
        ? `${latestMeasurement.weight_kg} kg`
        : "Nessun dato",
      helper: recencyText(lastMeasurementDate, "Non registrata"),
      extra: latestMeasurement
        ? `Vita ${latestMeasurement.waist_cm || "—"} cm · BF ${
            latestMeasurement.body_fat_percentage || "—"
          }%`
        : ""
    },
    {
      title: "Ultima serie registrata",
      value: latestLog?.workout_exercises?.exercise_name || "Nessuna serie",
      helper: latestLog
        ? `${latestLog.load_kg || "—"} kg x ${latestLog.reps_done || "—"} · RPE ${
            latestLog.rpe || "—"
          }`
        : "In attesa dati cliente",
      extra: latestLog?.created_at ? formatDate(latestLog.created_at) : ""
    },
    {
      title: "Foto progressi",
      value: photos.length ? `${photos.length} foto caricate` : "Nessuna foto",
      helper: recencyText(lastPhotoDate, "Non caricata"),
      extra: latestPhoto?.label || latestPhoto?.notes || ""
    },
    {
      title: "Note private",
      value: privateNotes.length ? `${privateNotes.length} note coach` : "Nessuna nota",
      helper: latestPrivateNote?.created_at
        ? formatDate(latestPrivateNote.created_at)
        : "Solo area professionista",
      extra: latestPrivateNote?.note_text || latestPrivateNote?.content || ""
    }
  ];

  if (!selectedClient) {
    return (
      <Card className="p-5">
        <Empty
          title="Seleziona un cliente"
          text="La scheda CRM comparirà qui con stato percorso, azioni rapide e segnali operativi."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="bg-[#07111f] p-5 text-white md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
                CRM Cliente
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                {fullName(selectedClient)}
              </h2>

              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-300">
                {selectedClient.goal || "Obiettivo non impostato"}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Pill className={clientStatus.className}>{clientStatus.label}</Pill>

                <Pill className="bg-white/10 text-white">
                  {selectedClient.email || "Email non inserita"}
                </Pill>

                <Pill className="bg-white/10 text-white">
                  {selectedClient.phone || "Telefono non inserito"}
                </Pill>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-4 lg:w-80">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-300">
                Stato operativo
              </p>

              <p className="mt-2 text-lg font-black">{clientStatus.label}</p>

              <p className="mt-1 text-sm font-semibold leading-6 text-slate-300">
                {clientStatus.text}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
          {quickStats.map((item) => (
            <div key={item.label} className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                {item.label}
              </p>

              <p className="mt-2 line-clamp-2 text-lg font-black text-slate-950">
                {item.value}
              </p>

              <p className="mt-1 text-xs font-bold text-slate-500">
                {item.helper}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="p-5">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-black">Azioni rapide</h3>
              <p className="text-sm font-semibold text-slate-500">
                Le azioni principali del cliente in un solo punto.
              </p>
            </div>

            <Pill className="bg-slate-100 text-slate-700">
              {activePlans.length > 0 ? "Percorso avviato" : "Setup da completare"}
            </Pill>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <button
              type="button"
              onClick={onCreateProgram}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <Dumbbell size={20} className="text-teal-600" />
              <p className="mt-3 font-black">Crea programma</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Apri builder scheda.
              </p>
            </button>

            <button
              type="button"
              onClick={onOpenDiets}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <FileText size={20} className="text-teal-600" />
              <p className="mt-3 font-black">Carica dieta</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Vai ai piani alimentari.
              </p>
            </button>

            <button
              type="button"
              onClick={onOpenMeasurements}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <Scale size={20} className="text-teal-600" />
              <p className="mt-3 font-black">Registra misure</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Peso, circonferenze e foto.
              </p>
            </button>

            <button
              type="button"
              onClick={onOpenMonitor}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <ClipboardCheck size={20} className="text-teal-600" />
              <p className="mt-3 font-black">Apri check-in</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Controlla feedback cliente.
              </p>
            </button>

            <button
              type="button"
              onClick={onAddNote}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <Plus size={20} className="text-teal-600" />
              <p className="mt-3 font-black">Aggiungi nota</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Promemoria privato coach.
              </p>
            </button>

            <button
              type="button"
              onClick={onCreateClient}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
            >
              <UserPlus size={20} className="text-teal-600" />
              <p className="mt-3 font-black">Nuovo cliente</p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Crea un altro profilo.
              </p>
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black">Profilo</h3>
              <p className="text-sm font-semibold text-slate-500">
                Dati rapidi e gestione account.
              </p>
            </div>

            <Button
              disabled={deletingClient}
              onClick={onDeleteClient}
              className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            >
              <Trash2 size={17} className="mr-2" />
              {deletingClient ? "Eliminazione..." : "Elimina"}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Email
              </p>
              <p className="mt-1 break-all text-sm font-black">
                {selectedClient.email || "Non inserita"}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Telefono
                </p>
                <p className="mt-1 text-sm font-black">
                  {selectedClient.phone || "—"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Altezza
                </p>
                <p className="mt-1 text-sm font-black">
                  {selectedClient.height_cm ? `${selectedClient.height_cm} cm` : "—"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                Creato il
              </p>
              <p className="mt-1 text-sm font-black">
                {formatDate(selectedClient.created_at)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-black">Timeline operativa</h3>
            <p className="text-sm font-semibold text-slate-500">
              Ultimi segnali utili per decidere cosa fare con il cliente.
            </p>
          </div>

          <Pill className="bg-teal-100 text-teal-700">
            {checkins.length + measurements.length + sessions.length + photos.length} eventi
          </Pill>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {timelineItems.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                {item.title}
              </p>

              <p className="mt-2 line-clamp-2 font-black text-slate-950">
                {item.value}
              </p>

              <p className="mt-1 text-xs font-bold text-slate-500">
                {item.helper}
              </p>

              {item.extra && (
                <p className="mt-2 line-clamp-2 text-xs font-bold text-slate-400">
                  {item.extra}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
function TemplatesPanel({
  templates,
  savingTemplate,
  deletingTemplateId,
  onSaveTemplate,
  onUseTemplate,
  onDeleteTemplate
}) {
  const [search, setSearch] = useState("");

  const filteredTemplates = templates.filter((template) => {
    const text = `${template.title || ""} ${template.goal || ""} ${
      template.level || ""
    } ${template.location || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <Card className="border border-slate-300 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
            Archivio template
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            Template schede
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Strutture riutilizzabili da caricare nel builder senza ricominciare da zero.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Pill className="bg-slate-100 text-slate-700">
            {templates.length} template
          </Pill>

          <Button
            onClick={onSaveTemplate}
            disabled={savingTemplate}
            className="bg-[#07111f] text-white"
          >
            <Save size={17} className="mr-2" />
            {savingTemplate ? "Salvataggio..." : "Salva builder"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-3 py-2 shadow-inner">
        <Search size={17} className="shrink-0 text-slate-400" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cerca per titolo, obiettivo, livello o luogo"
          className="w-full min-w-0 bg-transparent text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-[1.5rem] border border-slate-300 bg-slate-50 p-4 shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-base font-black text-slate-950">
                  {template.title || "Template senza titolo"}
                </h3>

                <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                  {template.goal || "Nessun obiettivo inserito"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill className="bg-teal-100 text-teal-800">
                    {template.duration_weeks || 4} settimane
                  </Pill>

                  {template.level && (
                    <Pill className="bg-white text-slate-700">
                      {template.level}
                    </Pill>
                  )}

                  {template.location && (
                    <Pill className="bg-white text-slate-700">
                      {template.location}
                    </Pill>
                  )}
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  onClick={() => onUseTemplate(template)}
                  className="bg-[#07111f] text-white"
                >
                  Usa nel builder
                </Button>

                <Button
                  onClick={() => onDeleteTemplate(template)}
                  disabled={deletingTemplateId === template.id}
                  className="border border-red-200 bg-white text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} className="mr-2" />
                  {deletingTemplateId === template.id
                    ? "Eliminazione..."
                    : "Elimina"}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <Empty
            title="Nessun template trovato"
            text="Salva il builder come template oppure modifica la ricerca."
          />
        )}
      </div>
    </Card>
  );
}
function PlansList({
  plans,
  onDeleteProgram,
  deletingProgramId,
  onUpdateProgramStatus,
  updatingProgramId,
  onDuplicateProgram,
  onEditProgram
}) {
  const activeCount = plans.filter((plan) => (plan.status || "active") === "active").length;
  const archivedCount = plans.length - activeCount;

  return (
    <Card className="border border-slate-300 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
            Archivio cliente
          </p>
          <h2 className="mt-1 text-xl font-black text-slate-950">
            Programmi salvati
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Gestisci schede attive, archiviate, duplicabili o modificabili.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Pill className="bg-teal-100 text-teal-800">
            {activeCount} attivi
          </Pill>
          <Pill className="bg-slate-100 text-slate-700">
            {archivedCount} archiviati
          </Pill>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {plans.map((plan) => {
          const isActive = (plan.status || "active") === "active";

          return (
            <div
              key={plan.id}
              className={`rounded-[1.5rem] border p-4 shadow-sm ${
                isActive
                  ? "border-slate-300 bg-white"
                  : "border-slate-200 bg-slate-50 opacity-90"
              }`}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Pill
                      className={
                        isActive
                          ? "bg-teal-300 text-slate-950"
                          : "bg-slate-200 text-slate-700"
                      }
                    >
                      {isActive ? "Attivo" : "Archiviato"}
                    </Pill>

                    {plan.duration_weeks && (
                      <Pill className="bg-slate-100 text-slate-700">
                        {plan.duration_weeks} settimane
                      </Pill>
                    )}
                  </div>

                  <h3 className="mt-3 break-words text-lg font-black text-slate-950">
                    {plan.title || "Programma senza titolo"}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-slate-600">
                    {plan.goal || "Nessun obiettivo inserito"}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[420px] xl:grid-cols-4">
                  <Button
                    onClick={() => onEditProgram(plan)}
                    className="bg-[#07111f] text-white"
                  >
                    Modifica
                  </Button>

                  <Button
                    onClick={() => onDuplicateProgram(plan)}
                    className="border border-slate-300 bg-white text-slate-900"
                  >
                    Duplica
                  </Button>

                  {isActive ? (
                    <Button
                      onClick={() => onUpdateProgramStatus(plan, "archived")}
                      disabled={updatingProgramId === plan.id}
                      className="border border-amber-200 bg-amber-50 text-amber-700"
                    >
                      {updatingProgramId === plan.id
                        ? "Aggiornamento..."
                        : "Archivia"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onUpdateProgramStatus(plan, "active")}
                      disabled={updatingProgramId === plan.id}
                      className="border border-teal-200 bg-teal-50 text-teal-700"
                    >
                      {updatingProgramId === plan.id
                        ? "Aggiornamento..."
                        : "Riattiva"}
                    </Button>
                  )}

                  <Button
                    onClick={() => onDeleteProgram(plan)}
                    disabled={deletingProgramId === plan.id}
                    className="border border-red-200 bg-white text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} className="mr-2" />

                    {deletingProgramId === plan.id
                      ? "Eliminazione..."
                      : "Elimina"}
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {plan.workout_weeks?.map((week) => (
                  <details
                    key={week.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <summary className="cursor-pointer text-sm font-black text-slate-900">
                      {week.title || `Settimana ${week.week_number}`}
                    </summary>

                    <div className="mt-3 space-y-3">
                      {week.workout_days?.map((day) => (
                        <div
                          key={day.id}
                          className="rounded-2xl border border-slate-200 bg-white p-3"
                        >
                          <p className="text-sm font-black text-teal-700">
                            {day.title}
                          </p>

                          <div className="mt-2 space-y-2">
                            {day.workout_blocks?.map((block) => (
                              <div key={block.id} className="space-y-2">
                                {block.workout_exercises?.map((exercise) => (
                                  <div
                                    key={exercise.id}
                                    className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm"
                                  >
                                    <div className="flex min-w-0 items-start gap-3">
                                      <ExerciseMediaPreview
                                        media={exercise.exercise_media_library}
                                      />

                                      <div className="min-w-0 flex-1">
                                        <p className="break-words font-black text-slate-950">
                                          {exercise.exercise_name}
                                        </p>

                                        <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                          {exercise.sets || "—"} serie · {" "}
                                          {exercise.reps || "—"} reps · recupero {" "}
                                          {exercise.recovery_seconds || "—"}s
                                        </p>

                                        {exercise.has_weekly_progression && (
                                          <Pill className="mt-2 bg-teal-100 text-teal-800">
                                            Progressione settimanale
                                          </Pill>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          );
        })}

        {plans.length === 0 && (
          <Empty
            title="Nessun programma"
            text="Crea il primo programma completo dal builder."
          />
        )}
      </div>
    </Card>
  );
}
function ExerciseHistoryBox({ history = [] }) {
  const validHistory = history.filter((item) => item.load_kg || item.reps_done);

  function sessionDate(item) {
    const raw = item?.workout_sessions?.session_date || item?.created_at;
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatHistoryDate(value) {
    const date = value instanceof Date ? value : sessionDate(value);
    if (!date) return "—";
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
  }

  function seriesText(item) {
    return `${item?.load_kg || "—"} kg x ${item?.reps_done || "—"}`;
  }

  if (validHistory.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
          Storico carichi
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Nessuna prestazione registrata per questo esercizio.
        </p>
      </div>
    );
  }

  const sortedHistory = [...validHistory].sort((a, b) => {
    const dateA = sessionDate(a)?.getTime() || 0;
    const dateB = sessionDate(b)?.getTime() || 0;
    return dateB - dateA;
  });

  const last = sortedHistory[0];

  const best = [...validHistory].sort((a, b) => {
    const loadDiff = (Number(b.load_kg) || 0) - (Number(a.load_kg) || 0);

    if (loadDiff !== 0) return loadDiff;

    return (Number(b.reps_done) || 0) - (Number(a.reps_done) || 0);
  })[0];

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const aroundThreeMonthsAgo = sortedHistory.find((item) => {
    const date = sessionDate(item);
    return date && date.getTime() <= ninetyDaysAgo;
  });

  const lastLoad = Number(last?.load_kg) || 0;
  const oldLoad = Number(aroundThreeMonthsAgo?.load_kg) || 0;

  let trendLabel = "Dati insufficienti";
  let trendClass = "bg-slate-100 text-slate-600";

  if (aroundThreeMonthsAgo && lastLoad > 0 && oldLoad > 0) {
    const diff = lastLoad - oldLoad;

    if (diff >= 2.5) {
      trendLabel = `In crescita +${diff.toFixed(diff % 1 === 0 ? 0 : 1)} kg`;
      trendClass = "bg-teal-100 text-teal-700";
    } else if (diff <= -2.5) {
      trendLabel = `Da monitorare ${diff.toFixed(diff % 1 === 0 ? 0 : 1)} kg`;
      trendClass = "bg-amber-100 text-amber-700";
    } else {
      trendLabel = "Stabile";
      trendClass = "bg-sky-100 text-sky-700";
    }
  }

  const recent = sortedHistory.slice(0, 5);

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-black uppercase tracking-wider text-slate-400">
          Storico carichi
        </p>
        <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase ${trendClass}`}>
          {trendLabel}
        </span>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black text-slate-400">Ultima volta</p>
          <p className="mt-1 font-black text-slate-900">{seriesText(last)}</p>
          <p className="text-xs font-bold text-slate-500">
            {formatHistoryDate(last)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black text-slate-400">Miglior serie</p>
          <p className="mt-1 font-black text-slate-900">{seriesText(best)}</p>
          <p className="text-xs font-bold text-slate-500">
            {formatHistoryDate(best)}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black text-slate-400">Circa 3 mesi fa</p>
          <p className="mt-1 font-black text-slate-900">
            {aroundThreeMonthsAgo ? seriesText(aroundThreeMonthsAgo) : "—"}
          </p>
          <p className="text-xs font-bold text-slate-500">
            {aroundThreeMonthsAgo ? formatHistoryDate(aroundThreeMonthsAgo) : "Non disponibile"}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {recent.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm"
          >
            <span className="font-bold text-slate-500">
              {formatHistoryDate(item)}
            </span>

            <span className="font-black text-slate-900">
              {seriesText(item)}
            </span>

            <span className="text-xs font-bold text-slate-400">
              RPE {item.rpe || "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkoutPlayerModal({
  player,
  onClose,
  drafts,
  updateDraft,
  saveSetLog,
  getExerciseHistory,
  onWorkoutSaved
}) {
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setIndex, setSetIndex] = useState(0);
  const [resting, setResting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [finished, setFinished] = useState(false);
  const [completedSetKeys, setCompletedSetKeys] = useState([]);
  const [feedback, setFeedback] = useState({
    difficulty: "",
    feeling: "",
    notes: ""
  });
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [keepAwake, setKeepAwake] = useState(false);
  const [wakeLockStatus, setWakeLockStatus] = useState("off");

  const open = player?.open;
  const plan = player?.plan;
  const day = player?.day;

  useEffect(() => {
    if (open) {
      setExerciseIndex(0);
      setSetIndex(0);
      setResting(false);
      setSaving(false);
      setFinished(false);
      setCompletedSetKeys([]);
      setFeedback({ difficulty: "", feeling: "", notes: "" });
      setSessionStartedAt(Date.now());
      setElapsedSeconds(0);
      setKeepAwake(false);
      setWakeLockStatus("off");
    }
  }, [open, plan?.id, day?.id]);

  useEffect(() => {
    if (!open || !sessionStartedAt) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [open, sessionStartedAt]);

  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    let wakeLock = null;
    let cancelled = false;

    async function requestWakeLock() {
      if (!keepAwake) {
        setWakeLockStatus("off");
        return;
      }

      if (!navigator?.wakeLock?.request) {
        setWakeLockStatus("unsupported");
        return;
      }

      try {
        wakeLock = await navigator.wakeLock.request("screen");
        if (!cancelled) setWakeLockStatus("active");

        wakeLock.addEventListener("release", () => {
          if (!cancelled && keepAwake) setWakeLockStatus("released");
        });
      } catch (error) {
        if (!cancelled) setWakeLockStatus("unsupported");
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && keepAwake) {
        requestWakeLock();
      }
    }

    requestWakeLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLock) wakeLock.release().catch(() => {});
    };
  }, [open, keepAwake]);

  if (!open || !plan || !day) return null;

  const exercises = (day.workout_blocks || [])
    .flatMap((block) => block.workout_exercises || [])
    .filter(Boolean);

  const totalPlannedSets = exercises.reduce((sum, item) => {
    return sum + plannedSetsForExercise(item).length;
  }, 0);

  const exercise = exercises[exerciseIndex];
  const plannedSets = exercise ? plannedSetsForExercise(exercise) : [];
  const currentSet = plannedSets[setIndex];

  const setToken =
    currentSet?.id || currentSet?.temp_id || `virtual-${currentSet?.set_number}`;
  const draftKey = exercise && currentSet ? `${exercise.id}-${setToken}` : "";
  const draft = drafts[draftKey] || {};

  const recoverySeconds =
    currentSet?.recovery_seconds ||
    exercise?.recovery_seconds ||
    exercise?.rest_seconds ||
    90;

  const history = exercise ? getExerciseHistory(exercise) : [];
  const lastHistory = history[0] || null;
  const bestHistory = history.reduce((best, item) => {
    const bestScore = Number(best?.load_kg || 0) * Number(best?.reps_done || 0);
    const itemScore = Number(item?.load_kg || 0) * Number(item?.reps_done || 0);
    return itemScore > bestScore ? item : best;
  }, history[0] || null);

  const showRpe = hasValue(currentSet?.target_rpe) || hasValue(exercise?.target_rpe);
  const showRir = hasValue(currentSet?.target_rir) || hasValue(exercise?.target_rir);
  const workoutUsesRpe = exercises.some(
    (item) => hasValue(item?.target_rpe) || plannedSetsForExercise(item).some((set) => hasValue(set?.target_rpe))
  );
  const workoutUsesRir = exercises.some(
    (item) => hasValue(item?.target_rir) || plannedSetsForExercise(item).some((set) => hasValue(set?.target_rir))
  );

  const completedCount = completedSetKeys.length;
  const progressPercentage = totalPlannedSets
    ? Math.round((completedCount / totalPlannedSets) * 100)
    : 0;
  const exerciseLetter = String.fromCharCode(65 + exerciseIndex);
  const historySessions = groupHistoryBySession(history).slice(0, 4);
  const historyAround90Days = findHistoryAroundDays(history, 90);
  const targetReps = currentSet?.target_reps || exercise?.reps || "libere";
  const targetLoad = currentSet?.target_load_kg || currentSet?.target_load_text || exercise?.target_load || "—";
  const videoUrl = exercise?.video_url || exercise?.image_url || "";
  const canGoPrevious = exerciseIndex > 0 || setIndex > 0;
  const currentExerciseCompletedSets = exercise ? completedSetsForExercise(exercise) : 0;
  const currentExerciseProgress = plannedSets.length
    ? Math.round((currentExerciseCompletedSets / plannedSets.length) * 100)
    : 0;
  const completedExercisesCount = exercises.filter((item) => {
    const itemSets = plannedSetsForExercise(item);
    return itemSets.length > 0 && completedSetsForExercise(item) >= itemSets.length;
  }).length;
  const nextExercise = exercises[exerciseIndex + 1] || null;
  const previousExercise = exercises[exerciseIndex - 1] || null;
  const lastLoadValue = Number(lastHistory?.load_kg || 0);
  const lastRepsValue = Number(lastHistory?.reps_done || 0);

  function hasValue(value) {
    return value !== null && value !== undefined && String(value).trim() !== "";
  }

  function currentWeekForPlan() {
    if (!plan?.start_date) return 1;

    const start = new Date(plan.start_date);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const week = Math.floor(diffDays / 7) + 1;

    return Math.max(1, Math.min(Number(plan.duration_weeks) || 4, week));
  }

  function progressionForModalExercise(item) {
    const week = currentWeekForPlan();

    return (
      item?.workout_exercise_progressions?.find(
        (progression) => Number(progression.week_number) === week
      ) || null
    );
  }

  function plannedSetsForExercise(item) {
    const progression = progressionForModalExercise(item);
    const realSets = sortByOrder(item?.workout_exercise_sets || [], "set_number");

    if (realSets.length > 0) {
      return realSets.map((set) => ({
        ...set,
        target_reps: progression?.target_reps || set.target_reps || item?.reps || "",
        target_rpe: progression?.target_rpe || set.target_rpe || item?.target_rpe || "",
        target_rir: progression?.target_rir || set.target_rir || item?.target_rir || "",
        recovery_seconds:
          progression?.recovery_seconds || set.recovery_seconds || item?.recovery_seconds || 90
      }));
    }

    const count =
      Number(progression?.target_sets) || Number(item?.sets) || Number(item?.series) || 1;

    return Array.from({ length: count }).map((_, index) => ({
      id: null,
      temp_id: `virtual-${item.id}-${index + 1}`,
      set_number: index + 1,
      target_reps: progression?.target_reps || item?.reps || "",
      target_rpe: progression?.target_rpe || item?.target_rpe || "",
      target_rir: progression?.target_rir || item?.target_rir || "",
      recovery_seconds:
        progression?.recovery_seconds || item?.recovery_seconds || item?.rest_seconds || 90,
      target_load_text: progression?.target_load_text || "",
      target_load_kg: progression?.target_load_kg || ""
    }));
  }

  function setKeyFor(item, set) {
    const token = set?.id || set?.temp_id || `virtual-${set?.set_number}`;
    return `${item?.id}-${token}`;
  }

  function completedSetsForExercise(item) {
    return plannedSetsForExercise(item).filter((set) =>
      completedSetKeys.includes(setKeyFor(item, set))
    ).length;
  }

  function draftForSet(item, set) {
    const key = setKeyFor(item, set);
    return drafts[key] || {};
  }

  function setResultText(item, set) {
    const itemDraft = draftForSet(item, set);
    const parts = [];

    if (hasValue(itemDraft.load_kg)) parts.push(`${itemDraft.load_kg} kg`);
    if (hasValue(itemDraft.reps_done)) parts.push(`${itemDraft.reps_done} reps`);
    if (hasValue(itemDraft.rpe)) parts.push(`RPE ${itemDraft.rpe}`);
    if (hasValue(itemDraft.rir)) parts.push(`RIR ${itemDraft.rir}`);

    return parts.length ? parts.join(" · ") : "non compilata";
  }

  function targetTextForSet(item, set) {
    const pieces = [];
    const reps = set?.target_reps || item?.reps;
    const load = set?.target_load_kg || set?.target_load_text || item?.target_load;
    const recovery = set?.recovery_seconds || item?.recovery_seconds || item?.rest_seconds;

    if (hasValue(reps)) pieces.push(`${reps} reps`);
    if (hasValue(load)) pieces.push(`${load} kg`);
    if (hasValue(recovery)) pieces.push(`${recovery}" rec.`);

    return pieces.length ? pieces.join(" · ") : "target libero";
  }

  function nextActionLabel() {
    if (setIndex < plannedSets.length - 1) {
      return `Vai alla serie ${setIndex + 2}/${plannedSets.length}`;
    }

    if (nextExercise) {
      return `Vai a ${nextExercise.exercise_name || "prossimo esercizio"}`;
    }

    return "Vai al riepilogo finale";
  }

  function nextActionHelper() {
    if (setIndex < plannedSets.length - 1) {
      return "Continua con la serie successiva dello stesso esercizio.";
    }

    if (nextExercise) {
      const nextSets = plannedSetsForExercise(nextExercise).length;
      return `${nextExercise.exercise_name || "Prossimo esercizio"} · ${nextSets} serie`;
    }

    return "Hai completato l’ultima serie prevista: chiudi con il riepilogo.";
  }

  function parseHistoryDate(item) {
    const value = item?.workout_sessions?.session_date || item?.created_at;
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function daysAgo(value) {
    const date = value instanceof Date ? value : parseHistoryDate(value);
    if (!date) return null;
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  }

  function relativeDateText(value) {
    const days = daysAgo(value);
    if (days === null) return "data non disponibile";
    if (days === 0) return "oggi";
    if (days === 1) return "ieri";
    return `${days} giorni fa`;
  }

  function groupHistoryBySession(items) {
    const map = new Map();

    items.forEach((item) => {
      const sessionDate = item?.workout_sessions?.session_date || item?.created_at || "senza-data";
      const key = `${item?.session_id || sessionDate}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          date: sessionDate,
          dateObject: parseHistoryDate(item),
          items: []
        });
      }

      map.get(key).items.push(item);
    });

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort(
          (a, b) => Number(a.set_number || 0) - Number(b.set_number || 0)
        )
      }))
      .sort((a, b) => {
        const left = a.dateObject?.getTime() || 0;
        const right = b.dateObject?.getTime() || 0;
        return right - left;
      });
  }

  function findHistoryAroundDays(items, targetDays) {
    const candidates = items
      .map((item) => ({ item, days: daysAgo(item) }))
      .filter((entry) => entry.days !== null && entry.days >= targetDays - 45)
      .sort(
        (a, b) => Math.abs(a.days - targetDays) - Math.abs(b.days - targetDays)
      );

    return candidates[0] || null;
  }

  function metricText(item) {
    const parts = [];

    if (hasValue(item?.load_kg)) parts.push(`${item.load_kg} kg`);
    if (hasValue(item?.reps_done)) parts.push(`${item.reps_done} reps`);
    if (hasValue(item?.rpe)) parts.push(`RPE ${item.rpe}`);
    if (hasValue(item?.rir)) parts.push(`RIR ${item.rir}`);

    return parts.length ? parts.join(" · ") : "dato non compilato";
  }

  function formatElapsed(value) {
    const seconds = Math.max(0, Number(value || 0));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  }

  function setCurrentExercise(index) {
    setExerciseIndex(index);
    setSetIndex(0);
    setResting(false);
  }

  function goPrevious() {
    setResting(false);

    if (setIndex > 0) {
      setSetIndex((current) => current - 1);
      return;
    }

    if (exerciseIndex > 0) {
      const previousIndex = exerciseIndex - 1;
      const previousSets = plannedSetsForExercise(exercises[previousIndex]);
      setExerciseIndex(previousIndex);
      setSetIndex(Math.max(0, previousSets.length - 1));
    }
  }

  function goNext() {
    setResting(false);

    if (setIndex < plannedSets.length - 1) {
      setSetIndex((current) => current + 1);
      return;
    }

    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((current) => current + 1);
      setSetIndex(0);
      return;
    }

    setFinished(true);
  }

  function applyLastSet() {
    if (!lastHistory || !draftKey) return;

    updateDraft(draftKey, "load_kg", lastHistory.load_kg || "");
    updateDraft(draftKey, "reps_done", lastHistory.reps_done || "");
    if (showRpe) updateDraft(draftKey, "rpe", lastHistory.rpe || "");
    if (showRir) updateDraft(draftKey, "rir", lastHistory.rir || "");
  }

  function applyTargetSet() {
    if (!currentSet || !draftKey) return;

    updateDraft(
      draftKey,
      "load_kg",
      currentSet.target_load_kg || currentSet.target_load_text || draft.load_kg || ""
    );
    updateDraft(draftKey, "reps_done", currentSet.target_reps || draft.reps_done || "");
    if (showRpe) updateDraft(draftKey, "rpe", currentSet.target_rpe || draft.rpe || "");
    if (showRir) updateDraft(draftKey, "rir", currentSet.target_rir || draft.rir || "");
  }

  function adjustDraftNumber(field, delta, decimals = 1) {
    if (!draftKey) return;

    const currentValue = Number(String(draft[field] || "").replace(",", "."));
    const baseValue = Number.isNaN(currentValue) ? 0 : currentValue;
    const nextValue = Math.max(0, baseValue + delta);
    const formatted = Number.isInteger(nextValue)
      ? String(nextValue)
      : nextValue.toFixed(decimals).replace(/\.0$/, "");

    updateDraft(draftKey, field, formatted);
  }

  function applyLastWithIncrement(extraKg = 0) {
    if (!lastHistory || !draftKey) return;

    const nextLoad = Number(lastHistory.load_kg || 0) + extraKg;
    updateDraft(draftKey, "load_kg", nextLoad > 0 ? String(nextLoad).replace(/\.0$/, "") : "");
    updateDraft(draftKey, "reps_done", lastHistory.reps_done || "");
    if (showRpe) updateDraft(draftKey, "rpe", lastHistory.rpe || "");
    if (showRir) updateDraft(draftKey, "rir", lastHistory.rir || "");
  }

  async function saveCurrentSet() {
    if (!exercise || !currentSet) return;

    setSaving(true);

    const ok = await saveSetLog(plan, day, exercise, currentSet);

    setSaving(false);

    if (ok) {
      setCompletedSetKeys((prev) =>
        prev.includes(draftKey) ? prev : [...prev, draftKey]
      );
      setResting(true);

      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          document
            .getElementById("tmfit-rest-timer")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    }
  }

  function closeCompletedWorkout() {
    if (onWorkoutSaved) onWorkoutSaved();
    onClose();
  }

  function requestCloseWorkout() {
    if (finished || completedCount === 0 || typeof window === "undefined") {
      onClose();
      return;
    }

    const confirmed = window.confirm(
      "Vuoi uscire da Allenati? Le serie già salvate restano registrate, ma la seduta non verrà chiusa con riepilogo finale."
    );

    if (confirmed) onClose();
  }

  function requestFinishWorkout() {
    if (completedCount < totalPlannedSets && typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Hai salvato ${completedCount}/${totalPlannedSets} serie. Vuoi terminare comunque l’allenamento?`
      );

      if (!confirmed) return;
    }

    setFinished(true);
  }

  function openVideo() {
    if (!videoUrl || typeof window === "undefined") return;
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  }

  function HistoryMiniCard({ title, item, tone = "slate", helper }) {
    if (!item) return null;

    const classes =
      tone === "dark"
        ? "bg-[#07111f] text-white"
        : tone === "teal"
        ? "bg-teal-50 text-teal-950"
        : tone === "amber"
        ? "bg-amber-50 text-amber-950"
        : "bg-slate-50 text-slate-950";

    const eyebrowClass =
      tone === "dark"
        ? "text-teal-300"
        : tone === "teal"
        ? "text-teal-700"
        : tone === "amber"
        ? "text-amber-700"
        : "text-slate-500";

    return (
      <div className={`rounded-2xl p-3 ${classes}`}>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${eyebrowClass}`}>
          {title}
        </p>
        <p className="mt-1 text-base font-black leading-tight">
          {metricText(item)}
        </p>
        <p className="mt-1 text-xs font-bold opacity-70">
          {helper || formatDate(item.workout_sessions?.session_date || item.created_at)}
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[130] overflow-hidden bg-[#07111f]">
      <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-slate-50 shadow-2xl">
        <div className="shrink-0 bg-[#07111f] px-4 pb-4 pt-[calc(0.9rem+env(safe-area-inset-top))] text-white">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={requestCloseWorkout}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white active:scale-[.96]"
              aria-label="Chiudi allenamento"
            >
              <X size={20} />
            </button>

            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-[11px] font-black uppercase tracking-[0.24em] text-teal-300">
                Allenati
              </p>
              <h2 className="mt-1 truncate text-lg font-black leading-tight">
                {day.title || "Allenamento"}
              </h2>
              <p className="mt-0.5 truncate text-xs font-bold text-slate-300">
                {plan.title || "Programma"}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-300 text-sm font-black text-slate-950">
              {progressPercentage}%
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-300">
              <span>Esercizio {exerciseIndex + 1}/{Math.max(exercises.length, 1)}</span>
              <span>Serie {exercise ? setIndex + 1 : 0}/{Math.max(plannedSets.length, 1)}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal-300 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/10 px-2 py-2 text-center">
              <p className="text-sm font-black text-white">{formatElapsed(elapsedSeconds)}</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-300">Tempo</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-2 py-2 text-center">
              <p className="text-sm font-black text-white">{completedCount}/{totalPlannedSets}</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-300">Serie</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-2 py-2 text-center">
              <p className="truncate text-sm font-black text-white">{exerciseIndex + 1}/{Math.max(exercises.length, 1)}</p>
              <p className="text-[9px] font-black uppercase tracking-wider text-slate-300">Esercizi</p>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 py-4">
          {finished ? (
            <div className="space-y-4">
              <Card className="p-5 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-300 text-slate-950">
                  <Check size={28} />
                </div>
                <h3 className="mt-4 text-2xl font-black text-slate-950">
                  Allenamento completato
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                  Hai completato {completedSetKeys.length}/{totalPlannedSets} serie. Il coach potrà vedere carichi e reps{workoutUsesRpe ? ", RPE" : ""}{workoutUsesRir ? ", RIR" : ""}.
                </p>
              </Card>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-black text-slate-950">{exercises.length}</p>
                  <p className="text-[10px] font-black uppercase text-slate-400">Esercizi</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-black text-slate-950">{completedSetKeys.length}</p>
                  <p className="text-[10px] font-black uppercase text-slate-400">Serie</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                  <p className="text-2xl font-black text-slate-950">{progressPercentage}%</p>
                  <p className="text-[10px] font-black uppercase text-slate-400">Fatto</p>
                </div>
              </div>

              <Card className="border-none bg-[#07111f] p-4 text-white shadow-md">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-300">
                  Dati seduta
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-2xl bg-white/10 p-3 text-center">
                    <p className="text-2xl font-black">{formatElapsed(elapsedSeconds)}</p>
                    <p className="text-[10px] font-black uppercase text-slate-300">Tempo totale</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-center">
                    <p className="text-2xl font-black">{completedExercisesCount}/{exercises.length}</p>
                    <p className="text-[10px] font-black uppercase text-slate-300">Esercizi completati</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Riepilogo allenamento
                    </p>
                    <h4 className="mt-1 text-xl font-black text-slate-950">
                      Cosa hai completato
                    </h4>
                  </div>
                  <Pill className="bg-teal-50 text-teal-800">
                    {completedSetKeys.length}/{totalPlannedSets}
                  </Pill>
                </div>

                <div className="mt-4 space-y-2">
                  {exercises.map((item, index) => {
                    const itemSets = plannedSetsForExercise(item);
                    const done = completedSetsForExercise(item);
                    const complete = itemSets.length > 0 && done >= itemSets.length;

                    return (
                      <div
                        key={item.id || item.temp_id || index}
                        className="rounded-2xl bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-950">
                              {index + 1}. {item.exercise_name || "Esercizio"}
                            </p>
                            <p className="mt-1 text-xs font-bold text-slate-500">
                              {done}/{itemSets.length} serie salvate
                            </p>
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${
                              complete
                                ? "bg-teal-300 text-slate-950"
                                : done > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-white text-slate-500"
                            }`}
                          >
                            {complete ? "Completo" : done > 0 ? "Parziale" : "Da fare"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-4">
                <div className="grid gap-3">
                  <Label title="Difficoltà percepita">
                    <Select
                      value={feedback.difficulty}
                      onChange={(event) =>
                        setFeedback((prev) => ({
                          ...prev,
                          difficulty: event.target.value
                        }))
                      }
                      className="text-base"
                    >
                      <option value="">Seleziona</option>
                      <option value="facile">Facile</option>
                      <option value="giusta">Giusta</option>
                      <option value="dura">Dura</option>
                      <option value="troppo_dura">Troppo dura</option>
                    </Select>
                  </Label>

                  <Label title="Sensazioni">
                    <Select
                      value={feedback.feeling}
                      onChange={(event) =>
                        setFeedback((prev) => ({
                          ...prev,
                          feeling: event.target.value
                        }))
                      }
                      className="text-base"
                    >
                      <option value="">Seleziona</option>
                      <option value="ottime">Ottime</option>
                      <option value="buone">Buone</option>
                      <option value="normali">Normali</option>
                      <option value="scarse">Scarse</option>
                    </Select>
                  </Label>

                  <Label title="Note finali per il coach">
                    <Textarea
                      value={feedback.notes}
                      onChange={(event) =>
                        setFeedback((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      placeholder="Es. panca ok, squat pesante, fastidio spalla..."
                      className="text-base"
                    />
                  </Label>
                </div>
              </Card>
            </div>
          ) : !exercise ? (
            <Empty
              title="Nessun esercizio"
              text="Questo allenamento non contiene esercizi."
            />
          ) : (
            <div className="space-y-4">
              <Card className="border-none bg-[#07111f] p-4 text-white shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-300">
                      Sessione live
                    </p>
                    <h3 className="mt-1 text-xl font-black">
                      {formatElapsed(elapsedSeconds)} · {progressPercentage}% completato
                    </h3>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-300">
                      {completedCount}/{totalPlannedSets} serie salvate · esercizio {exerciseIndex + 1}/{Math.max(exercises.length, 1)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-teal-300 px-3 py-2 text-center text-slate-950">
                    <p className="text-sm font-black">{currentExerciseCompletedSets}/{plannedSets.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-wider">Serie eserc.</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white/10 px-3 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-white">Schermo attivo</p>
                    <p className="mt-0.5 truncate text-[11px] font-bold text-slate-300">
                      {wakeLockStatus === "active"
                        ? "Attivo durante la seduta"
                        : wakeLockStatus === "unsupported"
                        ? "Non supportato dal dispositivo"
                        : wakeLockStatus === "released"
                        ? "Sospeso, riattivalo"
                        : "Opzionale su iPhone/Android"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setKeepAwake((current) => !current)}
                    className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs font-black active:scale-[.96] ${
                      keepAwake
                        ? "bg-teal-300 text-slate-950"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {keepAwake ? "ON" : "OFF"}
                  </button>
                </div>
              </Card>

              <Card className="overflow-hidden border-none shadow-md">
                <div className="bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Percorso allenamento
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        {day.title || "Allenamento"}
                      </h3>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Tocca un numero per saltare subito all’esercizio.
                      </p>
                    </div>
                    <Pill className="bg-[#07111f] text-white">
                      {completedCount}/{totalPlannedSets} serie
                    </Pill>
                  </div>

                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {exercises.map((item, index) => {
                      const itemSets = plannedSetsForExercise(item);
                      const done = completedSetsForExercise(item);
                      const active = index === exerciseIndex;
                      const complete = itemSets.length > 0 && done >= itemSets.length;

                      return (
                        <button
                          key={item.id || item.temp_id || index}
                          type="button"
                          onClick={() => setCurrentExercise(index)}
                          className={`rounded-2xl px-2 py-3 text-center text-xs font-black active:scale-[.96] ${
                            active
                              ? "bg-[#07111f] text-white shadow-lg"
                              : complete
                              ? "bg-teal-50 text-teal-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span className="block text-base">{index + 1}</span>
                          <span className="mt-0.5 block text-[10px] opacity-75">
                            {done}/{itemSets.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-slate-50 p-3 text-center">
                      <p className="text-lg font-black text-slate-950">{currentExerciseProgress}%</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Esercizio</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-center">
                      <p className="truncate text-lg font-black text-slate-950">
                        {previousExercise ? previousExercise.exercise_name || "Precedente" : "—"}
                      </p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Prima</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-center">
                      <p className="truncate text-lg font-black text-slate-950">
                        {nextExercise ? nextExercise.exercise_name || "Prossimo" : "Fine"}
                      </p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Dopo</p>
                    </div>
                  </div>
                </div>
              </Card>

              {resting && (
                <div id="tmfit-rest-timer">
                  <RestTimer seconds={recoverySeconds} autoStart prominent />
                </div>
              )}

              <Card className="overflow-hidden border-none shadow-md">
                <div className="bg-white p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-lg font-black text-teal-700">
                      {exerciseLetter}.
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Esercizio attuale
                      </p>
                      <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                        {exercise.exercise_name || "Esercizio"}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-slate-50 p-3 text-center">
                      <p className="text-2xl font-black text-slate-950">{plannedSets.length}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Serie</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-center">
                      <p className="text-2xl font-black text-slate-950">{targetReps}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Reps</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3 text-center">
                      <p className="text-2xl font-black text-slate-950">{recoverySeconds}"</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Rec.</p>
                    </div>
                  </div>

                  {hasValue(targetLoad) && targetLoad !== "—" && (
                    <div className="mt-3 rounded-2xl bg-teal-50 px-4 py-3 text-sm font-black text-teal-900">
                      Target carico: {targetLoad}
                    </div>
                  )}

                  <div className="mt-5 grid gap-2">
                    <button
                      type="button"
                      onClick={openVideo}
                      disabled={!videoUrl}
                      className="rounded-2xl bg-[#07111f] px-4 py-3 text-sm font-black text-white disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {videoUrl ? "Vedi esecuzione ▶" : "Video non inserito"}
                    </button>

                    <a
                      href="#tmfit-history"
                      className="rounded-2xl border-2 border-[#07111f] bg-white px-4 py-3 text-center text-sm font-black text-[#07111f]"
                    >
                      Vai allo storico pesi
                    </a>
                  </div>

                  {exercise.notes && (
                    <div className="mt-5">
                      <p className="text-sm font-black text-slate-950">Note coach</p>
                      <div className="mt-2 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">
                        {exercise.notes}
                      </div>
                    </div>
                  )}

                  {exercise.execution_mode && (
                    <div className="mt-3 rounded-2xl bg-teal-50 p-4 text-sm font-bold leading-6 text-teal-900">
                      Esecuzione: {exercise.execution_mode}
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Registra serie
                    </p>
                    <h4 className="mt-1 text-xl font-black text-slate-950">
                      Serie {setIndex + 1} di {plannedSets.length}
                    </h4>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Inserisci peso e ripetizioni. RPE/RIR compaiono solo se previsti dal coach.
                    </p>
                  </div>
                  <Pill
                    className={
                      completedSetKeys.includes(draftKey)
                        ? "bg-teal-300 text-slate-950"
                        : "bg-[#07111f] text-white"
                    }
                  >
                    {completedSetKeys.includes(draftKey) ? "Salvata" : `${completedCount}/${totalPlannedSets}`}
                  </Pill>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {plannedSets.map((set, index) => {
                    const selected = index === setIndex;
                    const done = completedSetKeys.includes(setKeyFor(exercise, set));
                    return (
                      <button
                        key={set.id || set.temp_id || index}
                        type="button"
                        onClick={() => {
                          setSetIndex(index);
                          setResting(false);
                        }}
                        className={`rounded-2xl px-3 py-3 text-left text-xs font-black active:scale-[.97] ${
                          selected
                            ? "bg-[#07111f] text-white"
                            : done
                            ? "bg-teal-50 text-teal-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Serie {index + 1}
                        <span className="mt-1 block text-[11px] opacity-75">
                          {done ? "salvata" : selected ? "attuale" : "da fare"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-[1.35rem] bg-slate-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                    Target serie attuale
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                      <p className="text-base font-black text-slate-950">{targetReps}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Reps</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                      <p className="truncate text-base font-black text-slate-950">{targetLoad}</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Carico</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
                      <p className="text-base font-black text-slate-950">{recoverySeconds}"</p>
                      <p className="text-[10px] font-black uppercase text-slate-400">Rec.</p>
                    </div>
                  </div>
                  {(showRpe || showRir) && (
                    <div className="mt-2 rounded-2xl bg-white px-3 py-2 text-xs font-black text-slate-600 shadow-sm">
                      {showRpe && <span>RPE target: {currentSet?.target_rpe || exercise?.target_rpe || "—"}</span>}
                      {showRpe && showRir && <span> · </span>}
                      {showRir && <span>RIR target: {currentSet?.target_rir || exercise?.target_rir || "—"}</span>}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Label title="Peso kg">
                    <Input
                      inputMode="decimal"
                      value={draft.load_kg || ""}
                      onChange={(event) =>
                        updateDraft(draftKey, "load_kg", event.target.value)
                      }
                      placeholder="80"
                      className="h-14 text-center text-lg font-black"
                    />
                  </Label>

                  <Label title="Ripetizioni">
                    <Input
                      inputMode="numeric"
                      value={draft.reps_done || ""}
                      onChange={(event) =>
                        updateDraft(draftKey, "reps_done", event.target.value)
                      }
                      placeholder="10"
                      className="h-14 text-center text-lg font-black"
                    />
                  </Label>

                  {showRpe && (
                    <Label title="RPE">
                      <Input
                        inputMode="decimal"
                        value={draft.rpe || ""}
                        onChange={(event) =>
                          updateDraft(draftKey, "rpe", event.target.value)
                        }
                        placeholder="8"
                        className="h-14 text-center text-lg font-black"
                      />
                    </Label>
                  )}

                  {showRir && (
                    <Label title="RIR">
                      <Input
                        inputMode="decimal"
                        value={draft.rir || ""}
                        onChange={(event) =>
                          updateDraft(draftKey, "rir", event.target.value)
                        }
                        placeholder="2"
                        className="h-14 text-center text-lg font-black"
                      />
                    </Label>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => adjustDraftNumber("load_kg", -2.5)}
                    className="rounded-2xl bg-slate-100 px-3 py-3 text-xs font-black text-slate-700"
                  >
                    -2,5 kg
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustDraftNumber("load_kg", 2.5)}
                    className="rounded-2xl bg-slate-100 px-3 py-3 text-xs font-black text-slate-700"
                  >
                    +2,5 kg
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustDraftNumber("reps_done", -1, 0)}
                    className="rounded-2xl bg-slate-100 px-3 py-3 text-xs font-black text-slate-700"
                  >
                    -1 rep
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustDraftNumber("reps_done", 1, 0)}
                    className="rounded-2xl bg-slate-100 px-3 py-3 text-xs font-black text-slate-700"
                  >
                    +1 rep
                  </button>
                </div>

                <div className="mt-3">
                  <Label title="Note serie">
                    <Input
                      value={draft.notes || ""}
                      onChange={(event) =>
                        updateDraft(draftKey, "notes", event.target.value)
                      }
                      placeholder="Facoltativo"
                      className="text-base"
                    />
                  </Label>
                </div>

                <div className="mt-4 grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={applyLastSet}
                      disabled={!lastHistory}
                      className="rounded-2xl bg-slate-100 px-3 py-3 text-left text-xs font-black text-slate-800 disabled:opacity-40"
                    >
                      <span className="block text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        Usa ultimo
                      </span>
                      <span className="mt-1 block text-sm text-slate-950">
                        {lastHistory ? metricText(lastHistory) : "Nessuno storico"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => applyLastWithIncrement(2.5)}
                      disabled={!lastHistory || !lastLoadValue}
                      className="rounded-2xl bg-amber-50 px-3 py-3 text-left text-xs font-black text-amber-900 disabled:opacity-40"
                    >
                      <span className="block text-[10px] uppercase tracking-[0.18em] text-amber-700">
                        Ultimo +2,5 kg
                      </span>
                      <span className="mt-1 block text-sm text-amber-950">
                        {lastHistory && lastLoadValue ? `${lastLoadValue + 2.5} kg · ${lastRepsValue || "—"} reps` : "Non disponibile"}
                      </span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={applyTargetSet}
                    className="rounded-2xl bg-teal-300 px-3 py-3 text-sm font-black text-slate-950"
                  >
                    Usa target della scheda
                  </button>
                </div>
              </Card>

              <Card className="p-4 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Riepilogo esercizio
                    </p>
                    <h4 className="mt-1 text-xl font-black text-slate-950">
                      Serie di {exercise.exercise_name || "questo esercizio"}
                    </h4>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Tocca una serie per correggerla o completarla.
                    </p>
                  </div>
                  <Pill className="bg-slate-100 text-slate-700">
                    {currentExerciseCompletedSets}/{plannedSets.length}
                  </Pill>
                </div>

                <div className="mt-4 space-y-2">
                  {plannedSets.map((set, index) => {
                    const selected = index === setIndex;
                    const done = completedSetKeys.includes(setKeyFor(exercise, set));
                    const result = setResultText(exercise, set);

                    return (
                      <button
                        key={set.id || set.temp_id || index}
                        type="button"
                        onClick={() => {
                          setSetIndex(index);
                          setResting(false);
                        }}
                        className={`w-full rounded-2xl p-3 text-left transition active:scale-[.98] ${
                          selected
                            ? "bg-[#07111f] text-white"
                            : done
                            ? "bg-teal-50 text-teal-950"
                            : "bg-slate-50 text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-black">Serie {index + 1}</p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                              selected
                                ? "bg-white/10 text-white"
                                : done
                                ? "bg-teal-300 text-slate-950"
                                : "bg-white text-slate-500"
                            }`}
                          >
                            {done ? "Salvata" : selected ? "Attuale" : "Da fare"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold opacity-70">
                          Target: {targetTextForSet(exercise, set)}
                        </p>
                        <p className="mt-1 text-xs font-black">
                          Fatto: {result}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </Card>

              {resting && (
                <Card className="border-none bg-teal-50 p-4 shadow-md">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-teal-700">
                    Prossimo passo
                  </p>
                  <h4 className="mt-1 text-lg font-black text-teal-950">
                    {nextActionLabel()}
                  </h4>
                  <p className="mt-1 text-sm font-bold leading-6 text-teal-800">
                    {nextActionHelper()}
                  </p>
                </Card>
              )}

              <Card id="tmfit-history" className="p-4 shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                      Storico pesi
                    </p>
                    <h4 className="mt-1 text-xl font-black text-slate-950">
                      {exercise.exercise_name || "Esercizio"}
                    </h4>
                  </div>
                  <Pill className="bg-slate-100 text-slate-700">
                    {history.length} serie
                  </Pill>
                </div>

                {lastHistory ? (
                  <div className="mt-4 space-y-3">
                    <HistoryMiniCard
                      title="Ultima volta"
                      item={lastHistory}
                      tone="dark"
                      helper={`${formatDate(lastHistory.workout_sessions?.session_date || lastHistory.created_at)} · ${relativeDateText(lastHistory)}`}
                    />
                    <HistoryMiniCard
                      title="Miglior serie"
                      item={bestHistory}
                      tone="teal"
                      helper={formatDate(bestHistory?.workout_sessions?.session_date || bestHistory?.created_at)}
                    />
                    {historyAround90Days && (
                      <HistoryMiniCard
                        title="Circa 3 mesi fa"
                        item={historyAround90Days.item}
                        tone="amber"
                        helper={`${formatDate(historyAround90Days.item.workout_sessions?.session_date || historyAround90Days.item.created_at)} · ${historyAround90Days.days} giorni fa`}
                      />
                    )}

                    <div className="space-y-2 pt-1">
                      {historySessions.map((sessionGroup) => (
                        <div key={sessionGroup.key} className="rounded-2xl bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-slate-950">
                              {formatDate(sessionGroup.date)}
                            </p>
                            <p className="text-xs font-bold text-slate-500">
                              {relativeDateText(sessionGroup.dateObject)}
                            </p>
                          </div>
                          <p className="mt-1 text-xs font-bold leading-5 text-slate-600">
                            {sessionGroup.items.slice(0, 4).map(metricText).join("  |  ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                    Nessuno storico trovato per questo esercizio. Dopo i primi allenamenti compariranno ultima volta, migliore serie e confronto a 3 mesi.
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3">
          {finished ? (
            <Button
              type="button"
              onClick={closeCompletedWorkout}
              className="h-14 w-full bg-[#07111f] text-white"
            >
              Chiudi allenamento
            </Button>
          ) : exercise ? (
            <div className="space-y-2">
              {!resting ? (
                <Button
                  type="button"
                  onClick={saveCurrentSet}
                  disabled={saving}
                  className="h-14 w-full bg-[#07111f] text-white"
                >
                  {saving ? "Salvataggio..." : `Salva serie ${setIndex + 1}/${plannedSets.length}`}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={goNext}
                  className="h-14 w-full bg-teal-300 text-slate-950"
                >
                  {nextActionLabel()}
                </Button>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={goPrevious}
                  disabled={!canGoPrevious}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 disabled:opacity-40"
                >
                  Indietro
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700"
                >
                  Avanti
                </button>
                <button
                  type="button"
                  onClick={requestFinishWorkout}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700"
                >
                  Termina
                </button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={onClose}
              className="h-14 w-full bg-[#07111f] text-white"
            >
              Chiudi
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}


function CoachMonitorPanel({
  selectedClient,
  checkins = [],
  logs = [],
  photos = [],
  openStorageFile
}) {
  const clientId = selectedClient?.id ? String(selectedClient.id) : null;
  const visibleCheckins = clientId
    ? checkins.filter((item) => String(item.client_id) === clientId)
    : checkins;
  const visibleLogs = clientId
    ? logs.filter((item) => String(item.client_id) === clientId)
    : logs;
  const visiblePhotos = clientId
    ? photos.filter((item) => String(item.client_id) === clientId)
    : photos;

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit"
    });
  }

  function daysFrom(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getCheckinAlerts(checkin) {
    if (!checkin) return [];
    const alerts = [];

    if (Number(checkin.energy_level) > 0 && Number(checkin.energy_level) <= 4) {
      alerts.push({ label: "Energia bassa", text: `${checkin.energy_level}/10`, tone: "red" });
    }

    if (Number(checkin.sleep_quality) > 0 && Number(checkin.sleep_quality) <= 4) {
      alerts.push({ label: "Sonno basso", text: `${checkin.sleep_quality}/10`, tone: "red" });
    }

    if (Number(checkin.stress_level) >= 8) {
      alerts.push({ label: "Stress alto", text: `${checkin.stress_level}/10`, tone: "red" });
    }

    if (Number(checkin.diet_adherence) > 0 && Number(checkin.diet_adherence) <= 5) {
      alerts.push({ label: "Aderenza dieta bassa", text: `${checkin.diet_adherence}/10`, tone: "amber" });
    }

    if (Number(checkin.training_adherence) > 0 && Number(checkin.training_adherence) <= 5) {
      alerts.push({ label: "Aderenza allenamento bassa", text: `${checkin.training_adherence}/10`, tone: "amber" });
    }

    return alerts;
  }

  const latestCheckin = visibleCheckins[0] || null;
  const latestPhoto = visiblePhotos[0] || null;
  const latestLog = visibleLogs[0] || null;
  const latestCheckinDays = daysFrom(latestCheckin?.checkin_date || latestCheckin?.created_at);
  const latestPhotoDays = daysFrom(latestPhoto?.photo_date || latestPhoto?.created_at);
  const latestLogDays = daysFrom(latestLog?.created_at || latestLog?.session_date);
  const alerts = getCheckinAlerts(latestCheckin);

  const kpis = [
    {
      label: "Ultimo check-in",
      value: latestCheckinDays === null ? "—" : `${latestCheckinDays}g fa`,
      text: latestCheckin ? formatDate(latestCheckin.checkin_date || latestCheckin.created_at) : "Non presente"
    },
    {
      label: "Serie registrate",
      value: visibleLogs.length,
      text: latestLog ? `Ultima: ${formatDate(latestLog.created_at || latestLog.session_date)}` : "Nessun log"
    },
    {
      label: "Foto progressi",
      value: visiblePhotos.length,
      text: latestPhotoDays === null ? "Non presenti" : `Ultima ${latestPhotoDays}g fa`
    }
  ];

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
              Monitor
            </p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {selectedClient ? fullName(selectedClient) : "Monitor clienti"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              Check-in, allenamenti e foto in una schermata pulita. Niente overlay blu.
            </p>
          </div>

          <Pill className={alerts.length ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"}>
            {alerts.length ? `${alerts.length} alert` : "Tutto ok"}
          </Pill>
        </div>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {kpis.map((item) => (
          <Card key={item.label} className="border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-black text-slate-950">{item.value}</p>
            <p className="mt-1 text-sm font-bold text-slate-500">{item.text}</p>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-slate-950">Alert check-in</h3>
          <Pill className="bg-slate-100 text-slate-700">
            Ultimo check-in
          </Pill>
        </div>

        {alerts.length > 0 ? (
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {alerts.map((alert) => (
              <div
                key={`${alert.label}-${alert.text}`}
                className={`rounded-2xl border p-3 ${
                  alert.tone === "red"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <p className="text-sm font-black">{alert.label}</p>
                <p className="mt-1 text-xs font-bold">{alert.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Nessun alert critico"
            text="L’ultimo check-in non mostra segnali critici evidenti."
          />
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Check-in recenti</h3>
          <div className="mt-3 space-y-2">
            {visibleCheckins.slice(0, 6).map((checkin) => (
              <div key={checkin.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">
                    {formatDate(checkin.checkin_date || checkin.created_at)}
                  </p>
                  <Pill className="bg-white text-slate-700">
                    Peso {checkin.weight_kg || "—"} kg
                  </Pill>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  Energia {checkin.energy_level || "—"}/10 · Sonno {checkin.sleep_quality || "—"}/10 · Stress {checkin.stress_level || "—"}/10
                </p>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  Dieta {checkin.diet_adherence || "—"}/10 · Allenamento {checkin.training_adherence || "—"}/10
                </p>
                {checkin.notes && (
                  <p className="mt-2 rounded-xl bg-white p-2 text-sm font-semibold text-slate-600">
                    {checkin.notes}
                  </p>
                )}
              </div>
            ))}

            {visibleCheckins.length === 0 && (
              <Empty title="Nessun check-in" text="Non ci sono check-in da visualizzare." />
            )}
          </div>
        </Card>

        <Card className="border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-black text-slate-950">Allenamenti recenti</h3>
          <div className="mt-3 space-y-2">
            {visibleLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-black text-slate-950">
                    {log.workout_exercises?.exercise_name || "Esercizio"}
                  </p>
                  <Pill className="bg-white text-slate-700">
                    {formatDate(log.created_at || log.session_date)}
                  </Pill>
                </div>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  {log.load_kg || "—"} kg · {log.reps_done || "—"} reps · RPE {log.rpe || "—"} · RIR {log.rir || "—"}
                </p>
                {log.notes && (
                  <p className="mt-2 rounded-xl bg-white p-2 text-sm font-semibold text-slate-600">
                    {log.notes}
                  </p>
                )}
              </div>
            ))}

            {visibleLogs.length === 0 && (
              <Empty title="Nessun allenamento" text="Non ci sono serie registrate." />
            )}
          </div>
        </Card>
      </div>

      <Card className="border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-black text-slate-950">Foto progressi</h3>
          <Pill className="bg-slate-100 text-slate-700">{visiblePhotos.length} foto</Pill>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visiblePhotos.slice(0, 8).map((photo) => (
            <div key={photo.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-black text-slate-950">
                {formatDate(photo.photo_date || photo.created_at)}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {photo.photo_type || photo.file_name || "Foto progressi"}
              </p>
              {photo.file_path && (
                <Button
                  type="button"
                  onClick={() => openStorageFile("progress-photos", photo.file_path)}
                  className="mt-3 w-full border border-slate-200 bg-white text-slate-700"
                >
                  Apri
                </Button>
              )}
            </div>
          ))}

          {visiblePhotos.length === 0 && (
            <Empty title="Nessuna foto" text="Non ci sono foto progressi." />
          )}
        </div>
      </Card>
    </div>
  );
}

function ClientDashboard({ session, userProfile, onLogout }) {
  const [activeTab, setActiveTab] = usePersistedState("tmfit_client_tab", "home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [client, setClient] = useState(null);
  const [plans, setPlans] = useState([]);
  const [diets, setDiets] = useState([]);
  const [posts, setPosts] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [loadHistory, setLoadHistory] = useState([]);
  const [loadHistoryLoaded, setLoadHistoryLoaded] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [sessionCache, setSessionCache] = useState({});
  const [workoutPlayer, setWorkoutPlayer] = useState({
  open: false,
  plan: null,
  day: null
});

  const [checkinForm, setCheckinForm] = useState({
    checkin_date: today(),
    weight_kg: "",
    energy_level: "",
    sleep_quality: "",
    hunger_level: "",
    stress_level: "",
    digestion_level: "",
    diet_adherence: "",
    training_adherence: "",
    water_liters: "",
    steps: "",
    notes: ""
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoForm, setPhotoForm] = useState({
    photo_date: today(),
    photo_type: "front",
    notes: ""
  });
  const [dietView, setDietView] = usePersistedState(
    "tmfit_client_diet_view",
    "summary"
  );
  const [dietPreview, setDietPreview] = useState({
    dietId: "",
    url: "",
    loading: false,
    error: ""
  });
  const [dietFullscreenOpen, setDietFullscreenOpen] = useState(false);

  const clientTabs = [
    { id: "home", label: "Home", icon: <HomeIcon size={17} /> },
    { id: "training", label: "Scheda", icon: <Dumbbell size={17} /> },
    { id: "checkin", label: "Check-in", icon: <ClipboardCheck size={17} /> },
    { id: "progress", label: "Progressi", icon: <Camera size={17} /> },
    { id: "diet", label: "Dieta", icon: <FileText size={17} /> },
    { id: "posts", label: "Bacheca", icon: <Megaphone size={17} /> }
  ];

  useEffect(() => {
    loadClientArea();
  }, []);

  async function loadClientArea() {
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (clientError) {
      console.warn(clientError.message);
      return;
    }

    setClient(clientData);

    if (!clientData) return;

    const numericClientId = Number(clientData.id);

    const { data: planData } = await supabase
      .from("workout_plans")
      .select(
        `
        *,
        workout_weeks (
          *,
          workout_days (
            *,
            workout_blocks (
              *,
              workout_exercises (
                *,
                exercise_media_library (*),
                workout_exercise_sets (*),
                workout_exercise_progressions (*)
              )
            )
          )
        )
      `
      )
      .eq("client_id", numericClientId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    setPlans(normalizePlans(planData || []));

    const { data: dietData } = await supabase
      .from("diets")
      .select("*")
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    setDiets(dietData || []);

    const { data: postData } = await supabase
      .from("coach_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setPosts(postData || []);

    const { data: checkinData } = await supabase
      .from("client_checkins")
      .select("*")
      .eq("client_id", numericClientId)
      .order("checkin_date", { ascending: false })
      .limit(20);

    setCheckins(checkinData || []);

    const { data: photoData } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("client_id", numericClientId)
      .order("photo_date", { ascending: false });

    setPhotos(photoData || []);
  }

  function currentWeekNumber(plan) {
    if (!plan?.start_date) return 1;

    const start = new Date(plan.start_date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7) + 1;

    return Math.max(1, Math.min(Number(plan.duration_weeks) || 4, week));
  }

  function progressionForExercise(plan, exercise) {
    const week = currentWeekNumber(plan);

    return (
      exercise.workout_exercise_progressions?.find(
        (item) => Number(item.week_number) === week
      ) || null
    );
  }
function normalizeExerciseTitle(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function getExerciseHistory(exercise) {
  const currentId = String(exercise.id || "");
  const currentName = normalizeExerciseTitle(exercise.exercise_name);

  return loadHistory
    .filter((log) => {
      const logExerciseId = String(log.workout_exercise_id || "");
      const logExerciseName = normalizeExerciseTitle(
        log.workout_exercises?.exercise_name
      );

      return logExerciseId === currentId || logExerciseName === currentName;
    })
    .filter((log) => log.load_kg || log.reps_done)
    .slice(0, 12);
}

  async function loadWorkoutHistoryIfNeeded() {
    if (!client || loadHistoryLoaded) return true;

    const { data: historyData, error: historyError } = await supabase
      .from("workout_set_logs")
      .select(
        "*, workout_exercises(exercise_name), workout_sessions!inner(client_id, session_date)"
      )
      .eq("workout_sessions.client_id", Number(client.id))
      .order("created_at", { ascending: false })
      .limit(250);

    if (historyError) {
      console.warn(historyError.message);
      return false;
    }

    setLoadHistory(historyData || []);
    setLoadHistoryLoaded(true);
    return true;
  }

  async function openWorkoutPlayer(plan, day) {
    if (!day) return;

    await loadWorkoutHistoryIfNeeded();

    setWorkoutPlayer({
      open: true,
      plan,
      day
    });
  }

  function updateDraft(key, field, value) {
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value
      }
    }));
  }

  async function getOrCreateWorkoutSession(planId, dayId) {
    if (!client) return null;

    const key = `${dayId}-${today()}`;

    if (sessionCache[key]) return sessionCache[key];

    const { data: existing } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("client_id", Number(client.id))
      .eq("day_id", dayId)
      .eq("session_date", today())
      .maybeSingle();

    if (existing) {
      setSessionCache((prev) => ({
        ...prev,
        [key]: existing.id
      }));

      return existing.id;
    }

    const { data, error } = await supabase
      .from("workout_sessions")
      .insert({
        client_id: Number(client.id),
        user_id: session.user.id,
        plan_id: planId,
        day_id: dayId,
        session_date: today(),
        status: "completed"
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return null;
    }

    setSessionCache((prev) => ({
      ...prev,
      [key]: data.id
    }));

    return data.id;
  }

  async function saveSetLog(plan, day, exercise, set) {
  const setToken = set.id || set.temp_id || `virtual-${set.set_number}`;
  const key = `${exercise.id}-${setToken}`;
  const draft = drafts[key] || {};
  const sessionId = await getOrCreateWorkoutSession(plan.id, day.id);

  if (!sessionId) return false;

  const { error } = await supabase.from("workout_set_logs").insert({
    session_id: sessionId,
    workout_exercise_id: exercise.id,
    planned_set_id: set.id || null,
    set_number: set.set_number,
    load_kg: numberOrNull(draft.load_kg),
    reps_done: numberOrNull(draft.reps_done),
    rpe: numberOrNull(draft.rpe),
    rir: numberOrNull(draft.rir),
    notes: draft.notes || null,
    completed: true
  });

  if (error) {
    alert(error.message);
    return false;
  }

  setDrafts((prev) => ({
    ...prev,
    [key]: {}
  }));

  return true;
}

  async function saveCheckin(event) {
    event.preventDefault();

    if (!client) return;

    const { error } = await supabase.from("client_checkins").insert({
      client_id: Number(client.id),
      user_id: session.user.id,
      checkin_date: checkinForm.checkin_date || today(),
      weight_kg: numberOrNull(checkinForm.weight_kg),
      energy_level: numberOrNull(checkinForm.energy_level),
      sleep_quality: numberOrNull(checkinForm.sleep_quality),
      hunger_level: numberOrNull(checkinForm.hunger_level),
      stress_level: numberOrNull(checkinForm.stress_level),
      digestion_level: numberOrNull(checkinForm.digestion_level),
      diet_adherence: numberOrNull(checkinForm.diet_adherence),
      training_adherence: numberOrNull(checkinForm.training_adherence),
      water_liters: numberOrNull(checkinForm.water_liters),
      steps: numberOrNull(checkinForm.steps),
      notes: checkinForm.notes || null
    });

    if (error) {
      alert(error.message);
      return;
    }

    setCheckinForm({
      checkin_date: today(),
      weight_kg: "",
      energy_level: "",
      sleep_quality: "",
      hunger_level: "",
      stress_level: "",
      digestion_level: "",
      diet_adherence: "",
      training_adherence: "",
      water_liters: "",
      steps: "",
      notes: ""
    });

    await loadClientArea();
    alert("Check-in salvato.");
  }

  async function uploadProgressPhoto(event) {
    event.preventDefault();

    if (!client || !photoFile) {
      alert("Seleziona una foto.");
      return;
    }

    const safeName = photoFile.name.replaceAll(" ", "-");
    const path = `${client.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("progress-photos")
      .upload(path, photoFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { error } = await supabase.from("progress_photos").insert({
      client_id: Number(client.id),
      user_id: session.user.id,
      photo_date: photoForm.photo_date || today(),
      photo_type: photoForm.photo_type,
      file_path: path,
      notes: photoForm.notes || null,
      visible_to_client: true
    });

    if (error) {
      alert(error.message);
      return;
    }

    setPhotoFile(null);

    setPhotoForm({
      photo_date: today(),
      photo_type: "front",
      notes: ""
    });

    await loadClientArea();
  }

  async function openStorageFile(bucket, path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 120);

    if (error) {
      alert(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  async function downloadStorageFile(bucket, path, fileName = "TMFIT-piano-alimentare.pdf") {
    if (!path) return;

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 120);

    if (error) {
      alert(error.message);
      return;
    }

    try {
      const response = await fetch(data.signedUrl);

      if (!response.ok) throw new Error("Download non riuscito.");

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = safePdfDownloadName(fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      console.warn("Download PDF non riuscito", downloadError?.message || downloadError);
      window.open(data.signedUrl, "_blank");
    }
  }

  async function previewDietInApp(diet) {
    if (!diet?.file_path) return;

    setDietPreview({
      dietId: String(diet.id),
      url: "",
      loading: true,
      error: ""
    });

    const { data, error } = await supabase.storage
      .from("diets")
      .createSignedUrl(diet.file_path, 3600);

    if (error) {
      setDietPreview({
        dietId: String(diet.id),
        url: "",
        loading: false,
        error: error.message
      });
      return;
    }

    setDietPreview({
      dietId: String(diet.id),
      url: data.signedUrl,
      loading: false,
      error: ""
    });
  }

  function openDietFullscreen(diet) {
    setDietFullscreenOpen(true);

    if (!diet?.file_path) return;

    if (dietPreview.dietId === String(diet.id) && dietPreview.url) return;

    previewDietInApp(diet);
  }

  function clientDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function daysSince(value) {
    const date = clientDate(value);
    if (!date) return null;
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  }

  function formatClientDate(value) {
    const date = clientDate(value);
    if (!date) return "non disponibile";
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  const activePlan = plans[0] || null;
  const latestDiet = diets[0] || null;
  const previewDietForModal =
    diets.find((diet) => String(diet.id) === String(dietPreview.dietId)) ||
    latestDiet ||
    null;
  const latestCheckin = checkins[0] || null;
  const latestPhoto = photos[0] || null;
  const latestCheckinDays = daysSince(latestCheckin?.checkin_date || latestCheckin?.created_at);
  const latestPhotoDays = daysSince(latestPhoto?.photo_date || latestPhoto?.created_at);

  useEffect(() => {
    if (activeTab !== "diet") return;
    if (dietView !== "pdf") return;
    if (!latestDiet?.file_path) return;
    if (dietPreview.dietId === String(latestDiet.id) && dietPreview.url) return;

    previewDietInApp(latestDiet);
  }, [activeTab, dietView, latestDiet?.id]);

  const completedWorkoutKeys = new Set(
    loadHistory
      .map((item) => item.session_id || item.workout_sessions?.session_date)
      .filter(Boolean)
  );

  const clientCompletedWorkoutCount = completedWorkoutKeys.size;
  const lastWorkoutLog = loadHistory[0] || null;
  const lastWorkoutDate =
    lastWorkoutLog?.workout_sessions?.session_date || lastWorkoutLog?.created_at;

  const nextWorkoutTitle = activePlan
    ? activePlan.workout_weeks?.[0]?.workout_days?.[0]?.title || "Allenamento disponibile"
    : "Programma non disponibile";

  const clientReminderItems = [
    activePlan
      ? {
          id: "client-training",
          priority: "Oggi",
          title: "Allenamento disponibile",
          text: "Apri la scheda e avvia la modalità Allenati quando sei pronto.",
          actionLabel: "Vai alla scheda",
          tone: "teal",
          onAction: () => setActiveTab("training")
        }
      : {
          id: "client-no-training",
          priority: "Setup",
          title: "Programma non ancora disponibile",
          text: "Il coach non ha ancora assegnato una scheda attiva.",
          actionLabel: "Aggiorna",
          tone: "amber",
          onAction: loadClientArea
        },
    latestCheckinDays === null || latestCheckinDays >= 7
      ? {
          id: "client-checkin",
          priority: "Da fare",
          title: "Compila il check-in settimanale",
          text: latestCheckin
            ? `Ultimo check-in: ${formatClientDate(latestCheckin.checkin_date || latestCheckin.created_at)}.`
            : "Non hai ancora inviato un check-in.",
          actionLabel: "Vai al check-in",
          tone: "red",
          onAction: () => setActiveTab("checkin")
        }
      : null,
    latestDiet
      ? {
          id: "client-diet",
          priority: "Piano",
          title: "Piano alimentare disponibile",
          text: `Ultima dieta caricata: ${formatClientDate(latestDiet.created_at || latestDiet.start_date)}.`,
          actionLabel: "Apri dieta",
          tone: "slate",
          onAction: () => setActiveTab("diet")
        }
      : {
          id: "client-no-diet",
          priority: "Setup",
          title: "Dieta non ancora caricata",
          text: "Quando il coach caricherà il piano, lo troverai nella sezione Dieta.",
          actionLabel: "Aggiorna",
          tone: "amber",
          onAction: loadClientArea
        },
    latestPhotoDays === null || latestPhotoDays >= 14
      ? {
          id: "client-photo",
          priority: "Progressi",
          title: "Aggiorna le foto progressi",
          text: latestPhoto
            ? `Ultima foto: ${formatClientDate(latestPhoto.photo_date || latestPhoto.created_at)}.`
            : "Non hai ancora caricato foto progressi.",
          actionLabel: "Vai ai progressi",
          tone: "amber",
          onAction: () => setActiveTab("progress")
        }
      : null
  ].filter(Boolean);

  const primaryClientReminder = clientReminderItems[0] || null;

  const clientTimelineItems = [
    latestCheckin && {
      id: `timeline-checkin-${latestCheckin.id}`,
      date: latestCheckin.checkin_date || latestCheckin.created_at,
      label: "Check-in inviato",
      text: `Peso ${latestCheckin.weight_kg || "—"} kg · energia ${latestCheckin.energy_level || "—"}/10`,
      tone: "teal"
    },
    latestPhoto && {
      id: `timeline-photo-${latestPhoto.id}`,
      date: latestPhoto.photo_date || latestPhoto.created_at,
      label: "Foto progressi caricata",
      text: latestPhoto.photo_type || "Foto progressi",
      tone: "amber"
    },
    latestDiet && {
      id: `timeline-diet-${latestDiet.id}`,
      date: latestDiet.created_at || latestDiet.start_date,
      label: "Dieta disponibile",
      text: latestDiet.title || latestDiet.file_name || "Piano alimentare",
      tone: "slate"
    },
    lastWorkoutLog && {
      id: `timeline-workout-${lastWorkoutLog.id}`,
      date: lastWorkoutDate,
      label: "Ultimo allenamento registrato",
      text: `${lastWorkoutLog.workout_exercises?.exercise_name || "Serie salvata"}: ${lastWorkoutLog.load_kg || "—"} kg x ${lastWorkoutLog.reps_done || "—"}`,
      tone: "teal"
    }
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  function ClientReminderCard({ item }) {
    const toneClass =
      item.tone === "red"
        ? "bg-red-50 text-red-700"
        : item.tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : item.tone === "teal"
        ? "bg-teal-50 text-teal-700"
        : "bg-slate-100 text-slate-700";

    return (
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${toneClass}`}>
              {item.priority}
            </span>
            <p className="font-black text-slate-950">{item.title}</p>
          </div>

          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {item.text}
          </p>
        </div>

        <Button onClick={item.onAction} className="shrink-0 bg-[#07111f] text-white">
          {item.actionLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="tmfit-client-stage min-h-[100dvh] bg-[#07111f] text-slate-950">
      <style>{`
        html,
        body {
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          background: #07111f;
        }

        * {
          box-sizing: border-box;
        }

        input,
        select,
        textarea,
        button {
          font-size: 16px;
        }

        button,
        a,
        input,
        select,
        textarea {
          -webkit-tap-highlight-color: transparent;
        }

        .tmfit-client-stage {
          overscroll-behavior-x: none;
        }

        .tmfit-client-shell,
        .tmfit-client-shell * {
          max-width: 100%;
        }

        .tmfit-client-shell {
          isolation: isolate;
        }

        .tmfit-workout-screen {
          height: 100dvh;
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          overscroll-behavior: contain;
          touch-action: manipulation;
        }

        .tmfit-workout-scroll {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior-y: contain;
        }

        @supports not (height: 100dvh) {
          .tmfit-client-stage,
          .tmfit-client-shell,
          .tmfit-workout-screen {
            min-height: 100vh;
            height: 100vh;
          }
        }
      `}</style>
      <div className="tmfit-client-shell mx-auto min-h-[100dvh] w-full max-w-[480px] overflow-x-hidden bg-[#f5f7fb] shadow-2xl">
      <header className="sticky top-0 z-30 bg-[#07111f] px-4 py-2.5 text-white shadow-xl md:relative md:px-6 md:py-4">
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => {
              setActiveTab("home");
              setDrawerOpen(false);
              if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="min-w-0 rounded-2xl px-1 py-1 text-left transition hover:bg-white/5 active:scale-[.98]"
            aria-label="Vai alla Home"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-300">Benvenuto</p>
            <p className="mt-0.5 max-w-[220px] truncate text-xl font-black leading-none tracking-tight text-white md:max-w-none">
              {client?.first_name || fullName(client).split(" ")[0] || "Cliente"}
            </p>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="tmfit-tap flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg transition hover:bg-white/15 active:scale-[.96]"
          >
            <span className="block h-0.5 w-6 rounded bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 rounded bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 rounded bg-white" />
          </button>
        </div>
      </header>

      <TopTabs tabs={clientTabs} active={activeTab} onChange={setActiveTab} contained />
<SideDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  tabs={clientTabs}
  active={activeTab}
  onChange={setActiveTab}
  role="client"
  onLogout={onLogout}
  userProfile={userProfile}
  side="right"
/>
      <main className="mx-auto w-full max-w-[480px] space-y-4 overflow-x-hidden p-4 pb-[calc(3.7rem+env(safe-area-inset-bottom))] md:p-5">
        {activeTab === "home" && (
          <div className="space-y-5">
            <Card className="overflow-hidden border-none bg-transparent shadow-none">
  <div className="rounded-[1.9rem] bg-[#07111f] p-5 text-white shadow-xl ring-1 ring-slate-900/10 md:p-7">
    <p className="text-[11px] font-black uppercase tracking-[0.45em] text-teal-300">
      BENVENUTO
    </p>

    <h2 className="mt-4 text-3xl font-black uppercase leading-tight tracking-tight text-white md:text-5xl">
      {client ? fullName(client) : "Cliente"}
    </h2>

    <p className="mt-3 max-w-xl text-sm font-bold leading-6 text-slate-300 md:text-base">
      Scheda, timer, carichi, dieta, check-in e progressi.
    </p>
  </div>
</Card>

            <Card className="overflow-hidden border-none shadow-lg">
              <div className="bg-white p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">
                      Promemoria
                    </p>

                    <h3 className="mt-2 text-2xl font-black text-slate-950">
                      Cose da fare oggi
                    </h3>

                   
                  </div>

                  <Pill className="bg-teal-100 text-teal-700">
                    {clientReminderItems.length} attivi
                  </Pill>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {clientReminderItems.map((item) => (
                    <ClientReminderCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === "training" && (
          <div className="space-y-5">
            {plans.map((plan) => {
              const allTrainingDays = (plan.workout_weeks || []).flatMap((week) =>
                (week.workout_days || []).map((day) => ({ week, day }))
              );

              const currentWeek = currentWeekNumber(plan);
              const currentWeekDays = allTrainingDays.filter(
                ({ week }) => Number(week?.week_number || 0) === currentWeek
              );
              const visibleTrainingDays =
                currentWeekDays.length > 0 ? currentWeekDays : allTrainingDays;

              const nextTraining = visibleTrainingDays[0] || allTrainingDays[0] || null;
              const nextDay = nextTraining?.day || null;
              const nextExerciseCount =
                nextDay?.workout_blocks?.reduce(
                  (sum, block) =>
                    sum + (block.workout_exercises?.length || 0),
                  0
                ) || 0;
              const nextMinutes = nextDay?.estimated_minutes || 60;

              return (
                <div key={plan.id} className="space-y-4">
                  <Card className="overflow-hidden border-none bg-[#07111f] text-white shadow-xl">
                    <div className="p-5">
                      <p className="text-[11px] font-black uppercase tracking-[0.35em] text-teal-300">
                        Prossimo allenamento
                      </p>

                      <div className="mt-4 flex flex-col gap-4">
                        <div>
                          <h2 className="text-3xl font-black leading-tight tracking-tight">
                            {nextDay?.title || "Scheda non disponibile"}
                          </h2>

                          <p className="mt-2 text-sm font-bold text-slate-300">
                            {plan.title}
                            {plan.goal ? ` · ${plan.goal}` : ""}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-2xl bg-white/10 p-3">
                            <p className="text-2xl font-black">
                              {nextExerciseCount}
                            </p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                              Esercizi
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white/10 p-3">
                            <p className="text-2xl font-black">
                              {nextMinutes}
                            </p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                              Min
                            </p>
                          </div>

                          <div className="rounded-2xl bg-white/10 p-3">
                            <p className="text-2xl font-black">
                              {currentWeek}
                            </p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-slate-300">
                              Settimana
                            </p>
                          </div>
                        </div>

                        <Button
                          type="button"
                          disabled={!nextDay}
                          onClick={() => openWorkoutPlayer(plan, nextDay)}
                          className="w-full bg-teal-300 text-slate-950 hover:bg-teal-200"
                        >
                          <Dumbbell size={17} className="mr-2" />
                          Inizia allenamento
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.28em] text-teal-600">
                          Scheda
                        </p>

                        <h3 className="mt-1 text-xl font-black text-slate-950">
                          Allenamenti settimana corrente
                        </h3>
                      </div>

                      <Pill className="bg-teal-100 text-teal-700">
                        {visibleTrainingDays.length} sedute
                      </Pill>
                    </div>

                    {plan.notes && (
                      <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-500">
                        {plan.notes}
                      </p>
                    )}

                    <div className="mt-4 space-y-3">
                      {visibleTrainingDays.map(({ week, day }, dayIndex) => {
                        const exerciseCount =
                          day.workout_blocks?.reduce(
                            (sum, block) =>
                              sum + (block.workout_exercises?.length || 0),
                            0
                          ) || 0;
                        const estimatedMinutes = day.estimated_minutes || 60;

                        return (
                          <div
                            key={`${week?.id || week?.week_number || "week"}-${day.id}`}
                            className="rounded-3xl border border-slate-200 bg-white p-4"
                          >
                            <div className="flex flex-col gap-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
                                    Allenamento {dayIndex + 1}
                                  </p>

                                  <h4 className="mt-1 truncate text-xl font-black text-slate-950">
                                    {day.title}
                                  </h4>

                                  <p className="mt-1 text-sm font-bold text-slate-500">
                                    {exerciseCount} esercizi · {estimatedMinutes} min
                                    {week?.week_number
                                      ? ` · settimana ${week.week_number}`
                                      : ""}
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openWorkoutPlayer(plan, day)}
                                  className="shrink-0 rounded-2xl bg-[#07111f] px-4 py-3 text-sm font-black text-white active:scale-[.98]"
                                >
                                  Inizia
                                </button>
                              </div>

                              {day.notes && (
                                <p className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-500">
                                  {day.notes}
                                </p>
                              )}

                              <details className="group rounded-2xl bg-slate-50 p-3">
                                <summary className="cursor-pointer list-none text-sm font-black text-slate-800">
                                  Vedi esercizi e target
                                </summary>

                                <div className="mt-3 space-y-3">
                                  {day.workout_blocks?.map((block) =>
                                    block.workout_exercises?.map((exercise) => {
                                      const progression = progressionForExercise(
                                        plan,
                                        exercise
                                      );

                                      const targetSets =
                                        progression?.target_sets || exercise.sets;
                                      const targetReps =
                                        progression?.target_reps || exercise.reps;
                                      const targetRecovery =
                                        progression?.recovery_seconds ||
                                        exercise.recovery_seconds ||
                                        90;
                                      const exerciseHistory =
                                        getExerciseHistory(exercise);

                                      return (
                                        <div
                                          key={exercise.id}
                                          className="rounded-2xl bg-white p-3 shadow-sm"
                                        >
                                          <div className="flex gap-3">
                                            <ExerciseMediaPreview
                                              media={
                                                exercise.exercise_media_library
                                              }
                                            />

                                            <div className="min-w-0 flex-1">
                                              <h5 className="truncate text-base font-black text-slate-950">
                                                {exercise.exercise_name}
                                              </h5>

                                              <p className="mt-1 text-sm font-bold text-slate-600">
                                                {targetSets || "—"} serie ·{" "}
                                                {targetReps || "—"} reps ·{" "}
                                                recupero {targetRecovery}s
                                              </p>

                                              {progression && (
                                                <p className="mt-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-bold leading-5 text-teal-800">
                                                  Target settimana{" "}
                                                  {progression.week_number}:{" "}
                                                  {progression.target_load_text ||
                                                    progression.target_load_kg ||
                                                    "carico libero"}
                                                </p>
                                              )}

                                              {exercise.notes && (
                                                <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
                                                  Note: {exercise.notes}
                                                </p>
                                              )}

                                              <div className="mt-2 flex flex-wrap gap-2">
                                                {exercise.video_url && (
                                                  <a
                                                    href={exercise.video_url}
                                                    target="_blank"
                                                    className="rounded-xl bg-[#07111f] px-3 py-2 text-xs font-black text-white"
                                                  >
                                                    Video
                                                  </a>
                                                )}

                                                {exercise.image_url && (
                                                  <a
                                                    href={exercise.image_url}
                                                    target="_blank"
                                                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700"
                                                  >
                                                    Immagine
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          </div>

                                          <ExerciseHistoryBox
                                            history={exerciseHistory}
                                          />
                                        </div>
                                      );
                                    })
                                  )}

                                  {exerciseCount === 0 && (
                                    <p className="text-sm font-semibold text-slate-500">
                                      Nessun esercizio inserito per questa seduta.
                                    </p>
                                  )}
                                </div>
                              </details>
                            </div>
                          </div>
                        );
                      })}

                      {visibleTrainingDays.length === 0 && (
                        <Empty
                          title="Nessun allenamento nella settimana corrente"
                          text="Il programma è attivo, ma non ci sono sedute disponibili."
                        />
                      )}
                    </div>
                  </Card>
                </div>
              );
            })}

            {plans.length === 0 && (
              <Empty
                title="Nessuna scheda disponibile"
                text="Il coach non ha ancora assegnato un programma."
              />
            )}
          </div>
        )}

        {activeTab === "checkin" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="text-xl font-black">Check-in</h2>

              <form
                onSubmit={saveCheckin}
                className="mt-4 grid gap-3 md:grid-cols-2"
              >
                <Label title="Data">
                  <Input
                    type="date"
                    className="text-center appearance-none"
                    value={checkinForm.checkin_date}
                    onChange={(event) =>
                      setCheckinForm({
                        ...checkinForm,
                        checkin_date: event.target.value
                      })
                    }
                  />
                </Label>

                <Label title="Peso kg">
                  <Input
                    type="number"
                    value={checkinForm.weight_kg}
                    onChange={(event) =>
                      setCheckinForm({
                        ...checkinForm,
                        weight_kg: event.target.value
                      })
                    }
                  />
                </Label>

                {[
                  ["energy_level", "Energia"],
                  ["sleep_quality", "Sonno"],
                  ["hunger_level", "Fame"],
                  ["stress_level", "Stress"],
                  ["digestion_level", "Digestione"],
                  ["diet_adherence", "Aderenza dieta"],
                  ["training_adherence", "Aderenza allenamento"]
                ].map(([field, label]) => (
                  <div key={field} className="md:col-span-2">
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
                      {label} 1-10
                    </p>
                    <div className="grid grid-cols-10 gap-1">
                      {Array.from({ length: 10 }, (_, index) => {
                        const value = String(index + 1);
                        const selected = String(checkinForm[field]) === value;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() =>
                              setCheckinForm({
                                ...checkinForm,
                                [field]: value
                              })
                            }
                            className={`h-10 rounded-xl text-xs font-black transition active:scale-[.96] ${
                              selected
                                ? "bg-[#07111f] text-white shadow-md"
                                : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                            }`}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <Label title="Acqua litri">
                  <Input
                    type="number"
                    value={checkinForm.water_liters}
                    onChange={(event) =>
                      setCheckinForm({
                        ...checkinForm,
                        water_liters: event.target.value
                      })
                    }
                  />
                </Label>

                <Label title="Passi">
                  <Input
                    type="number"
                    value={checkinForm.steps}
                    onChange={(event) =>
                      setCheckinForm({
                        ...checkinForm,
                        steps: event.target.value
                      })
                    }
                  />
                </Label>

                <Textarea
                  className="md:col-span-2"
                  placeholder="Note della settimana"
                  value={checkinForm.notes}
                  onChange={(event) =>
                    setCheckinForm({
                      ...checkinForm,
                      notes: event.target.value
                    })
                  }
                />

                <Button
                  type="submit"
                  className="bg-[#07111f] text-white md:col-span-2"
                >
                  Invia check-in
                </Button>
              </form>
            </Card>

            <Card className="p-5">
              <h2 className="text-xl font-black">Storico check-in</h2>

              <div className="mt-4 space-y-3">
                {checkins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-black">{checkin.checkin_date}</p>

                    <p className="text-sm font-semibold text-slate-500">
                      Peso {checkin.weight_kg || "—"} kg · Energia{" "}
                      {checkin.energy_level || "—"}/10
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-5">
            <Card className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-700">
                    Timeline progressi
                  </p>
                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Ultimi aggiornamenti
                  </h2>
                </div>
                <Pill className="bg-teal-100 text-teal-700">
                  {clientTimelineItems.length} eventi
                </Pill>
              </div>

              <div className="mt-4 space-y-3">
                {clientTimelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-3xl border border-slate-200 bg-white p-4"
                  >
                    <span
                      className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                        item.tone === "teal"
                          ? "bg-teal-400"
                          : item.tone === "amber"
                          ? "bg-amber-400"
                          : "bg-slate-300"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                        {formatClientDate(item.date)}
                      </p>
                      <p className="mt-1 font-black text-slate-950">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}

                {clientTimelineItems.length === 0 && (
                  <Empty
                    title="Timeline vuota"
                    text="Quando invierai check-in, foto o allenamenti, li vedrai qui."
                  />
                )}
              </div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-xl font-black">Carica foto progressi</h2>

                <form onSubmit={uploadProgressPhoto} className="mt-4 space-y-3">
                  <Input
                    type="date"
                    className="text-center appearance-none"
                    value={photoForm.photo_date}
                    onChange={(event) =>
                      setPhotoForm({
                        ...photoForm,
                        photo_date: event.target.value
                      })
                    }
                  />

                  <Select
                    value={photoForm.photo_type}
                    onChange={(event) =>
                      setPhotoForm({
                        ...photoForm,
                        photo_type: event.target.value
                      })
                    }
                  >
                    <option value="front">Frontale</option>
                    <option value="side">Laterale</option>
                    <option value="back">Posteriore</option>
                    <option value="other">Altro</option>
                  </Select>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPhotoFile(event.target.files?.[0] || null)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"
                  />

                  <Textarea
                    placeholder="Note foto"
                    value={photoForm.notes}
                    onChange={(event) =>
                      setPhotoForm({
                        ...photoForm,
                        notes: event.target.value
                      })
                    }
                  />

                  <Button type="submit" className="w-full bg-[#07111f] text-white">
                    Carica foto
                  </Button>
                </form>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Le tue foto</h2>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() =>
                        openStorageFile("progress-photos", photo.file_path)
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
                    >
                      <Camera className="text-teal-600" />

                      <p className="mt-2 font-black">{photo.photo_type}</p>

                      <p className="text-sm font-semibold text-slate-500">
                        {photo.photo_date}
                      </p>
                    </button>
                  ))}

                  {photos.length === 0 && (
                    <Empty title="Nessuna foto" text="Carica la prima foto." />
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "diet" && (
          <div className="space-y-5">
            <DietPdfFullscreenModal
              open={dietFullscreenOpen}
              title={dietDisplayTitle(previewDietForModal)}
              fileName={previewDietForModal?.file_name || "PDF dieta"}
              preview={dietPreview}
              onClose={() => setDietFullscreenOpen(false)}
              onOpenExternal={() => {
                if (previewDietForModal?.file_path) {
                  downloadStorageFile(
                    "diets",
                    previewDietForModal.file_path,
                    previewDietForModal.file_name || dietDisplayTitle(previewDietForModal)
                  );
                }
              }}
            />

            {latestDiet ? (
              <>
                <Card className="overflow-hidden border-slate-200">
                  <div className="bg-[#07111f] p-5 text-white md:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
                          Dieta attiva
                        </p>
                        <h2 className="mt-2 text-2xl font-black leading-tight tracking-tight md:text-3xl">
                          {dietDisplayTitle(latestDiet)}
                        </h2>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
                          {dietPeriodLabel(latestDiet)}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[420px]">
                        <div className="rounded-2xl bg-white/10 p-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Formato
                          </p>
                          <p className="mt-1 truncate text-sm font-black text-white">
                            {dietTypeLabel(latestDiet.diet_type)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/10 p-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Kcal
                          </p>
                          <p className="mt-1 truncate text-sm font-black text-white">
                            {dietStructuredInfo(latestDiet).calorieTarget || "Nel PDF"}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-teal-300 p-3 text-slate-950">
                          <p className="text-[10px] font-black uppercase tracking-wider opacity-70">
                            Stato
                          </p>
                          <p className="mt-1 text-sm font-black">
                            Attiva
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div
                  className={`grid ${
                    dietExtractedInfo(latestDiet) ? "grid-cols-4" : "grid-cols-3"
                  } gap-2 rounded-[1.4rem] border border-slate-200 bg-white p-1 shadow-sm`}
                >
                  {[
                    { id: "summary", label: "Riepilogo" },
                    dietExtractedInfo(latestDiet) ? { id: "meals", label: "Pasti" } : null,
                    { id: "pdf", label: "PDF" },
                    { id: "history", label: "Storico" }
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDietView(item.id)}
                        className={`rounded-[1rem] px-2 py-3 text-[11px] font-black transition sm:text-xs ${
                          dietView === item.id
                            ? "bg-[#07111f] text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                </div>

                {dietView === "summary" && (
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <Card className="overflow-hidden">
                      <div className="border-b border-slate-200 bg-white px-5 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                          Indicazioni coach
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-950">
                          Come seguire il piano
                        </h3>
                      </div>

                      <div className="space-y-4 p-5">
                        <DietSummaryBox diet={latestDiet} />
                        <DietInfoGrid diet={latestDiet} />
                        <DietCoachNoteBox diet={latestDiet} />

                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                              Idratazione
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              Segui le indicazioni del PDF
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Preparazione
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              Pesi a crudo
                            </p>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Condimenti
                            </p>
                            <p className="mt-1 text-sm font-black text-slate-950">
                              Olio a crudo
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="overflow-hidden">
                      <div className="border-b border-slate-200 bg-white px-5 py-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                          PDF originale
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-950">
                          Piano completo
                        </h3>
                      </div>

                      <div className="space-y-3 p-5">
                        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                          <FileText className="text-teal-700" />
                          <p className="mt-3 truncate font-black text-slate-950">
                            {latestDiet.file_name || "PDF dieta"}
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                            Puoi consultarlo dentro l’app oppure scaricare il PDF originale.
                          </p>
                        </div>

                        <Button
                          onClick={() => {
                            setDietView("pdf");
                            previewDietInApp(latestDiet);
                          }}
                          className="w-full bg-teal-300 text-slate-950 hover:bg-teal-200"
                        >
                          Visualizza dentro l’app
                        </Button>

                        <Button
                          onClick={() => openDietFullscreen(latestDiet)}
                          className="w-full bg-[#07111f] text-white"
                        >
                          Modalità lettura interna
                        </Button>

                        <Button
                          onClick={() =>
                            downloadStorageFile(
                              "diets",
                              latestDiet.file_path,
                              latestDiet.file_name || dietDisplayTitle(latestDiet)
                            )
                          }
                          className="w-full border border-slate-200 bg-white text-slate-950"
                        >
                          Scarica PDF
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {dietView === "meals" && (
                  <Card className="overflow-hidden">
                    <div className="border-b border-slate-200 bg-white px-5 py-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                        Piano alimentare
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        Card pasti
                      </h3>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                        Consulta il piano alimentare organizzato in card. Il PDF completo resta disponibile nella sezione dedicata.
                      </p>
                    </div>

                    <div className="p-4 md:p-5">
                      <DietExtractedPlan diet={latestDiet} />
                    </div>
                  </Card>
                )}

                {dietView === "pdf" && (
                  <Card className="overflow-hidden">
                    <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                          Viewer dieta
                        </p>
                        <h3 className="mt-1 text-xl font-black text-slate-950">
                          PDF dentro l’app
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                        <Button
                          onClick={() => openDietFullscreen(latestDiet)}
                          className="bg-[#07111f] text-white"
                        >
                          Schermo interno
                        </Button>
                        <Button
                          onClick={() =>
                            downloadStorageFile(
                              "diets",
                              latestDiet.file_path,
                              latestDiet.file_name || dietDisplayTitle(latestDiet)
                            )
                          }
                          className="border border-slate-200 bg-white text-slate-950"
                        >
                          Scarica PDF
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 md:p-5">
                      {dietPreview.loading && (
                        <div className="grid min-h-[360px] place-items-center rounded-[1.6rem] border border-slate-200 bg-slate-50 text-sm font-black text-slate-500">
                          Caricamento PDF...
                        </div>
                      )}

                      {!dietPreview.loading && dietPreview.error && (
                        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                          {dietPreview.error}
                        </div>
                      )}

                      {!dietPreview.loading && dietPreview.url && (
                        <DietPdfInlineViewer
                          url={dietPreview.url}
                          title={latestDiet.file_name || "PDF dieta cliente"}
                          onOpenFull={() => setDietFullscreenOpen(true)}
                          onOpenExternal={() =>
                            downloadStorageFile(
                              "diets",
                              latestDiet.file_path,
                              latestDiet.file_name || dietDisplayTitle(latestDiet)
                            )
                          }
                        />
                      )}

                      {!dietPreview.loading && !dietPreview.url && !dietPreview.error && (
                        <div className="rounded-[1.6rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                          <FileText className="mx-auto text-slate-400" />
                          <p className="mt-3 font-black text-slate-950">
                            Anteprima pronta
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                            Tocca il pulsante per caricare il PDF qui oppure aprilo in modalità lettura interna, più comoda su smartphone.
                          </p>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            <Button
                              onClick={() => previewDietInApp(latestDiet)}
                              className="bg-teal-300 text-slate-950"
                            >
                              Carica PDF
                            </Button>
                            <Button
                              onClick={() => openDietFullscreen(latestDiet)}
                              className="bg-[#07111f] text-white"
                            >
                              Schermo interno
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {dietView === "history" && (
                  <Card className="overflow-hidden">
                    <div className="border-b border-slate-200 bg-white px-5 py-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.25em] text-teal-700">
                        Storico diete
                      </p>
                      <h3 className="mt-1 text-xl font-black text-slate-950">
                        Piani disponibili
                      </h3>
                    </div>

                    <div className="space-y-3 p-5">
                      {diets.map((diet, index) => (
                        <div
                          key={diet.id}
                          className={`rounded-3xl border p-4 ${
                            index === 0
                              ? "border-[#07111f] bg-slate-50"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-black text-slate-950">
                                  {dietDisplayTitle(diet)}
                                </p>
                                {index === 0 && (
                                  <Pill className="bg-[#07111f] text-white">Attiva</Pill>
                                )}
                              </div>
                              <p className="mt-1 truncate text-sm font-semibold text-slate-500">
                                {diet.file_name || "PDF dieta"}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-400">

                                {dietTypeLabel(diet.diet_type)} · {dietStructuredInfo(diet).calorieTarget || dietPeriodLabel(diet)}

                              </p>
                            </div>

                            <div className="flex shrink-0 gap-2">
                              <Button
                                onClick={() => {
                                  setDietView("pdf");
                                  previewDietInApp(diet);
                                }}
                                className="bg-teal-300 px-3 py-2 text-xs text-slate-950"
                              >
                                In app
                              </Button>
                              <Button
                                onClick={() =>
                                  downloadStorageFile(
                                    "diets",
                                    diet.file_path,
                                    diet.file_name || dietDisplayTitle(diet)
                                  )
                                }
                                className="bg-[#07111f] px-3 py-2 text-xs text-white"
                              >
                                Scarica
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            ) : (
              <Card className="p-5">
                <Empty
                  title="Nessuna dieta"
                  text="Il coach non ha ancora caricato un piano alimentare."
                />
              </Card>
            )}
          </div>
        )}

        {activeTab === "posts" && (
          <Card className="p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-700">
                  Comunicazioni
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">
                  Bacheca coach
                </h2>
              </div>
              <Pill className="bg-teal-100 text-teal-700">
                {posts.length} messaggi
              </Pill>
            </div>

            <div className="mt-4 space-y-3">
              {posts.map((post) => {
                const category = String(post.post_type || "info").toLowerCase();
                const categoryClass =
                  category.includes("mot")
                    ? "bg-teal-100 text-teal-700"
                    : category.includes("avv") || category.includes("alert")
                    ? "bg-amber-100 text-amber-700"
                    : category.includes("mat")
                    ? "bg-sky-100 text-sky-700"
                    : "bg-slate-100 text-slate-700";

                return (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill className={categoryClass}>
                        {post.post_type || "Info"}
                      </Pill>

                      {post.is_pinned && (
                        <Pill className="bg-[#07111f] text-white">Fissato</Pill>
                      )}
                    </div>

                    <p className="mt-3 font-black text-slate-950">{post.title}</p>

                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {post.body}
                    </p>
                  </div>
                );
              })}

              {posts.length === 0 && (
                <Empty title="Nessun messaggio" text="La bacheca è vuota." />
              )}
            </div>
          </Card>
        )}

<WorkoutPlayerModal
  player={workoutPlayer}
  onClose={() =>
    setWorkoutPlayer({
      open: false,
      plan: null,
      day: null
    })
  }
  drafts={drafts}
  updateDraft={updateDraft}
  saveSetLog={saveSetLog}
  getExerciseHistory={getExerciseHistory}
  onWorkoutSaved={loadClientArea}
/>
            </main>

      <AppFooter role="client" />
      </div>
    </div>
  );
}
