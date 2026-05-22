package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;
import ru.bmstu.iu5.doramadreams.model.UserActorInteractionType;

import java.time.LocalDateTime;

@Data
public class UserActorInteractionDto {
    private Long interactionId;
    private Long userId;
    private String username;
    private Long actorId;
    private String actorName;
    private UserActorInteractionType interactionType;
    private Integer rating;
    private String commentText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
