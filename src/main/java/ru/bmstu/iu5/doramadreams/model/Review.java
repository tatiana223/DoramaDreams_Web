package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "dorama_id"})
        }
)
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "dorama_id")
    private Dorama dorama;

    @Column(nullable = false, length = 2000)
    private String content;

    private LocalDateTime createdAt = LocalDateTime.now();
}