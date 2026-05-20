import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Bookmark, CheckCircle2, Clock3, Film, Heart, PlayCircle, Sparkles, Star, XCircle } from "lucide-react";
import { getAllDoramas, getMyFavorites, getMyHistory, getMyRecommendations } from "@/api/doramaApi";
import type { Dorama, WatchHistoryItem, WatchStatus } from "@/types/dorama";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type BookmarkTab = "favorites" | "planned" | "watching" | "completed" | "dropped" | "recommendations";

const statusLabels: Record<WatchStatus, string> = {
  PLANNED: "Буду смотреть",
  WATCHING: "Смотрю",
  COMPLETED: "Просмотрено",
  DROPPED: "Брошено",
};

const tabs: { value: BookmarkTab; label: string; icon: typeof Heart; hint: string }[] = [
  { value: "favorites", label: "Избранное", icon: Heart, hint: "дорамы, которые ты добавила сердечком" },
  { value: "planned", label: "Буду смотреть", icon: Clock3, hint: "то, что хочется посмотреть позже" },
  { value: "watching", label: "Смотрю", icon: PlayCircle, hint: "активный просмотр и последняя серия" },
  { value: "completed", label: "Просмотрено", icon: CheckCircle2, hint: "законченные дорамы и общий рейтинг" },
  { value: "dropped", label: "Брошено", icon: XCircle, hint: "то, что пока отложено" },
  { value: "recommendations", label: "Рекомендации", icon: Sparkles, hint: "персональные подборки от сервера" },
];

export function BookmarksPage() {
  const [activeTab, setActiveTab] = useState<BookmarkTab>("favorites");
  const [allDoramas, setAllDoramas] = useState<Dorama[]>([]);
  const [favorites, setFavorites] = useState<Dorama[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<Dorama[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    setError("");
    setIsLoading(true);
    try {
      const [allData, favoritesData, historyData, recommendationsData] = await Promise.all([
        getAllDoramas(),
        getMyFavorites(),
        getMyHistory(),
        getMyRecommendations(),
      ]);
      setAllDoramas(allData);
      setFavorites(favoritesData);
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

  const visibleDoramas = useMemo(() => {
    if (activeTab === "favorites") return favorites;
    if (activeTab === "recommendations") return recommendations;

    const status: WatchStatus =
      activeTab === "planned" ? "PLANNED" : activeTab === "watching" ? "WATCHING" : activeTab === "completed" ? "COMPLETED" : "DROPPED";

    const ids = new Set(history.filter((item) => item.status === status).map((item) => item.doramaId));
    return allDoramas.filter((dorama) => ids.has(dorama.doramaId));
  }, [activeTab, allDoramas, favorites, history, recommendations]);

  const activeConfig = tabs.find((tab) => tab.value === activeTab) ?? tabs[0];
  const completedCount = history.filter((item) => item.status === "COMPLETED").length;
  const watchingCount = history.filter((item) => item.status === "WATCHING").length;
  const plannedCount = history.filter((item) => item.status === "PLANNED").length;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-6 shadow-2xl shadow-violet-950/10 dark:shadow-black/30 backdrop-blur-xl md:p-8">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-8 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/70 dark:bg-white/10 px-4 py-2 text-sm font-bold text-muted-foreground dark:text-white/75">
                <Bookmark className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-200" />
                твоя личная коллекция
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Закладки</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                Как на сайте с дорамами: отдельная кнопка “Закладки”, внутри — переключение между избранным, планами, текущим просмотром, просмотренным и рекомендациями.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[420px]">
              <Stat value={favorites.length} label="избранное" />
              <Stat value={watchingCount} label="смотрю" />
              <Stat value={completedCount} label="просмотрено" />
            </div>
          </div>
        </section>

        {error && <div className="mt-5 rounded-3xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-700 dark:text-red-100">{error}</div>}

        <div className="mt-7 overflow-x-auto rounded-[1.7rem] border border-border/70 bg-card/80 dark:border-white/10 dark:bg-white/[0.05] p-2 backdrop-blur-xl">
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const count = tab.value === "favorites" ? favorites.length : tab.value === "planned" ? plannedCount : tab.value === "watching" ? watchingCount : tab.value === "completed" ? completedCount : tab.value === "dropped" ? history.filter((item) => item.status === "DROPPED").length : recommendations.length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-black transition ${
                    activeTab === tab.value ? "bg-violet-600 text-white" : "text-muted-foreground dark:text-white/60 hover:bg-background/70 dark:bg-white/10 hover:text-foreground dark:hover:text-white"
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

        <div className="mt-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-fuchsia-700 dark:text-fuchsia-200/70">{activeConfig.label}</p>
            <h2 className="mt-2 text-3xl font-black">{visibleDoramas.length} дорам</h2>
            <p className="mt-2 text-sm text-muted-foreground dark:text-white/50">{activeConfig.hint}</p>
          </div>
          <Link to="/catalog" className="rounded-full border border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/60 dark:bg-white/5 px-5 py-3 text-center text-sm font-bold text-muted-foreground dark:text-white/75 transition hover:bg-background/70 dark:bg-white/10 hover:text-foreground dark:hover:text-white">
            Найти ещё дорамы
          </Link>
        </div>

        <div className="mt-6">
          {isLoading ? (
            <BookmarksSkeleton />
          ) : visibleDoramas.length === 0 ? (
            <EmptyBookmarks activeTab={activeTab} />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visibleDoramas.map((dorama) => (
                <BookmarkCard key={dorama.doramaId} dorama={dorama} history={historyByDoramaId.get(dorama.doramaId)} activeTab={activeTab} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function BookmarkCard({ dorama, history, activeTab }: { dorama: Dorama; history?: WatchHistoryItem; activeTab: BookmarkTab }) {
  return (
    <Card className="group overflow-hidden rounded-[1.8rem] border-border/70 bg-card/95 dark:border-white/10 dark:bg-card/95 dark:bg-white/[0.07] p-3 text-foreground dark:text-white shadow-xl shadow-violet-950/10 dark:shadow-black/20 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.1]">
      <Link to={`/doramas/${dorama.doramaId}`}>
        <div className="relative aspect-[2/2.75] overflow-hidden rounded-[1.35rem] bg-background/70 dark:bg-white/10">
          {dorama.posterUrl ? (
            <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-muted-foreground dark:text-white/30">
              <Film className="h-12 w-12" />
              <p className="mt-2 text-xs font-semibold">Нет постера</p>
            </div>
          )}
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            <Star className="mr-1 inline h-3.5 w-3.5 fill-fuchsia-300 text-fuchsia-300" />{formatRating(dorama.averageRating)}
          </div>
          {history && (
            <div className="absolute left-3 top-3 rounded-full bg-violet-600 px-2.5 py-1 text-xs font-black text-white">
              {statusLabels[history.status]}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <h3 className="line-clamp-2 min-h-11 text-base font-black leading-tight">{dorama.title}</h3>
        <p className="mt-2 text-xs text-muted-foreground dark:text-white/45">{dorama.releaseYear || "Год не указан"} · {dorama.genres?.slice(0, 2).join(", ") || "жанр не указан"}</p>

        <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 dark:border-white/10 dark:bg-background/70 dark:bg-black/20 p-3 text-xs text-muted-foreground dark:text-white/60">
          {history ? (
            <>
              <p><span className="font-bold text-foreground dark:text-white">Статус:</span> {statusLabels[history.status]}</p>
              <p className="mt-1"><span className="font-bold text-foreground dark:text-white">Последняя серия:</span> {history.lastEpisode}</p>
              {activeTab === "completed" && <p className="mt-1"><span className="font-bold text-foreground dark:text-white">Рейтинг:</span> {formatRating(dorama.averageRating)}</p>}
            </>
          ) : (
            <p>{activeTab === "favorites" ? "В избранном" : "Можно открыть карточку и обновить статус."}</p>
          )}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/doramas/${dorama.doramaId}`} className="rounded-2xl border border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/60 dark:bg-white/5 px-3 py-2 text-center text-sm font-bold text-foreground/80 dark:text-white/80 transition hover:bg-background/70 dark:bg-white/10">Карточка</Link>
          <Link to={`/doramas/${dorama.doramaId}/watch`} className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-center text-sm font-bold text-white">Смотреть</Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="rounded-[1.4rem] border border-border/70 bg-background/70 dark:border-white/10 dark:bg-background/70 dark:bg-black/20 p-4 text-center"><p className="text-3xl font-black">{value}</p><p className="mt-1 text-xs font-bold text-muted-foreground dark:text-white/45">{label}</p></div>;
}

function BookmarksSkeleton() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Card key={i} className="overflow-hidden rounded-[1.8rem] border-border/70 bg-card/95 dark:border-white/10 dark:bg-card/95 dark:bg-white/[0.07] p-3"><Skeleton className="aspect-[2/2.75] w-full rounded-[1.35rem] bg-background/70 dark:bg-white/10" /><CardContent className="p-1 pt-4"><Skeleton className="h-5 w-3/4 bg-background/70 dark:bg-white/10" /><Skeleton className="mt-3 h-4 w-1/2 bg-background/70 dark:bg-white/10" /><Skeleton className="mt-4 h-20 w-full bg-background/70 dark:bg-white/10" /></CardContent></Card>)}</div>;
}

function EmptyBookmarks({ activeTab }: { activeTab: BookmarkTab }) {
  const text = activeTab === "favorites" ? "Открой карточку дорамы и нажми сердечко — она появится здесь." : activeTab === "planned" ? "На странице дорамы поставь статус “Буду смотреть”." : activeTab === "watching" ? "Начни просмотр или сохрани прогресс со статусом “Смотрю”." : activeTab === "completed" ? "Отметь дораму как просмотренную — здесь будет твой завершённый список." : activeTab === "dropped" ? "Сюда попадут отложенные дорамы." : "Рекомендации появятся после избранного, истории и оценок.";
  return <div className="rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] px-6 py-14 text-center shadow-xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-background/70 dark:bg-white/10 text-foreground dark:text-white"><Bookmark className="h-7 w-7" /></div><h2 className="mt-5 text-2xl font-black">Здесь пока пусто</h2><p className="mx-auto mt-2 max-w-md text-muted-foreground dark:text-white/55">{text}</p></div>;
}

function formatRating(rating: number | null) {
  return rating == null ? "—" : rating.toFixed(1);
}
