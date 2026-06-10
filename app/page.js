"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  Dumbbell,
  FileText,
  LogOut,
  Plus,
  Save,
  Search,
  Timer,
  Upload,
  UserPlus
} from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300 ${className}`}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`min-h-24 rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300 ${className}`}
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={`rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300 ${className}`}
    >
      {children}
    </select>
  );
}

function fullName(client) {
  return (
    `${client?.first_name || ""} ${client?.last_name || ""}`.trim() ||
    "Cliente"
  );
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
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

    if (error) {
      setError(error.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(45,212,191,.15),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(56,199,189,.08),transparent_36%)]" />

      <div className="relative grid min-h-screen place-items-center p-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[.06] p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="mb-8 text-center">
            <div className="text-4xl font-black tracking-tight">TM FIT</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-teal-300">
              Training Platform
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-2xl border border-red-300 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-semibold outline-none"
              placeholder="Email"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-semibold outline-none"
              placeholder="Password"
            />

            <Button
              disabled={loading}
              className="h-12 w-full bg-teal-300 text-slate-950 hover:bg-teal-200"
            >
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </div>

          <p className="mt-6 text-center text-xs font-semibold leading-5 text-slate-400">
            Accesso separato per professionista e cliente.
          </p>
        </form>
      </div>
    </div>
  );
}

function RestTimer({ seconds = 90 }) {
  const initialSeconds = Number(seconds) || 90;

  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRemaining(initialSeconds);
    setRunning(false);
  }, [initialSeconds]);

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
    <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3">
      <Timer size={18} className="text-teal-600" />

      <span className="font-black text-slate-900">
        {minutes}:{String(secs).padStart(2, "0")}
      </span>

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

      if (error) {
        console.warn(error.message);
      }

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
            Controlla le variabili NEXT_PUBLIC_SUPABASE_URL e
            NEXT_PUBLIC_SUPABASE_ANON_KEY.
          </p>
        </Card>
      </div>
    );
  }

  if (loadingSession) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111f] text-white">
        Caricamento TMFIT...
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (loadingProfile) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#07111f] text-white">
        Caricamento profilo...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <Card className="max-w-xl p-8 text-center">
          <h1 className="text-2xl font-black">Profilo non configurato</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
            L’utente esiste in Supabase Auth, ma manca la riga nella tabella
            profiles.
          </p>

          <Button
            onClick={handleLogout}
            className="mt-5 bg-[#07111f] text-white"
          >
            Esci
          </Button>
        </Card>
      </div>
    );
  }

  if (profile.role === "professional") {
    return (
      <ProfessionalDashboard
        session={session}
        profile={profile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <ClientDashboard
      session={session}
      profile={profile}
      onLogout={handleLogout}
    />
  );
}

function ProfessionalDashboard({ session, onLogout }) {
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");

  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [diets, setDiets] = useState([]);

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

  const [credentials, setCredentials] = useState(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [clientError, setClientError] = useState("");

  const [planTitle, setPlanTitle] = useState("Scheda allenamento");
  const [dayTitle, setDayTitle] = useState("Allenamento A");
  const [planGoal, setPlanGoal] = useState("");
  const [planNotes, setPlanNotes] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  const [planRows, setPlanRows] = useState([
    {
      exercise_name: "",
      sets: "3",
      reps: "8-10",
      recovery_seconds: 90,
      execution_mode: "Controllata",
      weekly_progression: "",
      video_url: "",
      image_url: "",
      notes: ""
    }
  ]);

  const [dietTitle, setDietTitle] = useState("");
  const [dietFile, setDietFile] = useState(null);
  const [dietNotes, setDietNotes] = useState("");

  const filteredClients = useMemo(() => {
    return clients.filter((client) =>
      fullName(client).toLowerCase().includes(query.toLowerCase())
    );
  }, [clients, query]);

  const selectedClient =
    clients.find((client) => String(client.id) === String(selectedClientId)) ||
    null;

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      loadClientDetails(selectedClient.id);
    } else {
      setPlans([]);
      setLogs([]);
      setDiets([]);
    }
  }, [selectedClientId, clients]);

  async function loadClients() {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn(error.message);
      return;
    }

    setClients(data || []);

    if (data?.length && !selectedClientId) {
      setSelectedClientId(String(data[0].id));
    }
  }

  async function loadClientDetails(clientId) {
    const numericClientId = Number(clientId);

    const { data: planData, error: planError } = await supabase
      .from("workout_plans")
      .select(
        `
        *,
        workout_days (
          *,
          workout_exercises (*)
        )
      `
      )
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    if (planError) {
      console.warn(planError.message);
    }

    setPlans(planData || []);

    const { data: logData, error: logError } = await supabase
      .from("workout_logs")
      .select(
        `
        *,
        workout_exercises (
          exercise_name
        )
      `
      )
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    if (logError) {
      console.warn(logError.message);
    }

    setLogs(logData || []);

    const { data: dietData, error: dietError } = await supabase
      .from("diets")
      .select("*")
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    if (dietError) {
      console.warn(dietError.message);
    }

    setDiets(dietData || []);
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

      const text = await response.text();

      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        setClientError(
          "Risposta server non valida. Controlla che il file app/api/create-client/route.js esista ed è stato deployato."
        );
        return;
      }

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

  function addExerciseRow() {
    setPlanRows((prev) => [
      ...prev,
      {
        exercise_name: "",
        sets: "3",
        reps: "8-10",
        recovery_seconds: 90,
        execution_mode: "Controllata",
        weekly_progression: "",
        video_url: "",
        image_url: "",
        notes: ""
      }
    ]);
  }

  function updatePlanRow(index, field, value) {
    setPlanRows((prev) =>
      prev.map((row, currentIndex) =>
        currentIndex === index ? { ...row, [field]: value } : row
      )
    );
  }

  function removePlanRow(index) {
    setPlanRows((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index)
    );
  }

  async function saveWorkoutPlan(event) {
    event.preventDefault();

    if (!selectedClient) {
      alert("Seleziona un cliente.");
      return;
    }

    const validRows = planRows.filter((row) => row.exercise_name.trim());

    if (validRows.length === 0) {
      alert("Inserisci almeno un esercizio.");
      return;
    }

    setSavingPlan(true);

    const { data: plan, error: planError } = await supabase
      .from("workout_plans")
      .insert({
        client_id: Number(selectedClient.id),
        professional_id: session.user.id,
        title: planTitle || "Scheda allenamento",
        goal: planGoal || null,
        notes: planNotes || null
      })
      .select()
      .single();

    if (planError) {
      setSavingPlan(false);
      alert(planError.message);
      return;
    }

    const { data: day, error: dayError } = await supabase
      .from("workout_days")
      .insert({
        plan_id: plan.id,
        title: dayTitle || "Allenamento A",
        sort_order: 1
      })
      .select()
      .single();

    if (dayError) {
      setSavingPlan(false);
      alert(dayError.message);
      return;
    }

    const rowsToInsert = validRows.map((row, index) => ({
      day_id: day.id,
      exercise_name: row.exercise_name.trim(),
      sets: row.sets || null,
      reps: row.reps || null,
      recovery_seconds: Number(row.recovery_seconds) || 90,
      execution_mode: row.execution_mode || null,
      weekly_progression: row.weekly_progression || null,
      video_url: row.video_url || null,
      image_url: row.image_url || null,
      notes: row.notes || null,
      sort_order: index + 1
    }));

    const { error: exercisesError } = await supabase
      .from("workout_exercises")
      .insert(rowsToInsert);

    setSavingPlan(false);

    if (exercisesError) {
      alert(exercisesError.message);
      return;
    }

    setPlanRows([
      {
        exercise_name: "",
        sets: "3",
        reps: "8-10",
        recovery_seconds: 90,
        execution_mode: "Controllata",
        weekly_progression: "",
        video_url: "",
        image_url: "",
        notes: ""
      }
    ]);

    setPlanTitle("Scheda allenamento");
    setDayTitle("Allenamento A");
    setPlanGoal("");
    setPlanNotes("");

    await loadClientDetails(selectedClient.id);
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

    const { error: insertError } = await supabase.from("diets").insert({
      client_id: Number(selectedClient.id),
      professional_id: session.user.id,
      title: dietTitle || dietFile.name,
      file_name: dietFile.name,
      file_path: path,
      notes: dietNotes || null
    });

    if (insertError) {
      alert(insertError.message);
      return;
    }

    setDietTitle("");
    setDietFile(null);
    setDietNotes("");

    await loadClientDetails(selectedClient.id);
  }

  async function openDiet(diet) {
    const { data, error } = await supabase.storage
      .from("diets")
      .createSignedUrl(diet.file_path, 60);

    if (error) {
      alert(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black">TM FIT</h1>
            <p className="text-sm font-bold text-slate-500">
              Area professionista · Clienti · Schede · Diete · Log
            </p>
          </div>

          <Button
            onClick={onLogout}
            className="border border-slate-200 bg-white text-slate-900"
          >
            <LogOut size={17} className="mr-2" />
            Esci
          </Button>
        </div>
      </header>

      <main className="grid gap-6 p-6 xl:grid-cols-[380px_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca cliente..."
                className="w-full bg-transparent text-sm font-semibold outline-none"
              />
            </div>

            <div className="space-y-3">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(String(client.id))}
                  className={`w-full rounded-2xl border p-4 text-left ${
                    String(selectedClientId) === String(client.id)
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-black">{fullName(client)}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {client.goal || "Obiettivo non impostato"}
                  </p>
                  <p className="mt-2 text-xs font-bold text-slate-400">
                    Login: {client.email || "—"}
                  </p>
                </button>
              ))}

              {filteredClients.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm font-bold text-slate-500">
                  Nessun cliente trovato.
                </p>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <UserPlus className="text-teal-600" />
              <h2 className="text-xl font-black">Nuovo cliente</h2>
            </div>

            {clientError && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                {clientError}
              </div>
            )}

            {credentials && (
              <div className="mb-4 rounded-2xl border border-teal-200 bg-teal-50 p-4">
                <p className="text-sm font-black text-teal-800">
                  Credenziali cliente create
                </p>
                <p className="mt-2 text-sm font-bold">
                  Email: {credentials.email}
                </p>
                <p className="text-sm font-bold">
                  Password: {credentials.password}
                </p>
                <p className="mt-2 text-xs font-semibold text-teal-700">
                  Copiale ora e forniscile al cliente.
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

              <div className="grid gap-3 md:grid-cols-2">
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
              </div>

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
                disabled={creatingClient}
                className="w-full bg-[#07111f] text-white"
              >
                {creatingClient ? "Creazione..." : "Crea cliente e login"}
              </Button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          {!selectedClient ? (
            <Card className="grid min-h-[500px] place-items-center p-8 text-center">
              <div>
                <h2 className="text-2xl font-black">Seleziona un cliente</h2>
                <p className="mt-2 text-sm font-semibold text-slate-500">
                  Da qui potrai creare schede, caricare diete e vedere i log.
                </p>
              </div>
            </Card>
          ) : (
            <>
              <Card className="overflow-hidden">
                <div className="bg-[#07111f] p-6 text-white">
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
                    Scheda cliente
                  </p>
                  <h2 className="mt-2 text-4xl font-black">
                    {fullName(selectedClient)}
                  </h2>
                  <p className="mt-2 text-slate-300">
                    {selectedClient.goal || "Obiettivo non impostato"}
                  </p>
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Dumbbell className="text-teal-600" />
                  <h2 className="text-xl font-black">
                    Crea scheda allenamento
                  </h2>
                </div>

                <form onSubmit={saveWorkoutPlan} className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      value={planTitle}
                      onChange={(event) => setPlanTitle(event.target.value)}
                      placeholder="Titolo scheda"
                    />

                    <Input
                      value={dayTitle}
                      onChange={(event) => setDayTitle(event.target.value)}
                      placeholder="Allenamento A / B / C"
                    />
                  </div>

                  <Input
                    value={planGoal}
                    onChange={(event) => setPlanGoal(event.target.value)}
                    placeholder="Obiettivo della scheda"
                  />

                  <Textarea
                    value={planNotes}
                    onChange={(event) => setPlanNotes(event.target.value)}
                    placeholder="Note generali scheda"
                  />

                  <div className="space-y-4">
                    {planRows.map((row, index) => (
                      <div
                        key={index}
                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="font-black">Esercizio {index + 1}</p>

                          {planRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePlanRow(index)}
                              className="text-sm font-black text-red-600"
                            >
                              Rimuovi
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3">
                          <Input
                            required
                            value={row.exercise_name}
                            onChange={(event) =>
                              updatePlanRow(
                                index,
                                "exercise_name",
                                event.target.value
                              )
                            }
                            placeholder="Nome esercizio"
                          />

                          <div className="grid gap-3 md:grid-cols-4">
                            <Input
                              value={row.sets}
                              onChange={(event) =>
                                updatePlanRow(index, "sets", event.target.value)
                              }
                              placeholder="Serie"
                            />

                            <Input
                              value={row.reps}
                              onChange={(event) =>
                                updatePlanRow(index, "reps", event.target.value)
                              }
                              placeholder="Ripetizioni"
                            />

                            <Input
                              type="number"
                              value={row.recovery_seconds}
                              onChange={(event) =>
                                updatePlanRow(
                                  index,
                                  "recovery_seconds",
                                  event.target.value
                                )
                              }
                              placeholder="Recupero sec"
                            />

                            <Input
                              value={row.execution_mode}
                              onChange={(event) =>
                                updatePlanRow(
                                  index,
                                  "execution_mode",
                                  event.target.value
                                )
                              }
                              placeholder="Esecuzione"
                            />
                          </div>

                          <Input
                            value={row.weekly_progression}
                            onChange={(event) =>
                              updatePlanRow(
                                index,
                                "weekly_progression",
                                event.target.value
                              )
                            }
                            placeholder="Progressione settimanale opzionale"
                          />

                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              value={row.video_url}
                              onChange={(event) =>
                                updatePlanRow(
                                  index,
                                  "video_url",
                                  event.target.value
                                )
                              }
                              placeholder="Link video esecuzione opzionale"
                            />

                            <Input
                              value={row.image_url}
                              onChange={(event) =>
                                updatePlanRow(
                                  index,
                                  "image_url",
                                  event.target.value
                                )
                              }
                              placeholder="Link foto opzionale"
                            />
                          </div>

                          <Textarea
                            value={row.notes}
                            onChange={(event) =>
                              updatePlanRow(index, "notes", event.target.value)
                            }
                            placeholder="Note esercizio"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={addExerciseRow}
                      className="border border-slate-200 bg-white text-slate-900"
                    >
                      <Plus size={17} className="mr-2" />
                      Aggiungi esercizio
                    </Button>

                    <Button
                      disabled={savingPlan}
                      className="bg-[#07111f] text-white"
                    >
                      <Save size={17} className="mr-2" />
                      {savingPlan ? "Salvataggio..." : "Salva scheda"}
                    </Button>
                  </div>
                </form>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileText className="text-teal-600" />
                  <h2 className="text-xl font-black">Dieta cliente</h2>
                </div>

                <form onSubmit={uploadDiet} className="space-y-3">
                  <Input
                    value={dietTitle}
                    onChange={(event) => setDietTitle(event.target.value)}
                    placeholder="Titolo dieta"
                  />

                  <input
                    type="file"
                    onChange={(event) =>
                      setDietFile(event.target.files?.[0] || null)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold"
                  />

                  <Textarea
                    value={dietNotes}
                    onChange={(event) => setDietNotes(event.target.value)}
                    placeholder="Note dieta"
                  />

                  <Button className="bg-[#07111f] text-white">
                    <Upload size={17} className="mr-2" />
                    Carica dieta
                  </Button>
                </form>

                <div className="mt-5 space-y-3">
                  {diets.map((diet) => (
                    <div
                      key={diet.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
                    >
                      <div>
                        <p className="font-black">{diet.title}</p>
                        <p className="text-sm font-semibold text-slate-500">
                          {diet.file_name}
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={() => openDiet(diet)}
                        className="border border-slate-200 bg-white text-slate-900"
                      >
                        Apri
                      </Button>
                    </div>
                  ))}

                  {diets.length === 0 && (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                      Nessuna dieta caricata.
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Activity className="text-teal-600" />
                  <h2 className="text-xl font-black">Schede assegnate</h2>
                </div>

                <div className="space-y-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-3xl border border-slate-200 p-4"
                    >
                      <h3 className="text-lg font-black">{plan.title}</h3>

                      {plan.goal && (
                        <p className="mt-1 text-sm font-bold text-teal-700">
                          Obiettivo: {plan.goal}
                        </p>
                      )}

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {plan.notes || "Nessuna nota"}
                      </p>

                      <div className="mt-4 space-y-4">
                        {plan.workout_days?.map((day) => (
                          <div key={day.id}>
                            <p className="mb-2 font-black text-teal-700">
                              {day.title}
                            </p>

                            <div className="space-y-2">
                              {day.workout_exercises?.map((exercise) => (
                                <div
                                  key={exercise.id}
                                  className="rounded-2xl bg-slate-50 p-4"
                                >
                                  <p className="font-black">
                                    {exercise.exercise_name}
                                  </p>

                                  <p className="mt-1 text-sm font-bold text-slate-600">
                                    {exercise.sets} serie · {exercise.reps} reps
                                    · {exercise.recovery_seconds}s recupero
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-slate-500">
                                    {exercise.execution_mode}
                                  </p>

                                  {exercise.weekly_progression && (
                                    <p className="mt-2 rounded-xl bg-white p-3 text-sm font-bold text-slate-700">
                                      Progressione:{" "}
                                      {exercise.weekly_progression}
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
                                        Foto
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {plans.length === 0 && (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                      Nessuna scheda ancora assegnata.
                    </p>
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="mb-4 text-xl font-black">
                  Log carichi cliente
                </h2>

                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="font-black">
                        {log.workout_exercises?.exercise_name || "Esercizio"}
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-600">
                        {log.training_date} · settimana{" "}
                        {log.week_number || "—"}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        Carico: {log.load_kg ?? "—"} kg · Reps:{" "}
                        {log.reps_done ?? "—"} · RPE: {log.rpe ?? "—"}
                      </p>

                      {log.notes && (
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {logs.length === 0 && (
                    <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                      Nessun log inserito dal cliente.
                    </p>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function ClientDashboard({ session, onLogout }) {
  const [client, setClient] = useState(null);
  const [plans, setPlans] = useState([]);
  const [diets, setDiets] = useState([]);
  const [logDrafts, setLogDrafts] = useState({});

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

    const { data: planData, error: planError } = await supabase
      .from("workout_plans")
      .select(
        `
        *,
        workout_days (
          *,
          workout_exercises (*)
        )
      `
      )
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    if (planError) {
      console.warn(planError.message);
    }

    setPlans(planData || []);

    const { data: dietData, error: dietError } = await supabase
      .from("diets")
      .select("*")
      .eq("client_id", numericClientId)
      .order("created_at", { ascending: false });

    if (dietError) {
      console.warn(dietError.message);
    }

    setDiets(dietData || []);
  }

  function updateLogDraft(exerciseId, field, value) {
    setLogDrafts((prev) => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || {}),
        [field]: value
      }
    }));
  }

  async function saveExerciseLog(exerciseId) {
    if (!client) return;

    const draft = logDrafts[exerciseId] || {};

    const { error } = await supabase.from("workout_logs").insert({
      workout_exercise_id: exerciseId,
      client_id: Number(client.id),
      user_id: session.user.id,
      training_date: new Date().toISOString().slice(0, 10),
      week_number: numberOrNull(draft.week_number),
      load_kg: numberOrNull(draft.load_kg),
      reps_done: numberOrNull(draft.reps_done),
      rpe: numberOrNull(draft.rpe),
      notes: draft.notes || null
    });

    if (error) {
      alert(error.message);
      return;
    }

    setLogDrafts((prev) => ({
      ...prev,
      [exerciseId]: {}
    }));

    alert("Log salvato.");
  }

  async function openDiet(diet) {
    const { data, error } = await supabase.storage
      .from("diets")
      .createSignedUrl(diet.file_path, 60);

    if (error) {
      alert(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black">TM FIT</h1>
            <p className="text-sm font-bold text-slate-500">
              Area cliente · Scheda · Timer · Carichi · Dieta
            </p>
          </div>

          <Button
            onClick={onLogout}
            className="border border-slate-200 bg-white text-slate-900"
          >
            <LogOut size={17} className="mr-2" />
            Esci
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 p-6">
        <Card className="overflow-hidden">
          <div className="bg-[#07111f] p-6 text-white">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
              Benvenuto
            </p>

            <h2 className="mt-2 text-4xl font-black">
              {client ? fullName(client) : "Cliente"}
            </h2>

            <p className="mt-2 text-slate-300">
              Qui trovi scheda, dieta, timer recupero e log allenamento.
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 text-xl font-black">La tua dieta</h2>

          <div className="space-y-3">
            {diets.map((diet) => (
              <div
                key={diet.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4"
              >
                <div>
                  <p className="font-black">{diet.title}</p>
                  <p className="text-sm font-semibold text-slate-500">
                    {diet.file_name}
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={() => openDiet(diet)}
                  className="bg-[#07111f] text-white"
                >
                  Apri dieta
                </Button>
              </div>
            ))}

            {diets.length === 0 && (
              <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">
                Nessuna dieta caricata.
              </p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Dumbbell className="text-teal-600" />

                <div>
                  <h2 className="text-xl font-black">{plan.title}</h2>

                  {plan.goal && (
                    <p className="text-sm font-bold text-teal-700">
                      {plan.goal}
                    </p>
                  )}

                  {plan.notes && (
                    <p className="text-sm font-semibold text-slate-500">
                      {plan.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {plan.workout_days?.map((day) => (
                  <div key={day.id}>
                    <h3 className="mb-3 rounded-2xl bg-[#07111f] px-4 py-3 font-black text-white">
                      {day.title}
                    </h3>

                    <div className="space-y-4">
                      {day.workout_exercises?.map((exercise) => {
                        const draft = logDrafts[exercise.id] || {};

                        return (
                          <div
                            key={exercise.id}
                            className="rounded-3xl border border-slate-200 bg-white p-4"
                          >
                            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                              <div>
                                <h4 className="text-lg font-black">
                                  {exercise.exercise_name}
                                </h4>

                                <p className="mt-1 text-sm font-bold text-slate-600">
                                  {exercise.sets} serie · {exercise.reps} reps ·{" "}
                                  {exercise.recovery_seconds}s recupero
                                </p>

                                {exercise.execution_mode && (
                                  <p className="mt-2 text-sm font-semibold text-slate-500">
                                    Esecuzione: {exercise.execution_mode}
                                  </p>
                                )}

                                {exercise.weekly_progression && (
                                  <div className="mt-3 rounded-2xl bg-teal-50 p-3 text-sm font-bold text-teal-800">
                                    Progressione:{" "}
                                    {exercise.weekly_progression}
                                  </div>
                                )}

                                {exercise.notes && (
                                  <p className="mt-3 text-sm font-semibold text-slate-500">
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
                                      Video esecuzione
                                    </a>
                                  )}

                                  {exercise.image_url && (
                                    <a
                                      href={exercise.image_url}
                                      target="_blank"
                                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black"
                                    >
                                      Foto
                                    </a>
                                  )}
                                </div>
                              </div>

                              <RestTimer
                                seconds={exercise.recovery_seconds || 90}
                              />
                            </div>

                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                              <p className="mb-3 text-sm font-black uppercase tracking-widest text-slate-500">
                                Registra carico
                              </p>

                              <div className="grid gap-3 md:grid-cols-5">
                                <Input
                                  type="number"
                                  placeholder="Settimana"
                                  value={draft.week_number || ""}
                                  onChange={(event) =>
                                    updateLogDraft(
                                      exercise.id,
                                      "week_number",
                                      event.target.value
                                    )
                                  }
                                />

                                <Input
                                  type="number"
                                  placeholder="Kg"
                                  value={draft.load_kg || ""}
                                  onChange={(event) =>
                                    updateLogDraft(
                                      exercise.id,
                                      "load_kg",
                                      event.target.value
                                    )
                                  }
                                />

                                <Input
                                  type="number"
                                  placeholder="Reps fatte"
                                  value={draft.reps_done || ""}
                                  onChange={(event) =>
                                    updateLogDraft(
                                      exercise.id,
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
                                    updateLogDraft(
                                      exercise.id,
                                      "rpe",
                                      event.target.value
                                    )
                                  }
                                />

                                <Button
                                  type="button"
                                  onClick={() => saveExerciseLog(exercise.id)}
                                  className="bg-[#07111f] text-white"
                                >
                                  Salva
                                </Button>
                              </div>

                              <Input
                                placeholder="Note allenamento"
                                value={draft.notes || ""}
                                onChange={(event) =>
                                  updateLogDraft(
                                    exercise.id,
                                    "notes",
                                    event.target.value
                                  )
                                }
                                className="mt-3 w-full"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {plans.length === 0 && (
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-black">
                Nessuna scheda disponibile
              </h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Il professionista non ha ancora assegnato una scheda.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
