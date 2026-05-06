package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.DoramaMapper;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.model.Genre;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;
import ru.bmstu.iu5.doramadreams.repository.GenreRepository;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DoramaService {

    private final DoramaRepository doramaRepository;
    private final GenreRepository genreRepository;
    private final DoramaMapper doramaMapper;

    public List<DoramaDto> getAllDoramas() {
        return doramaMapper.toDtoList(doramaRepository.findAll());
    }

    public DoramaDto getById(Long id) {
        return doramaMapper.toDto(findDoramaEntityById(id));
    }

    public DoramaDto getByName(String name) {
        Dorama dorama = doramaRepository.findByTitleIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("Дорама с таким названием не найдена"));

        return doramaMapper.toDto(dorama);
    }

    public List<DoramaDto> getDoramasByGenre(String genreName) {
        return doramaMapper.toDtoList(doramaRepository.findByGenres_NameIgnoreCase(genreName));
    }

    public DoramaDto createDorama(DoramaDto doramaDto) {
        validateDoramaForCreate(doramaDto);

        doramaRepository.findByTitleIgnoreCase(doramaDto.getTitle())
                .ifPresent(existingDorama -> {
                    throw new ConflictException("Дорама с таким названием уже существует");
                });

        Dorama dorama = new Dorama();
        dorama.setTitle(doramaDto.getTitle());
        dorama.setOriginalTitle(doramaDto.getOriginalTitle());
        dorama.setDescription(doramaDto.getDescription());
        dorama.setReleaseYear(doramaDto.getReleaseYear());
        dorama.setPosterUrl(doramaDto.getPosterUrl());
        dorama.setGenres(resolveGenres(doramaDto.getGenres()));

        return doramaMapper.toDto(doramaRepository.save(dorama));
    }

    public DoramaDto updateDorama(Long id, DoramaDto doramaDto) {
        Dorama dorama = findDoramaEntityById(id);

        if (doramaDto.getTitle() != null && !doramaDto.getTitle().isBlank()) {
            doramaRepository.findByTitleIgnoreCase(doramaDto.getTitle())
                    .filter(existingDorama -> !existingDorama.getDoramaId().equals(id))
                    .ifPresent(existingDorama -> {
                        throw new ConflictException("Дорама с таким названием уже существует");
                    });

            dorama.setTitle(doramaDto.getTitle());
        }

        if (doramaDto.getOriginalTitle() != null) {
            dorama.setOriginalTitle(doramaDto.getOriginalTitle());
        }

        if (doramaDto.getDescription() != null) {
            dorama.setDescription(doramaDto.getDescription());
        }

        if (doramaDto.getReleaseYear() != null) {
            validateReleaseYear(doramaDto.getReleaseYear());
            dorama.setReleaseYear(doramaDto.getReleaseYear());
        }

        if (doramaDto.getPosterUrl() != null) {
            dorama.setPosterUrl(doramaDto.getPosterUrl());
        }

        if (doramaDto.getGenres() != null) {
            dorama.setGenres(resolveGenres(doramaDto.getGenres()));
        }

        return doramaMapper.toDto(doramaRepository.save(dorama));
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

    public List<DoramaDto> searchDoramas(String title, String genre, Integer releaseYear) {
        return doramaMapper.toDtoList(
                doramaRepository.searchDoramas(title, genre, releaseYear)
        );
    }

    public List<DoramaDto> getTopRated(int limit) {
        return doramaMapper.toDtoList(
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


}