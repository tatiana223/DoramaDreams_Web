package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.RatingDto;
import ru.bmstu.iu5.doramadreams.mapper.RatingMapper;
import ru.bmstu.iu5.doramadreams.model.Rating;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.RatingRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

import java.util.List;

@Service
public class RatingService {
    @Autowired
    private RatingRepository ratingRepository;
    @Autowired
    private DoramaRepository doramaRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RatingMapper ratingMapper;

    public RatingDto saveRating(RatingDto ratingDto) {

        Rating rating = ratingMapper.toEntity(ratingDto);

        rating.setUser(userRepository.findById(ratingDto.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found")));
        rating.setDorama(doramaRepository.findById(ratingDto.getDoramaId())
                .orElseThrow(() -> new RuntimeException("Dorama not found")));

        Rating savedRating = ratingRepository.save(rating);

        return ratingMapper.toDto(savedRating);
    }

    public List<RatingDto> getRatingsByDorama(Long doramaId) {
        List<Rating> ratings = ratingRepository.findAll().stream()
                .filter(r -> r.getDorama().getDoramaId().equals(doramaId))
                .toList();
        return ratingMapper.toDtoList(ratings);
    }
}
