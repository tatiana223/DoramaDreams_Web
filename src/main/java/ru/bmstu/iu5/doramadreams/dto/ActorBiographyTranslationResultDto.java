package ru.bmstu.iu5.doramadreams.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActorBiographyTranslationResultDto {
    private int totalActors;
    private int translatedCount;
    private int skippedEmptyCount;
    private int skippedRussianCount;
    private int skippedNotEnglishCount;
    private int failedCount;
}
