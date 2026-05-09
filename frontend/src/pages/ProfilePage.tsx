import { Link, useNavigate } from "react-router";
import { LogOut, Mail, ShieldCheck, User, UserRoundCog } from "lucide-react";
import { clearAuthData, getCurrentUser } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";

export function ProfilePage() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  function handleLogout() {
    clearAuthData();
    navigate("/");
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-6 shadow-2xl shadow-violet-950/10 dark:shadow-black/30 backdrop-blur-xl md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/70 dark:bg-white/10 px-4 py-2 text-sm font-bold text-muted-foreground dark:text-white/75">
                <UserRoundCog className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-200" />
                настройки аккаунта
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Профиль</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                Здесь только данные аккаунта и настройки. Закладки, избранное и списки просмотра вынесены на отдельную страницу.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-background/80 px-5 py-3 text-sm font-black text-foreground transition hover:bg-accent dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </section>

        <div className="mt-7 grid gap-5 md:grid-cols-3">
          <AccountCard icon={User} title="Имя пользователя" value={user.username} />
          <AccountCard icon={Mail} title="Email" value={user.email} />
          <AccountCard icon={ShieldCheck} title="Роль" value={user.role} />
        </div>

        <section className="mt-7 rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-6 shadow-xl shadow-violet-950/10 dark:shadow-black/20 backdrop-blur-xl md:p-8">
          <h2 className="text-2xl font-black">Мои разделы</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
            Переходи в медиатеку, чтобы управлять избранным, статусами просмотра и рекомендациями.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link to="/bookmarks" className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-center text-sm font-black text-white">
              Перейти в закладки
            </Link>
            <Link to="/catalog" className="rounded-2xl border border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/60 dark:bg-white/5 px-5 py-3 text-center text-sm font-bold text-muted-foreground dark:text-white/75 transition hover:bg-background/70 dark:bg-white/10 hover:text-foreground dark:hover:text-white">
              Открыть каталог
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function AccountCard({ icon: Icon, title, value }: { icon: typeof User; title: string; value: string }) {
  return (
    <div className="rounded-[1.7rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-6 shadow-xl shadow-violet-950/10 dark:shadow-black/20 backdrop-blur-xl">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 dark:bg-white/10 text-fuchsia-700 dark:text-fuchsia-100">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40">{title}</p>
      <p className="mt-2 break-words text-xl font-black text-foreground dark:text-white">{value}</p>
    </div>
  );
}
