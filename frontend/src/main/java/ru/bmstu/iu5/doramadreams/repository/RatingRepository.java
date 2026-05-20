package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Rating;

import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByDorama_DoramaId(Long doramaId);

    List<Rating> findByUser_UserId(Long userId);

    List<Rating> findByUser_UserIdOrderByRatingIdDesc(Long userId);

    Optional<Rating> findByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    boolean existsByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.dorama.doramaId = :doramaId")
    Double findAverageScoreByDoramaId(Long doramaId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.dorama.doramaId = :doramaId")
    Long countByDoramaId(Long doramaId);

    @Query("""
    SELECT r.dorama.doramaId, AVG(r.score)
    FROM Rating r
    GROUP BY r.dorama.doramaId
    ORDER BY AVG(r.score) DESC
    """)
    List<Object[]> findTopRatedDoramas(Pageable pageable);
}