package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "countries")
public class Country {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "country_id")
    private Long countryId;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "iso_code", length = 10, unique = true)
    private String isoCode;
}