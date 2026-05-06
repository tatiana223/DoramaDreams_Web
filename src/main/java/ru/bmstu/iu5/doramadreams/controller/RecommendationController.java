package ru.bmstu.iu5.doramadreams.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.RecommendationService;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final CurrentUserService currentUserService;

    @GetMapping("/my")
    public ResponseEntity<List<DoramaDto>> getMyRecommendations() {
        Long userId = currentUserService.getCurrentUserId();
        List<DoramaDto> recommendations = recommendationService.getPersonalRecommendations(userId);
        return ResponseEntity.ok(recommendations);
    }
}