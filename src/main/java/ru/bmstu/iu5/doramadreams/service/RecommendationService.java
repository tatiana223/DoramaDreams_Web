package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.model.*;
import ru.bmstu.iu5.doramadreams.repository.*;
import java.util.*;
import java.util.function.Function;

@Service
public class RecommendationService {
    private static final int DEFAULT_LIMIT = 20;
    private static final int OFFLINE_LOOKAHEAD_LIMIT = 200;

    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private DoramaRepository doramaRepository;
    @Autowired private RatingRepository ratingRepository;
    @Autowired private WatchHistoryRepository watchHistoryRepository;
    @Autowired private DoramaDtoService doramaDtoService;
    @Autowired private UserRecommendationRepository userRecommendationRepository;
    @Autowired private UserActorInteractionRepository userActorInteractionRepository;

    @Transactional(readOnly = true)
    public List<DoramaDto> getPersonalRecommendations(Long userId) {
        var favorites = favoriteRepository.findByUser_UserId(userId);
        var ratings = ratingRepository.findByUser_UserId(userId);
        var watchHistory = watchHistoryRepository.findByUser_UserIdOrderByUpdatedAtDesc(userId);
        var actorInteractions = userActorInteractionRepository.findByUser_UserIdAndInteractionTypeIn(userId,
                List.of(UserActorInteractionType.FAVORITE, UserActorInteractionType.RATING, UserActorInteractionType.COMMENT, UserActorInteractionType.VIEW));

        Set<Long> excludedIds = buildExcludedDoramaIds(favorites, ratings, watchHistory);
        PreferenceProfile profile = buildUserPreferenceProfile(favorites, ratings, watchHistory, actorInteractions);
        LinkedHashMap<Long, RecommendedDorama> result = new LinkedHashMap<>();

        // 1. Уровень: Офлайн ML-рекомендации
        addRecommendations(result, getOfflineMlRecommendations(userId, excludedIds, profile), DEFAULT_LIMIT);

        // 2. Уровень: Онлайн Fallback по контенту (если не хватило ML)
        if (result.size() < DEFAULT_LIMIT) {
            Set<Long> fallbackExcludes = new HashSet<>(excludedIds); fallbackExcludes.addAll(result.keySet());
            addRecommendations(result, getOnlineContentFallback(profile, fallbackExcludes, DEFAULT_LIMIT - result.size()), DEFAULT_LIMIT);
        }

        // 3. Уровень: Стратегия Холодного старта (популярное для новых пользователей)
        if (result.size() < DEFAULT_LIMIT) {
            Set<Long> coldExcludes = new HashSet<>(excludedIds); coldExcludes.addAll(result.keySet());
            addRecommendations(result, getColdStartRecommendations(coldExcludes, DEFAULT_LIMIT - result.size()), DEFAULT_LIMIT);
        }

        return result.values().stream().map(this::toRecommendationDto).toList();
    }

    private Set<Long> buildExcludedDoramaIds(List<Favorite> favs, List<Rating> rts, List<WatchHistory> hist) {
        Set<Long> excluded = new HashSet<>();
        favs.stream().filter(f -> f.getDorama() != null).forEach(f -> excluded.add(f.getDorama().getDoramaId()));
        rts.stream().filter(r -> r.getDorama() != null).forEach(r -> excluded.add(r.getDorama().getDoramaId()));
        hist.stream().filter(h -> h.getDorama() != null).forEach(h -> excluded.add(h.getDorama().getDoramaId()));
        return excluded;
    }

    private List<RecommendedDorama> getOfflineMlRecommendations(Long userId, Set<Long> excluded, PreferenceProfile prof) {
        return userRecommendationRepository.findByUserIdOrderByScoreDesc(userId, PageRequest.of(0, OFFLINE_LOOKAHEAD_LIMIT))
                .stream().filter(r -> !excluded.contains(r.getDoramaId()) && r.getDorama() != null).limit(DEFAULT_LIMIT)
                .map(r -> new RecommendedDorama(r.getDorama(), "ML_SCORE", "Рекомендовано на основе ML-модели предпочтений.", r.getScore(), r.getModelVersion()))
                .toList();
    }

    private List<RecommendedDorama> getOnlineContentFallback(PreferenceProfile prof, Set<Long> excluded, int limit) {
        if (!prof.hasData()) return Collections.emptyList();
        List<DoramaScore> scored = new ArrayList<>();

        for (Dorama d : doramaRepository.findAll()) {
            if (excluded.contains(d.getDoramaId()) || (d.getGenres().isEmpty() && d.getTags().isEmpty() && d.getActors().isEmpty())) continue;
            double contentScore = 0.30 * calculateProfileMatch(d.getGenres(), Genre::getName, prof.genreProfile())
                    + 0.55 * calculateProfileMatch(d.getTags(), Tag::getName, prof.tagProfile())
                    + 0.15 * calculateProfileMatch(d.getActors(), Actor::getFullName, prof.actorProfile());
            double totalScore = 0.75 * contentScore + 0.25 * calculatePopularityScore(d.getDoramaId());
            scored.add(new DoramaScore(d, totalScore, "Похоже на то, что вам уже нравилось (совпадение жанров/тегов)."));
        }
        return scored.stream().sorted(Comparator.comparing(DoramaScore::score).reversed()).limit(limit)
                .map(s -> new RecommendedDorama(s.dorama(), "FALLBACK", s.reason(), s.score(), null)).toList();
    }

    private List<RecommendedDorama> getColdStartRecommendations(Set<Long> excluded, int limit) {
        return doramaRepository.findAll().stream().filter(d -> d.getDoramaId() != null && !excluded.contains(d.getDoramaId()))
                .map(d -> new DoramaScore(d, calculatePopularityScore(d.getDoramaId()), "Популярно среди зрителей."))
                .sorted(Comparator.comparing(DoramaScore::score).reversed()).limit(limit)
                .map(s -> new RecommendedDorama(s.dorama(), "COLD_START", s.reason(), s.score(), null)).toList();
    }

    private PreferenceProfile buildUserPreferenceProfile(List<Favorite> favs, List<Rating> rts, List<WatchHistory> hist, List<UserActorInteraction> actors) {
        Map<String, Double> genres = new HashMap<>(), tags = new HashMap<>(), acts = new HashMap<>();
        favs.forEach(f -> addDoramaToProfile(f.getDorama(), 4.0, genres, tags, acts));
        rts.forEach(r -> { double w = r.getScore() >= 8 ? 3.0 : (r.getScore() >= 6 ? 2.0 : (r.getScore() >= 4 ? 1.0 : 0.0)); if(w>0) addDoramaToProfile(r.getDorama(), w, genres, tags, acts); });
        hist.forEach(h -> { double w = h.getStatus() == WatchStatus.COMPLETED ? 3.0 : (h.getStatus() == WatchStatus.WATCHING ? 2.5 : 1.5); addDoramaToProfile(h.getDorama(), w, genres, tags, acts); });
        actors.forEach(i -> {
            if (i == null || i.getActor() == null || i.getInteractionType() == null) return;
            double w = switch(i.getInteractionType()) { case FAVORITE -> 5.0; case COMMENT -> 3.0; case VIEW -> 0.75; case RATING -> (i.getRating() != null && i.getRating() >= 5) ? Math.min(5.0, i.getRating()/2.0) : 0.0; };
            if (w > 0) addWeight(acts, i.getActor().getFullName(), w);
        });
        return new PreferenceProfile(genres, tags, acts);
    }

    private void addDoramaToProfile(Dorama d, double w, Map<String, Double> gen, Map<String, Double> tg, Map<String, Double> act) {
        if (d == null) return;
        d.getGenres().forEach(g -> addWeight(gen, g.getName(), w));
        d.getTags().forEach(t -> addWeight(tg, t.getName(), w));
        d.getActors().forEach(a -> addWeight(act, a.getFullName(), w * 0.5));
    }

    private void addWeight(Map<String, Double> profile, String key, double w) {
        if (key != null && !key.isBlank()) profile.merge(key.trim().toLowerCase(), w, Double::sum);
    }

    private <T> double calculateProfileMatch(Set<T> values, Function<T, String> extractor, Map<String, Double> profile) {
        if (values == null || values.isEmpty() || profile.isEmpty()) return 0.0;
        double sum = profile.values().stream().mapToDouble(Double::doubleValue).sum();
        if (sum == 0.0) return 0.0;
        double matched = values.stream().map(extractor).filter(Objects::nonNull).map(v -> v.trim().toLowerCase()).mapToDouble(v -> profile.getOrDefault(v, 0.0)).sum();
        return Math.min(1.0, matched / sum);
    }

    private double calculatePopularityScore(Long doramaId) {
        Double avgRating = ratingRepository.findAverageScoreByDoramaId(doramaId);
        double score = avgRating == null ? 0.0 : Math.min(1.0, avgRating / 10.0);
        double rCount = Math.min(1.0, Math.log1p(ratingRepository.countByDoramaId(doramaId)) / Math.log1p(50.0));
        double fCount = Math.min(1.0, Math.log1p(favoriteRepository.countByDorama_DoramaId(doramaId)) / Math.log1p(50.0));
        double wCount = Math.min(1.0, Math.log1p(watchHistoryRepository.countByDorama_DoramaId(doramaId)) / Math.log1p(50.0));
        return 0.50 * score + 0.20 * rCount + 0.15 * fCount + 0.15 * wCount;
    }

    private void addRecommendations(LinkedHashMap<Long, RecommendedDorama> res, List<RecommendedDorama> candidates, int limit) {
        for (var c : candidates) {
            if (c != null && c.dorama() != null && c.dorama().getDoramaId() != null) res.putIfAbsent(c.dorama().getDoramaId(), c);
            if (res.size() >= limit) break;
        }
    }

    private DoramaDto toRecommendationDto(RecommendedDorama r) {
        DoramaDto dto = doramaDtoService.toDto(r.dorama());
        dto.setRecommendationSource(r.source()); dto.setRecommendationReason(r.reason());
        dto.setRecommendationScore(r.score()); dto.setRecommendationModelVersion(r.modelVersion());
        return dto;
    }

    private record RecommendedDorama(Dorama dorama, String source, String reason, Double score, String modelVersion) {}
    private record PreferenceProfile(Map<String, Double> genreProfile, Map<String, Double> tagProfile, Map<String, Double> actorProfile) {
        public boolean hasData() { return !genreProfile.isEmpty() || !tagProfile.isEmpty() || !actorProfile.isEmpty(); }
    }
    private record DoramaScore(Dorama dorama, double score, String reason) {}
}