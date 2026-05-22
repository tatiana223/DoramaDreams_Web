package ru.bmstu.iu5.doramadreams.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TranslationService {

    private static final int MAX_CHUNK_LENGTH = 1_500;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public String translateEnglishToRussian(String text) {
        String normalized = normalize(text);

        if (normalized == null) {
            return null;
        }

        List<String> chunks = splitToChunks(normalized);
        StringBuilder result = new StringBuilder();

        for (String chunk : chunks) {
            String translatedChunk = translateChunk(chunk);

            if (translatedChunk != null && !translatedChunk.isBlank()) {
                if (!result.isEmpty()) {
                    result.append(" ");
                }
                result.append(translatedChunk.trim());
            }
        }

        String translated = normalize(result.toString());
        return translated != null ? translated : normalized;
    }

    private String translateChunk(String text) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://translate.googleapis.com/translate_a/single")
                    .queryParam("client", "gtx")
                    .queryParam("sl", "en")
                    .queryParam("tl", "ru")
                    .queryParam("dt", "t")
                    .queryParam("q", text)
                    .build()
                    .encode(StandardCharsets.UTF_8)
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode segments = root.path(0);

            if (!segments.isArray()) {
                return text;
            }

            StringBuilder translated = new StringBuilder();

            for (JsonNode segment : segments) {
                String value = segment.path(0).asText(null);
                if (value != null) {
                    translated.append(value);
                }
            }

            return translated.toString();
        } catch (Exception exception) {
            throw new IllegalStateException("Не удалось выполнить автоматический перевод", exception);
        }
    }

    private List<String> splitToChunks(String text) {
        List<String> chunks = new ArrayList<>();
        String[] parts = text.split("(?<=[.!?])\\s+");
        StringBuilder current = new StringBuilder();

        for (String part : parts) {
            if (part.length() > MAX_CHUNK_LENGTH) {
                flushChunk(chunks, current);
                splitLongPart(chunks, part);
                continue;
            }

            if (!current.isEmpty() && current.length() + part.length() + 1 > MAX_CHUNK_LENGTH) {
                flushChunk(chunks, current);
            }

            if (!current.isEmpty()) {
                current.append(" ");
            }
            current.append(part);
        }

        flushChunk(chunks, current);
        return chunks;
    }

    private void splitLongPart(List<String> chunks, String text) {
        int start = 0;

        while (start < text.length()) {
            int end = Math.min(start + MAX_CHUNK_LENGTH, text.length());
            chunks.add(text.substring(start, end));
            start = end;
        }
    }

    private void flushChunk(List<String> chunks, StringBuilder current) {
        if (!current.isEmpty()) {
            chunks.add(current.toString());
            current.setLength(0);
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank() || value.equals("null")) {
            return null;
        }

        return value.trim().replaceAll("\\s+", " ");
    }
}
