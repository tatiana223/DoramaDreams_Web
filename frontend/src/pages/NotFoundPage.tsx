import { Link } from "react-router";
import { ArrowLeft, Search } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";

export function NotFoundPage() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
        <section className="w-full rounded-[2rem] border border-border/70 bg-card/90 p-8 text-center shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-background/80 text-violet-700 dark:bg-white/10 dark:text-violet-200">
            <Search className="h-8 w-8" />
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-fuchsia-700 dark:text-fuchsia-200/80">404</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Страница не найдена</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground dark:text-white/55">
            Такой страницы в DoramaDreams пока нет. Вернись в каталог и выбери дораму из доступных карточек.
          </p>
          <Link
            to="/catalog"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
          >
            <ArrowLeft className="h-4 w-4" />
            В каталог
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
