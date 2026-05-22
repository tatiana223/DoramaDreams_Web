import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, KeyRound, LogOut, Mail, Save, ShieldCheck, User, UserRoundCog } from "lucide-react";
import { updateCurrentUser } from "@/api/authApi";
import { clearAuthData, getCurrentUser, saveAuthData } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";

type ProfileFormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());
  const [form, setForm] = useState<ProfileFormState>(() => ({
    username: user?.username ?? "",
    email: user?.email ?? "",
    password: "",
    confirmPassword: "",
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleLogout() {
    clearAuthData();
    navigate("/");
  }

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const username = form.username.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!username || !email) {
      setErrorMessage("Имя пользователя и email не могут быть пустыми");
      return;
    }

    if (password && password !== confirmPassword) {
      setErrorMessage("Пароли не совпадают");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const updatedUser = await updateCurrentUser({
        username,
        email,
        ...(password ? { password } : {}),
      });

      saveAuthData(updatedUser);
      setUser(updatedUser);
      setForm({
        username: updatedUser.username,
        email: updatedUser.email,
        password: "",
        confirmPassword: "",
      });
      setSuccessMessage("Профиль успешно обновлён");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Не удалось обновить профиль");
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return null;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30 md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/75">
                <UserRoundCog className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-200" />
                настройки аккаунта
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">
                Профиль
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                Здесь можно посмотреть данные аккаунта и изменить имя пользователя, email или пароль.
              </p>

              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white transition hover:opacity-95"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Открыть админ-профиль
                </Link>
              )}
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

        <section className="mt-7 rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 md:p-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <h2 className="text-2xl font-black">Редактирование профиля</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
                После изменения email backend выдаёт новый JWT-токен, поэтому повторный вход не потребуется.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-muted-foreground dark:text-white/65">
                Имя пользователя
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <User className="h-5 w-5 shrink-0 text-violet-700 dark:text-violet-200" />
                  <input
                    value={form.username}
                    onChange={(event) => updateField("username", event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-base font-bold text-foreground outline-none placeholder:text-muted-foreground/70 dark:text-white"
                    placeholder="Введите имя пользователя"
                    disabled={isSaving}
                  />
                </div>
              </label>

              <label className="grid gap-2 text-sm font-bold text-muted-foreground dark:text-white/65">
                Email
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <Mail className="h-5 w-5 shrink-0 text-violet-700 dark:text-violet-200" />
                  <input
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    type="email"
                    className="min-w-0 flex-1 bg-transparent text-base font-bold text-foreground outline-none placeholder:text-muted-foreground/70 dark:text-white"
                    placeholder="Введите email"
                    disabled={isSaving}
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-muted-foreground dark:text-white/65">
                Новый пароль
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <KeyRound className="h-5 w-5 shrink-0 text-violet-700 dark:text-violet-200" />
                  <input
                    value={form.password}
                    onChange={(event) => updateField("password", event.target.value)}
                    type="password"
                    className="min-w-0 flex-1 bg-transparent text-base font-bold text-foreground outline-none placeholder:text-muted-foreground/70 dark:text-white"
                    placeholder="Оставь пустым, если не меняешь"
                    disabled={isSaving}
                  />
                </div>
              </label>

              <label className="grid gap-2 text-sm font-bold text-muted-foreground dark:text-white/65">
                Повтор нового пароля
                <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <KeyRound className="h-5 w-5 shrink-0 text-violet-700 dark:text-violet-200" />
                  <input
                    value={form.confirmPassword}
                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                    type="password"
                    className="min-w-0 flex-1 bg-transparent text-base font-bold text-foreground outline-none placeholder:text-muted-foreground/70 dark:text-white"
                    placeholder="Повтори новый пароль"
                    disabled={isSaving}
                  />
                </div>
              </label>
            </div>

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-700 dark:text-red-200">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-700 dark:text-emerald-200">
                <CheckCircle2 className="h-4 w-4" />
                {successMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Сохранение..." : "Сохранить изменения"}
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => {
                  setForm({
                    username: user.username,
                    email: user.email,
                    password: "",
                    confirmPassword: "",
                  });
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="rounded-2xl border border-border/70 bg-background/60 px-5 py-3 text-center text-sm font-bold text-muted-foreground transition hover:bg-background/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Сбросить
              </button>
            </div>
          </form>
        </section>

        <section className="mt-7 rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 md:p-8">
          <h2 className="text-2xl font-black">Мои разделы</h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
            Тут живут твои дорамные сокровища
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/bookmarks"
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-center text-sm font-black text-white"
            >
              Перейти в закладки
            </Link>

            <Link
              to="/catalog"
              className="rounded-2xl border border-border/70 bg-background/60 px-5 py-3 text-center text-sm font-bold text-muted-foreground transition hover:bg-background/70 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Открыть каталог
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function AccountCard({
  icon: Icon,
  title,
  value,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.7rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70 text-fuchsia-700 dark:bg-white/10 dark:text-fuchsia-100">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40">
        {title}
      </p>

      <p className="mt-2 break-words text-xl font-black text-foreground dark:text-white">
        {value}
      </p>
    </div>
  );
}
