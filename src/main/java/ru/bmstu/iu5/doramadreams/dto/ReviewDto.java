package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ReviewDto {
    private Long reviewId;
    private Long userId;
    private String username;
    private String content;
    private LocalDateTime createdAt;
}