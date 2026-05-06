package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.RatingDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.RatingMapper;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.Rating;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.RatingRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingService {

    private final RatingRepository ratingRepository;
    private final DoramaRepository doramaRepository;
    private final UserRepository userRepository;
    private final RatingMapper ratingMapper;

    public RatingDto saveRating(RatingDto ratingDto) {
        validateRating(ratingDto);

        User user = userRepository.findById(ratingDto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        Dorama dorama = doramaRepository.findById(ratingDto.getDoramaId())
                .orElseThrow(() -> new ResourceNotFoundException("Дорама не найдена"));

        Rating rating = ratingRepository
                .findByUser_UserIdAndDorama_DoramaId(ratingDto.getUserId(), ratingDto.getDoramaId())
                .orElseGet(Rating::new);

        rating.setUser(user);
        rating.setDorama(dorama);
        rating.setScore(ratingDto.getScore());

        return ratingMapper.toDto(ratingRepository.save(rating));
    }

    public List<RatingDto> getRatingsByDorama(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        return ratingMapper.toDtoList(ratingRepository.findByDorama_DoramaId(doramaId));
    }

    public List<RatingDto> getRatingsByUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Пользователь не найден");
        }

        return ratingMapper.toDtoList(
                ratingRepository.findByUser_UserIdOrderByRatingIdDesc(userId)
        );
    }

    public Double getAverageRating(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        Double average = ratingRepository.findAverageScoreByDoramaId(doramaId);
        return average == null ? 0.0 : average;
    }

    public Long getRatingsCount(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        return ratingRepository.countByDoramaId(doramaId);
    }

    private void validateRating(RatingDto ratingDto) {
        if (ratingDto.getUserId() == null) {
            throw new BadRequestException("ID пользователя обязателен");
        }

        if (ratingDto.getDoramaId() == null) {
            throw new BadRequestException("ID дорамы обязателен");
        }

        if (ratingDto.getScore() == null || ratingDto.getScore() < 1 || ratingDto.getScore() > 10) {
            throw new BadRequestException("Оценка должна быть от 1 до 10");
        }
    }
}