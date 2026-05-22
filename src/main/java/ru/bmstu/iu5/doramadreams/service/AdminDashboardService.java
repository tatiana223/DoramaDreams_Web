package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.AdminDashboardDto;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.FavoriteRepository;
import ru.bmstu.iu5.doramadreams.repository.RatingRepository;
import ru.bmstu.iu5.doramadreams.repository.ReviewRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRecommendationRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;
import ru.bmstu.iu5.doramadreams.repository.WatchHistoryRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final DoramaRepository doramaRepository;
    private final RatingRepository ratingRepository;
    private final FavoriteRepository favoriteRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final ReviewRepository reviewRepository;
    private final UserRecommendationRepository userRecommendationRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboard() {
        List<String> modelVersions =
                userRecommendationRepository.findModelVersionsByFrequency(PageRequest.of(0, 1));

        String currentModelVersion = modelVersions.isEmpty() ? null : modelVersions.get(0);
        LocalDateTime recommendationsUpdatedAt = userRecommendationRepository.findLastCreatedAt();

        return new AdminDashboardDto(
                userRepository.count(),
                doramaRepository.count(),
                ratingRepository.count(),
                favoriteRepository.count(),
                watchHistoryRepository.count(),
                reviewRepository.count(),
                userRecommendationRepository.count(),
                userRecommendationRepository.countDistinctUsersWithRecommendations(),
                currentModelVersion,
                recommendationsUpdatedAt
        );
    }
}