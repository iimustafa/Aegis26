import { Link } from "@tanstack/react-router";

const links = [
  { to: "/planner", label: "Planner" },
  { to: "/analytics", label: "Analytics" },
  { to: "/predict", label: "Match Engine" },
  { to: "/budget", label: "Budget" },
  { to: "/map", label: "Host Map" },
];

export function SiteNav() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="relative inline-flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-fifa-blue to-neon-cyan">
            <span className="absolute inset-0 rounded-lg bg-gradient-to-br from-fifa-blue to-neon-cyan blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-[10px] font-black text-navy">A26</span>
          </span>
          <span className="font-bold tracking-tight text-base uppercase italic">
            Aegis<span className="text-neon-cyan">26</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 glass-panel rounded-full px-1.5 py-1.5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-full transition-colors data-[status=active]:text-foreground data-[status=active]:bg-white/5"
              activeProps={{ "data-status": "active" } as Record<string, string>}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <Link
          to="/planner"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-neon-cyan text-navy rounded-full text-xs font-bold uppercase tracking-wider hover:scale-[1.03] transition-transform neon-glow"
        >
          Launch <span aria-hidden>→</span>
        </Link>
      </div>
    </nav>
  );
}
