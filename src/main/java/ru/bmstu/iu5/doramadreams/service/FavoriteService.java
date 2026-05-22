package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.model.Favorite;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.FavoriteRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

import java.util.List;

@Service
public class FavoriteService {
    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private DoramaRepository doramaRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private DoramaDtoService doramaDtoService;

    public void addFavorite(Long userId, Long doramaId) {
        if (!favoriteRepository.existsByUser_UserIdAndDorama_DoramaId(userId, doramaId)) {
            Favorite favorite = new Favorite();
            favorite.setUser(userRepository.findById(userId).orElseThrow());
            favorite.setDorama(doramaRepository.findById(doramaId).orElseThrow());
            favoriteRepository.save(favorite);
        }
    }

    @Transactional
    public void removeFavorite(Long userId, Long doramaId) {
        favoriteRepository.deleteByUser_UserIdAndDorama_DoramaId(userId, doramaId);
    }

    public List<DoramaDto> getUserFavorites(Long userId) {
        return favoriteRepository.findByUser_UserId(userId).stream()
                .map(favorite -> doramaDtoService.toDto(favorite.getDorama()))
                .toList();
    }
}
