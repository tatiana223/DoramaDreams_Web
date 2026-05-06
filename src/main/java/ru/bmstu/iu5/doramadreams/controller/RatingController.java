package ru.bmstu.iu5.doramadreams.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.RatingDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.RatingService;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public RatingDto addRating(@RequestBody RatingDto ratingDto) {
        ratingDto.setUserId(currentUserService.getCurrentUserId());
        return ratingService.saveRating(ratingDto);
    }

    @GetMapping("/dorama/{doramaId}")
    public List<RatingDto> getByDorama(@PathVariable Long doramaId) {
        return ratingService.getRatingsByDorama(doramaId);
    }

    @GetMapping("/my")
    public List<RatingDto> getMyRatings() {
        Long userId = currentUserService.getCurrentUserId();
        return ratingService.getRatingsByUser(userId);
    }

    @GetMapping("/dorama/{doramaId}/average")
    public Double getAverageRating(@PathVariable Long doramaId) {
        return ratingService.getAverageRating(doramaId);
    }

    @GetMapping("/dorama/{doramaId}/count")
    public Long getRatingsCount(@PathVariable Long doramaId) {
        return ratingService.getRatingsCount(doramaId);
    }
}