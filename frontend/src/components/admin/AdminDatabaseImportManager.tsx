import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  DatabaseZap,
  Loader2,
  RefreshCcw,
} from "lucide-react";
import { importTmdbDoramasByCountry } from "@/api/adminApi";

type ImportCountry = "ALL" | "KR" | "CN";

type AdminDatabaseImportManagerProps = {
  onImported?: () => void | Promise<void>;
};

export function AdminDatabaseImportManager({ onImported }: AdminDatabaseImportManagerProps) {
  const [country, setCountry] = useState<ImportCountry>("ALL");
  const [pages, setPages] = useState("3");
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleImport() {
    const pagesCount = Number(pages);

    if (!Number.isInteger(pagesCount) || pagesCount < 1 || pagesCount > 20) {
      setError("Количество страниц должно быть целым числом от 1 до 20");
      return;
    }

    setIsImporting(true);
    setMessage("");
    setError("");

    try {
      const results: string[] = [];

      if (country === "ALL" || country === "KR") {
        results.push(await importTmdbDoramasByCountry("KR", pagesCount));
      }

      if (country === "ALL" || country === "CN") {
        results.push(await importTmdbDoramasByCountry("CN", pagesCount));
      }

      setMessage(results.join("\n"));
      await onImported?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось обновить базу данных через API");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 md:p-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
            <DatabaseZap className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-2xl font-black">Обновить базу данных из API</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground dark:text-white/55">
              Администратор может вручную запустить синхронизацию дорам, актёров, жанров, тегов и постеров из TMDB API.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="text-sm font-black">Что обновить</span>
          <select
            value={country}
            onChange={(event) => setCountry(event.target.value as ImportCountry)}
            disabled={isImporting}
            className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 disabled:opacity-60 dark:border-white/10 dark:bg-black/25"
          >
            <option value="ALL">Корейские и китайские дорамы</option>
            <option value="KR">Только корейские дорамы</option>
            <option value="CN">Только китайские дорамы</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black">Страниц API</span>
          <input
            type="number"
            min={1}
            max={20}
            value={pages}
            onChange={(event) => setPages(event.target.value)}
            disabled={isImporting}
            className="h-12 rounded-2xl border border-border/70 bg-background/80 px-4 text-sm font-semibold outline-none transition focus:border-violet-500 disabled:opacity-60 dark:border-white/10 dark:bg-black/25"
          />
        </label>

        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          {isImporting ? "Обновляю..." : "Обновить"}
        </button>
      </div>

      {message && (
        <div className="mt-5 whitespace-pre-line rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <AlertTriangle className="mt-0.5 h-4 w-4" />
          {error}
        </div>
      )}
    </section>
  );
}
