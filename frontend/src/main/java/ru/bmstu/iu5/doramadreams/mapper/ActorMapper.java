package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.model.Actor;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ActorMapper {
    ActorDto toDto(Actor actor);
    Actor toEntity(ActorDto dto);
    List<ActorDto> toDtoList(List<Actor> actors);
}