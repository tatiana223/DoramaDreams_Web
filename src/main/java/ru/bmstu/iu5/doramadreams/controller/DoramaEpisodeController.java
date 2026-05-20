package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.DoramaEpisodeDto;
import ru.bmstu.iu5.doramadreams.service.DoramaEpisodeService;

import java.util.List;

@Tag(name = "Dorama Episodes", description = "Серии дорам")
@RestController
@RequestMapping("/api/doramas/{doramaId}/episodes")
@RequiredArgsConstructor
public class DoramaEpisodeController {

    private final DoramaEpisodeService doramaEpisodeService;

    @Operation(summary = "Получить серии дорамы")
    @GetMapping
    public List<DoramaEpisodeDto> getEpisodes(@PathVariable Long doramaId) {
        return doramaEpisodeService.getEpisodesByDorama(doramaId);
    }

    @Operation(summary = "Получить серию дорамы по номеру")
    @GetMapping("/{episodeNumber}")
    public DoramaEpisodeDto getEpisode(
            @PathVariable Long doramaId,
            @PathVariable Integer episodeNumber
    ) {
        return doramaEpisodeService.getEpisodeByNumber(doramaId, episodeNumber);
    }
}