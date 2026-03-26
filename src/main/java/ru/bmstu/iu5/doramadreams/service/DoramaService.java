package ru.bmstu.iu5.doramadreams.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.DoramaDto;
import ru.bmstu.iu5.doramadreams.mapper.DoramaMapper;
import ru.bmstu.iu5.doramadreams.model.Dorama;
import ru.bmstu.iu5.doramadreams.repository.DoramaRepository;

import java.util.List;

@Service
public class DoramaService {

    @Autowired
    private DoramaRepository doramaRepository;
    @Autowired
    private DoramaMapper doramaMapper;

    public List<DoramaDto> getAllDoramas() {
        return doramaMapper.toDtoList(doramaRepository.findAll());
    }

    public DoramaDto getById(Long id) {
        Dorama dorama = doramaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Дорама не найдена"));
        return doramaMapper.toDto(dorama);
    }

    public DoramaDto getByName(String name) {
        Dorama dorama = doramaRepository.findByTitle(name)
                .orElseThrow(() -> new RuntimeException("Дорама не найдена"));
        return doramaMapper.toDto(dorama);
    }

    public List<DoramaDto> getDoramasByGenre(String genreName) {
        List<Dorama> doramas = doramaRepository.findByGenres_NameIgnoreCase(genreName);
        return doramaMapper.toDtoList(doramas);
    }
}
