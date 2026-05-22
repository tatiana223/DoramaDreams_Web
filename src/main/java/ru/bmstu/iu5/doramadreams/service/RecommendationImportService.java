package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.bmstu.iu5.doramadreams.dto.RecommendationImportResponse;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.model.UserRecommendation;
import ru.bmstu.iu5.doramadreams.repository.UserRecommendationRepository;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationImportService {

    private final UserRecommendationRepository userRecommendationRepository;

    @Transactional
    public RecommendationImportResponse importCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CSV-файл с рекомендациями не выбран");
        }

        LocalDateTime importedAt = LocalDateTime.now();
        List<UserRecommendation> recommendations = new ArrayList<>();
        String detectedModelVersion = null;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
        )) {
            String line;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                if (line.isBlank()) {
                    continue;
                }

                if (lineNumber == 1 && line.toLowerCase().startsWith("user_id,")) {
                    continue;
                }

                String[] parts = line.split(",", -1);

                if (parts.length < 4) {
                    throw new BadRequestException(
                            "Некорректная строка CSV №" + lineNumber
                                    + ": ожидаются user_id,dorama_id,score,model_version"
                    );
                }

                Long userId = parseLong(parts[0], "user_id", lineNumber);
                Long doramaId = parseLong(parts[1], "dorama_id", lineNumber);
                Double score = parseDouble(parts[2], "score", lineNumber);
                String modelVersion = parts[3].trim();

                if (modelVersion.isBlank()) {
                    throw new BadRequestException("Пустой model_version в строке CSV №" + lineNumber);
                }

                if (detectedModelVersion == null) {
                    detectedModelVersion = modelVersion;
                }

                UserRecommendation recommendation = new UserRecommendation();
                recommendation.setUserId(userId);
                recommendation.setDoramaId(doramaId);
                recommendation.setScore(score);
                recommendation.setModelVersion(modelVersion);
                recommendation.setCreatedAt(importedAt);

                recommendations.add(recommendation);
            }
        } catch (BadRequestException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BadRequestException("Не удалось прочитать CSV-файл: " + exception.getMessage());
        }

        if (recommendations.isEmpty()) {
            throw new BadRequestException("CSV-файл не содержит рекомендаций");
        }

        userRecommendationRepository.deleteAllInBatch();
        userRecommendationRepository.saveAll(recommendations);

        return new RecommendationImportResponse(
                recommendations.size(),
                detectedModelVersion,
                importedAt
        );
    }

    private Long parseLong(String rawValue, String column, int lineNumber) {
        try {
            return Long.parseLong(rawValue.trim());
        } catch (NumberFormatException exception) {
            throw new BadRequestException("Некорректное значение " + column + " в строке CSV №" + lineNumber);
        }
    }

    private Double parseDouble(String rawValue, String column, int lineNumber) {
        try {
            return Double.parseDouble(rawValue.trim());
        } catch (NumberFormatException exception) {
            throw new BadRequestException("Некорректное значение " + column + " в строке CSV №" + lineNumber);
        }
    }
}