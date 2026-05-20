package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaActorsRequest;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaVideoRequest;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.service.DoramaService;

@Tag(name = "Admin Doramas", description = "Администрирование дорам")
@RestController
@RequestMapping("/api/admin/doramas")
@RequiredArgsConstructor
public class AdminDoramaController {

    private final DoramaService doramaService;

    @Operation(summary = "Создать дораму вручную")
    @PostMapping
    public ResponseEntity<DoramaDto> createDorama(@RequestBody DoramaDto doramaDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doramaService.createDorama(doramaDto));
    }

    @Operation(summary = "Обновить дораму вручную")
    @PutMapping("/{doramaId}")
    public DoramaDto updateDorama(
            @PathVariable Long doramaId,
            @RequestBody DoramaDto doramaDto
    ) {
        return doramaService.updateDoramaFull(doramaId, doramaDto);
    }

    @Operation(summary = "Добавить или обновить видео дорамы")
    @PutMapping("/{doramaId}/video")
    public DoramaDto updateVideoUrl(
            @PathVariable Long doramaId,
            @RequestBody AdminDoramaVideoRequest request
    ) {
        return doramaService.updateVideoUrl(doramaId, request.getVideoUrl());
    }

    @Operation(summary = "Обновить актёров дорамы")
    @PutMapping("/{doramaId}/actors")
    public DoramaDto updateActors(
            @PathVariable Long doramaId,
            @RequestBody AdminDoramaActorsRequest request
    ) {
        return doramaService.updateActors(doramaId, request.getActorIds());
    }

    @Operation(summary = "Удалить видео дорамы")
    @DeleteMapping("/{doramaId}/video")
    public DoramaDto deleteVideoUrl(@PathVariable Long doramaId) {
        return doramaService.deleteVideoUrl(doramaId);
    }
}