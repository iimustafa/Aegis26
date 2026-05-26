import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { Sparkles, TrendingDown, Wallet, Plane, Hotel, Ticket, Utensils } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, BarChart, Bar } from "recharts";
import { loadTrip, type StoredTrip } from "@/lib/trip-store";

export const Route = createFileRoute("/budget")({
  head: () => ({ meta: [{ title: "Budget Intelligence — Aegis26" }] }),
  component: Budget,
});

function Budget() {
  const [trip, setTrip] = useState<StoredTrip>(() => loadTrip());
  useEffect(() => {
    const update = () => setTrip(loadTrip());
    window.addEventListener("aegis26:trip-updated", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("aegis26:trip-updated", update); window.removeEventListener("storage", update); };
  }, []);

  const a = trip.analytics || {};
  const total = a.budget || 10000;
  const used = a.estimated_total || 0;
  const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const circ = 2 * Math.PI * 90;
  const costData = [
    { name: "Flights", cost: a.flight_cost || 0 },
    { name: "Hotel", cost: a.hotel_cost || 0 },
    { name: "Tickets", cost: a.ticket_cost || 0 },
    { name: "Local", cost: a.food_transport || 0 },
  ];
  const timeline = Array.from({ length: 8 }, (_, i) => ({ d: `D${i + 1}`, spent: Math.round(used * ((i + 1) / 8)) }));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan mb-3">Budget Intelligence</div><h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Control every <span className="gradient-text italic">travel riyal</span></h1></div><Link to="/planner" className="px-4 py-2 rounded-full bg-neon-cyan text-navy text-xs font-bold uppercase tracking-widest neon-glow">Optimize in chat</Link></header>

        {!trip.result ? <EmptyState /> : <>
          <div className="grid lg:grid-cols-[380px_1fr] gap-5 mb-5">
            <section className="glass-panel rounded-3xl p-8 flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative size-56 mb-6"><svg viewBox="0 0 220 220" className="-rotate-90 size-full"><circle cx="110" cy="110" r="90" stroke="rgba(255,255,255,0.07)" strokeWidth="14" fill="none" /><circle cx="110" cy="110" r="90" stroke="oklch(0.88 0.16 200)" strokeWidth="14" fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-5xl font-black gradient-text">{pct}%</span><span className="text-[10px] uppercase tracking-widest text-muted-foreground">used</span></div></div>
              <div className="grid grid-cols-2 gap-3 w-full"><Kpi label="Budget" value={`${total.toLocaleString()} SAR`} /><Kpi label="Remaining" value={`${(a.remaining || 0).toLocaleString()} SAR`} /></div>
            </section>
            <section className="grid sm:grid-cols-2 gap-4">
              <CostCard icon={Plane} label="Flights" value={a.flight_cost || 0} hint="International legs" />
              <CostCard icon={Hotel} label="Hotels" value={a.hotel_cost || 0} hint="Host-city stay" />
              <CostCard icon={Ticket} label="Tickets" value={a.ticket_cost || 0} hint="FIFA estimate" />
              <CostCard icon={Utensils} label="Food & Transport" value={a.food_transport || 0} hint="Local daily spend" />
            </section>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel title="Expense Timeline" sub="projected cumulative spend" className="h-[340px]"><ResponsiveContainer width="100%" height="88%"><AreaChart data={timeline}><defs><linearGradient id="bTimeline" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.88 0.16 200)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.88 0.16 200)" stopOpacity={0} /></linearGradient></defs><XAxis dataKey="d" tick={{ fill: "oklch(0.65 0.02 255)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Area dataKey="spent" stroke="oklch(0.88 0.16 200)" fill="url(#bTimeline)" strokeWidth={2} /></AreaChart></ResponsiveContainer></Panel>
            <Panel title="Cost Breakdown" sub="SAR by category" className="h-[340px]"><ResponsiveContainer width="100%" height="88%"><BarChart data={costData}><XAxis dataKey="name" tick={{ fill: "oklch(0.65 0.02 255)", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="cost" fill="oklch(0.48 0.20 258)" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Panel>
          </div>

          <div className="mt-5 glass-panel rounded-3xl p-6"><div className="flex items-center gap-2 mb-2"><Sparkles className="size-4 text-neon-cyan" /><span className="text-[10px] uppercase tracking-widest text-neon-cyan font-bold">AI Budget Optimizer</span></div><p className="text-sm text-foreground/85">{a.is_possible ? "Your latest trip is inside budget. Keep the remaining buffer for baggage, visa fees, airport transfers, and match-day food." : "The selected trip exceeds budget. Reduce cities, shorten stay, or switch to one-match travel mode."}</p><div className="mt-4 flex items-center gap-2 text-xs text-emerald-vibe"><TrendingDown className="size-4" /> Potential saving: book Houston/Dallas hotel clusters early and avoid weekend check-ins.</div></div>
        </>}
      </main>
      <SiteFooter />
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.14 0.03 260)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 };
function EmptyState() { return <div className="glass-panel rounded-3xl p-10 text-center"><Wallet className="size-10 text-neon-cyan mx-auto mb-4" /><div className="text-2xl font-bold mb-2">No budget data yet</div><p className="text-muted-foreground mb-6">Generate a trip in Planner to populate this dashboard.</p><Link to="/planner" className="inline-flex px-5 py-3 bg-neon-cyan text-navy rounded-xl font-bold neon-glow">Plan Trip</Link></div>; }
function Kpi({ label, value }: { label: string; value: string }) { return <div className="bg-white/5 rounded-xl p-4 border border-white/5"><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="text-xl font-bold mt-1">{value}</div></div>; }
function CostCard({ icon: Icon, label, value, hint }: { icon: typeof Plane; label: string; value: number; hint: string }) { return <div className="glass-panel rounded-2xl p-6"><Icon className="size-5 text-neon-cyan mb-4" /><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="text-3xl font-bold mt-1">{value.toLocaleString()}</div><div className="text-xs text-muted-foreground mt-1">SAR · {hint}</div></div>; }
function Panel({ title, sub, children, className }: { title: string; sub: string; children: React.ReactNode; className?: string }) { return <div className={`glass-panel rounded-2xl p-5 ${className ?? ""}`}><div className="mb-2"><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</div><div className="text-sm font-bold">{sub}</div></div>{children}</div>; }
