import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useMemo, useState } from "react";
import { Send, Sparkles, Plane, Hotel, Wallet, MapPin, Calendar, Users, Volume2, VolumeX } from "lucide-react";
import { planTrip, type Analytics, type Prediction } from "@/lib/api";
import { createThreadId, saveTrip } from "@/lib/trip-store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Trip Planner — Aegis26" },
      { name: "description", content: "Chat with an AI multi-agent to plan your FIFA 2026 trip end-to-end." },
    ],
  }),
  component: Planner,
});

type Msg = { role: "user" | "ai"; text: string; analytics?: Analytics; prediction?: Prediction };

const initial: Msg[] = [
  { role: "ai", text: "Welcome to Aegis26. Ask me for any FIFA 2026 trip: Portugal matches, KSA vs Spain, Iraq matches, opening match, or match 9." },
];

const originCities = ["Dammam", "Riyadh", "Jeddah", "Khobar", "Madinah", "Abha", "Tabuk"];
const teamOptions = ["Saudi Arabia", "Portugal", "Iraq", "Spain", "Brazil", "Argentina", "France", "England", "Japan", "Morocco"];
const matchOptions = ["Auto detect", "Saudi Arabia matches", "Opening match", "As many as possible"];

function Planner() {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [threadId, setThreadId] = useState(() => createThreadId());
  const [sound, setSound] = useState(false);

  const [departure, setDeparture] = useState("Dammam");
  const [budget, setBudget] = useState(10000);
  const [team, setTeam] = useState("Auto detect");
  const [matchPref, setMatchPref] = useState("Auto detect");
  const [hotelStyle, setHotelStyle] = useState("Budget");

  const latest = useMemo(() => [...msgs].reverse().find((m) => m.role === "ai" && (m.analytics || m.prediction)), [msgs]);
  const analytics = latest?.analytics;
  const prediction = latest?.prediction;

  async function send(custom?: string) {
    const text = (custom ?? input).trim();
    if (!text || typing) return;

    const userMsg: Msg = { role: "user", text };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setError("");

    const context = [
      text,
      "",
      `Departure city: ${departure}`,
      `Budget: ${budget} SAR`,
      `Trip style: ${hotelStyle}`,
      team !== "Auto detect" ? `Team preference: ${team}` : "",
      matchPref !== "Auto detect" ? `Match preference: ${matchPref}` : "",
    ].filter(Boolean).join("\n");

    try {
      const data = await planTrip({ query: context, thread_id: threadId });
      setThreadId(data.thread_id || threadId);
      saveTrip({ ...data, query: text });
      setMsgs((m) => [...m, { role: "ai", text: data.result, analytics: data.analytics, prediction: data.prediction }]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown backend error";
      setError(message);
      setMsgs((m) => [...m, { role: "ai", text: `Backend error: ${message}` }]);
    } finally {
      setTyping(false);
    }
  }

  const budgetUsage = analytics?.budget_usage_pct ?? (analytics?.estimated_total && analytics?.budget ? Math.round((analytics.estimated_total / analytics.budget) * 100) : 0);
  const estimatedTotal = analytics?.estimated_total ?? 0;
  const remaining = analytics?.remaining ?? budget - estimatedTotal;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan mb-3">AI Trip Planner</div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Plan your <span className="gradient-text italic">2026 journey</span></h1>
          </div>
          <button onClick={() => setSound((v) => !v)} className="glass-panel rounded-full px-4 py-2 text-xs font-bold flex items-center gap-2 hover:border-neon-cyan/40 transition-colors">
            {sound ? <Volume2 className="size-4 text-neon-cyan" /> : <VolumeX className="size-4 text-muted-foreground" />}
            Stadium ambience {sound ? "on" : "off"}
          </button>
        </header>

        <div className="grid lg:grid-cols-[340px_1fr] gap-6">
          <aside className="glass-panel rounded-3xl p-6 h-fit lg:sticky lg:top-24 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Trip Parameters</h3>

            <SelectField icon={Plane} label="Departure" value={departure} onChange={setDeparture} options={originCities} />
            <NumberField icon={Wallet} label="Budget SAR" value={budget} onChange={setBudget} />
            <SelectField icon={Users} label="Team" value={team} onChange={setTeam} options={teamOptions} />
            <SelectField icon={Calendar} label="Match Preference" value={matchPref} onChange={setMatchPref} options={matchOptions} />
            <SelectField icon={Hotel} label="Hotel Style" value={hotelStyle} onChange={setHotelStyle} options={["Budget", "Balanced", "Comfort", "Premium"]} />
            <Field icon={MapPin} label="Backend" value="FastAPI · LangGraph · ML" />

            <div className="pt-4 border-t border-white/5">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Budget Usage</div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-2xl font-bold">{estimatedTotal ? `${estimatedTotal.toLocaleString()} SAR` : "Waiting"}</span>
                <span className={`text-xs font-mono ${budgetUsage > 100 ? "text-red-400" : "text-emerald-vibe"}`}>{budgetUsage}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cyan to-emerald-vibe transition-all" style={{ width: `${Math.min(budgetUsage, 100)}%` }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Remaining: <span className={remaining < 0 ? "text-red-400" : "text-emerald-vibe"}>{remaining.toLocaleString()} SAR</span></div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <QuickButton label="Portugal" onClick={() => send("i want to attend portugal matches")} />
              <QuickButton label="KSA vs Spain" onClick={() => send("i want to attend ksa vs spain match")} />
              <QuickButton label="Iraq" onClick={() => send("i want to attend iraq matches")} />
              <QuickButton label="Opening" onClick={() => send("i want to attend the opening match")} />
            </div>
          </aside>

          <section className="glass-panel rounded-3xl flex flex-col min-h-[700px] overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
              <div className="size-10 rounded-full bg-gradient-to-tr from-fifa-blue to-neon-cyan flex items-center justify-center neon-glow">
                <Sparkles className="size-4 text-navy" />
              </div>
              <div>
                <div className="text-sm font-bold">Aegis Concierge</div>
                <div className="text-[10px] text-emerald-vibe flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-vibe animate-pulse" />
                  Match · Travel · Budget · ML agents online
                </div>
              </div>
            </div>

            {error && <div className="mx-6 mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

            <div className="flex-1 px-6 py-6 space-y-5 overflow-y-auto">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  {m.role === "ai" ? (
                    <div className="max-w-[92%]">
                      <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-foreground/90">{m.text}</div>
                      {(m.analytics || m.prediction) && <LiveCards analytics={m.analytics} prediction={m.prediction} />}
                    </div>
                  ) : (
                    <div className="bg-neon-cyan text-navy rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm font-medium">{m.text}</div>
                  )}
                </div>
              ))}
              {typing && (
                <div className="flex gap-1.5 items-center">
                  <span className="size-2 rounded-full bg-neon-cyan animate-pulse" />
                  <span className="size-2 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <span className="size-2 rounded-full bg-neon-cyan animate-pulse" style={{ animationDelay: "0.4s" }} />
                  <span className="text-xs text-muted-foreground ml-2">Agents are planning, predicting, and analyzing…</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/5 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Try: I want to attend ksa vs spain match"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neon-cyan/50 placeholder:text-muted-foreground"
              />
              <button onClick={() => send()} disabled={typing} className="px-5 bg-neon-cyan text-navy rounded-xl font-bold hover:scale-[1.03] transition-transform neon-glow flex items-center gap-2 disabled:opacity-50">
                <Send className="size-4" />
              </button>
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ icon: Icon, label, value }: { icon: typeof Plane; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-3 flex items-center gap-3">
      <Icon className="size-4 text-neon-cyan shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}

function SelectField({ icon: Icon, label, value, onChange, options }: { icon: typeof Plane; label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-3 flex items-center gap-3 hover:border-neon-cyan/30 transition-colors">
      <Icon className="size-4 text-neon-cyan shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent text-sm font-semibold focus:outline-none">
          {options.map((o) => <option key={o} value={o} className="bg-card">{o}</option>)}
        </select>
      </div>
    </label>
  );
}

function NumberField({ icon: Icon, label, value, onChange }: { icon: typeof Wallet; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-3 flex items-center gap-3 hover:border-neon-cyan/30 transition-colors">
      <Icon className="size-4 text-neon-cyan shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full bg-transparent text-sm font-semibold focus:outline-none" />
      </div>
    </label>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="rounded-xl bg-white/5 border border-white/5 px-3 py-2 text-xs font-bold hover:border-neon-cyan/40 hover:text-neon-cyan transition-colors">{label}</button>;
}

function LiveCards({ analytics, prediction }: { analytics?: Analytics; prediction?: Prediction }) {
  return (
    <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <MiniCard label="Winner" value={prediction?.winner || "—"} accent="neon-cyan" />
      <MiniCard label="Score" value={prediction?.score || "—"} accent="trophy-gold" />
      <MiniCard label="Total" value={analytics?.estimated_total ? `${analytics.estimated_total.toLocaleString()} SAR` : "—"} accent="emerald-vibe" />
      <MiniCard label="Usage" value={`${analytics?.budget_usage_pct ?? 0}%`} accent="fifa-blue" />
    </div>
  );
}

function MiniCard({ label, value, accent }: { label: string; value: string; accent: "neon-cyan" | "trophy-gold" | "emerald-vibe" | "fifa-blue" }) {
  const color = {
    "neon-cyan": "text-neon-cyan border-l-neon-cyan",
    "trophy-gold": "text-trophy-gold border-l-trophy-gold",
    "emerald-vibe": "text-emerald-vibe border-l-emerald-vibe",
    "fifa-blue": "text-fifa-blue border-l-fifa-blue",
  }[accent];
  return <div className={`bg-card/60 rounded-2xl p-4 border border-white/5 border-l-2 ${color}`}><div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div><div className="text-sm font-bold truncate">{value}</div></div>;
}
