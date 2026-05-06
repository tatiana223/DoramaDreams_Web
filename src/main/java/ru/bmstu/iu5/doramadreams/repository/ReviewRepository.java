package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Review;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByDorama_DoramaIdOrderByCreatedAtDesc(Long doramaId);

    List<Review> findByUser_UserIdOrderByCreatedAtDesc(Long userId);

    Optional<Review> findByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    boolean existsByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    Long countByDorama_DoramaId(Long doramaId);

    void deleteByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    @Query("""
    SELECT r FROM Review r
    WHERE LOWER(r.content) LIKE LOWER(CONCAT('%', :text, '%'))
    ORDER BY r.createdAt DESC
    """)
    List<Review> searchByContent(String text);
}