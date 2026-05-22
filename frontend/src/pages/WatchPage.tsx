import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Clapperboard, Loader2, Play, Star } from "lucide-react";
import {
  addHistoryRecord,
  getDoramaById,
  getDoramaEpisodes,
} from "@/api/doramaApi";
import type { Dorama, DoramaEpisode } from "@/types/dorama";
import { AppShell } from "@/components/app/AppShell";

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function isEmbeddableUrl(url: string) {
  return (
    url.includes("youtube.com/embed/") ||
    url.includes("vkvideo.ru/video_ext.php") ||
    url.includes("vk.com/video_ext.php") ||
    url.includes("vk.ru/video_ext.php") ||
    url.includes("player.") ||
    url.includes("/embed/")
  );
}

export function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doramaId = Number(id);

  const [dorama, setDorama] = useState<Dorama | null>(null);
  const [episodes, setEpisodes] = useState<DoramaEpisode[]>([]);
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentEpisode = useMemo(() => {
    return episodes.find((episode) => episode.episodeNumber === currentEpisodeNumber) ?? null;
  }, [episodes, currentEpisodeNumber]);

  useEffect(() => {
    if (!doramaId) {
      navigate("/catalog");
      return;
    }

    loadPage();
  }, [doramaId, navigate]);

  async function loadPage() {
    setIsLoading(true);
    setError("");

    try {
      const doramaData = await getDoramaById(doramaId);
      const episodesData = await getDoramaEpisodes(doramaId, {
        doramaTitle: doramaData.title,
        withMockVideoFallback: true,
      });

      setDorama(doramaData);
      setEpisodes(episodesData);

      if (episodesData.length > 0) {
        const firstEpisode = episodesData[0];
        setCurrentEpisodeNumber(firstEpisode.episodeNumber);
        await addHistoryRecord(doramaId, firstEpisode.episodeNumber, "WATCHING");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось открыть просмотр");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEpisode(nextEpisodeNumber: number) {
    setCurrentEpisodeNumber(nextEpisodeNumber);
    setMessage("");
    setError("");

    try {
      await addHistoryRecord(doramaId, nextEpisodeNumber, "WATCHING");
      setMessage(`Серия ${nextEpisodeNumber} сохранена в истории просмотра`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить серию");
    }
  }

  async function handleComplete() {
    if (!currentEpisodeNumber) return;

    setMessage("");
    setError("");

    try {
      await addHistoryRecord(doramaId, currentEpisodeNumber, "COMPLETED");
      setMessage("Дорама отмечена как просмотренная");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить статус");
    }
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[80vh] items-center justify-center text-violet-700 dark:text-violet-200">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (!dorama) {
    return (
      <AppShell>
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="rounded-3xl bg-red-500/10 p-5 text-red-700 dark:text-red-100">
            {error || "Дорама не найдена"}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <Link
          to={`/doramas/${dorama.doramaId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground dark:text-white/60 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к описанию
        </Link>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/50">
            <div className="relative aspect-video bg-black">
              {currentEpisode ? (
                <Player episode={currentEpisode} />
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
                      видео не добавлено
                    </p>

                    <h1 className="mt-3 max-w-3xl text-3xl font-black text-white md:text-5xl">
                      {dorama.title}
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
                      Администратор пока не добавил серии для этой дорамы.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className="rounded-[2rem] border border-border/70 bg-card/85 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="flex gap-4">
              <div className="h-28 w-20 shrink-0 overflow-hidden rounded-2xl bg-background/70 dark:bg-white/10">
                {dorama.posterUrl && (
                  <img
                    src={dorama.posterUrl}
                    alt={dorama.title}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div>
                <h2 className="text-xl font-black">{dorama.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground dark:text-white/45">
                  {[dorama.countryName, dorama.releaseYear || null, dorama.duration ? `${dorama.duration} мин` : null]
                    .filter(Boolean)
                    .join(" · ") || "Данные не указаны"}
                </p>
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-background/70 px-3 py-1 text-sm font-bold text-fuchsia-700 dark:bg-white/10 dark:text-fuchsia-100">
                  <Star className="h-4 w-4 fill-fuchsia-300 text-fuchsia-300" />
                  {dorama.averageRating?.toFixed(1) || "—"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="font-bold">Серии</p>

              {episodes.length === 0 ? (
                <p className="mt-3 rounded-2xl bg-background/80 p-4 text-sm font-semibold text-muted-foreground dark:bg-white/10 dark:text-white/55">
                  Серии пока не добавлены.
                </p>
              ) : (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {episodes.map((episode) => (
                    <button
                      key={episode.episodeId}
                      onClick={() => handleEpisode(episode.episodeNumber)}
                      className={`rounded-2xl px-3 py-3 text-sm font-black transition ${
                        currentEpisodeNumber === episode.episodeNumber
                          ? "bg-violet-600 text-white"
                          : "bg-background/80 text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/15 dark:hover:text-white"
                      }`}
                      title={episode.title ?? undefined}
                    >
                      {episode.episodeNumber}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {currentEpisode?.title && (
              <p className="mt-5 rounded-2xl bg-background/80 p-4 text-sm font-bold text-muted-foreground dark:bg-white/10 dark:text-white/70">
                Сейчас: серия {currentEpisode.episodeNumber} — {currentEpisode.title}
              </p>
            )}

            <button
              onClick={handleComplete}
              disabled={!currentEpisode}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Clapperboard className="h-5 w-5" />
              Отметить просмотренной
            </button>

            {message && (
              <p className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-100">
                {message}
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm font-semibold text-red-700 dark:text-red-100">
                {error}
              </p>
            )}
          </aside>
        </section>
      </div>
    </AppShell>
  );
}

function Player({ episode }: { episode: DoramaEpisode }) {
  const url = episode.videoUrl;

  if (isDirectVideoUrl(url)) {
    return (
      <video
        src={url}
        controls
        className="h-full w-full bg-black object-contain"
      />
    );
  }

  if (isEmbeddableUrl(url)) {
    return (
      <iframe
        src={url}
        title={episode.title ?? `Серия ${episode.episodeNumber}`}
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock; accelerometer; clipboard-write; gyroscope; web-share"
        allowFullScreen
        className="h-full w-full bg-black"
      />
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-black px-6 text-center text-white">
      <p className="text-xl font-black">Эта ссылка похожа на страницу сайта, а не на видео-плеер</p>
      <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
        Для просмотра внутри сайта нужна прямая ссылка на видео .mp4/.webm/.ogg или embed-ссылка на плеер.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-5 rounded-full bg-violet-600 px-5 py-3 text-sm font-black text-white"
      >
        Открыть ссылку в новой вкладке
      </a>
    </div>
  );
}