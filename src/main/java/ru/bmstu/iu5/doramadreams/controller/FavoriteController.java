package ru.bmstu.iu5.doramadreams.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.FavoriteService;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final CurrentUserService currentUserService;

    // Получить список всех избранных дорам пользователя
    @GetMapping("/my")
    public ResponseEntity<List<DoramaDto>> getUserFavorites() {
        Long userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(
                favoriteService.getUserFavorites(userId)
        );
    }

    // Добавить в избранное
    @PostMapping("/{doramaId}")
    public ResponseEntity<Void> addFavorite(@PathVariable Long doramaId) {
        Long userId = currentUserService.getCurrentUserId();
        favoriteService.addFavorite(userId, doramaId);
        return ResponseEntity.ok().build();
    }

    // Удалить из избранного
    @DeleteMapping("/{doramaId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long doramaId) {
        Long userId = currentUserService.getCurrentUserId();
        favoriteService.removeFavorite(userId, doramaId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/top")
    public ResponseEntity<List<DoramaDto>> getMostFavorited(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(favoriteService.getMostFavoritedDoramas(limit));
    }

    @GetMapping("/dorama/{doramaId}/count")
    public Long getFavoriteCount(@PathVariable Long doramaId) {
        return favoriteService.getFavoriteCount(doramaId);
    }
}