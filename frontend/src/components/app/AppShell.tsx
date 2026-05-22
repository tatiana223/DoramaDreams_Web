import { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { Bookmark, ChevronDown, Home, LogOut, Menu, Search, ShieldCheck, Sparkles, User, UsersRound } from "lucide-react";
import { clearAuthData, getCurrentUser } from "@/api/authStorage";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const publicNavItems = [
  { to: "/catalog", label: "Дорамы", icon: Search },
  { to: "/actors", label: "Актёры", icon: UsersRound },
];

const privateNavItems = [
  ...publicNavItems,
  { to: "/bookmarks", label: "Закладки", icon: Bookmark },
  { to: "/profile", label: "Профиль", icon: User },
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const navItems = user
    ? user.role === "ADMIN"
      ? [...privateNavItems, { to: "/admin", label: "Админ", icon: ShieldCheck }]
      : privateNavItems
    : publicNavItems;

  const currentNavItem = navItems.find((item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)) ?? navItems[0];
  const CurrentIcon = currentNavItem.icon;

  function handleLogout() {
    clearAuthData();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.12),transparent_30%),linear-gradient(135deg,var(--background),var(--background))] dark:bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.28),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(236,72,153,0.20),transparent_30%),linear-gradient(135deg,#0b0714,#181026_55%,#0d0718)]" />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/catalog" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black leading-none tracking-tight">DoramaDreams</p>
              <p className="mt-1 hidden text-xs text-muted-foreground sm:block">смотреть · сохранять · обсуждать</p>
            </div>
          </Link>

          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-4 py-2 text-sm font-black text-foreground shadow-sm transition hover:bg-accent">
                  <Menu className="h-4 w-4 text-muted-foreground" />
                  <CurrentIcon className="h-4 w-4 text-violet-700 dark:text-violet-200" />
                  <span>{currentNavItem.label}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 rounded-2xl border border-border/70 bg-card/95 p-2 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#171020]/95">
                <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground dark:text-white/45">
                  Меню разделов
                </DropdownMenuLabel>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.to} asChild className="p-0">
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold outline-none transition ${
                            isActive
                              ? "bg-violet-600 text-white"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white"
                          }`
                        }
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </NavLink>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="p-0">
                  <Link to="/" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-accent hover:text-foreground dark:text-white/65 dark:hover:bg-white/10 dark:hover:text-white">
                    <Home className="h-4 w-4" />
                    Главная
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/" className="hidden rounded-full border border-border/70 bg-card/50 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground lg:inline-flex">
              <Home className="mr-2 h-4 w-4" />
              Главная
            </Link>
            {user ? (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-full border border-border/70 bg-card/50 px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-accent hover:text-foreground"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="hidden rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700 sm:inline-flex"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 grid gap-1 rounded-[1.6rem] border border-border/70 bg-background/90 p-2 shadow-2xl backdrop-blur-xl md:hidden"
        style={{ gridTemplateColumns: `repeat(${navItems.length}, minmax(0, 1fr))` }}
      >
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
