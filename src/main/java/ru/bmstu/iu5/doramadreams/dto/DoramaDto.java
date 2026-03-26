package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

import java.util.List;

@Data
public class DoramaDto {
    private Long doramaId;
    private String title;
    private String originalTitle;
    private String description;
    private Integer releaseYear;
    private String posterUrl;
    private Double averageRating;
    private List<String> genres;
}
