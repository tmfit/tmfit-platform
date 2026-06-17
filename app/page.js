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

function TopTabs({ tabs, active, onChange }) {
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
        <div className="grid grid-cols-6 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-black ${
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

  if (profile.role === "professional") {
    return <ProfessionalDashboard session={session} onLogout={handleLogout} />;
  }

  return <ClientDashboard session={session} onLogout={handleLogout} />;
}
function ProfessionalDashboard({ session, onLogout }) {
  const [activeTab, setActiveTab] = usePersistedState("tmfit_pro_tab", "clients");
  const [selectedClientId, setSelectedClientId] = usePersistedState(
    "tmfit_selected_client",
    ""
  );

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

    setLoading(false);
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
  .limit(300);

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

  function SelectedClientHero() {
    if (!selectedClient) return null;
const builderStats = getBuilderStats();
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

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <header className="sticky top-0 z-30 bg-[#07111f] px-4 py-4 text-white shadow-xl md:relative md:px-6 md:py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">TM FIT</h1>
            <p className="text-sm font-bold text-slate-300">
              Area professionista · Smart Builder V3
            </p>
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

      <main className="mx-auto grid max-w-7xl gap-5 p-4 pb-28 md:p-6 xl:grid-cols-[360px_1fr]">
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

                  <p className="mt-1 truncate text-xs font-bold text-slate-500">
                    {client.email || "—"}
                  </p>
                </button>
              ))}

              {!loading && filteredClients.length === 0 && (
                <Empty title="Nessun cliente" text="Crea il primo cliente." />
              )}
            </div>
          </Card>
        </aside>

        <section className="space-y-5">
          <SelectedClientHero />

          {activeTab === "clients" && (
            <div className="grid gap-5 lg:grid-cols-2">
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
/>   
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

                  <div className="grid gap-3 md:grid-cols-2">
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
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
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

                                  <Card className="p-5 lg:col-span-2">
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
            </div>
          )}

          {activeTab === "programs" && (
            <div className="space-y-5">
              {!selectedClient && (
                <Empty
                  title="Seleziona un cliente"
                  text="Poi crea il programma smart."
                />
              )}

              {selectedClient && (
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
      onClick={cancelProgramEditing}
      className="border border-slate-200 bg-white text-slate-700"
    >
      <X size={16} className="mr-2" />
      Annulla modifica
    </Button>
  )}

  <Button
    onClick={addWorkoutDay}
    className="border border-slate-200 bg-white text-slate-900"
  >
    <Plus size={16} className="mr-2" />
    Allenamento
  </Button>
  <Button
  onClick={() => onEditProgram(plan)}
  className="border border-teal-200 bg-teal-50 text-teal-700"
>
  Modifica
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
                    <div className="grid gap-3 md:grid-cols-3">
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

                          <div className="flex gap-2">
                            <Button
                              onClick={() => addExerciseRow(dayIndex)}
                              className="border border-slate-200 bg-white text-slate-900"
                            >
                              <Plus size={16} className="mr-2" />
                              Esercizio
                            </Button>

                            <Button
                              onClick={() => removeWorkoutDay(dayIndex)}
                              className="border border-red-200 bg-white text-red-600"
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                          <table className="w-[1320px] text-left text-sm">
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

        <td className="w-24 p-3">
          <Input
            type="text"
            inputMode="text"
            value={exercise.sets}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "sets",
                event.currentTarget.value
              )
            }
          />
        </td>

        <td className="w-28 p-3">
          <Input
            type="text"
            inputMode="text"
            value={exercise.reps}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "reps",
                event.currentTarget.value
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

        <td className="w-24 p-3">
          <Input
            type="text"
            inputMode="text"
            value={exercise.target_rpe}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "target_rpe",
                event.currentTarget.value
              )
            }
          />
        </td>

        <td className="w-24 p-3">
          <Input
            type="text"
            inputMode="text"
            value={exercise.target_rir}
            onChange={(event) =>
              updateExerciseField(
                dayIndex,
                exerciseIndex,
                "target_rir",
                event.currentTarget.value
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

        <td className="w-44 p-3">
          <div className="flex gap-2">
            <Button
              onClick={() => duplicateExerciseRow(dayIndex, exerciseIndex)}
              className="border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900"
            >
              Duplica
            </Button>

            <Button
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

                    <Button
                      type="submit"
                      disabled={savingPlan}
                      className="sticky bottom-4 z-10 w-full bg-[#07111f] text-white shadow-2xl"
                    >
                      <Save size={17} className="mr-2" />
                     {savingPlan
  ? editingProgramId
    ? "Aggiornamento..."
    : "Salvataggio..."
  : editingProgramId
    ? "Aggiorna programma"
    : "Salva programma smart"}
                    </Button>
                  </form>
                </Card>
              )}

                <TemplatesPanel
  templates={templates}
  savingTemplate={savingTemplate}
  deletingTemplateId={deletingTemplateId}
  onSaveTemplate={saveBuilderAsTemplate}
  onUseTemplate={useTemplateInBuilder}
  onDeleteTemplate={deleteTemplate}
/>
             <PlansList
  plans={plans}
  onDeleteProgram={deleteProgram}
  deletingProgramId={deletingProgramId}
  onUpdateProgramStatus={updateProgramStatus}
  updatingProgramId={updatingProgramId}
  onDuplicateProgram={duplicateProgramToBuilder}
  onEditProgram={editProgramInBuilder}
/>
            </div>
          )}
          {activeTab === "monitor" && (
            <div className="grid gap-5 lg:grid-cols-2">
              <Card className="p-5">
                <h2 className="text-xl font-black">Ultimi check-in</h2>

                <div className="mt-4 space-y-3">
                  {checkins.map((checkin) => (
                    <div
                      key={checkin.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-black">{checkin.checkin_date}</p>

                        <Pill className="bg-slate-100 text-slate-700">
                          Peso {checkin.weight_kg || "—"} kg
                        </Pill>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        Energia {checkin.energy_level || "—"}/10 · Sonno{" "}
                        {checkin.sleep_quality || "—"}/10 · Stress{" "}
                        {checkin.stress_level || "—"}/10
                      </p>

                      {checkin.notes && (
                        <p className="mt-2 text-sm font-semibold text-slate-600">
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
                <h2 className="text-xl font-black">Ultimi log allenamento</h2>

                <div className="mt-4 space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <p className="font-black">
                        {log.workout_exercises?.exercise_name || "Esercizio"}
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        {log.workout_sessions?.session_date || "—"} · set{" "}
                        {log.set_number || "—"} · {log.load_kg || "—"} kg x{" "}
                        {log.reps_done || "—"} · RPE {log.rpe || "—"}
                      </p>

                      {log.notes && (
                        <p className="mt-2 text-sm font-semibold text-slate-600">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}

                  {logs.length === 0 && (
                    <Empty
                      title="Nessun log"
                      text="Il cliente non ha ancora registrato carichi."
                    />
                  )}
                </div>
              </Card>

              <Card className="p-5 lg:col-span-2">
                <h2 className="text-xl font-black">Foto progressi</h2>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() =>
                        openStorageFile("progress-photos", photo.file_path)
                      }
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
                    >
                      <Camera size={20} className="text-teal-600" />

                      <p className="mt-2 font-black">{photo.photo_type}</p>

                      <p className="text-sm font-semibold text-slate-500">
                        {photo.photo_date}
                      </p>
                    </button>
                  ))}

                  {photos.length === 0 && (
                    <Empty title="Nessuna foto" text="Le foto compariranno qui." />
                  )}
                </div>
              </Card>
            </div>
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
    </div>
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
  privateNotes
}) {
  const activePlans = plans.filter((plan) => (plan.status || "active") === "active");
  const latestCheckin = checkins[0];
  const latestMeasurement = measurements[0];
  const latestSession = sessions[0];
  const latestLog = logs[0];

  if (!selectedClient) {
    return (
      <Card className="p-5">
        <Empty
          title="Seleziona un cliente"
          text="La dashboard cliente comparirà qui."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden lg:col-span-2">
      <div className="bg-[#07111f] p-5 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-300">
              Dashboard cliente
            </p>

            <h2 className="mt-2 text-2xl font-black md:text-3xl">
              {fullName(selectedClient)}
            </h2>

            <p className="mt-2 text-sm font-semibold text-slate-300">
              {selectedClient.goal || "Obiettivo non impostato"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Pill className="bg-teal-300 text-slate-950">
              {activePlans.length} programmi attivi
            </Pill>

            <Pill className="bg-white/10 text-white">
              {selectedClient.status || "active"}
            </Pill>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Ultimo check-in
          </p>

          <p className="mt-2 text-2xl font-black">
            {latestCheckin?.weight_kg ? `${latestCheckin.weight_kg} kg` : "—"}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            {latestCheckin?.checkin_date || "Nessun check-in"}
          </p>

          {latestCheckin && (
            <p className="mt-2 text-xs font-bold text-slate-500">
              Energia {latestCheckin.energy_level || "—"}/10 · Sonno{" "}
              {latestCheckin.sleep_quality || "—"}/10
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Ultima misurazione
          </p>

          <p className="mt-2 text-2xl font-black">
            {latestMeasurement?.weight_kg
              ? `${latestMeasurement.weight_kg} kg`
              : "—"}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            {latestMeasurement?.measurement_date || "Nessuna misurazione"}
          </p>

          {latestMeasurement && (
            <p className="mt-2 text-xs font-bold text-slate-500">
              Vita {latestMeasurement.waist_cm || "—"} cm · BF{" "}
              {latestMeasurement.body_fat_percentage || "—"}%
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Ultimo allenamento
          </p>

          <p className="mt-2 text-2xl font-black">
            {latestSession?.session_date || "—"}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            {latestLog?.workout_exercises?.exercise_name ||
              "Nessuna serie registrata"}
          </p>

          {latestLog && (
            <p className="mt-2 text-xs font-bold text-slate-500">
              {latestLog.load_kg || "—"} kg x {latestLog.reps_done || "—"} · RPE{" "}
              {latestLog.rpe || "—"}
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-slate-400">
            Materiali cliente
          </p>

          <p className="mt-2 text-2xl font-black">
            {diets.length + photos.length + privateNotes.length}
          </p>

          <p className="mt-1 text-xs font-bold text-slate-500">
            {diets.length} diete · {photos.length} foto · {privateNotes.length} note
          </p>
        </div>
      </div>

      <div className="border-t border-slate-100 p-5">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Programma attivo
            </p>

            <p className="mt-2 font-black">
              {activePlans[0]?.title || "Nessun programma attivo"}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-500">
              {activePlans[0]?.duration_weeks
                ? `${activePlans[0].duration_weeks} settimane`
                : "—"}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Aderenza
            </p>

            <p className="mt-2 font-black">
              Dieta {latestCheckin?.diet_adherence || "—"}/10
            </p>

            <p className="mt-1 text-xs font-bold text-slate-500">
              Allenamento {latestCheckin?.training_adherence || "—"}/10
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              Stato operativo
            </p>

            <p className="mt-2 font-black">
              {activePlans.length > 0 ? "Cliente operativo" : "Da programmare"}
            </p>

            <p className="mt-1 text-xs font-bold text-slate-500">
              {latestCheckin
                ? "Check-in ricevuto"
                : "In attesa del primo check-in"}
            </p>
          </div>
        </div>
      </div>
    </Card>
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
                    onClick={() => onDuplicateProgram(plan)}
                    className="border border-slate-200 bg-white text-slate-900"
                  >
                    Duplica nel builder
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
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
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
      <header className="sticky top-0 z-30 bg-[#07111f] px-4 py-4 text-white shadow-xl md:relative md:px-6 md:py-5">
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

      <main className="mx-auto max-w-6xl space-y-5 p-4 pb-28 md:p-6">
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
