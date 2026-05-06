package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;
import ru.bmstu.iu5.doramadreams.model.WatchStatus;

import java.time.LocalDateTime;

@Data
public class WatchHistoryDto {
    private Long userId;
    private Long doramaId;
    private String doramaTitle;
    private Integer lastEpisode;
    private WatchStatus status;
    private LocalDateTime updatedAt;
}