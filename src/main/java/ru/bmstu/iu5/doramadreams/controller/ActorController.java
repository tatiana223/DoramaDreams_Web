package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.service.ActorService;

import java.util.List;

@Tag(name = "Actors", description = "Актёры")
@RestController
@RequestMapping("/api/actors")
@RequiredArgsConstructor
public class ActorController {

    private final ActorService actorService;
    @Operation(summary = "Получить список актёров")

    @GetMapping
    public List<ActorDto> getAllActors() {
        return actorService.getAllActors();
    }
    @Operation(summary = "Создать актёра")

    @PostMapping
    public ResponseEntity<ActorDto> createActor(@RequestBody ActorDto actorDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(actorService.createActor(actorDto));
    }
    @Operation(summary = "Получить актёра по ID")

    @GetMapping("/{id}")
    public ActorDto getByIdActor(@PathVariable Long id) {
        return actorService.getByIdActor(id);
    }
    @Operation(summary = "Обновить актёра")

    @PutMapping("/{id}")
    public ActorDto updateActor(@PathVariable Long id, @RequestBody ActorDto actorDto) {
        return actorService.updateActor(id, actorDto);
    }
    @Operation(summary = "Удалить актёра")

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActor(@PathVariable Long id) {
        actorService.deleteActor(id);
        return ResponseEntity.noContent().build();
    }
    @Operation(summary = "Найти актёра по ФИО")

    @GetMapping("/search/fullName")
    public ResponseEntity<ActorDto> getByFullName(@RequestParam("fullName") String fullName) {
        return ResponseEntity.ok(actorService.getByNameActor(fullName));
    }
}