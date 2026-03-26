package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Dorama;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoramaRepository extends JpaRepository<Dorama, Long> {
    Optional<Dorama> findByTitle(String title);
    List<Dorama> findByGenres_NameIgnoreCase(String genreName);
}
