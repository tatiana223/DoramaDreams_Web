import { Link } from "react-router";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-950">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-sm">
            <Heart className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-bold leading-none">DoramaDreams</p>
            <p className="mt-1 text-xs text-slate-500">твой мир дорам</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link to="/" className="transition hover:text-violet-700">
            О проекте
          </Link>
          <Link to="/catalog" className="transition hover:text-violet-700">
            Каталог
          </Link>
          <Link to="/profile" className="transition hover:text-violet-700">
            Профиль
          </Link>
        </nav>

        <Link
          to="/login"
          className="rounded-full border border-violet-200 bg-white px-5 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
        >
          Войти
        </Link>
      </header>

      <main className="relative overflow-hidden">
        <div className="absolute left-1/2 top-16 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl" />

        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            добро пожаловать в DoramaDreams
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl md:text-7xl">
            Добро пожаловать в мир дорам
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Ищи дорамы, сохраняй избранное, отмечай просмотренные серии,
            оставляй отзывы и получай персональные рекомендации.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-violet-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
            >
              Войти
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-white px-8 py-3 text-base font-semibold text-violet-700 transition hover:bg-violet-50"
            >
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-14 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            <Feature
              title="Избранное"
              text="сохраняй дорамы, которые хочешь посмотреть"
            />
            <Feature
              title="История"
              text="отслеживай серии и статус просмотра"
            />
            <Feature
              title="Рекомендации"
              text="получай подборки под свои интересы"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-5 text-left shadow-sm">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}