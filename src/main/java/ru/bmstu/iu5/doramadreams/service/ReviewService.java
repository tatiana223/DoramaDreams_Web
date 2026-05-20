package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.ReviewDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.ReviewMapper;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.Review;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.ReviewRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository repository;
    private final UserRepository userRepository;
    private final DoramaRepository doramaRepository;
    private final ReviewMapper mapper;

    public ReviewDto addReview(Long userId, Long doramaId, String content) {
        validateReview(userId, doramaId, content);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        Dorama dorama = doramaRepository.findById(doramaId)
                .orElseThrow(() -> new ResourceNotFoundException("Дорама не найдена"));

        Review review = repository
                .findByUser_UserIdAndDorama_DoramaId(userId, doramaId)
                .orElseGet(Review::new);

        review.setUser(user);
        review.setDorama(dorama);
        review.setContent(content);

        return mapper.toDto(repository.save(review));
    }

    public List<ReviewDto> getDoramaReviews(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        return mapper.toDtoList(repository.findByDorama_DoramaIdOrderByCreatedAtDesc(doramaId));
    }

    public List<ReviewDto> getUserReviews(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Пользователь не найден");
        }

        return mapper.toDtoList(repository.findByUser_UserIdOrderByCreatedAtDesc(userId));
    }

    public ReviewDto getUserReviewForDorama(Long userId, Long doramaId) {
        return mapper.toDto(
                repository.findByUser_UserIdAndDorama_DoramaId(userId, doramaId)
                        .orElseThrow(() -> new ResourceNotFoundException("Отзыв не найден"))
        );
    }

    public List<ReviewDto> searchReviews(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new BadRequestException("Текст для поиска обязателен");
        }

        return mapper.toDtoList(repository.searchByContent(text.trim()));
    }

    public Long getReviewCount(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        return repository.countByDorama_DoramaId(doramaId);
    }

    private void validateReview(Long userId, Long doramaId, String content) {
        if (userId == null) {
            throw new BadRequestException("ID пользователя обязателен");
        }

        if (doramaId == null) {
            throw new BadRequestException("ID дорамы обязателен");
        }

        if (content == null || content.trim().isEmpty()) {
            throw new BadRequestException("Текст отзыва обязателен");
        }
    }
}