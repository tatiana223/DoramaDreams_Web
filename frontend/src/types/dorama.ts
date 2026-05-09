export type Dorama = {
  doramaId: number;
  title: string;
  originalTitle: string | null;
  description: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  videoUrl?: string | null;
  averageRating: number | null;
  genres: string[];
};

export type DoramaSearchParams = {
  title?: string;
  genre?: string;
  releaseYear?: string;
};

export type Rating = {
  ratingId: number;
  userId: number;
  username: string;
  doramaId: number;
  doramaTitle: string;
  score: number;
};

export type Review = {
  reviewId: number;
  username: string;
  content: string;
  createdAt: string;
};

export type WatchStatus = "PLANNED" | "WATCHING" | "COMPLETED" | "DROPPED";

export type WatchHistoryItem = {
  userId: number;
  doramaId: number;
  doramaTitle: string;
  lastEpisode: number;
  status: WatchStatus;
  updatedAt: string;
};
