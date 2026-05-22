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
          currentIndex === heroPhrases.length - 1 ? 0 : currentIndex + 1,
        );
        setIsVisible(true);
      }, 250);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground transition-colors">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_18%,rgba(139,92,246,0.30),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(236,72,153,0.22),transparent_26%),radial-gradient(circle_at_50%_85%,rgba(59,130,246,0.18),transparent_30%),linear-gradient(135deg,#fff8fc_0%,#f6f0ff_45%,#eef6ff_100%)] dark:bg-[radial-gradient(circle_at_12%_18%,rgba(139,92,246,0.36),transparent_28%),radial-gradient(circle_at_88%_20%,rgba(236,72,153,0.26),transparent_26%),radial-gradient(circle_at_50%_85%,rgba(59,130,246,0.16),transparent_30%),linear-gradient(135deg,#070511_0%,#140b24_50%,#0b1020_100%)]" />
      <div className="absolute left-[15%] top-[30%] -z-10 h-[320px] w-[320px] rounded-full bg-fuchsia-300/25 blur-3xl dark:bg-fuchsia-600/15" />
      <div className="absolute right-[10%] bottom-[12%] -z-10 h-[360px] w-[360px] rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-600/10" />

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
        <section className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
          <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-card/75 px-4 py-2 text-sm font-medium text-violet-700 shadow-sm backdrop-blur dark:text-violet-200">
            <Sparkles className="h-4 w-4" />
            Добро пожаловать в DoramaDreams!
          </div>

          <h1
            className={`min-h-[7rem] max-w-4xl text-center text-4xl font-black tracking-tight transition-all duration-300 sm:text-5xl md:min-h-[9rem] md:text-6xl bg-gradient-to-r from-violet-700 via-fuchsia-600 to-sky-500 bg-clip-text text-transparent ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            {heroPhrases[phraseIndex]}
          </h1>

          <p className="mt-2 max-w-2xl text-center text-base leading-7 text-muted-foreground sm:text-lg">
            Устраивай дорамные вечера вместе с DoramaDreams ✨
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
            <Feature title="Избранное" text="самое любимое" />
            <Feature title="История" text="всё под контролем" />
            <Feature title="Рекомендации" text="магия под твой вкус" />
          </div>
        </section>


      </main>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-white/80 to-violet-50/70 p-5 text-left shadow-sm backdrop-blur dark:border-white/10 dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-violet-500/[0.06]">
      <p className="font-bold">{title}</p>
      <p className="mt-2 text-sm leading-5 text-muted-foreground dark:text-white/55">{text}</p>
    </div>
  );
}
