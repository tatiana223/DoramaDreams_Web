package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.Genre;
import ru.bmstu.iu5.doramadreams.model.Tag;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface DoramaMapper {

    @Mapping(target = "genres", source = "genres")
    @Mapping(target = "tags", source = "tags")
    @Mapping(target = "actors", source = "actors")
    @Mapping(target = "countryId", source = "country.countryId")
    @Mapping(target = "countryName", source = "country.name")
    @Mapping(target = "countryIsoCode", source = "country.isoCode")
    DoramaDto toDto(Dorama dorama);

    @Mapping(target = "genres", ignore = true)
    @Mapping(target = "tags", ignore = true)
    @Mapping(target = "actors", ignore = true)
    Dorama toEntity(DoramaDto dto);

    List<DoramaDto> toDtoList(List<Dorama> doramas);

    default List<String> mapGenresToNames(Set<Genre> genres) {
        if (genres == null) {
            return null;
        }

        return genres.stream()
                .map(Genre::getName)
                .toList();
    }

    default List<String> mapTagsToNames(Set<Tag> tags) {
        if (tags == null) {
            return null;
        }

        return tags.stream()
                .map(Tag::getName)
                .toList();
    }

    default List<ActorDto> mapActorsToDto(Set<Actor> actors) {
        if (actors == null) {
            return null;
        }

        return actors.stream()
                .map(actor -> {
                    ActorDto dto = new ActorDto();
                    dto.setActorId(actor.getActorId());
                    dto.setFullName(actor.getFullName());
                    dto.setPhotoUrl(actor.getPhotoUrl());
                    dto.setBiography(actor.getBiography());
                    return dto;
                })
                .toList();
    }
}
