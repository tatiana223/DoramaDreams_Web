package ru.bmstu.iu5.doramadreams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ActorInteractionStatsDto {
    private Long favoritesCount;
    private Long ratingsCount;
    private Double averageRating;
    private Long commentsCount;
    private Long viewsCount;
}
