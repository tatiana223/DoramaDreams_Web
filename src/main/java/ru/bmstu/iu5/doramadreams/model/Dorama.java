package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "doramas")
@Data
public class Dorama {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long doramaId;

    @Column(name = "tmdb_id", unique = true)
    private Integer tmdbId;

    @ManyToOne
    @JoinColumn(name = "country_id")
    private Country country;

    private String title;
    private String originalTitle;
    @Column(columnDefinition = "TEXT")
    private String description;
    private Integer releaseYear;
    private Integer duration;

    @Column(name = "poster_url", length = 1000)
    private String posterUrl;
    @Column(name = "video_url", length = 1000)
    private String videoUrl;

    @ManyToMany
    @JoinTable(
            name = "dorama_genres",
            joinColumns = @JoinColumn(name = "dorama_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();
}
