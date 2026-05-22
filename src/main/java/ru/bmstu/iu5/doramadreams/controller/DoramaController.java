package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.service.DoramaService;

import java.util.List;

@Tag(name = "Doramas", description = "Каталог дорам")
@RestController
@RequestMapping("/api/doramas")
@RequiredArgsConstructor
public class DoramaController {

    private final DoramaService doramaService;

    @Operation(summary = "Получить список дорам или выполнить поиск по фильтрам")
    @GetMapping
    public List<DoramaDto> getDoramas(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String country,
            @RequestParam(required = false) Integer releaseYear
    ) {
        return doramaService.getDoramas(title, genre, tag, country, releaseYear);
    }

    @Operation(summary = "Получить дораму по ID")
    @GetMapping("/{id}")
    public DoramaDto getByIdDorama(@PathVariable Long id) {
        return doramaService.getById(id);
    }
}
