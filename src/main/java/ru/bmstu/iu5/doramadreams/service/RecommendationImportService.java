package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.model.UserRecommendation;
import ru.bmstu.iu5.doramadreams.repository.UserRecommendationRepository;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecommendationImportService {

    private final UserRecommendationRepository userRecommendationRepository;

    @Transactional
    public ImportResult importCsv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("CSV-файл с рекомендациями не загружен");
        }

        List<UserRecommendation> recommendations = new ArrayList<>();
        LocalDateTime importedAt = LocalDateTime.now();
        String detectedModelVersion = null;

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)
        )) {
            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.isBlank()) {
                throw new BadRequestException("CSV-файл пустой");
            }

            Map<String, Integer> header = parseHeader(headerLine);
            requireColumn(header, "user_id");
            requireColumn(header, "dorama_id");
            requireColumn(header, "score");
            requireColumn(header, "model_version");

            String line;
            int lineNumber = 1;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                if (line.isBlank()) {
                    continue;
                }

                String[] values = line.split(",", -1);

                try {
                    Long userId = Long.parseLong(getValue(values, header, "user_id"));
                    Long doramaId = Long.parseLong(getValue(values, header, "dorama_id"));
                    Double score = Double.parseDouble(getValue(values, header, "score"));
                    String modelVersion = getValue(values, header, "model_version");

                    if (modelVersion.isBlank()) {
                        throw new IllegalArgumentException("model_version is empty");
                    }

                    UserRecommendation recommendation = new UserRecommendation();
                    recommendation.setUserId(userId);
                    recommendation.setDoramaId(doramaId);
                    recommendation.setScore(score);
                    recommendation.setModelVersion(modelVersion);
                    recommendation.setCreatedAt(importedAt);
                    recommendations.add(recommendation);

                    if (detectedModelVersion == null) {
                        detectedModelVersion = modelVersion;
                    }
                } catch (RuntimeException ex) {
                    throw new BadRequestException("Ошибка в CSV на строке " + lineNumber + ": " + ex.getMessage());
                }
            }
        } catch (IOException ex) {
            throw new BadRequestException("Не удалось прочитать CSV-файл: " + ex.getMessage());
        }

        if (recommendations.isEmpty()) {
            throw new BadRequestException("CSV-файл не содержит рекомендаций");
        }

        userRecommendationRepository.deleteAllInBatch();
        userRecommendationRepository.saveAll(recommendations);

        return new ImportResult(
                recommendations.size(),
                detectedModelVersion,
                importedAt
        );
    }

    private Map<String, Integer> parseHeader(String headerLine) {
        String[] columns = headerLine.split(",", -1);
        Map<String, Integer> header = new HashMap<>();

        for (int i = 0; i < columns.length; i++) {
            header.put(columns[i].trim(), i);
        }

        return header;
    }

    private void requireColumn(Map<String, Integer> header, String column) {
        if (!header.containsKey(column)) {
            throw new BadRequestException("В CSV отсутствует обязательная колонка: " + column);
        }
    }

    private String getValue(String[] values, Map<String, Integer> header, String column) {
        int index = header.get(column);
        if (index >= values.length) {
            throw new IllegalArgumentException("missing value for column " + column);
        }
        return values[index].trim();
    }

    public record ImportResult(
            int importedRows,
            String modelVersion,
            LocalDateTime importedAt
    ) {
    }
}
