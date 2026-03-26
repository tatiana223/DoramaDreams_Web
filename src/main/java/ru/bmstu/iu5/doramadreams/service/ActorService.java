package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.mapper.ActorMapper;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.repository.ActorRepository;

import java.util.List;

@Service
public class ActorService {
    @Autowired
    private ActorRepository actorRepository;
    @Autowired
    private ActorMapper actorMapper;

    public List<ActorDto> getAllActors() {
        return actorMapper.toDtoList(actorRepository.findAll());
    }

    public ActorDto getByIdActor(Long actorId) {
        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Актер с таким id не найден"));
        return actorMapper.toDto(actor);
    }

    public ActorDto getByNameActor(String fullName) {
        Actor actor = actorRepository.findByFullName(fullName)
                .orElseThrow(() -> new RuntimeException("Актер с таким именем не найден"));
        return actorMapper.toDto(actor);
    }
}
