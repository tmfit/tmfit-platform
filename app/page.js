"use client";

import { useMemo, useState } from "react";
import { Activity, CalendarDays, ChevronRight, Download, Dumbbell, FileText, LayoutDashboard, LockKeyhole, LogOut, Plus, Search, ShieldCheck, TrendingUp } from "lucide-react";
import { clients, measurements, workoutRows } from "@/lib/demoData";

function Button({ children, className="", ...props }) {
  return <button className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-black transition ${className}`} {...props}>{children}</button>;
}
function Card({ children, className="" }) {
  return <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}
function MiniLine({ data, field, label, suffix="" }) {
  const values = data.map(d=>d[field]);
  const min = Math.min(...values), max = Math.max(...values), range = max-min || 1;
  const points = data.map((d,i)=>`${8+(i/(data.length-1))*84},${72-((d[field]-min)/range)*48}`).join(" ");
  return <div className="h-44 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-2 flex items-center justify-between">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="text-sm font-black text-slate-900">{values.at(-1).toLocaleString("it-IT")} {suffix}</p>
    </div>
    <svg viewBox="0 0 100 82" className="h-28 w-full overflow-visible">
      <defs><linearGradient id={`g-${field}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#2dd4bf" stopOpacity=".32"/><stop offset="100%" stopColor="#2dd4bf" stopOpacity="0"/></linearGradient></defs>
      <polyline points={`8,78 ${points} 92,78`} fill={`url(#g-${field})`} stroke="none"/>
      <polyline points={points} fill="none" stroke="#14b8a6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>;
}
function StatCard({ label, value, unit, icon: Icon }) {
  return <Card className="rounded-2xl"><div className="flex items-center gap-4 p-5">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-600"><Icon size={22}/></div>
    <div><p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value} <span className="text-sm font-semibold text-slate-500">{unit}</span></p></div>
  </div></Card>;
}
function LoginScreen({ onEnter }) {
  return <div className="min-h-screen bg-[#07111f] text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_10%,rgba(45,212,191,.15),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(56,199,189,.08),transparent_36%)]"/>
    <div className="relative grid min-h-screen place-items-center p-6">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[.06] p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center"><div className="text-4xl font-black tracking-tight">TM FIT</div><div className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-teal-300">Medical Platform</div></div>
        <div className="space-y-4">
          <input className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-semibold outline-none ring-teal-300/30 focus:ring-4" placeholder="studio@tmfit.it"/>
          <input type="password" className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-semibold outline-none ring-teal-300/30 focus:ring-4" placeholder="Password"/>
          <Button onClick={onEnter} className="h-12 w-full bg-teal-300 text-slate-950 hover:bg-teal-200"><LockKeyhole size={18} className="mr-2"/>Accedi alla piattaforma</Button>
        </div>
      </div>
    </div>
  </div>;
}
export default function Home() {
  const [logged,setLogged]=useState(false), [selectedId,setSelectedId]=useState(1), [query,setQuery]=useState(""), [tab,setTab]=useState("overview");
  const filtered=useMemo(()=>clients.filter(c=>c.name.toLowerCase().includes(query.toLowerCase())),[query]);
  const selected=clients.find(c=>c.id===selectedId)||clients[0];
  if(!logged) return <LoginScreen onEnter={()=>setLogged(true)}/>;
  return <div className="min-h-screen bg-[#f5f7fb] text-slate-950">
    <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col bg-[#07111f] p-6 text-white lg:flex">
      <div className="mb-10"><div className="text-3xl font-black tracking-tight">TM FIT</div><div className="mt-2 text-xs font-bold uppercase tracking-[0.35em] text-teal-300">Medical Platform</div></div>
      <nav className="space-y-2">
        {[["overview",LayoutDashboard,"Overview"],["composition",Activity,"Composizione"],["training",Dumbbell,"Allenamento"],["reports",FileText,"Report"]].map(([key,Icon,label])=><button key={key} onClick={()=>setTab(key)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold ${tab===key?"bg-white/10 text-teal-200":"text-slate-300"}`}><Icon size={18}/>{label}</button>)}
      </nav>
      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3 text-teal-200"><ShieldCheck size={20}/><span className="text-sm font-black">Studio premium</span></div><p className="mt-2 text-xs leading-5 text-slate-300">Area professionista + area cliente, pronta per Supabase e Vercel.</p></div>
    </aside>
    <main className="lg:ml-72">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-xl"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h1 className="text-2xl font-black tracking-tight">Area Professionista</h1><p className="text-sm font-medium text-slate-500">Clienti · Dashboard · Allenamenti · Report</p></div><div className="flex gap-3"><Button className="bg-[#07111f] text-white hover:bg-[#0f172a]"><Plus size={17} className="mr-2"/>Nuovo cliente</Button><Button onClick={()=>setLogged(false)} className="border border-slate-200 bg-white text-slate-900"><LogOut size={17} className="mr-2"/>Esci</Button></div></div></header>
      <section className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
        <Card><div className="p-5"><div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><Search size={18} className="text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca cliente..." className="w-full bg-transparent text-sm font-semibold outline-none"/></div><div className="space-y-3">{filtered.map(c=><button key={c.id} onClick={()=>setSelectedId(c.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selectedId===c.id?"border-teal-300 bg-teal-50":"border-slate-200 bg-white hover:bg-slate-50"}`}><div className="flex items-center justify-between"><p className="font-black text-slate-950">{c.name}</p><ChevronRight size={18} className="text-slate-400"/></div><p className="mt-1 text-sm font-semibold text-slate-500">{c.goal}</p><div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-500"><span>{c.sex}</span><span>·</span><span>{c.age} anni</span><span>·</span><span>{c.workouts} allenamenti</span></div></button>)}</div></div></Card>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl bg-[#07111f] text-white shadow-luxury"><div className="h-1.5 bg-gradient-to-r from-teal-400 to-cyan-300"/><div className="grid gap-6 p-7 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-xs font-black uppercase tracking-[0.35em] text-teal-200">Scheda cliente</p><h2 className="mt-2 text-4xl font-black tracking-tight">{selected.name}</h2><p className="mt-2 text-slate-300">{selected.goal}</p><div className="mt-5 flex flex-wrap gap-3 text-sm font-bold text-slate-200"><span className="rounded-full bg-white/10 px-4 py-2">{selected.sex}</span><span className="rounded-full bg-white/10 px-4 py-2">{selected.age} anni</span><span className="rounded-full bg-white/10 px-4 py-2">{selected.height} cm</span></div></div><div className="rounded-3xl border border-teal-300/30 bg-white/5 p-5 text-center"><CalendarDays className="mx-auto text-teal-300"/><p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">Ultimo aggiornamento</p><p className="mt-1 text-xl font-black">{selected.lastUpdate}</p></div></div></div>
          {(tab==="overview"||tab==="composition")&&<><div className="grid gap-4 md:grid-cols-4"><StatCard label="Peso" value={selected.weight.toLocaleString("it-IT")} unit="kg" icon={Activity}/><StatCard label="%BF" value={selected.bf.toLocaleString("it-IT")} unit="%" icon={TrendingUp}/><StatCard label="Massa magra" value={selected.leanMass.toLocaleString("it-IT")} unit="kg" icon={ShieldCheck}/><StatCard label="Allenamenti" value={selected.workouts} unit="giorni" icon={Dumbbell}/></div><div className="grid gap-4 lg:grid-cols-2"><MiniLine data={measurements} field="peso" label="Peso" suffix="kg"/><MiniLine data={measurements} field="bf" label="%BF" suffix="%"/></div></>}
          {(tab==="overview"||tab==="training")&&<Card><div className="flex items-center justify-between border-b border-slate-200 p-5"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-teal-600">Piano allenamento</p><h3 className="mt-1 text-xl font-black">Allenamento A</h3></div><Button className="bg-[#07111f] text-white hover:bg-[#0f172a]"><Download size={17} className="mr-2"/>PDF</Button></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500"><tr><th className="px-5 py-4">Esercizio</th><th className="px-5 py-4">Serie/Rip</th><th className="px-5 py-4">Recupero</th><th className="px-5 py-4">Modalità</th><th className="px-5 py-4">SS</th></tr></thead><tbody>{workoutRows.map((r,i)=><tr key={i} className="border-t border-slate-100"><td className="px-5 py-4 font-black">{r.ex}</td><td className="px-5 py-4 font-bold text-slate-700">{r.series}</td><td className="px-5 py-4 text-slate-600">{r.rec}</td><td className="px-5 py-4 text-slate-600">{r.mode}</td><td className="px-5 py-4">{r.ss?<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200">{r.ss}</span>:<span className="text-slate-300">—</span>}</td></tr>)}</tbody></table></div></Card>}
          {tab==="reports"&&<div className="grid gap-4 md:grid-cols-2"><Card><div className="p-6"><FileText className="text-teal-600"/><h3 className="mt-4 text-xl font-black">Report composizione</h3><p className="mt-2 text-sm text-slate-500">Genera PDF premium con dashboard, misurazioni e andamento.</p><Button className="mt-5 bg-[#07111f] text-white">Genera PDF</Button></div></Card><Card><div className="p-6"><Dumbbell className="text-teal-600"/><h3 className="mt-4 text-xl font-black">Report allenamento</h3><p className="mt-2 text-sm text-slate-500">Esporta scheda cliente con progressioni e superserie.</p><Button className="mt-5 bg-[#07111f] text-white">Genera PDF</Button></div></Card></div>}
        </div>
      </section>
    </main>
  </div>;
}
