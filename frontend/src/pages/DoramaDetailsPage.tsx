import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarDays, Film, Heart, Loader2, MessageCircle, PlayCircle, Send, Star, Trash2, UsersRound } from "lucide-react";
import {
  addFavorite,
  addHistoryRecord,
  addRating,
  addReview,
  deleteReview,
  getDoramaById,
  getDoramaReviews,
  getMyFavorites,
  removeFavorite,
} from "@/api/doramaApi";
import { getCurrentUser, isAuthenticated } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";
import type { Dorama, Review, WatchStatus } from "@/types/dorama";

const statusLabels: Record<WatchStatus, string> = {
  PLANNED: "В планах",
  WATCHING: "Смотрю",
  COMPLETED: "Просмотрено",
  DROPPED: "Брошено",
};

type DetailsTab = "cast" | "reviews";

const detailsTabs: { value: DetailsTab; label: string; icon: typeof Film }[] = [
  { value: "cast", label: "Актёры", icon: UsersRound },
  { value: "reviews", label: "Отзывы", icon: MessageCircle },
];

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
  const [activeDetailsTab, setActiveDetailsTab] = useState<DetailsTab>("cast");
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
    setError("");

    try {
      if (isFavorite) {
        await removeFavorite(doramaId);
        setFavoriteIds((current) => current.filter((item) => item !== doramaId));
        setMessage("Дорама удалена из избранного");
      } else {
        await addFavorite(doramaId);
        setFavoriteIds((current) => [...current, doramaId]);
        setMessage("Дорама добавлена в избранное");
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
    setError("");

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
    setError("");

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
    setError("");

    try {
      const created = await addReview(doramaId, reviewText.trim());
      setReviews((current) => [created, ...current.filter((review) => review.userId !== created.userId)]);
      setReviewText("");
      setActiveDetailsTab("reviews");
      setMessage("Отзыв добавлен");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось добавить отзыв");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteReview(reviewId: number) {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const shouldDelete = window.confirm("Удалить отзыв?");

    if (!shouldDelete) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await deleteReview(reviewId);
      setReviews((current) => current.filter((review) => review.reviewId !== reviewId));
      setMessage("Отзыв удалён");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить отзыв");
    } finally {
      setIsSaving(false);
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

  if (error && !dorama) {
    return (
      <AppShell>
        <div className="min-h-[80vh] px-6 py-10">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
            <p className="font-semibold text-red-600">{error}</p>
            <Link to="/catalog" className="mt-5 inline-flex font-semibold text-violet-700">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!dorama) {
    return null;
  }

  const currentUser = getCurrentUser();
  const actorsCount = dorama.actors?.length ?? 0;

  return (
    <AppShell>
      <div className="min-h-screen px-4 pb-28 pt-8 text-foreground dark:text-white sm:px-6 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <Link to="/catalog" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100">
            <ArrowLeft className="h-4 w-4" />
            Назад в каталог
          </Link>

          <section className="mt-7 grid gap-7 rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.06] lg:grid-cols-[320px_1fr]">
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
                {dorama.countryName && <BadgeText>{dorama.countryName}</BadgeText>}
                {dorama.releaseYear && <BadgeText>{dorama.releaseYear}</BadgeText>}
                {dorama.duration && <BadgeText>{dorama.duration} мин</BadgeText>}
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

              <h1 className="mt-5 break-words text-4xl font-black tracking-tight md:text-5xl">{dorama.title}</h1>

              {dorama.originalTitle && <p className="mt-2 break-words text-muted-foreground dark:text-white/45">{dorama.originalTitle}</p>}

              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-background/70 px-4 py-2 font-bold text-violet-700 dark:bg-white/10 dark:text-violet-200">
                <Star className="h-4 w-4 fill-violet-500 text-violet-500" />
                {dorama.averageRating?.toFixed(1) ?? "—"}
              </div>

              <p className="mt-6 max-w-3xl whitespace-pre-wrap break-words text-base leading-8 text-muted-foreground dark:text-white/60">
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
                <div>
                  <h2 className="text-xl font-black">Просмотр и оценка</h2>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-white/50">
                    Сохрани последнюю серию, статус просмотра и личную оценку.
                  </p>
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

                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-3 dark:border-white/10 dark:bg-black/20 md:flex-row md:items-center md:justify-between">
                  <StarRatingInput value={rating} onChange={setRating} disabled={isSaving} />
                  <button onClick={handleRating} disabled={isSaving} className="rounded-2xl border border-violet-200 bg-card px-5 py-3 font-semibold text-violet-700 transition hover:bg-violet-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:text-violet-100 dark:hover:bg-white/15">
                    Сохранить оценку
                  </button>
                </div>
              </div>

              {message && <p className="mt-4 text-sm font-semibold text-emerald-600">{message}</p>}
              {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
            <div className="overflow-x-auto border-b border-border/70 p-2 dark:border-white/10">
              <div className="flex min-w-max gap-2">
                {detailsTabs.map((tab) => {
                  const Icon = tab.icon;
                  const count = tab.value === "cast" ? actorsCount : reviews.length;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setActiveDetailsTab(tab.value)}
                      className={`inline-flex items-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-black transition ${
                        activeDetailsTab === tab.value
                          ? "bg-violet-600 text-white"
                          : "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      <span className={`rounded-full px-2 py-0.5 text-xs ${activeDetailsTab === tab.value ? "bg-white/20" : "bg-background/70 dark:bg-white/10"}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeDetailsTab === "cast" ? (
              <div className="p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700 dark:text-fuchsia-200">в ролях</p>
                    <h2 className="mt-2 text-2xl font-black">Актёры дорамы</h2>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground dark:text-white/45">
                    {actorsCount} актёров в карточке
                  </p>
                </div>

                {actorsCount === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/70 p-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45">
                    Актёры пока не добавлены.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {dorama.actors?.map((actor) => (
                      <Link key={actor.actorId} to={`/actors/${actor.actorId}`} className="group overflow-hidden rounded-[1.25rem] border border-border/70 bg-background/80 p-3 transition hover:-translate-y-0.5 hover:bg-accent dark:border-white/10 dark:bg-white/[0.07] dark:hover:bg-white/10">
                        <div className="flex min-w-0 items-center gap-3">
                          {actor.photoUrl ? (
                            <img src={actor.photoUrl} alt={actor.fullName} className="h-12 w-12 shrink-0 rounded-xl object-cover shadow-lg shadow-violet-950/10" />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-base font-black text-violet-700 dark:bg-white/10 dark:text-violet-200">
                              {actor.fullName.slice(0, 1)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black">{actor.fullName}</p>
                            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground dark:text-white/35">открыть</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700 dark:text-fuchsia-200">отзывы</p>
                    <h2 className="mt-2 text-2xl font-black">Мнения зрителей</h2>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground dark:text-white/45">
                    {reviews.length} отзывов
                  </p>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
                  <form className="h-fit rounded-[1.5rem] border border-border/70 bg-background/70 p-4 dark:border-white/10 dark:bg-black/20" onSubmit={handleReviewSubmit}>
                    <label className="text-sm font-black" htmlFor="review-textarea">Добавить отзыв</label>
                    <textarea
                      id="review-textarea"
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      className="mt-3 min-h-32 w-full rounded-2xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-violet-400 dark:border-white/10 dark:bg-[#171020] dark:text-white"
                      placeholder="Напиши отзыв..."
                      maxLength={1000}
                    />

                    <button className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60" disabled={isSaving}>
                      <Send className="h-4 w-4" />
                      Отправить
                    </button>
                  </form>

                  <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
                    {reviews.length === 0 ? (
                      <div className="w-full rounded-2xl border border-dashed border-border bg-background/70 p-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45">
                        Отзывов пока нет. Можно оставить первый.
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <article
                          key={review.reviewId}
                          className="w-full rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.07]"
                        >
                          <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
                            <p className="min-w-0 truncate font-bold text-foreground dark:text-white">{review.username}</p>
                            <div className="flex shrink-0 items-center gap-2">
                              {review.createdAt && (
                                <p className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground dark:text-white/45">
                                  <CalendarDays className="h-3.5 w-3.5" />
                                  {formatDate(review.createdAt)}
                                </p>
                              )}
                              {currentUser && (currentUser.userId === review.userId || currentUser.role === "ADMIN") && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(review.reviewId)}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200/80 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Удалить
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground dark:text-white/60">
                            {review.content}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function BadgeText({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-background/70 px-3 py-1 text-sm font-semibold text-violet-700 dark:bg-white/10 dark:text-violet-200">
      {children}
    </span>
  );
}

function StarRatingInput({ value, onChange, disabled }: { value: number; onChange: (value: number) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Оценка от 1 до 10">
      {Array.from({ length: 10 }, (_, index) => index + 1).map((star) => {
        const isActive = star <= value;
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            disabled={disabled}
            className={`rounded-lg p-1 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60 ${isActive ? "text-fuchsia-500" : "text-muted-foreground/40 dark:text-white/25"}`}
            aria-label={`${star} из 10`}
            title={`${star} из 10`}
          >
            <Star className={isActive ? "h-5 w-5 fill-current" : "h-5 w-5"} />
          </button>
        );
      })}
      <span className="ml-2 rounded-full bg-background/80 px-3 py-1 text-sm font-black text-violet-700 dark:bg-white/10 dark:text-violet-200">
        {value}/10
      </span>
    </div>
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
