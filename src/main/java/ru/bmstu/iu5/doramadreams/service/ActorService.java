package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.ActorMapper;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.repository.ActorRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ActorService {

    private final ActorRepository actorRepository;
    private final ActorMapper actorMapper;

    public List<ActorDto> getAllActors() {
        return actorMapper.toDtoList(actorRepository.findAll());
    }

    public ActorDto getByIdActor(Long actorId) {
        return actorMapper.toDto(findActorEntityById(actorId));
    }

    public ActorDto getByNameActor(String fullName) {
        Actor actor = actorRepository.findByFullNameIgnoreCase(fullName)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр с таким именем не найден"));

        return actorMapper.toDto(actor);
    }

    public ActorDto createActor(ActorDto actorDto) {
        validateActor(actorDto);

        if (actorRepository.existsByFullNameIgnoreCase(actorDto.getFullName())) {
            throw new ConflictException("Актёр с таким именем уже существует");
        }

        Actor actor = actorMapper.toEntity(actorDto);
        return actorMapper.toDto(actorRepository.save(actor));
    }

    public ActorDto updateActor(Long id, ActorDto actorDto) {
        Actor actor = findActorEntityById(id);

        if (actorDto.getFullName() != null && !actorDto.getFullName().isBlank()) {
            actorRepository.findByFullNameIgnoreCase(actorDto.getFullName())
                    .filter(existingActor -> !existingActor.getActorId().equals(id))
                    .ifPresent(existingActor -> {
                        throw new ConflictException("Актёр с таким именем уже существует");
                    });

            actor.setFullName(actorDto.getFullName());
        }

        if (actorDto.getPhotoUrl() != null) {
            actor.setPhotoUrl(actorDto.getPhotoUrl());
        }

        if (actorDto.getBiography() != null) {
            actor.setBiography(actorDto.getBiography());
        }

        return actorMapper.toDto(actorRepository.save(actor));
    }

    public void deleteActor(Long id) {
        Actor actor = findActorEntityById(id);
        actorRepository.delete(actor);
    }

    private Actor findActorEntityById(Long id) {
        return actorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр с таким id не найден"));
    }

    private void validateActor(ActorDto actorDto) {
        if (actorDto.getFullName() == null || actorDto.getFullName().isBlank()) {
            throw new BadRequestException("Имя актёра обязательно");
        }
    }
}