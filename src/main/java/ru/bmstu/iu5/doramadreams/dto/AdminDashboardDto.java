package ru.bmstu.iu5.doramadreams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AdminDashboardDto {
    private Long usersCount;
    private Long doramasCount;
    private Long ratingsCount;
    private Long favoritesCount;
    private Long watchHistoryCount;
    private Long reviewsCount;
    private Long userRecommendationsCount;
    private Long usersWithRecommendationsCount;
    private String currentModelVersion;
    private LocalDateTime recommendationsUpdatedAt;
}