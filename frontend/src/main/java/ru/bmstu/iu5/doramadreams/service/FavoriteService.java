package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.model.Favorite;
import ru.bmstu.iu5.doramadreams.repository.FavoriteRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;

import java.util.List;

@Service
public class FavoriteService {
    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private DoramaRepository doramaRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DoramaDtoService doramaDtoService;

    public void addFavorite(Long userId, Long doramaId) {
        if (!favoriteRepository.existsByUser_UserIdAndDorama_DoramaId(userId, doramaId)) {
            Favorite fav = new Favorite();
            fav.setUser(userRepository.findById(userId).orElseThrow());
            fav.setDorama(doramaRepository.findById(doramaId).orElseThrow());
            favoriteRepository.save(fav);
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long doramaId) {
        favoriteRepository.deleteByUser_UserIdAndDorama_DoramaId(userId, doramaId);
    }

    public List<DoramaDto> getUserFavorites(Long userId) {
        return favoriteRepository.findByUser_UserId(userId).stream()
                .map(f -> doramaDtoService.toDto(f.getDorama()))
                .toList();
    }

    public List<DoramaDto> getMostFavoritedDoramas(int limit) {
        return doramaDtoService.toDtoList(
                favoriteRepository.findMostFavoritedDoramas(PageRequest.of(0, limit))
        );
    }

    public Long getFavoriteCount(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        return favoriteRepository.countByDorama_DoramaId(doramaId);
    }
}