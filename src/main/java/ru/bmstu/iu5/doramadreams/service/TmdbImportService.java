package ru.bmstu.iu5.doramadreams.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import ru.bmstu.iu5.doramadreams.model.Country;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.repository.CountryRepository;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.GenreRepository;

import java.io.ByteArrayInputStream;

@Service
@RequiredArgsConstructor
public class TmdbImportService {

    private final DoramaRepository doramaRepository;
    private final CountryRepository countryRepository;
    private final GenreRepository genreRepository;

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

    public String importKoreanDoramas(int pages) {
        int imported = 0;
        int skipped = 0;

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

                    if (doramaRepository.existsByTmdbId(tmdbId)) {
                        skipped++;
                        continue;
                    }

                    Dorama dorama = new Dorama();
                    dorama.setTmdbId(tmdbId);
                    dorama.setCountry(korea);

                    dorama.setTitle(item.path("name").asText());
                    dorama.setOriginalTitle(item.path("original_name").asText());
                    dorama.setDescription(item.path("overview").asText());

                    String firstAirDate = item.path("first_air_date").asText("");
                    if (firstAirDate.length() >= 4) {
                        dorama.setReleaseYear(Integer.parseInt(firstAirDate.substring(0, 4)));
                    }

                    fillDurationFromDetails(dorama, tmdbId);
                    fillGenres(dorama, item);

                    String posterPath = item.path("poster_path").asText(null);
                    if (posterPath != null && !posterPath.equals("null")) {
                        String posterUrl = uploadPosterToMinio(minioClient, tmdbId, posterPath);
                        dorama.setPosterUrl(posterUrl);
                    }

                    doramaRepository.save(dorama);
                    imported++;
                }
            }

            return "Импорт завершён. Добавлено: " + imported + ", пропущено: " + skipped;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Ошибка импорта дорам из TMDB", e);
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