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

    @Operation(summary = "Удалить отзыв")
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long reviewId) {
        Long userId = currentUserService.getCurrentUserId();
        reviewService.deleteReview(userId, reviewId);
        return ResponseEntity.noContent().build();
    }
}
