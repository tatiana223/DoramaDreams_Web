package ru.bmstu.iu5.doramadreams.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ru.bmstu.iu5.doramadreams.model.Actor;
import ru.bmstu.iu5.doramadreams.model.Country;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.Genre;
import ru.bmstu.iu5.doramadreams.model.Tag;
import ru.bmstu.iu5.doramadreams.repository.ActorRepository;
import ru.bmstu.iu5.doramadreams.repository.CountryRepository;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.GenreRepository;
import ru.bmstu.iu5.doramadreams.repository.TagRepository;

import java.io.ByteArrayInputStream;
import java.util.Locale;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TmdbImportService {

    private final DoramaRepository doramaRepository;
    private final CountryRepository countryRepository;
    private final GenreRepository genreRepository;
    private final ActorRepository actorRepository;
    private final TagRepository tagRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${tmdb.api-key}")
    private String tmdbApiKey;

    @Value("${minio.endpoint}")
    private String minioEndpoint;

    @Value("${minio.access-key}")
    private String minioAccessKey;

    @Value("${minio.secret-key}")
    private String minioSecretKey;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.public-url}")
    private String publicUrl;

    @Transactional
    public String importKoreanDoramas(int pages) {
        int imported = 0;
        int updated = 0;

        try {
            MinioClient minioClient = createMinioClient();
            createBucketIfNeeded(minioClient);

            Country korea = countryRepository.findByIsoCode("KR")
                    .orElseGet(() -> {
                        Country country = new Country();
                        country.setName("Южная Корея");
                        country.setIsoCode("KR");
                        return countryRepository.save(country);
                    });

            for (int page = 1; page <= pages; page++) {
                String discoverUrl = "https://api.themoviedb.org/3/discover/tv"
                        + "?api_key=" + tmdbApiKey
                        + "&language=ru-RU"
                        + "&sort_by=popularity.desc"
                        + "&with_origin_country=KR"
                        + "&include_adult=false"
                        + "&page=" + page;

                String response = restTemplate.getForObject(discoverUrl, String.class);
                JsonNode results = objectMapper.readTree(response).path("results");

                for (JsonNode item : results) {
                    Integer tmdbId = item.path("id").asInt();

                    Dorama dorama = doramaRepository.findByTmdbId(tmdbId)
                            .orElseGet(() -> {
                                Dorama newDorama = new Dorama();
                                newDorama.setTmdbId(tmdbId);
                                return newDorama;
                            });

                    boolean isNew = dorama.getDoramaId() == null;

                    dorama.setCountry(korea);
                    updateBasicFields(dorama, item);
                    fillDurationFromDetails(dorama, tmdbId);

                    dorama.getGenres().clear();
                    fillGenres(dorama, item);

                    dorama.getActors().clear();
                    fillActors(dorama, tmdbId);

                    dorama.getTags().clear();
                    fillHeuristicTags(dorama);
                    fillTagsFromTmdbKeywords(dorama, tmdbId);

                    String posterPath = item.path("poster_path").asText(null);
                    if (posterPath != null && !posterPath.equals("null")
                            && (dorama.getPosterUrl() == null || dorama.getPosterUrl().isBlank())) {
                        String posterUrl = uploadPosterToMinio(minioClient, tmdbId, posterPath);
                        dorama.setPosterUrl(posterUrl);
                    }

                    doramaRepository.save(dorama);

                    if (isNew) {
                        imported++;
                    } else {
                        updated++;
                    }
                }
            }

            return "Синхронизация завершена. Добавлено: " + imported + ", обновлено: " + updated;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Ошибка импорта дорам из TMDB", e);
        }
    }

    private void updateBasicFields(Dorama dorama, JsonNode item) {
        String title = item.path("name").asText(null);
        if (title != null && !title.isBlank()) {
            dorama.setTitle(title);
        }

        String originalTitle = item.path("original_name").asText(null);
        if (originalTitle != null && !originalTitle.isBlank()) {
            dorama.setOriginalTitle(originalTitle);
        }

        String description = item.path("overview").asText(null);
        if (description != null && !description.isBlank()) {
            dorama.setDescription(description);
        }

        String firstAirDate = item.path("first_air_date").asText("");
        if (firstAirDate.length() >= 4) {
            dorama.setReleaseYear(Integer.parseInt(firstAirDate.substring(0, 4)));
        }
    }

    private void fillDurationFromDetails(Dorama dorama, Integer tmdbId) throws Exception {
        String detailsUrl = "https://api.themoviedb.org/3/tv/" + tmdbId
                + "?api_key=" + tmdbApiKey
                + "&language=ru-RU";

        String detailsResponse = restTemplate.getForObject(detailsUrl, String.class);
        JsonNode details = objectMapper.readTree(detailsResponse);

        JsonNode runtimeArray = details.path("episode_run_time");

        if (runtimeArray.isArray() && runtimeArray.size() > 0) {
            dorama.setDuration(runtimeArray.get(0).asInt());
        }
    }

    private void fillGenres(Dorama dorama, JsonNode item) {
        JsonNode genreIds = item.path("genre_ids");

        if (!genreIds.isArray()) {
            return;
        }

        for (JsonNode genreIdNode : genreIds) {
            Integer tmdbGenreId = genreIdNode.asInt();

            genreRepository.findByTmdbId(tmdbGenreId)
                    .ifPresent(genre -> dorama.getGenres().add(genre));
        }
    }

    private void fillActors(Dorama dorama, Integer tmdbId) throws Exception {
        String creditsUrl = "https://api.themoviedb.org/3/tv/" + tmdbId + "/credits"
                + "?api_key=" + tmdbApiKey
                + "&language=ru-RU";

        String creditsResponse = restTemplate.getForObject(creditsUrl, String.class);
        JsonNode cast = objectMapper.readTree(creditsResponse).path("cast");

        if (!cast.isArray()) {
            return;
        }

        int limit = Math.min(cast.size(), 10);

        for (int i = 0; i < limit; i++) {
            JsonNode item = cast.get(i);
            String fullName = item.path("name").asText(null);

            if (fullName == null || fullName.isBlank()) {
                continue;
            }

            String profilePath = item.path("profile_path").asText(null);
            String photoUrl = null;

            if (profilePath != null && !profilePath.equals("null")) {
                photoUrl = "https://image.tmdb.org/t/p/w300" + profilePath;
            }

            String finalPhotoUrl = photoUrl;

            Actor actor = actorRepository.findByFullNameIgnoreCase(fullName)
                    .orElseGet(() -> {
                        Actor newActor = new Actor();
                        newActor.setFullName(fullName);
                        newActor.setPhotoUrl(finalPhotoUrl);
                        return actorRepository.save(newActor);
                    });

            if ((actor.getPhotoUrl() == null || actor.getPhotoUrl().isBlank()) && finalPhotoUrl != null) {
                actor.setPhotoUrl(finalPhotoUrl);
                actorRepository.save(actor);
            }

            dorama.getActors().add(actor);
        }
    }

    private void fillTagsFromTmdbKeywords(Dorama dorama, Integer tmdbId) throws Exception {
        String keywordsUrl = "https://api.themoviedb.org/3/tv/" + tmdbId + "/keywords"
                + "?api_key=" + tmdbApiKey;

        String keywordsResponse = restTemplate.getForObject(keywordsUrl, String.class);
        JsonNode root = objectMapper.readTree(keywordsResponse);
        JsonNode keywords = root.has("results") ? root.path("results") : root.path("keywords");

        if (!keywords.isArray()) {
            return;
        }

        int limit = Math.min(keywords.size(), 12);

        for (int i = 0; i < limit; i++) {
            String name = keywords.get(i).path("name").asText(null);
            addTag(dorama, name);
        }
    }

    private void fillHeuristicTags(Dorama dorama) {
        String text = String.join(" ",
                Objects.toString(dorama.getTitle(), ""),
                Objects.toString(dorama.getOriginalTitle(), ""),
                Objects.toString(dorama.getDescription(), ""),
                dorama.getGenres().stream().map(Genre::getName).reduce("", (a, b) -> a + " " + b)
        ).toLowerCase(Locale.ROOT);

        if (containsAny(text, "роман", "любов", "отношен")) addTag(dorama, "романтика");
        if (containsAny(text, "комеди", "юмор", "смешн")) addTag(dorama, "комедия");
        if (containsAny(text, "драма", "тяжел", "сложн")) addTag(dorama, "драма");
        if (containsAny(text, "триллер", "напряж", "опасн", "насили")) addTag(dorama, "напряженный сюжет");
        if (containsAny(text, "детектив", "расслед", "полици", "преступ", "убий", "серийн")) addTag(dorama, "расследование");
        if (containsAny(text, "криминал", "преступ", "мафи", "банд")) addTag(dorama, "криминал");
        if (containsAny(text, "месть", "отомст")) addTag(dorama, "месть");
        if (containsAny(text, "школ", "учен", "старшекласс", "университет", "студент")) addTag(dorama, "школа и учеба");
        if (containsAny(text, "доктор", "врач", "больниц", "хирург", "медиц")) addTag(dorama, "медицина");
        if (containsAny(text, "адвокат", "юрист", "прокурор", "суд", "закон")) addTag(dorama, "юристы и суд");
        if (containsAny(text, "офис", "компан", "секретар", "работ")) addTag(dorama, "офис");
        if (containsAny(text, "семь", "мать", "отец", "родител", "брат", "сестр")) addTag(dorama, "семья");
        if (containsAny(text, "истор", "чосон", "корол", "императ", "дворец")) addTag(dorama, "историческая");
        if (containsAny(text, "фэнтези", "маг", "демон", "призрак", "бог", "мистик", "вампир", "зомби")) addTag(dorama, "сверхъестественное");
        if (containsAny(text, "спорт", "бокс", "боец", "соревн")) addTag(dorama, "спорт");
        if (containsAny(text, "музык", "айдол", "пев", "групп", "концерт")) addTag(dorama, "музыка и айдолы");
        if (containsAny(text, "еда", "ресторан", "повар", "кухн")) addTag(dorama, "еда");
        if (containsAny(text, "выжив", "игра", "соревн", "долг", "деньги", "смерт")) addTag(dorama, "выживание");
        if (containsAny(text, "друж", "команд")) addTag(dorama, "дружба");
    }

    private boolean containsAny(String text, String... patterns) {
        for (String pattern : patterns) {
            if (text.contains(pattern)) {
                return true;
            }
        }

        return false;
    }

    private void addTag(Dorama dorama, String tagName) {
        if (tagName == null || tagName.isBlank()) {
            return;
        }

        String normalizedName = tagName.trim().toLowerCase(Locale.ROOT);

        if (normalizedName.length() > 80) {
            return;
        }

        Tag tag = tagRepository.findByNameIgnoreCase(normalizedName)
                .orElseGet(() -> {
                    Tag newTag = new Tag();
                    newTag.setName(normalizedName);
                    return tagRepository.save(newTag);
                });

        dorama.getTags().add(tag);
    }

    private MinioClient createMinioClient() {
        return MinioClient.builder()
                .endpoint(minioEndpoint)
                .credentials(minioAccessKey, minioSecretKey)
                .build();
    }

    private void createBucketIfNeeded(MinioClient minioClient) throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(bucket).build()
        );

        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(bucket).build()
            );
        }
    }

    private String uploadPosterToMinio(
            MinioClient minioClient,
            Integer tmdbId,
            String posterPath
    ) throws Exception {
        String imageUrl = "https://image.tmdb.org/t/p/w500" + posterPath;
        byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);

        if (imageBytes == null || imageBytes.length == 0) {
            return null;
        }

        String objectName = "posters/tmdb-" + tmdbId + ".jpg";

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(objectName)
                        .stream(new ByteArrayInputStream(imageBytes), imageBytes.length, -1)
                        .contentType("image/jpeg")
                        .build()
        );

        return publicUrl + "/" + bucket + "/" + objectName;
    }
}
