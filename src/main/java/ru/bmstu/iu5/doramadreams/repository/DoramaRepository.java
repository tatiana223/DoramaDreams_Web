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

    List<Dorama> findByTitleContainingIgnoreCase(String title);

    List<Dorama> findByReleaseYear(Integer releaseYear);

    List<Dorama> findByReleaseYearBetween(Integer fromYear, Integer toYear);

    List<Dorama> findByGenres_NameIgnoreCase(String genreName);

    List<Dorama> findByTags_NameIgnoreCase(String tagName);

    boolean existsByTitleIgnoreCase(String title);

    boolean existsByTmdbId(Integer tmdbId);

    @Query("""
    SELECT DISTINCT d FROM Dorama d
    LEFT JOIN d.genres g
    LEFT JOIN d.tags t
    WHERE (:title IS NULL OR LOWER(d.title) LIKE :title)
    AND (:genre IS NULL OR LOWER(g.name) = :genre)
    AND (:tag IS NULL OR LOWER(t.name) = :tag)
    AND (:releaseYear IS NULL OR d.releaseYear = :releaseYear)
    """)
    List<Dorama> searchDoramas(
            @Param("title") String title,
            @Param("genre") String genre,
            @Param("tag") String tag,
            @Param("releaseYear") Integer releaseYear
    );

    @Query("""
    SELECT d FROM Dorama d
    LEFT JOIN Rating r ON r.dorama = d
    GROUP BY d
    ORDER BY AVG(r.score) DESC NULLS LAST
    """)
    List<Dorama> findTopRated(Pageable pageable);

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
