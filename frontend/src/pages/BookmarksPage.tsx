import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  Bookmark,
  CheckCircle2,
  Clock3,
  Film,
  FolderOpen,
  Heart,
  PlayCircle,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { getMyFavoriteActors, removeFavoriteActor } from "@/api/actorApi";
import { deleteHistoryRecord, getAllDoramas, getMyFavorites, getMyHistory, getMyRecommendations, removeFavorite } from "@/api/doramaApi";
import type { Actor, Dorama, WatchHistoryItem, WatchStatus } from "@/types/dorama";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type BookmarkTab = "favorites" | "actors" | "planned" | "watching" | "completed" | "dropped" | "recommendations";

type BookmarkFolder = {
  value: string;
  label: string;
  count: number;
};

const statusLabels: Record<WatchStatus, string> = {
  PLANNED: "Буду смотреть",
  WATCHING: "Смотрю",
  COMPLETED: "Просмотрено",
  DROPPED: "Брошено",
};

const tabs: { value: BookmarkTab; label: string; icon: typeof Heart; hint: string }[] = [
  { value: "favorites", label: "Любимое", icon: Heart, hint: "любимые дорамы с разложением по папкам" },
  { value: "actors", label: "Актёры", icon: UserRound, hint: "любимые актёры и страницы персон" },
  { value: "planned", label: "Буду смотреть", icon: Clock3, hint: "то, что хочется посмотреть позже" },
  { value: "watching", label: "Смотрю", icon: PlayCircle, hint: "активный просмотр и последняя серия" },
  { value: "completed", label: "Просмотрено", icon: CheckCircle2, hint: "законченные дорамы и общий рейтинг" },
  { value: "dropped", label: "Брошено", icon: XCircle, hint: "то, что пока отложено" },
  { value: "recommendations", label: "Рекомендации", icon: Sparkles, hint: "персональные подборки от сервера" },
];

export function BookmarksPage() {
  const [activeTab, setActiveTab] = useState<BookmarkTab>("favorites");
  const [activeFolder, setActiveFolder] = useState("all");
  const [allDoramas, setAllDoramas] = useState<Dorama[]>([]);
  const [favorites, setFavorites] = useState<Dorama[]>([]);
  const [favoriteActors, setFavoriteActors] = useState<Actor[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<Dorama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookmarks();
  }, []);

  useEffect(() => {
    setActiveFolder("all");
  }, [activeTab]);

  async function loadBookmarks() {
    setError("");
    setIsLoading(true);
    try {
      const [allData, favoritesData, favoriteActorsData, historyData, recommendationsData] = await Promise.all([
        getAllDoramas(),
        getMyFavorites(),
        getMyFavoriteActors(),
        getMyHistory(),
        getMyRecommendations(),
      ]);
      setAllDoramas(allData);
      setFavorites(favoritesData);
      setFavoriteActors(favoriteActorsData);
      setHistory(historyData);
      setRecommendations(recommendationsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить закладки");
    } finally {
      setIsLoading(false);
    }
  }

  const historyByDoramaId = useMemo(() => {
    return new Map(history.map((item) => [item.doramaId, item]));
  }, [history]);

  const supportsFolders = activeTab !== "actors";

  const folderSourceDoramas = useMemo(() => {
    if (activeTab === "favorites") {
      return favorites;
    }

    if (activeTab === "actors") {
      return [];
    }

    if (activeTab === "recommendations") {
      return recommendations;
    }

    const status: WatchStatus =
      activeTab === "planned"
        ? "PLANNED"
        : activeTab === "watching"
          ? "WATCHING"
          : activeTab === "completed"
            ? "COMPLETED"
            : "DROPPED";

    const ids = new Set(history.filter((item) => item.status === status).map((item) => item.doramaId));
    return allDoramas.filter((dorama) => ids.has(dorama.doramaId));
  }, [activeTab, allDoramas, favorites, history, recommendations]);

  const bookmarkFolders = useMemo<BookmarkFolder[]>(() => {
    const counter = new Map<string, number>();

    folderSourceDoramas.forEach((dorama) => {
      dorama.genres?.forEach((genre) => {
        counter.set(genre, (counter.get(genre) ?? 0) + 1);
      });
    });

    return [
      { value: "all", label: "Все", count: folderSourceDoramas.length },
      ...Array.from(counter.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
        .map(([genre, count]) => ({ value: genre, label: genre, count })),
    ];
  }, [folderSourceDoramas]);

  const visibleDoramas = useMemo(() => {
    if (!supportsFolders || activeFolder === "all") {
      return folderSourceDoramas;
    }

    return folderSourceDoramas.filter((dorama) => dorama.genres?.includes(activeFolder));
  }, [activeFolder, folderSourceDoramas, supportsFolders]);

  const visibleActors = activeTab === "actors" ? favoriteActors : [];
  const completedCount = history.filter((item) => item.status === "COMPLETED").length;
  const watchingCount = history.filter((item) => item.status === "WATCHING").length;
  const plannedCount = history.filter((item) => item.status === "PLANNED").length;
  const droppedCount = history.filter((item) => item.status === "DROPPED").length;
  const activeFolderLabel = bookmarkFolders.find((folder) => folder.value === activeFolder)?.label ?? "Все";


  async function handleDeleteDorama(doramaId: number) {
    if (activeTab === "recommendations") {
      return;
    }

    setDeletingCardId(`dorama-${doramaId}`);
    setError("");

    try {
      if (activeTab === "favorites") {
        await removeFavorite(doramaId);
        setFavorites((current) => current.filter((dorama) => dorama.doramaId !== doramaId));
      } else {
        await deleteHistoryRecord(doramaId);
        setHistory((current) => current.filter((item) => item.doramaId !== doramaId));
      }

      await loadBookmarks();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить карточку");
    } finally {
      setDeletingCardId(null);
    }
  }

  async function handleDeleteActor(actorId: number) {
    setDeletingCardId(`actor-${actorId}`);
    setError("");

    try {
      await removeFavoriteActor(actorId);
      setFavoriteActors((current) => current.filter((actor) => actor.actorId !== actorId));
      await loadBookmarks();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить актёра из любимых");
    } finally {
      setDeletingCardId(null);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30 md:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/75">
                <Bookmark className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-200" />
                твоя личная коллекция
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Закладки</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                Твоя уютная коллекция 💜
              </p>
            </div>

            <div className="grid w-full grid-cols-3 gap-3 rounded-[1.5rem] border border-border/70 bg-background/50 p-3 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 sm:w-[460px] lg:w-[480px] lg:shrink-0">
              <Stat value={favorites.length} label="любимое" />
              <Stat value={favoriteActors.length} label="актёры" />
              <Stat value={completedCount} label="просмотрено" />
            </div>
          </div>
        </section>

        {error && <div className="mt-5 rounded-3xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-700 dark:text-red-100">{error}</div>}

        <div className="mt-7 overflow-x-auto rounded-[1.7rem] border border-border/70 bg-card/80 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count =
                tab.value === "favorites"
                  ? favorites.length
                  : tab.value === "actors"
                    ? favoriteActors.length
                    : tab.value === "planned"
                      ? plannedCount
                      : tab.value === "watching"
                        ? watchingCount
                        : tab.value === "completed"
                          ? completedCount
                          : tab.value === "dropped"
                            ? droppedCount
                            : recommendations.length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-black transition ${
                    activeTab === tab.value ? "bg-violet-600 text-white" : "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/15 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.value ? "bg-[#16101f]/10" : "bg-background/70 dark:bg-white/10"}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {supportsFolders && !isLoading && bookmarkFolders.length > 1 && (
          <section className="mt-6 rounded-[1.8rem] border border-border/70 bg-card/85 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">
                  <FolderOpen className="h-3.5 w-3.5" />
                  Папки
                </div>
                <h2 className="mt-3 text-2xl font-black">Разделы по жанрам</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
                  Разложено по жанрам — красиво и удобно ✨
                </p>
              </div>
              <div className="rounded-full bg-background/70 px-4 py-2 text-sm font-bold text-muted-foreground dark:bg-white/10 dark:text-white/70">
                Открыта папка: {activeFolderLabel}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {bookmarkFolders.map((folder) => (
                <button
                  key={folder.value}
                  onClick={() => setActiveFolder(folder.value)}
                  className={`group flex items-center gap-3 rounded-[1.3rem] border px-4 py-3 text-left transition ${
                    activeFolder === folder.value
                      ? "border-violet-400 bg-violet-500 text-white"
                      : "border-border/70 bg-background/70 hover:bg-background/90 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
                  }`}
                >
                  <div className={`rounded-xl p-2 ${activeFolder === folder.value ? "bg-white/20" : "bg-violet-500/10 text-violet-700 dark:text-violet-200"}`}>
                    <FolderOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-black">{folder.label}</p>
                    <p className={`text-xs ${activeFolder === folder.value ? "text-white/80" : "text-muted-foreground dark:text-white/45"}`}>{folder.count} шт.</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6">
          {isLoading ? (
            <BookmarksSkeleton />
          ) : activeTab === "actors" ? (
            visibleActors.length === 0 ? (
              <EmptyBookmarks activeTab={activeTab} />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {visibleActors.map((actor) => (
                  <FavoriteActorCard
                    key={actor.actorId}
                    actor={actor}
                    isDeleting={deletingCardId === `actor-${actor.actorId}`}
                    onDelete={() => handleDeleteActor(actor.actorId)}
                  />
                ))}
              </div>
            )
          ) : visibleDoramas.length === 0 ? (
            <EmptyBookmarks activeTab={activeTab} />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              {visibleDoramas.map((dorama) => (
                <BookmarkCard
                  key={dorama.doramaId}
                  dorama={dorama}
                  history={historyByDoramaId.get(dorama.doramaId)}
                  activeTab={activeTab}
                  isDeleting={deletingCardId === `dorama-${dorama.doramaId}`}
                  canDelete={activeTab !== "recommendations"}
                  onDelete={() => handleDeleteDorama(dorama.doramaId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function BookmarkCard({
  dorama,
  history,
  activeTab,
  isDeleting,
  canDelete,
  onDelete,
}: {
  dorama: Dorama;
  history?: WatchHistoryItem;
  activeTab: BookmarkTab;
  isDeleting: boolean;
  canDelete: boolean;
  onDelete: () => void;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border-border/70 bg-card/95 p-2 text-foreground shadow-xl shadow-violet-950/10 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.1] dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:shadow-black/20">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem] bg-background/70 dark:bg-white/10">
        <Link to={`/doramas/${dorama.doramaId}`} className="block h-full">
          {dorama.posterUrl ? (
            <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-white/35">
              <Film className="h-12 w-12" />
              <p className="mt-2 text-xs font-semibold">Нет постера</p>
            </div>
          )}
        </Link>

        {canDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-red-300/40 bg-red-500/90 px-2 py-1 text-[11px] font-black text-white shadow-lg shadow-black/15 backdrop-blur transition hover:bg-red-600 disabled:opacity-60"
            aria-label="Удалить"
          >
            <Trash2 className="h-3 w-3" />
            {isDeleting ? "Удаляю..." : "Удалить"}
          </button>
        )}

        <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-[11px] font-black text-white backdrop-blur">
          <Star className="mr-1 inline h-3 w-3 fill-fuchsia-300 text-fuchsia-300" />
          {formatRating(dorama.averageRating)}
        </div>

        {activeTab === "favorites" && (
          <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-fuchsia-500 px-2 py-1 text-[11px] font-black text-white shadow-lg shadow-black/15">
            <Heart className="h-3 w-3 fill-current" />
            любимое
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-2.5 sm:p-3">
        <h3 className="line-clamp-2 text-sm font-black leading-snug sm:text-base">{dorama.title}</h3>
        <p className="mt-1.5 text-[11px] text-muted-foreground dark:text-white/45 sm:text-xs">
          {[dorama.countryName, dorama.releaseYear || null, dorama.duration ? `${dorama.duration} мин` : null]
            .filter(Boolean)
            .join(" · ") || "Данные не указаны"}
        </p>
        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground dark:text-white/40 sm:text-xs">
          {dorama.genres?.slice(0, 2).join(", ") || "жанр не указан"}
        </p>

        <div className="mt-3 min-h-[58px] rounded-[1rem] bg-background/70 p-2.5 text-xs text-muted-foreground dark:bg-white/10 dark:text-white/60">
          {history ? (
            <>
              <p>
                <span className="font-bold text-foreground dark:text-white">Статус:</span> {statusLabels[history.status]}
              </p>
              <p className="mt-1">
                <span className="font-bold text-foreground dark:text-white">Последняя серия:</span> {history.lastEpisode}
              </p>
              {activeTab === "completed" && (
                <p className="mt-1">
                  <span className="font-bold text-foreground dark:text-white">Рейтинг:</span> {formatRating(dorama.averageRating)}
                </p>
              )}
            </>
          ) : (
            <p>{activeTab === "favorites" ? "Сохранено в любимое." : "Можно открыть карточку и обновить статус."}</p>
          )}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          <Link to={`/doramas/${dorama.doramaId}`} className="rounded-xl border border-border/70 bg-background/60 px-2 py-2 text-center text-xs font-bold text-foreground/80 transition hover:bg-background/70 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10 sm:text-sm">
            Карточка
          </Link>
          <Link to={`/doramas/${dorama.doramaId}/watch`} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-2 text-center text-xs font-bold text-white sm:text-sm">
            Смотреть
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function FavoriteActorCard({
  actor,
  isDeleting,
  onDelete,
}: {
  actor: Actor;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border-border/70 bg-card/95 p-2.5 text-foreground shadow-xl shadow-violet-950/10 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.1] dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:shadow-black/20">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem] bg-background/70 dark:bg-white/10">
        <Link to={`/actors/${actor.actorId}`} className="block h-full">
          {actor.photoUrl ? (
            <img src={actor.photoUrl} alt={actor.fullName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-white/35">
              <UserRound className="h-11 w-11" />
              <p className="mt-2 text-xs font-semibold">Нет фото</p>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete();
          }}
          disabled={isDeleting}
          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-red-300/40 bg-red-500/90 px-2 py-1 text-[11px] font-black text-white shadow-lg shadow-black/15 backdrop-blur transition hover:bg-red-600 disabled:opacity-60"
          aria-label="Удалить актёра из любимых"
        >
          <Trash2 className="h-3 w-3" />
          {isDeleting ? "Удаляю..." : "Удалить"}
        </button>

        <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-fuchsia-500 px-2 py-1 text-[11px] font-black text-white shadow-lg shadow-black/15">
          <Heart className="h-3 w-3 fill-current" />
          любимый
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 text-sm font-black leading-snug sm:text-base">{actor.fullName}</h3>
        <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground dark:text-white/35">актёр</p>
        <Link to={`/actors/${actor.actorId}`} className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-center text-sm font-black text-white">
          Открыть карточку
        </Link>
      </CardContent>
    </Card>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="relative flex min-h-24 min-w-0 flex-col items-center justify-center overflow-hidden rounded-[1.2rem] border border-border/70 bg-card/80 px-3 py-4 text-center shadow-sm shadow-violet-950/10 backdrop-blur dark:border-white/10 dark:bg-white/[0.08]">
      <div className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-gradient-to-r from-transparent via-violet-300/65 to-transparent" />
      <p className="relative z-10 font-mono text-3xl font-black leading-none tracking-tight text-foreground tabular-nums dark:text-white">
        {value}
      </p>
      <p className="relative z-10 mt-2 whitespace-nowrap text-xs font-black leading-none text-muted-foreground dark:text-white/55">
        {label}
      </p>
    </div>
  );
}

function BookmarksSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="overflow-hidden rounded-[1.45rem] border-border/70 bg-card/95 p-2 dark:border-white/10 dark:bg-white/[0.07]">
          <Skeleton className="aspect-[4/5] w-full rounded-[1.15rem] bg-background/70 dark:bg-white/10" />
          <CardContent className="p-1 pt-4">
            <Skeleton className="h-5 w-3/4 bg-background/70 dark:bg-white/10" />
            <Skeleton className="mt-3 h-4 w-1/2 bg-background/70 dark:bg-white/10" />
            <Skeleton className="mt-3 h-14 w-full rounded-[1rem] bg-background/70 dark:bg-white/10" />
            <Skeleton className="mt-3 h-9 w-full bg-background/70 dark:bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyBookmarks({ activeTab }: { activeTab: BookmarkTab }) {
  const text =
    activeTab === "favorites"
      ? "Сохрани что-нибудь милое 💜"
      : activeTab === "actors"
        ? "Любимчики живут здесь ✨"
        : activeTab === "planned"
          ? "Оставь на потом 💫"
          : activeTab === "watching"
            ? "Тут будут твои онгоинги 🍿"
            : activeTab === "completed"
              ? "Завершённые истории живут здесь ✨"
              : activeTab === "dropped"
                ? "Иногда хочется сделать паузу 🌙"
                : "Скоро тут появятся подсказки для тебя 💜";

  return (
    <div className="rounded-[2rem] border border-border/70 bg-card/85 px-6 py-14 text-center shadow-xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-background/70 text-foreground dark:bg-white/10 dark:text-white">
        <Bookmark className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black">Здесь пока пусто</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground dark:text-white/55">{text}</p>
    </div>
  );
}

function formatRating(rating: number | null) {
  return rating == null ? "—" : rating.toFixed(1);
}
