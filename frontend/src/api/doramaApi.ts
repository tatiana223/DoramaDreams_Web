import { authHeaders, handleResponse } from "@/api/http";
import {
  addMockFavorite,
  addMockHistoryRecord,
  addMockReview,
  createMockRating,
  deleteMockHistoryRecord,
  deleteMockReview,
  getMockAllDoramas,
  getMockCountries,
  getMockDoramaById,
  getMockEpisodes,
  getMockFavorites,
  getMockHistory,
  getMockRecommendations,
  getMockReviews,
  getMockTags,
  getMockTopRatedDoramas,
  removeMockFavorite,
  searchMockDoramas,
  withMockVideoForEpisodes,
} from "@/mock/mockData";
import type {
  Country,
  Dorama,
  DoramaEpisode,
  DoramaSearchParams,
  Rating,
  Review,
  WatchHistoryItem,
  WatchStatus,
} from "@/types/dorama";

async function withMockFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback();
  }
}

async function withArrayMockFallback<T>(request: () => Promise<T[]>, fallback: () => T[]): Promise<T[]> {
  try {
    const data = await request();
    return data.length > 0 ? data : fallback();
  } catch {
    return fallback();
  }
}

export async function getAllDoramas(): Promise<Dorama[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch("/api/doramas");
      return handleResponse<Dorama[]>(response);
    },
    getMockAllDoramas
  );
}

export async function getDoramaById(id: number): Promise<Dorama> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/doramas/${id}`);
      return handleResponse<Dorama>(response);
    },
    () => getMockDoramaById(id)
  );
}

export async function getTopRatedDoramas(limit = 6): Promise<Dorama[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch(`/api/doramas/top-rated?limit=${limit}`);
      return handleResponse<Dorama[]>(response);
    },
    () => getMockTopRatedDoramas(limit)
  );
}

export async function searchDoramas(params: DoramaSearchParams): Promise<Dorama[]> {
  const searchParams = new URLSearchParams();

  if (params.title?.trim()) {
    searchParams.set("title", params.title.trim());
  }

  if (params.genre?.trim()) {
    searchParams.set("genre", params.genre.trim());
  }

  if (params.tag?.trim()) {
    searchParams.set("tag", params.tag.trim());
  }

  if (params.country?.trim()) {
    searchParams.set("country", params.country.trim());
  }

  if (params.releaseYear?.trim()) {
    searchParams.set("releaseYear", params.releaseYear.trim());
  }

  const query = searchParams.toString();
  const url = query ? `/api/doramas/search?${query}` : "/api/doramas";

  return withArrayMockFallback(
    async () => {
      const response = await fetch(url);
      return handleResponse<Dorama[]>(response);
    },
    () => searchMockDoramas(params)
  );
}

export async function getMyFavorites(): Promise<Dorama[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch("/api/favorites/my", {
        headers: authHeaders(),
      });

      return handleResponse<Dorama[]>(response);
    },
    getMockFavorites
  );
}

export async function addFavorite(doramaId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/favorites/${doramaId}`, {
        method: "POST",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => addMockFavorite(doramaId)
  );
}

export async function removeFavorite(doramaId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/favorites/${doramaId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => removeMockFavorite(doramaId)
  );
}

export async function getMyRecommendations(): Promise<Dorama[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch("/api/recommendations/my", {
        headers: authHeaders(),
      });

      return handleResponse<Dorama[]>(response);
    },
    getMockRecommendations
  );
}

export async function getMyHistory(): Promise<WatchHistoryItem[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch("/api/history/my", {
        headers: authHeaders(),
      });

      return handleResponse<WatchHistoryItem[]>(response);
    },
    getMockHistory
  );
}

export async function deleteHistoryRecord(doramaId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/history/my/dorama/${doramaId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => deleteMockHistoryRecord(doramaId)
  );
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

  return withMockFallback(
    async () => {
      const response = await fetch(`/api/history/add?${params.toString()}`, {
        method: "POST",
        headers: authHeaders(),
      });

      return handleResponse<WatchHistoryItem>(response);
    },
    () => addMockHistoryRecord(doramaId, episode, status)
  );
}

export async function addRating(doramaId: number, score: number): Promise<Rating> {
  return withMockFallback(
    async () => {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ doramaId, score }),
      });

      return handleResponse<Rating>(response);
    },
    () => createMockRating(doramaId, score)
  );
}

export async function getDoramaReviews(doramaId: number): Promise<Review[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch(`/api/reviews/dorama/${doramaId}`);
      return handleResponse<Review[]>(response);
    },
    () => getMockReviews(doramaId)
  );
}

export async function addReview(doramaId: number, content: string): Promise<Review> {
  const params = new URLSearchParams({
    doramaId: String(doramaId),
    content,
  });

  return withMockFallback(
    async () => {
      const response = await fetch(`/api/reviews/add?${params.toString()}`, {
        method: "POST",
        headers: authHeaders(),
      });

      return handleResponse<Review>(response);
    },
    () => addMockReview(doramaId, content)
  );
}

export async function deleteReview(reviewId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => deleteMockReview(reviewId)
  );
}

export async function getTags(): Promise<{ tagId: number; name: string }[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch("/api/tags");
      return handleResponse<{ tagId: number; name: string }[]>(response);
    },
    getMockTags
  );
}

type DoramaEpisodeFallbackOptions = {
  withMockVideoFallback?: boolean;
  doramaTitle?: string | null;
};

export async function getDoramaEpisodes(
  doramaId: number,
  options: DoramaEpisodeFallbackOptions = {}
): Promise<DoramaEpisode[]> {
  const withMockVideoFallback = options.withMockVideoFallback ?? false;

  try {
    const response = await fetch(`/api/doramas/${doramaId}/episodes`, {
      headers: authHeaders(),
    });

    const episodes = await handleResponse<DoramaEpisode[]>(response);

    return withMockVideoFallback
      ? withMockVideoForEpisodes(episodes, doramaId, options.doramaTitle)
      : episodes;
  } catch (error) {
    if (withMockVideoFallback) {
      return getMockEpisodes(doramaId, options.doramaTitle);
    }

    throw error;
  }
}

export async function getCountries(): Promise<Country[]> {
  return withArrayMockFallback(
    async () => {
      const response = await fetch("/api/countries");
      return handleResponse<Country[]>(response);
    },
    getMockCountries
  );
}
