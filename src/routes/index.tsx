import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { LiveTicker } from "@/components/LiveTicker";
import heroStadium from "@/assets/hero-stadium.jpg";
import worldMap from "@/assets/world-map.jpg";
import ballGlow from "@/assets/ball-glow.jpg";
import {
  AreaChart, Area, ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Tooltip,
} from "recharts";
import {
  Plane, Hotel, Brain, Wallet, TrendingUp, Activity, Globe2, Zap,
  ChevronRight, Sparkles, Trophy, Target,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aegis26 — AI FIFA 2026 Travel Planner & Match Analytics" },
      { name: "description", content: "Plan your FIFA 2026 journey with neural intelligence. Multi-agent flights, hotels, and ML match prediction." },
      { property: "og:title", content: "Aegis26 — AI FIFA 2026 Travel & Match Intelligence" },
      { property: "og:description", content: "Multi-agent AI for the 2026 World Cup. Travel, prediction, budget — unified." },
    ],
  }),
  component: Landing,
});

const xgData = Array.from({ length: 24 }, (_, i) => ({
  x: i,
  a: Math.sin(i / 2) * 0.5 + 1.4 + Math.random() * 0.3,
  b: Math.cos(i / 2.5) * 0.4 + 1.1 + Math.random() * 0.3,
}));

const radarData = [
  { k: "Attack", A: 92, B: 78 },
  { k: "Defense", A: 81, B: 88 },
  { k: "Midfield", A: 87, B: 74 },
  { k: "Form", A: 76, B: 90 },
  { k: "xG", A: 84, B: 71 },
  { k: "Set Piece", A: 69, B: 82 },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteNav />

      {/* HERO */}
      <header className="relative pt-16 overflow-hidden">
        {/* stadium photo */}
        <div className="absolute inset-0 -z-10">
          <img
            src={heroStadium}
            alt="FIFA stadium at night"
            width={1920}
            height={1080}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          <div className="absolute inset-0 radial-spotlight opacity-80" />
        </div>

        <LiveTicker />

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 lg:pt-36 lg:pb-44 relative">
          {/* floating glow orbs */}
          <div className="pointer-events-none absolute top-20 right-10 size-80 rounded-full bg-fifa-blue/20 animate-pulse-glow" />
          <div className="pointer-events-none absolute bottom-10 left-0 size-96 rounded-full bg-neon-cyan/10 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

          <div className="max-w-3xl animate-[fade-up_0.8s_cubic-bezier(0.19,1,0.22,1)_both]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel mb-8">
              <span className="size-1.5 rounded-full bg-neon-cyan animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-cyan">
                AI Multi-Agent System · Live
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tighter mb-8 leading-[0.92] text-balance">
              Plan Your FIFA 2026 <br />
              Journey with{" "}
              <span className="gradient-text italic">Neural Intelligence</span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
              Predict match outcomes with 94% ML accuracy, orchestrate multi-city logistics,
              and book the 2026 World Cup through a proprietary AI concierge.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/planner"
                className="group inline-flex items-center gap-3 px-7 py-4 bg-neon-cyan text-navy font-bold rounded-xl hover:scale-[1.03] transition-transform neon-glow text-sm uppercase tracking-wider"
              >
                Start AI Planning
                <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/analytics"
                className="inline-flex items-center gap-3 px-7 py-4 glass-panel rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                View ML Insights
              </Link>
            </div>

            {/* stat strip */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden glass-panel">
              {[
                { v: "94.2%", l: "ML Accuracy" },
                { v: "16", l: "Host Cities" },
                { v: "450+", l: "Airline APIs" },
                { v: "104", l: "Matches Tracked" },
              ].map((s) => (
                <div key={s.l} className="px-5 py-5 bg-background/40">
                  <div className="text-2xl font-bold tracking-tight">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* MATCH INTELLIGENCE + AGENT */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <SectionHead
          kicker="Predictive Core"
          title="Match Intelligence, modelled in real time"
          desc="Six specialized agents coordinate live flight, hotel and prediction data — surfacing the trips that actually win."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
          {/* prediction widget */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="text-2xl font-bold">Match Intelligence</h3>
                <p className="text-muted-foreground text-sm mt-1">Quarter Finals · Prediction Model v4.2</p>
              </div>
              <div className="px-3 py-1.5 bg-emerald-vibe/10 text-emerald-vibe rounded-lg text-[10px] font-bold border border-emerald-vibe/20 uppercase tracking-widest">
                High Confidence
              </div>
            </div>

            <div className="flex items-center justify-between gap-6 mb-10">
              <TeamBadge code="USA" name="United States" prob={42} accent="cyan" />
              <div className="text-center min-w-[8rem]">
                <div className="text-[10px] text-muted-foreground font-bold mb-2 uppercase tracking-widest">Win Probability</div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-neon-cyan to-fifa-blue w-[42%] transition-all duration-1000" />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground mt-3">2.41 xG</div>
              </div>
              <TeamBadge code="BRA" name="Brazil" prob={58} accent="gold" />
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex gap-4 items-start">
              <div className="text-neon-cyan bg-neon-cyan/10 p-2 rounded-lg shrink-0">
                <Brain className="size-4" />
              </div>
              <div>
                <div className="font-mono text-[10px] font-bold text-neon-cyan mb-1">AI_INSIGHT</div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Brazil holds a <span className="text-emerald-vibe font-semibold">+12.4% xG advantage</span> in high-altitude stadiums based on the current squad rotation. Recommended hedge: alternate accommodation in CDMX.
                </p>
              </div>
            </div>
          </div>

          {/* travel agent */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-12 -right-12 size-48 bg-neon-cyan/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="size-12 rounded-full bg-gradient-to-tr from-fifa-blue to-neon-cyan mb-6 flex items-center justify-center neon-glow">
                <Sparkles className="size-5 text-navy" />
              </div>
              <h3 className="text-2xl font-bold mb-3 italic leading-tight">Dynamic Logistics Concierge</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                Real-time integration with 450+ airlines and 16 host city hotel networks. Auto re-routing when bracket results land.
              </p>
            </div>
            <div className="space-y-3 relative">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Optimization Score</span>
                <span className="text-neon-cyan font-bold font-mono">98/100</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-neon-cyan to-emerald-vibe w-[98%]" />
              </div>
              <Link
                to="/planner"
                className="mt-4 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
              >
                Configure Agents <ChevronRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AGENTS GRID */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <SectionHead
          kicker="Coordinated Agent System"
          title="Six minds. One World Cup."
          desc="Each agent owns a domain. Together they negotiate trade-offs you'd never see manually."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {[
            { i: Plane, icon: "text-neon-cyan", bg: "bg-neon-cyan/10 ring-neon-cyan/20", h: "Flight Synth", d: "Continuous arbitrage across 450 carriers, surfacing routes before they spike." },
            { i: Hotel, icon: "text-fifa-blue", bg: "bg-fifa-blue/15 ring-fifa-blue/30", h: "Habitat", d: "16 host city inventory crawler with proximity scoring to your match cluster." },
            { i: Brain, icon: "text-neon-cyan", bg: "bg-neon-cyan/10 ring-neon-cyan/20", h: "Predictive Core", d: "10,000 Monte Carlo simulations per match using live squad telemetry." },
            { i: Wallet, icon: "text-emerald-vibe", bg: "bg-emerald-vibe/10 ring-emerald-vibe/20", h: "Fiscal Guard", d: "Sub-allocation across legs with automatic micro-savings between fixtures." },
            { i: Trophy, icon: "text-trophy-gold", bg: "bg-trophy-gold/10 ring-trophy-gold/20", h: "Bracket Oracle", d: "Knockout tree forecasting — books only the cities you'll actually reach." },
            { i: Activity, icon: "text-emerald-vibe", bg: "bg-emerald-vibe/10 ring-emerald-vibe/20", h: "Live Pulse", d: "Stream pricing, weather, congestion, and squad news into your itinerary." },
          ].map((a) => (
            <div key={a.h} className="glass-panel rounded-2xl p-6 group hover:border-neon-cyan/30 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 size-32 bg-neon-cyan/0 group-hover:bg-neon-cyan/5 rounded-full blur-2xl transition-colors" />
              <div className={`size-11 rounded-xl ring-1 flex items-center justify-center mb-5 ${a.bg}`}>
                <a.i className={`size-5 ${a.icon}`} />
              </div>
              <h4 className="text-lg font-bold mb-2">{a.h}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-24 bg-card/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead
            kicker="Analytics Surface"
            title="A Bloomberg terminal for the World Cup"
            desc="Live KPIs, win probability curves, and team radar comparisons — designed for fans who think in probabilities."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-12">
            <Kpi label="Live Flight Index" value="$1,240" delta="↓ 12%" border="border-l-emerald-vibe" deltaColor="text-emerald-vibe" />
            <Kpi label="Hotel Demand" value="Extreme" delta="LA · NYC" border="border-l-trophy-gold" deltaColor="text-trophy-gold" />
            <Kpi label="Avg Match Budget" value="$8,500" delta="↑ 4%" border="border-l-fifa-blue" deltaColor="text-fifa-blue" />
            <Kpi label="Predicted Scorers" value="14" delta="ML proj." border="border-l-neon-cyan" deltaColor="text-neon-cyan" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-6">
            <div className="lg:col-span-3 glass-panel rounded-3xl p-6 h-[360px]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Win Probability Curve</div>
                  <div className="text-lg font-bold">BRA vs FRA · Semi Final Projection</div>
                </div>
                <div className="text-[10px] font-mono text-emerald-vibe">▲ live</div>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={xgData}>
                  <defs>
                    <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.88 0.16 200)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.88 0.16 200)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.48 0.20 258)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.48 0.20 258)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: "oklch(0.14 0.03 260)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="a" stroke="oklch(0.88 0.16 200)" strokeWidth={2} fill="url(#ga)" />
                  <Area type="monotone" dataKey="b" stroke="oklch(0.48 0.20 258)" strokeWidth={2} fill="url(#gb)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 h-[360px]">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Team Radar</div>
                  <div className="text-lg font-bold">USA vs BRA</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="85%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis dataKey="k" tick={{ fill: "oklch(0.65 0.02 255)", fontSize: 10 }} />
                  <Radar dataKey="A" stroke="oklch(0.88 0.16 200)" fill="oklch(0.88 0.16 200)" fillOpacity={0.3} />
                  <Radar dataKey="B" stroke="oklch(0.82 0.14 88)" fill="oklch(0.82 0.14 88)" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* MAP TEASER */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <SectionHead
          kicker="Host City Network"
          title="16 cities. 1 interface."
          desc="Optimize multi-leg travel between MetLife, SoFi, Azteca and the rest with city-local AI agents."
        />
        <Link
          to="/map"
          className="block mt-12 relative h-[460px] glass-panel rounded-3xl overflow-hidden group"
        >
          <img
            src={worldMap}
            alt="Interactive North America stadium map"
            width={1920}
            height={1080}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-end justify-between gap-6">
            <div className="flex gap-3 flex-wrap">
              {[
                ["Mexico City", "Azteca"],
                ["New York", "MetLife"],
                ["Vancouver", "BC Place"],
                ["Los Angeles", "SoFi"],
              ].map(([city, stadium]) => (
                <div key={city} className="glass-strong rounded-xl px-4 py-3">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{city}</div>
                  <div className="text-sm font-bold">{stadium}</div>
                </div>
              ))}
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-3 bg-neon-cyan text-navy rounded-xl text-xs font-bold uppercase tracking-widest neon-glow">
              Open Map <ChevronRight className="size-3" />
            </div>
          </div>
        </Link>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <SectionHead
          kicker="Field Reports"
          title="What the early access fans say"
          desc=""
        />
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {[
            { q: "Booked 4 matches across 3 cities. The agent re-routed my Toronto leg when Canada advanced. Genuinely felt like magic.", a: "Marcos R.", r: "Season ticket holder, São Paulo" },
            { q: "I'm an analyst by trade. Their xG model beat my private sheet for the group stage. Now I just trust the dashboard.", a: "Priya N.", r: "Quant, London" },
            { q: "Spent half what I expected. The budget AI kept finding shoulder-night hotels in NJ for the MetLife matches.", a: "Jamal K.", r: "First-time fan, Atlanta" },
          ].map((t) => (
            <div key={t.a} className="glass-panel rounded-2xl p-7 flex flex-col gap-6">
              <Target className="size-5 text-neon-cyan" />
              <p className="text-sm leading-relaxed text-foreground/85">"{t.q}"</p>
              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="text-sm font-bold">{t.a}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPONSORS */}
      <section className="py-16 border-y border-white/5 bg-card/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-8">
            Data partners
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            {["OPTA", "STATSBOMB", "SKYSCANNER", "BOOKING.AI", "FOOTBALL+", "WYSCOUT"].map((s) => (
              <span key={s} className="text-lg font-black tracking-tighter italic text-foreground/70">{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 relative overflow-hidden">
        <img src={ballGlow} alt="" width={1280} height={800} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel mb-8">
            <Zap className="size-3 text-trophy-gold" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-trophy-gold">June 11, 2026 · Kickoff</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[0.95]">
            Your <span className="gradient-text italic">World Cup</span> starts here.
          </h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Join 14,000+ fans already orchestrating their 2026 itineraries with Aegis.
          </p>
          <Link
            to="/planner"
            className="inline-flex items-center gap-3 px-8 py-4 bg-neon-cyan text-navy font-bold rounded-xl hover:scale-[1.03] transition-transform neon-glow uppercase tracking-widest text-sm"
          >
            Secure Full Access <ChevronRight className="size-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function SectionHead({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <div className="max-w-2xl">
      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan mb-3 flex items-center gap-2">
        <span className="size-1 rounded-full bg-neon-cyan" />
        {kicker}
      </div>
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter leading-[1.05] mb-4 text-balance">{title}</h2>
      {desc && <p className="text-muted-foreground text-base leading-relaxed">{desc}</p>}
    </div>
  );
}

function TeamBadge({ code, name, prob, accent }: { code: string; name: string; prob: number; accent: "cyan" | "gold" }) {
  const ring = accent === "gold" ? "hover:ring-trophy-gold/40" : "hover:ring-neon-cyan/40";
  const color = accent === "gold" ? "text-trophy-gold" : "text-neon-cyan";
  return (
    <div className="text-center flex-1">
      <div className={`size-20 mx-auto mb-3 bg-card rounded-2xl flex items-center justify-center border border-white/10 ring-1 ring-transparent ${ring} transition-all`}>
        <span className="text-2xl font-black italic">{code}</span>
      </div>
      <div className="text-sm font-semibold">{name}</div>
      <div className={`text-3xl font-bold mt-1 ${color}`}>{prob}%</div>
    </div>
  );
}

function Kpi({ label, value, delta, border, deltaColor }: { label: string; value: string; delta: string; border: string; deltaColor: string }) {
  return (
    <div className={`glass-panel p-5 rounded-2xl border-l-2 ${border}`}>
      <div className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-2">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`text-[10px] mt-1 font-mono ${deltaColor}`}>{delta}</div>
    </div>
  );
}
