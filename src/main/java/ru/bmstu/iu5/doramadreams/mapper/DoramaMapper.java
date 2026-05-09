package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.Genre;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface DoramaMapper {

    @Mapping(target = "genres", source = "genres")
    @Mapping(target = "countryId", source = "country.countryId")
    @Mapping(target = "countryName", source = "country.name")
    @Mapping(target = "countryIsoCode", source = "country.isoCode")
    DoramaDto toDto(Dorama dorama);

    @Mapping(target = "genres", ignore = true)
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
}