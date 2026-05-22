package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.RatingDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.RatingService;

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
}
