package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.GenreDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.GenreMapper;
import ru.bmstu.iu5.doramadreams.model.Genre;
import ru.bmstu.iu5.doramadreams.repository.GenreRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;
    private final GenreMapper genreMapper;

    public List<GenreDto> getAllGenres() {
        return genreMapper.toDtoList(genreRepository.findAll());
    }

    public GenreDto getGenreById(Long id) {
        return genreMapper.toDto(findGenreEntityById(id));
    }

    public GenreDto createGenre(GenreDto genreDto) {
        validateGenre(genreDto);

        if (genreRepository.existsByNameIgnoreCase(genreDto.getName())) {
            throw new ConflictException("Жанр с таким названием уже существует");
        }

        Genre genre = genreMapper.toEntity(genreDto);
        return genreMapper.toDto(genreRepository.save(genre));
    }

    public GenreDto updateGenre(Long id, GenreDto genreDto) {
        validateGenre(genreDto);

        Genre genre = findGenreEntityById(id);

        genreRepository.findByNameIgnoreCase(genreDto.getName())
                .filter(existingGenre -> !existingGenre.getGenreId().equals(id))
                .ifPresent(existingGenre -> {
                    throw new ConflictException("Жанр с таким названием уже существует");
                });

        genre.setName(genreDto.getName());
        return genreMapper.toDto(genreRepository.save(genre));
    }

    public void deleteGenre(Long id) {
        Genre genre = findGenreEntityById(id);
        genreRepository.delete(genre);
    }

    private Genre findGenreEntityById(Long id) {
        return genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Жанр с таким id не найден"));
    }

    private void validateGenre(GenreDto genreDto) {
        if (genreDto.getName() == null || genreDto.getName().isBlank()) {
            throw new BadRequestException("Название жанра обязательно");
        }
    }
}