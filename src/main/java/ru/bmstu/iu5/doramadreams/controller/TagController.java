package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
}
