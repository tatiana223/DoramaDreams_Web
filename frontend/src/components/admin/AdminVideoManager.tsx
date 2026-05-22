import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Film,
  Link as LinkIcon,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { getAllDoramas } from "@/api/doramaApi";
import { deleteDoramaVideo, updateDoramaVideo } from "@/api/adminApi";
import type { Dorama } from "@/types/dorama";

export function AdminVideoManager() {
  const [doramas, setDoramas] = useState<Dorama[]>([]);
  const [selectedDoramaId, setSelectedDoramaId] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedDorama = useMemo(() => {
    return doramas.find((dorama) => dorama.doramaId === selectedDoramaId) ?? null;
  }, [doramas, selectedDoramaId]);

  useEffect(() => {
    loadDoramas();
  }, []);

  useEffect(() => {
    setVideoUrl(selectedDorama?.videoUrl ?? "");
    setMessage("");
    setError("");
  }, [selectedDorama]);

  async function loadDoramas() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAllDoramas();
      setDoramas(data);

      if (data.length > 0) {
        setSelectedDoramaId(data[0].doramaId);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить список дорам");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedDoramaId) {
      setError("Выбери дораму");
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
      const updatedDorama = await updateDoramaVideo(selectedDoramaId, videoUrl.trim());

      setDoramas((current) =>
        current.map((dorama) =>
          dorama.doramaId === updatedDorama.doramaId ? updatedDorama : dorama
        )
      );

      setMessage("Ссылка на видео сохранена");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось сохранить видео");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedDoramaId) {
      setError("Выбери дораму");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const updatedDorama = await deleteDoramaVideo(selectedDoramaId);

      setDoramas((current) =>
        current.map((dorama) =>
          dorama.doramaId === updatedDorama.doramaId ? updatedDorama : dorama
        )
      );

      setVideoUrl("");
      setMessage("Видео удалено");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось удалить видео");
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
          <h2 className="text-2xl font-black">Ссылка на видео</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
            Выбери дораму и укажи ссылку, которая откроется на странице просмотра.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/70 bg-background/60 p-5 text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/5 dark:text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загружаю дорамы...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-black">Дорама</span>
              <select
                value={selectedDoramaId ?? ""}
                onChange={(event) => setSelectedDoramaId(Number(event.target.value))}
                className="rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm font-semibold outline-none transition focus:border-violet-500 dark:border-white/10 dark:bg-white/10"
              >
                {doramas.map((dorama) => (
                  <option key={dorama.doramaId} value={dorama.doramaId}>
                    {dorama.title}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black">Ссылка на видео</span>
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 dark:border-white/10 dark:bg-white/10">
                <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  placeholder="Ссылка на видео или iframe-источник"
                  className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-muted-foreground"
                />
              </div>
            </label>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {isSaving ? "Сохраняю..." : "Сохранить видео"}
            </button>

            <button
              onClick={handleDelete}
              disabled={isSaving || !selectedDorama?.videoUrl}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-300/70 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/15"
            >
              <Trash2 className="h-4 w-4" />
              Удалить
            </button>
          </div>
        </>
      )}

      {message && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
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
    </section>
  );
}
