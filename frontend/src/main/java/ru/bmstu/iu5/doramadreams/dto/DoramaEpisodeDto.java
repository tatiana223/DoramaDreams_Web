package ru.bmstu.iu5.doramadreams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class DoramaEpisodeDto {
    private Long episodeId;
    private Long doramaId;
    private String doramaTitle;
    private Integer episodeNumber;
    private String title;
    private String videoUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}