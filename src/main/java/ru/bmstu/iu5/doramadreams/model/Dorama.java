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

    private String title;
    private String originalTitle;
    private String description;
    private Integer releaseYear;
    private String posterUrl;

    @ManyToMany
    @JoinTable(
            name = "dorama_genres",
            joinColumns = @JoinColumn(name = "dorama_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    private Set<Genre> genres = new HashSet<>();
}
