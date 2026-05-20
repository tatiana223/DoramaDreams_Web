package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.TagDto;
import ru.bmstu.iu5.doramadreams.service.TagService;

import java.util.List;

@Tag(name = "Tags", description = "Теги дорам")
@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @Operation(summary = "Получить все теги")
    @GetMapping
    public List<TagDto> getAllTags() {
        return tagService.getAllTags();
    }

    @Operation(summary = "Получить тег по ID")
    @GetMapping("/{id}")
    public TagDto getById(@PathVariable Long id) {
        return tagService.getById(id);
    }

    @Operation(summary = "Создать тег")
    @PostMapping
    public ResponseEntity<TagDto> createTag(@RequestBody TagDto tagDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tagService.createTag(tagDto));
    }

    @Operation(summary = "Обновить тег")
    @PutMapping("/{id}")
    public TagDto updateTag(@PathVariable Long id, @RequestBody TagDto tagDto) {
        return tagService.updateTag(id, tagDto);
    }

    @Operation(summary = "Удалить тег")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }
}
