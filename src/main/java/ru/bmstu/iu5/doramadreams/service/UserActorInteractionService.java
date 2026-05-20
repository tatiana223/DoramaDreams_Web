package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.dto.ActorInteractionStatsDto;
import ru.bmstu.iu5.doramadreams.dto.UserActorInteractionDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ForbiddenException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.ActorMapper;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.model.UserActorInteraction;
import ru.bmstu.iu5.doramadreams.model.UserActorInteractionType;
import ru.bmstu.iu5.doramadreams.model.UserRole;
import ru.bmstu.iu5.doramadreams.repository.ActorRepository;
import ru.bmstu.iu5.doramadreams.repository.UserActorInteractionRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserActorInteractionService {

    private static final int MAX_COMMENT_LENGTH = 1000;

    private final UserActorInteractionRepository interactionRepository;
    private final ActorRepository actorRepository;
    private final UserRepository userRepository;
    private final ActorMapper actorMapper;

    @Transactional(readOnly = true)
    public List<UserActorInteractionDto> getUserInteractions(Long userId) {
        return interactionRepository.findByUser_UserId(userId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ActorDto> getUserFavoriteActors(Long userId) {
        return interactionRepository
                .findByUser_UserIdAndInteractionType(userId, UserActorInteractionType.FAVORITE)
                .stream()
                .map(UserActorInteraction::getActor)
                .map(actorMapper::toDto)
                .toList();
    }

    @Transactional
    public void addFavoriteActor(Long userId, Long actorId) {
        if (interactionRepository.existsByUser_UserIdAndActor_ActorIdAndInteractionType(
                userId,
                actorId,
                UserActorInteractionType.FAVORITE
        )) {
            return;
        }

        interactionRepository.save(createInteraction(userId, actorId, UserActorInteractionType.FAVORITE));
    }

    @Transactional
    public void removeFavoriteActor(Long userId, Long actorId) {
        interactionRepository.deleteByUser_UserIdAndActor_ActorIdAndInteractionType(
                userId,
                actorId,
                UserActorInteractionType.FAVORITE
        );
    }

    @Transactional(readOnly = true)
    public Long getFavoriteCount(Long actorId) {
        ensureActorExists(actorId);
        return interactionRepository.countByActor_ActorIdAndInteractionType(actorId, UserActorInteractionType.FAVORITE);
    }

    @Transactional
    public UserActorInteractionDto rateActor(Long userId, Long actorId, Integer rating) {
        if (rating == null || rating < 1 || rating > 10) {
            throw new BadRequestException("Оценка актёра должна быть от 1 до 10");
        }

        UserActorInteraction interaction = interactionRepository
                .findFirstByUser_UserIdAndActor_ActorIdAndInteractionType(
                        userId,
                        actorId,
                        UserActorInteractionType.RATING
                )
                .orElseGet(() -> createInteraction(userId, actorId, UserActorInteractionType.RATING));

        interaction.setRating(rating);
        interaction.setCommentText(null);

        return toDto(interactionRepository.save(interaction));
    }

    @Transactional(readOnly = true)
    public Optional<Integer> getMyActorRating(Long userId, Long actorId) {
        ensureActorExists(actorId);
        return interactionRepository
                .findFirstByUser_UserIdAndActor_ActorIdAndInteractionType(
                        userId,
                        actorId,
                        UserActorInteractionType.RATING
                )
                .map(UserActorInteraction::getRating);
    }

    @Transactional
    public UserActorInteractionDto addComment(Long userId, Long actorId, String commentText) {
        String normalizedComment = normalizeComment(commentText);

        UserActorInteraction interaction = createInteraction(userId, actorId, UserActorInteractionType.COMMENT);
        interaction.setCommentText(normalizedComment);
        interaction.setRating(null);

        return toDto(interactionRepository.save(interaction));
    }

    @Transactional(readOnly = true)
    public List<UserActorInteractionDto> getActorComments(Long actorId) {
        ensureActorExists(actorId);
        return interactionRepository
                .findByActor_ActorIdAndInteractionTypeOrderByCreatedAtDesc(actorId, UserActorInteractionType.COMMENT)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void deleteComment(Long userId, Long interactionId) {
        if (userId == null) {
            throw new BadRequestException("ID пользователя обязателен");
        }

        UserActorInteraction interaction = interactionRepository.findById(interactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Комментарий не найден"));

        if (!UserActorInteractionType.COMMENT.equals(interaction.getInteractionType())) {
            throw new BadRequestException("Можно удалить только комментарий");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        boolean isAuthor = interaction.getUser() != null
                && interaction.getUser().getUserId() != null
                && interaction.getUser().getUserId().equals(userId);
        boolean isAdmin = UserRole.ADMIN.equals(user.getRole());

        if (!isAuthor && !isAdmin) {
            throw new ForbiddenException("Можно удалить только свой комментарий");
        }

        interactionRepository.delete(interaction);
    }

    @Transactional
    public void recordView(Long userId, Long actorId) {
        interactionRepository.save(createInteraction(userId, actorId, UserActorInteractionType.VIEW));
    }

    @Transactional(readOnly = true)
    public ActorInteractionStatsDto getActorStats(Long actorId) {
        ensureActorExists(actorId);

        Long favoritesCount = interactionRepository.countByActor_ActorIdAndInteractionType(actorId, UserActorInteractionType.FAVORITE);
        Long ratingsCount = interactionRepository.countByActor_ActorIdAndInteractionTypeAndRatingIsNotNull(actorId, UserActorInteractionType.RATING);
        Double averageRating = interactionRepository.findAverageRatingByActorId(actorId);
        Long commentsCount = interactionRepository.countByActor_ActorIdAndInteractionType(actorId, UserActorInteractionType.COMMENT);
        Long viewsCount = interactionRepository.countByActor_ActorIdAndInteractionType(actorId, UserActorInteractionType.VIEW);

        return new ActorInteractionStatsDto(
                favoritesCount,
                ratingsCount,
                averageRating == null ? null : Math.round(averageRating * 10.0) / 10.0,
                commentsCount,
                viewsCount
        );
    }

    @Transactional
    public void deleteActorInteractions(Long actorId) {
        interactionRepository.deleteByActor_ActorId(actorId);
    }

    private UserActorInteraction createInteraction(Long userId, Long actorId, UserActorInteractionType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр не найден"));

        UserActorInteraction interaction = new UserActorInteraction();
        interaction.setUser(user);
        interaction.setActor(actor);
        interaction.setInteractionType(type);
        return interaction;
    }

    private void ensureActorExists(Long actorId) {
        if (!actorRepository.existsById(actorId)) {
            throw new ResourceNotFoundException("Актёр не найден");
        }
    }

    private String normalizeComment(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Комментарий не может быть пустым");
        }

        String normalized = value.trim();
        if (normalized.length() > MAX_COMMENT_LENGTH) {
            throw new BadRequestException("Комментарий не должен быть длиннее " + MAX_COMMENT_LENGTH + " символов");
        }

        return normalized;
    }

    private UserActorInteractionDto toDto(UserActorInteraction interaction) {
        UserActorInteractionDto dto = new UserActorInteractionDto();
        dto.setInteractionId(interaction.getInteractionId());
        dto.setInteractionType(interaction.getInteractionType());
        dto.setRating(interaction.getRating());
        dto.setCommentText(interaction.getCommentText());
        dto.setCreatedAt(interaction.getCreatedAt());
        dto.setUpdatedAt(interaction.getUpdatedAt());

        if (interaction.getUser() != null) {
            dto.setUserId(interaction.getUser().getUserId());
            dto.setUsername(interaction.getUser().getUsername());
        }

        if (interaction.getActor() != null) {
            dto.setActorId(interaction.getActor().getActorId());
            dto.setActorName(interaction.getActor().getFullName());
        }

        return dto;
    }
}
