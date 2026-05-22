package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ActorDto {
    private Long actorId;
    private Long tmdbId;
    private String imdbId;
    private String fullName;
    private String originalName;
    private String photoUrl;
    private LocalDate birthDate;
    private String placeOfBirth;
    private String knownForDepartment;
    private Double popularity;
    private String biography;
}
