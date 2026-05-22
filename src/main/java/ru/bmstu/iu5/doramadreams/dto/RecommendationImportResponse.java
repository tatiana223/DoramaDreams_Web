package ru.bmstu.iu5.doramadreams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class RecommendationImportResponse {
    private int importedRows;
    private String modelVersion;
    private LocalDateTime importedAt;
}