package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import ru.bmstu.iu5.doramadreams.service.RecommendationImportService;

@Tag(name = "Admin recommendations", description = "Импорт offline ML-рекомендаций")
@RestController
@RequestMapping("/api/admin/recommendations")
@RequiredArgsConstructor
public class AdminRecommendationController {

    private final RecommendationImportService recommendationImportService;

    @Operation(summary = "Импортировать CSV-файл с offline ML-рекомендациями")
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RecommendationImportService.ImportResult> importRecommendations(@RequestParam("file") MultipartFile file) {
        RecommendationImportService.ImportResult result = recommendationImportService.importCsv(file);
        return ResponseEntity.ok(result);
    }
}
