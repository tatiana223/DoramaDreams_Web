package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
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

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DoramaService {

    private final DoramaRepository doramaRepository;
    private final ActorRepository actorRepository;
    private final CountryRepository countryRepository;
    private final GenreRepository genreRepository;
    private final TagRepository tagRepository;
    private final DoramaDtoService doramaDtoService;

    public List<DoramaDto> getAllDoramas() {
        return doramaDtoService.toDtoList(doramaRepository.findAll());
    }

    public DoramaDto getById(Long id) {
        return doramaDtoService.toDto(findDoramaEntityById(id));
    }

    public DoramaDto getByName(String name) {
        Dorama dorama = doramaRepository.findByTitleIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Дорама с таким названием не найдена"));

        return doramaDtoService.toDto(dorama);
    }

    public List<DoramaDto> getDoramasByGenre(String genreName) {
        return doramaDtoService.toDtoList(doramaRepository.findByGenres_NameIgnoreCase(genreName));
    }

    public DoramaDto createDorama(DoramaDto doramaDto) {
        validateDoramaForCreate(doramaDto);

        doramaRepository.findByTitleIgnoreCase(doramaDto.getTitle())
                .ifPresent(existingDorama -> {
                    throw new ConflictException("Дорама с таким названием уже существует");
                });

        Dorama dorama = new Dorama();
        dorama.setTitle(doramaDto.getTitle().trim());
        dorama.setOriginalTitle(normalizeOptionalText(doramaDto.getOriginalTitle()));
        dorama.setDescription(normalizeOptionalText(doramaDto.getDescription()));
        dorama.setReleaseYear(doramaDto.getReleaseYear());
        validateDuration(doramaDto.getDuration());
        dorama.setDuration(doramaDto.getDuration());
        dorama.setCountry(resolveCountry(doramaDto));
        dorama.setPosterUrl(normalizeOptionalText(doramaDto.getPosterUrl()));
        dorama.setVideoUrl(normalizeOptionalText(doramaDto.getVideoUrl()));
        dorama.setGenres(resolveGenres(doramaDto.getGenres()));
        dorama.setTags(resolveTags(doramaDto.getTags()));

        return doramaDtoService.toDto(doramaRepository.save(dorama));
    }

    public DoramaDto updateDorama(Long id, DoramaDto doramaDto) {
        Dorama dorama = findDoramaEntityById(id);

        if (doramaDto.getTitle() != null && !doramaDto.getTitle().isBlank()) {
            ensureUniqueTitleForUpdate(id, doramaDto.getTitle());
            dorama.setTitle(doramaDto.getTitle().trim());
        }

        if (doramaDto.getOriginalTitle() != null) {
            dorama.setOriginalTitle(normalizeOptionalText(doramaDto.getOriginalTitle()));
        }

        if (doramaDto.getDescription() != null) {
            dorama.setDescription(normalizeOptionalText(doramaDto.getDescription()));
        }

        if (doramaDto.getReleaseYear() != null) {
            validateReleaseYear(doramaDto.getReleaseYear());
            dorama.setReleaseYear(doramaDto.getReleaseYear());
        }

        if (doramaDto.getDuration() != null) {
            validateDuration(doramaDto.getDuration());
            dorama.setDuration(doramaDto.getDuration());
        }

        if (doramaDto.getCountryId() != null
                || (doramaDto.getCountryIsoCode() != null && !doramaDto.getCountryIsoCode().isBlank())
                || (doramaDto.getCountryName() != null && !doramaDto.getCountryName().isBlank())) {
            dorama.setCountry(resolveCountry(doramaDto));
        }

        if (doramaDto.getVideoUrl() != null) {
            dorama.setVideoUrl(normalizeOptionalText(doramaDto.getVideoUrl()));
        }

        if (doramaDto.getPosterUrl() != null) {
            dorama.setPosterUrl(normalizeOptionalText(doramaDto.getPosterUrl()));
        }

        if (doramaDto.getGenres() != null) {
            dorama.setGenres(resolveGenres(doramaDto.getGenres()));
        }

        if (doramaDto.getTags() != null) {
            dorama.setTags(resolveTags(doramaDto.getTags()));
        }

        return doramaDtoService.toDto(doramaRepository.save(dorama));
    }

    public DoramaDto updateDoramaFull(Long id, DoramaDto doramaDto) {
        Dorama dorama = findDoramaEntityById(id);
        validateDoramaForCreate(doramaDto);
        ensureUniqueTitleForUpdate(id, doramaDto.getTitle());

        dorama.setTitle(doramaDto.getTitle().trim());
        dorama.setOriginalTitle(normalizeOptionalText(doramaDto.getOriginalTitle()));
        dorama.setDescription(normalizeOptionalText(doramaDto.getDescription()));

        if (doramaDto.getReleaseYear() != null) {
            validateReleaseYear(doramaDto.getReleaseYear());
        }
        dorama.setReleaseYear(doramaDto.getReleaseYear());

        validateDuration(doramaDto.getDuration());
        dorama.setDuration(doramaDto.getDuration());

        if (doramaDto.getCountryId() != null
                || (doramaDto.getCountryIsoCode() != null && !doramaDto.getCountryIsoCode().isBlank())
                || (doramaDto.getCountryName() != null && !doramaDto.getCountryName().isBlank())) {
            dorama.setCountry(resolveCountry(doramaDto));
        } else {
            dorama.setCountry(null);
        }

        dorama.setPosterUrl(normalizeOptionalText(doramaDto.getPosterUrl()));
        dorama.setVideoUrl(normalizeOptionalText(doramaDto.getVideoUrl()));
        dorama.setGenres(resolveGenres(doramaDto.getGenres()));
        dorama.setTags(resolveTags(doramaDto.getTags()));

        return doramaDtoService.toDto(doramaRepository.save(dorama));
    }

    private void ensureUniqueTitleForUpdate(Long id, String title) {
        doramaRepository.findByTitleIgnoreCase(title)
                .filter(existingDorama -> !existingDorama.getDoramaId().equals(id))
                .ifPresent(existingDorama -> {
                    throw new ConflictException("Дорама с таким названием уже существует");
                });
    }

    public void deleteDorama(Long id) {
        Dorama dorama = findDoramaEntityById(id);
        doramaRepository.delete(dorama);
    }

    private Dorama findDoramaEntityById(Long id) {
        return doramaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Дорама с таким id не найдена"));
    }

    private Set<Genre> resolveGenres(List<String> genreNames) {
        Set<Genre> genres = new HashSet<>();

        if (genreNames == null || genreNames.isEmpty()) {
            return genres;
        }

        for (String genreName : genreNames) {
            if (genreName == null || genreName.isBlank()) {
                continue;
            }

            Genre genre = genreRepository.findByNameIgnoreCase(genreName.trim())
                    .orElseGet(() -> {
                        Genre newGenre = new Genre();
                        newGenre.setName(genreName.trim());
                        return genreRepository.save(newGenre);
                    });

            genres.add(genre);
        }

        return genres;
    }

    private Set<Tag> resolveTags(List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();

        if (tagNames == null || tagNames.isEmpty()) {
            return tags;
        }

        for (String tagName : tagNames) {
            if (tagName == null || tagName.isBlank()) {
                continue;
            }

            String normalizedTagName = tagName.trim().toLowerCase();

            Tag tag = tagRepository.findByNameIgnoreCase(normalizedTagName)
                    .orElseGet(() -> {
                        Tag newTag = new Tag();
                        newTag.setName(normalizedTagName);
                        return tagRepository.save(newTag);
                    });

            tags.add(tag);
        }

        return tags;
    }

    public List<DoramaDto> searchDoramas(String title, String genre, String tag, String country, Integer releaseYear) {
        String normalizedTitle = normalizeTitleForSearch(title);
        String normalizedGenre = normalizeGenreForSearch(genre);
        String normalizedTag = normalizeTagForSearch(tag);
        String normalizedCountry = normalizeCountryForSearch(country);

        return doramaDtoService.toDtoList(
                doramaRepository.searchDoramas(normalizedTitle, normalizedGenre, normalizedTag, normalizedCountry, releaseYear)
        );
    }

    private String normalizeTitleForSearch(String title) {
        if (title == null || title.isBlank()) {
            return null;
        }

        return "%" + title.trim().toLowerCase() + "%";
    }

    private String normalizeGenreForSearch(String genre) {
        if (genre == null || genre.isBlank()) {
            return null;
        }

        return genre.trim().toLowerCase();
    }

    private String normalizeTagForSearch(String tag) {
        if (tag == null || tag.isBlank()) {
            return null;
        }

        return tag.trim().toLowerCase();
    }

    private String normalizeCountryForSearch(String country) {
        if (country == null || country.isBlank()) {
            return null;
        }

        return country.trim().toLowerCase();
    }

    public List<DoramaDto> getTopRated(int limit) {
        return doramaDtoService.toDtoList(
                doramaRepository.findTopRated(PageRequest.of(0, limit))
        );
    }

    private void validateDoramaForCreate(DoramaDto doramaDto) {
        if (doramaDto.getTitle() == null || doramaDto.getTitle().isBlank()) {
            throw new BadRequestException("Название дорамы обязательно");
        }

        if (doramaDto.getReleaseYear() != null) {
            validateReleaseYear(doramaDto.getReleaseYear());
        }
    }

    private void validateReleaseYear(Integer releaseYear) {
        if (releaseYear < 1900 || releaseYear > 2100) {
            throw new BadRequestException("Год выпуска должен быть в диапазоне от 1900 до 2100");
        }
    }

    private void validateDuration(Integer duration) {
        if (duration != null && duration < 1) {
            throw new BadRequestException("Длительность должна быть положительным числом");
        }
    }

    private Country resolveCountry(DoramaDto doramaDto) {
        if (doramaDto.getCountryId() != null) {
            return countryRepository.findById(doramaDto.getCountryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Страна с таким id не найдена"));
        }

        if (doramaDto.getCountryIsoCode() != null && !doramaDto.getCountryIsoCode().isBlank()) {
            String normalizedIsoCode = doramaDto.getCountryIsoCode().trim().toUpperCase();
            return countryRepository.findByIsoCodeIgnoreCase(normalizedIsoCode)
                    .orElseGet(() -> {
                        Country country = new Country();
                        country.setName(resolveCountryNameByIsoCode(normalizedIsoCode));
                        country.setIsoCode(normalizedIsoCode);
                        return countryRepository.save(country);
                    });
        }

        if (doramaDto.getCountryName() != null && !doramaDto.getCountryName().isBlank()) {
            String normalizedName = doramaDto.getCountryName().trim();
            return countryRepository.findByNameIgnoreCase(normalizedName)
                    .orElseGet(() -> {
                        Country country = new Country();
                        country.setName(normalizedName);
                        return countryRepository.save(country);
                    });
        }

        return null;
    }

    private String resolveCountryNameByIsoCode(String isoCode) {
        return switch (isoCode) {
            case "KR" -> "Южная Корея";
            case "CN" -> "Китай";
            default -> isoCode;
        };
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    public DoramaDto updateVideoUrl(Long doramaId, String videoUrl) {
        Dorama dorama = findDoramaEntityById(doramaId);

        if (videoUrl == null || videoUrl.isBlank()) {
            throw new BadRequestException("Ссылка на видео обязательна");
        }

        String normalizedVideoUrl = videoUrl.trim();

        if (!normalizedVideoUrl.startsWith("http://") && !normalizedVideoUrl.startsWith("https://")) {
            throw new BadRequestException("Ссылка на видео должна начинаться с http:// или https://");
        }

        dorama.setVideoUrl(normalizedVideoUrl);

        return doramaDtoService.toDto(doramaRepository.save(dorama));
    }

    public DoramaDto updateActors(Long doramaId, List<Long> actorIds) {
        Dorama dorama = findDoramaEntityById(doramaId);
        dorama.setActors(resolveActors(actorIds));

        return doramaDtoService.toDto(doramaRepository.save(dorama));
    }

    private Set<Actor> resolveActors(List<Long> actorIds) {
        Set<Actor> actors = new HashSet<>();

        if (actorIds == null || actorIds.isEmpty()) {
            return actors;
        }

        for (Long actorId : actorIds) {
            if (actorId == null) {
                continue;
            }

            Actor actor = actorRepository.findById(actorId)
                    .orElseThrow(() -> new ResourceNotFoundException("Актёр с id " + actorId + " не найден"));
            actors.add(actor);
        }

        return actors;
    }

    public DoramaDto deleteVideoUrl(Long doramaId) {
        Dorama dorama = findDoramaEntityById(doramaId);
        dorama.setVideoUrl(null);

        return doramaDtoService.toDto(doramaRepository.save(dorama));
    }


}