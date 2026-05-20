package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.WatchHistory;
import ru.bmstu.iu5.doramadreams.model.WatchHistoryId;
import ru.bmstu.iu5.doramadreams.model.WatchStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, WatchHistoryId> {
    List<WatchHistory> findByUser_UserIdOrderByUpdatedAtDesc(Long userId);

    Optional<WatchHistory> findByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    List<WatchHistory> findByUser_UserIdAndStatusOrderByUpdatedAtDesc(Long userId, WatchStatus status);

    List<WatchHistory> findByDorama_DoramaIdOrderByUpdatedAtDesc(Long doramaId);

    boolean existsByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    void deleteByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    Long countByDorama_DoramaId(Long doramaId);

    @Query("""
    SELECT w.dorama FROM WatchHistory w
    WHERE w.user.userId = :userId
    ORDER BY w.updatedAt DESC
    """)
    List<Dorama> findWatchedDoramasByUserId(Long userId);

    @Query("""
    SELECT w.dorama FROM WatchHistory w
    WHERE w.user.userId = :userId
    AND w.status = 'PLANNED'
    ORDER BY w.updatedAt DESC
    """)
    List<Dorama> findPlannedDoramasByUserId(Long userId);

    @Query("""
    SELECT w.dorama
    FROM WatchHistory w
    GROUP BY w.dorama
    ORDER BY COUNT(w) DESC
    """)
    List<Dorama> findMostWatchedDoramas(Pageable pageable);
}