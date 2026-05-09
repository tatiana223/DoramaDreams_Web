package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.ReviewDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.ReviewService;

import java.util.List;

@Tag(name = "Reviews", description = "Отзывы")
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;
    @Operation(summary = "Добавить отзыв")

    @PostMapping("/add")
    public ReviewDto addReview(
            @RequestParam Long doramaId,
            @RequestParam String content
    ) {
        Long userId = currentUserService.getCurrentUserId();
        return reviewService.addReview(userId, doramaId, content);
    }
    @Operation(summary = "Получить отзывы по дораме")

    @GetMapping("/dorama/{doramaId}")
    public List<ReviewDto> getReviewsByDorama(@PathVariable Long doramaId) {
        return reviewService.getDoramaReviews(doramaId);
    }
    @Operation(summary = "Получить мои отзывы")

    @GetMapping("/my")
    public List<ReviewDto> getMyReviews() {
        Long userId = currentUserService.getCurrentUserId();
        return reviewService.getUserReviews(userId);
    }
    @Operation(summary = "Получить мой отзыв по дораме")

    @GetMapping("/my/dorama/{doramaId}")
    public ReviewDto getMyReviewForDorama(@PathVariable Long doramaId) {
        Long userId = currentUserService.getCurrentUserId();
        return reviewService.getUserReviewForDorama(userId, doramaId);
    }
    @Operation(summary = "Поиск отзывов по тексту")

    @GetMapping("/search")
    public List<ReviewDto> searchReviews(@RequestParam String text) {
        return reviewService.searchReviews(text);
    }
    @Operation(summary = "Получить количество отзывов дорамы")

    @GetMapping("/dorama/{doramaId}/count")
    public Long getReviewCount(@PathVariable Long doramaId) {
        return reviewService.getReviewCount(doramaId);
    }
}