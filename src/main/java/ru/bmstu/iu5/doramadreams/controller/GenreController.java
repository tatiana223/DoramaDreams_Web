package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.GenreDto;
import ru.bmstu.iu5.doramadreams.service.GenreService;

import java.util.List;

@Tag(name = "Genres", description = "Жанры")
@RestController
@RequestMapping("/api/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @Operation(summary = "Получить список жанров")
    @GetMapping
    public List<GenreDto> getAll() {
        return genreService.getAllGenres();
    }
}
