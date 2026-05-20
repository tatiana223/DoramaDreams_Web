package ru.bmstu.iu5.doramadreams.repository;

import lombok.Locked;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.Favorite;
import ru.bmstu.iu5.doramadreams.model.User;
import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser_UserId(Long userId);

    List<Favorite> findByDorama_DoramaId(Long doramaId);

    void deleteByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    boolean existsByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    @Query("""
    SELECT f.dorama FROM Favorite f
    GROUP BY f.dorama
    ORDER BY COUNT(f) DESC
    """)
    List<Dorama> findMostFavoritedDoramas(Pageable pageable);

    Long countByDorama_DoramaId(Long doramaId);
}