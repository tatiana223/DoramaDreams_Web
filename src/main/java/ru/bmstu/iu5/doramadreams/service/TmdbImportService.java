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
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Set;
import java.util.HashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TmdbImportService {

    private final DoramaRepository doramaRepository;
    private final CountryRepository countryRepository;
    private final GenreRepository genreRepository;
    private final ActorRepository actorRepository;
    private final TagRepository tagRepository;
    private final TranslationService translationService;

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
        return importDoramasByCountry(pages, "Южная Корея", "KR");
    }

    @Transactional
    public String importChineseDoramas(int pages) {
        return importDoramasByCountry(pages, "Китай", "CN");
    }

    private String importDoramasByCountry(int pages, String countryName, String isoCode) {
        int imported = 0;
        int updated = 0;
        int skippedWithoutRussianTitle = 0;
        int failedItems = 0;
        int failedPages = 0;

        MinioClient minioClient = tryCreateMinioClient();

        Country countryEntity = countryRepository.findByIsoCodeIgnoreCase(isoCode)
                .orElseGet(() -> {
                    Country country = new Country();
                    country.setName(countryName);
                    country.setIsoCode(isoCode);
                    return countryRepository.save(country);
                });

        for (int page = 1; page <= pages; page++) {
            String discoverUrl = "https://api.themoviedb.org/3/discover/tv"
                    + "?api_key=" + tmdbApiKey
                    + "&language=ru-RU"
                    + "&sort_by=popularity.desc"
                    + "&with_origin_country=" + isoCode
                    + "&include_adult=false"
                    + "&page=" + page;

            JsonNode results;

            try {
                String response = restTemplate.getForObject(discoverUrl, String.class);
                results = objectMapper.readTree(response).path("results");

                if (!results.isArray()) {
                    failedPages++;
                    continue;
                }
            } catch (Exception e) {
                failedPages++;
                System.err.println("Не удалось загрузить страницу TMDB " + page + " для страны " + isoCode);
                e.printStackTrace();
                continue;
            }

            for (JsonNode item : results) {
                try {
                    String russianTitle = normalizeOptionalText(item.path("name").asText(null));
                    if (!isRussianDisplayText(russianTitle)) {
                        skippedWithoutRussianTitle++;
                        continue;
                    }

                    if (!item.path("id").isNumber()) {
                        failedItems++;
                        continue;
                    }

                    Integer tmdbId = item.path("id").asInt();

                    Dorama dorama = doramaRepository.findByTmdbId(tmdbId)
                            .orElseGet(() -> {
                                Dorama newDorama = new Dorama();
                                newDorama.setTmdbId(tmdbId);
                                return newDorama;
                            });

                    boolean isNew = dorama.getDoramaId() == null;

                    dorama.setCountry(countryEntity);
                    updateBasicFields(dorama, item);

                    try {
                        fillDurationFromDetails(dorama, tmdbId);
                    } catch (Exception e) {
                        System.err.println("Не удалось загрузить длительность TMDB ID " + tmdbId);
                        e.printStackTrace();
                    }

                    dorama.getGenres().clear();
                    fillGenres(dorama, item);

                    try {
                        fillActors(dorama, tmdbId);
                    } catch (Exception e) {
                        System.err.println("Не удалось загрузить актеров TMDB ID " + tmdbId);
                        e.printStackTrace();
                    }

                    dorama.getTags().clear();
                    fillHeuristicTags(dorama);

                    try {
                        fillTagsFromTmdbKeywords(dorama, tmdbId);
                    } catch (Exception e) {
                        System.err.println("Не удалось загрузить теги TMDB ID " + tmdbId);
                        e.printStackTrace();
                    }

                    String posterPath = item.path("poster_path").asText(null);
                    if (posterPath != null && !posterPath.isBlank() && !posterPath.equals("null")
                            && (dorama.getPosterUrl() == null || dorama.getPosterUrl().isBlank())) {
                        dorama.setPosterUrl(resolvePosterUrl(minioClient, tmdbId, posterPath));
                    }

                    doramaRepository.save(dorama);

                    if (isNew) {
                        imported++;
                    } else {
                        updated++;
                    }
                } catch (Exception e) {
                    failedItems++;
                    System.err.println("Не удалось импортировать отдельную дораму из TMDB для страны " + isoCode);
                    e.printStackTrace();
                }
            }
        }

        return "Синхронизация завершена (" + countryName + "). Добавлено: " + imported
                + ", обновлено: " + updated
                + ", пропущено без русского названия: " + skippedWithoutRussianTitle
                + ", ошибок записей: " + failedItems
                + ", ошибок страниц: " + failedPages;
    }

    private MinioClient tryCreateMinioClient() {
        try {
            MinioClient minioClient = createMinioClient();
            createBucketIfNeeded(minioClient);
            return minioClient;
        } catch (Exception e) {
            System.err.println("MinIO недоступен. Постеры будут сохранены прямыми ссылками TMDB.");
            e.printStackTrace();
            return null;
        }
    }

    private String resolvePosterUrl(MinioClient minioClient, Integer tmdbId, String posterPath) {
        if (posterPath == null || posterPath.isBlank() || posterPath.equals("null")) {
            return null;
        }

        if (minioClient == null) {
            return buildTmdbPosterUrl(posterPath);
        }

        try {
            String posterUrl = uploadPosterToMinio(minioClient, tmdbId, posterPath);
            return posterUrl != null ? posterUrl : buildTmdbPosterUrl(posterPath);
        } catch (Exception e) {
            System.err.println("Не удалось загрузить постер в MinIO для TMDB ID " + tmdbId + ". Используется ссылка TMDB.");
            e.printStackTrace();
            return buildTmdbPosterUrl(posterPath);
        }
    }

    private String buildTmdbPosterUrl(String posterPath) {
        if (posterPath == null || posterPath.isBlank() || posterPath.equals("null")) {
            return null;
        }

        return "https://image.tmdb.org/t/p/w500" + posterPath;
    }

    private void updateBasicFields(Dorama dorama, JsonNode item) {
        String title = normalizeOptionalText(item.path("name").asText(null));
        if (isRussianDisplayText(title)) {
            dorama.setTitle(title);
        }

        String originalTitle = normalizeOptionalText(item.path("original_name").asText(null));
        if (originalTitle != null && !hasAsianLetters(originalTitle)) {
            dorama.setOriginalTitle(originalTitle);
        } else if (originalTitle != null && hasAsianLetters(originalTitle)) {
            dorama.setOriginalTitle(null);
        }

        String description = normalizeOptionalText(item.path("overview").asText(null));
        if (description != null && (hasCyrillicLetters(description) || !hasAsianLetters(description))) {
            dorama.setDescription(description);
        }

        String firstAirDate = normalizeOptionalText(item.path("first_air_date").asText(null));
        if (firstAirDate != null && firstAirDate.length() >= 4) {
            try {
                dorama.setReleaseYear(Integer.parseInt(firstAirDate.substring(0, 4)));
            } catch (NumberFormatException ignored) {
                // У некоторых записей TMDB дата может прийти в неожиданном формате.
            }
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
        Map<Long, Actor> targetActors = new LinkedHashMap<>();

        for (int i = 0; i < limit; i++) {
            JsonNode item = cast.get(i);
            Long personId = item.path("id").isMissingNode() ? null : item.path("id").asLong();
            ActorImportData actorImportData = loadActorImportData(personId, item);
            String fullName = normalizeOptionalText(actorImportData.fullName());

            if (!isRussianDisplayText(fullName)) {
                continue;
            }

            Optional<Actor> existingActor = personId != null
                    ? actorRepository.findByTmdbId(personId)
                    : Optional.empty();

            Actor actor = existingActor
                    .or(() -> actorRepository.findByFullNameIgnoreCase(fullName))
                    .orElseGet(() -> {
                        Actor newActor = new Actor();
                        newActor.setFullName(fullName);
                        applyActorImportData(newActor, actorImportData, true);
                        return actorRepository.save(newActor);
                    });

            boolean actorChanged = false;
            if (!fullName.equals(actor.getFullName())) {
                actor.setFullName(fullName);
                actorChanged = true;
            }

            if (applyActorImportData(actor, actorImportData, false)) {
                actorChanged = true;
            }

            if (actorChanged) {
                actorRepository.save(actor);
            }

            if (actor.getActorId() != null) {
                targetActors.putIfAbsent(actor.getActorId(), actor);
            }
        }

        Set<Long> targetActorIds = targetActors.keySet();

        dorama.getActors().removeIf(actor ->
                actor.getActorId() != null && !targetActorIds.contains(actor.getActorId())
        );

        Set<Long> currentActorIds = new HashSet<>();
        dorama.getActors().forEach(actor -> {
            if (actor.getActorId() != null) {
                currentActorIds.add(actor.getActorId());
            }
        });

        targetActors.forEach((actorId, actor) -> {
            if (!currentActorIds.contains(actorId)) {
                dorama.getActors().add(actor);
            }
        });
    }

    private ActorImportData loadActorImportData(Long personId, JsonNode castItem) {
        String photoUrl = buildTmdbProfileUrl(castItem.path("profile_path").asText(null));
        String originalName = normalizeOptionalNonAsianText(castItem.path("original_name").asText(null));
        ActorImportData data = new ActorImportData(
                personId,
                null,
                normalizeOptionalText(castItem.path("name").asText(null)),
                originalName,
                photoUrl,
                null,
                null,
                null,
                null,
                null
        );

        if (personId == null || personId <= 0) {
            return data;
        }

        JsonNode russianDetails = loadPersonDetails(personId, "ru-RU");
        data = data.merge(fromPersonDetails(russianDetails));

        JsonNode englishDetails = loadPersonDetails(personId, "en-US");
        data = data.mergeMissing(fromPersonDetails(englishDetails));

        String translatedBiography = translateBiographyIfNeeded(data.biography());
        if (!Objects.equals(translatedBiography, data.biography())) {
            data = data.withBiography(translatedBiography);
        }

        return data;
    }

    private ActorImportData fromPersonDetails(JsonNode details) {
        return new ActorImportData(
                details.path("id").isMissingNode() ? null : details.path("id").asLong(),
                normalizeOptionalText(details.path("imdb_id").asText(null)),
                normalizeOptionalText(details.path("name").asText(null)),
                normalizeOptionalNonAsianText(details.path("original_name").asText(null)),
                buildTmdbProfileUrl(details.path("profile_path").asText(null)),
                parseDate(details.path("birthday").asText(null)),
                normalizeOptionalText(details.path("place_of_birth").asText(null)),
                normalizeOptionalText(details.path("known_for_department").asText(null)),
                details.path("popularity").isNumber() ? details.path("popularity").asDouble() : null,
                normalizeOptionalText(details.path("biography").asText(null))
        );
    }

    private JsonNode loadPersonDetails(Long personId, String language) {
        try {
            String personUrl = "https://api.themoviedb.org/3/person/" + personId
                    + "?api_key=" + tmdbApiKey
                    + "&language=" + language;

            String personResponse = restTemplate.getForObject(personUrl, String.class);
            return objectMapper.readTree(personResponse);
        } catch (Exception ignored) {
            return objectMapper.createObjectNode();
        }
    }

    private String translateBiographyIfNeeded(String biography) {
        String normalized = normalizeOptionalText(biography);

        if (normalized == null || hasCyrillicLetters(normalized) || !hasLatinLetters(normalized)) {
            return normalized;
        }

        try {
            return translationService.translateEnglishToRussian(normalized);
        } catch (Exception exception) {
            System.err.println("Не удалось автоматически перевести биографию актёра из TMDB");
            exception.printStackTrace();
            return normalized;
        }
    }

    private boolean applyActorImportData(Actor actor, ActorImportData data, boolean overwrite) {
        boolean changed = false;

        if (shouldSet(actor.getTmdbId(), overwrite) && data.tmdbId() != null) {
            actor.setTmdbId(data.tmdbId());
            changed = true;
        }

        if (shouldSet(actor.getImdbId(), overwrite) && data.imdbId() != null) {
            actor.setImdbId(data.imdbId());
            changed = true;
        }

        if (shouldSet(actor.getOriginalName(), overwrite) && data.originalName() != null) {
            actor.setOriginalName(data.originalName());
            changed = true;
        }

        if (shouldSet(actor.getPhotoUrl(), overwrite) && data.photoUrl() != null) {
            actor.setPhotoUrl(data.photoUrl());
            changed = true;
        }

        if (shouldSet(actor.getBirthDate(), overwrite) && data.birthDate() != null) {
            actor.setBirthDate(data.birthDate());
            changed = true;
        }

        if (shouldSet(actor.getPlaceOfBirth(), overwrite) && data.placeOfBirth() != null) {
            actor.setPlaceOfBirth(data.placeOfBirth());
            changed = true;
        }

        if (shouldSet(actor.getKnownForDepartment(), overwrite) && data.knownForDepartment() != null) {
            actor.setKnownForDepartment(data.knownForDepartment());
            changed = true;
        }

        if (shouldSet(actor.getPopularity(), overwrite) && data.popularity() != null) {
            actor.setPopularity(data.popularity());
            changed = true;
        }

        if (shouldSet(actor.getBiography(), overwrite) && data.biography() != null) {
            actor.setBiography(data.biography());
            changed = true;
        }

        return changed;
    }

    private boolean shouldSet(Object currentValue, boolean overwrite) {
        if (overwrite) {
            return true;
        }

        if (currentValue == null) {
            return true;
        }

        return currentValue instanceof String value && value.isBlank();
    }

    private boolean isRussianDisplayText(String value) {
        return value != null
                && !value.isBlank()
                && hasCyrillicLetters(value)
                && !hasAsianLetters(value);
    }

    private boolean hasCyrillicLetters(String value) {
        return value != null && value.codePoints()
                .anyMatch(codePoint -> Character.isLetter(codePoint)
                        && Character.UnicodeScript.of(codePoint) == Character.UnicodeScript.CYRILLIC);
    }

    private boolean hasLatinLetters(String value) {
        return value != null && value.codePoints()
                .anyMatch(codePoint -> Character.isLetter(codePoint)
                        && Character.UnicodeScript.of(codePoint) == Character.UnicodeScript.LATIN);
    }

    private boolean hasAsianLetters(String value) {
        return value.codePoints()
                .anyMatch(codePoint -> {
                    if (!Character.isLetter(codePoint)) {
                        return false;
                    }

                    Character.UnicodeScript script = Character.UnicodeScript.of(codePoint);
                    return script == Character.UnicodeScript.HANGUL
                            || script == Character.UnicodeScript.HAN
                            || script == Character.UnicodeScript.HIRAGANA
                            || script == Character.UnicodeScript.KATAKANA;
                });
    }

    private String buildTmdbProfileUrl(String profilePath) {
        if (profilePath == null || profilePath.isBlank() || profilePath.equals("null")) {
            return null;
        }

        return "https://image.tmdb.org/t/p/w300" + profilePath;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank() || value.equals("null")) {
            return null;
        }

        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank() || value.equals("null")) {
            return null;
        }

        return value.trim();
    }

    private String normalizeOptionalNonAsianText(String value) {
        String normalized = normalizeOptionalText(value);

        if (normalized == null || hasAsianLetters(normalized)) {
            return null;
        }

        return normalized;
    }

    private record ActorImportData(
            Long tmdbId,
            String imdbId,
            String fullName,
            String originalName,
            String photoUrl,
            LocalDate birthDate,
            String placeOfBirth,
            String knownForDepartment,
            Double popularity,
            String biography
    ) {
        ActorImportData withBiography(String biography) {
            return new ActorImportData(
                    tmdbId,
                    imdbId,
                    fullName,
                    originalName,
                    photoUrl,
                    birthDate,
                    placeOfBirth,
                    knownForDepartment,
                    popularity,
                    biography
            );
        }

        ActorImportData merge(ActorImportData other) {
            return new ActorImportData(
                    firstNotNull(other.tmdbId, tmdbId),
                    firstNotNull(other.imdbId, imdbId),
                    firstNotNull(other.fullName, fullName),
                    firstNotNull(other.originalName, originalName),
                    firstNotNull(other.photoUrl, photoUrl),
                    firstNotNull(other.birthDate, birthDate),
                    firstNotNull(other.placeOfBirth, placeOfBirth),
                    firstNotNull(other.knownForDepartment, knownForDepartment),
                    firstNotNull(other.popularity, popularity),
                    firstNotNull(other.biography, biography)
            );
        }

        ActorImportData mergeMissing(ActorImportData other) {
            return new ActorImportData(
                    firstNotNull(tmdbId, other.tmdbId),
                    firstNotNull(imdbId, other.imdbId),
                    firstNotNull(fullName, other.fullName),
                    firstNotNull(originalName, other.originalName),
                    firstNotNull(photoUrl, other.photoUrl),
                    firstNotNull(birthDate, other.birthDate),
                    firstNotNull(placeOfBirth, other.placeOfBirth),
                    firstNotNull(knownForDepartment, other.knownForDepartment),
                    firstNotNull(popularity, other.popularity),
                    firstNotNull(biography, other.biography)
            );
        }

        private static <T> T firstNotNull(T first, T second) {
            return first != null ? first : second;
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
        if (tagName == null || tagName.isBlank() || hasAsianLetters(tagName)) {
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
