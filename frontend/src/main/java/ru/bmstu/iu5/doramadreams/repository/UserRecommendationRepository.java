package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.UserRecommendation;
import ru.bmstu.iu5.doramadreams.model.UserRecommendationId;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserRecommendationRepository extends JpaRepository<UserRecommendation, UserRecommendationId> {

    List<UserRecommendation> findByUserIdOrderByScoreDesc(Long userId, Pageable pageable);

    @Query("SELECT COUNT(DISTINCT ur.userId) FROM UserRecommendation ur")
    Long countDistinctUsersWithRecommendations();

    @Query("SELECT ur.modelVersion FROM UserRecommendation ur GROUP BY ur.modelVersion ORDER BY COUNT(ur) DESC")
    List<String> findModelVersionsByFrequency(Pageable pageable);

    @Query("SELECT MAX(ur.createdAt) FROM UserRecommendation ur")
    LocalDateTime findLastCreatedAt();
}
