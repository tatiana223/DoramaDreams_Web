export type Dorama = {
  doramaId: number;
  title: string;
  originalTitle: string | null;
  description: string | null;
  releaseYear: number | null;
  posterUrl: string | null;
  videoUrl?: string | null;
  averageRating: number | null;
  ratingsCount?: number;
  genres: string[];
  tags?: string[];
  actors?: Actor[];
};

export type Actor = {
  actorId: number;
  fullName: string;
  photoUrl: string | null;
  biography: string | null;
};

export type Tag = {
  tagId: number;
  name: string;
};

export type DoramaSearchParams = {
  title?: string;
  genre?: string;
  tag?: string;
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
