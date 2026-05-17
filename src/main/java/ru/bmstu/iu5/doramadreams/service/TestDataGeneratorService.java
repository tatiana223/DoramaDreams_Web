package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.model.*;
import ru.bmstu.iu5.doramadreams.repository.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TestDataGeneratorService {

    private final UserRepository userRepository;
    private final DoramaRepository doramaRepository;
    private final RatingRepository ratingRepository;
    private final FavoriteRepository favoriteRepository;
    private final WatchHistoryRepository watchProgressRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    private final Random random = new Random();

    public String generate(int usersCount) {
        List<Dorama> doramas = doramaRepository.findAll();

        if (doramas.isEmpty()) {
            return "Сначала импортируй дорамы";
        }

        int createdUsers = 0;
        int createdRatings = 0;
        int createdFavorites = 0;
        int createdProgress = 0;

        for (int i = 1; i <= usersCount; i++) {
            String email = "testuser" + i + "@doramadreams.local";

            if (userRepository.existsByEmail(email)) {
                continue;
            }

            User user = new User();
            user.setUsername("testuser" + i);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode("password123"));

            userRepository.save(user);
            createdUsers++;

            Collections.shuffle(doramas);

            int interactionsCount = 15 + random.nextInt(36); // 15–50 дорам

            for (int j = 0; j < Math.min(interactionsCount, doramas.size()); j++) {
                Dorama dorama = doramas.get(j);

                int score = generateRating();

                Rating rating = new Rating();
                rating.setUser(user);
                rating.setDorama(dorama);
                rating.setScore(score);
                rating.setCreatedAt(LocalDateTime.now().minusDays(random.nextInt(365)));
                ratingRepository.save(rating);
                createdRatings++;

                WatchHistory progress = new WatchHistory();
                progress.setUser(user);
                progress.setDorama(dorama);
                progress.setLastEpisode(1 + random.nextInt(16));
                progress.setStatus(generateStatus(score));
                progress.setUpdatedAt(LocalDateTime.now().minusDays(random.nextInt(365)));
                watchProgressRepository.save(progress);
                createdProgress++;

                if (score >= 8 && random.nextDouble() < 0.45) {
                    Favorite favorite = new Favorite();
                    favorite.setUser(user);
                    favorite.setDorama(dorama);
                    favoriteRepository.save(favorite);
                    createdFavorites++;
                }
            }
        }

        return "Готово. Users: " + createdUsers
                + ", ratings: " + createdRatings
                + ", favorites: " + createdFavorites
                + ", progress: " + createdProgress;
    }

    private int generateRating() {
        double value = random.nextDouble();

        if (value < 0.08) return 4 + random.nextInt(2);   // 4–5
        if (value < 0.25) return 6 + random.nextInt(2);   // 6–7
        if (value < 0.75) return 8 + random.nextInt(2);   // 8–9
        return 10;
    }

    private WatchStatus generateStatus(int score) {
        if (score >= 9) {
            return random.nextDouble() < 0.65 ? WatchStatus.COMPLETED : WatchStatus.WATCHING;
        }

        if (score >= 7) {
            return random.nextDouble() < 0.55 ? WatchStatus.WATCHING : WatchStatus.COMPLETED;
        }

        if (score <= 5) {
            return random.nextDouble() < 0.7 ? WatchStatus.DROPPED : WatchStatus.WATCHING;
        }

        return WatchStatus.PLANNED;
    }
}