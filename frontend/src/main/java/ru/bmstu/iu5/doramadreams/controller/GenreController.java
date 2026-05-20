package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
    @Operation(summary = "Создать жанр")

    @PostMapping
    public ResponseEntity<GenreDto> createGenre(@RequestBody GenreDto genreDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(genreService.createGenre(genreDto));
    }
    @Operation(summary = "Получить жанр по ID")

    @GetMapping("/{id}")
    public GenreDto getGenreById(@PathVariable Long id) {
        return genreService.getGenreById(id);
    }
    @Operation(summary = "Обновить жанр")

    @PutMapping("/{id}")
    public GenreDto updateGenre(@PathVariable Long id, @RequestBody GenreDto genreDto) {
        return genreService.updateGenre(id, genreDto);
    }
    @Operation(summary = "Удалить жанр")

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGenre(@PathVariable Long id) {
        genreService.deleteGenre(id);
        return ResponseEntity.noContent().build();
    }

}