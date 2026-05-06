package ru.bmstu.iu5.doramadreams.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.service.DoramaService;

import java.util.List;

@RestController
@RequestMapping("/api/doramas")
@RequiredArgsConstructor
public class DoramaController {

    private final DoramaService doramaService;

    @GetMapping
    public List<DoramaDto> getAllDoramas() {
        return doramaService.getAllDoramas();
    }

    @PostMapping
    public ResponseEntity<DoramaDto> createDorama(@RequestBody DoramaDto doramaDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(doramaService.createDorama(doramaDto));
    }

    @GetMapping("/{id}")
    public DoramaDto getByIdDorama(@PathVariable Long id) {
        return doramaService.getById(id);
    }

    @PutMapping("/{id}")
    public DoramaDto updateDorama(@PathVariable Long id, @RequestBody DoramaDto doramaDto) {
        return doramaService.updateDorama(id, doramaDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDorama(@PathVariable Long id) {
        doramaService.deleteDorama(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/name")
    public ResponseEntity<DoramaDto> getByName(@RequestParam("name") String name) {
        return ResponseEntity.ok(doramaService.getByName(name));
    }

    @GetMapping("/search/genres")
    public ResponseEntity<List<DoramaDto>> searchByGenre(@RequestParam("genres") String name) {
        return ResponseEntity.ok(doramaService.getDoramasByGenre(name));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoramaDto>> searchDoramas(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) Integer releaseYear
    ) {
        return ResponseEntity.ok(doramaService.searchDoramas(title, genre, releaseYear));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<DoramaDto>> getTopRated(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(doramaService.getTopRated(limit));
    }
}