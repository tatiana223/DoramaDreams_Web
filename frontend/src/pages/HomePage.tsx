import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/app/ThemeToggle";

const heroPhrases = [
  "Дорамы, которые хочется досмотреть",
  "Найди историю под своё настроение",
  "Сохраняй любимые дорамы в одном месте",
  "Открывай новые истории каждый день",
  "Истории, к которым хочется прикоснуться",
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
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground transition-colors">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,0.28),transparent_32%),radial-gradient(circle_at_82%_24%,rgba(236,72,153,0.20),transparent_30%),linear-gradient(135deg,#fff7fb_0%,#f5f0ff_48%,#eef7ff_100%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,0.34),transparent_32%),radial-gradient(circle_at_82%_24%,rgba(236,72,153,0.24),transparent_30%),linear-gradient(135deg,#080512_0%,#160d26_52%,#0b0714_100%)]" />
      <div className="absolute left-1/2 top-20 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-600/20" />

      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
            <Heart className="h-5 w-5" />
          </div>

          <div>
            <p className="text-lg font-bold leading-none">DoramaDreams</p>
            <p className="mt-1 text-xs text-muted-foreground">твой мир дорам</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" className="transition hover:text-foreground">
            О проекте
          </Link>
          <Link to="/catalog" className="transition hover:text-foreground">
            Каталог
          </Link>
          <Link to="/profile" className="transition hover:text-foreground">
            Профиль
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="rounded-full border border-border/70 bg-card/75 px-5 py-2 text-sm font-semibold text-violet-700 shadow-sm backdrop-blur transition hover:bg-accent dark:text-violet-200"
          >
            Войти
          </Link>
        </div>
      </header>

      <main className="relative">
        <section className="mx-auto flex h-[calc(100svh-4rem)] max-w-5xl flex-col items-center justify-center px-6 pb-8 text-center">
          <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-card/75 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm backdrop-blur dark:text-violet-200">
            <Sparkles className="h-4 w-4" />
            Добро пожаловать в DoramaDreams!
          </div>

          <h1
            className={`min-h-[7rem] max-w-4xl text-center text-4xl font-black tracking-tight transition-all duration-300 sm:text-5xl md:min-h-[9rem] md:text-6xl ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            {heroPhrases[phraseIndex]}
          </h1>

          <p className="mt-2 max-w-2xl text-center text-base leading-7 text-muted-foreground sm:text-lg">
            Ищи новые истории, сохраняй избранное, отмечай просмотренные серии,
            оставляй отзывы и получай персональные рекомендации.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-90"
            >
              Войти
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border border-border/70 bg-card/75 px-8 py-3 text-base font-semibold text-violet-700 shadow-sm backdrop-blur transition hover:bg-accent dark:text-violet-200"
            >
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            <Feature title="Избранное" text="сохраняй дорамы, которые хочешь посмотреть" />
            <Feature title="История" text="отслеживай серии и статус просмотра" />
            <Feature title="Рекомендации" text="получай подборки под свои интересы" />
          </div>
        </section>
      </main>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-card/75 p-5 text-left shadow-sm backdrop-blur">
      <p className="font-bold">{title}</p>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
