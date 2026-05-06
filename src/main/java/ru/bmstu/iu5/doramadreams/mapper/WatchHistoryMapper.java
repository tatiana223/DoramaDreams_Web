package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.bmstu.iu5.doramadreams.dto.WatchHistoryDto;
import ru.bmstu.iu5.doramadreams.model.WatchHistory;

import java.util.List;

@Mapper(componentModel = "spring")
public interface WatchHistoryMapper {

    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "dorama.doramaId", target = "doramaId")
    @Mapping(source = "dorama.title", target = "doramaTitle")
    @Mapping(source = "lastEpisode", target = "lastEpisode") // добавили
    @Mapping(source = "updatedAt", target = "updatedAt")     // добавили
    WatchHistoryDto toDto(WatchHistory history);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "dorama", ignore = true)
    WatchHistory toEntity(WatchHistoryDto dto);

    List<WatchHistoryDto> toDtoList(List<WatchHistory> historyList);
}