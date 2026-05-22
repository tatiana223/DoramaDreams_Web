package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Favorite;

import java.util.List;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser_UserId(Long userId);

    void deleteByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    boolean existsByUser_UserIdAndDorama_DoramaId(Long userId, Long doramaId);

    Long countByDorama_DoramaId(Long doramaId);
}
