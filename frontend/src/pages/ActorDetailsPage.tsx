import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, CalendarDays, Clapperboard, Eye, Film, Heart, Loader2, MapPin, MessageCircle, PlayCircle, Send, Sparkles, Star, Trash2, UserRound } from "lucide-react";
import {
  addActorComment,
  addFavoriteActor,
  deleteActorComment,
  getActorById,
  getActorComments,
  getActorInteractionStats,
  getDoramasByActor,
  getMyActorRating,
  getMyFavoriteActors,
  rateActor,
  recordActorView,
  removeFavoriteActor,
} from "@/api/actorApi";
import { getCurrentUser, isAuthenticated } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { Actor, ActorInteractionStats, Dorama, UserActorInteraction } from "@/types/dorama";

const emptyStats: ActorInteractionStats = {
  favoritesCount: 0,
  ratingsCount: 0,
  averageRating: null,
  commentsCount: 0,
  viewsCount: 0,
};

type DetailsTab = "doramas" | "reviews";

const detailsTabs: { value: DetailsTab; label: string; icon: typeof Film }[] = [
  { value: "doramas", label: "Дорамы", icon: Film },
  { value: "reviews", label: "Отзывы", icon: MessageCircle },
];

export function ActorDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const actorId = Number(id);

  const [actor, setActor] = useState<Actor | null>(null);
  const [doramas, setDoramas] = useState<Dorama[]>([]);
  const [favoriteActorIds, setFavoriteActorIds] = useState<number[]>([]);
  const [stats, setStats] = useState<ActorInteractionStats>(emptyStats);
  const [comments, setComments] = useState<UserActorInteraction[]>([]);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState(10);
  const [commentText, setCommentText] = useState("");
  const [activeDetailsTab, setActiveDetailsTab] = useState<DetailsTab>("doramas");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isFavorite = useMemo(() => favoriteActorIds.includes(actorId), [favoriteActorIds, actorId]);

  useEffect(() => {
    if (!actorId) {
      navigate("/actors");
      return;
    }

    loadPage();
  }, [actorId, navigate]);

  async function loadPage() {
    setError("");
    setIsLoading(true);

    try {
      const authenticated = isAuthenticated();
      const [actorData, actorDoramasData, statsData, commentsData, favoriteActorsData, ratingData] = await Promise.all([
        getActorById(actorId),
        getDoramasByActor(actorId),
        getActorInteractionStats(actorId),
        getActorComments(actorId),
        authenticated ? getMyFavoriteActors() : Promise.resolve([]),
        authenticated ? getMyActorRating(actorId) : Promise.resolve(null),
      ]);

      setActor(actorData);
      setDoramas(actorDoramasData);
      setStats(statsData);
      setComments(commentsData);
      setFavoriteActorIds(favoriteActorsData.map((item) => item.actorId));
      setMyRating(ratingData);
      setSelectedRating(ratingData ?? 10);

      if (authenticated) {
        recordActorView(actorId).catch(() => undefined);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить актёра");
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshStatsAndComments() {
    const [statsData, commentsData] = await Promise.all([
      getActorInteractionStats(actorId),
      getActorComments(actorId),
    ]);

    setStats(statsData);
    setComments(commentsData);
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
        await removeFavoriteActor(actorId);
        setFavoriteActorIds((current) => current.filter((id) => id !== actorId));
        setMessage("Актёр удалён из любимых");
      } else {
        await addFavoriteActor(actorId);
        setFavoriteActorIds((current) => [...current, actorId]);
        setMessage("Актёр добавлен в любимые");
      }

      const statsData = await getActorInteractionStats(actorId);
      setStats(statsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось изменить любимых актёров");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRating() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!Number.isFinite(selectedRating) || selectedRating < 1 || selectedRating > 10) {
      setError("Оценка должна быть от 1 до 10");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await rateActor(actorId, selectedRating);
      setMyRating(selectedRating);
      setMessage("Оценка актёра сохранена");
      const statsData = await getActorInteractionStats(actorId);
      setStats(statsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить оценку актёра");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleComment() {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      setError("Комментарий не может быть пустым");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await addActorComment(actorId, commentText.trim());
      setCommentText("");
      setActiveDetailsTab("reviews");
      setMessage("Комментарий добавлен");
      await refreshStatsAndComments();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось добавить комментарий");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteComment(interactionId: number) {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    const shouldDelete = window.confirm("Удалить комментарий?");

    if (!shouldDelete) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await deleteActorComment(interactionId);
      setComments((current) => current.filter((comment) => comment.interactionId !== interactionId));
      const statsData = await getActorInteractionStats(actorId);
      setStats(statsData);
      setMessage("Комментарий удалён");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить комментарий");
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

  if (error && !actor) {
    return (
      <AppShell>
        <div className="min-h-[80vh] px-6 py-10">
          <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-card p-8 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.06]">
            <p className="font-semibold text-red-600">{error}</p>
            <Link to="/actors" className="mt-5 inline-flex font-semibold text-violet-700 dark:text-violet-200">
              Вернуться к актёрам
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!actor) {
    return null;
  }

  const currentUser = getCurrentUser();

  return (
    <AppShell>
      <div className="min-h-screen px-4 pb-28 pt-8 text-foreground dark:text-white sm:px-6 md:pb-14">
        <div className="mx-auto max-w-6xl">
          <Link to="/actors" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900 dark:text-violet-300 dark:hover:text-violet-100">
            <ArrowLeft className="h-4 w-4" />
            Назад к актёрам
          </Link>

          <section className="mt-7 grid gap-7 overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.06] lg:grid-cols-[320px_1fr]">
            <div className="aspect-[2/2.75] overflow-hidden rounded-[1.6rem] bg-background/70 dark:bg-white/10">
              {actor.photoUrl ? (
                <img src={actor.photoUrl} alt={actor.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-white/40">
                  <UserRound className="h-20 w-20" />
                  <p className="mt-3 text-sm font-bold">Нет фото</p>
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-background/70 px-4 py-2 text-sm font-bold text-violet-700 dark:bg-white/10 dark:text-violet-200">
                <Sparkles className="h-4 w-4" />
                Карточка актёра
              </div>

              <h1 className="mt-5 break-words text-4xl font-black tracking-tight md:text-6xl">{actor.fullName}</h1>
              <div className="mt-5 flex flex-wrap gap-2">
                {actor.originalName && actor.originalName !== actor.fullName && (
                  <ActorInfoPill icon={<UserRound className="h-4 w-4" />} label="Ориг. имя" value={actor.originalName} />
                )}
                {actor.birthDate && (
                  <ActorInfoPill icon={<CalendarDays className="h-4 w-4" />} label="Дата рождения" value={formatDate(actor.birthDate)} />
                )}
                {actor.placeOfBirth && (
                  <ActorInfoPill icon={<MapPin className="h-4 w-4" />} label="Место рождения" value={actor.placeOfBirth} />
                )}
                {actor.knownForDepartment && (
                  <ActorInfoPill icon={<Clapperboard className="h-4 w-4" />} label="Сфера" value={formatDepartment(actor.knownForDepartment)} />
                )}
              </div>

              <p className="mt-5 max-w-3xl whitespace-pre-wrap break-words text-base leading-8 text-muted-foreground dark:text-white/60">
                {actor.biography || "Биография пока не добавлена."}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <ActorStat value={stats.favoritesCount} label="любят" icon={<Heart className="h-4 w-4" />} />
                <ActorStat value={stats.averageRating == null ? "—" : stats.averageRating.toFixed(1)} label="оценка" icon={<Star className="h-4 w-4" />} />
                <ActorStat value={stats.commentsCount} label="отзывы" icon={<MessageCircle className="h-4 w-4" />} />
                <ActorStat value={stats.viewsCount} label="просмотры" icon={<Eye className="h-4 w-4" />} />
                <ActorStat value={doramas.length} label="дорамы" icon={<Film className="h-4 w-4" />} />
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={handleFavorite}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
                >
                  <Heart className={isFavorite ? "h-5 w-5 fill-white" : "h-5 w-5"} />
                  {isFavorite ? "В любимых" : "В любимые"}
                </button>

                <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/10 sm:flex-row sm:items-center">
                  <StarRatingInput value={selectedRating} onChange={setSelectedRating} disabled={isSaving} />
                  <button
                    onClick={handleRating}
                    disabled={isSaving}
                    className="rounded-2xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-60"
                  >
                    {myRating == null ? "Сохранить оценку" : "Обновить"}
                  </button>
                </div>

                {myRating != null && (
                  <div className="rounded-full border border-border/70 bg-background/70 px-4 py-3 text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/65">
                    Твоя оценка: {myRating}/10
                  </div>
                )}
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
                  const count = tab.value === "doramas" ? doramas.length : comments.length;
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

            {activeDetailsTab === "doramas" ? (
              <div className="p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700 dark:text-fuchsia-200">фильмография</p>
                    <h2 className="mt-2 text-2xl font-black">Дорамы с участием актёра</h2>
                  </div>
                  <Link to="/catalog" className="rounded-full border border-border/70 bg-background/60 px-5 py-3 text-center text-sm font-bold text-muted-foreground transition hover:bg-background/70 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white">
                    В каталог
                  </Link>
                </div>

                {doramas.length === 0 ? (
                  <div className="mt-5 rounded-2xl border border-dashed border-border bg-background/70 p-5 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45">
                    К этому актёру пока не привязаны дорамы.
                  </div>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                    {doramas.map((dorama) => (
                      <DoramaActorCard key={dorama.doramaId} dorama={dorama} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-700 dark:text-fuchsia-200">отзывы</p>
                    <h2 className="mt-2 text-2xl font-black">Отзывы об актёре</h2>
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground dark:text-white/45">
                    {comments.length} комментариев
                  </p>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
                  <div className="h-fit rounded-[1.5rem] border border-border/70 bg-background/70 p-4 dark:border-white/10 dark:bg-black/20">
                    <label className="text-sm font-black" htmlFor="actor-comment">Добавить комментарий</label>
                    <Textarea
                      id="actor-comment"
                      value={commentText}
                      onChange={(event) => setCommentText(event.target.value)}
                      placeholder="Напиши, чем понравилась актёрская игра"
                      maxLength={1000}
                      className="mt-3 min-h-32 rounded-2xl border-border/70 bg-card p-4 text-sm dark:border-white/10 dark:bg-[#171020]"
                    />
                    <button
                      onClick={handleComment}
                      disabled={isSaving}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      Добавить комментарий
                    </button>
                  </div>

                  <div className="max-h-[620px] space-y-3 overflow-y-auto pr-1">
                    {comments.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-black/20 dark:text-white/45">
                        Пока нет комментариев. Можно оставить первый отзыв.
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.interactionId} className="rounded-2xl border border-border/70 bg-background/70 p-4 dark:border-white/10 dark:bg-black/20">
                          <div className="flex min-w-0 items-center justify-between gap-3">
                            <p className="min-w-0 truncate font-black">{comment.username}</p>
                            <div className="flex shrink-0 items-center gap-2">
                              <p className="text-xs text-muted-foreground dark:text-white/40">{formatDate(comment.createdAt)}</p>
                              {currentUser && (currentUser.userId === comment.userId || currentUser.role === "ADMIN") && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteComment(comment.interactionId)}
                                  disabled={isSaving}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-200/80 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Удалить
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground dark:text-white/65">{comment.commentText}</p>
                        </div>
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

function ActorInfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-3 py-2 text-sm font-bold text-muted-foreground backdrop-blur dark:border-white/10 dark:bg-white/10 dark:text-white/70">
      <span className="shrink-0 text-violet-700 dark:text-violet-200">{icon}</span>
      <span className="shrink-0 text-xs uppercase tracking-[0.12em] text-muted-foreground/70 dark:text-white/40">{label}:</span>
      <span className="min-w-0 truncate text-foreground dark:text-white">{value}</span>
    </div>
  );
}

function formatDepartment(value: string) {
  if (value === "Acting") {
    return "Актёрское искусство";
  }

  return value;
}

function ActorStat({ value, label, icon }: { value: string | number; label: string; icon: ReactNode }) {
  return (
    <div className="flex min-h-24 min-w-0 flex-col justify-between rounded-[1.35rem] border border-border/70 bg-background/70 p-4 dark:border-white/10 dark:bg-white/10">
      <div className="flex min-w-0 items-center gap-2 text-muted-foreground dark:text-white/50">
        <span className="shrink-0">{icon}</span>
        <span className="min-w-0 break-words text-xs font-black leading-4">{label}</span>
      </div>
      <p className="mt-2 font-mono text-2xl font-black leading-none tabular-nums">{value}</p>
    </div>
  );
}

function DoramaActorCard({ dorama }: { dorama: Dorama }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border-border/70 bg-background/80 p-2.5 text-foreground shadow-lg shadow-violet-950/10 transition hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:shadow-black/20">
      <Link to={`/doramas/${dorama.doramaId}`} className="block">
        <div className="relative aspect-[2/2.75] overflow-hidden rounded-[1.15rem] bg-background/70 dark:bg-white/10">
          {dorama.posterUrl ? (
            <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-white/30">
              <Film className="h-10 w-10" />
              <p className="mt-2 text-[11px] font-semibold">Нет постера</p>
            </div>
          )}
          <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur">
            <Star className="mr-1 inline h-3 w-3 fill-fuchsia-300 text-fuchsia-300" />{formatRating(dorama.averageRating)}
          </div>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 break-words text-sm font-black leading-tight">{dorama.title}</h3>
        <p className="mt-2 line-clamp-1 break-words text-[11px] text-muted-foreground dark:text-white/45">
          {[dorama.countryName, dorama.releaseYear || null, dorama.duration ? `${dorama.duration} мин` : null]
            .filter(Boolean)
            .join(" · ") || "Данные не указаны"}
        </p>
        <p className="mt-1 line-clamp-1 break-words text-[11px] text-muted-foreground dark:text-white/40">{dorama.genres?.slice(0, 2).join(", ") || "жанр не указан"}</p>

        <div className="mt-auto grid grid-cols-1 gap-2 pt-3 sm:grid-cols-2">
          <Link to={`/doramas/${dorama.doramaId}`} className="inline-flex min-h-9 w-full items-center justify-center rounded-xl border border-border/70 bg-background/60 px-2 py-2 text-center text-xs font-bold leading-none text-foreground/80 transition hover:bg-background/70 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10">Подробнее</Link>
          <Link to={`/doramas/${dorama.doramaId}/watch`} className="inline-flex min-h-9 w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-2 text-center text-xs font-bold leading-none text-white">
            <PlayCircle className="h-3.5 w-3.5" />Смотреть
          </Link>
        </div>
      </CardContent>
    </Card>
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

function formatRating(rating: number | null) {
  return rating == null ? "—" : rating.toFixed(1);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}
