import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowDownAZ,
  CalendarRange,
  ChevronDown,
  Film,
  FolderOpen,
  Globe2,
  Heart,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
} from "lucide-react";
import { addFavorite, getAllDoramas, getCountries, getMyFavorites, getMyHistory, getMyRecommendations, removeFavorite } from "@/api/doramaApi";
import type { Country, Dorama, WatchHistoryItem } from "@/types/dorama";
import { isAuthenticated } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type CatalogTab = "all" | "recommendations";
type SortOption = "popular" | "rating" | "year-desc" | "year-asc" | "title";

type RecommendationFolder = {
  value: string;
  label: string;
  count: number;
};

const tabs: { value: CatalogTab; label: string; icon: typeof Film }[] = [
  { value: "all", label: "Все дорамы", icon: Film },
  { value: "recommendations", label: "Рекомендации", icon: Sparkles },
];

export function CatalogPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CatalogTab>("all");
  const [allDoramas, setAllDoramas] = useState<Dorama[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [favorites, setFavorites] = useState<Dorama[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<Dorama[]>([]);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [country, setCountry] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [onlyWithPoster, setOnlyWithPoster] = useState(false);
  const [activeRecommendationFolder, setActiveRecommendationFolder] = useState("all");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [savingFavoriteId, setSavingFavoriteId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const authenticated = isAuthenticated();

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    if (activeTab !== "recommendations") {
      setActiveRecommendationFolder("all");
    }
  }, [activeTab]);

  async function loadPage() {
    setError("");
    setIsLoading(true);

    try {
      const [allData, countriesData] = await Promise.all([
        getAllDoramas(),
        getCountries(),
      ]);

      setAllDoramas(allData);
      setCountries(countriesData);

      if (isAuthenticated()) {
        const [favoritesData, historyData, recommendationsData] = await Promise.all([
          getMyFavorites(),
          getMyHistory(),
          getMyRecommendations(),
        ]);

        setFavorites(favoritesData);
        setHistory(historyData);
        setRecommendations(recommendationsData);
      } else {
        setFavorites([]);
        setHistory([]);
        setRecommendations([]);
        setActiveTab("all");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить каталог");
    } finally {
      setIsLoading(false);
    }
  }

  const genres = useMemo(() => {
    const uniqueGenres = new Set<string>();
    allDoramas.forEach((dorama) => dorama.genres?.forEach((item) => uniqueGenres.add(item)));
    return Array.from(uniqueGenres).sort((a, b) => a.localeCompare(b, "ru"));
  }, [allDoramas]);

  const countryOptions = useMemo(() => {
    const byKey = new Map<string, Country>();

    countries.forEach((item) => {
      const code = item.isoCode?.trim();
      const name = item.name.trim();
      const key = code || name;

      if (key) {
        byKey.set(key, item);
      }
    });

    allDoramas.forEach((dorama) => {
      const code = dorama.countryIsoCode?.trim();
      const name = dorama.countryName?.trim();
      const key = code || name;

      if (key && name && !byKey.has(key)) {
        byKey.set(key, {
          countryId: dorama.countryId ?? Number.MAX_SAFE_INTEGER - byKey.size,
          name,
          isoCode: code || null,
        });
      }
    });

    return Array.from(byKey.values()).sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [allDoramas, countries]);

  const recommendationFolders = useMemo<RecommendationFolder[]>(() => {
    const counter = new Map<string, number>();

    recommendations.forEach((dorama) => {
      dorama.genres?.forEach((genreName) => {
        counter.set(genreName, (counter.get(genreName) ?? 0) + 1);
      });
    });

    return [
      { value: "all", label: "Все", count: recommendations.length },
      ...Array.from(counter.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
        .map(([folder, count]) => ({ value: folder, label: folder, count })),
    ];
  }, [recommendations]);

  const visibleAllDoramas = useMemo(() => {
    const normalizedTitle = title.trim().toLowerCase();
    const normalizedTag = tagQuery.trim().toLowerCase();
    const fromYear = Number(yearFrom);
    const toYear = Number(yearTo);

    const filtered = allDoramas.filter((dorama) => {
      const matchesTitle =
        !normalizedTitle ||
        dorama.title.toLowerCase().includes(normalizedTitle) ||
        (dorama.originalTitle?.toLowerCase().includes(normalizedTitle) ?? false);

      const matchesGenre = !genre || dorama.genres?.includes(genre);
      const matchesCountry = !country || dorama.countryIsoCode === country || dorama.countryName === country;
      const matchesTag =
        !normalizedTag || dorama.tags?.some((item) => item.toLowerCase().includes(normalizedTag));
      const matchesYearFrom = !yearFrom || (dorama.releaseYear != null && dorama.releaseYear >= fromYear);
      const matchesYearTo = !yearTo || (dorama.releaseYear != null && dorama.releaseYear <= toYear);
      const matchesRating = minRating == null || (dorama.averageRating != null && dorama.averageRating >= minRating);
      const matchesPoster = !onlyWithPoster || Boolean(dorama.posterUrl);

      return (
        matchesTitle &&
        matchesGenre &&
        matchesCountry &&
        matchesTag &&
        matchesYearFrom &&
        matchesYearTo &&
        matchesRating &&
        matchesPoster
      );
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "rating") {
        return (b.averageRating ?? -1) - (a.averageRating ?? -1);
      }
      if (sortBy === "year-desc") {
        return (b.releaseYear ?? -1) - (a.releaseYear ?? -1);
      }
      if (sortBy === "year-asc") {
        return (a.releaseYear ?? 9999) - (b.releaseYear ?? 9999);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title, "ru");
      }
      return (b.ratingsCount ?? 0) - (a.ratingsCount ?? 0);
    });
  }, [allDoramas, country, genre, minRating, onlyWithPoster, sortBy, tagQuery, title, yearFrom, yearTo]);

  const visibleRecommendations = useMemo(() => {
    if (activeRecommendationFolder === "all") {
      return recommendations;
    }

    return recommendations.filter((dorama) => dorama.genres?.includes(activeRecommendationFolder));
  }, [activeRecommendationFolder, recommendations]);

  const hasFilters = Boolean(
    title.trim() ||
      genre ||
      country ||
      tagQuery.trim() ||
      yearFrom.trim() ||
      yearTo.trim() ||
      minRating != null ||
      onlyWithPoster ||
      sortBy !== "popular",
  );


  const favoriteIds = useMemo(() => new Set(favorites.map((dorama) => dorama.doramaId)), [favorites]);

  async function handleFavoriteClick(dorama: Dorama) {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setSavingFavoriteId(dorama.doramaId);
    setError("");

    try {
      if (favoriteIds.has(dorama.doramaId)) {
        await removeFavorite(dorama.doramaId);
        setFavorites((current) => current.filter((item) => item.doramaId !== dorama.doramaId));
      } else {
        await addFavorite(dorama.doramaId);
        setFavorites((current) =>
          current.some((item) => item.doramaId === dorama.doramaId) ? current : [...current, dorama]
        );
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось изменить избранное");
    } finally {
      setSavingFavoriteId(null);
    }
  }

  function handleReset() {
    setTitle("");
    setGenre("");
    setCountry("");
    setTagQuery("");
    setYearFrom("");
    setYearTo("");
    setMinRating(null);
    setSortBy("popular");
    setOnlyWithPoster(false);
  }

  const activeFiltersCount = [
    title.trim(),
    genre,
    country,
    tagQuery.trim(),
    yearFrom.trim() || yearTo.trim(),
    minRating != null ? String(minRating) : "",
    onlyWithPoster ? "poster" : "",
    sortBy !== "popular" ? sortBy : "",
  ].filter(Boolean).length;

  const availableTabs = authenticated
    ? tabs
    : tabs.filter((tab) => tab.value === "all");

  const catalogStats = authenticated
    ? [
        { value: allDoramas.length, label: "дорам" },
        { value: favorites.length, label: "в избранном" },
        { value: recommendations.length, label: "рекомендаций" },
      ]
    : [
        { value: allDoramas.length, label: "дорам" },
        { value: genres.length, label: "жанров" },
        { value: countryOptions.length, label: "стран" },
      ];

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30 md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_460px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-bold text-violet-700 dark:border-white/10 dark:bg-white/10 dark:text-violet-100">
                <Sparkles className="h-4 w-4" />
                Каталог дорам
              </div>
              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight md:text-6xl">
                Подбирай дорамы по настроению, жанрам и рекомендациям
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                Выбирай настроение — всё найдётся ✨
              </p>
            </div>
            <div className="grid w-full grid-cols-3 gap-3 rounded-[1.5rem] border border-border/70 bg-background/50 p-3 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
              {catalogStats.map((stat) => (
                <Stat key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-700 dark:text-red-100">
            {error}
          </div>
        )}

        <div className="mt-5 rounded-[1.7rem] border border-border/70 bg-card/80 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                const count = tab.value === "all" ? allDoramas.length : recommendations.length;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-[1.25rem] px-4 py-3 text-sm font-black transition ${
                      activeTab === tab.value
                        ? "bg-violet-600 text-white"
                        : "text-muted-foreground hover:bg-background/70 hover:text-foreground dark:bg-white/5 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.value ? "bg-white/20" : "bg-background/70 dark:bg-white/10"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeTab === "all" && (
              <button
                onClick={() => setIsFiltersOpen((value) => !value)}
                className="inline-flex items-center gap-2 rounded-[1.25rem] border border-border/70 bg-background/70 px-4 py-3 text-sm font-black text-foreground transition hover:bg-background/90 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                <SlidersHorizontal className="h-4 w-4 text-violet-600 dark:text-violet-200" />
                Умный поиск
                {activeFiltersCount > 0 && (
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs text-white">{activeFiltersCount}</span>
                )}
                <ChevronDown className={`h-4 w-4 transition ${isFiltersOpen ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        {activeTab === "all" ? (
          <>
            {isFiltersOpen && (
              <section className="mt-5 rounded-[1.8rem] border border-border/70 bg-card/85 p-5 shadow-xl shadow-violet-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Умный поиск
                    </div>
                    <h2 className="mt-3 text-2xl font-black">Фильтры каталога</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
                      Найди свою дораму за пару кликов ✨
                    </p>
                  </div>

                  {hasFilters && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="h-11 rounded-2xl border-border/70 bg-background/70 px-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Сбросить
                    </Button>
                  )}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="xl:col-span-2">
                    <label className="mb-2 block text-sm font-black">Название</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 dark:text-white/35" />
                      <Input
                        className="h-12 rounded-2xl border-border/70 bg-background/80 pl-10 text-foreground placeholder:text-muted-foreground/70 dark:border-white/10 dark:bg-black/25 dark:text-white"
                        placeholder="Например, Goblin"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-black">Жанр</label>
                    <select
                      value={genre}
                      onChange={(event) => setGenre(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-black/25"
                    >
                      <option value="">Все жанры</option>
                      {genres.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-black">
                      <Globe2 className="h-4 w-4 text-violet-600 dark:text-violet-200" />
                      Страна
                    </div>
                    <select
                      value={country}
                      onChange={(event) => setCountry(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-black/25"
                    >
                      <option value="">Все страны</option>
                      {countryOptions.map((item) => (
                        <option key={item.isoCode ?? item.countryId} value={item.isoCode ?? item.name}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-black">
                      <Tag className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-200" />
                      Теги
                    </div>
                    <Input
                      className="h-12 rounded-2xl border-border/70 bg-background/80 dark:border-white/10 dark:bg-black/25"
                      placeholder="школа, романтика, детектив"
                      value={tagQuery}
                      onChange={(event) => setTagQuery(event.target.value)}
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-black">
                      <CalendarRange className="h-4 w-4 text-violet-600 dark:text-violet-200" />
                      Год выхода
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        className="h-12 rounded-2xl border-border/70 bg-background/80 dark:border-white/10 dark:bg-black/25"
                        placeholder="От"
                        value={yearFrom}
                        onChange={(event) => setYearFrom(event.target.value)}
                      />
                      <Input
                        className="h-12 rounded-2xl border-border/70 bg-background/80 dark:border-white/10 dark:bg-black/25"
                        placeholder="До"
                        value={yearTo}
                        onChange={(event) => setYearTo(event.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-black">
                      <Star className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-200" />
                      Рейтинг
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[7, 8, 9].map((value) => (
                        <button
                          key={value}
                          onClick={() => setMinRating((current) => (current === value ? null : value))}
                          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                            minRating === value
                              ? "bg-fuchsia-500 text-white"
                              : "border border-border/70 bg-background/70 text-muted-foreground hover:bg-background/90 hover:text-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
                          }`}
                        >
                          {value}+ ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-sm font-black">
                      <ArrowDownAZ className="h-4 w-4 text-violet-600 dark:text-violet-200" />
                      Сортировка
                    </div>
                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value as SortOption)}
                      className="h-12 w-full rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none dark:border-white/10 dark:bg-black/25"
                    >
                      <option value="popular">По популярности</option>
                      <option value="rating">По рейтингу</option>
                      <option value="year-desc">По году выпуска: сначала новые релизы</option>
                      <option value="year-asc">По году выпуска: сначала ранние релизы</option>
                      <option value="title">По алфавиту</option>
                    </select>
                  </div>

                  <label className="flex min-h-12 items-center gap-3 self-end rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm font-bold dark:border-white/10 dark:bg-white/5">
                    <input
                      type="checkbox"
                      checked={onlyWithPoster}
                      onChange={(event) => setOnlyWithPoster(event.target.checked)}
                      className="h-4 w-4"
                    />
                    Только с постером
                  </label>
                </div>
              </section>
            )}

            <section className="mt-6">
              {isLoading ? (
                <CatalogSkeleton />
              ) : visibleAllDoramas.length === 0 ? (
                <EmptyCatalog text="Попробуй другой фильтр ✨" />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleAllDoramas.map((dorama) => (
                    <DoramaCard
                      key={dorama.doramaId}
                      dorama={dorama}
                      isFavorite={favoriteIds.has(dorama.doramaId)}
                      isSaving={savingFavoriteId === dorama.doramaId}
                      onFavorite={() => handleFavoriteClick(dorama)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="mt-5">
            {!isLoading && recommendationFolders.length > 1 && (
              <section className="rounded-[1.8rem] border border-border/70 bg-card/85 p-5 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:text-violet-200">
                      <FolderOpen className="h-3.5 w-3.5" />
                      Папки рекомендаций
                    </div>
                    <h2 className="mt-3 text-2xl font-black">Подборки по жанрам</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
                      Собрали всё по вайбу 💜
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {recommendationFolders.map((folder) => (
                    <button
                      key={folder.value}
                      onClick={() => setActiveRecommendationFolder(folder.value)}
                      className={`group flex items-center gap-3 rounded-[1.3rem] border px-4 py-3 text-left transition ${
                        activeRecommendationFolder === folder.value
                          ? "border-violet-400 bg-violet-500 text-white"
                          : "border-border/70 bg-background/70 hover:bg-background/90 dark:border-white/10 dark:bg-white/5 dark:text-white/75 dark:hover:bg-white/10"
                      }`}
                    >
                      <div className={`rounded-xl p-2 ${activeRecommendationFolder === folder.value ? "bg-white/20" : "bg-violet-500/10 text-violet-700 dark:text-violet-200"}`}>
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-black">{folder.label}</p>
                        <p className={`text-xs ${activeRecommendationFolder === folder.value ? "text-white/80" : "text-muted-foreground dark:text-white/45"}`}>{folder.count} шт.</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-6">
              {isLoading ? (
                <CatalogSkeleton />
              ) : visibleRecommendations.length === 0 ? (
                <EmptyCatalog text="Скоро здесь будет магия рекомендаций ✨" />
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visibleRecommendations.map((dorama) => (
                    <DoramaCard
                      key={dorama.doramaId}
                      dorama={dorama}
                      isFavorite={favoriteIds.has(dorama.doramaId)}
                      isSaving={savingFavoriteId === dorama.doramaId}
                      onFavorite={() => handleFavoriteClick(dorama)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
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

function DoramaCard({
  dorama,
  isFavorite,
  isSaving,
  onFavorite,
}: {
  dorama: Dorama;
  isFavorite: boolean;
  isSaving: boolean;
  onFavorite: () => void;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.8rem] border-border/70 bg-card/95 p-0 text-foreground shadow-xl shadow-violet-950/10 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.1] dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:shadow-black/20">
      <div className="relative m-3 mb-0 aspect-[2/2.7] overflow-hidden rounded-[1.35rem] bg-background/60 dark:bg-white/5">
        <Link to={`/doramas/${dorama.doramaId}`} className="block h-full">
          {dorama.posterUrl ? (
            <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-muted-foreground dark:text-white/30">
              <Film className="h-12 w-12" />
              <p className="mt-2 text-xs font-semibold">Нет постера</p>
            </div>
          )}
          <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/60 px-3 py-2 text-xs font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            Открыть карточку
          </div>
        </Link>

        <button
          type="button"
          onClick={onFavorite}
          disabled={isSaving}
          className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur transition disabled:opacity-60 ${
            isFavorite
              ? "border-fuchsia-300 bg-fuchsia-500 text-white"
              : "border-white/30 bg-black/55 text-white hover:bg-fuchsia-500"
          }`}
          aria-label={isFavorite ? "Удалить из любимого" : "Добавить в любимое"}
        >
          <Heart className={isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
        </button>

        <div className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          <Star className="mr-1 inline h-3.5 w-3.5 fill-fuchsia-300 text-fuchsia-300" />
          {formatRating(dorama.averageRating)}
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 min-h-11 text-base font-black leading-tight">{dorama.title}</h2>
        <p className="mt-2 text-xs text-muted-foreground dark:text-white/45">
          {[dorama.countryName, dorama.releaseYear || null, dorama.duration ? `${dorama.duration} мин` : null]
            .filter(Boolean)
            .join(" · ") || "Данные не указаны"}
        </p>
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground dark:text-white/40">
          {dorama.genres?.slice(0, 2).join(", ") || "жанр не указан"}
        </p>
        {dorama.tags && dorama.tags.length > 0 && (
          <div className="mt-3 flex min-h-8 flex-wrap gap-1.5">
            {dorama.tags.slice(0, 3).map((item) => (
              <span key={item} className="rounded-full bg-fuchsia-500/10 px-2 py-1 text-[11px] font-bold text-fuchsia-700 dark:text-fuchsia-200">
                #{item}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-4">
          <Link
            to={`/doramas/${dorama.doramaId}`}
            className="rounded-2xl border border-border/70 bg-background/60 px-3 py-2 text-center text-sm font-bold text-foreground/80 transition hover:bg-background/70 dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
          >
            Подробнее
          </Link>
          <Link
            to={`/doramas/${dorama.doramaId}/watch`}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-center text-sm font-bold text-white"
          >
            Смотреть
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function CatalogSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="overflow-hidden rounded-[1.8rem] border-border/70 bg-card/95 p-3 dark:border-white/10 dark:bg-white/[0.07]">
          <Skeleton className="aspect-[2/2.7] w-full rounded-[1.35rem] bg-background/70 dark:bg-white/10" />
          <CardContent className="p-1 pt-4">
            <Skeleton className="h-5 w-3/4 bg-background/70 dark:bg-white/10" />
            <Skeleton className="mt-3 h-4 w-1/2 bg-background/70 dark:bg-white/10" />
            <Skeleton className="mt-4 h-10 w-full bg-background/70 dark:bg-white/10" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function EmptyCatalog({ text }: { text: string }) {
  return (
    <div className="rounded-[2rem] border border-border/70 bg-card/85 px-6 py-14 text-center shadow-xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-background/70 text-foreground dark:bg-white/10 dark:text-white">
        <Search className="h-7 w-7" />
      </div>
      <h2 className="mt-5 text-2xl font-black">Здесь пока пусто</h2>
      <p className="mx-auto mt-2 max-w-md text-muted-foreground dark:text-white/55">{text}</p>
    </div>
  );
}

function formatRating(rating: number | null) {
  return rating == null ? "—" : rating.toFixed(1);
}
