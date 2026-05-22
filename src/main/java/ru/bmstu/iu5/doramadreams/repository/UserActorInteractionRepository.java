package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ru.bmstu.iu5.doramadreams.model.UserActorInteraction;
import ru.bmstu.iu5.doramadreams.model.UserActorInteractionType;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserActorInteractionRepository extends JpaRepository<UserActorInteraction, Long> {

    List<UserActorInteraction> findByUser_UserId(Long userId);

    List<UserActorInteraction> findByUser_UserIdAndInteractionType(Long userId, UserActorInteractionType interactionType);

    List<UserActorInteraction> findByUser_UserIdAndInteractionTypeIn(
            Long userId,
            Collection<UserActorInteractionType> interactionTypes
    );

    List<UserActorInteraction> findByUser_UserIdAndActor_ActorId(Long userId, Long actorId);

    List<UserActorInteraction> findByActor_ActorIdAndInteractionTypeOrderByCreatedAtDesc(
            Long actorId,
            UserActorInteractionType interactionType
    );

    Optional<UserActorInteraction> findFirstByUser_UserIdAndActor_ActorIdAndInteractionType(
            Long userId,
            Long actorId,
            UserActorInteractionType interactionType
    );

    boolean existsByUser_UserIdAndActor_ActorIdAndInteractionType(
            Long userId,
            Long actorId,
            UserActorInteractionType interactionType
    );

    void deleteByUser_UserIdAndActor_ActorIdAndInteractionType(
            Long userId,
            Long actorId,
            UserActorInteractionType interactionType
    );

    void deleteByActor_ActorId(Long actorId);

    Long countByActor_ActorIdAndInteractionType(Long actorId, UserActorInteractionType interactionType);

    Long countByActor_ActorIdAndInteractionTypeAndRatingIsNotNull(Long actorId, UserActorInteractionType interactionType);

    @Query("""
            SELECT AVG(i.rating)
            FROM UserActorInteraction i
            WHERE i.actor.actorId = :actorId
              AND i.interactionType = ru.bmstu.iu5.doramadreams.model.UserActorInteractionType.RATING
              AND i.rating IS NOT NULL
            """)
    Double findAverageRatingByActorId(@Param("actorId") Long actorId);
}
