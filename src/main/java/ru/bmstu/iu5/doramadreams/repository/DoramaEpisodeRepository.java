package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.DoramaEpisode;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoramaEpisodeRepository extends JpaRepository<DoramaEpisode, Long> {

    List<DoramaEpisode> findByDorama_DoramaIdOrderByEpisodeNumberAsc(Long doramaId);

    Optional<DoramaEpisode> findByDorama_DoramaIdAndEpisodeNumber(Long doramaId, Integer episodeNumber);

    boolean existsByDorama_DoramaIdAndEpisodeNumber(Long doramaId, Integer episodeNumber);
}