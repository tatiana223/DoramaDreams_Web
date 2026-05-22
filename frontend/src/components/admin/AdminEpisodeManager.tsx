import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Film,
  Link as LinkIcon,
  Loader2,
  Plus,
  Search,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { getAllDoramas, getDoramaEpisodes } from "@/api/doramaApi";
import {
  bulkImportDoramaEpisodes,
  createDoramaEpisode,
  deleteDoramaEpisode,
  updateDoramaEpisode,
} from "@/api/adminApi";
import type { Dorama, DoramaEpisode } from "@/types/dorama";

export function AdminEpisodeManager() {
  const [doramas, setDoramas] = useState<Dorama[]>([]);
  const [episodes, setEpisodes] = useState<DoramaEpisode[]>([]);
  const [query, setQuery] = useState("");
  const [selectedDorama, setSelectedDorama] = useState<Dorama | null>(null);
  const [editingEpisode, setEditingEpisode] = useState<DoramaEpisode | null>(null);
  const [episodeNumber, setEpisodeNumber] = useState("1");
  const [videoUrl, setVideoUrl] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkStartNumber, setBulkStartNumber] = useState("1");
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isLoadingDoramas, setIsLoadingDoramas] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredDoramas = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return doramas.slice(0, 12);
    }

    return doramas
      .filter((dorama) => {
        const title = dorama.title?.toLowerCase() ?? "";
        const originalTitle = dorama.originalTitle?.toLowerCase() ?? "";
        return title.includes(normalized) || originalTitle.includes(normalized);
      })
      .slice(0, 12);
  }, [doramas, query]);

  useEffect(() => {
    loadDoramas();
  }, []);

  async function loadDoramas() {
    setIsLoadingDoramas(true);
    setError("");

    try {
      const data = await getAllDoramas();
      setDoramas(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить дорамы");
    } finally {
      setIsLoadingDoramas(false);
    }
  }

  async function selectDorama(dorama: Dorama) {
    setSelectedDorama(dorama);
    setEditingEpisode(null);
    resetForm(dorama);
    setBulkText("");
    setMessage("");
    setError("");
    await loadEpisodes(dorama.doramaId);
  }

  async function loadEpisodes(doramaId: number) {
    setIsLoadingEpisodes(true);

    try {
      const data = await getDoramaEpisodes(doramaId);
      setEpisodes(data);

      const nextNumber = getNextEpisodeNumber(data);
      setEpisodeNumber(String(nextNumber));
      setBulkStartNumber(String(nextNumber));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить серии");
    } finally {
      setIsLoadingEpisodes(false);
    }
  }

  function getNextEpisodeNumber(items = episodes) {
    return items.length > 0
      ? Math.max(...items.map((episode) => episode.episodeNumber)) + 1
      : 1;
  }

  function resetForm(dorama = selectedDorama) {
    setEditingEpisode(null);
    setVideoUrl("");

    if (dorama) {
      const nextNumber = getNextEpisodeNumber();
      setEpisodeNumber(String(nextNumber));
      setBulkStartNumber(String(nextNumber));
    } else {
      setEpisodeNumber("1");
      setBulkStartNumber("1");
    }
  }

  function startEdit(episode: DoramaEpisode) {
    setEditingEpisode(episode);
    setEpisodeNumber(String(episode.episodeNumber));
    setVideoUrl(episode.videoUrl);
    setMessage("");
    setError("");
  }

  async function handleSave() {
    if (!selectedDorama) {
      setError("Сначала выбери дораму");
      return;
    }

    const number = Number(episodeNumber);

    if (!Number.isInteger(number) || number < 1) {
      setError("Номер серии должен быть целым числом больше 0");
      return;
    }

    if (!videoUrl.trim()) {
      setError("Вставь ссылку на видео");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        doramaId: selectedDorama.doramaId,
        episodeNumber: number,
        title: null,
        videoUrl: videoUrl.trim(),
      };

      if (editingEpisode) {
        await updateDoramaEpisode(editingEpisode.episodeId, payload);
        setMessage("Серия обновлена");
      } else {
        await createDoramaEpisode(payload);
        setMessage("Серия добавлена");
      }

      await loadEpisodes(selectedDorama.doramaId);
      resetForm(selectedDorama);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить серию");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleBulkImport() {
    if (!selectedDorama) {
      setError("Сначала выбери дораму");
      return;
    }

    if (!bulkText.trim()) {
      setError("Вставь список ссылок или iframe-кодов");
      return;
    }

    const startNumber = Number(bulkStartNumber);

    if (!Number.isInteger(startNumber) || startNumber < 1) {
      setError("Начальный номер серии должен быть целым числом больше 0");
      return;
    }

    setIsBulkSaving(true);
    setMessage("");
    setError("");

    try {
      const result = await bulkImportDoramaEpisodes({
        doramaId: selectedDorama.doramaId,
        startEpisodeNumber: startNumber,
        overwriteExisting,
        rawText: bulkText,
      });

      await loadEpisodes(selectedDorama.doramaId);

      const parts = [
        `создано: ${result.createdCount}`,
        `обновлено: ${result.updatedCount}`,
        `пропущено: ${result.skippedCount}`,
        `ошибок: ${result.failedCount}`,
      ];

      setMessage(`Массовый импорт завершён — ${parts.join(", ")}`);

      if (result.failedCount > 0 || result.skippedCount > 0) {
        const details = [...result.errors, ...result.skipped].slice(0, 8).join("\n");
        setError(details || "Некоторые строки не были импортированы");
      } else {
        setBulkText("");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось импортировать серии");
    } finally {
      setIsBulkSaving(false);
    }
  }

  async function handleDelete(episode: DoramaEpisode) {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      await deleteDoramaEpisode(episode.episodeId);
      setMessage(`Серия ${episode.episodeNumber} удалена`);

      if (selectedDorama) {
        await loadEpisodes(selectedDorama.doramaId);
      }

      if (editingEpisode?.episodeId === episode.episodeId) {
        resetForm();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить серию");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 md:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
          <Film className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-2xl font-black">Серии дорам</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
            Добавляй серии легко и красиво ✨
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <label className="text-sm font-black">Поиск дорамы</label>

          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/10">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Например: Goblin, Alchemy of Souls..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {isLoadingDoramas ? (
              <div className="flex items-center gap-2 rounded-2xl bg-background/60 p-4 text-sm font-bold text-muted-foreground dark:bg-white/5">
                <Loader2 className="h-4 w-4 animate-spin" />
                Загружаю...
              </div>
            ) : (
              filteredDoramas.map((dorama) => (
                <button
                  key={dorama.doramaId}
                  onClick={() => selectDorama(dorama)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    selectedDorama?.doramaId === dorama.doramaId
                      ? "border-violet-500 bg-violet-500/10"
                      : "border-border/70 bg-background/60 hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  }`}
                >
                  <div className="h-16 w-11 shrink-0 overflow-hidden rounded-xl bg-background/80 dark:bg-white/10">
                    {dorama.posterUrl && (
                      <img
                        src={dorama.posterUrl}
                        alt={dorama.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <p className="font-black">{dorama.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground dark:text-white/45">
                      {[dorama.countryName, dorama.releaseYear ?? null, dorama.duration ? `${dorama.duration} мин` : null]
                        .filter(Boolean)
                        .join(" · ") || "Данные не указаны"}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div>
          {!selectedDorama ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-background/50 p-8 text-center text-sm font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/50">
              Выбери дораму слева, чтобы управлять её сериями.
            </div>
          ) : (
            <>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground dark:text-white/40">
                  выбрана дорама
                </p>
                <h3 className="mt-2 text-xl font-black">{selectedDorama.title}</h3>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-background/50 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-black">Одна серия</p>

                <label className="mt-3 grid max-w-[180px] gap-2">
                  <span className="text-sm font-black">Номер серии</span>
                  <input
                    type="number"
                    min={1}
                    value={episodeNumber}
                    onChange={(event) => setEpisodeNumber(event.target.value)}
                    className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500 dark:border-white/10 dark:bg-white/10"
                  />
                </label>

                <label className="mt-3 grid gap-2">
                  <span className="text-sm font-black">Ссылка на видео</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/10">
                    <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={videoUrl}
                      onChange={(event) => setVideoUrl(event.target.value)}
                      placeholder="Вставь ссылку, embed-ссылку или iframe-код VK Video"
                      className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </label>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editingEpisode ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    {editingEpisode ? "Обновить серию" : "Добавить серию"}
                  </button>

                  {editingEpisode && (
                    <button
                      onClick={() => resetForm(selectedDorama)}
                      className="rounded-2xl border border-border/70 bg-background/70 px-5 py-3 text-sm font-black text-muted-foreground transition hover:bg-accent hover:text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                    >
                      Отмена
                    </button>
                  )}
                </div>
              </div>



              <div className="mt-6">
                <p className="font-black">Добавленные серии</p>

                {isLoadingEpisodes ? (
                  <div className="mt-3 flex items-center gap-2 rounded-2xl bg-background/60 p-4 text-sm font-bold text-muted-foreground dark:bg-white/5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Загружаю серии...
                  </div>
                ) : episodes.length === 0 ? (
                  <p className="mt-3 rounded-2xl bg-background/60 p-4 text-sm font-semibold text-muted-foreground dark:bg-white/5 dark:text-white/50">
                    У этой дорамы пока нет добавленных серий.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {episodes.map((episode) => (
                      <div
                        key={episode.episodeId}
                        className="rounded-2xl border border-border/70 bg-background/60 p-4 dark:border-white/10 dark:bg-white/5"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div>
                            <p className="font-black">Серия {episode.episodeNumber}</p>
                            <a
                              href={episode.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 block break-all text-xs font-semibold text-violet-700 hover:underline dark:text-violet-200"
                            >
                              {episode.videoUrl}
                            </a>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(episode)}
                              className="rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(episode)}
                              className="rounded-xl border border-red-300/70 bg-red-50 p-2 text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {message && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="mt-0.5 h-4 w-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 whitespace-pre-line rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </section>
  );
}
