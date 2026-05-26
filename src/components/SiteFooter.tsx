export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 mt-32">
      <div className="max-w-7xl mx-auto px-6 py-16 grid gap-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="size-6 rounded-md bg-gradient-to-br from-fifa-blue to-neon-cyan" />
            <span className="font-bold tracking-tight uppercase italic">Aegis<span className="text-neon-cyan">26</span></span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            The definitive travel intelligence platform for the FIFA 2026 World Cup. Powered by neural networks and real-time logistics.
          </p>
        </div>
        {[
          { h: "Platform", l: ["Trip Planner", "Match Engine", "Analytics", "Budget AI"] },
          { h: "Intelligence", l: ["ML Models", "Live Data", "Predictions", "Insights"] },
          { h: "Company", l: ["About", "Security", "Privacy", "Contact"] },
        ].map((col) => (
          <div key={col.h} className="flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{col.h}</span>
            {col.l.map((i) => (
              <a key={i} href="#" className="text-sm text-muted-foreground hover:text-neon-cyan transition-colors">{i}</a>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>© 2026 Aegis Intelligence — Developed by Mustafa Al Ali</span>
          <span className="font-mono">٢٠٢٦ · 🇸🇦 يا اخضر معاك الله</span>
        </div>
      </div>
    </footer>
  );
}
