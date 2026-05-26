import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Activity, Globe2, Wallet, Trophy } from "lucide-react";
import { loadTrip, type StoredTrip } from "@/lib/trip-store";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Match Analytics Dashboard — Aegis26" }] }),
  component: Analytics,
});

function Analytics() {
  const [trip, setTrip] = useState<StoredTrip>(() => loadTrip());

  useEffect(() => {
    const update = () => setTrip(loadTrip());
    window.addEventListener("aegis26:trip-updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("aegis26:trip-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const analytics = trip.analytics || {};
  const prediction = trip.prediction || {};
  const cities = Object.entries(analytics.cities || {}).map(([name, matches]) => ({ name, matches }));
  const stadiums = Object.entries(analytics.stadiums || {}).map(([name, matches]) => ({ name, matches }));
  const allocation = [
    { n: "Flights", v: analytics.flight_cost || 0, c: "oklch(0.88 0.16 200)" },
    { n: "Hotels", v: analytics.hotel_cost || 0, c: "oklch(0.48 0.20 258)" },
    { n: "Tickets", v: analytics.ticket_cost || 0, c: "oklch(0.82 0.14 88)" },
    { n: "Local", v: analytics.food_transport || 0, c: "oklch(0.72 0.18 162)" },
  ];
  const timeline = (analytics.match_days || []).map((date, i) => ({ date: date?.slice(5) || `M${i + 1}`, matches: i + 1, cost: Math.round((analytics.estimated_total || 0) * ((i + 1) / Math.max(analytics.match_days?.length || 1, 1))) }));

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan mb-3">Live Analytics</div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">Dashboard powered by <span className="gradient-text italic">your latest plan</span></h1>
            <p className="text-sm text-muted-foreground mt-3">Generate a trip in Planner and this page updates from the FastAPI response.</p>
          </div>
          <Link to="/planner" className="px-4 py-2 rounded-full bg-neon-cyan text-navy text-xs font-bold uppercase tracking-widest neon-glow">Open Planner</Link>
        </header>

        {!trip.result ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard label="Matches" value={String(analytics.total_matches ?? 0)} sub={analytics.team || "Latest trip"} icon={Activity} tone="cyan" />
              <StatCard label="Budget Usage" value={`${analytics.budget_usage_pct ?? 0}%`} sub={`${analytics.remaining ?? 0} SAR remaining`} icon={Wallet} tone="emerald" />
              <StatCard label="ML Winner" value={prediction.winner || "—"} sub={prediction.score || "No prediction"} icon={Trophy} tone="gold" />
              <StatCard label="Route" value={`${analytics.departure_airport || "DMM"} → ${analytics.destination_airport || "—"}`} sub="flight search pair" icon={Globe2} tone="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              <Panel className="lg:col-span-4 h-[340px]" title="Trip Cost Timeline" sub="cumulative spend by match day">
                <ResponsiveContainer width="100%" height="88%">
                  <AreaChart data={timeline.length ? timeline : [{ date: "Plan", cost: analytics.estimated_total || 0, matches: 1 }]}>
                    <defs><linearGradient id="cost" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.88 0.16 200)" stopOpacity={0.5} /><stop offset="100%" stopColor="oklch(0.88 0.16 200)" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="date" tick={{ fill: "oklch(0.65 0.02 255)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.65 0.02 255)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="cost" stroke="oklch(0.88 0.16 200)" strokeWidth={2} fill="url(#cost)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Panel>

              <Panel className="lg:col-span-2 h-[340px]" title="Budget Allocation" sub="SAR cost breakdown">
                <ResponsiveContainer width="100%" height="86%">
                  <PieChart>
                    <Pie data={allocation} dataKey="v" nameKey="n" innerRadius={55} outerRadius={90} paddingAngle={2}>{allocation.map((a, i) => <Cell key={i} fill={a.c} stroke="none" />)}</Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </Panel>

              <Panel className="lg:col-span-3 h-[340px]" title="City Distribution" sub="matches per city">
                <ResponsiveContainer width="100%" height="88%">
                  <BarChart data={cities.length ? cities : [{ name: "No city", matches: 0 }]}>
                    <XAxis dataKey="name" tick={{ fill: "oklch(0.65 0.02 255)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.65 0.02 255)", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="matches" fill="oklch(0.48 0.20 258)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Panel>

              <Panel className="lg:col-span-3 h-[340px]" title="Stadium Load" sub="selected stadiums">
                <div className="space-y-3 mt-4">
                  {(stadiums.length ? stadiums : [{ name: "No stadium selected", matches: 0 }]).map((s) => <RowBar key={s.name} label={s.name} value={s.matches} max={Math.max(...stadiums.map((x) => x.matches), 1)} />)}
                </div>
              </Panel>
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

const tooltipStyle = { background: "oklch(0.14 0.03 260)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 };

function EmptyState() { return <div className="glass-panel rounded-3xl p-10 text-center"><div className="text-2xl font-bold mb-2">No live analytics yet</div><p className="text-muted-foreground mb-6">Go to Planner, ask for a trip, then return here.</p><Link to="/planner" className="inline-flex px-5 py-3 bg-neon-cyan text-navy rounded-xl font-bold neon-glow">Generate Trip</Link></div>; }
function StatCard({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub: string; icon: typeof Activity; tone: "cyan" | "emerald" | "gold" | "blue" }) { const map = { cyan: "text-neon-cyan", emerald: "text-emerald-vibe", gold: "text-trophy-gold", blue: "text-fifa-blue" } as const; return <div className="glass-panel rounded-2xl p-5"><div className="flex items-start justify-between mb-3"><span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span><Icon className={`size-4 ${map[tone]}`} /></div><div className="text-3xl font-bold tracking-tight truncate">{value}</div><div className={`text-xs mt-1 ${map[tone]} font-mono truncate`}>{sub}</div></div>; }
function Panel({ title, sub, children, className }: { title: string; sub: string; children: React.ReactNode; className?: string }) { return <div className={`glass-panel rounded-2xl p-5 ${className ?? ""}`}><div className="mb-2"><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</div><div className="text-sm font-bold">{sub}</div></div>{children}</div>; }
function RowBar({ label, value, max }: { label: string; value: number; max: number }) { return <div><div className="flex justify-between text-xs mb-1"><span className="truncate pr-4">{label}</span><span className="font-mono text-neon-cyan">{value}</span></div><div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-neon-cyan" style={{ width: `${Math.max(8, (value / max) * 100)}%` }} /></div></div>; }
