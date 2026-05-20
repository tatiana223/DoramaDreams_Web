package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.model.*;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.FavoriteRepository;
import ru.bmstu.iu5.doramadreams.repository.RatingRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRecommendationRepository;
import ru.bmstu.iu5.doramadreams.repository.WatchHistoryRepository;

import java.util.*;
import java.util.function.Function;

@Service
public class RecommendationService {

    private static final int DEFAULT_LIMIT = 20;
    private static final int OFFLINE_LOOKAHEAD_LIMIT = 200;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private DoramaRepository doramaRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private WatchHistoryRepository watchHistoryRepository;

    @Autowired
    private DoramaDtoService doramaDtoService;

    @Autowired
    private UserRecommendationRepository userRecommendationRepository;

    /**
     * Главная логика рекомендаций:
     * 1. Для пользователей, которые были в offline ML-обучении, сначала используем готовый ML-score.
     * 2. Если ML-рекомендаций нет или их не хватает после исключения уже выбранных дорам,
     *    достраиваем выдачу online fallback'ом по текущим действиям пользователя.
     * 3. Для совсем новых пользователей без действий отдаём cold-start рекомендации по общей популярности.
     */
    @Transactional(readOnly = true)
    public List<DoramaDto> getPersonalRecommendations(Long userId) {
        List<Favorite> favorites = favoriteRepository.findByUser_UserId(userId);
        List<Rating> ratings = ratingRepository.findByUser_UserId(userId);
        List<WatchHistory> watchHistory = watchHistoryRepository.findByUser_UserIdOrderByUpdatedAtDesc(userId);

        Set<Long> excludedIds = buildExcludedDoramaIds(favorites, ratings, watchHistory);
        LinkedHashMap<Long, Dorama> result = new LinkedHashMap<>();

        addRecommendations(
                result,
                getOfflineMlRecommendations(userId, excludedIds, DEFAULT_LIMIT),
                DEFAULT_LIMIT
        );

        if (result.size() < DEFAULT_LIMIT) {
            Set<Long> excludedForFallback = new HashSet<>(excludedIds);
            excludedForFallback.addAll(result.keySet());

            addRecommendations(
                    result,
                    getOnlineContentFallback(
                            favorites,
                            ratings,
                            watchHistory,
                            excludedForFallback,
                            DEFAULT_LIMIT - result.size()
                    ),
                    DEFAULT_LIMIT
            );
        }

        if (result.size() < DEFAULT_LIMIT) {
            Set<Long> excludedForColdStart = new HashSet<>(excludedIds);
            excludedForColdStart.addAll(result.keySet());

            addRecommendations(
                    result,
                    getColdStartRecommendations(excludedForColdStart, DEFAULT_LIMIT - result.size()),
                    DEFAULT_LIMIT
            );
        }

        return doramaDtoService.toDtoList(new ArrayList<>(result.values()));
    }

    private void addRecommendations(
            LinkedHashMap<Long, Dorama> result,
            List<Dorama> candidates,
            int limit
    ) {
        for (Dorama dorama : candidates) {
            if (dorama == null || dorama.getDoramaId() == null) {
                continue;
            }

            result.putIfAbsent(dorama.getDoramaId(), dorama);

            if (result.size() >= limit) {
                break;
            }
        }
    }

    private Set<Long> buildExcludedDoramaIds(
            List<Favorite> favorites,
            List<Rating> ratings,
            List<WatchHistory> watchHistory
    ) {
        Set<Long> excludedIds = new HashSet<>();

        favorites.forEach(favorite -> {
            if (favorite.getDorama() != null) {
                excludedIds.add(favorite.getDorama().getDoramaId());
            }
        });

        ratings.forEach(rating -> {
            if (rating.getDorama() != null) {
                excludedIds.add(rating.getDorama().getDoramaId());
            }
        });

        watchHistory.forEach(history -> {
            if (history.getDorama() != null) {
                excludedIds.add(history.getDorama().getDoramaId());
            }
        });

        return excludedIds;
    }

    private List<Dorama> getOfflineMlRecommendations(Long userId, Set<Long> excludedIds, int limit) {
        List<UserRecommendation> recommendations =
                userRecommendationRepository.findByUserIdOrderByScoreDesc(
                        userId,
                        PageRequest.of(0, OFFLINE_LOOKAHEAD_LIMIT)
                );

        if (recommendations.isEmpty()) {
            return Collections.emptyList();
        }

        return recommendations.stream()
                .filter(recommendation -> !excludedIds.contains(recommendation.getDoramaId()))
                .map(UserRecommendation::getDorama)
                .filter(Objects::nonNull)
                .limit(limit)
                .toList();
    }

    private List<Dorama> getOnlineContentFallback(
            List<Favorite> favorites,
            List<Rating> ratings,
            List<WatchHistory> watchHistory,
            Set<Long> excludedIds,
            int limit
    ) {
        Map<String, Double> userGenreProfile = new HashMap<>();
        Map<String, Double> userTagProfile = new HashMap<>();
        Map<String, Double> userActorProfile = new HashMap<>();

        for (Favorite favorite : favorites) {
            addDoramaToProfile(
                    favorite.getDorama(),
                    4.0,
                    userGenreProfile,
                    userTagProfile,
                    userActorProfile
            );
        }

        for (Rating rating : ratings) {
            double weight = getRatingWeight(rating.getScore());

            if (weight > 0) {
                addDoramaToProfile(
                        rating.getDorama(),
                        weight,
                        userGenreProfile,
                        userTagProfile,
                        userActorProfile
                );
            }
        }

        for (WatchHistory history : watchHistory) {
            double weight = getWatchStatusWeight(history.getStatus());

            if (weight > 0) {
                addDoramaToProfile(
                        history.getDorama(),
                        weight,
                        userGenreProfile,
                        userTagProfile,
                        userActorProfile
                );
            }
        }

        boolean hasUserProfile =
                !userGenreProfile.isEmpty()
                        || !userTagProfile.isEmpty()
                        || !userActorProfile.isEmpty();

        if (!hasUserProfile) {
            return Collections.emptyList();
        }

        List<DoramaScore> scoredDoramas = new ArrayList<>();

        for (Dorama dorama : doramaRepository.findAll()) {
            Long doramaId = dorama.getDoramaId();

            if (excludedIds.contains(doramaId)) {
                continue;
            }

            boolean hasContent =
                    !dorama.getGenres().isEmpty()
                            || !dorama.getTags().isEmpty()
                            || !dorama.getActors().isEmpty();

            if (!hasContent) {
                continue;
            }

            double contentScore = calculateContentScore(
                    dorama,
                    userGenreProfile,
                    userTagProfile,
                    userActorProfile
            );

            double popularityScore = calculatePopularityScore(doramaId);

            double fallbackScore =
                    0.75 * contentScore
                            + 0.25 * popularityScore;

            scoredDoramas.add(new DoramaScore(dorama, fallbackScore));
        }

        return scoredDoramas.stream()
                .sorted(Comparator.comparing(DoramaScore::score).reversed())
                .limit(limit)
                .map(DoramaScore::dorama)
                .toList();
    }

    private List<Dorama> getColdStartRecommendations(Set<Long> excludedIds, int limit) {
        return doramaRepository.findAll().stream()
                .filter(dorama -> dorama.getDoramaId() != null)
                .filter(dorama -> !excludedIds.contains(dorama.getDoramaId()))
                .map(dorama -> new DoramaScore(dorama, calculatePopularityScore(dorama.getDoramaId())))
                .sorted(Comparator.comparing(DoramaScore::score).reversed())
                .limit(limit)
                .map(DoramaScore::dorama)
                .toList();
    }

    private void addDoramaToProfile(
            Dorama dorama,
            double weight,
            Map<String, Double> genreProfile,
            Map<String, Double> tagProfile,
            Map<String, Double> actorProfile
    ) {
        if (dorama == null) {
            return;
        }

        dorama.getGenres().forEach(genre ->
                addWeight(genreProfile, genre.getName(), weight)
        );

        dorama.getTags().forEach(tag ->
                addWeight(tagProfile, tag.getName(), weight)
        );

        dorama.getActors().forEach(actor ->
                addWeight(actorProfile, actor.getFullName(), weight * 0.5)
        );
    }

    private void addWeight(Map<String, Double> profile, String key, double weight) {
        if (key == null || key.isBlank()) {
            return;
        }

        String normalizedKey = key.trim().toLowerCase();

        profile.put(
                normalizedKey,
                profile.getOrDefault(normalizedKey, 0.0) + weight
        );
    }

    private double getRatingWeight(Integer score) {
        if (score == null) {
            return 0.0;
        }

        if (score >= 8) {
            return 3.0;
        }

        if (score >= 6) {
            return 2.0;
        }

        if (score >= 4) {
            return 1.0;
        }

        return 0.0;
    }

    private double getWatchStatusWeight(WatchStatus status) {
        if (status == null) {
            return 0.0;
        }

        return switch (status) {
            case COMPLETED -> 3.0;
            case WATCHING -> 2.5;
            case PLANNED -> 1.5;
            case DROPPED -> 0.0;
        };
    }

    private double calculateContentScore(
            Dorama candidate,
            Map<String, Double> genreProfile,
            Map<String, Double> tagProfile,
            Map<String, Double> actorProfile
    ) {
        double genreScore = calculateProfileMatch(
                candidate.getGenres(),
                Genre::getName,
                genreProfile
        );

        double tagScore = calculateProfileMatch(
                candidate.getTags(),
                Tag::getName,
                tagProfile
        );

        double actorScore = calculateProfileMatch(
                candidate.getActors(),
                Actor::getFullName,
                actorProfile
        );

        return 0.30 * genreScore
                + 0.55 * tagScore
                + 0.15 * actorScore;
    }

    private <T> double calculateProfileMatch(
            Set<T> values,
            Function<T, String> nameExtractor,
            Map<String, Double> profile
    ) {
        if (values == null || values.isEmpty() || profile.isEmpty()) {
            return 0.0;
        }

        double profileWeightSum = profile.values().stream()
                .mapToDouble(Double::doubleValue)
                .sum();

        if (profileWeightSum == 0.0) {
            return 0.0;
        }

        double matchedWeight = values.stream()
                .map(nameExtractor)
                .filter(Objects::nonNull)
                .map(value -> value.trim().toLowerCase())
                .mapToDouble(value -> profile.getOrDefault(value, 0.0))
                .sum();

        return Math.min(1.0, matchedWeight / profileWeightSum);
    }

    private double calculatePopularityScore(Long doramaId) {
        Double averageRating = ratingRepository.findAverageScoreByDoramaId(doramaId);
        Long ratingCount = ratingRepository.countByDoramaId(doramaId);
        Long favoriteCount = favoriteRepository.countByDorama_DoramaId(doramaId);
        Long watchCount = watchHistoryRepository.countByDorama_DoramaId(doramaId);

        double averageScore = averageRating == null ? 0.0 : Math.min(1.0, averageRating / 10.0);
        double ratingCountScore = normalizeCount(ratingCount);
        double favoriteCountScore = normalizeCount(favoriteCount);
        double watchCountScore = normalizeCount(watchCount);

        return 0.50 * averageScore
                + 0.20 * ratingCountScore
                + 0.15 * favoriteCountScore
                + 0.15 * watchCountScore;
    }

    private double normalizeCount(Long count) {
        if (count == null || count <= 0) {
            return 0.0;
        }

        return Math.min(1.0, Math.log1p(count) / Math.log1p(50.0));
    }

    private record DoramaScore(Dorama dorama, double score) {
    }
}
