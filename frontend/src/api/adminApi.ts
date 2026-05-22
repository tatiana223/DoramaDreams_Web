import { authHeaders, handleResponse } from "@/api/http";
import type { ActorBiographyTranslationResult, AdminDashboard, AdminDoramaPayload, RecommendationImportResponse } from "@/types/admin";
import type { Actor, Dorama } from "@/types/dorama";
import type { AdminDoramaEpisodeBulkRequest, AdminDoramaEpisodeBulkResult, AdminDoramaEpisodeRequest, DoramaEpisode } from "@/types/dorama";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await fetch("/api/admin/profile", {
    headers: authHeaders(),
  });

  return handleResponse<AdminDashboard>(response);
}

export async function importRecommendations(file: File): Promise<RecommendationImportResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/admin/recommendations/import", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });

  return handleResponse<RecommendationImportResponse>(response);
}

export async function createDorama(payload: AdminDoramaPayload): Promise<Dorama> {
  const response = await fetch("/api/admin/doramas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Dorama>(response);
}

export async function updateDorama(
  doramaId: number,
  payload: AdminDoramaPayload
): Promise<Dorama> {
  const response = await fetch(`/api/admin/doramas/${doramaId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Dorama>(response);
}

export async function importTmdbDoramasByCountry(
  country: "KR" | "CN",
  pages: number
): Promise<string> {
  const endpoint = country === "CN" ? "import-chinese-doramas" : "import-korean-doramas";
  const searchParams = new URLSearchParams({ pages: String(pages) });

  const response = await fetch(`/api/admin/tmdb/${endpoint}?${searchParams.toString()}`, {
    method: "POST",
    headers: authHeaders(),
  });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || "Не удалось обновить базу данных через API");
  }

  return text;
}

export async function updateDoramaVideo(
  doramaId: number,
  videoUrl: string
): Promise<Dorama> {
  const response = await fetch(`/api/admin/doramas/${doramaId}/video`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ videoUrl }),
  });

  return handleResponse<Dorama>(response);
}

export async function deleteDoramaVideo(doramaId: number): Promise<Dorama> {
  const response = await fetch(`/api/admin/doramas/${doramaId}/video`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse<Dorama>(response);
}

export async function createDoramaEpisode(
  payload: AdminDoramaEpisodeRequest
): Promise<DoramaEpisode> {
  const response = await fetch("/api/admin/episodes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<DoramaEpisode>(response);
}

export async function updateDoramaEpisode(
  episodeId: number,
  payload: AdminDoramaEpisodeRequest
): Promise<DoramaEpisode> {
  const response = await fetch(`/api/admin/episodes/${episodeId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<DoramaEpisode>(response);
}

export async function bulkImportDoramaEpisodes(
  payload: AdminDoramaEpisodeBulkRequest
): Promise<AdminDoramaEpisodeBulkResult> {
  const response = await fetch("/api/admin/episodes/bulk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<AdminDoramaEpisodeBulkResult>(response);
}

export async function deleteDoramaEpisode(episodeId: number): Promise<void> {
  const response = await fetch(`/api/admin/episodes/${episodeId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse<void>(response);
}
export async function getActors(): Promise<Actor[]> {
  const response = await fetch("/api/actors", {
    headers: authHeaders(),
  });

  return handleResponse<Actor[]>(response);
}

export async function createActor(payload: Omit<Actor, "actorId">): Promise<Actor> {
  const response = await fetch("/api/actors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Actor>(response);
}

export async function updateActor(
  actorId: number,
  payload: Omit<Actor, "actorId">
): Promise<Actor> {
  const response = await fetch(`/api/actors/${actorId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return handleResponse<Actor>(response);
}

export async function deleteActor(actorId: number): Promise<void> {
  const response = await fetch(`/api/actors/${actorId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse<void>(response);
}

export async function updateDoramaActors(
  doramaId: number,
  actorIds: number[]
): Promise<Dorama> {
  const response = await fetch(`/api/admin/doramas/${doramaId}/actors`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ actorIds }),
  });

  return handleResponse<Dorama>(response);
}
export async function translateActorBiographies(): Promise<ActorBiographyTranslationResult> {
  const response = await fetch("/api/actors/translate-biographies", {
    method: "POST",
    headers: authHeaders(),
  });

  return handleResponse<ActorBiographyTranslationResult>(response);
}

