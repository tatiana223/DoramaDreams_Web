package ru.bmstu.iu5.doramadreams.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.service.DoramaService;

import java.util.List;

@RestController
@RequestMapping("/api/doramas")
public class DoramaController {

    @Autowired
    private DoramaService doramaService;

    @GetMapping
    public List<DoramaDto> getAllDoramas() {
        return doramaService.getAllDoramas();
    }

    @GetMapping("/{id}")
    public DoramaDto getByIdDorama(@PathVariable Long id) {
        return doramaService.getById(id);
    }

    @GetMapping("/search/name")
    public ResponseEntity<DoramaDto> getByName(@RequestParam("name") String name) {
        // Название параметра в кавычках должно совпадать с тем, что в URL после '?'
        return ResponseEntity.ok(doramaService.getByName(name));
    }
    @GetMapping("/search/genres")
    public ResponseEntity<List<DoramaDto>> searchByGenre(@RequestParam("genres") String name) {
        return ResponseEntity.ok(doramaService.getDoramasByGenre(name));
    }
}
