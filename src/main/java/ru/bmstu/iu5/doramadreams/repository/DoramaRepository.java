package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Dorama;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface DoramaRepository extends JpaRepository<Dorama, Long> {
    Optional<Dorama> findByTitleIgnoreCase(String title);

    Optional<Dorama> findByTmdbId(Integer tmdbId);

    List<Dorama> findByActors_ActorId(Long actorId);

    @Query("""
    SELECT DISTINCT d FROM Dorama d
    LEFT JOIN d.genres g
    LEFT JOIN d.tags t
    LEFT JOIN d.country c
    WHERE (:title IS NULL OR LOWER(d.title) LIKE :title OR LOWER(d.originalTitle) LIKE :title)
    AND (:genre IS NULL OR LOWER(g.name) = :genre)
    AND (:tag IS NULL OR LOWER(t.name) = :tag)
    AND (:country IS NULL OR LOWER(c.name) = :country OR LOWER(c.isoCode) = :country)
    AND (:releaseYear IS NULL OR d.releaseYear = :releaseYear)
    """)
    List<Dorama> searchDoramas(
            @Param("title") String title,
            @Param("genre") String genre,
            @Param("tag") String tag,
            @Param("country") String country,
            @Param("releaseYear") Integer releaseYear
    );

    @Query("""
    SELECT DISTINCT d FROM Dorama d
    JOIN d.genres g
    WHERE g.name IN :genreNames
    AND d.doramaId NOT IN :excludedIds
    """)
    List<Dorama> findByGenreNamesExcludingIds(
            @Param("genreNames") Set<String> genreNames,
            @Param("excludedIds") Set<Long> excludedIds,
            Pageable pageable
    );
}
