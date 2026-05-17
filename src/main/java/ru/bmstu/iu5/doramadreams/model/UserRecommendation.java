package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "user_recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(UserRecommendationId.class)
public class UserRecommendation {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "dorama_id")
    private Long doramaId;

    @Column(name = "score")
    private Double score;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dorama_id", insertable = false, updatable = false)
    private Dorama dorama;
}