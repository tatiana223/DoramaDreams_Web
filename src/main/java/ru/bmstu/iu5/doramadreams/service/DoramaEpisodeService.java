package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaEpisodeBulkItem;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaEpisodeBulkRequest;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaEpisodeBulkResult;
import ru.bmstu.iu5.doramadreams.dto.AdminDoramaEpisodeRequest;
import ru.bmstu.iu5.doramadreams.dto.DoramaEpisodeDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.DoramaEpisode;
import ru.bmstu.iu5.doramadreams.repository.DoramaEpisodeRepository;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoramaEpisodeService {

    private final DoramaEpisodeRepository doramaEpisodeRepository;
    private final DoramaRepository doramaRepository;

    @Transactional(readOnly = true)
    public List<DoramaEpisodeDto> getEpisodesByDorama(Long doramaId) {
        return doramaEpisodeRepository.findByDorama_DoramaIdOrderByEpisodeNumberAsc(doramaId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DoramaEpisodeDto getEpisodeByNumber(Long doramaId, Integer episodeNumber) {
        return doramaEpisodeRepository.findByDorama_DoramaIdAndEpisodeNumber(doramaId, episodeNumber)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Серия не найдена"));
    }

    @Transactional
    public DoramaEpisodeDto createEpisode(AdminDoramaEpisodeRequest request) {
        validateRequest(request);

        if (doramaEpisodeRepository.existsByDorama_DoramaIdAndEpisodeNumber(
                request.getDoramaId(),
                request.getEpisodeNumber()
        )) {
            throw new BadRequestException("У этой дорамы уже есть серия с таким номером");
        }

        Dorama dorama = findDorama(request.getDoramaId());

        DoramaEpisode episode = new DoramaEpisode();
        episode.setDorama(dorama);
        episode.setEpisodeNumber(request.getEpisodeNumber());
        episode.setTitle(normalizeTitle(request.getTitle()));
        episode.setVideoUrl(normalizeVideoUrl(request.getVideoUrl()));

        return toDto(doramaEpisodeRepository.save(episode));
    }

    @Transactional
    public AdminDoramaEpisodeBulkResult importEpisodes(AdminDoramaEpisodeBulkRequest request) {
        if (request == null || request.getDoramaId() == null) {
            throw new BadRequestException("Дорама обязательна");
        }

        Dorama dorama = findDorama(request.getDoramaId());
        List<DoramaEpisode> existingEpisodes = doramaEpisodeRepository
                .findByDorama_DoramaIdOrderByEpisodeNumberAsc(dorama.getDoramaId());

        int nextEpisodeNumber = request.getStartEpisodeNumber() != null
                ? request.getStartEpisodeNumber()
                : existingEpisodes.stream()
                        .map(DoramaEpisode::getEpisodeNumber)
                        .max(Integer::compareTo)
                        .orElse(0) + 1;

        if (nextEpisodeNumber < 1) {
            throw new BadRequestException("Начальный номер серии должен быть больше 0");
        }

        List<BulkEpisodeRow> rows = collectBulkRows(request, nextEpisodeNumber);

        if (rows.isEmpty()) {
            throw new BadRequestException("Добавь хотя бы одну ссылку или iframe-код");
        }

        boolean overwriteExisting = Boolean.TRUE.equals(request.getOverwriteExisting());
        AdminDoramaEpisodeBulkResult result = new AdminDoramaEpisodeBulkResult();

        for (BulkEpisodeRow row : rows) {
            try {
                if (row.episodeNumber() == null || row.episodeNumber() < 1) {
                    result.getErrors().add("Строка " + row.sourceLine() + ": номер серии должен быть больше 0");
                    continue;
                }

                if (row.videoUrl() == null || row.videoUrl().isBlank()) {
                    result.getErrors().add("Строка " + row.sourceLine() + ": ссылка на видео пустая");
                    continue;
                }

                String normalizedUrl = normalizeVideoUrl(row.videoUrl());
                String normalizedTitle = normalizeTitle(row.title());

                DoramaEpisode episode = doramaEpisodeRepository
                        .findByDorama_DoramaIdAndEpisodeNumber(dorama.getDoramaId(), row.episodeNumber())
                        .orElse(null);

                if (episode != null && !overwriteExisting) {
                    result.setSkippedCount(result.getSkippedCount() + 1);
                    result.getSkipped().add("Серия " + row.episodeNumber() + " уже существует");
                    continue;
                }

                boolean isUpdate = episode != null;

                if (episode == null) {
                    episode = new DoramaEpisode();
                    episode.setDorama(dorama);
                    episode.setEpisodeNumber(row.episodeNumber());
                }

                episode.setTitle(normalizedTitle);
                episode.setVideoUrl(normalizedUrl);

                DoramaEpisode saved = doramaEpisodeRepository.save(episode);
                result.getEpisodes().add(toDto(saved));

                if (isUpdate) {
                    result.setUpdatedCount(result.getUpdatedCount() + 1);
                } else {
                    result.setCreatedCount(result.getCreatedCount() + 1);
                }
            } catch (Exception exception) {
                result.getErrors().add("Строка " + row.sourceLine() + ": " + exception.getMessage());
            }
        }

        result.setFailedCount(result.getErrors().size());
        return result;
    }

    @Transactional
    public DoramaEpisodeDto updateEpisode(Long episodeId, AdminDoramaEpisodeRequest request) {
        DoramaEpisode episode = doramaEpisodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Серия не найдена"));

        if (request.getDoramaId() != null && !request.getDoramaId().equals(episode.getDorama().getDoramaId())) {
            Dorama dorama = findDorama(request.getDoramaId());
            episode.setDorama(dorama);
        }

        if (request.getEpisodeNumber() != null) {
            if (request.getEpisodeNumber() < 1) {
                throw new BadRequestException("Номер серии должен быть больше 0");
            }

            doramaEpisodeRepository
                    .findByDorama_DoramaIdAndEpisodeNumber(
                            episode.getDorama().getDoramaId(),
                            request.getEpisodeNumber()
                    )
                    .filter(existing -> !existing.getEpisodeId().equals(episodeId))
                    .ifPresent(existing -> {
                        throw new BadRequestException("У этой дорамы уже есть серия с таким номером");
                    });

            episode.setEpisodeNumber(request.getEpisodeNumber());
        }

        if (request.getTitle() != null) {
            episode.setTitle(normalizeTitle(request.getTitle()));
        }

        if (request.getVideoUrl() != null) {
            episode.setVideoUrl(normalizeVideoUrl(request.getVideoUrl()));
        }

        return toDto(doramaEpisodeRepository.save(episode));
    }

    @Transactional
    public void deleteEpisode(Long episodeId) {
        DoramaEpisode episode = doramaEpisodeRepository.findById(episodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Серия не найдена"));

        doramaEpisodeRepository.delete(episode);
    }

    private List<BulkEpisodeRow> collectBulkRows(AdminDoramaEpisodeBulkRequest request, int startEpisodeNumber) {
        List<BulkEpisodeRow> rows = new ArrayList<>();
        int[] nextNumber = {startEpisodeNumber};

        if (request.getEpisodes() != null) {
            for (int index = 0; index < request.getEpisodes().size(); index++) {
                AdminDoramaEpisodeBulkItem item = request.getEpisodes().get(index);

                if (item == null) {
                    continue;
                }

                Integer episodeNumber = item.getEpisodeNumber();

                if (episodeNumber == null) {
                    episodeNumber = nextNumber[0]++;
                } else if (episodeNumber >= nextNumber[0]) {
                    nextNumber[0] = episodeNumber + 1;
                }

                rows.add(new BulkEpisodeRow(
                        episodeNumber,
                        item.getTitle(),
                        item.getVideoUrl(),
                        "JSON #" + (index + 1)
                ));
            }
        }

        if (request.getRawText() != null && !request.getRawText().isBlank()) {
            String[] lines = request.getRawText().split("\\R");

            for (int index = 0; index < lines.length; index++) {
                String line = lines[index] == null ? "" : lines[index].trim();

                if (line.isBlank()) {
                    continue;
                }

                BulkEpisodeRow row = parseRawLine(line, nextNumber[0], index + 1);
                rows.add(row);

                if (row.episodeNumber() >= nextNumber[0]) {
                    nextNumber[0] = row.episodeNumber() + 1;
                }
            }
        }

        return rows;
    }

    private BulkEpisodeRow parseRawLine(String line, int fallbackEpisodeNumber, int sourceLine) {
        String[] parts = splitBulkLine(line);

        if (parts.length == 1) {
            return new BulkEpisodeRow(fallbackEpisodeNumber, null, parts[0].trim(), String.valueOf(sourceLine));
        }

        if (parts.length == 2) {
            Integer episodeNumber = parseEpisodeNumber(parts[0]);

            if (episodeNumber != null) {
                return new BulkEpisodeRow(episodeNumber, null, parts[1].trim(), String.valueOf(sourceLine));
            }

            return new BulkEpisodeRow(fallbackEpisodeNumber, parts[0].trim(), parts[1].trim(), String.valueOf(sourceLine));
        }

        Integer episodeNumber = parseEpisodeNumber(parts[0]);
        int resolvedNumber = episodeNumber != null ? episodeNumber : fallbackEpisodeNumber;
        return new BulkEpisodeRow(resolvedNumber, parts[1].trim(), parts[2].trim(), String.valueOf(sourceLine));
    }

    private String[] splitBulkLine(String line) {
        if (line.contains("|")) {
            return line.split("\\|", 3);
        }

        if (line.contains("	")) {
            return line.split("\t", 3);
        }

        return new String[]{line};
    }

    private Integer parseEpisodeNumber(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();

        if (normalized.toLowerCase().startsWith("серия")) {
            normalized = normalized.replaceAll("(?iu)^серия\\s*", "");
        }

        try {
            return Integer.parseInt(normalized);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private void validateRequest(AdminDoramaEpisodeRequest request) {
        if (request.getDoramaId() == null) {
            throw new BadRequestException("Дорама обязательна");
        }

        if (request.getEpisodeNumber() == null || request.getEpisodeNumber() < 1) {
            throw new BadRequestException("Номер серии должен быть больше 0");
        }

        if (request.getVideoUrl() == null || request.getVideoUrl().isBlank()) {
            throw new BadRequestException("Ссылка на видео обязательна");
        }
    }

    private Dorama findDorama(Long doramaId) {
        return doramaRepository.findById(doramaId)
                .orElseThrow(() -> new ResourceNotFoundException("Дорама не найдена"));
    }

    private String normalizeTitle(String title) {
        if (title == null || title.isBlank()) {
            return null;
        }

        return title.trim();
    }

    private String normalizeVideoUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new BadRequestException("Ссылка на видео обязательна");
        }

        String url = extractSrcFromIframeIfNeeded(rawUrl.trim());
        url = url.replace("&amp;", "&").trim();

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            throw new BadRequestException("Ссылка на видео должна начинаться с http:// или https:// либо быть iframe-кодом");
        }

        return convertKnownVideoUrlToEmbed(url);
    }

    private String extractSrcFromIframeIfNeeded(String rawValue) {
        String value = rawValue.trim();

        if (!value.toLowerCase().startsWith("<iframe")) {
            return value;
        }

        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
                "src\\s*=\\s*[\"']([^\"']+)[\"']",
                java.util.regex.Pattern.CASE_INSENSITIVE
        );

        java.util.regex.Matcher matcher = pattern.matcher(value);

        if (!matcher.find()) {
            throw new BadRequestException("В iframe не найден атрибут src");
        }

        return matcher.group(1);
    }

    private String convertKnownVideoUrlToEmbed(String url) {
        try {
            java.net.URI uri = java.net.URI.create(url);
            String host = uri.getHost();

            if (host == null) {
                return url;
            }

            if (host.contains("youtube.com")) {
                String query = uri.getQuery();

                if (query != null) {
                    for (String param : query.split("&")) {
                        String[] pair = param.split("=", 2);

                        if (pair.length == 2 && pair[0].equals("v")) {
                            return "https://www.youtube.com/embed/" + pair[1];
                        }
                    }
                }

                if (uri.getPath() != null && uri.getPath().startsWith("/embed/")) {
                    return url;
                }
            }

            if (host.contains("youtu.be")) {
                String path = uri.getPath();

                if (path != null && path.length() > 1) {
                    return "https://www.youtube.com/embed/" + path.substring(1);
                }
            }

            if (
                    host.contains("vkvideo.ru")
                            || host.contains("vk.com")
                            || host.contains("vk.ru")
            ) {
                return url;
            }

            return url;
        } catch (Exception exception) {
            return url;
        }
    }

    private DoramaEpisodeDto toDto(DoramaEpisode episode) {
        return new DoramaEpisodeDto(
                episode.getEpisodeId(),
                episode.getDorama().getDoramaId(),
                episode.getDorama().getTitle(),
                episode.getEpisodeNumber(),
                episode.getTitle(),
                episode.getVideoUrl(),
                episode.getCreatedAt(),
                episode.getUpdatedAt()
        );
    }

    private record BulkEpisodeRow(Integer episodeNumber, String title, String videoUrl, String sourceLine) {
    }
}
