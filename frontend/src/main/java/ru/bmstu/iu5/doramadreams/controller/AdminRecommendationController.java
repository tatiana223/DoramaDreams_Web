package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ru.bmstu.iu5.doramadreams.dto.RecommendationImportResponse;
import ru.bmstu.iu5.doramadreams.service.RecommendationImportService;

@Tag(name = "Admin Recommendations", description = "Администрирование ML-рекомендаций")
@RestController
@RequestMapping("/api/admin/recommendations")
@RequiredArgsConstructor
public class AdminRecommendationController {

    private final RecommendationImportService recommendationImportService;

    @Operation(summary = "Импортировать CSV с offline ML-рекомендациями")
    @PostMapping("/import")
    public RecommendationImportResponse importRecommendations(@RequestParam("file") MultipartFile file) {
        return recommendationImportService.importCsv(file);
    }
}