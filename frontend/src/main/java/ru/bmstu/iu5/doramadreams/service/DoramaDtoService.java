package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.mapper.DoramaMapper;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.repository.RatingRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DoramaDtoService {

    private final DoramaMapper doramaMapper;
    private final RatingRepository ratingRepository;

    public DoramaDto toDto(Dorama dorama) {
        DoramaDto dto = doramaMapper.toDto(dorama);
        enrichWithRating(dto, dorama);
        return dto;
    }

    public List<DoramaDto> toDtoList(List<Dorama> doramas) {
        return doramas.stream()
                .map(this::toDto)
                .toList();
    }

    private void enrichWithRating(DoramaDto dto, Dorama dorama) {
        if (dorama == null || dorama.getDoramaId() == null) {
            dto.setAverageRating(0.0);
            dto.setRatingsCount(0L);
            return;
        }

        Double averageRating = ratingRepository.findAverageScoreByDoramaId(dorama.getDoramaId());
        Long ratingsCount = ratingRepository.countByDoramaId(dorama.getDoramaId());

        dto.setAverageRating(averageRating == null ? 0.0 : averageRating);
        dto.setRatingsCount(ratingsCount == null ? 0L : ratingsCount);
    }
}
