package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.WatchHistoryDto;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.WatchHistoryMapper;
import ru.bmstu.iu5.doramadreams.model.WatchHistory;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.WatchStatus;
import ru.bmstu.iu5.doramadreams.repository.WatchHistoryRepository;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WatchHistoryService {

    private final WatchHistoryRepository repository;
    private final UserRepository userRepository;
    private final DoramaRepository doramaRepository;
    private final WatchHistoryMapper mapper;

    public List<WatchHistoryDto> getUserHistory(Long userId) {
        return mapper.toDtoList(repository.findByUser_UserIdOrderByUpdatedAtDesc(userId));
    }

    public WatchHistoryDto updateOrCreateProgress(Long userId, Long doramaId, Integer episode, WatchStatus status) {
        Optional<WatchHistory> existingHistory = repository.findByUser_UserIdAndDorama_DoramaId(userId, doramaId);

        WatchHistory history;
        if (existingHistory.isPresent()) {
            history = existingHistory.get();
        } else {
            history = new WatchHistory();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
            Dorama dorama = doramaRepository.findById(doramaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Дорама не найдена"));
            history.setUser(user);
            history.setDorama(dorama);
        }

        history.setLastEpisode(episode);
        history.setStatus(status);
        history.setUpdatedAt(LocalDateTime.now());

        return mapper.toDto(repository.save(history));
    }

    public List<WatchHistoryDto> getUserHistoryByStatus(Long userId, WatchStatus status) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Пользователь не найден");
        }

        return mapper.toDtoList(
                repository.findByUser_UserIdAndStatusOrderByUpdatedAtDesc(userId, status)
        );
    }

    public List<WatchHistoryDto> getDoramaHistory(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        return mapper.toDtoList(
                repository.findByDorama_DoramaIdOrderByUpdatedAtDesc(doramaId)
        );
    }

    public void deleteHistoryRecord(Long userId, Long doramaId) {
        if (!repository.existsByUser_UserIdAndDorama_DoramaId(userId, doramaId)) {
            throw new ResourceNotFoundException("Запись истории не найдена");
        }

        repository.deleteByUser_UserIdAndDorama_DoramaId(userId, doramaId);
    }

    public Long getDoramaWatchCount(Long doramaId) {
        if (!doramaRepository.existsById(doramaId)) {
            throw new ResourceNotFoundException("Дорама не найдена");
        }

        return repository.countByDorama_DoramaId(doramaId);
    }
}