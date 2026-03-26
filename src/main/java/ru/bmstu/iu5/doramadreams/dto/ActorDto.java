package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

@Data
public class ActorDto {
    private Long actorId;
    private String fullName;
    private String photoUrl;
    private String biography;
}
