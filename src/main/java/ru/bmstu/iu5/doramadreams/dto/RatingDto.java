package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

@Data
public class RatingDto {
    private Long ratingId;
    private Long userId;
    private String username;
    private Long doramaId;
    private String doramaTitle;
    private Integer score;
    private String comment;
}