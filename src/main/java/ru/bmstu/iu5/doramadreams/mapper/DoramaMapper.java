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
    DoramaDto toDto(Dorama dorama);
    Dorama toEntity(DoramaDto dto);
    List<DoramaDto> toDtoList(List<Dorama> doramas);


    // 1. Из базы в DTO
    default List<String> mapGenresToNames(Set<Genre> genres) {
        if (genres == null) return null;
        return genres.stream()
                .map(Genre::getName)
                .toList();
    }

    // 2. ИЗ DTO В БАЗУ
    default Set<Genre> mapNamesToGenres(List<String> strings) {
        if (strings == null) return null;
        return strings.stream()
                .map(name -> {
                    Genre genre = new Genre();
                    genre.setName(name); // Устанавливаем имя из строки
                    return genre;
                })
                .collect(java.util.stream.Collectors.toSet());
    }
}
