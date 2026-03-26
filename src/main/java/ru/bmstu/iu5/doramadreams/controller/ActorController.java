package ru.bmstu.iu5.doramadreams.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.repository.ActorRepository;
import ru.bmstu.iu5.doramadreams.service.ActorService;

import java.util.List;

@RestController
@RequestMapping("/api/actors")
public class ActorController {

    @Autowired
    private ActorService actorService;

    @GetMapping
    public List<ActorDto> getAllActors() {
        return actorService.getAllActors();
    }

    @GetMapping("/{id}")
    public ActorDto getByIdActors(@PathVariable Long id) {
        return actorService.getByIdActor(id);
    }

    @GetMapping("/search/fullName")
    public ResponseEntity<ActorDto> getByIdActors(@RequestParam("fullName") String fullName) {
        return ResponseEntity.ok(actorService.getByNameActor(fullName));
    }

}