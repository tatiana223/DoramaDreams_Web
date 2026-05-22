import { authHeaders, handleResponse } from "@/api/http";
import {
  addMockActorComment,
  addMockFavoriteActor,
  deleteMockActorComment,
  getMockActorById,
  getMockActorComments,
  getMockActorRating,
  getMockActorStats,
  getMockActors,
  getMockDoramasByActor,
  getMockFavoriteActors,
  rateMockActor,
  removeMockFavoriteActor,
} from "@/mock/mockData";
import type { Actor, ActorInteractionStats, Dorama, UserActorInteraction } from "@/types/dorama";

async function withMockFallback<T>(request: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await request();
  } catch {
    return fallback();
  }
}

export async function getActors(): Promise<Actor[]> {
  return withMockFallback(
    async () => {
      const response = await fetch("/api/actors");
      return handleResponse<Actor[]>(response);
    },
    getMockActors
  );
}

export async function getActorById(actorId: number): Promise<Actor> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actors/${actorId}`);
      return handleResponse<Actor>(response);
    },
    () => getMockActorById(actorId)
  );
}

export async function getDoramasByActor(actorId: number): Promise<Dorama[]> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actors/${actorId}/doramas`);
      return handleResponse<Dorama[]>(response);
    },
    () => getMockDoramasByActor(actorId)
  );
}

export async function getMyFavoriteActors(): Promise<Actor[]> {
  return withMockFallback(
    async () => {
      const response = await fetch("/api/actor-favorites/my", {
        headers: authHeaders(),
      });

      return handleResponse<Actor[]>(response);
    },
    getMockFavoriteActors
  );
}

export async function addFavoriteActor(actorId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-favorites/${actorId}`, {
        method: "POST",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => addMockFavoriteActor(actorId)
  );
}

export async function removeFavoriteActor(actorId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-favorites/${actorId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => removeMockFavoriteActor(actorId)
  );
}

export async function getActorInteractionStats(actorId: number): Promise<ActorInteractionStats> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-interactions/actors/${actorId}/stats`);
      return handleResponse<ActorInteractionStats>(response);
    },
    () => getMockActorStats(actorId)
  );
}

export async function getActorComments(actorId: number): Promise<UserActorInteraction[]> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-interactions/actors/${actorId}/comments`);
      return handleResponse<UserActorInteraction[]>(response);
    },
    () => getMockActorComments(actorId)
  );
}

export async function getMyActorRating(actorId: number): Promise<number | null> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-interactions/actors/${actorId}/rating/my`, {
        headers: authHeaders(),
      });

      if (response.status === 204) {
        return null;
      }

      return handleResponse<number>(response);
    },
    () => getMockActorRating(actorId)
  );
}

export async function rateActor(actorId: number, rating: number): Promise<UserActorInteraction> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-interactions/actors/${actorId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ rating }),
      });

      return handleResponse<UserActorInteraction>(response);
    },
    () => rateMockActor(actorId, rating)
  );
}

export async function addActorComment(actorId: number, commentText: string): Promise<UserActorInteraction> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-interactions/actors/${actorId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ commentText }),
      });

      return handleResponse<UserActorInteraction>(response);
    },
    () => addMockActorComment(actorId, commentText)
  );
}

export async function deleteActorComment(interactionId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-interactions/comments/${interactionId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => deleteMockActorComment(interactionId)
  );
}

export async function recordActorView(actorId: number): Promise<void> {
  return withMockFallback(
    async () => {
      const response = await fetch(`/api/actor-interactions/actors/${actorId}/view`, {
        method: "POST",
        headers: authHeaders(),
      });

      return handleResponse<void>(response);
    },
    () => undefined
  );
}
