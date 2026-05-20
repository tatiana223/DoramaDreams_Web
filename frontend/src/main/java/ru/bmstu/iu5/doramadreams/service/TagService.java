package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.TagDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.TagMapper;
import ru.bmstu.iu5.doramadreams.model.Tag;
import ru.bmstu.iu5.doramadreams.repository.TagRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    public List<TagDto> getAllTags() {
        return tagMapper.toDtoList(tagRepository.findAll());
    }

    public TagDto getById(Long id) {
        return tagMapper.toDto(findTagEntityById(id));
    }

    public TagDto createTag(TagDto tagDto) {
        String name = normalizeName(tagDto.getName());

        if (tagRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException("Тег с таким названием уже существует");
        }

        Tag tag = new Tag();
        tag.setName(name);

        return tagMapper.toDto(tagRepository.save(tag));
    }

    public TagDto updateTag(Long id, TagDto tagDto) {
        Tag tag = findTagEntityById(id);
        String name = normalizeName(tagDto.getName());

        tagRepository.findByNameIgnoreCase(name)
                .filter(existingTag -> !existingTag.getTagId().equals(id))
                .ifPresent(existingTag -> {
                    throw new ConflictException("Тег с таким названием уже существует");
                });

        tag.setName(name);
        return tagMapper.toDto(tagRepository.save(tag));
    }

    public void deleteTag(Long id) {
        tagRepository.delete(findTagEntityById(id));
    }

    private Tag findTagEntityById(Long id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Тег с таким id не найден"));
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Название тега обязательно");
        }

        return name.trim().toLowerCase();
    }
}
