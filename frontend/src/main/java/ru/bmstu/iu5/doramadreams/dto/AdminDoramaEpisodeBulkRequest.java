package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

import java.util.List;

@Data
public class AdminDoramaEpisodeBulkRequest {
    private Long doramaId;
    private Integer startEpisodeNumber;
    private Boolean overwriteExisting;
    private String rawText;
    private List<AdminDoramaEpisodeBulkItem> episodes;
}
