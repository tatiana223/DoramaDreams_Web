package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.Actor;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActorRepository extends JpaRepository<Actor, Long> {
    Optional<Actor> findByFullNameIgnoreCase(String fullName);

    List<Actor> findByFullNameContainingIgnoreCase(String fullName);

    boolean existsByFullNameIgnoreCase(String fullName);
}