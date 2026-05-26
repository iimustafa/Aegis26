import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { useEffect, useMemo, useState } from "react";
import { Brain, Zap, ChevronDown, ShieldCheck } from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { planTrip, type Prediction } from "@/lib/api";
import {
  getFixtureTeams,
  getTeamOpponents,
  type OpponentItem,
} from "@/lib/fixturesApi";
import { createThreadId, loadTrip, saveTrip } from "@/lib/trip-store";

export const Route = createFileRoute("/predict")({
  head: () => ({ meta: [{ title: "Match Prediction Engine — Aegis26" }] }),
  component: Predict,
});

function Predict() {
  const latest = loadTrip();
  const initialPrediction = latest.prediction || {};

  const [teams, setTeams] = useState<string[]>([]);
  const [opponents, setOpponents] = useState<OpponentItem[]>([]);

  const [home, setHome] = useState(initialPrediction.team1 || "");
  const [away, setAway] = useState(initialPrediction.team2 || "");

  const [prediction, setPrediction] = useState<Prediction>(initialPrediction);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingOpponents, setLoadingOpponents] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [threadId, setThreadId] = useState(
    () => latest.thread_id || createThreadId()
  );

  useEffect(() => {
    async function loadTeams() {
      setLoadingTeams(true);
      setError("");

      try {
        const data = await getFixtureTeams();
        setTeams(data.teams || []);

        if (!home && data.teams?.length) {
          setHome(data.teams[0]);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load teams");
      } finally {
        setLoadingTeams(false);
      }
    }

    loadTeams();
  }, []);

  useEffect(() => {
    if (!home) return;

    async function loadOpponents() {
      setLoadingOpponents(true);
      setError("");
      setAway("");
      setOpponents([]);

      try {
        const data = await getTeamOpponents(home);
        setOpponents(data.opponents || []);

        if (data.opponents?.length) {
          setAway(data.opponents[0].opponent);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load opponents");
      } finally {
        setLoadingOpponents(false);
      }
    }

    loadOpponents();
  }, [home]);

  useEffect(() => {
    const update = () => setPrediction(loadTrip().prediction || {});

    window.addEventListener("aegis26:trip-updated", update);
    window.addEventListener("storage", update);

    return () => {
      window.removeEventListener("aegis26:trip-updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const selectedFixture = opponents.find((item) => item.opponent === away);

  async function runPrediction() {
    if (!home || !away) return;

    setLoading(true);
    setError("");

    try {
      const query = `i want to attend ${home} vs ${away} match
Departure city: Dammam
Budget: 10000 SAR
Trip style: Budget`;

      const data = await planTrip({
        query,
        thread_id: threadId,
      });

      setThreadId(data.thread_id || threadId);
      setPrediction(data.prediction || {});
      saveTrip({ ...data, query });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction request failed");
    } finally {
      setLoading(false);
    }
  }

  const team1Prob = prediction.team1_win_probability ?? 50;
  const team2Prob = prediction.team2_win_probability ?? 50;
  const drawProb = Math.max(0, 100 - team1Prob - team2Prob);

  const radar = useMemo(
    () => [
      { k: "Win %", A: team1Prob, B: team2Prob },
      { k: "Attack", A: 78 + team1Prob / 6, B: 78 + team2Prob / 6 },
      { k: "Form", A: 65 + team1Prob / 4, B: 65 + team2Prob / 4 },
      {
        k: "Confidence",
        A: prediction.confidence || 50,
        B: 100 - (prediction.confidence || 50),
      },
      { k: "ML Edge", A: Math.max(50, team1Prob), B: Math.max(50, team2Prob) },
    ],
    [team1Prob, team2Prob, prediction.confidence]
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <main className="pt-24 pb-16 max-w-7xl mx-auto px-6">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan mb-3">
              Real Fixture Prediction Engine
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter">
              Predict only{" "}
              <span className="gradient-text italic">real 2026 fixtures</span>
            </h1>

            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
              Select Team 1, then Team 2 will automatically show only the real
              opponents from the FIFA World Cup 2026 fixture dataset.
            </p>
          </div>

          <Link
            to="/planner"
            className="text-xs font-bold text-neon-cyan hover:underline"
          >
            Use full travel planner →
          </Link>
        </header>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-center mb-6">
          <TeamPicker
            label="Team 1"
            value={home}
            setValue={setHome}
            options={teams}
            disabled={loadingTeams}
          />

          <div className="text-center">
            <div className="text-3xl font-black italic gradient-text">VS</div>
            <div className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
              fixture locked
            </div>
          </div>

          <TeamPicker
            label="Team 2"
            value={away}
            setValue={setAway}
            options={opponents.map((item) => item.opponent)}
            disabled={!home || loadingOpponents}
          />
        </div>

        {selectedFixture && (
          <div className="mb-8 glass-panel rounded-2xl p-5 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-emerald-vibe" />
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-emerald-vibe">
                  Real Fixture Verified
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedFixture.match.team1} vs {selectedFixture.match.team2}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-[10px] uppercase text-muted-foreground">
                  Date
                </div>
                <div className="font-bold">{selectedFixture.match.date}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase text-muted-foreground">
                  Time
                </div>
                <div className="font-bold">{selectedFixture.match.time}</div>
              </div>

              <div>
                <div className="text-[10px] uppercase text-muted-foreground">
                  Venue
                </div>
                <div className="font-bold">{selectedFixture.match.ground}</div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 flex justify-center">
          <button
            onClick={runPrediction}
            disabled={loading || !home || !away}
            className="px-6 py-3 rounded-xl bg-neon-cyan text-navy text-xs font-black uppercase tracking-widest neon-glow disabled:opacity-50"
          >
            {loading ? "Running ML model…" : "Run ML Prediction"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 glass-panel rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 size-64 bg-neon-cyan/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-start justify-between mb-8 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neon-cyan">
                    AI Prediction
                  </div>

                  <div className="text-2xl font-bold mt-2">
                    {prediction.team1 || home} vs {prediction.team2 || away}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {prediction.model_type ||
                      "RandomForestClassifier · FastAPI backend"}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase text-muted-foreground tracking-widest">
                    Confidence
                  </div>

                  <div className="text-3xl font-bold text-emerald-vibe">
                    {prediction.confidence ?? 0}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-around py-8 border-y border-white/5 mb-6">
                <ScoreBox
                  team={prediction.team1 || home || "Team 1"}
                  goals={prediction.team1_goals ?? 0}
                  color="text-neon-cyan"
                />

                <div className="text-3xl text-muted-foreground font-mono">·</div>

                <ScoreBox
                  team={prediction.team2 || away || "Team 2"}
                  goals={prediction.team2_goals ?? 0}
                  color="text-trophy-gold"
                />
              </div>

              <div className="space-y-4">
                <ProbBar
                  label={prediction.team1 || home || "Team 1"}
                  pct={team1Prob}
                  cls="bg-gradient-to-r from-neon-cyan to-fifa-blue"
                />

                <ProbBar
                  label="Draw / volatility"
                  pct={drawProb}
                  cls="bg-white/20"
                />

                <ProbBar
                  label={prediction.team2 || away || "Team 2"}
                  pct={team2Prob}
                  cls="bg-trophy-gold"
                />
              </div>

              <div className="mt-8 relative h-28 rounded-2xl bg-gradient-to-b from-emerald-vibe/10 to-emerald-vibe/5 border border-emerald-vibe/10 overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-16 rounded-full border-2 border-white/10" />

                <div
                  className="absolute top-1/2 -translate-y-1/2 size-3 rounded-full bg-white shadow-[0_0_12px_white] animate-[float_3s_ease-in-out_infinite]"
                  style={{
                    left: `${45 + (team1Prob - team2Prob) / 3}%`,
                  }}
                />

                <div className="absolute bottom-2 right-3 text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                  ML sim · real fixture only
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div className="glass-panel rounded-3xl p-6 h-[340px]">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Strength Comparison
              </div>

              <div className="text-sm font-bold mb-2">
                {home || "Team 1"}{" "}
                <span className="text-neon-cyan">vs</span> {away || "Team 2"}
              </div>

              <ResponsiveContainer width="100%" height="85%">
                <RadarChart data={radar}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="k"
                    tick={{
                      fill: "oklch(0.65 0.02 255)",
                      fontSize: 10,
                    }}
                  />
                  <Radar
                    name={home}
                    dataKey="A"
                    stroke="oklch(0.88 0.16 200)"
                    fill="oklch(0.88 0.16 200)"
                    fillOpacity={0.3}
                  />
                  <Radar
                    name={away}
                    dataKey="B"
                    stroke="oklch(0.82 0.14 88)"
                    fill="oklch(0.82 0.14 88)"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-panel rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="size-4 text-neon-cyan" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
                  AI Insight
                </span>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                Predicted winner: <b>{prediction.winner || "Run the model"}</b>.
                Scoreline: <b>{prediction.score || "—"}</b>.
              </p>

              <div className="space-y-2">
                {(prediction.scorers || []).length ? (
                  prediction.scorers!.map((s, i) => (
                    <Scorer
                      key={`${s.player}-${i}`}
                      name={`${s.player} · ${s.team}`}
                      prob={Math.max(35, (prediction.confidence || 50) - i * 8)}
                    />
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground">
                    Expected scorers appear after prediction.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function ScoreBox({
  team,
  goals,
  color,
}: {
  team: string;
  goals: number;
  color: string;
}) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">
        {team}
      </div>

      <div className={`text-7xl font-black ${color}`}>{goals}</div>
    </div>
  );
}

function TeamPicker({
  label,
  value,
  setValue,
  options,
  disabled,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
  disabled?: boolean;
}) {
  return (
    <label className="glass-panel rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:border-neon-cyan/30 transition-colors">
      <div className="size-16 rounded-2xl bg-card border border-white/10 flex items-center justify-center">
        <span className="text-xl font-black italic">
          {(value || "---").slice(0, 3).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>

        <div className="relative">
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={disabled}
            className="text-lg font-bold bg-transparent appearance-none w-full pr-6 focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="" className="bg-card">
              Select {label}
            </option>

            {options.map((option) => (
              <option key={option} value={option} className="bg-card">
                {option}
              </option>
            ))}
          </select>

          <ChevronDown className="size-4 absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <Zap className="size-4 text-neon-cyan" />
    </label>
  );
}

function ProbBar({
  label,
  pct,
  cls,
}: {
  label: string;
  pct: number;
  cls: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-mono font-bold">{Math.round(pct)}%</span>
      </div>

      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cls}`}
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
          }}
        />
      </div>
    </div>
  );
}

function Scorer({ name, prob }: { name: string; prob: number }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span>{name}</span>

      <div className="flex items-center gap-2">
        <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-neon-cyan" style={{ width: `${prob}%` }} />
        </div>

        <span className="font-mono text-neon-cyan w-8 text-right">
          {prob}%
        </span>
      </div>
    </div>
  );
}