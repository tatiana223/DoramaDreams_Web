import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Film,
  Globe2,
  Image,
  Link as LinkIcon,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Tags,
  XCircle,
} from "lucide-react";
import { createDorama, updateDorama } from "@/api/adminApi";
import { getAllDoramas, getCountries } from "@/api/doramaApi";
import type { Country, Dorama } from "@/types/dorama";

type FormMode = "create" | "edit";

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinList(value?: string[] | null) {
  return value?.join(", ") ?? "";
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const number = Number(trimmed);
  return Number.isFinite(number) ? number : null;
}

function sortDoramas(doramas: Dorama[]) {
  return [...doramas].sort((a, b) => a.title.localeCompare(b.title, "ru"));
}

export function AdminDoramaManager() {
  const [mode, setMode] = useState<FormMode>("create");
  const [doramas, setDoramas] = useState<Dorama[]>([]);
  const [query, setQuery] = useState("");
  const [selectedDoramaId, setSelectedDoramaId] = useState<number | null>(null);

  const [title, setTitle] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [duration, setDuration] = useState("");
  const [countryIsoCode, setCountryIsoCode] = useState("KR");
  const [countries, setCountries] = useState<Country[]>([]);
  const [posterUrl, setPosterUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [genres, setGenres] = useState("");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedDorama = useMemo(() => {
    return doramas.find((dorama) => dorama.doramaId === selectedDoramaId) ?? null;
  }, [doramas, selectedDoramaId]);

  const filteredDoramas = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return doramas.slice(0, 12);
    }

    return doramas
      .filter((dorama) => {
        const titleText = `${dorama.title} ${dorama.originalTitle ?? ""}`.toLowerCase();
        return titleText.includes(normalizedQuery);
      })
      .slice(0, 20);
  }, [doramas, query]);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setIsLoadingList(true);
    setError("");

    try {
      const [loadedDoramas, loadedCountries] = await Promise.all([
        getAllDoramas(),
        getCountries().catch(() => [
          { countryId: 1, name: "Южная Корея", isoCode: "KR" },
          { countryId: 2, name: "Китай", isoCode: "CN" },
        ]),
      ]);

      setDoramas(sortDoramas(loadedDoramas));
      setCountries(loadedCountries);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить список дорам");
    } finally {
      setIsLoadingList(false);
    }
  }

  function resetForm() {
    setTitle("");
    setOriginalTitle("");
    setReleaseYear("");
    setDuration("");
    setCountryIsoCode("KR");
    setPosterUrl("");
    setVideoUrl("");
    setGenres("");
    setTags("");
    setDescription("");
  }

  function fillForm(dorama: Dorama) {
    setTitle(dorama.title ?? "");
    setOriginalTitle(dorama.originalTitle ?? "");
    setReleaseYear(dorama.releaseYear ? String(dorama.releaseYear) : "");
    setDuration(dorama.duration ? String(dorama.duration) : "");
    setCountryIsoCode(dorama.countryIsoCode ?? "");
    setPosterUrl(dorama.posterUrl ?? "");
    setVideoUrl(dorama.videoUrl ?? "");
    setGenres(joinList(dorama.genres));
    setTags(joinList(dorama.tags));
    setDescription(dorama.description ?? "");
  }

  function startCreate() {
    setMode("create");
    setSelectedDoramaId(null);
    setMessage("");
    setError("");
    resetForm();
  }

  function startEdit(dorama: Dorama) {
    setMode("edit");
    setSelectedDoramaId(dorama.doramaId);
    setMessage("");
    setError("");
    fillForm(dorama);
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Название дорамы обязательно");
      return;
    }

    const year = optionalNumber(releaseYear);
    if (releaseYear.trim() && (!year || year < 1900 || year > 2100)) {
      setError("Год выхода должен быть в диапазоне от 1900 до 2100");
      return;
    }

    const durationValue = optionalNumber(duration);
    if (duration.trim() && (!durationValue || durationValue < 1)) {
      setError("Длительность должна быть положительным числом");
      return;
    }

    if (mode === "edit" && !selectedDoramaId) {
      setError("Выбери дораму для обновления");
      return;
    }

    const payload = {
      title: title.trim(),
      originalTitle: optionalText(originalTitle),
      description: optionalText(description),
      releaseYear: year,
      duration: durationValue,
      countryIsoCode: countryIsoCode || null,
      posterUrl: optionalText(posterUrl),
      videoUrl: optionalText(videoUrl),
      genres: splitList(genres),
      tags: splitList(tags),
    };

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      if (mode === "edit" && selectedDoramaId) {
        const updated = await updateDorama(selectedDoramaId, payload);

        setDoramas((current) =>
          sortDoramas(current.map((dorama) => (dorama.doramaId === updated.doramaId ? updated : dorama)))
        );
        setSelectedDoramaId(updated.doramaId);
        fillForm(updated);
        setMessage(`Дорама «${updated.title}» обновлена`);
      } else {
        const created = await createDorama(payload);

        setDoramas((current) => sortDoramas([...current, created]));
        setMessage(`Дорама «${created.title}» добавлена в каталог`);
        resetForm();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : mode === "edit" ? "Не удалось обновить дораму" : "Не удалось добавить дораму");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 md:p-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            {mode === "edit" ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </div>

          <div>
            <h2 className="text-2xl font-black">Добавление и обновление дорам</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground dark:text-white/55">
              Создавай новые карточки и редактируй уже добавленные дорамы: название, страну, длительность, описание, постер, видео, жанры и теги.
            </p>
          </div>
        </div>``

        <button
          type="button"
          onClick={startCreate}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-5 py-3 text-sm font-black transition hover:bg-accent disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
        >
          <Plus className="h-4 w-4" />
          Новая дорама
        </button>
      </div>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          {error}
        </div>
      )}

      {message && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          {message}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[1.7rem] border border-border/70 bg-background/55 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black">Выбрать дораму для редактирования</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground dark:text-white/45">
                Найди карточку и нажми на неё.
              </p>
            </div>

            <button
              type="button"
              onClick={loadInitialData}
              disabled={isLoadingList || isSaving}
              className="rounded-xl border border-border/70 bg-card p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white/65"
              title="Обновить список"
            >
              <RefreshCcw className={`h-4 w-4 ${isLoadingList ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 dark:border-white/10 dark:bg-black/20">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по названию"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
            />
          </div>

          {isLoadingList ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card/70 p-4 text-sm font-bold text-muted-foreground dark:bg-black/20">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загружаю дорамы...
            </div>
          ) : filteredDoramas.length === 0 ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-card/70 p-4 text-sm font-bold text-muted-foreground dark:bg-black/20">
              <XCircle className="h-4 w-4" />
              Ничего не найдено
            </div>
          ) : (
            <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {filteredDoramas.map((dorama) => {
                const isActive = selectedDoramaId === dorama.doramaId;

                return (
                  <button
                    key={dorama.doramaId}
                    type="button"
                    onClick={() => startEdit(dorama)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-violet-400 bg-violet-50 text-violet-950 dark:border-violet-400/40 dark:bg-violet-500/15 dark:text-white"
                        : "border-border/70 bg-card/70 hover:bg-accent dark:border-white/10 dark:bg-black/20 dark:hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-sm font-black">{dorama.title}</span>
                    <span className="mt-1 block text-xs font-semibold text-muted-foreground dark:text-white/45">
                      {[dorama.countryName, dorama.releaseYear].filter(Boolean).join(" · ") || "Без страны и года"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <div className="rounded-[1.7rem] border border-border/70 bg-background/55 p-4 dark:border-white/10 dark:bg-white/5 md:p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground dark:text-white/40">
                {mode === "edit" ? "режим обновления" : "режим добавления"}
              </p>
              <h3 className="mt-1 text-xl font-black">
                {mode === "edit" ? selectedDorama?.title ?? "Выбери дораму" : "Новая дорама"}
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-black">Название *</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Например: Гоблин"
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black">Оригинальное название</span>
              <input
                value={originalTitle}
                onChange={(event) => setOriginalTitle(event.target.value)}
                placeholder="Guardian: The Lonely and Great God"
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-black">
                <Film className="h-4 w-4 text-violet-600 dark:text-violet-200" />
                Год выхода
              </span>
              <input
                type="number"
                value={releaseYear}
                onChange={(event) => setReleaseYear(event.target.value)}
                placeholder="2016"
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black">Длительность, мин</span>
              <input
                type="number"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="60"
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="flex items-center gap-2 text-sm font-black">
                <Globe2 className="h-4 w-4 text-violet-600 dark:text-violet-200" />
                Страна
              </span>
              <select
                value={countryIsoCode}
                onChange={(event) => setCountryIsoCode(event.target.value)}
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              >
                <option value="">Не указана</option>
                {(countries.length > 0
                  ? countries
                  : [
                      { countryId: 1, name: "Южная Корея", isoCode: "KR" },
                      { countryId: 2, name: "Китай", isoCode: "CN" },
                    ]
                ).map((country) => (
                  <option key={country.isoCode ?? country.countryId} value={country.isoCode ?? ""}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="flex items-center gap-2 text-sm font-black">
                <Image className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-200" />
                Ссылка на постер
              </span>
              <input
                value={posterUrl}
                onChange={(event) => setPosterUrl(event.target.value)}
                placeholder="https://..."
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>



            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-black">
                <Sparkles className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-200" />
                Жанры
              </span>
              <input
                value={genres}
                onChange={(event) => setGenres(event.target.value)}
                placeholder="романтика, фэнтези, драма"
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>

            <label className="grid gap-2">
              <span className="flex items-center gap-2 text-sm font-black">
                <Tags className="h-4 w-4 text-violet-600 dark:text-violet-200" />
                Теги
              </span>
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="школа, магия, офис"
                className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>

            <label className="grid gap-2 lg:col-span-2">
              <span className="text-sm font-black">Описание</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Краткое описание дорамы"
                rows={5}
                className="resize-none rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/25"
              />
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "edit" ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isSaving ? "Сохраняю..." : mode === "edit" ? "Обновить дораму" : "Добавить дораму"}
            </button>

            <button
              type="button"
              onClick={() => (mode === "edit" && selectedDorama ? fillForm(selectedDorama) : resetForm())}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-2xl border border-border/70 bg-background/70 px-5 py-3 text-sm font-black transition hover:bg-accent disabled:opacity-60 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
            >
              {mode === "edit" ? "Вернуть значения" : "Очистить"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
