package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import ru.bmstu.iu5.doramadreams.dto.TagDto;
import ru.bmstu.iu5.doramadreams.model.Tag;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TagMapper {
    TagDto toDto(Tag tag);
    Tag toEntity(TagDto dto);
    List<TagDto> toDtoList(List<Tag> tags);
}
