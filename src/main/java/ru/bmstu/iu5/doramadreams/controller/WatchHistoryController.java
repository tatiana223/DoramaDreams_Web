package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.WatchHistoryDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.model.WatchStatus;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.WatchHistoryService;

import java.util.List;

@Tag(name = "Watch History", description = "История просмотра")
@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class WatchHistoryController {

    private final WatchHistoryService watchHistoryService;
    private final CurrentUserService currentUserService;

    @Operation(summary = "Получить мою историю просмотра")
    @GetMapping("/my")
    public List<WatchHistoryDto> getMyHistory() {
        Long userId = currentUserService.getCurrentUserId();
        return watchHistoryService.getUserHistory(userId);
    }

    @Operation(summary = "Добавить или обновить прогресс просмотра")
    @PostMapping("/add")
    public WatchHistoryDto addRecord(
            @RequestParam Long doramaId,
            @RequestParam(required = false, defaultValue = "1") Integer episode,
            @RequestParam(required = false, defaultValue = "WATCHING") String status
    ) {
        Long userId = currentUserService.getCurrentUserId();
        WatchStatus watchStatus = parseWatchStatus(status);

        return watchHistoryService.updateOrCreateProgress(
                userId,
                doramaId,
                episode,
                watchStatus
        );
    }

    @Operation(summary = "Удалить запись из моей истории просмотра")
    @DeleteMapping("/my/dorama/{doramaId}")
    public ResponseEntity<Void> deleteHistoryRecord(@PathVariable Long doramaId) {
        Long userId = currentUserService.getCurrentUserId();
        watchHistoryService.deleteHistoryRecord(userId, doramaId);
        return ResponseEntity.noContent().build();
    }

    private WatchStatus parseWatchStatus(String status) {
        try {
            return WatchStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Некорректный статус. Допустимые значения: PLANNED, WATCHING, COMPLETED, DROPPED"
            );
        }
    }
}
