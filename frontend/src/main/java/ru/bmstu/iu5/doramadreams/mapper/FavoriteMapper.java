package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.bmstu.iu5.doramadreams.dto.FavoriteDto;
import ru.bmstu.iu5.doramadreams.model.Favorite;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FavoriteMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "dorama.doramaId", target = "doramaId")
    @Mapping(source = "dorama.title", target = "doramaTitle")
    @Mapping(source = "dorama.posterUrl", target = "posterUrl")
    FavoriteDto toDto(Favorite favorite);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "dorama", ignore = true)
    Favorite toEntity(FavoriteDto dto);

    List<FavoriteDto> toDtoList(List<Favorite> favorites);
}