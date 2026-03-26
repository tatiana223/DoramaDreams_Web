package ru.bmstu.iu5.doramadreams.mapper;
import org.mapstruct.Mapper;
import ru.bmstu.iu5.doramadreams.dto.GenreDto;
import ru.bmstu.iu5.doramadreams.model.Genre;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GenreMapper {
    GenreDto toDto(Genre genre);
    Genre toEntity(GenreDto dto);
    List<GenreDto> toDtoList(List<Genre> genres);
}