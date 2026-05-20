package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaEpisodeBulkRequest;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaEpisodeBulkResult;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaEpisodeRequest;
import ru.bmstu.iu5.doramadreams.dto.DoramaEpisodeDto;
import ru.bmstu.iu5.doramadreams.service.DoramaEpisodeService;

@Tag(name = "Admin Episodes", description = "Администрирование серий дорам")
@RestController
@RequestMapping("/api/admin/episodes")
@RequiredArgsConstructor
public class AdminDoramaEpisodeController {

    private final DoramaEpisodeService doramaEpisodeService;

    @Operation(summary = "Добавить серию")
    @PostMapping
    public ResponseEntity<DoramaEpisodeDto> createEpisode(
            @RequestBody AdminDoramaEpisodeRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(doramaEpisodeService.createEpisode(request));
    }

    @Operation(summary = "Массово добавить серии")
    @PostMapping("/bulk")
    public AdminDoramaEpisodeBulkResult importEpisodes(
            @RequestBody AdminDoramaEpisodeBulkRequest request
    ) {
        return doramaEpisodeService.importEpisodes(request);
    }

    @Operation(summary = "Обновить серию")
    @PutMapping("/{episodeId}")
    public DoramaEpisodeDto updateEpisode(
            @PathVariable Long episodeId,
            @RequestBody AdminDoramaEpisodeRequest request
    ) {
        return doramaEpisodeService.updateEpisode(episodeId, request);
    }

    @Operation(summary = "Удалить серию")
    @DeleteMapping("/{episodeId}")
    public ResponseEntity<Void> deleteEpisode(@PathVariable Long episodeId) {
        doramaEpisodeService.deleteEpisode(episodeId);
        return ResponseEntity.noContent().build();
    }
}
