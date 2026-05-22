package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDoramaActorsRequest {
    private List<Long> actorIds;
}
