import { authHeaders, handleResponse } from "@/api/http";
import type {
  Dorama,
  DoramaSearchParams,
  Rating,
  Review,
  WatchHistoryItem,
  WatchStatus,
} from "@/types/dorama";

export async function getAllDoramas(): Promise<Dorama[]> {
  const response = await fetch("/api/doramas");
  return handleResponse<Dorama[]>(response);
}

export async function getDoramaById(id: number): Promise<Dorama> {
  const response = await fetch(`/api/doramas/${id}`);
  return handleResponse<Dorama>(response);
}

export async function getTopRatedDoramas(limit = 6): Promise<Dorama[]> {
  const response = await fetch(`/api/doramas/top-rated?limit=${limit}`);
  return handleResponse<Dorama[]>(response);
}

export async function searchDoramas(params: DoramaSearchParams): Promise<Dorama[]> {
  const searchParams = new URLSearchParams();

  if (params.title?.trim()) {
    searchParams.set("title", params.title.trim());
  }

  if (params.genre?.trim()) {
    searchParams.set("genre", params.genre.trim());
  }

  if (params.releaseYear?.trim()) {
    searchParams.set("releaseYear", params.releaseYear.trim());
  }

  const query = searchParams.toString();
  const url = query ? `/api/doramas/search?${query}` : "/api/doramas";

  const response = await fetch(url);
  return handleResponse<Dorama[]>(response);
}

export async function getMyFavorites(): Promise<Dorama[]> {
  const response = await fetch("/api/favorites/my", {
    headers: authHeaders(),
  });

  return handleResponse<Dorama[]>(response);
}

export async function addFavorite(doramaId: number): Promise<void> {
  const response = await fetch(`/api/favorites/${doramaId}`, {
    method: "POST",
    headers: authHeaders(),
  });

  return handleResponse<void>(response);
}

export async function removeFavorite(doramaId: number): Promise<void> {
  const response = await fetch(`/api/favorites/${doramaId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handleResponse<void>(response);
}

export async function getMyRecommendations(): Promise<Dorama[]> {
  const response = await fetch("/api/recommendations/my", {
    headers: authHeaders(),
  });

  return handleResponse<Dorama[]>(response);
}

export async function getMyHistory(): Promise<WatchHistoryItem[]> {
  const response = await fetch("/api/history/my", {
    headers: authHeaders(),
  });

  return handleResponse<WatchHistoryItem[]>(response);
}

export async function addHistoryRecord(
  doramaId: number,
  episode = 1,
  status: WatchStatus = "WATCHING"
): Promise<WatchHistoryItem> {
  const params = new URLSearchParams({
    doramaId: String(doramaId),
    episode: String(episode),
    status,
  });

  const response = await fetch(`/api/history/add?${params.toString()}`, {
    method: "POST",
    headers: authHeaders(),
  });

  return handleResponse<WatchHistoryItem>(response);
}

export async function addRating(doramaId: number, score: number): Promise<Rating> {
  const response = await fetch("/api/ratings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ doramaId, score }),
  });

  return handleResponse<Rating>(response);
}

export async function getDoramaReviews(doramaId: number): Promise<Review[]> {
  const response = await fetch(`/api/reviews/dorama/${doramaId}`);
  return handleResponse<Review[]>(response);
}

export async function addReview(doramaId: number, content: string): Promise<Review> {
  const params = new URLSearchParams({
    doramaId: String(doramaId),
    content,
  });

  const response = await fetch(`/api/reviews/add?${params.toString()}`, {
    method: "POST",
    headers: authHeaders(),
  });

  return handleResponse<Review>(response);
}
