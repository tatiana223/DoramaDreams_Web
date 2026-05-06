import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Heart } from "lucide-react";
import { loginUser } from "@/api/authApi";
import { saveAuthData } from "@/api/authStorage";

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      navigate("/profile");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось войти");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8ff] px-6">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 shadow-sm">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <Heart className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-bold leading-none">DoramaDreams</p>
            <p className="mt-1 text-xs text-slate-500">вход в аккаунт</p>
          </div>
        </Link>

        <h1 className="text-3xl font-black tracking-tight">Вход</h1>
        <p className="mt-2 text-sm text-slate-500">
          Войди в аккаунт, чтобы открыть избранное, историю и рекомендации.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-violet-100 px-4 py-3 outline-none transition focus:border-violet-400"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Пароль
            </label>
            <input
              type="password"
              className="mt-2 w-full rounded-2xl border border-violet-100 px-4 py-3 outline-none transition focus:border-violet-400"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
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

        <p className="mt-6 text-center text-sm text-slate-500">
          Нет аккаунта?{" "}
          <Link to="/register" className="font-semibold text-violet-700">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  );
}