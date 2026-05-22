package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

@Data
public class AdminDoramaEpisodeBulkItem {
    private Integer episodeNumber;
    private String title;
    private String videoUrl;
}
