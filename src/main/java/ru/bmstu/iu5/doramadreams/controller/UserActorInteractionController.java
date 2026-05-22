package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.ActorCommentRequest;
import ru.bmstu.iu5.doramadreams.dto.ActorInteractionStatsDto;
import ru.bmstu.iu5.doramadreams.dto.ActorRatingRequest;
import ru.bmstu.iu5.doramadreams.dto.UserActorInteractionDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.UserActorInteractionService;

import java.util.List;

@Tag(name = "User Actor Interactions", description = "Взаимодействия пользователей с актёрами")
@RestController
@RequestMapping("/api/actor-interactions")
@RequiredArgsConstructor
public class UserActorInteractionController {

    private final UserActorInteractionService interactionService;
    private final CurrentUserService currentUserService;

    @Operation(summary = "Получить мои взаимодействия с актёрами")
    @GetMapping("/my")
    public List<UserActorInteractionDto> getMyInteractions() {
        return interactionService.getUserInteractions(currentUserService.getCurrentUserId());
    }

    @Operation(summary = "Поставить или обновить оценку актёра")
    @PostMapping("/actors/{actorId}/rating")
    public UserActorInteractionDto rateActor(
            @PathVariable Long actorId,
            @RequestBody ActorRatingRequest request
    ) {
        return interactionService.rateActor(
                currentUserService.getCurrentUserId(),
                actorId,
                request.getRating()
        );
    }

    @Operation(summary = "Получить мою оценку актёра")
    @GetMapping("/actors/{actorId}/rating/my")
    public ResponseEntity<Integer> getMyActorRating(@PathVariable Long actorId) {
        return interactionService
                .getMyActorRating(currentUserService.getCurrentUserId(), actorId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @Operation(summary = "Добавить комментарий к актёру")
    @PostMapping("/actors/{actorId}/comments")
    public UserActorInteractionDto addComment(
            @PathVariable Long actorId,
            @RequestBody ActorCommentRequest request
    ) {
        return interactionService.addComment(
                currentUserService.getCurrentUserId(),
                actorId,
                request.getCommentText()
        );
    }

    @Operation(summary = "Получить комментарии к актёру")
    @GetMapping("/actors/{actorId}/comments")
    public List<UserActorInteractionDto> getActorComments(@PathVariable Long actorId) {
        return interactionService.getActorComments(actorId);
    }

    @Operation(summary = "Удалить комментарий к актёру")
    @DeleteMapping("/comments/{interactionId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long interactionId) {
        interactionService.deleteComment(currentUserService.getCurrentUserId(), interactionId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Записать просмотр страницы актёра")
    @PostMapping("/actors/{actorId}/view")
    public ResponseEntity<Void> recordView(@PathVariable Long actorId) {
        interactionService.recordView(currentUserService.getCurrentUserId(), actorId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Получить статистику взаимодействий по актёру")
    @GetMapping("/actors/{actorId}/stats")
    public ActorInteractionStatsDto getActorStats(@PathVariable Long actorId) {
        return interactionService.getActorStats(actorId);
    }
}
