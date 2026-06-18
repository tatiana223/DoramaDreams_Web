export type Dorama = {
  doramaId: number;
  title: string;
  originalTitle: string | null;
  description: string | null;
  releaseYear: number | null;
  duration?: number | null;
  countryId?: number | null;
  countryName?: string | null;
  countryIsoCode?: string | null;
  posterUrl: string | null;
  videoUrl?: string | null;
  averageRating: number | null;
  ratingsCount?: number;
  genres: string[];
  tags?: string[];
  actors?: Actor[];
  recommendationSource?: "ML_SCORE" | "FALLBACK" | "COLD_START" | string | null;
  recommendationReason?: string | null;
  recommendationScore?: number | null;
  recommendationModelVersion?: string | null;
};

export type Actor = {
  actorId: number;
  tmdbId?: number | null;
  imdbId?: string | null;
  fullName: string;
  originalName?: string | null;
  photoUrl: string | null;
  birthDate?: string | null;
  placeOfBirth?: string | null;
  knownForDepartment?: string | null;
  popularity?: number | null;
  biography: string | null;
};


export type ActorInteractionType = "FAVORITE" | "RATING" | "COMMENT" | "VIEW";

export type UserActorInteraction = {
  interactionId: number;
  userId: number;
  username: string;
  actorId: number;
  actorName: string;
  interactionType: ActorInteractionType;
  rating: number | null;
  commentText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActorInteractionStats = {
  favoritesCount: number;
  ratingsCount: number;
  averageRating: number | null;
  commentsCount: number;
  viewsCount: number;
};

export type Tag = {
  tagId: number;
  name: string;
};

export type Country = {
  countryId: number;
  name: string;
  isoCode: string | null;
};

export type DoramaSearchParams = {
  title?: string;
  genre?: string;
  tag?: string;
  country?: string;
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
  userId: number;
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

export type DoramaEpisode = {
  episodeId: number;
  doramaId: number;
  doramaTitle: string;
  episodeNumber: number;
  title: string | null;
  videoUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminDoramaEpisodeRequest = {
  doramaId: number;
  episodeNumber: number;
  title?: string | null;
  videoUrl: string;
};

export type AdminDoramaEpisodeBulkItem = {
  episodeNumber?: number | null;
  title?: string | null;
  videoUrl: string;
};

export type AdminDoramaEpisodeBulkRequest = {
  doramaId: number;
  startEpisodeNumber?: number | null;
  overwriteExisting?: boolean;
  rawText?: string | null;
  episodes?: AdminDoramaEpisodeBulkItem[];
};

export type AdminDoramaEpisodeBulkResult = {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  failedCount: number;
  episodes: DoramaEpisode[];
  skipped: string[];
  errors: string[];
};
