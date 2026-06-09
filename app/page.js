"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
  UserPlus,
  X
} from "lucide-react";
import { clients as demoClients, measurements, workoutRows } from "../lib/demoData";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function calculateAge(birthDate) {
  if (!birthDate) return "—";

  const birth = new Date(birthDate);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function mapClientFromDatabase(client) {
  return {
    id: client.id,
    name:
      `${client.first_name || ""} ${client.last_name || ""}`.trim() ||
      "Cliente senza nome",
    first_name: client.first_name || "",
    last_name: client.last_name || "",
    email: client.email || "",
    phone: client.phone || "",
    goal: client.goal || "Obiettivo non impostato",
    sex: client.gender || "—",
    gender: client.gender || "—",
    age: calculateAge(client.birth_date),
    birth_date: client.birth_date || "",
    height: client.height_cm || "—",
    height_cm: client.height_cm || "",
    notes: client.notes || "",
    weight: 0,
    bf: 0,
    leanMass: 0,
    fatMass: 0,
    workouts: 0,
    lastUpdate: "Database"
  };
}

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

function LoginScreen({ onEnter }) {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(45,212,191,.15),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(56,199,189,.08),transparent_36%)]" />

      <div className="relative grid min-h-screen place-items-center p-6">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[.06] p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="text-4xl font-black tracking-tight">TM FIT</div>
            <div className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-teal-300">
              Medical Platform
            </div>
          </div>

          <div className="space-y-4">
            <input
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-semibold outline-none"
              placeholder="studio@tmfit.it"
            />

            <input
              type="password"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-semibold outline-none"
              placeholder="Password"
            />

            <Button
              onClick={onEnter}
              className="h-12 w-full bg-teal-300 text-slate-950 hover:bg-teal-200"
            >
              <LockKeyhole size={18} className="mr-2" />
              Accedi alla piattaforma
            </Button>
          </div>

          <p className="mt-6 text-center text-xs font-semibold leading-5 text-slate-400">
            Dashboard clienti, composizione corporea, allenamenti e report PDF
            in ambiente medical premium.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, icon: Icon }) {
  return (
    <Card className="rounded-2xl">
      <div className="flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600">
          <Icon size={22} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {value}{" "}
            <span className="text-sm font-semibold text-slate-500">
              {unit}
            </span>
          </p>
        </div>
      </div>
    </Card>
  );
}

function MiniLine({ data, field, label, suffix = "" }) {
  const cleanData = data
    .filter((item) => item[field] !== null && item[field] !== undefined)
    .map((item) => ({
      ...item,
      [field]: Number(item[field])
    }))
    .filter((item) => !Number.isNaN(item[field]));

  if (cleanData.length === 0) {
    return (
      <div className="h-44 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          {label}
        </p>
        <div className="grid h-28 place-items-center text-sm font-bold text-slate-400">
          Nessun dato disponibile
        </div>
      </div>
    );
  }

  if (cleanData.length === 1) {
    const value = cleanData[0][field];

    return (
      <div className="h-44 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
            {label}
          </p>
          <p className="text-sm font-black text-slate-900">
            {value.toLocaleString("it-IT")} {suffix}
          </p>
        </div>

        <div className="grid h-28 place-items-center rounded-2xl bg-slate-50 text-sm font-bold text-slate-500">
          Primo valore registrato
        </div>
      </div>
    );
  }

  const values = cleanData.map((item) => item[field]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = cleanData
    .map((item, index) => {
      const x = 8 + (index / (cleanData.length - 1)) * 84;
      const y = 72 - ((item[field] - min) / range) * 48;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="h-44 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">
          {label}
        </p>
        <p className="text-sm font-black text-slate-900">
          {values[values.length - 1].toLocaleString("it-IT")} {suffix}
        </p>
      </div>

      <svg viewBox="0 0 100 82" className="h-28 w-full overflow-visible">
        <defs>
          <linearGradient id={`gradient-${field}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity=".32" />
            <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
          </linearGradient>
        </defs>

        <polyline
          points={`8,78 ${points} 92,78`}
          fill={`url(#gradient-${field})`}
          stroke="none"
        />

        <polyline
          points={points}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function Home() {
  const [logged, setLogged] = useState(false);
  const [clients, setClients] = useState(demoClients);
  const [selectedId, setSelectedId] = useState(1);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("overview");
  const [dbStatus, setDbStatus] = useState("demo");

  const [showClientForm, setShowClientForm] = useState(false);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [clientError, setClientError] = useState("");

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

  const [bodyMeasurements, setBodyMeasurements] = useState(measurements);

  useEffect(() => {
    async function loadClients() {
      if (!supabase) {
        setDbStatus("demo");
        return;
      }

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn(error.message);
        setDbStatus("Policy RLS da configurare");
        return;
      }

      if (!data || data.length === 0) {
        setDbStatus("Supabase vuoto");
        setClients([]);
        return;
      }

      const mappedClients = data.map(mapClientFromDatabase);

      setClients(mappedClients);
      setSelectedId(mappedClients[0]?.id);
      setDbStatus("Supabase collegato");
    }

    async function loadMeasurements() {
      if (!supabase) return;

      const { data, error } = await supabase
        .from("measurements")
        .select("*")
        .order("measurement_date", { ascending: true });

      if (error) {
        console.warn(error.message);
        return;
      }

      if (data) {
        setBodyMeasurements(data);
      }
    }

    loadClients();
    loadMeasurements();
  }, []);

  const filteredClients = useMemo(
    () =>
      clients.filter((client) =>
        client.name.toLowerCase().includes(query.toLowerCase())
      ),
    [clients, query]
  );

  const selectedClient =
    clients.find((client) => String(client.id) === String(selectedId)) ||
    clients[0];

  const selectedMeasurements = useMemo(() => {
    if (!selectedClient) return [];

    return bodyMeasurements.filter(
      (measurement) =>
        String(measurement.client_id) === String(selectedClient.id)
    );
  }, [bodyMeasurements, selectedClient]);

  const latestMeasurement =
    selectedMeasurements.length > 0
      ? selectedMeasurements[selectedMeasurements.length - 1]
      : null;

  async function handleCreateClient(event) {
    event.preventDefault();
    setClientError("");

    if (!supabase) {
      setClientError("Supabase non configurato. Controlla le variabili ENV.");
      return;
    }

    if (!newClient.first_name.trim() || !newClient.last_name.trim()) {
      setClientError("Nome e cognome sono obbligatori.");
      return;
    }

    setIsSavingClient(true);

    const payload = {
      first_name: newClient.first_name.trim(),
      last_name: newClient.last_name.trim(),
      email: newClient.email.trim() || null,
      phone: newClient.phone.trim() || null,
      gender: newClient.gender,
      birth_date: newClient.birth_date || null,
      height_cm: newClient.height_cm ? Number(newClient.height_cm) : null,
      goal: newClient.goal.trim() || null,
      notes: newClient.notes.trim() || null
    };

    const { data, error } = await supabase
      .from("clients")
      .insert(payload)
      .select()
      .single();

    setIsSavingClient(false);

    if (error) {
      console.warn(error.message);
      setClientError(`Errore salvataggio cliente: ${error.message}`);
      return;
    }

    const createdClient = mapClientFromDatabase(data);

    setClients((prev) => [createdClient, ...prev]);
    setSelectedId(createdClient.id);
    setShowClientForm(false);

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
  }

  function closeClientForm() {
    if (isSavingClient) return;

    setShowClientForm(false);
    setClientError("");
  }

  if (!logged) return <LoginScreen onEnter={() => setLogged(true)} />;

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col bg-[#07111f] p-6 text-white lg:flex">
        <div className="mb-10">
          <div className="text-3xl font-black tracking-tight">TM FIT</div>
          <div className="mt-2 text-xs font-bold uppercase tracking-[0.35em] text-teal-300">
            Medical Platform
          </div>
        </div>

        <nav className="space-y-2">
          {[
            ["overview", LayoutDashboard, "Overview"],
            ["composition", Activity, "Composizione"],
            ["training", Dumbbell, "Allenamento"]
          ].map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold ${
                tab === key ? "bg-white/10 text-teal-200" : "text-slate-300"
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-3 text-teal-200">
            <ShieldCheck size={20} />
            <span className="text-sm font-black">Studio premium</span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            Database: {dbStatus}
          </p>
        </div>
      </aside>

      <main className="lg:ml-72">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                Area Professionista
              </h1>

              <p className="text-sm font-medium text-slate-500">
                Clienti · Dashboard · Allenamenti · Report
              </p>

              <p className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-500">
                Database: {dbStatus}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowClientForm(true)}
                className="bg-[#07111f] text-white hover:bg-[#0f172a]"
              >
                <Plus size={17} className="mr-2" />
                Nuovo cliente
              </Button>

              <Button
                onClick={() => setLogged(false)}
                className="border border-slate-200 bg-white text-slate-900"
              >
                <LogOut size={17} className="mr-2" />
                Esci
              </Button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
          <Card>
            <div className="p-5">
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
                {filteredClients.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <p className="font-black text-slate-700">
                      Nessun cliente trovato
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Crea un nuovo cliente per iniziare.
                    </p>
                  </div>
                )}

                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedId(client.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      String(selectedId) === String(client.id)
                        ? "border-teal-300 bg-teal-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-950">
                        {client.name}
                      </p>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {client.goal}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-500">
                      <span>{client.sex}</span>
                      <span>·</span>
                      <span>{client.age} anni</span>
                      <span>·</span>
                      <span>{client.workouts} allenamenti</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            {!selectedClient ? (
              <Card>
                <div className="grid min-h-[420px] place-items-center p-8 text-center">
                  <div>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-teal-50 text-teal-600">
                      <UserPlus size={28} />
                    </div>

                    <h2 className="mt-4 text-2xl font-black">
                      Nessun cliente selezionato
                    </h2>

                    <p className="mt-2 max-w-md text-sm font-semibold leading-6 text-slate-500">
                      Crea il primo cliente per visualizzare dashboard,
                      composizione corporea e allenamenti.
                    </p>

                    <Button
                      onClick={() => setShowClientForm(true)}
                      className="mt-5 bg-[#07111f] text-white"
                    >
                      <Plus size={17} className="mr-2" />
                      Nuovo cliente
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <div className="overflow-hidden rounded-3xl bg-[#07111f] text-white shadow-luxury">
                  <div className="h-1.5 bg-gradient-to-r from-teal-400 to-cyan-300" />

                  <div className="grid gap-6 p-7 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.35em] text-teal-200">
                        Scheda cliente
                      </p>

                      <h2 className="mt-2 text-4xl font-black tracking-tight">
                        {selectedClient.name}
                      </h2>

                      <p className="mt-2 text-slate-300">
                        {selectedClient.goal}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-200">
                        <span className="rounded-full bg-white/10 px-4 py-2">
                          {selectedClient.sex}
                        </span>

                        <span className="rounded-full bg-white/10 px-4 py-2">
                          {selectedClient.age} anni
                        </span>

                        <span className="rounded-full bg-white/10 px-4 py-2">
                          {selectedClient.height} cm
                        </span>
                      </div>

                      {(selectedClient.email || selectedClient.phone) && (
                        <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-300">
                          {selectedClient.email && (
                            <span>{selectedClient.email}</span>
                          )}

                          {selectedClient.phone && (
                            <span>{selectedClient.phone}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-3xl border border-teal-300/30 bg-white/5 p-5 text-center">
                      <CalendarDays className="mx-auto text-teal-300" />
                      <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                        Ultimo aggiornamento
                      </p>
                      <p className="mt-1 text-xl font-black">
                        {selectedClient.lastUpdate}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <StatCard
                    label="Peso"
                    value={latestMeasurement?.weight ?? "--"}
                    unit="kg"
                    icon={Activity}
                  />

                  <StatCard
                    label="%BF"
                    value={latestMeasurement?.body_fat ?? "--"}
                    unit="%"
                    icon={TrendingUp}
                  />

                  <StatCard
                    label="Massa magra"
                    value={latestMeasurement?.lean_mass ?? "--"}
                    unit="kg"
                    icon={ShieldCheck}
                  />

                  <StatCard
                    label="Allenamenti"
                    value={selectedClient.workouts || "--"}
                    unit="giorni"
                    icon={Dumbbell}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <MiniLine
                    data={selectedMeasurements}
                    field="weight"
                    label="Peso"
                    suffix="kg"
                  />

                  <MiniLine
                    data={selectedMeasurements}
                    field="body_fat"
                    label="%BF"
                    suffix="%"
                  />
                </div>

                <Card>
                  <div className="border-b border-slate-200 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">
                      Piano allenamento
                    </p>
                    <h3 className="mt-1 text-xl font-black">Allenamento A</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                        <tr>
                          <th className="px-5 py-4">Esercizio</th>
                          <th className="px-5 py-4">Serie/Rip</th>
                          <th className="px-5 py-4">Recupero</th>
                          <th className="px-5 py-4">Modalità</th>
                          <th className="px-5 py-4">SS</th>
                        </tr>
                      </thead>

                      <tbody>
                        {workoutRows.map((row, index) => (
                          <tr
                            key={index}
                            className="border-t border-slate-100"
                          >
                            <td className="px-5 py-4 font-black">
                              {row.exercise}
                            </td>
                            <td className="px-5 py-4 font-bold text-slate-700">
                              {row.series}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {row.recovery}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {row.execution}
                            </td>
                            <td className="px-5 py-4">
                              {row.superset || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        </section>

        {showClientForm && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
            <form
              onSubmit={handleCreateClient}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">
                    Anagrafica
                  </p>
                  <h2 className="mt-1 text-2xl font-black">Nuovo cliente</h2>
                </div>

                <button
                  type="button"
                  onClick={closeClientForm}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                >
                  <X size={18} />
                </button>
              </div>

              {clientError && (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                  {clientError}
                </div>
              )}

              <div className="grid gap-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    required
                    value={newClient.first_name}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        first_name: event.target.value
                      })
                    }
                    placeholder="Nome"
                    className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                  />

                  <input
                    required
                    value={newClient.last_name}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        last_name: event.target.value
                      })
                    }
                    placeholder="Cognome"
                    className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                  />
                </div>

                <input
                  type="email"
                  value={newClient.email}
                  onChange={(event) =>
                    setNewClient({
                      ...newClient,
                      email: event.target.value
                    })
                  }
                  placeholder="Email"
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                />

                <input
                  value={newClient.phone}
                  onChange={(event) =>
                    setNewClient({
                      ...newClient,
                      phone: event.target.value
                    })
                  }
                  placeholder="Telefono"
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                />

                <div className="grid gap-3 md:grid-cols-3">
                  <select
                    value={newClient.gender}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        gender: event.target.value
                      })
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                  >
                    <option value="uomo">Uomo</option>
                    <option value="donna">Donna</option>
                    <option value="altro">Altro</option>
                  </select>

                  <input
                    type="date"
                    value={newClient.birth_date}
                    onChange={(event) =>
                      setNewClient({
                        ...newClient,
                        birth_date: event.target.value
                      })
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300 md:col-span-2"
                  />
                </div>

                <input
                  type="number"
                  min="0"
                  value={newClient.height_cm}
                  onChange={(event) =>
                    setNewClient({
                      ...newClient,
                      height_cm: event.target.value
                    })
                  }
                  placeholder="Altezza cm"
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                />

                <input
                  value={newClient.goal}
                  onChange={(event) =>
                    setNewClient({
                      ...newClient,
                      goal: event.target.value
                    })
                  }
                  placeholder="Obiettivo"
                  className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                />

                <textarea
                  value={newClient.notes}
                  onChange={(event) =>
                    setNewClient({
                      ...newClient,
                      notes: event.target.value
                    })
                  }
                  placeholder="Note"
                  className="min-h-24 rounded-2xl border border-slate-200 px-4 py-3 font-semibold outline-none focus:border-teal-300"
                />
              </div>

              <div className="sticky bottom-0 mt-6 flex gap-3 bg-white pt-4">
                <Button
                  type="submit"
                  disabled={isSavingClient}
                  className="flex-1 bg-[#07111f] text-white hover:bg-[#0f172a]"
                >
                  {isSavingClient ? "Salvataggio..." : "Salva cliente"}
                </Button>

                <Button
                  type="button"
                  onClick={closeClientForm}
                  disabled={isSavingClient}
                  className="border border-slate-200 bg-white text-slate-900"
                >
                  Annulla
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
