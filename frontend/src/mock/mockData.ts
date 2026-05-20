import type {
  Actor,
  ActorInteractionStats,
  Country,
  Dorama,
  DoramaEpisode,
  DoramaSearchParams,
  Rating,
  Review,
  UserActorInteraction,
  WatchHistoryItem,
  WatchStatus,
} from "@/types/dorama";

const FAVORITE_DORAMAS_KEY = "doramadreams.mock.favoriteDoramaIds";
const FAVORITE_ACTORS_KEY = "doramadreams.mock.favoriteActorIds";
const HISTORY_KEY = "doramadreams.mock.history";
const REVIEWS_KEY = "doramadreams.mock.reviews";
const ACTOR_RATINGS_KEY = "doramadreams.mock.actorRatings";
const ACTOR_COMMENTS_KEY = "doramadreams.mock.actorComments";

const DEFAULT_FAVORITE_DORAMA_IDS = [1, 5, 8];
const DEFAULT_FAVORITE_ACTOR_IDS = [1, 5, 8];

export const MOCK_COUNTRIES: Country[] = [
  { countryId: 1, name: "Южная Корея", isoCode: "KR" },
  { countryId: 2, name: "Китай", isoCode: "CN" },
];

export const MOCK_ACTORS: Actor[] = [
  {
    actorId: 1,
    tmdbId: 125201,
    imdbId: null,
    fullName: "Ким Су Хён",
    originalName: "김수현",
    photoUrl: "https://placehold.co/420x580/f5d0fe/6d28d9?text=Kim+Soo+Hyun",
    birthDate: "1988-02-16",
    placeOfBirth: "Сеул, Южная Корея",
    knownForDepartment: "Acting",
    popularity: 92,
    biography: "Один из самых узнаваемых корейских актёров. В mock-режиме используется как пример карточки актёра.",
  },
  {
    actorId: 2,
    tmdbId: 1297019,
    imdbId: null,
    fullName: "Ким Джи Вон",
    originalName: "김지원",
    photoUrl: "https://placehold.co/420x580/e9d5ff/7c3aed?text=Kim+Ji+Won",
    birthDate: "1992-10-19",
    placeOfBirth: "Сеул, Южная Корея",
    knownForDepartment: "Acting",
    popularity: 87,
    biography: "Корейская актриса, часто появляющаяся в романтических и драматических историях.",
  },
  {
    actorId: 3,
    tmdbId: 125612,
    imdbId: null,
    fullName: "Сон Джун Ки",
    originalName: "송중기",
    photoUrl: "https://placehold.co/420x580/dbeafe/1d4ed8?text=Song+Joong+Ki",
    birthDate: "1985-09-19",
    placeOfBirth: "Тэджон, Южная Корея",
    knownForDepartment: "Acting",
    popularity: 85,
    biography: "Актёр для демонстрации страницы персоны, рейтингов и комментариев.",
  },
  {
    actorId: 4,
    tmdbId: 125199,
    imdbId: null,
    fullName: "Сон Хе Гё",
    originalName: "송혜교",
    photoUrl: "https://placehold.co/420x580/fce7f3/be185d?text=Song+Hye+Kyo",
    birthDate: "1981-11-22",
    placeOfBirth: "Тэгу, Южная Корея",
    knownForDepartment: "Acting",
    popularity: 84,
    biography: "Актриса, добавленная в mock-набор для связей с дорамами и фильтрами.",
  },
  {
    actorId: 5,
    tmdbId: 1989942,
    imdbId: null,
    fullName: "Чжао Лу Сы",
    originalName: "赵露思",
    photoUrl: "https://placehold.co/420x580/fee2e2/b91c1c?text=Zhao+Lusi",
    birthDate: "1998-11-09",
    placeOfBirth: "Чэнду, Китай",
    knownForDepartment: "Acting",
    popularity: 89,
    biography: "Китайская актриса, часто ассоциируемая с лёгкими романтическими историями.",
  },
  {
    actorId: 6,
    tmdbId: 2360159,
    imdbId: null,
    fullName: "Чэнь Чжэ Юань",
    originalName: "陈哲远",
    photoUrl: "https://placehold.co/420x580/cffafe/0891b2?text=Chen+Zheyuan",
    birthDate: "1996-10-29",
    placeOfBirth: "Шэньчжэнь, Китай",
    knownForDepartment: "Acting",
    popularity: 79,
    biography: "Актёр из mock-набора для китайских дорам и страницы актёра.",
  },
  {
    actorId: 7,
    tmdbId: 1972976,
    imdbId: null,
    fullName: "Шэнь Юэ",
    originalName: "沈月",
    photoUrl: "https://placehold.co/420x580/dcfce7/15803d?text=Shen+Yue",
    birthDate: "1997-02-27",
    placeOfBirth: "Хунань, Китай",
    knownForDepartment: "Acting",
    popularity: 76,
    biography: "Актриса для демонстрации китайских дорам, избранного и комментариев.",
  },
  {
    actorId: 8,
    tmdbId: 1371518,
    imdbId: null,
    fullName: "Мун Га Ён",
    originalName: "문가영",
    photoUrl: "https://placehold.co/420x580/fef3c7/a16207?text=Moon+Ga+Young",
    birthDate: "1996-07-10",
    placeOfBirth: "Карлсруэ, Германия",
    knownForDepartment: "Acting",
    popularity: 74,
    biography: "Актриса, связанная с романтическими комедиями в mock-каталоге.",
  },
];

const actor = (actorId: number) => MOCK_ACTORS.find((item) => item.actorId === actorId)!;

export const MOCK_DORAMAS: Dorama[] = [
  {
    doramaId: 1,
    title: "Королева слёз",
    originalTitle: "눈물의 여왕",
    description: "Наследница крупной корпорации и её муж переживают кризис брака, но неожиданно снова учатся быть рядом. Mock-описание нужно для работы интерфейса без базы данных.",
    releaseYear: 2024,
    duration: 70,
    countryId: 1,
    countryName: "Южная Корея",
    countryIsoCode: "KR",
    posterUrl: "https://placehold.co/420x620/f3e8ff/6d28d9?text=Queen+of+Tears",
    videoUrl: null,
    averageRating: 9.2,
    ratingsCount: 128,
    genres: ["Романтика", "Драма", "Комедия"],
    tags: ["брак", "богатые наследники", "второй шанс"],
    actors: [actor(1), actor(2)],
  },
  {
    doramaId: 2,
    title: "Игра в кальмара",
    originalTitle: "오징어 게임",
    description: "Люди с долгами принимают участие в опасной игре на выживание. Эта запись используется как мок при недоступной базе.",
    releaseYear: 2021,
    duration: 55,
    countryId: 1,
    countryName: "Южная Корея",
    countryIsoCode: "KR",
    posterUrl: "https://placehold.co/420x620/fee2e2/b91c1c?text=Squid+Game",
    videoUrl: null,
    averageRating: 8.7,
    ratingsCount: 210,
    genres: ["Триллер", "Драма", "Выживание"],
    tags: ["игры", "напряжение", "социальная драма"],
    actors: [],
  },
  {
    doramaId: 3,
    title: "Истинная красота",
    originalTitle: "여신강림",
    description: "Школьница меняет образ с помощью макияжа и пытается принять себя настоящую.",
    releaseYear: 2020,
    duration: 65,
    countryId: 1,
    countryName: "Южная Корея",
    countryIsoCode: "KR",
    posterUrl: "https://placehold.co/420x620/fce7f3/be185d?text=True+Beauty",
    videoUrl: null,
    averageRating: 8.5,
    ratingsCount: 98,
    genres: ["Романтика", "Комедия", "Школа"],
    tags: ["макияж", "самооценка", "любовный треугольник"],
    actors: [actor(8)],
  },
  {
    doramaId: 4,
    title: "Потомки солнца",
    originalTitle: "태양의 후예",
    description: "История любви врача и военного на фоне опасной гуманитарной миссии.",
    releaseYear: 2016,
    duration: 60,
    countryId: 1,
    countryName: "Южная Корея",
    countryIsoCode: "KR",
    posterUrl: "https://placehold.co/420x620/dbeafe/1d4ed8?text=Descendants+of+the+Sun",
    videoUrl: null,
    averageRating: 8.9,
    ratingsCount: 143,
    genres: ["Романтика", "Драма", "Медицина"],
    tags: ["военные", "врачи", "служба"],
    actors: [actor(3), actor(4)],
  },
  {
    doramaId: 5,
    title: "Скрытая любовь",
    originalTitle: "偷偷藏不住",
    description: "Тёплая китайская романтическая история о чувствах, которые взрослеют вместе с героями.",
    releaseYear: 2023,
    duration: 45,
    countryId: 2,
    countryName: "Китай",
    countryIsoCode: "CN",
    posterUrl: "https://placehold.co/420x620/fee2e2/b91c1c?text=Hidden+Love",
    videoUrl: null,
    averageRating: 9.0,
    ratingsCount: 116,
    genres: ["Романтика", "Комедия", "Молодёжная"],
    tags: ["первая любовь", "университет", "уютная атмосфера"],
    actors: [actor(5), actor(6)],
  },
  {
    doramaId: 6,
    title: "Когда я лечу к тебе",
    originalTitle: "当我飞奔向你",
    description: "Нежная школьная история о дружбе, взрослении и первых чувствах.",
    releaseYear: 2023,
    duration: 35,
    countryId: 2,
    countryName: "Китай",
    countryIsoCode: "CN",
    posterUrl: "https://placehold.co/420x620/dcfce7/15803d?text=When+I+Fly+Towards+You",
    videoUrl: null,
    averageRating: 8.6,
    ratingsCount: 87,
    genres: ["Романтика", "Школа", "Молодёжная"],
    tags: ["дружба", "первая любовь", "школа"],
    actors: [],
  },
  {
    doramaId: 7,
    title: "Метеоритный сад",
    originalTitle: "流星花园",
    description: "Студентка сталкивается с компанией популярных наследников и постепенно меняет их мир.",
    releaseYear: 2018,
    duration: 45,
    countryId: 2,
    countryName: "Китай",
    countryIsoCode: "CN",
    posterUrl: "https://placehold.co/420x620/cffafe/0891b2?text=Meteor+Garden",
    videoUrl: null,
    averageRating: 8.1,
    ratingsCount: 74,
    genres: ["Романтика", "Комедия", "Школа"],
    tags: ["богатые наследники", "дружба", "адаптация"],
    actors: [actor(7)],
  },
  {
    doramaId: 8,
    title: "Аварийная посадка любви",
    originalTitle: "사랑의 불시착",
    description: "Южнокорейская наследница случайно оказывается в Северной Корее и встречает офицера, который помогает ей вернуться домой.",
    releaseYear: 2019,
    duration: 75,
    countryId: 1,
    countryName: "Южная Корея",
    countryIsoCode: "KR",
    posterUrl: "https://placehold.co/420x620/e9d5ff/7c3aed?text=Crash+Landing+on+You",
    videoUrl: null,
    averageRating: 9.1,
    ratingsCount: 154,
    genres: ["Романтика", "Драма", "Комедия"],
    tags: ["запретная любовь", "судьба", "семья"],
    actors: [],
  },
  {
    doramaId: 9,
    title: "Лёгкая улыбка покоряет мир",
    originalTitle: "微微一笑很倾城",
    description: "Любовь начинается в онлайн-игре и постепенно переходит в реальную жизнь.",
    releaseYear: 2016,
    duration: 45,
    countryId: 2,
    countryName: "Китай",
    countryIsoCode: "CN",
    posterUrl: "https://placehold.co/420x620/fef3c7/a16207?text=Love+O2O",
    videoUrl: null,
    averageRating: 8.3,
    ratingsCount: 69,
    genres: ["Романтика", "Комедия", "Игры"],
    tags: ["онлайн-игры", "университет", "лёгкая история"],
    actors: [],
  },
  {
    doramaId: 10,
    title: "Силачка До Бон Сун",
    originalTitle: "힘쎈여자 도봉순",
    description: "Девушка с невероятной силой становится телохранителем и расследует опасное дело.",
    releaseYear: 2017,
    duration: 65,
    countryId: 1,
    countryName: "Южная Корея",
    countryIsoCode: "KR",
    posterUrl: "https://placehold.co/420x620/f5d0fe/86198f?text=Strong+Woman",
    videoUrl: null,
    averageRating: 8.8,
    ratingsCount: 132,
    genres: ["Романтика", "Комедия", "Фэнтези"],
    tags: ["суперсила", "детектив", "милый роман"],
    actors: [],
  },
  {
    doramaId: 11,
    title: "Мой демон",
    originalTitle: "마이 데몬",
    description: "Наследница и демон заключают опасный договор, который неожиданно становится началом романтики.",
    releaseYear: 2023,
    duration: 65,
    countryId: 1,
    countryName: "Южная Корея",
    countryIsoCode: "KR",
    posterUrl: "https://placehold.co/420x620/ecfeff/0e7490?text=My+Demon",
    videoUrl: null,
    averageRating: 8.4,
    ratingsCount: 91,
    genres: ["Романтика", "Фэнтези", "Комедия"],
    tags: ["демон", "контракт", "сверхъестественное"],
    actors: [],
  },
  {
    doramaId: 12,
    title: "Любовь между феей и дьяволом",
    originalTitle: "苍兰诀",
    description: "Фэнтези-история о нежной фее и могущественном повелителе, чьи судьбы неожиданно переплетаются.",
    releaseYear: 2022,
    duration: 45,
    countryId: 2,
    countryName: "Китай",
    countryIsoCode: "CN",
    posterUrl: "https://placehold.co/420x620/fae8ff/a21caf?text=Love+Between+Fairy+and+Devil",
    videoUrl: null,
    averageRating: 8.7,
    ratingsCount: 105,
    genres: ["Романтика", "Фэнтези", "Историческая"],
    tags: ["сянься", "магия", "противоположности"],
    actors: [],
  },
];

export const MOCK_FALLBACK_VIDEO_URL = "https://www.youtube.com/embed/ysz5S6PUM-U";
const DEFAULT_MOCK_EPISODE_COUNT = 4;

export const MOCK_DORAMA_EPISODES: Record<number, DoramaEpisode[]> = Object.fromEntries(
  MOCK_DORAMAS.map((dorama) => [
    dorama.doramaId,
    Array.from({ length: 4 }, (_, index) => {
      const episodeNumber = index + 1;
      return {
        episodeId: dorama.doramaId * 100 + episodeNumber,
        doramaId: dorama.doramaId,
        doramaTitle: dorama.title,
        episodeNumber,
        title: `Мок-серия ${episodeNumber}`,
        videoUrl: MOCK_FALLBACK_VIDEO_URL,
        createdAt: "2026-01-01T10:00:00Z",
        updatedAt: "2026-01-01T10:00:00Z",
      } satisfies DoramaEpisode;
    }),
  ])
);

const DEFAULT_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      reviewId: 101,
      userId: 1,
      username: "demo_user",
      content: "Очень уютная дорама для демонстрации карточки отзывов.",
      createdAt: "2026-01-03T12:00:00Z",
    },
  ],
  5: [
    {
      reviewId: 501,
      userId: 2,
      username: "mock_viewer",
      content: "Хороший пример китайской романтики в fallback-режиме.",
      createdAt: "2026-01-04T15:30:00Z",
    },
  ],
};

const DEFAULT_ACTOR_COMMENTS: Record<number, UserActorInteraction[]> = {
  1: [
    {
      interactionId: 1001,
      userId: 1,
      username: "demo_user",
      actorId: 1,
      actorName: "Ким Су Хён",
      interactionType: "COMMENT",
      rating: null,
      commentText: "Mock-комментарий для страницы актёра.",
      createdAt: "2026-01-05T12:00:00Z",
      updatedAt: "2026-01-05T12:00:00Z",
    },
  ],
};

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage может быть недоступен в приватном режиме — для mock-данных это не критично.
  }
}

function normalize(value: string | number | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function cloneDorama(dorama: Dorama): Dorama {
  return {
    ...dorama,
    genres: [...(dorama.genres ?? [])],
    tags: [...(dorama.tags ?? [])],
    actors: dorama.actors?.map((item) => ({ ...item })) ?? [],
  };
}

function cloneActor(item: Actor): Actor {
  return { ...item };
}

export function getMockAllDoramas(): Dorama[] {
  return MOCK_DORAMAS.map(cloneDorama);
}

export function getMockDoramaById(doramaId: number): Dorama {
  const dorama = MOCK_DORAMAS.find((item) => item.doramaId === doramaId);

  if (!dorama) {
    throw new Error("Дорама не найдена в mock-данных");
  }

  return cloneDorama(dorama);
}

export function getMockTopRatedDoramas(limit = 6): Dorama[] {
  return getMockAllDoramas()
    .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0))
    .slice(0, limit);
}

export function searchMockDoramas(params: DoramaSearchParams): Dorama[] {
  return getMockAllDoramas().filter((dorama) => {
    const title = normalize(params.title);
    const genre = normalize(params.genre);
    const tag = normalize(params.tag);
    const country = normalize(params.country);
    const releaseYear = normalize(params.releaseYear);

    if (title && !normalize(`${dorama.title} ${dorama.originalTitle}`).includes(title)) {
      return false;
    }

    if (genre && !dorama.genres?.some((item) => normalize(item).includes(genre))) {
      return false;
    }

    if (tag && !dorama.tags?.some((item) => normalize(item).includes(tag))) {
      return false;
    }

    if (
      country &&
      !normalize(`${dorama.countryName} ${dorama.countryIsoCode}`).includes(country)
    ) {
      return false;
    }

    if (releaseYear && String(dorama.releaseYear ?? "") !== releaseYear) {
      return false;
    }

    return true;
  });
}

export function getMockCountries(): Country[] {
  return MOCK_COUNTRIES.map((item) => ({ ...item }));
}

export function getMockTags(): { tagId: number; name: string }[] {
  const tagNames = Array.from(new Set(MOCK_DORAMAS.flatMap((dorama) => dorama.tags ?? []))).sort((a, b) => a.localeCompare(b, "ru"));
  return tagNames.map((name, index) => ({ tagId: index + 1, name }));
}

export function getMockFavorites(): Dorama[] {
  const favoriteIds = safeRead<number[]>(FAVORITE_DORAMAS_KEY, DEFAULT_FAVORITE_DORAMA_IDS);
  return getMockAllDoramas().filter((dorama) => favoriteIds.includes(dorama.doramaId));
}

export function addMockFavorite(doramaId: number): void {
  const favoriteIds = safeRead<number[]>(FAVORITE_DORAMAS_KEY, DEFAULT_FAVORITE_DORAMA_IDS);
  safeWrite(FAVORITE_DORAMAS_KEY, Array.from(new Set([...favoriteIds, doramaId])));
}

export function removeMockFavorite(doramaId: number): void {
  const favoriteIds = safeRead<number[]>(FAVORITE_DORAMAS_KEY, DEFAULT_FAVORITE_DORAMA_IDS);
  safeWrite(FAVORITE_DORAMAS_KEY, favoriteIds.filter((item) => item !== doramaId));
}

export function getMockRecommendations(): Dorama[] {
  return getMockTopRatedDoramas(8);
}

export function getMockHistory(): WatchHistoryItem[] {
  return safeRead<WatchHistoryItem[]>(HISTORY_KEY, [
    {
      userId: 1,
      doramaId: 1,
      doramaTitle: "Королева слёз",
      lastEpisode: 3,
      status: "WATCHING",
      updatedAt: "2026-01-06T10:00:00Z",
    },
    {
      userId: 1,
      doramaId: 5,
      doramaTitle: "Скрытая любовь",
      lastEpisode: 24,
      status: "COMPLETED",
      updatedAt: "2026-01-07T10:00:00Z",
    },
    {
      userId: 1,
      doramaId: 12,
      doramaTitle: "Любовь между феей и дьяволом",
      lastEpisode: 1,
      status: "PLANNED",
      updatedAt: "2026-01-08T10:00:00Z",
    },
  ]);
}

export function addMockHistoryRecord(
  doramaId: number,
  episode = 1,
  status: WatchStatus = "WATCHING"
): WatchHistoryItem {
  const dorama = getMockDoramaById(doramaId);
  const history = getMockHistory();
  const item: WatchHistoryItem = {
    userId: 1,
    doramaId,
    doramaTitle: dorama.title,
    lastEpisode: episode,
    status,
    updatedAt: new Date().toISOString(),
  };

  safeWrite(HISTORY_KEY, [item, ...history.filter((record) => record.doramaId !== doramaId)]);
  return item;
}

export function deleteMockHistoryRecord(doramaId: number): void {
  safeWrite(HISTORY_KEY, getMockHistory().filter((item) => item.doramaId !== doramaId));
}

export function createMockRating(doramaId: number, score: number): Rating {
  const dorama = getMockDoramaById(doramaId);
  return {
    ratingId: Date.now(),
    userId: 1,
    username: "demo_user",
    doramaId,
    doramaTitle: dorama.title,
    score,
  };
}

export function getMockReviews(doramaId: number): Review[] {
  const reviews = safeRead<Record<number, Review[]>>(REVIEWS_KEY, DEFAULT_REVIEWS);
  return [...(reviews[doramaId] ?? [])];
}

export function addMockReview(doramaId: number, content: string): Review {
  const reviews = safeRead<Record<number, Review[]>>(REVIEWS_KEY, DEFAULT_REVIEWS);
  const review: Review = {
    reviewId: Date.now(),
    userId: 1,
    username: "demo_user",
    content,
    createdAt: new Date().toISOString(),
  };

  safeWrite(REVIEWS_KEY, {
    ...reviews,
    [doramaId]: [review, ...(reviews[doramaId] ?? []).filter((item) => item.userId !== review.userId)],
  });

  return review;
}

export function deleteMockReview(reviewId: number): void {
  const reviews = safeRead<Record<number, Review[]>>(REVIEWS_KEY, DEFAULT_REVIEWS);
  const updated = Object.fromEntries(
    Object.entries(reviews).map(([doramaId, items]) => [
      doramaId,
      items.filter((item) => item.reviewId !== reviewId),
    ])
  );
  safeWrite(REVIEWS_KEY, updated);
}

function isBlankText(value: string | null | undefined) {
  return !value || value.trim().length === 0;
}

function cloneEpisode(episode: DoramaEpisode): DoramaEpisode {
  return { ...episode };
}

function createGeneratedMockEpisode(
  doramaId: number,
  episodeNumber: number,
  doramaTitle?: string | null
): DoramaEpisode {
  const safeTitle = doramaTitle?.trim() || `Дорама #${doramaId}`;

  return {
    episodeId: Number(`${doramaId}${String(episodeNumber).padStart(3, "0")}`),
    doramaId,
    doramaTitle: safeTitle,
    episodeNumber,
    title: `Мок-серия ${episodeNumber}`,
    videoUrl: MOCK_FALLBACK_VIDEO_URL,
    createdAt: "2026-01-01T10:00:00Z",
    updatedAt: "2026-01-01T10:00:00Z",
  };
}

export function getMockEpisodes(doramaId: number, doramaTitle?: string | null): DoramaEpisode[] {
  const predefinedEpisodes = MOCK_DORAMA_EPISODES[doramaId];

  if (predefinedEpisodes?.length) {
    return predefinedEpisodes.map(cloneEpisode);
  }

  return Array.from({ length: DEFAULT_MOCK_EPISODE_COUNT }, (_, index) =>
    createGeneratedMockEpisode(doramaId, index + 1, doramaTitle)
  );
}

export function withMockVideoForEpisodes(
  episodes: DoramaEpisode[],
  doramaId: number,
  doramaTitle?: string | null
): DoramaEpisode[] {
  if (episodes.length === 0) {
    return getMockEpisodes(doramaId, doramaTitle);
  }

  return episodes.map((episode) => {
    if (!isBlankText(episode.videoUrl)) {
      return cloneEpisode(episode);
    }

    const generatedEpisode = createGeneratedMockEpisode(
      doramaId,
      episode.episodeNumber,
      doramaTitle ?? episode.doramaTitle
    );

    return {
      ...episode,
      title: episode.title ?? generatedEpisode.title,
      videoUrl: generatedEpisode.videoUrl,
    };
  });
}

export function getMockActors(): Actor[] {
  return MOCK_ACTORS.map(cloneActor);
}

export function getMockActorById(actorId: number): Actor {
  const item = MOCK_ACTORS.find((actor) => actor.actorId === actorId);

  if (!item) {
    throw new Error("Актёр не найден в mock-данных");
  }

  return cloneActor(item);
}

export function getMockDoramasByActor(actorId: number): Dorama[] {
  return getMockAllDoramas().filter((dorama) => dorama.actors?.some((item) => item.actorId === actorId));
}

export function getMockFavoriteActors(): Actor[] {
  const favoriteIds = safeRead<number[]>(FAVORITE_ACTORS_KEY, DEFAULT_FAVORITE_ACTOR_IDS);
  return getMockActors().filter((item) => favoriteIds.includes(item.actorId));
}

export function addMockFavoriteActor(actorId: number): void {
  const favoriteIds = safeRead<number[]>(FAVORITE_ACTORS_KEY, DEFAULT_FAVORITE_ACTOR_IDS);
  safeWrite(FAVORITE_ACTORS_KEY, Array.from(new Set([...favoriteIds, actorId])));
}

export function removeMockFavoriteActor(actorId: number): void {
  const favoriteIds = safeRead<number[]>(FAVORITE_ACTORS_KEY, DEFAULT_FAVORITE_ACTOR_IDS);
  safeWrite(FAVORITE_ACTORS_KEY, favoriteIds.filter((item) => item !== actorId));
}

export function getMockActorStats(actorId: number): ActorInteractionStats {
  const favoriteIds = safeRead<number[]>(FAVORITE_ACTORS_KEY, DEFAULT_FAVORITE_ACTOR_IDS);
  const commentsCount = getMockActorComments(actorId).length;
  const ratings = safeRead<Record<number, number>>(ACTOR_RATINGS_KEY, {});
  const ownRating = ratings[actorId] ?? null;

  return {
    favoritesCount: favoriteIds.includes(actorId) ? 1 : 0,
    ratingsCount: ownRating == null ? 5 : 6,
    averageRating: ownRating == null ? 8.7 : Number(((8.7 * 5 + ownRating) / 6).toFixed(1)),
    commentsCount,
    viewsCount: 42 + actorId,
  };
}

export function getMockActorComments(actorId: number): UserActorInteraction[] {
  const comments = safeRead<Record<number, UserActorInteraction[]>>(ACTOR_COMMENTS_KEY, DEFAULT_ACTOR_COMMENTS);
  return [...(comments[actorId] ?? [])];
}

export function getMockActorRating(actorId: number): number | null {
  const ratings = safeRead<Record<number, number>>(ACTOR_RATINGS_KEY, {});
  return ratings[actorId] ?? null;
}

export function rateMockActor(actorId: number, rating: number): UserActorInteraction {
  const actor = getMockActorById(actorId);
  const ratings = safeRead<Record<number, number>>(ACTOR_RATINGS_KEY, {});
  safeWrite(ACTOR_RATINGS_KEY, { ...ratings, [actorId]: rating });

  return {
    interactionId: Date.now(),
    userId: 1,
    username: "demo_user",
    actorId,
    actorName: actor.fullName,
    interactionType: "RATING",
    rating,
    commentText: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function addMockActorComment(actorId: number, commentText: string): UserActorInteraction {
  const actor = getMockActorById(actorId);
  const comments = safeRead<Record<number, UserActorInteraction[]>>(ACTOR_COMMENTS_KEY, DEFAULT_ACTOR_COMMENTS);
  const comment: UserActorInteraction = {
    interactionId: Date.now(),
    userId: 1,
    username: "demo_user",
    actorId,
    actorName: actor.fullName,
    interactionType: "COMMENT",
    rating: null,
    commentText,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  safeWrite(ACTOR_COMMENTS_KEY, {
    ...comments,
    [actorId]: [comment, ...(comments[actorId] ?? [])],
  });

  return comment;
}

export function deleteMockActorComment(interactionId: number): void {
  const comments = safeRead<Record<number, UserActorInteraction[]>>(ACTOR_COMMENTS_KEY, DEFAULT_ACTOR_COMMENTS);
  const updated = Object.fromEntries(
    Object.entries(comments).map(([actorId, items]) => [
      actorId,
      items.filter((item) => item.interactionId !== interactionId),
    ])
  );
  safeWrite(ACTOR_COMMENTS_KEY, updated);
}
