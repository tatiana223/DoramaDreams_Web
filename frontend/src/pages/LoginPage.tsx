import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { loginUser } from "@/api/authApi";
import { isAuthenticated, saveAuthData } from "@/api/authStorage";
import { ThemeToggle } from "@/components/app/ThemeToggle";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/catalog");
    }
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const authResponse = await loginUser({
        email: email.trim(),
        password,
      });

      saveAuthData(authResponse);
      navigate("/catalog");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.22),transparent_35%),linear-gradient(135deg,rgba(250,248,255,1),rgba(245,240,255,0.9))] dark:bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.24),transparent_35%),linear-gradient(135deg,#0f0717,#1a1026,#08050d)]" />

      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card/95 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur dark:border-white/10 dark:bg-white/[0.07] sm:p-8">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <Heart className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-bold leading-none text-foreground dark:text-white">
              DoramaDreams
            </p>
            <p className="mt-1 text-xs text-muted-foreground dark:text-white/50">
              вход в аккаунт
            </p>
          </div>
        </Link>

        <h1 className="text-3xl font-black tracking-tight text-foreground dark:text-white">
          Вход
        </h1>

        <p className="mt-2 text-sm text-muted-foreground dark:text-white/55">
          Войди в аккаунт, чтобы открыть избранное, историю и рекомендации.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-foreground dark:text-white/80">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-violet-400 dark:border-white/10 dark:bg-[#171020] dark:text-white"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground dark:text-white/80">
              Пароль
            </label>
            <input
              type="password"
              autoComplete="current-password"
              minLength={6}
              className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-violet-400 dark:border-white/10 dark:bg-[#171020] dark:text-white"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground dark:text-white/55">
          Нет аккаунта?{" "}
          <Link to="/register" className="font-semibold text-violet-700 dark:text-violet-300">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}