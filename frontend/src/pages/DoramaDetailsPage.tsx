import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarDays, Film, Heart, Loader2, PlayCircle, Send, Star } from "lucide-react";
import {
  addFavorite,
  addHistoryRecord,
  addRating,
  addReview,
  getDoramaById,
  getDoramaReviews,
  getMyFavorites,
  removeFavorite,
} from "@/api/doramaApi";
import { isAuthenticated } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";
import type { Dorama, Review, WatchStatus } from "@/types/dorama";

const statusLabels: Record<WatchStatus, string> = {
  PLANNED: "В планах",
  WATCHING: "Смотрю",
  COMPLETED: "Просмотрено",
  DROPPED: "Брошено",
};

export function DoramaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doramaId = Number(id);

  const [dorama, setDorama] = useState<Dorama | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [rating, setRating] = useState(10);
  const [reviewText, setReviewText] = useState("");
  const [episode, setEpisode] = useState(1);
  const [status, setStatus] = useState<WatchStatus>("WATCHING");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isFavorite = useMemo(
    () => favoriteIds.includes(doramaId),
    [favoriteIds, doramaId]
  );

  useEffect(() => {
    if (!doramaId) {
      navigate("/catalog");
      return;
    }

    loadPage();
  }, [doramaId, navigate]);

  async function loadPage() {
    setError("");
    setIsLoading(true);

    try {
      const [doramaData, reviewsData] = await Promise.all([
        getDoramaById(doramaId),
        getDoramaReviews(doramaId),
      ]);

      setDorama(doramaData);
      setReviews(reviewsData);

      if (isAuthenticated()) {
        const favorites = await getMyFavorites();
        setFavoriteIds(favorites.map((item) => item.doramaId));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить дораму");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFavorite() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      if (isFavorite) {
        await removeFavorite(doramaId);
        setFavoriteIds((current) => current.filter((item) => item !== doramaId));
        setMessage("Удалено из избранного");
      } else {
        await addFavorite(doramaId);
        setFavoriteIds((current) => [...current, doramaId]);
        setMessage("Добавлено в избранное");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось изменить избранное");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleHistory() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await addHistoryRecord(doramaId, episode, status);
      setMessage("Прогресс просмотра сохранён");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить прогресс");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRating() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await addRating(doramaId, rating);
      setMessage("Оценка сохранена");
      const updated = await getDoramaById(doramaId);
      setDorama(updated);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить оценку");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!reviewText.trim()) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const created = await addReview(doramaId, reviewText.trim());
      setReviews((current) => [created, ...current]);
      setReviewText("");
      setMessage("Отзыв добавлен");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось добавить отзыв");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell><div className="flex min-h-[80vh] items-center justify-center text-violet-700 dark:text-violet-200">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div></AppShell>
    );
  }

  if (error && !dorama) {
    return (
      <AppShell><div className="min-h-[80vh] px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <p className="font-semibold text-red-600">{error}</p>
          <Link to="/catalog" className="mt-5 inline-flex font-semibold text-violet-700">
            Вернуться в каталог
          </Link>
        </div>
      </div></AppShell>
    );
  }

  if (!dorama) {
    return null;
  }

  return (
    <AppShell><div className="min-h-screen px-6 py-8 text-foreground dark:text-white">
      <div className="mx-auto max-w-6xl">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100">
          <ArrowLeft className="h-4 w-4" />
          Назад в каталог
        </Link>

        <section className="mt-7 grid gap-7 rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-6 shadow-sm backdrop-blur lg:grid-cols-[320px_1fr]">
          <div className="aspect-[2/2.8] overflow-hidden rounded-[1.6rem] bg-background/70 dark:bg-white/10">
            {dorama.posterUrl ? (
              <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-violet-300">
                <Film className="h-16 w-16" />
                <p className="mt-3 text-sm font-semibold">Нет постера</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              {dorama.releaseYear && <BadgeText>{dorama.releaseYear}</BadgeText>}
              {dorama.genres?.map((genre) => <BadgeText key={genre}>{genre}</BadgeText>)}
            </div>

            {dorama.tags && dorama.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {dorama.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-sm font-bold text-fuchsia-700 dark:bg-fuchsia-400/10 dark:text-fuchsia-200">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">{dorama.title}</h1>

            {dorama.originalTitle && <p className="mt-2 text-muted-foreground dark:text-white/45">{dorama.originalTitle}</p>}

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-background/70 dark:bg-white/10 px-4 py-2 font-bold text-violet-700 dark:text-violet-200">
              <Star className="h-4 w-4 fill-violet-500 text-violet-500" />
              {dorama.averageRating?.toFixed(1) ?? "—"}
            </div>

            <p className="mt-6 max-w-3xl text-base leading-8 text-muted-foreground dark:text-white/60">
              {dorama.description || "Описание пока не добавлено."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handleFavorite}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
              >
                <Heart className={isFavorite ? "h-5 w-5 fill-white" : "h-5 w-5"} />
                {isFavorite ? "В избранном" : "В избранное"}
              </button>

              <Link
                to={`/doramas/${dorama.doramaId}/watch`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 font-semibold text-white transition hover:from-violet-700 hover:to-fuchsia-600"
              >
                <PlayCircle className="h-5 w-5" />
                Смотреть онлайн
              </Link>
            </div>

            <div className="mt-7 rounded-[1.6rem] border border-border/70 bg-background/80 p-5 dark:border-white/10 dark:bg-white/[0.07]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black">Просмотр и оценка</h2>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-white/50">
                    Сохрани серию, статус просмотра и свою оценку прямо в карточке дорамы.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-[130px_1fr_auto]">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={episode}
                  onChange={(event) => setEpisode(Math.max(1, Number(event.target.value) || 1))}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#171020] dark:text-white"
                  placeholder="Серия"
                />

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as WatchStatus)}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#171020] dark:text-white"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>

                <button onClick={handleHistory} disabled={isSaving} className="rounded-2xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60">
                  Сохранить просмотр
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                <select
                  value={rating}
                  onChange={(event) => setRating(Number(event.target.value))}
                  className="rounded-2xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#171020] dark:text-white"
                >
                  {Array.from({ length: 10 }).map((_, index) => {
                    const value = index + 1;
                    return <option key={value} value={value}>{value} / 10</option>;
                  })}
                </select>

                <button onClick={handleRating} disabled={isSaving} className="rounded-2xl border border-violet-200 bg-card px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-violet-100 dark:hover:bg-white/15">
                  Оценить
                </button>
              </div>
            </div>

            {message && <p className="mt-4 text-sm font-semibold text-emerald-600">{message}</p>}
            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
          </div>
        </section>

        {dorama.actors && dorama.actors.length > 0 && (
          <section className="mt-6 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
            <h2 className="text-xl font-black">Актёры</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dorama.actors.map((actor) => (
                <div key={actor.actorId} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 p-3 dark:border-white/10 dark:bg-white/[0.07]">
                  {actor.photoUrl ? (
                    <img src={actor.photoUrl} alt={actor.fullName} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-white/10 dark:text-violet-200">
                      {actor.fullName.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{actor.fullName}</p>
                    {actor.biography && <p className="line-clamp-2 text-xs text-muted-foreground dark:text-white/45">{actor.biography}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Отзывы</h2>
              <p className="mt-1 text-sm text-muted-foreground dark:text-white/50">
                Отдельная лента отзывов пользователей.
              </p>
            </div>
          </div>

          <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]" onSubmit={handleReviewSubmit}>
            <textarea
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#171020] dark:text-white"
              placeholder="Напиши отзыв..."
              maxLength={1000}
            />

            <button className="inline-flex h-fit items-center justify-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60" disabled={isSaving}>
              <Send className="h-4 w-4" />
              Отправить
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-4  pb-2">
            {reviews.length === 0 ? (
              <div className="w-full rounded-2xl border border-dashed border-border bg-background/70 p-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45">
                Отзывов пока нет.
              </div>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.reviewId}
                  className="w-full rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.07]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-foreground dark:text-white">{review.username}</p>
                    {review.createdAt && (
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground dark:text-white/45">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(review.createdAt)}
                      </p>
                    )}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground dark:text-white/60">
                    {review.content}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div></AppShell>
  );
}

function BadgeText({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-background/70 dark:bg-white/10 px-3 py-1 text-sm font-semibold text-violet-700 dark:text-violet-200">
      {children}
    </span>
  );
}


function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
