import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Film,
  Link as LinkIcon,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { getAllDoramas } from "@/api/doramaApi";
import {
  createActor,
  deleteActor,
  getActors,
  translateActorBiographies,
  updateActor,
  updateDoramaActors,
} from "@/api/adminApi";
import type { Actor, Dorama } from "@/types/dorama";

type ActorForm = {
  fullName: string;
  originalName: string;
  birthDate: string;
  placeOfBirth: string;
  knownForDepartment: string;
  popularity: string;
  tmdbId: string;
  imdbId: string;
  photoUrl: string;
  biography: string;
};

const emptyForm: ActorForm = {
  fullName: "",
  originalName: "",
  birthDate: "",
  placeOfBirth: "",
  knownForDepartment: "",
  popularity: "",
  tmdbId: "",
  imdbId: "",
  photoUrl: "",
  biography: "",
};

export function AdminActorManager() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [doramas, setDoramas] = useState<Dorama[]>([]);
  const [actorQuery, setActorQuery] = useState("");
  const [doramaQuery, setDoramaQuery] = useState("");
  const [selectedDorama, setSelectedDorama] = useState<Dorama | null>(null);
  const [selectedActorIds, setSelectedActorIds] = useState<number[]>([]);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  const [form, setForm] = useState<ActorForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingActor, setIsSavingActor] = useState(false);
  const [isSavingCast, setIsSavingCast] = useState(false);
  const [isTranslatingBiographies, setIsTranslatingBiographies] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredActors = useMemo(() => {
    const normalized = actorQuery.trim().toLowerCase();

    if (!normalized) {
      return actors.slice(0, 18);
    }

    return actors
      .filter((actor) => {
        const searchable = [
          actor.fullName,
          actor.originalName,
          actor.placeOfBirth,
          actor.knownForDepartment,
          actor.biography,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchable.includes(normalized);
      })
      .slice(0, 18);
  }, [actors, actorQuery]);

  const filteredDoramas = useMemo(() => {
    const normalized = doramaQuery.trim().toLowerCase();

    if (!normalized) {
      return doramas.slice(0, 10);
    }

    return doramas
      .filter((dorama) => {
        const title = dorama.title?.toLowerCase() ?? "";
        const originalTitle = dorama.originalTitle?.toLowerCase() ?? "";
        return title.includes(normalized) || originalTitle.includes(normalized);
      })
      .slice(0, 10);
  }, [doramas, doramaQuery]);

  const selectedActors = useMemo(() => {
    const ids = new Set(selectedActorIds);
    return actors.filter((actor) => ids.has(actor.actorId));
  }, [actors, selectedActorIds]);

  const filledActorsCount = useMemo(() => {
    return actors.filter((actor) => actor.photoUrl || actor.biography || actor.birthDate || actor.placeOfBirth).length;
  }, [actors]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      const [actorsData, doramasData] = await Promise.all([getActors(), getAllDoramas()]);
      setActors(actorsData);
      setDoramas(doramasData);

      if (doramasData.length > 0) {
        selectDorama(doramasData[0]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить актёров и дорамы");
    } finally {
      setIsLoading(false);
    }
  }

  function selectDorama(dorama: Dorama) {
    setSelectedDorama(dorama);
    setSelectedActorIds(dorama.actors?.map((actor) => actor.actorId) ?? []);
    setMessage("");
    setError("");
  }

  function updateForm(field: keyof ActorForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startEdit(actor: Actor) {
    setEditingActor(actor);
    setForm({
      fullName: actor.fullName ?? "",
      originalName: actor.originalName ?? "",
      birthDate: actor.birthDate ?? "",
      placeOfBirth: actor.placeOfBirth ?? "",
      knownForDepartment: actor.knownForDepartment ?? "",
      popularity: actor.popularity == null ? "" : String(actor.popularity),
      tmdbId: actor.tmdbId == null ? "" : String(actor.tmdbId),
      imdbId: actor.imdbId ?? "",
      photoUrl: actor.photoUrl ?? "",
      biography: actor.biography ?? "",
    });
    setMessage("");
    setError("");
  }

  function resetActorForm() {
    setEditingActor(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  }

  function toggleActor(actorId: number) {
    setSelectedActorIds((current) => {
      if (current.includes(actorId)) {
        return current.filter((id) => id !== actorId);
      }

      return [...current, actorId];
    });
  }

  async function handleSaveActor() {
    const fullName = form.fullName.trim();

    if (!fullName) {
      setError("Укажи имя актёра");
      return;
    }

    const tmdbId = normalizeInteger(form.tmdbId);
    const popularity = normalizeFloat(form.popularity);

    if (tmdbId === false) {
      setError("TMDB ID должен быть целым числом");
      return;
    }

    if (popularity === false) {
      setError("Популярность должна быть числом");
      return;
    }

    const payload: Omit<Actor, "actorId"> = {
      fullName,
      originalName: normalizeText(form.originalName),
      birthDate: normalizeText(form.birthDate),
      placeOfBirth: normalizeText(form.placeOfBirth),
      knownForDepartment: normalizeText(form.knownForDepartment),
      popularity,
      tmdbId,
      imdbId: normalizeText(form.imdbId),
      photoUrl: normalizeText(form.photoUrl),
      biography: normalizeText(form.biography),
    };

    setIsSavingActor(true);
    setMessage("");
    setError("");

    try {
      if (editingActor) {
        const updated = await updateActor(editingActor.actorId, payload);
        setActors((current) =>
          current.map((actor) => (actor.actorId === updated.actorId ? updated : actor))
        );
        setDoramas((current) => refreshActorInDoramas(current, updated));
        setSelectedDorama((current) => (current ? refreshActorInDorama(current, updated) : current));
        setMessage("Актёр обновлён");
      } else {
        const created = await createActor(payload);
        setActors((current) => [created, ...current]);
        setMessage("Актёр добавлен");
      }

      resetActorForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить актёра");
    } finally {
      setIsSavingActor(false);
    }
  }

  async function handleDeleteActor(actor: Actor) {
    setIsSavingActor(true);
    setMessage("");
    setError("");

    try {
      await deleteActor(actor.actorId);
      setActors((current) => current.filter((item) => item.actorId !== actor.actorId));
      setDoramas((current) => removeActorFromDoramas(current, actor.actorId));
      setSelectedDorama((current) => (current ? removeActorFromDorama(current, actor.actorId) : current));
      setSelectedActorIds((current) => current.filter((id) => id !== actor.actorId));

      if (editingActor?.actorId === actor.actorId) {
        resetActorForm();
      }

      setMessage("Актёр удалён и отвязан от дорам");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить актёра");
    } finally {
      setIsSavingActor(false);
    }
  }


  async function handleTranslateBiographies() {
    setIsTranslatingBiographies(true);
    setMessage("");
    setError("");

    try {
      const result = await translateActorBiographies();
      const freshActors = await getActors();
      setActors(freshActors);
      setDoramas((current) =>
        current.map((dorama) => ({
          ...dorama,
          actors: dorama.actors?.map((actor) =>
            freshActors.find((freshActor) => freshActor.actorId === actor.actorId) ?? actor
          ),
        }))
      );
      setSelectedDorama((current) =>
        current
          ? {
              ...current,
              actors: current.actors?.map((actor) =>
                freshActors.find((freshActor) => freshActor.actorId === actor.actorId) ?? actor
              ),
            }
          : current
      );
      setMessage(
        `Перевод завершён: переведено ${result.translatedCount} из ${result.totalActors}. ` +
          `Уже на русском: ${result.skippedRussianCount}, пустых: ${result.skippedEmptyCount}, ошибок: ${result.failedCount}.`
      );
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось автоматически перевести описания актёров");
    } finally {
      setIsTranslatingBiographies(false);
    }
  }

  async function handleSaveCast() {
    if (!selectedDorama) {
      setError("Выбери дораму для привязки актёров");
      return;
    }

    setIsSavingCast(true);
    setMessage("");
    setError("");

    try {
      const updatedDorama = await updateDoramaActors(selectedDorama.doramaId, selectedActorIds);
      setDoramas((current) =>
        current.map((dorama) =>
          dorama.doramaId === updatedDorama.doramaId ? updatedDorama : dorama
        )
      );
      setSelectedDorama(updatedDorama);
      setSelectedActorIds(updatedDorama.actors?.map((actor) => actor.actorId) ?? []);
      setMessage("Состав актёров сохранён");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить актёров дорамы");
    } finally {
      setIsSavingCast(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20">
      <div className="relative border-b border-border/70 p-6 dark:border-white/10 md:p-8">
        <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-muted-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/55">
              <UsersRound className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-200" />
              cast manager
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Актёры и «В ролях»</h2>

          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <ActorStat value={actors.length} label="актёров" />
            <ActorStat value={filledActorsCount} label="с данными" />
            <ActorStat value={selectedActorIds.length} label="в выбранной дораме" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="m-6 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-5 text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/60 md:m-8">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загружаю актёров и дорамы...
        </div>
      ) : (
        <div className="space-y-6 p-6 md:p-8">
          <div className="rounded-[1.6rem] border border-border/70 bg-background/55 p-5 dark:border-white/10 dark:bg-white/5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black">Добавить актёра</h3>
                <p className="mt-1 text-sm text-muted-foreground dark:text-white/50">
                  Заполни основные данные. Дополнительные поля можно оставить пустыми.
                </p>
              </div>
              {editingActor && (
                <button
                  onClick={resetActorForm}
                  className="rounded-xl border border-border/70 bg-background/70 p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                  title="Сбросить форму"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormInput
                    label="ФИО / имя актёра"
                    value={form.fullName}
                    onChange={(value) => updateForm("fullName", value)}
                    placeholder="Например: Ли Мин Хо"
                  />
                  <FormInput
                    label="Оригинальное имя"
                    value={form.originalName}
                    onChange={(value) => updateForm("originalName", value)}
                    placeholder="Lee Min-ho"
                  />
                  <FormInput
                    label="Дата рождения"
                    type="date"
                    value={form.birthDate}
                    onChange={(value) => updateForm("birthDate", value)}
                  />
                  <FormInput
                    label="Место / страна рождения"
                    value={form.placeOfBirth}
                    onChange={(value) => updateForm("placeOfBirth", value)}
                    placeholder="Seoul, South Korea"
                  />

                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-black">Фото</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                    <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={form.photoUrl}
                      onChange={(event) => updateForm("photoUrl", event.target.value)}
                      placeholder="https://.../actor.jpg"
                      className="w-full min-w-0 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-black">Короткая биография</span>
                  <textarea
                    value={form.biography}
                    onChange={(event) => updateForm("biography", event.target.value)}
                    placeholder="Где снимался, чем известен, примечания для карточки..."
                    rows={5}
                    className="resize-y rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold leading-6 outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-black/20"
                  />
                </label>
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <ActorPreview form={form} />

                <button
                  onClick={handleSaveActor}
                  disabled={isSavingActor}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingActor ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {isSavingActor ? "Сохраняю..." : editingActor ? "Сохранить актёра" : "Добавить актёра"}
                </button>

                {editingActor && (
                  <p className="rounded-2xl border border-violet-300/70 bg-violet-50 p-4 text-sm font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100">
                    Редактируется: {editingActor.fullName}. Чтобы снова добавить нового актёра, нажми крестик вверху формы.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="min-w-0 rounded-[1.6rem] border border-border/70 bg-background/55 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="text-xl font-black">База актёров</h3>
                  <p className="mt-1 text-sm text-muted-foreground dark:text-white/50">Поиск, редактирование, удаление и перевод описаний.</p>
                </div>
                <button
                  onClick={handleTranslateBiographies}
                  disabled={isTranslatingBiographies || isLoading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-violet-300/70 bg-violet-50 px-4 py-2.5 text-sm font-black text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-100 dark:hover:bg-violet-500/20"
                >
                  {isTranslatingBiographies ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isTranslatingBiographies ? "Перевожу..." : "Перевести описания"}
                </button>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={actorQuery}
                  onChange={(event) => setActorQuery(event.target.value)}
                  placeholder="Найти актёра"
                  className="w-full min-w-0 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                />
              </div>

              <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {filteredActors.length === 0 ? (
                  <EmptyState text="Актёров пока нет. Добавь первого через форму выше." />
                ) : (
                  filteredActors.map((actor) => (
                    <div
                      key={actor.actorId}
                      className={`rounded-2xl border p-3 transition ${
                        editingActor?.actorId === actor.actorId
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-border/70 bg-card/70 dark:border-white/10 dark:bg-black/15"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <ActorAvatar actor={actor} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-black">{actor.fullName}</p>
                          <p className="mt-1 truncate text-xs font-semibold text-muted-foreground dark:text-white/45">
                            {[actor.originalName, actor.placeOfBirth, actor.birthDate].filter(Boolean).join(" · ") || "Дополнительные данные не заполнены"}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground dark:text-white/45">
                            {actor.biography || "Биография пока не заполнена"}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => startEdit(actor)}
                            className="rounded-xl border border-border/70 bg-background/80 p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/70"
                            title="Редактировать"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteActor(actor)}
                            disabled={isSavingActor}
                            className="rounded-xl border border-red-300/70 bg-red-50 p-2 text-red-700 transition hover:bg-red-100 disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                            title="Удалить"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="min-w-0 rounded-[1.6rem] border border-border/70 bg-background/55 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                  <h3 className="text-xl font-black">Привязка актёров к дораме</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-white/50">
                    Выбери дораму, отметь актёров и сохрани — они появятся на странице в блоке «Актёры».
                  </p>
                </div>
                <button
                  onClick={handleSaveCast}
                  disabled={isSavingCast || !selectedDorama}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {isSavingCast ? "Сохраняю..." : "Сохранить состав"}
                </button>
              </div>

              <div className="mt-5 grid gap-5 2xl:grid-cols-[0.86fr_1.14fr]">
                <div className="min-w-0">
                  <label className="text-sm font-black">Поиск дорамы</label>
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 dark:border-white/10 dark:bg-black/20">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      value={doramaQuery}
                      onChange={(event) => setDoramaQuery(event.target.value)}
                      placeholder="Название или original title"
                      className="w-full min-w-0 bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                    {filteredDoramas.map((dorama) => (
                      <button
                        key={dorama.doramaId}
                        onClick={() => selectDorama(dorama)}
                        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                          selectedDorama?.doramaId === dorama.doramaId
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-border/70 bg-card/70 hover:bg-accent dark:border-white/10 dark:bg-black/15 dark:hover:bg-white/10"
                        }`}
                      >
                        <div className="h-16 w-11 shrink-0 overflow-hidden rounded-xl bg-background/80 dark:bg-white/10">
                          {dorama.posterUrl ? (
                            <img src={dorama.posterUrl} alt={dorama.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Film className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-black">{dorama.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground dark:text-white/45">
                            {[dorama.countryName, dorama.releaseYear ?? null, dorama.duration ? `${dorama.duration} мин` : null]
                              .filter(Boolean)
                              .join(" · ") || "Данные не указаны"} · {dorama.actors?.length ?? 0} акт.
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  {selectedDorama ? (
                    <div className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4 dark:border-white/10 dark:bg-black/15">
                      <div className="flex items-start gap-4">
                        <div className="h-24 w-16 shrink-0 overflow-hidden rounded-2xl bg-background/80 dark:bg-white/10">
                          {selectedDorama.posterUrl ? (
                            <img src={selectedDorama.posterUrl} alt={selectedDorama.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Film className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground dark:text-white/40">выбрана дорама</p>
                          <h4 className="mt-2 line-clamp-2 text-lg font-black leading-tight">{selectedDorama.title}</h4>
                          <p className="mt-1 truncate text-xs text-muted-foreground dark:text-white/45">{selectedDorama.originalTitle || "Оригинальное название не указано"}</p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl border border-dashed border-border/70 bg-background/60 p-4 dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-2 text-sm font-black">
                          <Sparkles className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-200" />
                          В ролях
                        </div>
                        {selectedActors.length === 0 ? (
                          <p className="mt-2 text-sm text-muted-foreground dark:text-white/50">Пока никто не выбран.</p>
                        ) : (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedActors.map((actor) => (
                              <button
                                key={actor.actorId}
                                onClick={() => toggleActor(actor.actorId)}
                                className="inline-flex max-w-full items-center gap-2 rounded-full bg-violet-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-violet-700"
                              >
                                <span className="truncate">{actor.fullName}</span>
                                <X className="h-3.5 w-3.5 shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <EmptyState text="Выбери дораму слева, чтобы собрать блок «В ролях»." />
                  )}

                  <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-card/70 p-4 dark:border-white/10 dark:bg-black/15">
                    <p className="font-black">Отметить актёров</p>
                    <div className="mt-3 max-h-[430px] space-y-2 overflow-y-auto pr-1">
                      {actors.length === 0 ? (
                        <EmptyState text="Сначала добавь актёров в базу." />
                      ) : (
                        actors.map((actor) => {
                          const checked = selectedActorIds.includes(actor.actorId);

                          return (
                            <button
                              key={actor.actorId}
                              onClick={() => toggleActor(actor.actorId)}
                              className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                                checked
                                  ? "border-fuchsia-500 bg-fuchsia-500/10"
                                  : "border-border/70 bg-background/60 hover:bg-accent dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${
                                  checked
                                    ? "border-fuchsia-500 bg-fuchsia-500 text-white"
                                    : "border-border/80 text-transparent dark:border-white/20"
                                }`}
                              >
                                ✓
                              </span>
                              <ActorAvatar actor={actor} small />
                              <div className="min-w-0">
                                <p className="truncate font-black">{actor.fullName}</p>
                                <p className="truncate text-xs text-muted-foreground dark:text-white/45">{actor.placeOfBirth || actor.biography || "Без описания"}</p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(message || error) && (
        <div className="px-6 pb-6 md:px-8 md:pb-8">
          {message && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
              <CheckCircle2 className="mt-0.5 h-4 w-4" />
              {message}
            </div>
          )}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "text" | "search" | "email" | "tel" | "url" | "none" | "numeric" | "decimal";
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-black">{label}</span>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-muted-foreground focus:border-violet-500 dark:border-white/10 dark:bg-black/20"
      />
    </label>
  );
}

function ActorStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-center dark:border-white/10 dark:bg-white/10">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground dark:text-white/45">{label}</p>
    </div>
  );
}

function ActorPreview({ form }: { form: ActorForm }) {
  const name = form.fullName.trim() || "Новый актёр";
  const meta = [form.originalName, form.placeOfBirth, form.birthDate].filter(Boolean).join(" · ");

  return (
    <div className="rounded-2xl border border-border/70 bg-card/70 p-4 dark:border-white/10 dark:bg-black/15">
      <div className="flex min-w-0 items-center gap-3">
        {form.photoUrl.trim() ? (
          <img src={form.photoUrl.trim()} alt={name} className="h-14 w-14 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-white/10 dark:text-violet-200">
            <UserRound className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-black">{name}</p>
          <p className="truncate text-xs font-semibold text-muted-foreground dark:text-white/45">
            {meta || "Дополнительные данные не указаны"}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-4 text-xs leading-5 text-muted-foreground dark:text-white/45">
        {form.biography.trim() || "Предпросмотр карточки актёра"}
      </p>
    </div>
  );
}

function ActorAvatar({ actor, small = false }: { actor: Actor; small?: boolean }) {
  const size = small ? "h-10 w-10" : "h-12 w-12";

  if (actor.photoUrl) {
    return <img src={actor.photoUrl} alt={actor.fullName} className={`${size} shrink-0 rounded-full object-cover`} />;
  }

  return (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700 dark:bg-white/10 dark:text-violet-200`}>
      {actor.fullName?.slice(0, 1) || <UserRound className="h-4 w-4" />}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/70 bg-background/50 p-5 text-center text-sm font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/50">
      {text}
    </div>
  );
}

function normalizeText(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeInteger(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isInteger(parsed) ? parsed : false;
}

function normalizeFloat(value: string) {
  const trimmed = value.trim().replace(",", ".");

  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : false;
}

function refreshActorInDoramas(doramas: Dorama[], actor: Actor) {
  return doramas.map((dorama) => refreshActorInDorama(dorama, actor));
}

function refreshActorInDorama(dorama: Dorama, actor: Actor) {
  if (!dorama.actors?.some((item) => item.actorId === actor.actorId)) {
    return dorama;
  }

  return {
    ...dorama,
    actors: dorama.actors.map((item) => (item.actorId === actor.actorId ? actor : item)),
  };
}

function removeActorFromDoramas(doramas: Dorama[], actorId: number) {
  return doramas.map((dorama) => removeActorFromDorama(dorama, actorId));
}

function removeActorFromDorama(dorama: Dorama, actorId: number) {
  if (!dorama.actors?.some((item) => item.actorId === actorId)) {
    return dorama;
  }

  return {
    ...dorama,
    actors: dorama.actors.filter((item) => item.actorId !== actorId),
  };
}
