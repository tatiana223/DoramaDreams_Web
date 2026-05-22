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
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.FavoriteService;

import java.util.List;

@Tag(name = "Favorites", description = "Избранное")
@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final CurrentUserService currentUserService;

    @Operation(summary = "Получить мои избранные дорамы")
    @GetMapping("/my")
    public ResponseEntity<List<DoramaDto>> getUserFavorites() {
        Long userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(favoriteService.getUserFavorites(userId));
    }

    @Operation(summary = "Добавить дораму в избранное")
    @PostMapping("/{doramaId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long doramaId) {
        Long userId = currentUserService.getCurrentUserId();
        favoriteService.addFavorite(userId, doramaId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Удалить дораму из избранного")
    @DeleteMapping("/{doramaId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long doramaId) {
        Long userId = currentUserService.getCurrentUserId();
        favoriteService.removeFavorite(userId, doramaId);
        return ResponseEntity.noContent().build();
    }
}
