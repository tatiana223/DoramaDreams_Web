package ru.bmstu.iu5.doramadreams.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.ReviewDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.ReviewService;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserService currentUserService;

    @PostMapping("/add")
    public ReviewDto addReview(
            @RequestParam Long doramaId,
            @RequestParam String content
    ) {
        Long userId = currentUserService.getCurrentUserId();
        return reviewService.addReview(userId, doramaId, content);
    }

    @GetMapping("/dorama/{doramaId}")
    public List<ReviewDto> getReviewsByDorama(@PathVariable Long doramaId) {
        return reviewService.getDoramaReviews(doramaId);
    }

    @GetMapping("/my")
    public List<ReviewDto> getMyReviews() {
        Long userId = currentUserService.getCurrentUserId();
        return reviewService.getUserReviews(userId);
    }

    @GetMapping("/my/dorama/{doramaId}")
    public ReviewDto getMyReviewForDorama(@PathVariable Long doramaId) {
        Long userId = currentUserService.getCurrentUserId();
        return reviewService.getUserReviewForDorama(userId, doramaId);
    }

    @GetMapping("/search")
    public List<ReviewDto> searchReviews(@RequestParam String text) {
        return reviewService.searchReviews(text);
    }

    @GetMapping("/dorama/{doramaId}/count")
    public Long getReviewCount(@PathVariable Long doramaId) {
        return reviewService.getReviewCount(doramaId);
    }
}