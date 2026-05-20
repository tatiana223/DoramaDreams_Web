export type AdminDashboard = {
  usersCount: number;
  doramasCount: number;
  ratingsCount: number;
  favoritesCount: number;
  watchHistoryCount: number;
  reviewsCount: number;
  userRecommendationsCount: number;
  usersWithRecommendationsCount: number;
  currentModelVersion: string | null;
  recommendationsUpdatedAt: string | null;
};

export type RecommendationImportResponse = {
  importedRows: number;
  modelVersion: string;
  importedAt: string;
};

export type AdminDoramaPayload = {
  title: string;
  originalTitle?: string | null;
  description?: string | null;
  releaseYear?: number | null;
  duration?: number | null;
  countryId?: number | null;
  countryName?: string | null;
  countryIsoCode?: string | null;
  posterUrl?: string | null;
  videoUrl?: string | null;
  genres?: string[];
  tags?: string[];
};
