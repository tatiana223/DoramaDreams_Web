import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

const heroPhrases = [
    "Добро пожаловать в мир дорам!",
  "Дорамы, которые хочется досмотреть",
  "Найди историю под своё настроение",
  "Сохраняй любимые дорамы в одном месте",
  "Открывай новые истории каждый день",
  "Истории, к которым хочется прикоснуться",
  "Любимые дорамы под сырный рамен"
];

export function HomePage() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setPhraseIndex((currentIndex) =>
          currentIndex === heroPhrases.length - 1 ? 0 : currentIndex + 1
        );
        setIsVisible(true);
      }, 250);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-svh overflow-hidden bg-[#faf8ff] text-slate-950">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
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

      <main className="relative">
        <div className="absolute left-1/2 top-4 -z-10 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-violet-200/40 blur-3xl" />

        <section className="mx-auto flex h-[calc(100svh-4rem)] max-w-5xl flex-col items-center justify-center px-6 pb-8 text-center">
          <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-medium text-violet-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            DoramaDreams
          </div>

          <h1
            className={`min-h-[7rem] max-w-4xl text-center text-4xl font-black tracking-tight text-slate-950 transition-all duration-300 sm:text-5xl md:min-h-[9rem] md:text-6xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            {heroPhrases[phraseIndex]}
          </h1>

          <p className="mt-2 max-w-2xl text-center text-base leading-7 text-slate-600 sm:text-lg">
            Ищи новые истории, сохраняй избранное, отмечай просмотренные серии,
            оставляй отзывы и получай персональные рекомендации.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

          <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
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
      <p className="mt-2 text-sm leading-5 text-slate-500">{text}</p>
    </div>
  );
}