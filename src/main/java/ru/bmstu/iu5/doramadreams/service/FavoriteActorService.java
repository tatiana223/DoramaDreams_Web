package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.ActorDto;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.ActorMapper;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.model.FavoriteActor;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.repository.ActorRepository;
import ru.bmstu.iu5.doramadreams.repository.FavoriteActorRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteActorService {

    private final FavoriteActorRepository favoriteActorRepository;
    private final ActorRepository actorRepository;
    private final UserRepository userRepository;
    private final ActorMapper actorMapper;

    public List<ActorDto> getUserFavoriteActors(Long userId) {
        return favoriteActorRepository.findByUser_UserId(userId).stream()
                .map(FavoriteActor::getActor)
                .map(actorMapper::toDto)
                .toList();
    }

    public void addFavoriteActor(Long userId, Long actorId) {
        if (favoriteActorRepository.existsByUser_UserIdAndActor_ActorId(userId, actorId)) {
            return;
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
        Actor actor = actorRepository.findById(actorId)
                .orElseThrow(() -> new ResourceNotFoundException("Актёр не найден"));

        FavoriteActor favoriteActor = new FavoriteActor();
        favoriteActor.setUser(user);
        favoriteActor.setActor(actor);
        favoriteActorRepository.save(favoriteActor);
    }

    @Transactional
    public void removeFavoriteActor(Long userId, Long actorId) {
        favoriteActorRepository.deleteByUser_UserIdAndActor_ActorId(userId, actorId);
    }

    public Long getFavoriteCount(Long actorId) {
        if (!actorRepository.existsById(actorId)) {
            throw new ResourceNotFoundException("Актёр не найден");
        }

        return favoriteActorRepository.countByActor_ActorId(actorId);
    }
}
