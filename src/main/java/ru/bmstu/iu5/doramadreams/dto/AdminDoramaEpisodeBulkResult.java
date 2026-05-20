package ru.bmstu.iu5.doramadreams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDoramaEpisodeBulkResult {
    private int createdCount;
    private int updatedCount;
    private int skippedCount;
    private int failedCount;
    private List<DoramaEpisodeDto> episodes = new ArrayList<>();
    private List<String> skipped = new ArrayList<>();
    private List<String> errors = new ArrayList<>();
}
