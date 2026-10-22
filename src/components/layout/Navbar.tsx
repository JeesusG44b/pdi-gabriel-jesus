import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles, LogOut, ShieldCheck, Sun, Moon } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { logoutFn } from "@/api/auth";
import { profile } from "@/data/profile";

function ThemeToggle({ className = "" }: { className?: string }) {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition ${className}`}
      title="Alternar tema"
      aria-label="Alternar tema claro/escuro"
    >
      <Sun className="h-4 w-4 dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </button>
  );
}

// Ordem do menu (SPEC 3): Sobre, Objetivo, Metas, Roadmap, Contribuições, Soft Skills.
const links = [
  { to: "/", label: "Sobre" },
  { to: "/objetivo-carreira", label: "Objetivo" },
  { to: "/metas", label: "Metas" },
  { to: "/roadmap", label: "Roadmap" },
  { to: "/contribuicoes", label: "Contribuições" },
  { to: "/soft-skills", label: "Soft Skills" },
] as const;

// Faixa tricolor de 4 px (SPEC 6.1): azul, branco e vermelho com larguras iguais.
function TricolorBar() {
  return (
    <div className="flex h-1 w-full" aria-hidden="true">
      <span className="flex-1 bg-primary" />
      <span className="flex-1 bg-tricolor-white" />
      <span className="flex-1 bg-accent" />
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const handleLogout = async () => {
    await logoutFn();
    await router.invalidate();
  };

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <TricolorBar />
      <nav className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl tracking-wide">
          <span className="h-8 w-8 rounded-xl gradient-primary flex items-center justify-center text-white shadow-soft">
            <Sparkles className="h-4 w-4" />
          </span>
          <span>PDI {profile.name}</span>
        </Link>
        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="px-3 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                activeProps={{
                  className:
                    "px-3 py-2 rounded-full text-sm font-medium gradient-primary text-white shadow-soft",
                }}
                activeOptions={{ exact: true }}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <li className="flex items-center gap-1 ml-2">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/[0.06] text-success border border-success/30 dark:bg-success/10">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                title="Sair"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </li>
          )}
          <li className="ml-1">
            <ThemeToggle />
          </li>
        </ul>
        <div className="lg:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className="p-2 rounded-lg hover:bg-secondary"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div id="menu-mobile" className="lg:hidden border-t border-border animate-fade-in">
          <ul className="px-4 py-3 space-y-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary"
                  activeProps={{
                    className:
                      "block px-3 py-2 rounded-lg text-sm font-medium gradient-primary text-white",
                  }}
                  activeOptions={{ exact: true }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" /> Sair (Admin)
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
