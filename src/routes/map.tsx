import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Plane, Users, MapPin } from "lucide-react";
import worldMap from "@/assets/world-map.jpg";
import { loadTrip, type StoredTrip } from "@/lib/trip-store";

export const Route = createFileRoute("/map")({
  head: () => ({ meta: [{ title: "World Cup Host Map — Aegis26" }] }),
  component: HostMap,
});

type City = { city: string; country: string; flag: string; stadium: string; capacity: string; matches: number; top: string; left: string };

const allCities: City[] = [
  { city: "Vancouver", country: "Canada", flag: "🇨🇦", stadium: "BC Place", capacity: "54k", matches: 7, top: "20%", left: "12%" },
  { city: "Seattle", country: "USA", flag: "🇺🇸", stadium: "Lumen Field", capacity: "69k", matches: 6, top: "28%", left: "15%" },
  { city: "San Francisco Bay Area (Santa Clara)", country: "USA", flag: "🇺🇸", stadium: "Levi's Stadium", capacity: "71k", matches: 6, top: "47%", left: "12%" },
  { city: "Los Angeles (Inglewood)", country: "USA", flag: "🇺🇸", stadium: "SoFi Stadium", capacity: "70k", matches: 8, top: "58%", left: "16%" },
  { city: "Guadalajara (Zapopan)", country: "Mexico", flag: "🇲🇽", stadium: "Estadio Akron", capacity: "48k", matches: 4, top: "74%", left: "31%" },
  { city: "Mexico City", country: "Mexico", flag: "🇲🇽", stadium: "Estadio Azteca", capacity: "83k", matches: 5, top: "81%", left: "36%" },
  { city: "Monterrey (Guadalupe)", country: "Mexico", flag: "🇲🇽", stadium: "Estadio BBVA", capacity: "53.5k", matches: 4, top: "68%", left: "39%" },
  { city: "Houston", country: "USA", flag: "🇺🇸", stadium: "NRG Stadium", capacity: "72k", matches: 7, top: "63%", left: "49%" },
  { city: "Dallas (Arlington)", country: "USA", flag: "🇺🇸", stadium: "AT&T Stadium", capacity: "94k", matches: 9, top: "56%", left: "50%" },
  { city: "Kansas City", country: "USA", flag: "🇺🇸", stadium: "Arrowhead Stadium", capacity: "73k", matches: 6, top: "45%", left: "54%" },
  { city: "Atlanta", country: "USA", flag: "🇺🇸", stadium: "Mercedes-Benz Stadium", capacity: "75k", matches: 8, top: "58%", left: "66%" },
  { city: "Miami (Miami Gardens)", country: "USA", flag: "🇺🇸", stadium: "Hard Rock Stadium", capacity: "65k", matches: 7, top: "77%", left: "74%" },
  { city: "Toronto", country: "Canada", flag: "🇨🇦", stadium: "BMO Field", capacity: "45k", matches: 6, top: "31%", left: "71%" },
  { city: "Boston (Foxborough)", country: "USA", flag: "🇺🇸", stadium: "Gillette Stadium", capacity: "65k", matches: 7, top: "34%", left: "84%" },
  { city: "Philadelphia", country: "USA", flag: "🇺🇸", stadium: "Lincoln Financial Field", capacity: "69k", matches: 6, top: "44%", left: "78%" },
  { city: "New York/New Jersey (East Rutherford)", country: "USA", flag: "🇺🇸", stadium: "MetLife Stadium", capacity: "82.5k", matches: 8, top: "39%", left: "81%" },
];

function HostMap() {
  const [trip, setTrip] = useState<StoredTrip>(() => loadTrip());
  const highlighted = useMemo(() => new Set(Object.keys(trip.analytics?.cities || {})), [trip]);
  const defaultCity = allCities.find((c) => highlighted.has(c.city)) || allCities[0];
  const [active, setActive] = useState<City>(defaultCity);

  useEffect(() => {
    const update = () => setTrip(loadTrip());
    window.addEventListener("aegis26:trip-updated", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("aegis26:trip-updated", update); window.removeEventListener("storage", update); };
  }, []);

  useEffect(() => { const next = allCities.find((c) => highlighted.has(c.city)); if (next) setActive(next); }, [highlighted]);

  const cityMatches = trip.analytics?.cities?.[active.city] || active.matches;

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan mb-3">Host City Network</div><h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">16 cities. <span className="gradient-text italic">Your route highlighted.</span></h1></div><Link to="/planner" className="px-4 py-2 rounded-full bg-neon-cyan text-navy text-xs font-bold uppercase tracking-widest neon-glow">Plan new route</Link></header>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5">
          <div className="relative h-[640px] glass-panel rounded-3xl overflow-hidden"><img src={worldMap} alt="North America stadium map" className="absolute inset-0 w-full h-full object-cover opacity-50" /><div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/70" />
            {allCities.map((c) => { const selected = active.city === c.city; const planned = highlighted.has(c.city); return <button key={c.city} onClick={() => setActive(c)} style={{ top: c.top, left: c.left }} className="absolute -translate-x-1/2 -translate-y-1/2 group"><span className="relative flex"><span className={`size-3 rounded-full ${selected ? "bg-trophy-gold" : planned ? "bg-emerald-vibe" : "bg-neon-cyan"} ring-2 ring-background`} /><span className={`absolute inset-0 rounded-full animate-ping ${selected ? "bg-trophy-gold" : planned ? "bg-emerald-vibe" : "bg-neon-cyan"} opacity-60`} /></span><span className="absolute left-4 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-background/80 backdrop-blur rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{c.city}</span></button>; })}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3"><div className="glass-strong rounded-xl px-4 py-2 flex items-center gap-4"><Legend color="bg-neon-cyan" label="Host city" /><Legend color="bg-emerald-vibe" label="In latest plan" /><Legend color="bg-trophy-gold" label="Selected" /></div><div className="glass-strong rounded-xl px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">FastAPI route overlay</div></div>
          </div>

          <aside className="glass-panel rounded-3xl p-6 flex flex-col gap-5"><div><div className="flex items-center gap-3 mb-2"><span className="text-3xl">{active.flag}</span><div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{active.country}</div><div className="text-2xl font-bold">{active.city}</div></div></div><div className="text-sm text-neon-cyan font-mono">{active.stadium}</div></div>
            <div className="grid grid-cols-2 gap-3"><Stat label="Capacity" value={active.capacity} /><Stat label="Matches" value={String(cityMatches)} /></div>
            <div><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Latest plan context</div><div className="space-y-2"><InfoRow icon={Plane} label="Route" value={`${trip.analytics?.departure_airport || "DMM"} → ${trip.analytics?.destination_airport || "—"}`} /><InfoRow icon={Calendar} label="Match days" value={(trip.analytics?.match_days || []).join(", ") || "Generate a plan"} /><InfoRow icon={Users} label="Selected" value={trip.analytics?.team || "No team yet"} /></div></div>
            <div className="bg-neon-cyan/5 border border-neon-cyan/15 rounded-xl p-4"><div className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan mb-2">AI Suggestion</div><p className="text-xs leading-relaxed text-foreground/85">{highlighted.has(active.city) ? `${active.city} is part of your latest plan. Anchor hotel search near ${active.stadium}.` : `Add ${active.city} only if match schedule and budget allow it.`}</p></div>
          </aside>
        </div>

        <section className="mt-6"><div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">All host cities</div><div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2">{allCities.map((c) => <button key={c.city} onClick={() => setActive(c)} className={`shrink-0 glass-panel rounded-xl px-4 py-3 flex items-center gap-3 hover:border-neon-cyan/40 transition-colors ${active.city === c.city ? "border-trophy-gold/40" : highlighted.has(c.city) ? "border-emerald-vibe/40" : ""}`}><span className="text-xl">{c.flag}</span><div className="text-left"><div className="text-xs font-bold whitespace-nowrap">{c.city}</div><div className="text-[9px] text-muted-foreground uppercase tracking-widest">{highlighted.has(c.city) ? "in plan" : `${c.matches} matches`}</div></div></button>)}</div></section>
      </main>
      <SiteFooter />
    </div>
  );
}
function Legend({ color, label }: { color: string; label: string }) { return <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest"><span className={`size-2 rounded-full ${color}`} /> {label}</div>; }
function Stat({ label, value }: { label: string; value: string }) { return <div className="bg-white/5 border border-white/5 rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="text-2xl font-bold mt-1">{value}</div></div>; }
function InfoRow({ icon: Icon, label, value }: { icon: typeof Plane; label: string; value: string }) { return <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex gap-3"><Icon className="size-4 text-neon-cyan shrink-0 mt-0.5" /><div><div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div><div className="text-xs font-semibold text-foreground/90">{value}</div></div></div>; }
