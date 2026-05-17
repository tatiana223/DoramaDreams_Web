import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Clapperboard, Loader2, Play, Star } from "lucide-react";
import { addHistoryRecord, getDoramaById } from "@/api/doramaApi";
import type { Dorama } from "@/types/dorama";
import { AppShell } from "@/components/app/AppShell";

export function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doramaId = Number(id);
  const [dorama, setDorama] = useState<Dorama | null>(null);
  const [episode, setEpisode] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doramaId) {
      navigate("/catalog");
      return;
    }
    loadDorama();
  }, [doramaId, navigate]);

  async function loadDorama() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getDoramaById(doramaId);
      setDorama(data);
      await addHistoryRecord(doramaId, 1, "WATCHING");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось открыть просмотр");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEpisode(nextEpisode: number) {
    setEpisode(nextEpisode);
    setMessage("");
    try {
      await addHistoryRecord(doramaId, nextEpisode, "WATCHING");
      setMessage(`Серия ${nextEpisode} сохранена в истории просмотра`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить серию");
    }
  }

  async function handleComplete() {
    setMessage("");
    try {
      await addHistoryRecord(doramaId, episode, "COMPLETED");
      setMessage("Дорама отмечена как просмотренная");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить статус");
    }
  }

  if (isLoading) {
    return <AppShell><div className="flex min-h-[80vh] items-center justify-center text-violet-700 dark:text-violet-200"><Loader2 className="h-8 w-8 animate-spin" /></div></AppShell>;
  }

  if (!dorama) {
    return <AppShell><div className="mx-auto max-w-4xl px-6 py-12"><p className="rounded-3xl bg-red-500/10 p-5 text-red-700 dark:text-red-100">{error || "Дорама не найдена"}</p></div></AppShell>;
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <Link to={`/doramas/${dorama.doramaId}`} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground dark:text-white/60 transition hover:text-foreground dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Назад к описанию
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/50">
            <div className="relative aspect-video bg-black">
              {dorama.videoUrl ? (
                <video
                  src={dorama.videoUrl}
                  controls
                  className="h-full w-full bg-black object-contain"
                />
              ) : (
                <>
                  {dorama.posterUrl && (
                    <img
                      src={dorama.posterUrl}
                      alt={dorama.title}
                      className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm"
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                  <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
                    <button className="flex h-20 w-20 items-center justify-center rounded-full bg-violet-600 text-white shadow-2xl transition hover:scale-105">
                      <Play className="ml-1 h-9 w-9 fill-current" />
                    </button>

                    <p className="mt-5 text-sm font-bold uppercase tracking-[0.3em] text-white/45">
                      демо-плеер
                    </p>

                    <h1 className="mt-3 max-w-3xl text-3xl font-black text-white md:text-5xl">
                      {dorama.title}
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                      Видео пока не добавлено. Для диплома можно хранить videoUrl у дорамы
                      или отдельные videoUrl у каждой серии.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-5 backdrop-blur-xl">
            <div className="flex gap-4">
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-background/70 dark:bg-white/10">
                {dorama.posterUrl && <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover" />}
              </div>
              <div>
                <h2 className="text-xl font-black">{dorama.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground dark:text-white/45">{dorama.releaseYear || "Год не указан"}</p>
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-background/70 dark:bg-white/10 px-3 py-1 text-sm font-bold text-fuchsia-700 dark:text-fuchsia-100"><Star className="h-4 w-4 fill-fuchsia-300 text-fuchsia-300" />{dorama.averageRating?.toFixed(1) || "—"}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-bold">Серии</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }).map((_, index) => {
                  const value = index + 1;
                  return <button key={value} onClick={() => handleEpisode(value)} className={`rounded-2xl px-3 py-3 text-sm font-black transition ${episode === value ? "bg-violet-600 text-white" : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15 dark:hover:text-white"}`}>{value}</button>;
                })}
              </div>
            </div>

            <button onClick={handleComplete} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 font-bold text-white">
              <Clapperboard className="h-5 w-5" />
              Отметить просмотренной
            </button>

            {message && <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-100">{message}</p>}
            {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-700 dark:text-red-100">{error}</p>}
          </aside>
        </section>
      </div>
    </AppShell>
  );
}
