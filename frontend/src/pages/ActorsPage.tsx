import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Heart, Loader2, Search, UserRound, UsersRound } from "lucide-react";
import { addFavoriteActor, getActors, getMyFavoriteActors, removeFavoriteActor } from "@/api/actorApi";
import { isAuthenticated } from "@/api/authStorage";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Actor } from "@/types/dorama";

export function ActorsPage() {
  const navigate = useNavigate();
  const [actors, setActors] = useState<Actor[]>([]);
  const [favoriteActorIds, setFavoriteActorIds] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadActors();
  }, []);

  const visibleActors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return actors;
    }

    return actors.filter((actor) =>
      actor.fullName.toLowerCase().includes(normalizedQuery)
    );
  }, [actors, query]);

  async function loadActors() {
    setError("");
    setIsLoading(true);

    try {
      const [actorsData, favoriteActorsData] = await Promise.all([
        getActors(),
        isAuthenticated() ? getMyFavoriteActors() : Promise.resolve([]),
      ]);

      setActors(actorsData);
      setFavoriteActorIds(favoriteActorsData.map((actor) => actor.actorId));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось загрузить актёров");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFavorite(actorId: number) {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      if (favoriteActorIds.includes(actorId)) {
        await removeFavoriteActor(actorId);
        setFavoriteActorIds((current) => current.filter((id) => id !== actorId));
      } else {
        await addFavoriteActor(actorId);
        setFavoriteActorIds((current) => [...current, actorId]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось изменить любимых актёров");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 md:pb-14">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/85 p-6 shadow-2xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:shadow-black/30 md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-20 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-bold text-violet-700 dark:border-white/10 dark:bg-white/10 dark:text-violet-100">
                <UsersRound className="h-4 w-4" />
                Актёры дорам
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Актёры</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground dark:text-white/60">
                Любимые лица и красивые истории ✨
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 rounded-[1.5rem] border border-border/70 bg-background/50 p-3 shadow-xl shadow-violet-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-black/20 sm:w-[320px] lg:ml-auto lg:shrink-0">
              <Stat value={actors.length} label="актёров" />
              <Stat value={favoriteActorIds.length} label="любимых" />
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-[1.8rem] border border-border/70 bg-card/85 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 dark:text-white/35" />
            <Input
              className="h-12 rounded-2xl border-border/70 bg-background/80 pl-10 text-foreground placeholder:text-muted-foreground/70 dark:border-white/10 dark:bg-black/25 dark:text-white dark:placeholder:text-white/35"
              placeholder="Поиск по имени актёра"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </section>

        {error && <div className="mt-5 rounded-3xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-semibold text-red-700 dark:text-red-100">{error}</div>}

        <section className="mt-6">
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center text-violet-700 dark:text-violet-200">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : visibleActors.length === 0 ? (
            <div className="rounded-[2rem] border border-border/70 bg-card/85 px-6 py-14 text-center shadow-xl dark:border-white/10 dark:bg-white/[0.06]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-background/70 text-foreground dark:bg-white/10 dark:text-white">
                <UserRound className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-black">Актёры не найдены</h2>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground dark:text-white/55">Попробуй другой запрос ✨</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {visibleActors.map((actor) => (
                <ActorCard
                  key={actor.actorId}
                  actor={actor}
                  isFavorite={favoriteActorIds.includes(actor.actorId)}
                  isSaving={isSaving}
                  onFavorite={() => handleFavorite(actor.actorId)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function ActorCard({ actor, isFavorite, isSaving, onFavorite }: { actor: Actor; isFavorite: boolean; isSaving: boolean; onFavorite: () => void }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-[1.45rem] border-border/70 bg-card/95 p-2.5 text-foreground shadow-xl shadow-violet-950/10 backdrop-blur transition hover:-translate-y-1 hover:bg-white/[0.1] dark:border-white/10 dark:bg-white/[0.07] dark:text-white dark:shadow-black/20">
      <Link to={`/actors/${actor.actorId}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.15rem] bg-background/70 dark:bg-white/10">
          {actor.photoUrl ? (
            <img src={actor.photoUrl} alt={actor.fullName} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-violet-950 to-fuchsia-950 text-white/40">
              <UserRound className="h-12 w-12" />
              <p className="mt-2 text-xs font-bold">Нет фото</p>
            </div>
          )}
          <div className="absolute inset-x-2 bottom-2 rounded-xl bg-black/60 px-2.5 py-1.5 text-[11px] font-bold text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
            Открыть страницу
          </div>
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-sm font-black leading-snug sm:text-base">{actor.fullName}</h2>
            <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground dark:text-white/35">актёр</p>
          </div>
          <button
            onClick={onFavorite}
            disabled={isSaving}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition disabled:opacity-60 ${
              isFavorite
                ? "border-fuchsia-400 bg-fuchsia-500 text-white"
                : "border-border/70 bg-background/70 text-muted-foreground hover:text-fuchsia-600 dark:border-white/10 dark:bg-white/10 dark:text-white/65"
            }`}
            aria-label={isFavorite ? "Удалить из любимых" : "Добавить в любимые"}
          >
            <Heart className={isFavorite ? "h-4 w-4 fill-current" : "h-4 w-4"} />
          </button>
        </div>

        <Link to={`/actors/${actor.actorId}`} className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-2 text-center text-sm font-black text-white">
          Подробнее
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
