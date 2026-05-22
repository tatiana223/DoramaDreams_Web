package ru.bmstu.iu5.doramadreams.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import ru.bmstu.iu5.doramadreams.model.Country;
import ru.bmstu.iu5.doramadreams.repository.CountryRepository;

@Component
@RequiredArgsConstructor
public class CountryDataInitializer implements ApplicationRunner {

    private final CountryRepository countryRepository;

    @Override
    public void run(ApplicationArguments args) {
        createCountryIfMissing("Южная Корея", "KR");
        createCountryIfMissing("Китай", "CN");
    }

    private void createCountryIfMissing(String name, String isoCode) {
        countryRepository.findByIsoCodeIgnoreCase(isoCode)
                .or(() -> countryRepository.findByNameIgnoreCase(name))
                .orElseGet(() -> {
                    Country country = new Country();
                    country.setName(name);
                    country.setIsoCode(isoCode);
                    return countryRepository.save(country);
                });
    }
}
