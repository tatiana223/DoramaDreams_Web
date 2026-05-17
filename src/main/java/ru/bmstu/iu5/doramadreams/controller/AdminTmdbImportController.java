package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.service.TmdbImportService;

@Tag(name = "Admin TMDB Import", description = "Импорт дорам из TMDB")
@RestController
@RequestMapping("/api/admin/tmdb")
@RequiredArgsConstructor
public class AdminTmdbImportController {

    private final TmdbImportService tmdbImportService;

    @Operation(summary = "Импортировать популярные корейские дорамы из TMDB")
    @PostMapping("/import-korean-doramas")
    public String importKoreanDoramas(@RequestParam(defaultValue = "3") int pages) {
        return tmdbImportService.importKoreanDoramas(pages);
    }
}