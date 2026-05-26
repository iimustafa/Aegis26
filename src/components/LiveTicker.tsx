const matches = [
  { m: "USA 2-1 ENG", t: "LIVE 78'" },
  { m: "MEX 0-0 ARG", t: "HT" },
  { m: "CAN 3-2 GER", t: "FT" },
  { m: "BRA 1-0 FRA", t: "LIVE 54'" },
  { m: "JPN 2-2 ESP", t: "LIVE 89'" },
  { m: "POR 1-1 NED", t: "FT" },
  { m: "ITA 0-2 BEL", t: "LIVE 67'" },
  { m: "CRO 3-1 MAR", t: "FT" },
];

export function LiveTicker() {
  const loop = [...matches, ...matches];
  return (
    <div className="relative z-40 w-full border-y border-white/5 bg-background/80 backdrop-blur-md overflow-hidden">
      <div className="flex items-center">
        <div className="shrink-0 px-4 py-2 bg-trophy-gold/10 border-r border-trophy-gold/20 flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-trophy-gold animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-trophy-gold">Live</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-10 whitespace-nowrap py-2 animate-marquee w-max">
            {loop.map((m, i) => (
              <span key={i} className="flex items-center gap-3 text-xs">
                <span className="font-mono font-semibold">{m.m}</span>
                <span className="text-[10px] text-muted-foreground uppercase">{m.t}</span>
                <span className="text-white/20">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
