import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Film, Heart, History, PlayCircle, RotateCcw, Search, Sparkles, Star } from "lucide-react";
import { getAllDoramas, getMyFavorites, getMyHistory, getMyRecommendations, searchDoramas } from "@/api/doramaApi";
import type { Dorama, WatchHistoryItem } from "@/types/dorama";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type CatalogTab = "all" | "favorites" | "watching" | "completed" | "recommendations";

const tabs: { value: CatalogTab; label: string; icon: typeof Film }[] = [
  { value: "all", label: "Все дорамы", icon: Film },
  { value: "favorites", label: "Избранное", icon: Heart },
  { value: "watching", label: "Смотрю", icon: PlayCircle },
  { value: "completed", label: "Просмотрено", icon: History },
  { value: "recommendations", label: "Рекомендации", icon: Sparkles },
];

export function CatalogPage() {
  const [activeTab, setActiveTab] = useState<CatalogTab>("all");
  const [doramas, setDoramas] = useState<Dorama[]>([]);
  const [allDoramas, setAllDoramas] = useState<Dorama[]>([]);
  const [favorites, setFavorites] = useState<Dorama[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<Dorama[]>([]);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const genres = useMemo(() => {
    const uniqueGenres = new Set<string>();
    allDoramas.forEach((dorama) => dorama.genres?.forEach((item) => uniqueGenres.add(item)));
    return Array.from(uniqueGenres).slice(0, 10);
  }, [allDoramas]);

  const visibleDoramas = useMemo(() => {
    if (activeTab === "favorites") return favorites;
    if (activeTab === "recommendations") return recommendations;
    if (activeTab === "watching") {
      const ids = new Set(history.filter((item) => item.status === "WATCHING" || item.status === "PLANNED").map((item) => item.doramaId));
      return allDoramas.filter((dorama) => ids.has(dorama.doramaId));
    }
    if (activeTab === "completed") {
      const ids = new Set(history.filter((item) => item.status === "COMPLETED").map((item) => item.doramaId));
      return allDoramas.filter((dorama) => ids.has(dorama.doramaId));
    }
    return doramas;
  }, [activeTab, doramas, favorites, history, recommendations, allDoramas]);

  const hasFilters = Boolean(title.trim() || genre.trim() || releaseYear.trim());

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setError("");
    setIsLoading(true);
    try {
      const [allData, favoritesData, historyData, recommendationsData] = await Promise.all([
        getAllDoramas(),
        getMyFavorites(),
        getMyHistory(),
        getMyRecommendations(),
      ]);
      setDoramas(allData);
      setAllDoramas(allData);
      setFavorites(favoritesData);
      setHistory(historyData);
      setRecommendations(recommendationsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить каталог");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(selectedGenre = genre) {
    setError("");
    setIsLoading(true);
    setActiveTab("all");
    try {
      const data = await searchDoramas({ title, genre: selectedGenre, releaseYear });
      setDoramas(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось выполнить поиск");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGenreClick(selectedGenre: string) {
    const nextGenre = genre === selectedGenre ? "" : selectedGenre;
    setGenre(nextGenre);
    await handleSearch(nextGenre);
  }

  async function handleReset() {
    setTitle("");
    setGenre("");
    setReleaseYear("");
    setDoramas(allDoramas);
    setActiveTab("all");
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-6 shadow-2xl shadow-violet-950/10 dark:shadow-black/30 backdrop-blur-xl md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/70 dark:bg-white/10 px-4 py-2 text-sm font-bold text-violet-700 dark:text-violet-100">
                <Sparkles className="h-4 w-4" />
                Онлайн-кинотеатр дорам
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                Каталог для просмотра, избранного и личных списков
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                После входа пользователь сразу попадает сюда: выбирает дораму, открывает карточку, запускает просмотр, отмечает серии и собирает собственные подборки.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] border border-border/70 bg-background/70 dark:border-white/10 dark:bg-background/70 dark:bg-black/20 p-4">
              <Stat value={allDoramas.length} label="в каталоге" />
              <Stat value={favorites.length} label="любимых" />
              <Stat value={history.length} label="в истории" />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[1.8rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] p-3 backdrop-blur-xl">
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_120px_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 dark:text-white/35" />
              <Input className="h-12 rounded-2xl border-border/70 bg-background/80 dark:border-white/10 dark:bg-black/25 pl-10 text-foreground dark:text-white placeholder:text-muted-foreground/70 dark:text-white/35" placeholder="Название дорамы" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            </div>
            <Input className="h-12 rounded-2xl border-border/70 bg-background/80 dark:border-white/10 dark:bg-black/25 text-foreground dark:text-white placeholder:text-muted-foreground/70 dark:text-white/35" placeholder="Жанр" value={genre} onChange={(e) => setGenre(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <Input className="h-12 rounded-2xl border-border/70 bg-background/80 dark:border-white/10 dark:bg-black/25 text-foreground dark:text-white placeholder:text-muted-foreground/70 dark:text-white/35" placeholder="Год" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            <div className="flex gap-2">
              <Button onClick={() => handleSearch()} className="h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 font-bold text-white">Найти</Button>
              {hasFilters && <Button variant="outline" onClick={handleReset} className="h-12 rounded-2xl border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/60 dark:bg-white/5 text-foreground dark:text-white hover:bg-background/70 dark:bg-white/10"><RotateCcw className="h-4 w-4" /></Button>}
            </div>
          </div>

          {genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {genres.map((item) => (
                <button key={item} onClick={() => handleGenreClick(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${genre === item ? "border-violet-400 bg-violet-500 text-white" : "border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/60 dark:bg-white/5 text-muted-foreground dark:text-white/65 hover:bg-background/70 dark:bg-white/10 hover:text-foreground dark:hover:text-white"}`}>
                  {item}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.value} onClick={() => setActiveTab(tab.value)} className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-3 text-sm font-bold transition ${activeTab === tab.value ? "border-violet-500 bg-violet-600 text-white" : "border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/60 dark:bg-white/5 text-muted-foreground dark:text-white/65 hover:bg-background/70 dark:bg-white/10 hover:text-foreground dark:hover:text-white"}`}>
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </section>

        {error && <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-700 dark:text-red-100">{error}</div>}

        <section className="mt-6">
          {isLoading ? <CatalogSkeleton /> : visibleDoramas.length === 0 ? <EmptyCatalog activeTab={activeTab} /> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visibleDoramas.map((dorama) => <DoramaCard key={dorama.doramaId} dorama={dorama} />)}</div>}
        </section>
      </div>
    </AppShell>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return <div className="rounded-2xl bg-background/70 dark:bg-white/10 p-4 text-center"><p className="text-3xl font-black">{value}</p><p className="mt-1 text-xs font-semibold text-muted-foreground dark:text-white/45">{label}</p></div>;
}

function DoramaCard({ dorama }: { dorama: Dorama }) {
  return (
    <Card className="group overflow-hidden rounded-[1.8rem] border-border/70 bg-card/95 dark:border-white/10 dark:bg-card/95 dark:bg-white/[0.07] p-0 text-foreground dark:text-white shadow-xl shadow-violet-950/10 dark:shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.1]">
      <Link to={`/doramas/${dorama.doramaId}`} className="block">
        <div className="relative m-3 mb-0 aspect-[2/2.7] overflow-hidden rounded-[1.35rem] bg-background/60 dark:bg-white/5">
          {dorama.posterUrl ? <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-muted-foreground dark:text-white/30"><Film className="h-12 w-12" /><p className="mt-2 text-xs font-semibold">Нет постера</p></div>}
          <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
            <Star className="mr-1 inline h-3.5 w-3.5 fill-fuchsia-300 text-fuchsia-300" />{formatRating(dorama.averageRating)}
          </div>
          <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/60 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">Открыть карточку</div>
        </div>
      </Link>
      <CardContent className="p-4">
        <h2 className="line-clamp-2 min-h-11 text-base font-black leading-tight">{dorama.title}</h2>
        <p className="mt-2 text-xs text-muted-foreground dark:text-white/45">{dorama.releaseYear || "Год не указан"} · {dorama.genres?.slice(0, 2).join(", ") || "жанр не указан"}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link to={`/doramas/${dorama.doramaId}`} className="rounded-2xl border border-border/70 bg-background/60 dark:border-white/10 dark:bg-background/60 dark:bg-white/5 px-3 py-2 text-center text-sm font-bold text-foreground/80 dark:text-white/80 transition hover:bg-background/70 dark:bg-white/10">Подробнее</Link>
          <Link to={`/doramas/${dorama.doramaId}/watch`} className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-center text-sm font-bold text-white">Смотреть</Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CatalogSkeleton() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Card key={i} className="overflow-hidden rounded-[1.8rem] border-border/70 bg-card/95 dark:border-white/10 dark:bg-card/95 dark:bg-white/[0.07] p-3"><Skeleton className="aspect-[2/2.7] w-full rounded-[1.35rem] bg-background/70 dark:bg-white/10" /><CardContent className="p-1 pt-4"><Skeleton className="h-5 w-3/4 bg-background/70 dark:bg-white/10" /><Skeleton className="mt-3 h-4 w-1/2 bg-background/70 dark:bg-white/10" /><Skeleton className="mt-4 h-10 w-full bg-background/70 dark:bg-white/10" /></CardContent></Card>)}</div>;
}

function EmptyCatalog({ activeTab }: { activeTab: CatalogTab }) {
  const text = activeTab === "favorites" ? "Добавь дораму в избранное на странице дорамы." : activeTab === "watching" ? "Начни просмотр и сохрани статус \"Смотрю\"." : activeTab === "completed" ? "Отметь дораму как просмотренную." : activeTab === "recommendations" ? "Рекомендации появятся после оценок, истории и избранного." : "Попробуй изменить фильтры поиска.";
  return <div className="rounded-[2rem] border border-border/70 bg-card/85 dark:border-white/10 dark:bg-card/85 dark:bg-white/[0.06] px-6 py-14 text-center shadow-xl"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-background/70 dark:bg-white/10 text-foreground dark:text-white"><Search className="h-7 w-7" /></div><h2 className="mt-5 text-2xl font-black">Здесь пока пусто</h2><p className="mx-auto mt-2 max-w-md text-muted-foreground dark:text-white/55">{text}</p></div>;
}

function formatRating(rating: number | null) {
  return rating == null ? "—" : rating.toFixed(1);
}
