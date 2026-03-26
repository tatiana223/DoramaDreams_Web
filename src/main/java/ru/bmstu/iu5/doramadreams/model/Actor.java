package ru.bmstu.iu5.doramadreams.model;

import jakarta.persistence.*;
import lombok.Data;
@Entity
@Table(name = "actors")
@Data
public class Actor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long actorId;

    private String fullName;
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String biography;
}
