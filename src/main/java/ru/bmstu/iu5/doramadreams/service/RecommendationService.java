package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.mapper.DoramaMapper;
import ru.bmstu.iu5.doramadreams.model.Genre;
import ru.bmstu.iu5.doramadreams.repository.FavoriteRepository;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RecommendationService {
    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private DoramaRepository doramaRepository;
    @Autowired private DoramaMapper doramaMapper;

    public List<DoramaDto> getPersonalRecommendations(Long userId) {
        Set<String> genreNames = favoriteRepository.findByUser_UserId(userId).stream()
                .flatMap(f -> f.getDorama().getGenres().stream())
                .map(Genre::getName)
                .collect(Collectors.toSet());

        Set<Long> excludedIds = favoriteRepository.findByUser_UserId(userId).stream()
                .map(f -> f.getDorama().getDoramaId())
                .collect(Collectors.toSet());

        if (genreNames.isEmpty()) {
            return doramaMapper.toDtoList(
                    doramaRepository.findTopRated(PageRequest.of(0, 10))
            );
        }

        if (excludedIds.isEmpty()) {
            excludedIds.add(-1L);
        }

        return doramaMapper.toDtoList(
                doramaRepository.findByGenreNamesExcludingIds(
                        genreNames,
                        excludedIds,
                        PageRequest.of(0, 10)
                )
        );
    }
}