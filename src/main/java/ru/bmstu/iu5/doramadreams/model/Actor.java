package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "actors")
@Data
public class Actor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long actorId;

    private String fullName;
    private String originalName;
    private String photoUrl;
    private Long tmdbId;
    private String imdbId;
    private LocalDate birthDate;
    private String placeOfBirth;
    private String knownForDepartment;
    private Double popularity;

    @Column(columnDefinition = "TEXT")
    private String biography;
}
