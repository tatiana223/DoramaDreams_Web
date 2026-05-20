package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.RatingDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.RatingService;

import java.util.List;

@Tag(name = "Ratings", description = "Оценки")
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final CurrentUserService currentUserService;
    @Operation(summary = "Добавить или обновить оценку")

    @PostMapping
    public RatingDto addRating(@RequestBody RatingDto ratingDto) {
        ratingDto.setUserId(currentUserService.getCurrentUserId());
        return ratingService.saveRating(ratingDto);
    }
    @Operation(summary = "Получить оценки дорамы")

    @GetMapping("/dorama/{doramaId}")
    public List<RatingDto> getByDorama(@PathVariable Long doramaId) {
        return ratingService.getRatingsByDorama(doramaId);
    }
    @Operation(summary = "Получить мои оценки")

    @GetMapping("/my")
    public List<RatingDto> getMyRatings() {
        Long userId = currentUserService.getCurrentUserId();
        return ratingService.getRatingsByUser(userId);
    }
    @Operation(summary = "Получить среднюю оценку дорамы")

    @GetMapping("/dorama/{doramaId}/average")
    public Double getAverageRating(@PathVariable Long doramaId) {
        return ratingService.getAverageRating(doramaId);
    }
    @Operation(summary = "Получить количество оценок дорамы")

    @GetMapping("/dorama/{doramaId}/count")
    public Long getRatingsCount(@PathVariable Long doramaId) {
        return ratingService.getRatingsCount(doramaId);
    }
}