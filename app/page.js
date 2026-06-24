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

function Label({ title, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-400">
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
          <div className="border-b border-white/10 p-5">
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
function TopTabs({ tabs, active, onChange }) {
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

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-3 pt-2 shadow-2xl backdrop-blur-xl md:hidden">
        <div className={`grid ${mobileGridClass} gap-1 rounded-[1.7rem] bg-slate-100 p-1`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex min-w-0 flex-col items-center justify-center rounded-[1.3rem] px-1 py-2 text-[10px] font-black transition active:scale-[.96] ${
                active === tab.id
                  ? "bg-[#07111f] text-white"
                  : "text-slate-500"
              }`}
            >
              <span className="mb-1">{tab.icon}</span>
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
      className={
        prominent
          ? "rounded-[1.8rem] border-2 border-teal-300 bg-[#07111f] p-5 text-white shadow-xl"
          : "rounded-3xl border border-slate-200 bg-white p-4 text-slate-950"
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div
            className={
              prominent
                ? "flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300 text-slate-950"
                : "flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700"
            }
          >
            <Timer size={24} />
          </div>

          <div>
            <p
              className={
                prominent
                  ? "text-[11px] font-black uppercase tracking-[0.25em] text-teal-300"
                  : "text-[11px] font-black uppercase tracking-[0.25em] text-slate-400"
              }
            >
              Timer recupero
            </p>

            <p
              className={
                prominent
                  ? "mt-1 text-5xl font-black tracking-tight text-white"
                  : "mt-1 text-3xl font-black tracking-tight text-slate-950"
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
                  ? "Recupero finito: suono inviato."
                  : "Recupero finito."
                : running
                ? "In corso"
                : "Pronto"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setRunning(true);
              setSoundPlayed(false);
            }}
            className={
              prominent
                ? "rounded-xl bg-teal-300 px-3 py-3 text-xs font-black text-slate-950"
                : "rounded-xl bg-[#07111f] px-3 py-3 text-xs font-black text-white"
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
                ? "rounded-xl bg-white/10 px-3 py-3 text-xs font-black text-white"
                : "rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700"
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
                ? "rounded-xl bg-amber-300 px-3 py-3 text-xs font-black text-slate-950"
                : prominent
                ? "rounded-xl bg-white/10 px-3 py-3 text-xs font-black text-white"
                : "rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700"
            }
          >
            {soundEnabled ? "Suono ON" : "Suono OFF"}
          </button>
        </div>
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

export default function Home() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

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
    start_date: "",
    end_date: "",
    notes: ""
  });
  const [dietFile, setDietFile] = useState(null);

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
  .limit(1000);

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

    const safeName = dietFile.name.replaceAll(" ", "-");
    const path = `${selectedClient.id}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("diets")
      .upload(path, dietFile);

    if (uploadError) {
      alert(uploadError.message);
      return;
    }

    const { error } = await supabase.from("diets").insert({
      client_id: Number(selectedClient.id),
      professional_id: session.user.id,
      title: dietForm.title || dietFile.name,
      file_name: dietFile.name,
      file_path: path,
      start_date: dietForm.start_date || null,
      end_date: dietForm.end_date || null,
      notes: dietForm.notes || null,
      status: "active",
      diet_type: "file"
    });

    if (error) {
      alert(error.message);
      return;
    }

    setDietForm({
      title: "",
      start_date: "",
      end_date: "",
      notes: ""
    });

    setDietFile(null);

    await loadClientBundle(selectedClient.id);
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
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">
                {title}
              </p>

              <p className="mt-2 text-3xl font-black text-slate-950">
                {value}
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                {text}
              </p>
            </div>

            <div className={`rounded-2xl p-3 ${toneClass}`}>{icon}</div>
          </div>
        </Card>
      );
    }

    function ActionRow({ clientId, title, text, tag, actionLabel, onAction }) {
      return (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-black text-slate-950">{title}</p>
              <Pill className="bg-amber-100 text-amber-700">{tag}</Pill>
            </div>

            <p className="mt-1 text-sm font-semibold text-slate-500">{text}</p>
          </div>

          <Button
            onClick={onAction || (() => openClient(clientId))}
            className="shrink-0 bg-[#07111f] text-white"
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
        <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
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

          <Button onClick={item.onAction} className="shrink-0 bg-[#07111f] text-white">
            {item.actionLabel}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <Card className="overflow-hidden border-none bg-[#07111f] text-white shadow-xl">
          <div className="p-5 md:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-teal-300">
                  Dashboard professionista
                </p>

                <h2 className="mt-3 text-3xl font-black md:text-5xl">
                  Oggi su TMFIT Pro
                </h2>

                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-300 md:text-base">
                  Vista operativa per capire subito chi seguire, cosa manca e
                  quali attività sono arrivate negli ultimi 7 giorni.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
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
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">
                  Centro promemoria
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  Cose da fare adesso
                </h3>

                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                  Promemoria interni generati dai dati già presenti: clienti da
                  programmare, diete mancanti, check-in recenti e aderenza da controllare.
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
              <h3 className="text-lg font-black">Ultimi check-in</h3>
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
              <h3 className="text-lg font-black">Ultimi allenamenti</h3>
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
              <h3 className="text-lg font-black">Foto progressi</h3>
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
    className="rounded-2xl bg-white/10 p-3 text-white"
  >
    <span className="block h-0.5 w-5 rounded bg-white" />
    <span className="mt-1.5 block h-0.5 w-5 rounded bg-white" />
    <span className="mt-1.5 block h-0.5 w-5 rounded bg-white" />
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
              <Card className="p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                      Area clienti
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Scheda cliente stile CRM: stato percorso, segnali operativi e azioni rapide.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
                    {[
                      { id: "overview", label: "Panoramica" },
                      { id: "new", label: "Nuovo" },
                      { id: "notes", label: "Note" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setClientPanel(item.id)}
                        className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                          clientPanel === item.id
                            ? "bg-[#07111f] text-white shadow-sm"
                            : "text-slate-500 hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
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
                <Card className="p-5">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                      <UserPlus className="text-teal-600" />
                      <h2 className="text-xl font-black">Nuovo cliente</h2>
                    </div>

                    <Pill className="bg-slate-100 text-slate-700">
                      Login automatico cliente
                    </Pill>
                  </div>

                  {clientError && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                      {clientError}
                    </div>
                  )}

                  {credentials && (
                    <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
                      <p className="text-sm font-black text-teal-800">
                        Credenziali create
                      </p>

                      <p className="mt-2 text-sm font-bold">
                        Email: {credentials.email}
                      </p>

                      <p className="text-sm font-bold">
                        Password: {credentials.password}
                      </p>
                    </div>
                  )}

                  <form onSubmit={createClient} className="space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
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
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
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
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
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

                      <Input
                        type="number"
                        placeholder="Altezza cm"
                        value={newClient.height_cm}
                        onChange={(event) =>
                          setNewClient({
                            ...newClient,
                            height_cm: event.target.value
                          })
                        }
                      />
                    </div>

                    <Input
                      placeholder="Obiettivo"
                      value={newClient.goal}
                      onChange={(event) =>
                        setNewClient({
                          ...newClient,
                          goal: event.target.value
                        })
                      }
                    />

                    <Textarea
                      placeholder="Note interne"
                      value={newClient.notes}
                      onChange={(event) =>
                        setNewClient({
                          ...newClient,
                          notes: event.target.value
                        })
                      }
                    />

                    <Button
                      type="submit"
                      disabled={creatingClient}
                      className="w-full bg-[#07111f] text-white"
                    >
                      {creatingClient ? "Creazione..." : "Crea cliente e login"}
                    </Button>
                  </form>
                </Card>
              )}

              {clientPanel === "notes" && (
                <Card className="p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-black">Note private coach</h2>
                      <p className="text-sm font-semibold text-slate-500">
                        Visibili solo al professionista. Il cliente non le vede.
                      </p>
                    </div>

                    <Pill className="bg-slate-100 text-slate-700">
                      {privateNotes.length} note
                    </Pill>
                  </div>

                  <form onSubmit={savePrivateNote} className="mt-4 space-y-3">
                    <Textarea
                      placeholder="Esempio: preferenze allenamento, fastidi, feedback visita, note anamnestiche..."
                      value={privateNoteText}
                      onChange={(event) => setPrivateNoteText(event.target.value)}
                    />

                    <Button
                      type="submit"
                      disabled={savingPrivateNote}
                      className="bg-[#07111f] text-white"
                    >
                      <Save size={17} className="mr-2" />
                      {savingPrivateNote ? "Salvataggio..." : "Salva nota privata"}
                    </Button>
                  </form>

                  <div className="mt-5 space-y-3">
                    {privateNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold leading-6 text-slate-700">
                              {note.note}
                            </p>

                            <p className="mt-2 text-xs font-bold text-slate-400">
                              {new Date(note.created_at).toLocaleString("it-IT")}
                            </p>
                          </div>

                          <Button
                            onClick={() => deletePrivateNote(note)}
                            className="border border-red-200 bg-red-50 px-3 py-2 text-red-700"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {privateNotes.length === 0 && (
                      <Empty
                        title="Nessuna nota privata"
                        text="Aggiungi appunti interni sul cliente."
                      />
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "programs" && (
            <div className="space-y-5">
              <Card className="p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                      Area programmi
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Lavora a step: builder, programmi salvati e template separati.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1">
                    {[
                      { id: "builder", label: "Builder" },
                      { id: "saved", label: `Salvati ${plans.length}` },
                      { id: "templates", label: `Template ${templates.length}` }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setProgramPanel(item.id)}
                        className={`rounded-xl px-3 py-2 text-xs font-black transition ${
                          programPanel === item.id
                            ? "bg-[#07111f] text-white shadow-sm"
                            : "text-slate-500 hover:bg-white"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              {!selectedClient && programPanel === "builder" && (
                <Empty
                  title="Seleziona un cliente"
                  text="Poi crea il programma smart."
                />
              )}

              {selectedClient && programPanel === "builder" && (
                <Card className="p-5">
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-black">
  {editingProgramId
    ? `Modifica programma: ${editingProgramTitle}`
    : "Smart Workout Builder"}
</h2>

                      <p className="text-sm font-semibold text-slate-500">
                        Allenamenti liberi, righe orizzontali, progressione solo
                        dove serve.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
  {editingProgramId && (
    <Button
  type="button"
  onClick={cancelProgramEditing}
  className="border border-slate-200 bg-white text-slate-700"
>
  <X size={16} className="mr-2" />
  Annulla modifica
</Button>
  )}

  <Button
  type="button"
  onClick={addWorkoutDay}
    className="border border-slate-200 bg-white text-slate-900"
  >
    <Plus size={16} className="mr-2" />
    Allenamento
  </Button>
  
</div>
                  </div>

                  <form onSubmit={saveWorkoutPlan} className="space-y-5">
    <SmartBuilderOverview
  builder={builder}
  editingProgramId={editingProgramId}
  editingProgramTitle={editingProgramTitle}
  stats={builderStats}
  savingPlan={savingPlan}
  savingTemplate={savingTemplate}
  onSaveTemplate={saveBuilderAsTemplate}
  onCancelEditing={cancelProgramEditing}
/>
    <BuilderWorkflowNav
      activeStep={builderStep}
      quality={builderQuality}
      onChange={(step) => {
        setBuilderStep(step);
        if (typeof window !== "undefined") {
          window.setTimeout(() => {
            document
              .getElementById(`builder-${step}`)
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 50);
        }
      }}
    />
    <div className="sticky top-20 z-30 rounded-[1.5rem] border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-xl">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="min-w-0">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
        Builder attivo
      </p>

      <p className="truncate text-sm font-bold text-slate-500">
        {builder.title || "Nuovo programma"} · {builderStats.totalDays} giorni ·{" "}
        {builderStats.totalExercises} esercizi ·{" "}
        {builderStats.estimatedMinutes || 0} min stimati
      </p>
    </div>

    <div className="flex flex-wrap gap-2">
      {editingProgramId && (
        <Button
          type="button"
          onClick={cancelProgramEditing}
          className="border border-slate-200 bg-white text-slate-700"
        >
          Annulla
        </Button>
      )}

      <Button
        type="button"
        onClick={saveBuilderAsTemplate}
        disabled={savingTemplate}
        className="border border-teal-200 bg-teal-50 text-teal-700"
      >
        {savingTemplate ? "Salvataggio..." : "Salva template"}
      </Button>

      <Button
        type="submit"
        disabled={savingPlan || builderQuality.warnings.length > 0}
        className="bg-[#07111f] text-white"
      >
        {savingPlan
          ? "Salvataggio..."
          : editingProgramId
          ? "Aggiorna programma"
          : "Salva programma"}
      </Button>
    </div>
  </div>
</div>
                    <div id="builder-setup" className="grid scroll-mt-32 gap-3 md:grid-cols-3">
                      <Label title="Titolo programma">
                        <Input
                          value={builder.title}
                          onChange={(event) =>
                            setBuilder({
                              ...builder,
                              title: event.target.value
                            })
                          }
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
                          placeholder="Ipertrofia, forza..."
                        />
                      </Label>

                      <Label title="Settimane">
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          value={builder.duration_weeks}
                          onChange={(event) =>
                            updateDurationWeeks(event.target.value)
                          }
                        />
                      </Label>

                      <Label title="Inizio">
                        <Input
                          type="date"
                          value={builder.start_date}
                          onChange={(event) =>
                            setBuilder({
                              ...builder,
                              start_date: event.target.value
                            })
                          }
                        />
                      </Label>

                      <Label title="Fine">
                        <Input
                          type="date"
                          value={builder.end_date}
                          onChange={(event) =>
                            setBuilder({
                              ...builder,
                              end_date: event.target.value
                            })
                          }
                        />
                      </Label>

                      <Label title="Luogo">
                        <Select
                          value={builder.location}
                          onChange={(event) =>
                            setBuilder({
                              ...builder,
                              location: event.target.value
                            })
                          }
                        >
                          <option value="palestra">Palestra</option>
                          <option value="casa">Casa</option>
                          <option value="ibrido">Ibrido</option>
                        </Select>
                      </Label>
                    </div>

                    <Label title="Note generali">
                      <Textarea
                        value={builder.notes}
                        onChange={(event) =>
                          setBuilder({
                            ...builder,
                            notes: event.target.value
                          })
                        }
                        placeholder="Indicazioni generali, focus tecnico, gestione carichi..."
                      />
                    </Label>

                    <div id="builder-workouts" className="scroll-mt-32 space-y-5">
                    {builder.days.map((day, dayIndex) => (
                      <div
                        key={day.temp_id}
                        className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                          <div className="grid flex-1 gap-3 md:grid-cols-3">
                            <Label title="Allenamento">
                              <Input
                                value={day.title}
                                onChange={(event) =>
                                  updateBuilder((next) => {
                                    next.days[dayIndex].title =
                                      event.target.value;
                                  })
                                }
                              />
                            </Label>

                            <Label title="Minuti stimati">
                              <Input
                                type="number"
                                value={day.estimated_minutes}
                                onChange={(event) =>
                                  updateBuilder((next) => {
                                    next.days[dayIndex].estimated_minutes =
                                      event.target.value;
                                  })
                                }
                              />
                            </Label>

                            <Label title="Note giorno">
                              <Input
                                value={day.notes}
                                onChange={(event) =>
                                  updateBuilder((next) => {
                                    next.days[dayIndex].notes =
                                      event.target.value;
                                  })
                                }
                                placeholder="Focus gambe, upper, push..."
                              />
                            </Label>
                          </div>

                          <div className="flex flex-wrap gap-2">
  <Button
    type="button"
    onClick={() => moveWorkoutDay(dayIndex, -1)}
    disabled={dayIndex === 0}
    className="border border-slate-200 bg-white px-3 text-slate-700"
  >
    ↑
  </Button>

  <Button
    type="button"
    onClick={() => moveWorkoutDay(dayIndex, 1)}
    disabled={dayIndex === builder.days.length - 1}
    className="border border-slate-200 bg-white px-3 text-slate-700"
  >
    ↓
  </Button>

  <Button
    type="button"
    onClick={() => duplicateWorkoutDay(dayIndex)}
    className="border border-teal-200 bg-teal-50 text-teal-700"
  >
    Duplica giorno
  </Button>

  <Button
    type="button"
    onClick={() => addExerciseRow(dayIndex)}
    className="border border-slate-200 bg-white text-slate-900"
  >
    <Plus size={16} className="mr-2" />
    Esercizio
  </Button>

  <Button
    type="button"
    onClick={() => removeWorkoutDay(dayIndex)}
    className="border border-red-200 bg-white text-red-600"
  >
    <X size={16} />
  </Button>
</div>
                        </div>

                        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                          <table className="min-w-[1180px] w-full text-left text-sm">
                            <thead className="bg-[#07111f] text-xs font-black uppercase tracking-wider text-white">
                              <tr>
                                <th className="p-3">Img</th>
                                <th className="p-3">Esercizio</th>
                                <th className="p-3">Serie</th>
                                <th className="p-3">Reps</th>
                                <th className="p-3">Recupero sec</th>
                                <th className="p-3">RPE</th>
                                <th className="p-3">RIR</th>
                                <th className="p-3">Esecuzione</th>
                                <th className="p-3">Video opz.</th>
                                <th className="p-3">Note</th>
                                <th className="p-3">Progressione</th>
                                <th className="p-3">Azioni</th>
                              </tr>
                            </thead>
<tbody>
  {day.exercises.map((exercise, exerciseIndex) => {
    const matchedMedia = exercise.exercise_media_id
      ? mediaById.get(exercise.exercise_media_id)
      : findMediaForExercise(exercise.exercise_name);

    return (
      <tr
        key={exercise.temp_id}
        className="border-t border-slate-100 align-top"
      >
        <td className="p-3">
          <ExerciseMediaPreview media={matchedMedia} />
        </td>

        <td className="min-w-[260px] p-3">
          <Input
            list="exercise-media-list"
            placeholder="Scrivi esercizio"
            value={exercise.exercise_name}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "exercise_name",
                event.currentTarget.value
              )
            }
          />

          <select
            value={exercise.exercise_media_id}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "exercise_media_id",
                event.currentTarget.value
              )
            }
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold"
          >
            <option value="">Immagine auto/opzionale</option>

            {exerciseMedia.map((media) => (
              <option key={media.id} value={media.id}>
                {media.name}
              </option>
            ))}
          </select>
        </td>

       <td className="w-20 p-2">
  <BuilderCellInput
    type="text"
    inputMode="text"
    placeholder="3"
    value={exercise.sets || ""}
    onChange={(event) =>
      updateExerciseField(
        dayIndex,
        exerciseIndex,
        "sets",
        event.target.value
      )
    }
  />
</td>

     <td className="w-24 p-2">
  <BuilderCellInput
    type="text"
    inputMode="text"
    placeholder="8-10"
    value={exercise.reps || ""}
    onChange={(event) =>
      updateExerciseField(
        dayIndex,
        exerciseIndex,
        "reps",
        event.target.value
      )
    }
  />
</td>
        <td className="w-32 p-3">
          <Input
            type="number"
            value={exercise.recovery_seconds}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "recovery_seconds",
                event.currentTarget.value
              )
            }
          />
        </td>

       <td className="w-20 p-2">
  <BuilderCellInput
    type="text"
    inputMode="decimal"
    placeholder="8"
    value={exercise.target_rpe || ""}
    onChange={(event) =>
      updateExerciseField(
        dayIndex,
        exerciseIndex,
        "target_rpe",
        event.target.value
      )
    }
  />
</td>

    <td className="w-20 p-2">
  <BuilderCellInput
    type="text"
    inputMode="decimal"
    placeholder="2"
    value={exercise.target_rir || ""}
    onChange={(event) =>
      updateExerciseField(
        dayIndex,
        exerciseIndex,
        "target_rir",
        event.target.value
      )
    }
  />
</td>

        <td className="min-w-[180px] p-3">
          <Input
            placeholder="Controllata..."
            value={exercise.execution_mode}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "execution_mode",
                event.currentTarget.value
              )
            }
          />
        </td>

        <td className="min-w-[210px] p-3">
          <Input
            placeholder="Link non obbligatorio"
            value={exercise.video_url}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "video_url",
                event.currentTarget.value
              )
            }
          />
        </td>

        <td className="min-w-[210px] p-3">
          <Input
            placeholder="Note"
            value={exercise.notes}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "notes",
                event.currentTarget.value
              )
            }
          />
        </td>

        <td className="w-40 p-3">
          <label className="flex items-center gap-2 text-xs font-black">
            <input
              type="checkbox"
              checked={exercise.has_weekly_progression}
              onChange={(event) =>
                toggleExerciseProgression(
                  dayIndex,
                  exerciseIndex,
                  event.target.checked
                )
              }
            />
            Progressione
          </label>
        </td>

        <td className="w-56 p-2">
  <div className="flex flex-wrap gap-1.5">
    <Button
      type="button"
      onClick={() => moveExerciseRow(dayIndex, exerciseIndex, -1)}
      disabled={exerciseIndex === 0}
      className="border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700"
    >
      ↑
    </Button>

    <Button
      type="button"
      onClick={() => moveExerciseRow(dayIndex, exerciseIndex, 1)}
      disabled={exerciseIndex === day.exercises.length - 1}
      className="border border-slate-200 bg-white px-2 py-2 text-xs text-slate-700"
    >
      ↓
    </Button>

    <Button
      type="button"
      onClick={() => duplicateExerciseRow(dayIndex, exerciseIndex)}
      className="border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-700"
    >
      Duplica
    </Button>

    <Button
      type="button"
      onClick={() => removeExerciseRow(dayIndex, exerciseIndex)}
      className="border border-red-200 bg-white px-3 py-2 text-xs text-red-600"
    >
      <X size={14} />
    </Button>
  </div>
</td>
      </tr>
    );
  })}
</tbody>
                          </table>
                        </div>

                        <datalist id="exercise-media-list">
                          {exerciseMedia.map((media) => (
                            <option key={media.id} value={media.name} />
                          ))}
                        </datalist>

                        <div className="mt-4 space-y-3">
                          {day.exercises.map((exercise, exerciseIndex) => {
                            if (!exercise.has_weekly_progression) return null;

                            return (
                              <div
                                key={`${exercise.temp_id}-progression`}
                                className="rounded-3xl border border-teal-200 bg-teal-50 p-4"
                              >
                                <div className="mb-3 flex items-center gap-2">
                                  <Check size={17} className="text-teal-700" />

                                  <p className="font-black text-teal-900">
                                    Progressione settimanale ·{" "}
                                    {exercise.exercise_name ||
                                      `Esercizio ${exerciseIndex + 1}`}
                                  </p>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-teal-100 bg-white">
                                  <table className="w-[1000px] text-sm">
                                    <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-400">
                                      <tr>
                                        <th className="p-3">Week</th>
                                        <th className="p-3">Serie</th>
                                        <th className="p-3">Reps</th>
                                        <th className="p-3">Kg / Target</th>
                                        <th className="p-3">RPE</th>
                                        <th className="p-3">RIR</th>
                                        <th className="p-3">Recupero sec</th>
                                        <th className="p-3">Note</th>
                                      </tr>
                                    </thead>

                                    <tbody>
                                      {exercise.progressions.map(
                                        (progression, progressionIndex) => (
                                          <tr
                                            key={progression.temp_id}
                                            className="border-t border-slate-100"
                                          >
                                            <td className="p-3 font-black">
                                              {progression.week_number}
                                            </td>

                                            <td className="p-3">
                                              <Input
                                                value={progression.target_sets}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.days[
                                                      dayIndex
                                                    ].exercises[
                                                      exerciseIndex
                                                    ].progressions[
                                                      progressionIndex
                                                    ].target_sets =
                                                      event.target.value;
                                                  })
                                                }
                                              />
                                            </td>

                                            <td className="p-3">
                                              <Input
                                                value={progression.target_reps}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.days[
                                                      dayIndex
                                                    ].exercises[
                                                      exerciseIndex
                                                    ].progressions[
                                                      progressionIndex
                                                    ].target_reps =
                                                      event.target.value;
                                                  })
                                                }
                                              />
                                            </td>

                                            <td className="p-3">
                                              <Input
                                                placeholder="70kg / +2.5kg"
                                                value={
                                                  progression.target_load_text
                                                }
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.days[
                                                      dayIndex
                                                    ].exercises[
                                                      exerciseIndex
                                                    ].progressions[
                                                      progressionIndex
                                                    ].target_load_text =
                                                      event.target.value;
                                                  })
                                                }
                                              />
                                            </td>

                                            <td className="p-3">
                                              <Input
                                                value={progression.target_rpe}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.days[
                                                      dayIndex
                                                    ].exercises[
                                                      exerciseIndex
                                                    ].progressions[
                                                      progressionIndex
                                                    ].target_rpe =
                                                      event.target.value;
                                                  })
                                                }
                                              />
                                            </td>

                                            <td className="p-3">
                                              <Input
                                                value={progression.target_rir}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.days[
                                                      dayIndex
                                                    ].exercises[
                                                      exerciseIndex
                                                    ].progressions[
                                                      progressionIndex
                                                    ].target_rir =
                                                      event.target.value;
                                                  })
                                                }
                                              />
                                            </td>

                                            <td className="p-3">
                                              <Input
                                                type="number"
                                                value={
                                                  progression.recovery_seconds
                                                }
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.days[
                                                      dayIndex
                                                    ].exercises[
                                                      exerciseIndex
                                                    ].progressions[
                                                      progressionIndex
                                                    ].recovery_seconds =
                                                      event.target.value;
                                                  })
                                                }
                                              />
                                            </td>

                                            <td className="p-3">
                                              <Input
                                                value={progression.notes}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.days[
                                                      dayIndex
                                                    ].exercises[
                                                      exerciseIndex
                                                    ].progressions[
                                                      progressionIndex
                                                    ].notes =
                                                      event.target.value;
                                                  })
                                                }
                                              />
                                            </td>
                                          </tr>
                                        )
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    </div>

                    <div id="builder-progressions" className="scroll-mt-32 rounded-[1.6rem] border border-dashed border-teal-200 bg-teal-50/60 p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-700">
                            Step progressioni
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-600">
                            Le progressioni restano dentro ogni esercizio: attiva la spunta “progressione” solo sugli esercizi chiave.
                          </p>
                        </div>
                        <Pill className="bg-teal-300 text-slate-950">
                          {builderStats.totalProgressions} progressioni attive
                        </Pill>
                      </div>
                    </div>

                    <div id="builder-summary" className="scroll-mt-32">
                      <BuilderQualityPanel
                        builder={builder}
                        quality={builderQuality}
                        selectedClient={selectedClient}
                        stats={builderStats}
                        savingPlan={savingPlan}
                        editingProgramId={editingProgramId}
                      />
                    </div>
                  </form>
                </Card>
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
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-xl font-black">Misurazioni private</h2>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Sezione visibile solo al professionista.
                </p>

                <form
                  onSubmit={saveMeasurement}
                  className="mt-4 grid gap-3 md:grid-cols-2"
                >
                  {Object.entries(measurementForm).map(([key, value]) => {
                    if (key === "notes") return null;

                    return (
                      <Label key={key} title={key.replaceAll("_", " ")}>
                        <Input
                          type={key === "measurement_date" ? "date" : "number"}
                          value={value}
                          onChange={(event) =>
                            setMeasurementForm({
                              ...measurementForm,
                              [key]: event.target.value
                            })
                          }
                        />
                      </Label>
                    );
                  })}

                  <Textarea
                    className="md:col-span-2"
                    placeholder="Note misurazione"
                    value={measurementForm.notes}
                    onChange={(event) =>
                      setMeasurementForm({
                        ...measurementForm,
                        notes: event.target.value
                      })
                    }
                  />

                  <Button
                    type="submit"
                    className="bg-[#07111f] text-white md:col-span-2"
                  >
                    Salva misurazione
                  </Button>
                </form>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Storico misure</h2>

                <div className="mt-4 space-y-3">
                  {measurements.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="font-black">{item.measurement_date}</p>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Peso {item.weight_kg || "—"} kg · BF{" "}
                        {item.body_fat_percentage || "—"}% · Massa magra{" "}
                        {item.lean_mass_kg || "—"} kg
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Vita {item.waist_cm || "—"} · Fianchi{" "}
                        {item.hips_cm || "—"} · Petto {item.chest_cm || "—"}
                      </p>
                    </div>
                  ))}

                  {measurements.length === 0 && (
                    <Empty
                      title="Nessuna misurazione"
                      text="Inserisci la prima misurazione."
                    />
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "diets" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-xl font-black">Carica dieta</h2>

                <form onSubmit={uploadDiet} className="mt-4 space-y-3">
                  <Input
                    placeholder="Titolo dieta"
                    value={dietForm.title}
                    onChange={(event) =>
                      setDietForm({
                        ...dietForm,
                        title: event.target.value
                      })
                    }
                  />

                  <div className="grid gap-3 md:grid-cols-2">
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
                  </div>

                  <input
                    type="file"
                    onChange={(event) =>
                      setDietFile(event.target.files?.[0] || null)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold"
                  />

                  <Textarea
                    placeholder="Note dieta"
                    value={dietForm.notes}
                    onChange={(event) =>
                      setDietForm({
                        ...dietForm,
                        notes: event.target.value
                      })
                    }
                  />

                  <Button type="submit" className="w-full bg-[#07111f] text-white">
                    <Upload size={17} className="mr-2" />
                    Carica dieta
                  </Button>
                </form>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Diete cliente</h2>

                <div className="mt-4 space-y-3">
                  {diets.map((diet) => (
                    <div
                      key={diet.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black">{diet.title}</p>

                          <p className="text-sm font-semibold text-slate-500">
                            {diet.file_name}
                          </p>
                        </div>

                        <Button
                          onClick={() => openStorageFile("diets", diet.file_path)}
                          className="bg-[#07111f] text-white"
                        >
                          Apri
                        </Button>
                      </div>
                    </div>
                  ))}

                  {diets.length === 0 && (
                    <Empty
                      title="Nessuna dieta"
                      text="Carica il primo file dieta."
                    />
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === "posts" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-xl font-black">Nuovo messaggio bacheca</h2>

                <form onSubmit={savePost} className="mt-4 space-y-3">
                  <Input
                    required
                    placeholder="Titolo"
                    value={postForm.title}
                    onChange={(event) =>
                      setPostForm({
                        ...postForm,
                        title: event.target.value
                      })
                    }
                  />

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

                  <Textarea
                    placeholder="Testo messaggio"
                    value={postForm.body}
                    onChange={(event) =>
                      setPostForm({
                        ...postForm,
                        body: event.target.value
                      })
                    }
                  />

                  <label className="flex items-center gap-2 text-sm font-bold">
                    <input
                      type="checkbox"
                      checked={postForm.is_pinned}
                      onChange={(event) =>
                        setPostForm({
                          ...postForm,
                          is_pinned: event.target.checked
                        })
                      }
                    />
                    Messaggio fissato
                  </label>

                  <Button type="submit" className="w-full bg-[#07111f] text-white">
                    Pubblica
                  </Button>
                </form>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Messaggi pubblicati</h2>

                <div className="mt-4 space-y-3">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-black">{post.title}</p>

                        {post.is_pinned && (
                          <Pill className="bg-teal-100 text-teal-700">
                            Fissato
                          </Pill>
                        )}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-600">
                        {post.body}
                      </p>

                      <p className="mt-2 text-xs font-bold text-slate-400">
                        {post.client_id ? "Cliente specifico" : "Tutti i clienti"}
                      </p>
                    </div>
                  ))}

                  {posts.length === 0 && (
                    <Empty
                      title="Nessun messaggio"
                      text="Pubblica il primo messaggio."
                    />
                  )}
                </div>
              </Card>
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
    <Card className="overflow-hidden">
      <div className="bg-[#07111f] p-5 text-white md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
              Riepilogo finale
            </p>
            <h3 className="mt-2 text-2xl font-black">
              {builder.title || "Programma allenamento"}
            </h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">
              Cliente: {selectedClient ? fullName(selectedClient) : "non selezionato"} · {stats.totalDays} allenamenti · {stats.totalExercises} esercizi · {builder.duration_weeks || 4} settimane
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 px-5 py-4 text-center">
            <p className="text-3xl font-black text-teal-300">{quality.score}</p>
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              score qualità
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          <h4 className="font-black text-slate-950">Checklist salvataggio</h4>
          {quality.checks.map((check) => (
            <div
              key={check.label}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  check.done ? "bg-teal-300 text-slate-950" : "bg-slate-200 text-slate-500"
                }`}
              >
                {check.done ? <Check size={16} /> : "!"}
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
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-black text-slate-950">Controllo qualità</h4>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Avvisi obbligatori e consigli prima del salvataggio.
                </p>
              </div>
              <Pill className={quality.statusClass}>{quality.statusLabel}</Pill>
            </div>

            <div className="mt-4 space-y-3">
              {hasWarnings && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-black text-amber-800">
                    Da sistemare prima del lancio
                  </p>
                  <div className="mt-2 space-y-1">
                    {quality.warnings.map((item) => (
                      <p key={item} className="text-sm font-bold text-amber-800">
                        • {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {hasSuggestions && (
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-sm font-black text-sky-800">
                    Ottimizzazioni consigliate
                  </p>
                  <div className="mt-2 space-y-1">
                    {quality.suggestions.map((item) => (
                      <p key={item} className="text-sm font-bold text-sky-800">
                        • {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {!hasWarnings && !hasSuggestions && (
                <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
                  <p className="text-sm font-black text-teal-800">
                    Scheda completa e ordinata.
                  </p>
                  <p className="mt-1 text-sm font-bold text-teal-700">
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
    <Card className="p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black">Template schede</h2>
          <p className="text-sm font-semibold text-slate-500">
            Salva strutture riutilizzabili e caricale nel builder in un click.
          </p>
        </div>

        <Button
          onClick={onSaveTemplate}
          disabled={savingTemplate}
          className="bg-[#07111f] text-white"
        >
          <Save size={17} className="mr-2" />
          {savingTemplate ? "Salvataggio..." : "Salva builder come template"}
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
        <Search size={17} className="text-slate-400" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cerca template"
          className="w-full bg-transparent text-sm font-bold outline-none"
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-black">{template.title}</h3>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {template.goal || "Nessun obiettivo"}
                </p>

                <div className="mt-2 flex flex-wrap gap-2">
                  <Pill className="bg-teal-100 text-teal-700">
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
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => onUseTemplate(template)}
                className="bg-[#07111f] text-white"
              >
                Usa nel builder
              </Button>

              <Button
                onClick={() => onDeleteTemplate(template)}
                disabled={deletingTemplateId === template.id}
                className="border border-red-200 bg-red-50 text-red-700"
              >
                <Trash2 size={16} className="mr-2" />
                {deletingTemplateId === template.id
                  ? "Eliminazione..."
                  : "Elimina"}
              </Button>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <Empty
            title="Nessun template"
            text="Compila una scheda nel builder e salvala come template."
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
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black">Programmi salvati</h2>
          <p className="text-sm font-semibold text-slate-500">
            Gestisci schede attive, archiviate e riutilizzabili.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {plans.map((plan) => {
          const isActive = (plan.status || "active") === "active";

          return (
            <div
              key={plan.id}
              className={`rounded-3xl border p-4 ${
                isActive
                  ? "border-slate-200 bg-white"
                  : "border-slate-200 bg-slate-50 opacity-80"
              }`}
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h3 className="text-lg font-black">{plan.title}</h3>

                  <p className="text-sm font-semibold text-slate-500">
                    {plan.goal || "Nessun obiettivo"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Pill
                      className={
                        isActive
                          ? "bg-teal-100 text-teal-700"
                          : "bg-slate-200 text-slate-600"
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
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onEditProgram(plan)}
                    className="bg-[#07111f] text-white"
                  >
                    Modifica
                  </Button>

                  <Button
                    onClick={() => onDuplicateProgram(plan)}
                    className="border border-slate-200 bg-white text-slate-900"
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
                    className="border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
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
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <summary className="cursor-pointer font-black">
                      {week.title || `Settimana ${week.week_number}`}
                    </summary>

                    <div className="mt-3 space-y-3">
                      {week.workout_days?.map((day) => (
                        <div key={day.id} className="rounded-2xl bg-white p-3">
                          <p className="font-black text-teal-700">
                            {day.title}
                          </p>

                          <div className="mt-2 space-y-2">
                            {day.workout_blocks?.map((block) => (
                              <div key={block.id}>
                                {block.workout_exercises?.map((exercise) => (
                                  <div
                                    key={exercise.id}
                                    className="mt-2 rounded-xl bg-slate-50 p-3 text-sm"
                                  >
                                    <div className="flex items-start gap-3">
                                      <ExerciseMediaPreview
                                        media={exercise.exercise_media_library}
                                      />

                                      <div className="flex-1">
                                        <p className="font-black">
                                          {exercise.exercise_name}
                                        </p>

                                        <p className="font-semibold text-slate-500">
                                          {exercise.sets || "—"} serie ·{" "}
                                          {exercise.reps || "—"} reps · recupero{" "}
                                          {exercise.recovery_seconds || "—"}s
                                        </p>

                                        {exercise.has_weekly_progression && (
                                          <Pill className="mt-2 bg-teal-100 text-teal-700">
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
            text="Crea il primo programma completo."
          />
        )}
      </div>
    </Card>
  );
}
function ExerciseHistoryBox({ history = [] }) {
  const validHistory = history.filter((item) => item.load_kg || item.reps_done);

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

  const last = validHistory[0];

  const best = [...validHistory].sort((a, b) => {
    const loadDiff = (Number(b.load_kg) || 0) - (Number(a.load_kg) || 0);

    if (loadDiff !== 0) return loadDiff;

    return (Number(b.reps_done) || 0) - (Number(a.reps_done) || 0);
  })[0];

  const recent = validHistory.slice(0, 5);

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-wider text-slate-400">
        Storico carichi
      </p>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black text-slate-400">Ultima volta</p>
          <p className="mt-1 font-black text-slate-900">
            {last.load_kg || "—"} kg x {last.reps_done || "—"}
          </p>
          <p className="text-xs font-bold text-slate-500">
            RPE {last.rpe || "—"} · RIR {last.rir || "—"} ·{" "}
            {last.workout_sessions?.session_date || "—"}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-3">
          <p className="text-xs font-black text-slate-400">Miglior serie</p>
          <p className="mt-1 font-black text-slate-900">
            {best.load_kg || "—"} kg x {best.reps_done || "—"}
          </p>
          <p className="text-xs font-bold text-slate-500">
            RPE {best.rpe || "—"} · RIR {best.rir || "—"} ·{" "}
            {best.workout_sessions?.session_date || "—"}
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
              {item.workout_sessions?.session_date || "—"}
            </span>

            <span className="font-black text-slate-900">
              {item.load_kg || "—"} kg x {item.reps_done || "—"}
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
function CoachMonitorPanel({
  selectedClient,
  checkins = [],
  logs = [],
  photos = [],
  openStorageFile
}) {
  const latestCheckin = checkins[0] || null;
  const latestLog = logs[0] || null;
  const latestWorkoutGroups = groupLogsBySession(logs).slice(0, 5);
  const latestWorkoutGroup = latestWorkoutGroups[0] || null;

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  function daysSince(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return Math.max(0, Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)));
  }

  function relativeDate(value) {
    const days = daysSince(value);
    if (days === null) return "mai";
    if (days === 0) return "oggi";
    if (days === 1) return "ieri";
    return `${days} giorni fa`;
  }

  function hasValue(value) {
    return value !== null && value !== undefined && String(value).trim() !== "";
  }

  function metricValue(value, suffix = "") {
    return hasValue(value) ? `${value}${suffix}` : "—";
  }

  function logLine(log) {
    const parts = [
      `set ${log.set_number || "—"}`,
      `${metricValue(log.load_kg, " kg")} x ${metricValue(log.reps_done)}`
    ];

    if (hasValue(log.rpe)) parts.push(`RPE ${log.rpe}`);
    if (hasValue(log.rir)) parts.push(`RIR ${log.rir}`);

    return parts.join(" · ");
  }

  function groupLogsBySession(items) {
    const map = new Map();

    items.forEach((log) => {
      const date = log?.workout_sessions?.session_date || log?.created_at || "senza-data";
      const key = `${log?.session_id || date}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          date,
          items: []
        });
      }

      map.get(key).items.push(log);
    });

    return Array.from(map.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort((a, b) => {
          const nameCompare = String(a.workout_exercises?.exercise_name || "").localeCompare(
            String(b.workout_exercises?.exercise_name || "")
          );
          if (nameCompare !== 0) return nameCompare;
          return Number(a.set_number || 0) - Number(b.set_number || 0);
        })
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  if (!selectedClient) {
    return (
      <Empty
        title="Seleziona un cliente"
        text="Il monitor mostra check-in, log allenamenti e foto del cliente selezionato."
      />
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-2 border-slate-200">
        <div className="bg-[#07111f] p-5 text-white">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-teal-300">
            Monitor cliente
          </p>

          <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black">
                {fullName(selectedClient)}
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-300">
                Check-in, aderenza e log allenamenti in formato compatto.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-white/10 px-3 py-2">
                <p className="text-xl font-black">{checkins.length}</p>
                <p className="text-[10px] font-black uppercase text-slate-300">check-in</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2">
                <p className="text-xl font-black">{logs.length}</p>
                <p className="text-[10px] font-black uppercase text-slate-300">serie</p>
              </div>
              <div className="rounded-2xl bg-teal-300 px-3 py-2 text-slate-950">
                <p className="text-xl font-black">{photos.length}</p>
                <p className="text-[10px] font-black uppercase">foto</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 bg-white p-4 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Ultimo check-in
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {latestCheckin ? relativeDate(latestCheckin.checkin_date || latestCheckin.created_at) : "mai"}
            </p>
            <p className="text-xs font-bold text-slate-500">
              {latestCheckin ? formatDate(latestCheckin.checkin_date || latestCheckin.created_at) : "Nessun dato"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Ultimo allenamento
            </p>
            <p className="mt-1 text-lg font-black text-slate-950">
              {latestLog ? relativeDate(latestLog.workout_sessions?.session_date || latestLog.created_at) : "mai"}
            </p>
            <p className="text-xs font-bold text-slate-500">
              {latestLog ? formatDate(latestLog.workout_sessions?.session_date || latestLog.created_at) : "Nessun log"}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              Ultima serie loggata
            </p>
            <p className="mt-1 truncate text-lg font-black text-slate-950">
              {latestLog?.workout_exercises?.exercise_name || "—"}
            </p>
            <p className="text-xs font-bold text-slate-500">
              {latestLog ? logLine(latestLog) : "Nessun dato"}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">Ultimi check-in</h2>
              <p className="text-sm font-semibold text-slate-500">
                Vista compatta ma completa dei dati più importanti.
              </p>
            </div>
            <Pill className="bg-slate-100 text-slate-700">
              {checkins.length}
            </Pill>
          </div>

          <div className="space-y-3">
            {checkins.slice(0, 8).map((checkin) => (
              <div key={checkin.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-black text-slate-950">
                      {formatDate(checkin.checkin_date || checkin.created_at)}
                    </p>
                    <p className="text-xs font-bold text-slate-500">
                      {relativeDate(checkin.checkin_date || checkin.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Pill className="bg-slate-100 text-slate-700">
                      Peso {metricValue(checkin.weight_kg, " kg")}
                    </Pill>
                    <Pill className="bg-teal-100 text-teal-800">
                      Dieta {metricValue(checkin.diet_adherence, "/10")}
                    </Pill>
                    <Pill className="bg-teal-100 text-teal-800">
                      Training {metricValue(checkin.training_adherence, "/10")}
                    </Pill>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-2">Energia {metricValue(checkin.energy_level, "/10")}</div>
                  <div className="rounded-xl bg-slate-50 p-2">Sonno {metricValue(checkin.sleep_quality, "/10")}</div>
                  <div className="rounded-xl bg-slate-50 p-2">Stress {metricValue(checkin.stress_level, "/10")}</div>
                  <div className="rounded-xl bg-slate-50 p-2">Fame {metricValue(checkin.hunger_level, "/10")}</div>
                </div>

                {checkin.notes && (
                  <p className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">
                    {checkin.notes}
                  </p>
                )}
              </div>
            ))}

            {checkins.length === 0 && (
              <Empty
                title="Nessun check-in"
                text="Il cliente non ha ancora compilato check-in."
              />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">Log allenamento</h2>
              <p className="text-sm font-semibold text-slate-500">
                Ultima seduta completa e storico recente per data.
              </p>
            </div>
            <Pill className="bg-[#07111f] text-white">
              {latestWorkoutGroup ? formatDate(latestWorkoutGroup.date) : "—"}
            </Pill>
          </div>

          {latestWorkoutGroup ? (
            <div className="space-y-4">
              <div className="rounded-3xl border-2 border-teal-200 bg-teal-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">
                      Ultimo allenamento completo
                    </p>
                    <p className="text-lg font-black text-teal-950">
                      {formatDate(latestWorkoutGroup.date)} · {relativeDate(latestWorkoutGroup.date)}
                    </p>
                  </div>
                  <Pill className="bg-teal-300 text-slate-950">
                    {latestWorkoutGroup.items.length} serie
                  </Pill>
                </div>

                <div className="space-y-2">
                  {latestWorkoutGroup.items.map((log) => (
                    <div key={log.id} className="rounded-2xl bg-white p-3">
                      <p className="font-black text-slate-950">
                        {log.workout_exercises?.exercise_name || "Esercizio"}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {logLine(log)}
                      </p>
                      {log.notes && (
                        <p className="mt-1 whitespace-pre-wrap break-words text-xs font-bold text-slate-500">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {latestWorkoutGroups.slice(1).map((group) => (
                  <div key={group.key} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-slate-950">
                        {formatDate(group.date)}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        {group.items.length} serie
                      </p>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {group.items.slice(0, 5).map((log) => `${log.workout_exercises?.exercise_name || "Esercizio"}: ${logLine(log)}`).join("  |  ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Empty
              title="Nessun log"
              text="Il cliente non ha ancora registrato carichi."
            />
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-950">Foto progressi</h2>
            <p className="text-sm font-semibold text-slate-500">
              Ultime foto caricate dal cliente o dal professionista.
            </p>
          </div>
          <Camera size={20} className="text-teal-600" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {photos.slice(0, 9).map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openStorageFile("progress-photos", photo.file_path)}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white"
            >
              <Camera size={20} className="text-teal-600" />

              <p className="mt-2 font-black text-slate-950">{photo.photo_type}</p>

              <p className="text-sm font-semibold text-slate-500">
                {formatDate(photo.photo_date || photo.created_at)}
              </p>
            </button>
          ))}

          {photos.length === 0 && (
            <Empty title="Nessuna foto" text="Le foto compariranno qui." />
          )}
        </div>
      </Card>
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
    }
  }, [open, plan?.id, day?.id]);

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

  const progressText = exercise
    ? `Esercizio ${exerciseIndex + 1}/${exercises.length} · Serie ${
        setIndex + 1
      }/${plannedSets.length}`
    : "";

  const progressPercentage = totalPlannedSets
    ? Math.round((completedSetKeys.length / totalPlannedSets) * 100)
    : 0;

  const targetParts = [
    `${plannedSets.length} serie`,
    `${currentSet?.target_reps || exercise?.reps || "reps libere"} reps`,
    showRpe ? `RPE ${currentSet?.target_rpe || exercise?.target_rpe}` : null,
    showRir ? `RIR ${currentSet?.target_rir || exercise?.target_rir}` : null,
    `recupero ${recoverySeconds}s`
  ].filter(Boolean);

  const historySessions = groupHistoryBySession(history).slice(0, 6);
  const historyAround90Days = findHistoryAroundDays(history, 90);

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

  function setCurrentExercise(index) {
    setExerciseIndex(index);
    setSetIndex(0);
    setResting(false);
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
    }
  }

  function closeCompletedWorkout() {
    if (onWorkoutSaved) onWorkoutSaved();
    onClose();
  }

  const currentSetNumber = currentSet?.set_number || setIndex + 1;
  const targetRepsText = currentSet?.target_reps || exercise?.reps || "Libere";
  const targetLoadText = currentSet?.target_load_kg || currentSet?.target_load_text || "Libero";
  const exerciseVideoUrl = exercise?.video_url || exercise?.exercise_media_library?.video_url || "";
  const exerciseImageUrl = exercise?.image_url || exercise?.exercise_media_library?.image_url || "";
  const safeRecoveryText = `${recoverySeconds || 90}\"`;

  function scrollToWorkoutPanel(id) {
    if (typeof document === "undefined") return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950 md:p-4">
      <div className="mx-auto flex h-[100dvh] max-h-[100dvh] max-w-6xl flex-col overflow-hidden bg-slate-50 shadow-2xl md:h-[calc(100dvh-2rem)] md:rounded-[2rem]">
        <div className="shrink-0 bg-[#07111f] px-4 pb-4 pt-[calc(0.9rem+env(safe-area-inset-top))] text-white md:px-5 md:pt-5">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black active:scale-[.96]"
              aria-label="Chiudi allenamento"
            >
              ‹
            </button>

            <div className="min-w-0 flex-1 text-center md:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-teal-300">
                Allenati
              </p>
              <h2 className="mt-1 truncate text-xl font-black md:text-3xl">
                {day.title || "Allenamento"}
              </h2>
              <p className="mt-1 truncate text-xs font-bold text-slate-300 md:text-sm">
                {plan.title} · {progressText}
              </p>
            </div>

            <div className="flex h-12 min-w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-300 px-3 text-sm font-black text-slate-950">
              {progressPercentage}%
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-300">
              <span>{completedSetKeys.length}/{totalPlannedSets} serie salvate</span>
              <span>{exercises.length} esercizi</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-teal-300 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[290px_1fr]">
          <aside className="hidden border-r border-slate-200 bg-white p-4 md:block md:overflow-y-auto">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Scheda completa
            </p>

            <div className="space-y-2">
              {exercises.map((item, index) => {
                const itemSets = plannedSetsForExercise(item);
                const itemCompleted = itemSets.filter((set) => {
                  const token = set.id || set.temp_id || `virtual-${set.set_number}`;
                  return completedSetKeys.includes(`${item.id}-${token}`);
                }).length;

                return (
                  <button
                    key={item.id || item.temp_id || index}
                    type="button"
                    onClick={() => setCurrentExercise(index)}
                    className={`w-full rounded-2xl px-3 py-3 text-left transition active:scale-[.98] ${
                      index === exerciseIndex
                        ? "bg-[#07111f] text-white shadow-lg"
                        : "bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <p className="truncate text-sm font-black">
                      {index + 1}. {item.exercise_name || "Esercizio"}
                    </p>
                    <p
                      className={`mt-1 text-xs font-bold ${
                        index === exerciseIndex ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {itemCompleted}/{itemSets.length} serie · {item.reps || itemSets[0]?.target_reps || "reps"}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto px-3 py-3 pb-[calc(7rem+env(safe-area-inset-bottom))] md:p-6">
            {finished ? (
              <Card className="p-5 md:p-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-300 text-slate-950">
                  <Check size={28} />
                </div>

                <div className="text-center">
                  <h3 className="mt-4 text-2xl font-black">
                    Allenamento completato
                  </h3>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Hai completato {completedSetKeys.length}/{totalPlannedSets} serie. Il coach potrà vedere carichi e reps{workoutUsesRpe ? ", RPE" : ""}{workoutUsesRir ? ", RIR" : ""}.
                  </p>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-3xl font-black text-slate-950">{exercises.length}</p>
                    <p className="text-xs font-black uppercase text-slate-400">Esercizi</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-3xl font-black text-slate-950">{completedSetKeys.length}</p>
                    <p className="text-xs font-black uppercase text-slate-400">Serie salvate</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 text-center">
                    <p className="text-3xl font-black text-slate-950">{progressPercentage}%</p>
                    <p className="text-xs font-black uppercase text-slate-400">Completamento</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <Label title="Difficoltà percepita">
                    <Select
                      value={feedback.difficulty}
                      onChange={(event) =>
                        setFeedback((prev) => ({ ...prev, difficulty: event.target.value }))
                      }
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
                        setFeedback((prev) => ({ ...prev, feeling: event.target.value }))
                      }
                    >
                      <option value="">Seleziona</option>
                      <option value="ottime">Ottime</option>
                      <option value="buone">Buone</option>
                      <option value="normali">Normali</option>
                      <option value="scarse">Scarse</option>
                    </Select>
                  </Label>
                </div>

                <div className="mt-3">
                  <Label title="Note finali per il coach">
                    <Textarea
                      value={feedback.notes}
                      onChange={(event) =>
                        setFeedback((prev) => ({ ...prev, notes: event.target.value }))
                      }
                      placeholder="Es. panca ok, squat pesante, fastidio spalla..."
                    />
                  </Label>
                </div>

                <Button
                  type="button"
                  onClick={closeCompletedWorkout}
                  className="mt-5 w-full bg-[#07111f] text-white"
                >
                  Chiudi allenamento
                </Button>
              </Card>
            ) : !exercise ? (
              <Empty title="Nessun esercizio" text="Questo allenamento non contiene esercizi." />
            ) : (
              <div className="space-y-4">
                <Card className="block border-none bg-white p-3 shadow-sm md:hidden">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Scheda completa
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        Tocca un esercizio per cambiare.
                      </p>
                    </div>
                    <Pill className="bg-[#07111f] text-white">{exercises.length} esercizi</Pill>
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
                    {exercises.map((item, index) => {
                      const itemSets = plannedSetsForExercise(item);
                      const itemCompleted = itemSets.filter((set) => {
                        const token = set.id || set.temp_id || `virtual-${set.set_number}`;
                        return completedSetKeys.includes(`${item.id}-${token}`);
                      }).length;

                      return (
                        <button
                          key={item.id || item.temp_id || index}
                          type="button"
                          onClick={() => setCurrentExercise(index)}
                          className={`min-w-[175px] rounded-2xl px-3 py-3 text-left active:scale-[.98] ${
                            index === exerciseIndex
                              ? "bg-[#07111f] text-white shadow-lg"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          <p className="truncate text-xs font-black">
                            {index + 1}. {item.exercise_name || "Esercizio"}
                          </p>
                          <p className="mt-1 text-[11px] font-bold opacity-80">
                            {itemCompleted}/{itemSets.length} serie
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {resting && (
                  <div className="sticky top-2 z-20">
                    <RestTimer seconds={recoverySeconds} autoStart prominent />
                  </div>
                )}

                <Card className="overflow-hidden border-none bg-white shadow-lg ring-1 ring-slate-200">
                  {exerciseImageUrl && (
                    <img
                      src={exerciseImageUrl}
                      alt={exercise.exercise_name || "Esercizio"}
                      className="h-44 w-full object-cover md:h-64"
                    />
                  )}

                  <div className="p-5 md:p-7">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 min-w-10 items-center justify-center rounded-2xl bg-red-50 text-lg font-black text-red-700">
                        {String.fromCharCode(65 + exerciseIndex)}.
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                          Esercizio {exerciseIndex + 1} di {exercises.length}
                        </p>
                        <h3 className="mt-1 text-2xl font-black leading-tight text-slate-950 md:text-4xl">
                          {exercise.exercise_name || "Esercizio"}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-2xl font-black text-slate-950">{plannedSets.length}</p>
                        <p className="mt-1 text-[11px] font-black uppercase text-slate-500">Serie</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-2xl font-black text-slate-950">{targetRepsText}</p>
                        <p className="mt-1 text-[11px] font-black uppercase text-slate-500">Reps</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-2xl font-black text-slate-950">{safeRecoveryText}</p>
                        <p className="mt-1 text-[11px] font-black uppercase text-slate-500">Rec.</p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (exerciseVideoUrl && typeof window !== "undefined") {
                            window.open(exerciseVideoUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        disabled={!exerciseVideoUrl}
                        className={`h-14 rounded-2xl text-sm font-black transition active:scale-[.98] ${
                          exerciseVideoUrl
                            ? "bg-red-700 text-white shadow-md"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {exerciseVideoUrl ? "Vedi esecuzione ▶" : "Video non inserito"}
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollToWorkoutPanel("tmfit-storico-carichi")}
                        className="h-14 rounded-2xl border-2 border-red-700 bg-white text-sm font-black text-red-700 transition active:scale-[.98]"
                      >
                        Vai allo storico pesi
                      </button>
                    </div>

                    <div className="mt-5 rounded-3xl bg-[#07111f] p-4 text-white">
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Serie attuale</p>
                          <p className="mt-1 text-xl font-black">{currentSetNumber}/{plannedSets.length}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Target carico</p>
                          <p className="mt-1 text-xl font-black">{targetLoadText}</p>
                        </div>
                        {showRpe && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">RPE</p>
                            <p className="mt-1 text-xl font-black">{currentSet?.target_rpe || exercise?.target_rpe}</p>
                          </div>
                        )}
                        {showRir && (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">RIR</p>
                            <p className="mt-1 text-xl font-black">{currentSet?.target_rir || exercise?.target_rir}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {(exercise.notes || exercise.execution_mode) && (
                      <div id="tmfit-note-coach" className="mt-5 rounded-3xl bg-amber-50 p-4">
                        <p className="text-lg font-black text-slate-950">Note coach</p>
                        {exercise.notes && (
                          <p className="mt-2 text-sm font-bold leading-6 text-amber-950">
                            • {exercise.notes}
                          </p>
                        )}
                        {exercise.execution_mode && (
                          <p className="mt-2 text-sm font-bold leading-6 text-teal-900">
                            Esecuzione: {exercise.execution_mode}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="border-none bg-white p-5 shadow-lg ring-1 ring-slate-200">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                        Serie {currentSetNumber}
                      </p>
                      <h4 className="text-2xl font-black text-slate-950">Registra risultato</h4>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        Compila kg e ripetizioni. RPE/RIR compaiono solo se inseriti dal coach.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <button
                        type="button"
                        onClick={applyLastSet}
                        disabled={!lastHistory}
                        className="rounded-2xl bg-[#07111f] px-4 py-3 text-xs font-black text-white disabled:opacity-40"
                      >
                        Usa ultimo
                      </button>

                      <button
                        type="button"
                        onClick={applyTargetSet}
                        className="rounded-2xl bg-teal-300 px-4 py-3 text-xs font-black text-slate-950"
                      >
                        Usa target
                      </button>
                    </div>
                  </div>

                  <div
                    className={`mt-5 grid gap-3 ${
                      showRpe && showRir
                        ? "md:grid-cols-4"
                        : showRpe || showRir
                        ? "md:grid-cols-3"
                        : "md:grid-cols-2"
                    }`}
                  >
                    <Label title="Peso kg">
                      <Input
                        inputMode="decimal"
                        value={draft.load_kg || ""}
                        onChange={(event) => updateDraft(draftKey, "load_kg", event.target.value)}
                        placeholder="es. 80"
                        className="h-14 text-center text-lg"
                      />
                    </Label>

                    <Label title="Ripetizioni">
                      <Input
                        inputMode="numeric"
                        value={draft.reps_done || ""}
                        onChange={(event) => updateDraft(draftKey, "reps_done", event.target.value)}
                        placeholder="es. 10"
                        className="h-14 text-center text-lg"
                      />
                    </Label>

                    {showRpe && (
                      <Label title="RPE">
                        <Input
                          inputMode="decimal"
                          value={draft.rpe || ""}
                          onChange={(event) => updateDraft(draftKey, "rpe", event.target.value)}
                          placeholder="es. 8"
                          className="h-14 text-center text-lg"
                        />
                      </Label>
                    )}

                    {showRir && (
                      <Label title="RIR">
                        <Input
                          inputMode="decimal"
                          value={draft.rir || ""}
                          onChange={(event) => updateDraft(draftKey, "rir", event.target.value)}
                          placeholder="es. 2"
                          className="h-14 text-center text-lg"
                        />
                      </Label>
                    )}
                  </div>

                  <div className="mt-3">
                    <Label title="Note serie">
                      <Input
                        value={draft.notes || ""}
                        onChange={(event) => updateDraft(draftKey, "notes", event.target.value)}
                        placeholder="Facoltativo"
                      />
                    </Label>
                  </div>
                </Card>

                <div id="tmfit-storico-carichi" className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                  <Card className="border-none bg-white p-5 shadow-lg ring-1 ring-slate-200">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                          Storico pesi
                        </p>
                        <h4 className="text-2xl font-black text-slate-950">Carichi precedenti</h4>
                      </div>
                      <Pill className="bg-slate-100 text-slate-700">{history.length} serie</Pill>
                    </div>

                    {lastHistory ? (
                      <div className="mt-4 space-y-3">
                        <div className="rounded-3xl bg-[#07111f] p-4 text-white">
                          <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-300">Ultima volta</p>
                          <p className="mt-1 text-2xl font-black">{metricText(lastHistory)}</p>
                          <p className="text-xs font-bold text-slate-300">
                            {formatDate(lastHistory.workout_sessions?.session_date || lastHistory.created_at)} · {relativeDateText(lastHistory)}
                          </p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {bestHistory && (
                            <div className="rounded-3xl bg-teal-50 p-4">
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">Miglior serie</p>
                              <p className="mt-1 text-lg font-black text-teal-950">{metricText(bestHistory)}</p>
                              <p className="text-xs font-bold text-teal-800">
                                {formatDate(bestHistory.workout_sessions?.session_date || bestHistory.created_at)}
                              </p>
                            </div>
                          )}

                          {historyAround90Days && (
                            <div className="rounded-3xl bg-amber-50 p-4">
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Circa 3 mesi fa</p>
                              <p className="mt-1 text-lg font-black text-amber-950">{metricText(historyAround90Days.item)}</p>
                              <p className="text-xs font-bold text-amber-800">
                                {formatDate(historyAround90Days.item.workout_sessions?.session_date || historyAround90Days.item.created_at)} · {historyAround90Days.days} giorni fa
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        Nessuno storico trovato per questo esercizio.
                      </p>
                    )}
                  </Card>

                  <Card className="border-none bg-white p-5 shadow-lg ring-1 ring-slate-200">
                    <h4 className="text-2xl font-black text-slate-950">Sedute precedenti</h4>
                    <div className="mt-3 space-y-2">
                      {historySessions.map((sessionGroup) => (
                        <div key={sessionGroup.key} className="rounded-2xl bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-slate-950">{formatDate(sessionGroup.date)}</p>
                            <p className="text-xs font-bold text-slate-500">{relativeDateText(sessionGroup.dateObject)}</p>
                          </div>
                          <p className="mt-1 text-xs font-bold leading-5 text-slate-600">
                            {sessionGroup.items.slice(0, 4).map(metricText).join("  |  ")}
                          </p>
                        </div>
                      ))}

                      {historySessions.length === 0 && (
                        <p className="text-sm font-semibold text-slate-500">
                          Le sedute precedenti compariranno qui.
                        </p>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {!finished && exercise && (
          <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:p-4">
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-2 md:grid-cols-[1fr_auto_auto]">
              {!resting ? (
                <Button
                  type="button"
                  onClick={saveCurrentSet}
                  disabled={saving}
                  className="min-h-14 bg-[#07111f] text-white"
                >
                  {saving ? "Salvataggio..." : "Salva serie e avvia recupero"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={goNext}
                  className="min-h-14 bg-teal-300 text-slate-950"
                >
                  Serie successiva
                </Button>
              )}

              <Button
                type="button"
                onClick={goNext}
                className="min-h-14 border border-slate-200 bg-white text-slate-700"
              >
                Salta
              </Button>

              <Button
                type="button"
                onClick={() => setFinished(true)}
                className="min-h-14 border border-slate-200 bg-white text-slate-700"
              >
                Termina
              </Button>
            </div>
          </div>
        )}
      </div>
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
    const { data: historyData, error: historyError } = await supabase
  .from("workout_set_logs")
  .select(
    "*, workout_exercises(exercise_name), workout_sessions!inner(client_id, session_date)"
  )
  .eq("workout_sessions.client_id", numericClientId)
  .order("created_at", { ascending: false })
  .limit(1000);

if (historyError) {
  console.warn(historyError.message);
} else {
  setLoadHistory(historyData || []);
}
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
  const latestCheckin = checkins[0] || null;
  const latestPhoto = photos[0] || null;
  const latestCheckinDays = daysSince(latestCheckin?.checkin_date || latestCheckin?.created_at);
  const latestPhotoDays = daysSince(latestPhoto?.photo_date || latestPhoto?.created_at);

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
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="sticky top-0 z-30 bg-[#07111f] px-4 py-3 text-white shadow-xl md:relative md:px-6 md:py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
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
            <p className="text-2xl font-black leading-none tracking-tight text-white">TMFIT</p>
            <p className="mt-1 max-w-[220px] truncate text-sm font-black text-slate-300 md:max-w-none">
              Area cliente
            </p>
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg transition hover:bg-white/15 active:scale-[.96]"
            aria-label="Apri menu"
          >
            <span className="block h-0.5 w-6 rounded bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 rounded bg-white" />
            <span className="mt-1.5 block h-0.5 w-6 rounded bg-white" />
          </button>
        </div>
      </header>

      <TopTabs tabs={clientTabs} active={activeTab} onChange={setActiveTab} />
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
      <main className="mx-auto max-w-6xl space-y-5 p-4 pb-28 md:p-6">
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
            {plans.map((plan) => (
              <Card key={plan.id} className="p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-2xl font-black">{plan.title}</h2>

                    {plan.goal && (
                      <p className="mt-1 text-sm font-bold text-teal-700">
                        {plan.goal}
                      </p>
                    )}

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Settimana corrente: {currentWeekNumber(plan)}
                    </p>
                  </div>

                  <Pill className="bg-teal-100 text-teal-700">
                    {plan.duration_weeks || 4} settimane
                  </Pill>
                </div>

                {plan.notes && (
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    {plan.notes}
                  </p>
                )}

                <div className="mt-5 space-y-5">
                  {plan.workout_weeks?.map((week) =>
                    week.workout_days?.map((day) => (
                      <details
                        key={day.id}
                        open
                        className="rounded-3xl bg-slate-50 p-4"
                      >
                        <summary className="cursor-pointer text-lg font-black">
                          {day.title}
                        </summary>
<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
  <p className="text-sm font-semibold text-slate-500">
    Avvia questo allenamento in modalità guidata.
  </p>

  <Button
    type="button"
    onClick={() =>
      setWorkoutPlayer({
        open: true,
        plan,
        day
      })
    }
    className="bg-[#07111f] text-white"
  >
    <Dumbbell size={17} className="mr-2" />
    Allenati
  </Button>
</div>

                        {day.notes && (
                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            {day.notes}
                          </p>
                        )}

                        <div className="mt-4 space-y-4">
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
const exerciseHistory = getExerciseHistory(exercise);
                              return (
                                <div
                                  key={exercise.id}
                                  className="rounded-2xl bg-white p-4"
                                >
                                  <div className="flex flex-col gap-4 md:flex-row md:items-start">
                                    <ExerciseMediaPreview
                                      media={exercise.exercise_media_library}
                                    />

                                    <div className="flex-1">
                                      <h4 className="text-lg font-black">
                                        {exercise.exercise_name}
                                      </h4>

                                      <p className="mt-1 text-sm font-bold text-slate-600">
                                        {targetSets || "—"} serie ·{" "}
                                        {targetReps || "—"} reps · recupero{" "}
                                        {targetRecovery}s
                                      </p>

                                      {progression && (
                                        <div className="mt-3 rounded-2xl bg-teal-50 p-3 text-sm font-bold text-teal-800">
                                          Target settimana{" "}
                                          {progression.week_number}:{" "}
                                          {progression.target_load_text ||
                                            progression.target_load_kg ||
                                            "carico libero"}{" "}
                                          · RPE{" "}
                                          {progression.target_rpe || "—"} · RIR{" "}
                                          {progression.target_rir || "—"}
                                          {progression.notes && (
                                            <p className="mt-1">
                                              Note: {progression.notes}
                                            </p>
                                          )}
                                        </div>
                                      )}

                                      {exercise.execution_mode && (
                                        <p className="mt-2 text-sm font-semibold text-slate-500">
                                          Esecuzione: {exercise.execution_mode}
                                        </p>
                                      )}

                                      {exercise.notes && (
                                        <p className="mt-1 text-sm font-semibold text-slate-500">
                                          Note: {exercise.notes}
                                        </p>
                                      )}

                                      <div className="mt-3 flex flex-wrap gap-2">
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
                                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black"
                                          >
                                            Immagine
                                          </a>
                                        )}
                                      </div>
                                          <ExerciseHistoryBox history={exerciseHistory} />
                                    </div>
                                  </div>

                                  <div className="mt-4 space-y-3">
                                    {exercise.workout_exercise_sets?.map(
                                      (set) => {
                                        const key = `${exercise.id}-${set.id}`;
                                        const draft = drafts[key] || {};

                                        return (
                                          <div
                                            key={set.id}
                                            className="rounded-2xl bg-slate-50 p-3"
                                          >
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                              <p className="font-black">
                                                Serie {set.set_number}
                                              </p>

                                              <Pill className="bg-white text-slate-700">
                                                Target {targetReps || "—"}
                                              </Pill>
                                            </div>

                                            <div className="grid gap-2 md:grid-cols-5">
                                              <Input
                                                type="number"
                                                placeholder="Kg"
                                                value={draft.load_kg || ""}
                                                onChange={(event) =>
                                                  updateDraft(
                                                    key,
                                                    "load_kg",
                                                    event.target.value
                                                  )
                                                }
                                              />

                                              <Input
                                                type="number"
                                                placeholder="Reps"
                                                value={draft.reps_done || ""}
                                                onChange={(event) =>
                                                  updateDraft(
                                                    key,
                                                    "reps_done",
                                                    event.target.value
                                                  )
                                                }
                                              />

                                              <Input
                                                type="number"
                                                placeholder="RPE"
                                                value={draft.rpe || ""}
                                                onChange={(event) =>
                                                  updateDraft(
                                                    key,
                                                    "rpe",
                                                    event.target.value
                                                  )
                                                }
                                              />

                                              <Input
                                                type="number"
                                                placeholder="RIR"
                                                value={draft.rir || ""}
                                                onChange={(event) =>
                                                  updateDraft(
                                                    key,
                                                    "rir",
                                                    event.target.value
                                                  )
                                                }
                                              />

                                              <Button
                                                onClick={() =>
                                                  saveSetLog(
                                                    plan,
                                                    day,
                                                    exercise,
                                                    set
                                                  )
                                                }
                                                className="bg-[#07111f] text-white"
                                              >
                                                Salva
                                              </Button>
                                            </div>

                                            <Input
                                              className="mt-2"
                                              placeholder="Note serie"
                                              value={draft.notes || ""}
                                              onChange={(event) =>
                                                updateDraft(
                                                  key,
                                                  "notes",
                                                  event.target.value
                                                )
                                              }
                                            />

                                            <div className="mt-3">
                                              <RestTimer
                                                seconds={targetRecovery}
                                              />
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </details>
                    ))
                  )}
                </div>
              </Card>
            ))}

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
                  <Label key={field} title={`${label} 1-10`}>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={checkinForm[field]}
                      onChange={(event) =>
                        setCheckinForm({
                          ...checkinForm,
                          [field]: event.target.value
                        })
                      }
                    />
                  </Label>
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
        )}

        {activeTab === "diet" && (
          <Card className="p-5">
            <h2 className="text-xl font-black">Dieta</h2>

            <div className="mt-4 space-y-3">
              {diets.map((diet) => (
                <div
                  key={diet.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black">{diet.title}</p>

                    <p className="text-sm font-semibold text-slate-500">
                      {diet.file_name}
                    </p>
                  </div>

                  <Button
                    onClick={() => openStorageFile("diets", diet.file_path)}
                    className="bg-[#07111f] text-white"
                  >
                    Apri dieta
                  </Button>
                </div>
              ))}

              {diets.length === 0 && (
                <Empty
                  title="Nessuna dieta"
                  text="Il coach non ha ancora caricato una dieta."
                />
              )}
            </div>
          </Card>
        )}

        {activeTab === "posts" && (
          <Card className="p-5">
            <h2 className="text-xl font-black">Bacheca coach</h2>

            <div className="mt-4 space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center gap-2">
                    <p className="font-black">{post.title}</p>

                    {post.is_pinned && (
                      <Pill className="bg-teal-100 text-teal-700">Fissato</Pill>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    {post.body}
                  </p>
                </div>
              ))}

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
  );
}
