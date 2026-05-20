package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.service.DoramaService;

import java.util.List;

@Tag(name = "Doramas", description = "Каталог дорам")
@RestController
@RequestMapping("/api/doramas")
@RequiredArgsConstructor
public class DoramaController {

    private final DoramaService doramaService;
    @Operation(summary = "Получить список дорам")

    @GetMapping
    public List<DoramaDto> getAllDoramas() {
        return doramaService.getAllDoramas();
    }
    @Operation(summary = "Создать дораму")

    @PostMapping
    public ResponseEntity<DoramaDto> createDorama(@RequestBody DoramaDto doramaDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doramaService.createDorama(doramaDto));
    }
    @Operation(summary = "Получить дораму по ID")

    @GetMapping("/{id}")
    public DoramaDto getByIdDorama(@PathVariable Long id) {
        return doramaService.getById(id);
    }
    @Operation(summary = "Обновить дораму")

    @PutMapping("/{id}")
    public DoramaDto updateDorama(@PathVariable Long id, @RequestBody DoramaDto doramaDto) {
        return doramaService.updateDorama(id, doramaDto);
    }
    @Operation(summary = "Удалить дораму")

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDorama(@PathVariable Long id) {
        doramaService.deleteDorama(id);
        return ResponseEntity.noContent().build();
    }
    @Operation(summary = "Найти дораму по названию")

    @GetMapping("/search/name")
    public ResponseEntity<DoramaDto> getByName(@RequestParam("name") String name) {
        return ResponseEntity.ok(doramaService.getByName(name));
    }
    @Operation(summary = "Найти дорамы по жанру")

    @GetMapping("/search/genres")
    public ResponseEntity<List<DoramaDto>> searchByGenre(@RequestParam("genres") String name) {
        return ResponseEntity.ok(doramaService.getDoramasByGenre(name));
    }
    @Operation(summary = "Поиск дорам по фильтрам")

    @GetMapping("/search")
    public ResponseEntity<List<DoramaDto>> searchDoramas(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Integer releaseYear
    ) {
        return ResponseEntity.ok(doramaService.searchDoramas(title, genre, tag, releaseYear));
    }
    @Operation(summary = "Получить топ дорам по рейтингу")

    @GetMapping("/top-rated")
    public ResponseEntity<List<DoramaDto>> getTopRated(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(doramaService.getTopRated(limit));
    }
}