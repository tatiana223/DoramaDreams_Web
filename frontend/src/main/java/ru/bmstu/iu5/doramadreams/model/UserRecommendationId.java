package ru.bmstu.iu5.doramadreams.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRecommendationId implements Serializable {
    private Long userId;
    private Long doramaId;
}