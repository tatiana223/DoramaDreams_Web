package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ratings",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "dorama_id"})
        }
)
@Data
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "dorama_id")
    private Dorama dorama;

    @Column(nullable = false)
    private Integer score; // Оценка от 1 до 10

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}