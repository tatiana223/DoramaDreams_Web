package ru.bmstu.iu5.doramadreams.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.service.ActorService;

import java.util.List;

@RestController
@RequestMapping("/api/actors")
@RequiredArgsConstructor
public class ActorController {

    private final ActorService actorService;

    @GetMapping
    public List<ActorDto> getAllActors() {
        return actorService.getAllActors();
    }

    @PostMapping
    public ResponseEntity<ActorDto> createActor(@RequestBody ActorDto actorDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(actorService.createActor(actorDto));
    }

    @GetMapping("/{id}")
    public ActorDto getByIdActor(@PathVariable Long id) {
        return actorService.getByIdActor(id);
    }

    @PutMapping("/{id}")
    public ActorDto updateActor(@PathVariable Long id, @RequestBody ActorDto actorDto) {
        return actorService.updateActor(id, actorDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActor(@PathVariable Long id) {
        actorService.deleteActor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/fullName")
    public ResponseEntity<ActorDto> getByFullName(@RequestParam("fullName") String fullName) {
        return ResponseEntity.ok(actorService.getByNameActor(fullName));
    }
}