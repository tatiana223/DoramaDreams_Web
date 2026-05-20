package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.bmstu.iu5.doramadreams.model.Country;

import java.util.Optional;

public interface CountryRepository extends JpaRepository<Country, Long> {
    Optional<Country> findByIsoCode(String isoCode);
    Optional<Country> findByName(String name);
}