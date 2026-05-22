package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
        name = "favorite_actors",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "actor_id"})
)
@Data
public class FavoriteActor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long favoriteActorId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "actor_id", nullable = false)
    private Actor actor;
}
