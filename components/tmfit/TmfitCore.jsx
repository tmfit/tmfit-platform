"use client";

import { useEffect, useState } from "react";
import { LogOut, Timer, X } from "lucide-react";

export const LEGAL_VERSION = "tmfit-v1.0";
const APP_VERSION = "v4.7";
const APP_VERSION_LABEL = "TMFIT Pro v4.7";
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

export function Button({ children, className = "", type = "button", ...props }) {
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

export function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-[1.6rem] border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-300 ${className}`}
    />
  );
}
export function BuilderCellInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`h-10 w-full min-w-[72px] rounded-xl border border-slate-200 bg-white px-2 text-center text-sm font-black text-slate-950 outline-none transition focus:border-teal-300 focus:ring-2 focus:ring-teal-100 ${className}`}
    />
  );
}
export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-300 ${className}`}
    />
  );
}

export function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-teal-300 ${className}`}
    >
      {children}
    </select>
  );
}

export function Label({ title, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-400">
        {title}
      </span>
      {children}
    </label>
  );
}

export function Empty({ title, text }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
      <p className="font-black text-slate-800">{title}</p>
      {text && (
        <p className="mt-1 text-sm font-semibold text-slate-500">{text}</p>
      )}
    </div>
  );
}

export function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}
    >
      {children}
    </span>
  );
}
export function BrandLogo({
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
export function AppFooter({ role = "coach" }) {
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

export function SideDrawer({
  open,
  onClose,
  tabs,
  active,
  onChange,
  role = "coach",
  onLogout,
  userProfile
}) {  return (
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
        className={`fixed bottom-0 left-0 top-0 z-[80] w-[86%] max-w-sm transform bg-[#07111f] text-white shadow-2xl transition md:w-96 ${
          open ? "translate-x-0" : "-translate-x-full"
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

export function TopTabs({ tabs, active, onChange }) {
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

export function RestTimer({ seconds = 90, autoStart = false }) {
  const initialSeconds = Number(seconds) || 90;
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

 useEffect(() => {
  setRemaining(initialSeconds);
  setRunning(autoStart);
}, [initialSeconds, autoStart]);

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

  return (
    <div className="rounded-3xl bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-teal-600" />
          <span className="text-lg font-black text-slate-900">
            {minutes}:{String(secs).padStart(2, "0")}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="rounded-xl bg-[#07111f] px-3 py-2 text-xs font-black text-white"
          >
            Start
          </button>

          <button
            type="button"
            onClick={() => {
              setRunning(false);
              setRemaining(initialSeconds);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black"
          >
            Reset
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

export function LoginScreen({ supabase }) {
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

export function LegalAcceptanceScreen({ session, onAccepted, onLogout }) {
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
