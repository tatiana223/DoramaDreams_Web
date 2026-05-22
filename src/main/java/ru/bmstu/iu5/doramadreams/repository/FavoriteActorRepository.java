package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.FavoriteActor;

import java.util.List;

@Repository
public interface FavoriteActorRepository extends JpaRepository<FavoriteActor, Long> {
    List<FavoriteActor> findByUser_UserId(Long userId);

    void deleteByUser_UserIdAndActor_ActorId(Long userId, Long actorId);

    void deleteByActor_ActorId(Long actorId);

    boolean existsByUser_UserIdAndActor_ActorId(Long userId, Long actorId);

    Long countByActor_ActorId(Long actorId);
}
