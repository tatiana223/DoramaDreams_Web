package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.CountryDto;
import ru.bmstu.iu5.doramadreams.repository.CountryRepository;

import java.util.List;

@Tag(name = "Countries", description = "Страны производства дорам")
@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {

    private final CountryRepository countryRepository;

    @Operation(summary = "Получить список стран")
    @GetMapping
    public List<CountryDto> getAllCountries() {
        return countryRepository.findAllByOrderByNameAsc().stream()
                .map(country -> new CountryDto(
                        country.getCountryId(),
                        country.getName(),
                        country.getIsoCode()
                ))
                .toList();
    }
}
