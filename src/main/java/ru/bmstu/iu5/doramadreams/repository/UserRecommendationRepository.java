package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.UserRecommendation;
import ru.bmstu.iu5.doramadreams.model.UserRecommendationId;

import java.util.List;

@Repository
public interface UserRecommendationRepository extends JpaRepository<UserRecommendation, UserRecommendationId> {

    List<UserRecommendation> findByUserIdOrderByScoreDesc(Long userId, Pageable pageable);

    long countByModelVersion(String modelVersion);
}
