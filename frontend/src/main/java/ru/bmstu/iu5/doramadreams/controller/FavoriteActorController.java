package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.UserActorInteractionService;

import java.util.List;

@Tag(name = "Favorite Actors", description = "Любимые актёры на базе user_actor_interactions")
@RestController
@RequestMapping("/api/actor-favorites")
@RequiredArgsConstructor
public class FavoriteActorController {

    private final UserActorInteractionService interactionService;
    private final CurrentUserService currentUserService;

    @Operation(summary = "Получить моих любимых актёров")
    @GetMapping("/my")
    public ResponseEntity<List<ActorDto>> getMyFavoriteActors() {
        Long userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(interactionService.getUserFavoriteActors(userId));
    }

    @Operation(summary = "Добавить актёра в любимые")
    @PostMapping("/{actorId}")
    public ResponseEntity<Void> addFavoriteActor(@PathVariable Long actorId) {
        Long userId = currentUserService.getCurrentUserId();
        interactionService.addFavoriteActor(userId, actorId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Удалить актёра из любимых")
    @DeleteMapping("/{actorId}")
    public ResponseEntity<Void> removeFavoriteActor(@PathVariable Long actorId) {
        Long userId = currentUserService.getCurrentUserId();
        interactionService.removeFavoriteActor(userId, actorId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Получить количество добавлений актёра в любимые")
    @GetMapping("/actor/{actorId}/count")
    public ResponseEntity<Long> getFavoriteCount(@PathVariable Long actorId) {
        return ResponseEntity.ok(interactionService.getFavoriteCount(actorId));
    }
}
