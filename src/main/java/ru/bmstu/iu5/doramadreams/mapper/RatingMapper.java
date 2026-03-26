package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.bmstu.iu5.doramadreams.dto.RatingDto;
import ru.bmstu.iu5.doramadreams.model.Rating;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RatingMapper {
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.username", target = "username")
    @Mapping(source = "dorama.doramaId", target = "doramaId")
    @Mapping(source = "dorama.title", target = "doramaTitle")
    RatingDto toDto(Rating rating);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "dorama", ignore = true)
    Rating toEntity(RatingDto ratingDto);
    List<RatingDto> toDtoList(List<Rating> rating);
}
