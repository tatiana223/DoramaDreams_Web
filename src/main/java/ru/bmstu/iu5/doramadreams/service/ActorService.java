package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.ActorMapper;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.repository.ActorRepository;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ActorService {

    private final ActorRepository actorRepository;
    private final DoramaRepository doramaRepository;
    private final UserActorInteractionService userActorInteractionService;
    private final DoramaDtoService doramaDtoService;
    private final ActorMapper actorMapper;

    public List<ActorDto> getAllActors() {
        return actorMapper.toDtoList(actorRepository.findAll());
    }

    public ActorDto getByIdActor(Long actorId) {
        return actorMapper.toDto(findActorEntityById(actorId));
    }

    public List<DoramaDto> getDoramasByActor(Long actorId) {
        Actor actor = findActorEntityById(actorId);
        return doramaDtoService.toDtoList(doramaRepository.findByActors_ActorId(actor.getActorId()));
    }

    public ActorDto getByNameActor(String fullName) {
        Actor actor = actorRepository.findByFullNameIgnoreCase(fullName)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр с таким именем не найден"));

        return actorMapper.toDto(actor);
    }

    public ActorDto createActor(ActorDto actorDto) {
        validateActor(actorDto);

        String normalizedFullName = actorDto.getFullName().trim();
        if (actorRepository.existsByFullNameIgnoreCase(normalizedFullName)) {
            throw new ConflictException("Актёр с таким именем уже существует");
        }

        Actor actor = actorMapper.toEntity(actorDto);
        actor.setFullName(normalizedFullName);
        actor.setTmdbId(actorDto.getTmdbId());
        actor.setImdbId(normalizeOptionalText(actorDto.getImdbId()));
        actor.setOriginalName(normalizeOptionalText(actorDto.getOriginalName()));
        actor.setPhotoUrl(normalizeOptionalText(actorDto.getPhotoUrl()));
        actor.setBirthDate(actorDto.getBirthDate());
        actor.setPlaceOfBirth(normalizeOptionalText(actorDto.getPlaceOfBirth()));
        actor.setKnownForDepartment(normalizeOptionalText(actorDto.getKnownForDepartment()));
        actor.setPopularity(actorDto.getPopularity());
        actor.setBiography(normalizeOptionalText(actorDto.getBiography()));
        return actorMapper.toDto(actorRepository.save(actor));
    }

    public ActorDto updateActor(Long id, ActorDto actorDto) {
        Actor actor = findActorEntityById(id);

        if (actorDto.getFullName() != null && !actorDto.getFullName().isBlank()) {
            String normalizedFullName = actorDto.getFullName().trim();
            actorRepository.findByFullNameIgnoreCase(normalizedFullName)
                    .filter(existingActor -> !existingActor.getActorId().equals(id))
                    .ifPresent(existingActor -> {
                        throw new ConflictException("Актёр с таким именем уже существует");
                    });

            actor.setFullName(normalizedFullName);
        }

        if (actorDto.getTmdbId() != null) {
            actor.setTmdbId(actorDto.getTmdbId());
        }

        if (actorDto.getImdbId() != null) {
            actor.setImdbId(normalizeOptionalText(actorDto.getImdbId()));
        }

        if (actorDto.getOriginalName() != null) {
            actor.setOriginalName(normalizeOptionalText(actorDto.getOriginalName()));
        }

        if (actorDto.getPhotoUrl() != null) {
            actor.setPhotoUrl(normalizeOptionalText(actorDto.getPhotoUrl()));
        }

        if (actorDto.getBirthDate() != null) {
            actor.setBirthDate(actorDto.getBirthDate());
        }

        if (actorDto.getPlaceOfBirth() != null) {
            actor.setPlaceOfBirth(normalizeOptionalText(actorDto.getPlaceOfBirth()));
        }

        if (actorDto.getKnownForDepartment() != null) {
            actor.setKnownForDepartment(normalizeOptionalText(actorDto.getKnownForDepartment()));
        }

        if (actorDto.getPopularity() != null) {
            actor.setPopularity(actorDto.getPopularity());
        }

        if (actorDto.getBiography() != null) {
            actor.setBiography(normalizeOptionalText(actorDto.getBiography()));
        }

        return actorMapper.toDto(actorRepository.save(actor));
    }

    @Transactional
    public void deleteActor(Long id) {
        Actor actor = findActorEntityById(id);
        List<Dorama> doramas = doramaRepository.findByActors_ActorId(id);

        for (Dorama dorama : doramas) {
            dorama.getActors().removeIf(item -> item.getActorId().equals(id));
        }

        doramaRepository.saveAll(doramas);
        userActorInteractionService.deleteActorInteractions(id);
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

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
