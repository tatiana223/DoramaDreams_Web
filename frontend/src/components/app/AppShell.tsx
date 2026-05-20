import { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Bookmark, Home, LogOut, Search, Sparkles, User } from "lucide-react";
import { clearAuthData, getCurrentUser } from "@/api/authStorage";
import { ThemeToggle } from "@/components/app/ThemeToggle";

const navItems = [
  { to: "/catalog", label: "Дорамы", icon: Search },
  { to: "/bookmarks", label: "Закладки", icon: Bookmark },
  { to: "/profile", label: "Профиль", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleLogout() {
    clearAuthData();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.12),transparent_30%),linear-gradient(135deg,var(--background),var(--background))] dark:bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.28),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.20),transparent_30%),linear-gradient(135deg,#0b0714,#181026_55%,#0d0718)]" />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/catalog" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-black leading-none tracking-tight">DoramaDreams</p>
              <p className="mt-1 text-xs text-muted-foreground">смотреть · сохранять · обсуждать</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/70 p-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/" className="hidden rounded-full border border-border/70 bg-card/50 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground lg:inline-flex">
              <Home className="mr-2 h-4 w-4" />
              Welcome
            </Link>
            {user && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 gap-1 rounded-[1.6rem] border border-border/70 bg-background/90 p-2 shadow-2xl backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold ${
                  isActive ? "bg-violet-600 text-white" : "text-muted-foreground"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
