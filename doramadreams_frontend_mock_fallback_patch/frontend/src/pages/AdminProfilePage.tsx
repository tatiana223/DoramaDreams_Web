import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { AdminActorManager } from "@/components/admin/AdminActorManager";
import { AdminDatabaseImportManager } from "@/components/admin/AdminDatabaseImportManager";
import { AdminDoramaManager } from "@/components/admin/AdminDoramaManager";
import { AdminEpisodeManager } from "@/components/admin/AdminEpisodeManager";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Film,
  Heart,
  MessageSquare,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
  Users,
} from "lucide-react";
import { getAdminDashboard, importRecommendations } from "@/api/adminApi";
import type { AdminDashboard, RecommendationImportResponse } from "@/types/admin";
import { getCurrentUser } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";

type AdminSection = "overview" | "media" | "api" | "actors";

const adminSections: { value: AdminSection; label: string; description: string; icon: typeof Database }[] = [
  {
    value: "overview",
    label: "Рекомендации",
    description: "управление рекомендациями",
    icon: Database,
  },
  {
    value: "media",
    label: "Дорамы и серии",
    description: "дорамы и эпизоды",
    icon: Film,
  },
  {
    value: "api",
    label: "API база",
    description: "обновление данных из TMDB",
    icon: Database,
  },
  {
    value: "actors",
    label: "Актёры",
    description: "управление актёрами и составом",
    icon: Users,
  },
];

export function AdminProfilePage() {
  const user = getCurrentUser();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<RecommendationImportResponse | null>(null);
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setError("");
    setIsLoading(true);

    try {
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить профиль администратора");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setImportError("");
    setImportResult(null);
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  async function handleImport() {
    if (!selectedFile) {
      setImportError("Выбери CSV-файл user_recommendations_final.csv");
      return;
    }

    setImportError("");
    setImportResult(null);
    setIsImporting(true);

    try {
      const result = await importRecommendations(selectedFile);
      setImportResult(result);
      setSelectedFile(null);
      await loadDashboard();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Не удалось импортировать рекомендации");
    } finally {
      setIsImporting(false);
    }
  }

  const mlCoverageText = useMemo(() => {
    if (!dashboard || dashboard.usersCount === 0) return "0%";
    return `${Math.round((dashboard.usersWithRecommendationsCount / dashboard.usersCount) * 100)}%`;
  }, [dashboard]);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30 md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-bold text-muted-foreground dark:border-white/10 dark:bg-white/10 dark:text-white/75">
                <ShieldCheck className="h-4 w-4 text-fuchsia-700 dark:text-fuchsia-200" />
                панель администратора
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl">Управление DoramaDreams</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                Здесь живёт магия управления ✨
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-4 dark:border-white/10 dark:bg-white/10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground dark:text-white/45">текущий админ</p>
              <p className="mt-2 text-lg font-black">{user?.username}</p>
              <p className="text-sm text-muted-foreground dark:text-white/55">{user?.email}</p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            {error}
          </div>
        )}

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={Users} title="Пользователи" value={isLoading ? "..." : dashboard?.usersCount ?? 0} />
          <AdminStatCard icon={Film} title="Дорамы" value={isLoading ? "..." : dashboard?.doramasCount ?? 0} />
          <AdminStatCard icon={Star} title="Оценки" value={isLoading ? "..." : dashboard?.ratingsCount ?? 0} />
          <AdminStatCard icon={Heart} title="Избранное" value={isLoading ? "..." : dashboard?.favoritesCount ?? 0} />
          <AdminStatCard icon={Clock3} title="Статусы просмотра" value={isLoading ? "..." : dashboard?.watchHistoryCount ?? 0} />
          <AdminStatCard icon={MessageSquare} title="Отзывы" value={isLoading ? "..." : dashboard?.reviewsCount ?? 0} />
          <AdminStatCard icon={Sparkles} title="Рекомендации" value={isLoading ? "..." : dashboard?.userRecommendationsCount ?? 0} />
          <AdminStatCard icon={Database} title="Покрытие пользователей" value={isLoading ? "..." : mlCoverageText} />
        </div>

        <section className="mt-7 rounded-[2rem] border border-border/70 bg-card/75 p-2 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-black/20">
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {adminSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.value;

              return (
                <button
                  key={section.value}
                  onClick={() => setActiveSection(section.value)}
                  className={`flex items-center gap-4 rounded-[1.5rem] p-4 text-left transition ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-950/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  }`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? "bg-white/20" : "bg-background/70 dark:bg-white/10"}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-black">{section.label}</span>
                    <span className={`mt-0.5 block text-xs font-semibold ${isActive ? "text-white/75" : "text-muted-foreground dark:text-white/40"}`}>
                      {section.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {activeSection === "overview" && (
          <div className="mt-7 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 md:p-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-2xl font-black">Текущие рекомендации</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
                    Актуальные рекомендации — прямо здесь 💫
                  </p>
                </div>
                <button
                  onClick={loadDashboard}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-black transition hover:bg-accent dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/15"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Обновить
                </button>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-background/60 p-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40">версия рекомендаций</p>
                <p className="mt-2 break-words text-lg font-black">
                  {dashboard?.currentModelVersion ?? "Рекомендации ещё не импортированы"}
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <MiniInfo title="Пользователей с рекомендациями" value={dashboard?.usersWithRecommendationsCount ?? 0} />
                <MiniInfo title="Последний импорт" value={formatDateTime(dashboard?.recommendationsUpdatedAt)} />
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20 md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-white">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black">Импорт рекомендаций</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/55">
                    Обновим рекомендации в один клик ✨
                  </p>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-border/80 bg-background/60 px-5 py-8 text-center transition hover:bg-accent dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10">
                <FileText className="h-8 w-8 text-fuchsia-700 dark:text-fuchsia-200" />
                <span className="mt-3 text-sm font-black">
                  {selectedFile ? selectedFile.name : "Выбрать user_recommendations_final.csv"}
                </span>
                <span className="mt-1 text-xs text-muted-foreground dark:text-white/45">CSV-колонки: user_id,dorama_id,score,model_version</span>
                <input className="hidden" type="file" accept=".csv,text/csv" onChange={handleFileChange} />
              </label>

              <button
                onClick={handleImport}
                disabled={isImporting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-3 text-sm font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? "Импортирую..." : "Импортировать рекомендации"}
              </button>

              {importError && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-300/70 bg-red-50 p-4 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  {importError}
                </div>
              )}

              {importResult && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-300/70 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4" />
                  <span>
                    Импортировано строк: {importResult.importedRows}. Версия: {importResult.modelVersion}.
                  </span>
                </div>
              )}
            </section>
          </div>
        )}

        {activeSection === "media" && (
          <div className="mt-7 grid gap-7">
            <AdminDoramaManager />
            <AdminEpisodeManager />
          </div>
        )}

        {activeSection === "api" && (
          <div className="mt-7">
            <AdminDatabaseImportManager onImported={loadDashboard} />
          </div>
        )}


        {activeSection === "actors" && (
          <div className="mt-7">
            <AdminActorManager />
          </div>
        )}
      </div>
    </AppShell>
  );
}

function AdminStatCard({ icon: Icon, title, value }: { icon: typeof Users; title: string; value: string | number }) {
  return (
    <div className="rounded-[1.7rem] border border-border/70 bg-card/85 p-5 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/20">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background/70 text-fuchsia-700 dark:bg-white/10 dark:text-fuchsia-100">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground dark:text-white/40">{title}</p>
      <p className="mt-2 font-mono text-3xl font-black leading-none tabular-nums text-foreground dark:text-white">{value}</p>
    </div>
  );
}

function MiniInfo({ title, value }: { title: string | number; value: string | number }) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5 dark:border-white/10 dark:bg-white/5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground dark:text-white/40">{title}</p>
      <p className="mt-2 break-words text-xl font-black">{value}</p>
    </div>
  );
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
