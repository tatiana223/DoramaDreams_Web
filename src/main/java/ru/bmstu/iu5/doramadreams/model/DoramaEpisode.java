package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "dorama_episodes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_dorama_episode_number",
                        columnNames = {"dorama_id", "episode_number"}
                )
        }
)
@Data
public class DoramaEpisode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long episodeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dorama_id", nullable = false)
    private Dorama dorama;

    @Column(name = "episode_number", nullable = false)
    private Integer episodeNumber;

    @Column(length = 500)
    private String title;

    @Column(name = "video_url", length = 2000, nullable = false)
    private String videoUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}