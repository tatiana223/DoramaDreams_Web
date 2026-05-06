package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.bmstu.iu5.doramadreams.dto.ReviewDto;
import ru.bmstu.iu5.doramadreams.model.Review;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(source = "user.username", target = "username")
    ReviewDto toDto(Review review);

    List<ReviewDto> toDtoList(List<Review> reviews);
}