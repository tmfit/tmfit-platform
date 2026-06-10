"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  Camera,
  ClipboardCheck,
  Dumbbell,
  FileText,
  HomeIcon,
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

const today = () => new Date().toISOString().slice(0, 10);
const clone = (value) => JSON.parse(JSON.stringify(value));
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

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
    workout_weeks: sortByOrder(plan.workout_weeks || [], "week_number").map((week) => ({
      ...week,
      workout_days: sortByOrder(week.workout_days || []).map((day) => ({
        ...day,
        workout_blocks: sortByOrder(day.workout_blocks || []).map((block) => ({
          ...block,
          workout_exercises: sortByOrder(block.workout_exercises || []).map((exercise) => ({
            ...exercise,
            workout_exercise_sets: sortByOrder(
              exercise.workout_exercise_sets || [],
              "set_number"
            )
          }))
        }))
      }))
    }))
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
    <section className={`rounded-[1.6rem] border border-slate-200 bg-white shadow-sm ${className}`}>
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
      {text && <p className="mt-1 text-sm font-semibold text-slate-500">{text}</p>}
    </div>
  );
}

function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${className}`}>
      {children}
    </span>
  );
}

function TopTabs({ tabs, active, onChange }) {
  return (
    <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-xl md:px-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${
              active === tab.id
                ? "bg-[#07111f] text-white"
                : "border border-slate-200 bg-white text-slate-700"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
            <div className="text-4xl font-black tracking-tight">TM FIT</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-teal-300">
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
              className="h-13 w-full bg-teal-300 text-slate-950 hover:bg-teal-200"
            >
              {loading ? "Accesso..." : "Accedi"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function createDefaultBuilder() {
  return {
    title: "Programma allenamento",
    goal: "",
    notes: "",
    start_date: today(),
    end_date: "",
    duration_weeks: 4,
    level: "intermedio",
    location: "palestra",
    weeks: [
      {
        temp_id: uid(),
        week_number: 1,
        title: "Settimana 1",
        goal: "",
        notes: "",
        days: [
          {
            temp_id: uid(),
            title: "Allenamento A",
            day_type: "training",
            estimated_minutes: 60,
            notes: "",
            blocks: [
              {
                temp_id: uid(),
                title: "Blocco principale",
                block_type: "normal",
                instructions: "",
                exercises: [
                  {
                    temp_id: uid(),
                    exercise_name: "",
                    exercise_type: "normal",
                    execution_mode: "Controllata",
                    tracking_type: "load_reps",
                    target_load: "",
                    target_rpe: "",
                    target_rir: "",
                    tempo: "",
                    recovery_seconds: 90,
                    weekly_progression: "",
                    video_url: "",
                    image_url: "",
                    substitution: "",
                    coach_cues: "",
                    notes: "",
                    sets: [
                      {
                        temp_id: uid(),
                        set_number: 1,
                        target_reps: "8-10",
                        target_load_kg: "",
                        target_rpe: "",
                        target_rir: "",
                        rest_seconds: 90,
                        notes: ""
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
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
            Controlla le variabili NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
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
            L’utente esiste in Supabase Auth, ma manca la riga nella tabella profiles.
          </p>
          <Button onClick={handleLogout} className="mt-5 bg-[#07111f] text-white">
            Esci
          </Button>
        </Card>
      </div>
    );
  }

  if (profile.role === "professional") {
    return <ProfessionalDashboard session={session} onLogout={handleLogout} />;
  }

  return <ClientDashboard session={session} onLogout={handleLogout} />;
}
function ProfessionalDashboard({ session, onLogout }) {
  const [activeTab, setActiveTab] = usePersistedState("tmfit_pro_tab", "clients");
  const [selectedClientId, setSelectedClientId] = usePersistedState("tmfit_selected_client", "");
  const [clients, setClients] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const [plans, setPlans] = useState([]);
  const [logs, setLogs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [diets, setDiets] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [privateNotes, setPrivateNotes] = useState([]);
  const [posts, setPosts] = useState([]);

  const [credentials, setCredentials] = useState(null);
  const [creatingClient, setCreatingClient] = useState(false);
  const [clientError, setClientError] = useState("");
  const [deletingClient, setDeletingClient] = useState(false);

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

  const [builder, setBuilder] = useState(createDefaultBuilder());
  const [savingPlan, setSavingPlan] = useState(false);

  const [dietForm, setDietForm] = useState({ title: "", start_date: "", end_date: "", notes: "" });
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

  const [noteForm, setNoteForm] = useState({ title: "", note_type: "general", body: "" });
  const [postForm, setPostForm] = useState({ title: "", body: "", client_scope: "selected", is_pinned: false });

  const selectedClient =
    clients.find((client) => String(client.id) === String(selectedClientId)) || null;

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const haystack = `${fullName(client)} ${client.email || ""} ${client.goal || ""}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [clients, query]);

  const professionalTabs = [
    { id: "clients", label: "Clienti", icon: <Users size={17} /> },
    { id: "programs", label: "Programmi", icon: <Dumbbell size={17} /> },
    { id: "monitor", label: "Monitor", icon: <Activity size={17} /> },
    { id: "measurements", label: "Misure", icon: <Scale size={17} /> },
    { id: "diets", label: "Diete", icon: <FileText size={17} /> },
    { id: "posts", label: "Bacheca", icon: <Megaphone size={17} /> }
  ];

  useEffect(() => {
    loadClients();
    loadPosts();
  }, []);

  useEffect(() => {
    if (selectedClient) loadClientBundle(selectedClient.id);
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
    if (rows.length && !selectedClientId) setSelectedClientId(String(rows[0].id));
    setLoading(false);
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
                workout_exercise_sets (*)
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
      .select("*, workout_exercises(exercise_name), workout_sessions!inner(client_id, session_date)")
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

  async function createClient(event) {
    event.preventDefault();
    setClientError("");
    setCredentials(null);
    setCreatingClient(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        setClientError("Sessione non valida. Esci e rientra con il login professionista.");
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

      setCredentials({ email: result.login_email, password: result.temporary_password });
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
      setClientError(error.message || "Errore imprevisto durante la creazione cliente.");
    } finally {
      setCreatingClient(false);
    }
  }

  async function deleteSelectedClient() {
    if (!selectedClient) return;

    const confirmed = window.confirm(
      `Vuoi davvero eliminare ${fullName(selectedClient)}? Verranno eliminati login, schede, log, diete, check-in, foto e misurazioni.`
    );
    if (!confirmed) return;

    setDeletingClient(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
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
      setSelectedClientId(remainingClients[0]?.id ? String(remainingClients[0].id) : "");
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

  function updateBuilder(mutator) {
    setBuilder((prev) => {
      const next = clone(prev);
      mutator(next);
      return next;
    });
  }

  function addWeek() {
    updateBuilder((next) => {
      const number = next.weeks.length + 1;
      const week = createDefaultBuilder().weeks[0];
      week.temp_id = uid();
      week.week_number = number;
      week.title = `Settimana ${number}`;
      week.days[0].temp_id = uid();
      week.days[0].blocks[0].temp_id = uid();
      week.days[0].blocks[0].exercises[0].temp_id = uid();
      week.days[0].blocks[0].exercises[0].sets[0].temp_id = uid();
      next.weeks.push(week);
    });
  }

  function duplicatePreviousWeek() {
    updateBuilder((next) => {
      const source = next.weeks[next.weeks.length - 1];
      const copy = clone(source);
      copy.temp_id = uid();
      copy.week_number = next.weeks.length + 1;
      copy.title = `Settimana ${copy.week_number}`;
      copy.days.forEach((day) => {
        day.temp_id = uid();
        day.blocks.forEach((block) => {
          block.temp_id = uid();
          block.exercises.forEach((exercise) => {
            exercise.temp_id = uid();
            exercise.sets.forEach((set) => {
              set.temp_id = uid();
            });
          });
        });
      });
      next.weeks.push(copy);
      next.duration_weeks = next.weeks.length;
    });
  }

  function addDay(weekIndex) {
    updateBuilder((next) => {
      const dayNumber = next.weeks[weekIndex].days.length + 1;
      const day = createDefaultBuilder().weeks[0].days[0];
      day.temp_id = uid();
      day.title = `Allenamento ${String.fromCharCode(64 + dayNumber)}`;
      day.blocks[0].temp_id = uid();
      day.blocks[0].exercises[0].temp_id = uid();
      day.blocks[0].exercises[0].sets[0].temp_id = uid();
      next.weeks[weekIndex].days.push(day);
    });
  }

  function addBlock(weekIndex, dayIndex) {
    updateBuilder((next) => {
      const block = createDefaultBuilder().weeks[0].days[0].blocks[0];
      block.temp_id = uid();
      block.title = `Blocco ${next.weeks[weekIndex].days[dayIndex].blocks.length + 1}`;
      block.exercises[0].temp_id = uid();
      block.exercises[0].sets[0].temp_id = uid();
      next.weeks[weekIndex].days[dayIndex].blocks.push(block);
    });
  }

  function addExercise(weekIndex, dayIndex, blockIndex) {
    updateBuilder((next) => {
      const exercise = createDefaultBuilder().weeks[0].days[0].blocks[0].exercises[0];
      exercise.temp_id = uid();
      exercise.sets[0].temp_id = uid();
      next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises.push(exercise);
    });
  }

  function addSet(weekIndex, dayIndex, blockIndex, exerciseIndex) {
    updateBuilder((next) => {
      const sets = next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].sets;
      sets.push({
        temp_id: uid(),
        set_number: sets.length + 1,
        target_reps: "8-10",
        target_load_kg: "",
        target_rpe: "",
        target_rir: "",
        rest_seconds: 90,
        notes: ""
      });
    });
  }

  function removeWeek(weekIndex) {
    updateBuilder((next) => {
      if (next.weeks.length > 1) next.weeks.splice(weekIndex, 1);
      next.weeks.forEach((week, index) => {
        week.week_number = index + 1;
        week.title = week.title || `Settimana ${index + 1}`;
      });
      next.duration_weeks = next.weeks.length;
    });
  }

  function removeDay(weekIndex, dayIndex) {
    updateBuilder((next) => {
      if (next.weeks[weekIndex].days.length > 1) {
        next.weeks[weekIndex].days.splice(dayIndex, 1);
      }
    });
  }

  function removeBlock(weekIndex, dayIndex, blockIndex) {
    updateBuilder((next) => {
      if (next.weeks[weekIndex].days[dayIndex].blocks.length > 1) {
        next.weeks[weekIndex].days[dayIndex].blocks.splice(blockIndex, 1);
      }
    });
  }

  function removeExercise(weekIndex, dayIndex, blockIndex, exerciseIndex) {
    updateBuilder((next) => {
      const exercises = next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises;
      if (exercises.length > 1) exercises.splice(exerciseIndex, 1);
    });
  }

  function removeSet(weekIndex, dayIndex, blockIndex, exerciseIndex, setIndex) {
    updateBuilder((next) => {
      const sets = next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].sets;
      if (sets.length > 1) sets.splice(setIndex, 1);
      sets.forEach((set, index) => {
        set.set_number = index + 1;
      });
    });
  }

  async function saveWorkoutPlan(event) {
    event.preventDefault();
    if (!selectedClient) {
      alert("Seleziona un cliente.");
      return;
    }

    const hasExercise = builder.weeks.some((week) =>
      week.days.some((day) =>
        day.blocks.some((block) => block.exercises.some((exercise) => exercise.exercise_name.trim()))
      )
    );

    if (!hasExercise) {
      alert("Inserisci almeno un esercizio.");
      return;
    }

    setSavingPlan(true);

    try {
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
          duration_weeks: Number(builder.duration_weeks) || builder.weeks.length,
          level: builder.level || null,
          location: builder.location || null,
          status: "active"
        })
        .select()
        .single();

      if (planError) throw planError;

      for (let weekIndex = 0; weekIndex < builder.weeks.length; weekIndex += 1) {
        const week = builder.weeks[weekIndex];
        const { data: weekRow, error: weekError } = await supabase
          .from("workout_weeks")
          .insert({
            plan_id: plan.id,
            week_number: Number(week.week_number) || weekIndex + 1,
            title: week.title || `Settimana ${weekIndex + 1}`,
            goal: week.goal || null,
            notes: week.notes || null,
            sort_order: weekIndex + 1
          })
          .select()
          .single();

        if (weekError) throw weekError;

        for (let dayIndex = 0; dayIndex < week.days.length; dayIndex += 1) {
          const day = week.days[dayIndex];
          const { data: dayRow, error: dayError } = await supabase
            .from("workout_days")
            .insert({
              plan_id: plan.id,
              week_id: weekRow.id,
              title: day.title || `Allenamento ${dayIndex + 1}`,
              day_type: day.day_type || "training",
              estimated_minutes: numberOrNull(day.estimated_minutes),
              notes: day.notes || null,
              sort_order: dayIndex + 1
            })
            .select()
            .single();

          if (dayError) throw dayError;

          for (let blockIndex = 0; blockIndex < day.blocks.length; blockIndex += 1) {
            const block = day.blocks[blockIndex];
            const { data: blockRow, error: blockError } = await supabase
              .from("workout_blocks")
              .insert({
                day_id: dayRow.id,
                title: block.title || `Blocco ${blockIndex + 1}`,
                block_type: block.block_type || "normal",
                instructions: block.instructions || null,
                sort_order: blockIndex + 1
              })
              .select()
              .single();

            if (blockError) throw blockError;

            for (let exerciseIndex = 0; exerciseIndex < block.exercises.length; exerciseIndex += 1) {
              const exercise = block.exercises[exerciseIndex];
              if (!exercise.exercise_name.trim()) continue;

              const firstSet = exercise.sets[0] || {};
              const { data: exerciseRow, error: exerciseError } = await supabase
                .from("workout_exercises")
                .insert({
                  day_id: dayRow.id,
                  block_id: blockRow.id,
                  exercise_name: exercise.exercise_name.trim(),
                  sets: String(exercise.sets.length),
                  reps: firstSet.target_reps || null,
                  recovery_seconds: Number(firstSet.rest_seconds || exercise.recovery_seconds) || 90,
                  execution_mode: exercise.execution_mode || null,
                  weekly_progression: exercise.weekly_progression || null,
                  video_url: exercise.video_url || null,
                  image_url: exercise.image_url || null,
                  notes: exercise.notes || null,
                  sort_order: exerciseIndex + 1,
                  exercise_type: exercise.exercise_type || "normal",
                  tracking_type: exercise.tracking_type || "load_reps",
                  target_load: exercise.target_load || null,
                  target_rpe: exercise.target_rpe || null,
                  target_rir: exercise.target_rir || null,
                  tempo: exercise.tempo || null,
                  substitution: exercise.substitution || null,
                  coach_cues: exercise.coach_cues || null,
                  is_active: true
                })
                .select()
                .single();

              if (exerciseError) throw exerciseError;

              const setRows = exercise.sets.map((set, setIndex) => ({
                workout_exercise_id: exerciseRow.id,
                set_number: setIndex + 1,
                target_reps: set.target_reps || null,
                target_load_kg: numberOrNull(set.target_load_kg),
                target_rpe: numberOrNull(set.target_rpe),
                target_rir: numberOrNull(set.target_rir),
                rest_seconds: Number(set.rest_seconds) || 90,
                notes: set.notes || null
              }));

              const { error: setsError } = await supabase
                .from("workout_exercise_sets")
                .insert(setRows);
              if (setsError) throw setsError;
            }
          }
        }
      }

      setBuilder(createDefaultBuilder());
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

    const { error: uploadError } = await supabase.storage.from("diets").upload(path, dietFile);
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

    setDietForm({ title: "", start_date: "", end_date: "", notes: "" });
    setDietFile(null);
    await loadClientBundle(selectedClient.id);
  }

  async function savePrivateNote(event) {
    event.preventDefault();
    if (!selectedClient) return;

    const { error } = await supabase.from("client_private_notes").insert({
      client_id: Number(selectedClient.id),
      professional_id: session.user.id,
      title: noteForm.title || "Nota coach",
      note_type: noteForm.note_type || "general",
      body: noteForm.body || null
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNoteForm({ title: "", note_type: "general", body: "" });
    await loadClientBundle(selectedClient.id);
  }

  async function savePost(event) {
    event.preventDefault();
    const clientScope = postForm.client_scope;
    const clientId = clientScope === "selected" && selectedClient ? Number(selectedClient.id) : null;

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

    setPostForm({ title: "", body: "", client_scope: "selected", is_pinned: false });
    await loadPosts();
  }

  async function openStorageFile(bucket, path) {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 120);
    if (error) {
      alert(error.message);
      return;
    }
    window.open(data.signedUrl, "_blank");
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
              <h2 className="mt-2 text-3xl font-black md:text-4xl">{fullName(selectedClient)}</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill className="bg-teal-300 text-slate-950">{selectedClient.status || "active"}</Pill>
                <Pill className="bg-white/10 text-white">{selectedClient.goal || "Obiettivo non impostato"}</Pill>
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

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="bg-[#07111f] px-4 py-5 text-white md:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">TM FIT</h1>
            <p className="text-sm font-bold text-slate-300">Area professionista · Webapp mobile-first</p>
          </div>
          <Button onClick={onLogout} className="border border-white/10 bg-white/10 text-white">
            <LogOut size={17} className="mr-2" />
            Esci
          </Button>
        </div>
      </header>

      <TopTabs tabs={professionalTabs} active={activeTab} onChange={setActiveTab} />

      <main className="mx-auto grid max-w-7xl gap-5 p-4 md:p-6 xl:grid-cols-[360px_1fr]">
        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={17} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cerca cliente"
                className="w-full bg-transparent text-sm font-bold outline-none"
              />
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(String(client.id))}
                  className={`w-full rounded-2xl border p-3 text-left ${
                    String(selectedClientId) === String(client.id)
                      ? "border-teal-300 bg-teal-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="font-black">{fullName(client)}</p>
                  <p className="mt-1 truncate text-xs font-bold text-slate-500">{client.email || "—"}</p>
                </button>
              ))}
              {!loading && filteredClients.length === 0 && <Empty title="Nessun cliente" text="Crea il primo cliente." />}
            </div>
          </Card>
        </aside>

        <section className="space-y-5">
          <SelectedClientHero />

          {activeTab === "clients" && (
            <div className="grid gap-5 lg:grid-cols-2">
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
                    <p className="text-sm font-black text-teal-800">Credenziali create</p>
                    <p className="mt-2 text-sm font-bold">Email: {credentials.email}</p>
                    <p className="text-sm font-bold">Password: {credentials.password}</p>
                  </div>
                )}

                <form onSubmit={createClient} className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      required
                      placeholder="Nome"
                      value={newClient.first_name}
                      onChange={(event) => setNewClient({ ...newClient, first_name: event.target.value })}
                    />
                    <Input
                      required
                      placeholder="Cognome"
                      value={newClient.last_name}
                      onChange={(event) => setNewClient({ ...newClient, last_name: event.target.value })}
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email cliente opzionale"
                    value={newClient.email}
                    onChange={(event) => setNewClient({ ...newClient, email: event.target.value })}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      placeholder="Telefono"
                      value={newClient.phone}
                      onChange={(event) => setNewClient({ ...newClient, phone: event.target.value })}
                    />
                    <Select
                      value={newClient.gender}
                      onChange={(event) => setNewClient({ ...newClient, gender: event.target.value })}
                    >
                      <option value="uomo">Uomo</option>
                      <option value="donna">Donna</option>
                      <option value="altro">Altro</option>
                    </Select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      type="date"
                      value={newClient.birth_date}
                      onChange={(event) => setNewClient({ ...newClient, birth_date: event.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Altezza cm"
                      value={newClient.height_cm}
                      onChange={(event) => setNewClient({ ...newClient, height_cm: event.target.value })}
                    />
                  </div>
                  <Input
                    placeholder="Obiettivo"
                    value={newClient.goal}
                    onChange={(event) => setNewClient({ ...newClient, goal: event.target.value })}
                  />
                  <Textarea
                    placeholder="Note interne"
                    value={newClient.notes}
                    onChange={(event) => setNewClient({ ...newClient, notes: event.target.value })}
                  />
                  <Button type="submit" disabled={creatingClient} className="w-full bg-[#07111f] text-white">
                    {creatingClient ? "Creazione..." : "Crea cliente e login"}
                  </Button>
                </form>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Panoramica</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-3xl font-black">{clients.length}</p>
                    <p className="text-xs font-bold text-slate-500">Clienti totali</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-3xl font-black">{plans.length}</p>
                    <p className="text-xs font-bold text-slate-500">Programmi cliente</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-3xl font-black">{checkins.length}</p>
                    <p className="text-xs font-bold text-slate-500">Check-in</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-3xl font-black">{logs.length}</p>
                    <p className="text-xs font-bold text-slate-500">Log set</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "programs" && (
            <div className="space-y-5">
              {!selectedClient && <Empty title="Seleziona un cliente" text="Poi crea il programma avanzato." />}

              {selectedClient && (
                <Card className="p-5">
                  <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-black">Builder programma avanzato</h2>
                      <p className="text-sm font-semibold text-slate-500">
                        Settimane → Giorni → Blocchi → Esercizi → Serie.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={addWeek} className="border border-slate-200 bg-white text-slate-900">
                        <Plus size={16} className="mr-2" /> Settimana
                      </Button>
                      <Button onClick={duplicatePreviousWeek} className="border border-slate-200 bg-white text-slate-900">
                        Duplica ultima
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={saveWorkoutPlan} className="space-y-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Label title="Titolo programma">
                        <Input
                          value={builder.title}
                          onChange={(event) => setBuilder({ ...builder, title: event.target.value })}
                        />
                      </Label>
                      <Label title="Obiettivo">
                        <Input
                          value={builder.goal}
                          onChange={(event) => setBuilder({ ...builder, goal: event.target.value })}
                          placeholder="Ipertrofia, forza, ricomposizione..."
                        />
                      </Label>
                      <Label title="Inizio">
                        <Input
                          type="date"
                          value={builder.start_date}
                          onChange={(event) => setBuilder({ ...builder, start_date: event.target.value })}
                        />
                      </Label>
                      <Label title="Fine">
                        <Input
                          type="date"
                          value={builder.end_date}
                          onChange={(event) => setBuilder({ ...builder, end_date: event.target.value })}
                        />
                      </Label>
                      <Label title="Livello">
                        <Select
                          value={builder.level}
                          onChange={(event) => setBuilder({ ...builder, level: event.target.value })}
                        >
                          <option value="principiante">Principiante</option>
                          <option value="intermedio">Intermedio</option>
                          <option value="avanzato">Avanzato</option>
                        </Select>
                      </Label>
                      <Label title="Luogo">
                        <Select
                          value={builder.location}
                          onChange={(event) => setBuilder({ ...builder, location: event.target.value })}
                        >
                          <option value="palestra">Palestra</option>
                          <option value="casa">Casa</option>
                          <option value="ibrido">Ibrido</option>
                        </Select>
                      </Label>
                    </div>
                    <Label title="Note programma">
                      <Textarea
                        value={builder.notes}
                        onChange={(event) => setBuilder({ ...builder, notes: event.target.value })}
                        placeholder="Indicazioni generali, focus tecnico, progressione..."
                      />
                    </Label>

                    {builder.weeks.map((week, weekIndex) => (
                      <div key={week.temp_id} className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="grid flex-1 gap-3 md:grid-cols-3">
                            <Label title="Settimana">
                              <Input
                                type="number"
                                value={week.week_number}
                                onChange={(event) =>
                                  updateBuilder((next) => {
                                    next.weeks[weekIndex].week_number = event.target.value;
                                  })
                                }
                              />
                            </Label>
                            <Label title="Titolo">
                              <Input
                                value={week.title}
                                onChange={(event) =>
                                  updateBuilder((next) => {
                                    next.weeks[weekIndex].title = event.target.value;
                                  })
                                }
                              />
                            </Label>
                            <Label title="Focus">
                              <Input
                                value={week.goal}
                                onChange={(event) =>
                                  updateBuilder((next) => {
                                    next.weeks[weekIndex].goal = event.target.value;
                                  })
                                }
                                placeholder="Accumulo / intensità / scarico"
                              />
                            </Label>
                          </div>
                          <Button onClick={() => removeWeek(weekIndex)} className="border border-red-200 bg-white text-red-600">
                            <X size={16} />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          {week.days.map((day, dayIndex) => (
                            <div key={day.temp_id} className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div className="grid flex-1 gap-3 md:grid-cols-3">
                                  <Label title="Giorno">
                                    <Input
                                      value={day.title}
                                      onChange={(event) =>
                                        updateBuilder((next) => {
                                          next.weeks[weekIndex].days[dayIndex].title = event.target.value;
                                        })
                                      }
                                    />
                                  </Label>
                                  <Label title="Tipo">
                                    <Select
                                      value={day.day_type}
                                      onChange={(event) =>
                                        updateBuilder((next) => {
                                          next.weeks[weekIndex].days[dayIndex].day_type = event.target.value;
                                        })
                                      }
                                    >
                                      <option value="training">Allenamento</option>
                                      <option value="cardio">Cardio</option>
                                      <option value="mobility">Mobility</option>
                                      <option value="rest">Riposo attivo</option>
                                    </Select>
                                  </Label>
                                  <Label title="Minuti stimati">
                                    <Input
                                      type="number"
                                      value={day.estimated_minutes}
                                      onChange={(event) =>
                                        updateBuilder((next) => {
                                          next.weeks[weekIndex].days[dayIndex].estimated_minutes = event.target.value;
                                        })
                                      }
                                    />
                                  </Label>
                                </div>
                                <div className="flex gap-2">
                                  <Button onClick={() => addBlock(weekIndex, dayIndex)} className="border border-slate-200 bg-white text-slate-900">
                                    <Plus size={16} className="mr-2" /> Blocco
                                  </Button>
                                  <Button onClick={() => removeDay(weekIndex, dayIndex)} className="border border-red-200 bg-white text-red-600">
                                    <X size={16} />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {day.blocks.map((block, blockIndex) => (
                                  <div key={block.temp_id} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                      <div className="grid flex-1 gap-3 md:grid-cols-2">
                                        <Label title="Blocco">
                                          <Input
                                            value={block.title}
                                            onChange={(event) =>
                                              updateBuilder((next) => {
                                                next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].title = event.target.value;
                                              })
                                            }
                                          />
                                        </Label>
                                        <Label title="Metodo">
                                          <Select
                                            value={block.block_type}
                                            onChange={(event) =>
                                              updateBuilder((next) => {
                                                next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].block_type = event.target.value;
                                              })
                                            }
                                          >
                                            <option value="normal">Normale</option>
                                            <option value="superset">Superset</option>
                                            <option value="circuit">Circuito</option>
                                            <option value="rest_pause">Rest pause</option>
                                            <option value="drop_set">Drop set</option>
                                          </Select>
                                        </Label>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button onClick={() => addExercise(weekIndex, dayIndex, blockIndex)} className="border border-slate-200 bg-white text-slate-900">
                                          <Plus size={16} className="mr-2" /> Esercizio
                                        </Button>
                                        <Button onClick={() => removeBlock(weekIndex, dayIndex, blockIndex)} className="border border-red-200 bg-white text-red-600">
                                          <X size={16} />
                                        </Button>
                                      </div>
                                    </div>

                                    <Label title="Istruzioni blocco">
                                      <Textarea
                                        value={block.instructions}
                                        onChange={(event) =>
                                          updateBuilder((next) => {
                                            next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].instructions = event.target.value;
                                          })
                                        }
                                        placeholder="Esempio: esegui gli esercizi in superset, poi recupera 90 sec."
                                      />
                                    </Label>

                                    <div className="mt-4 space-y-4">
                                      {block.exercises.map((exercise, exerciseIndex) => (
                                        <div key={exercise.temp_id} className="rounded-[1.1rem] border border-slate-200 bg-white p-4">
                                          <div className="mb-3 flex items-center justify-between gap-2">
                                            <p className="font-black">Esercizio {exerciseIndex + 1}</p>
                                            <Button onClick={() => removeExercise(weekIndex, dayIndex, blockIndex, exerciseIndex)} className="border border-red-200 bg-white px-3 py-2 text-red-600">
                                              <X size={15} />
                                            </Button>
                                          </div>

                                          <div className="grid gap-3 md:grid-cols-2">
                                            <Label title="Nome esercizio">
                                              <Input
                                                required
                                                value={exercise.exercise_name}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].exercise_name = event.target.value;
                                                  })
                                                }
                                                placeholder="Panca piana bilanciere"
                                              />
                                            </Label>
                                            <Label title="Tipo esercizio">
                                              <Select
                                                value={exercise.exercise_type}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].exercise_type = event.target.value;
                                                  })
                                                }
                                                }
                                              >
                                                <option value="normal">Normale</option>
                                                <option value="warmup">Riscaldamento</option>
                                                <option value="technical">Tecnico</option>
                                                <option value="amrap">AMRAP</option>
                                                <option value="finisher">Finisher</option>
                                              </Select>
                                            </Label>
                                            <Label title="Tempo">
                                              <Input
                                                value={exercise.tempo}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].tempo = event.target.value;
                                                  })
                                                }
                                                placeholder="3-1-1"
                                              />
                                            </Label>
                                            <Label title="Esecuzione">
                                              <Input
                                                value={exercise.execution_mode}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].execution_mode = event.target.value;
                                                  })
                                                }
                                                placeholder="Controllata, esplosiva, fermo 1 sec..."
                                              />
                                            </Label>
                                            <Label title="Carico target">
                                              <Input
                                                value={exercise.target_load}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].target_load = event.target.value;
                                                  })
                                                }
                                                placeholder="70%, ultimo carico +2.5kg, libero..."
                                              />
                                            </Label>
                                            <Label title="RPE / RIR target">
                                              <Input
                                                value={exercise.target_rpe}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].target_rpe = event.target.value;
                                                  })
                                                }
                                                placeholder="RPE 8 / RIR 2"
                                              />
                                            </Label>
                                            <Label title="Link video">
                                              <Input
                                                value={exercise.video_url}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].video_url = event.target.value;
                                                  })
                                                }
                                                placeholder="https://..."
                                              />
                                            </Label>
                                            <Label title="Link foto">
                                              <Input
                                                value={exercise.image_url}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].image_url = event.target.value;
                                                  })
                                                }
                                                placeholder="https://..."
                                              />
                                            </Label>
                                          </div>

                                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                                            <Label title="Progressione settimanale">
                                              <Textarea
                                                value={exercise.weekly_progression}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].weekly_progression = event.target.value;
                                                  })
                                                }
                                                placeholder="Settimana 1 RPE 7, settimana 2 +2.5kg..."
                                              />
                                            </Label>
                                            <Label title="Cue / note tecniche">
                                              <Textarea
                                                value={exercise.coach_cues}
                                                onChange={(event) =>
                                                  updateBuilder((next) => {
                                                    next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].coach_cues = event.target.value;
                                                  })
                                                }
                                                placeholder="Scapole addotte, fermo al petto..."
                                              />
                                            </Label>
                                          </div>

                                          <div className="mt-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                              <p className="text-sm font-black uppercase tracking-wider text-slate-400">Serie</p>
                                              <Button onClick={() => addSet(weekIndex, dayIndex, blockIndex, exerciseIndex)} className="border border-slate-200 bg-white px-3 py-2 text-slate-900">
                                                <Plus size={15} className="mr-1" /> Serie
                                              </Button>
                                            </div>

                                            {exercise.sets.map((set, setIndex) => (
                                              <div key={set.temp_id} className="grid gap-2 rounded-2xl bg-slate-50 p-3 md:grid-cols-[80px_1fr_1fr_1fr_1fr_48px]">
                                                <Input
                                                  type="number"
                                                  value={set.set_number}
                                                  onChange={(event) =>
                                                    updateBuilder((next) => {
                                                      next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].sets[setIndex].set_number = event.target.value;
                                                    })
                                                  }
                                                />
                                                <Input
                                                  value={set.target_reps}
                                                  onChange={(event) =>
                                                    updateBuilder((next) => {
                                                      next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].sets[setIndex].target_reps = event.target.value;
                                                    })
                                                  }
                                                  placeholder="Reps"
                                                />
                                                <Input
                                                  type="number"
                                                  value={set.target_load_kg}
                                                  onChange={(event) =>
                                                    updateBuilder((next) => {
                                                      next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].sets[setIndex].target_load_kg = event.target.value;
                                                    })
                                                  }
                                                  placeholder="Kg target"
                                                />
                                                <Input
                                                  type="number"
                                                  value={set.target_rpe}
                                                  onChange={(event) =>
                                                    updateBuilder((next) => {
                                                      next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].sets[setIndex].target_rpe = event.target.value;
                                                    })
                                                  }
                                                  placeholder="RPE"
                                                />
                                                <Input
                                                  type="number"
                                                  value={set.rest_seconds}
                                                  onChange={(event) =>
                                                    updateBuilder((next) => {
                                                      next.weeks[weekIndex].days[dayIndex].blocks[blockIndex].exercises[exerciseIndex].sets[setIndex].rest_seconds = event.target.value;
                                                    })
                                                  }
                                                  placeholder="Rest"
                                                />
                                                <Button onClick={() => removeSet(weekIndex, dayIndex, blockIndex, exerciseIndex, setIndex)} className="border border-red-200 bg-white px-3 py-2 text-red-600">
                                                  <X size={15} />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <Button onClick={() => addDay(weekIndex)} className="mt-4 border border-slate-200 bg-white text-slate-900">
                                <Plus size={16} className="mr-2" /> Giorno
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <Button type="submit" disabled={savingPlan} className="w-full bg-[#07111f] text-white">
                      <Save size={17} className="mr-2" />
                      {savingPlan ? "Salvataggio..." : "Salva programma completo"}
                    </Button>
                  </form>
                </Card>
              )}

              <PlansList plans={plans} />
            </div>
          )}

          {activeTab === "monitor" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-xl font-black">Ultimi check-in</h2>
                <div className="mt-4 space-y-3">
                  {checkins.map((checkin) => (
                    <div key={checkin.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">{checkin.checkin_date}</p>
                        <Pill className="bg-slate-100 text-slate-700">Peso {checkin.weight_kg || "—"} kg</Pill>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        Energia {checkin.energy_level || "—"}/10 · Sonno {checkin.sleep_quality || "—"}/10 · Stress {checkin.stress_level || "—"}/10
                      </p>
                      {checkin.notes && <p className="mt-2 text-sm font-semibold text-slate-600">{checkin.notes}</p>}
                    </div>
                  ))}
                  {checkins.length === 0 && <Empty title="Nessun check-in" text="Il cliente non ha ancora compilato check-in." />}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Ultimi log allenamento</h2>
                <div className="mt-4 space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="rounded-2xl border border-slate-200 p-4">
                      <p className="font-black">{log.workout_exercises?.exercise_name || "Esercizio"}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {log.workout_sessions?.session_date || "—"} · set {log.set_number || "—"} · {log.load_kg || "—"} kg x {log.reps_done || "—"} · RPE {log.rpe || "—"}
                      </p>
                      {log.notes && <p className="mt-2 text-sm font-semibold text-slate-600">{log.notes}</p>}
                    </div>
                  ))}
                  {logs.length === 0 && <Empty title="Nessun log" text="Il cliente non ha ancora registrato carichi." />}
                </div>
              </Card>

              <Card className="p-5 lg:col-span-2">
                <h2 className="text-xl font-black">Foto progressi</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => openStorageFile("progress-photos", photo.file_path)}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
                    >
                      <Camera size={20} className="text-teal-600" />
                      <p className="mt-2 font-black">{photo.photo_type}</p>
                      <p className="text-sm font-semibold text-slate-500">{photo.photo_date}</p>
                    </button>
                  ))}
                  {photos.length === 0 && <Empty title="Nessuna foto" text="Le foto compariranno qui." />}
                </div>
              </Card>
            </div>
          )}
          {activeTab === "measurements" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-xl font-black">Misurazioni private</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Questa sezione è solo professionista.
                </p>

                <form onSubmit={saveMeasurement} className="mt-4 grid gap-3 md:grid-cols-2">
                  {Object.entries(measurementForm).map(([key, value]) => {
                    if (key === "notes") return null;

                    const label = key.replaceAll("_", " ");

                    return (
                      <Label key={key} title={label}>
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

                  <Button type="submit" className="bg-[#07111f] text-white md:col-span-2">
                    Salva misurazione
                  </Button>
                </form>
              </Card>

              <Card className="p-5">
                <h2 className="text-xl font-black">Storico misure</h2>

                <div className="mt-4 space-y-3">
                  {measurements.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
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
                    <Empty title="Nessuna misurazione" text="Inserisci la prima misurazione." />
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
                    onChange={(event) => setDietFile(event.target.files?.[0] || null)}
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
                    <div key={diet.id} className="rounded-2xl border border-slate-200 p-4">
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
                    <Empty title="Nessuna dieta" text="Carica il primo file dieta." />
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
                    <div key={post.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-center gap-2">
                        <p className="font-black">{post.title}</p>
                        {post.is_pinned && (
                          <Pill className="bg-teal-100 text-teal-700">Fissato</Pill>
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
                    <Empty title="Nessun messaggio" text="Pubblica il primo messaggio." />
                  )}
                </div>
              </Card>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function PlansList({ plans }) {
  return (
    <Card className="p-5">
      <h2 className="text-xl font-black">Programmi salvati</h2>

      <div className="mt-4 space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-3xl border border-slate-200 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-black">{plan.title}</h3>
                <p className="text-sm font-semibold text-slate-500">
                  {plan.goal || "Nessun obiettivo"}
                </p>
              </div>

              <Pill className="bg-teal-100 text-teal-700">
                {plan.status || "active"}
              </Pill>
            </div>

            <div className="mt-4 space-y-3">
              {plan.workout_weeks?.map((week) => (
                <details key={week.id} className="rounded-2xl bg-slate-50 p-4">
                  <summary className="cursor-pointer font-black">
                    {week.title || `Settimana ${week.week_number}`}
                  </summary>

                  <div className="mt-3 space-y-3">
                    {week.workout_days?.map((day) => (
                      <div key={day.id} className="rounded-2xl bg-white p-3">
                        <p className="font-black text-teal-700">{day.title}</p>

                        <div className="mt-2 space-y-2">
                          {day.workout_blocks?.map((block) => (
                            <div key={block.id}>
                              <p className="text-sm font-black text-slate-500">
                                {block.title}
                              </p>

                              {block.workout_exercises?.map((exercise) => (
                                <div
                                  key={exercise.id}
                                  className="mt-2 rounded-xl bg-slate-50 p-3 text-sm"
                                >
                                  <p className="font-black">{exercise.exercise_name}</p>

                                  <p className="font-semibold text-slate-500">
                                    {exercise.workout_exercise_sets?.length ||
                                      exercise.sets ||
                                      "—"}{" "}
                                    serie · recupero {exercise.recovery_seconds || "—"}s
                                  </p>
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
        ))}

        {plans.length === 0 && (
          <Empty title="Nessun programma" text="Crea il primo programma completo." />
        )}
      </div>
    </Card>
  );
}

function ClientDashboard({ session, onLogout }) {
  const [activeTab, setActiveTab] = usePersistedState("tmfit_client_tab", "home");
  const [client, setClient] = useState(null);
  const [plans, setPlans] = useState([]);
  const [diets, setDiets] = useState([]);
  const [posts, setPosts] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [sessionCache, setSessionCache] = useState({});
  const [checkinForm, setCheckinForm] = useState({
    checkin_date: today(),
    weight_kg: "",
    energy_level: 7,
    sleep_quality: 7,
    hunger_level: 5,
    stress_level: 5,
    digestion_level: 7,
    diet_adherence: 8,
    training_adherence: 8,
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
                workout_exercise_sets (*)
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
    const key = `${exercise.id}-${set.id}`;
    const draft = drafts[key] || {};

    const sessionId = await getOrCreateWorkoutSession(plan.id, day.id);

    if (!sessionId) return;

    const { error } = await supabase.from("workout_set_logs").insert({
      session_id: sessionId,
      workout_exercise_id: exercise.id,
      planned_set_id: set.id,
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
      return;
    }

    setDrafts((prev) => ({
      ...prev,
      [key]: {}
    }));

    alert("Serie salvata.");
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
      energy_level: 7,
      sleep_quality: 7,
      hunger_level: 5,
      stress_level: 5,
      digestion_level: 7,
      diet_adherence: 8,
      training_adherence: 8,
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

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="bg-[#07111f] px-4 py-5 text-white md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">TM FIT</h1>
            <p className="text-sm font-bold text-slate-300">Area cliente</p>
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

      <TopTabs tabs={clientTabs} active={activeTab} onChange={setActiveTab} />

      <main className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
        <Card className="overflow-hidden">
          <div className="bg-[#07111f] p-5 text-white md:p-6">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
              Benvenuto
            </p>

            <h2 className="mt-2 text-3xl font-black md:text-4xl">
              {client ? fullName(client) : "Cliente"}
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-300">
              Scheda, timer, carichi, dieta, check-in e progressi.
            </p>
          </div>
        </Card>

        {activeTab === "home" && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-5">
              <Dumbbell className="text-teal-600" />
              <p className="mt-3 text-3xl font-black">{plans.length}</p>
              <p className="text-sm font-bold text-slate-500">
                Programmi attivi
              </p>
            </Card>

            <Card className="p-5">
              <ClipboardCheck className="text-teal-600" />
              <p className="mt-3 text-3xl font-black">{checkins.length}</p>
              <p className="text-sm font-bold text-slate-500">
                Check-in inviati
              </p>
            </Card>

            <Card className="p-5">
              <FileText className="text-teal-600" />
              <p className="mt-3 text-3xl font-black">{diets.length}</p>
              <p className="text-sm font-bold text-slate-500">
                Diete disponibili
              </p>
            </Card>
          </div>
        )}

        {activeTab === "training" && (
          <div className="space-y-5">
            {plans.map((plan) => (
              <Card key={plan.id} className="p-5">
                <h2 className="text-2xl font-black">{plan.title}</h2>

                {plan.goal && (
                  <p className="mt-1 text-sm font-bold text-teal-700">
                    {plan.goal}
                  </p>
                )}

                {plan.notes && (
                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    {plan.notes}
                  </p>
                )}

                <div className="mt-5 space-y-5">
                  {plan.workout_weeks?.map((week) => (
                    <details
                      key={week.id}
                      open
                      className="rounded-3xl bg-slate-50 p-4"
                    >
                      <summary className="cursor-pointer text-lg font-black">
                        {week.title || `Settimana ${week.week_number}`}
                      </summary>

                      <div className="mt-4 space-y-4">
                        {week.workout_days?.map((day) => (
                          <div key={day.id} className="rounded-3xl bg-white p-4">
                            <h3 className="rounded-2xl bg-[#07111f] px-4 py-3 font-black text-white">
                              {day.title}
                            </h3>

                            {day.notes && (
                              <p className="mt-2 text-sm font-semibold text-slate-500">
                                {day.notes}
                              </p>
                            )}

                            <div className="mt-4 space-y-4">
                              {day.workout_blocks?.map((block) => (
                                <div
                                  key={block.id}
                                  className="rounded-2xl border border-slate-200 p-3"
                                >
                                  <p className="font-black text-teal-700">
                                    {block.title}
                                  </p>

                                  {block.instructions && (
                                    <p className="mt-1 text-sm font-semibold text-slate-500">
                                      {block.instructions}
                                    </p>
                                  )}

                                  <div className="mt-3 space-y-4">
                                    {block.workout_exercises?.map((exercise) => (
                                      <div
                                        key={exercise.id}
                                        className="rounded-2xl bg-slate-50 p-4"
                                      >
                                        <h4 className="text-lg font-black">
                                          {exercise.exercise_name}
                                        </h4>

                                        <p className="mt-1 text-sm font-bold text-slate-600">
                                          Tempo {exercise.tempo || "—"} · RPE{" "}
                                          {exercise.target_rpe || "—"} · Recupero{" "}
                                          {exercise.recovery_seconds || "—"}s
                                        </p>

                                        {exercise.coach_cues && (
                                          <p className="mt-2 text-sm font-semibold text-slate-500">
                                            Cue: {exercise.coach_cues}
                                          </p>
                                        )}

                                        {exercise.weekly_progression && (
                                          <div className="mt-3 rounded-2xl bg-teal-50 p-3 text-sm font-bold text-teal-800">
                                            Progressione:{" "}
                                            {exercise.weekly_progression}
                                          </div>
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

                                        <div className="mt-4 space-y-3">
                                          {exercise.workout_exercise_sets?.map(
                                            (set) => {
                                              const key = `${exercise.id}-${set.id}`;
                                              const draft = drafts[key] || {};

                                              return (
                                                <div
                                                  key={set.id}
                                                  className="rounded-2xl bg-white p-3"
                                                >
                                                  <div className="mb-2 flex items-center justify-between gap-3">
                                                    <p className="font-black">
                                                      Serie {set.set_number}
                                                    </p>

                                                    <Pill className="bg-slate-100 text-slate-700">
                                                      Target{" "}
                                                      {set.target_reps || "—"}
                                                    </Pill>
                                                  </div>

                                                  <div className="grid gap-2 md:grid-cols-5">
                                                    <Input
                                                      type="number"
                                                      placeholder="Kg"
                                                      value={
                                                        draft.load_kg || ""
                                                      }
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
                                                      value={
                                                        draft.reps_done || ""
                                                      }
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
                                                      seconds={
                                                        set.rest_seconds ||
                                                        exercise.recovery_seconds ||
                                                        90
                                                      }
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            }
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
                      </div>
                    </details>
                  ))}
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
      </main>
    </div>
  );
}
