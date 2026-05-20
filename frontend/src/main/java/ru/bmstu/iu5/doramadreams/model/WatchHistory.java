package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "watch_progress")
@Data
@IdClass(WatchHistoryId.class) // Указываем вспомогательный класс для ключа
public class WatchHistory implements Serializable {

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name = "dorama_id")
    private Dorama dorama;

    @Column(name = "last_episode_watched")
    private Integer lastEpisode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WatchStatus status;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}