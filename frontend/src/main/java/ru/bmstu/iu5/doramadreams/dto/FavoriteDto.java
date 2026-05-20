package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

@Data
public class FavoriteDto {
    private Long favoriteId;
    private Long userId;
    private Long doramaId;
    private String doramaTitle; // Для отображения в списке без лишних запросов
    private String posterUrl;   // Чтобы фронтенд сразу мог отрисовать карточку
}