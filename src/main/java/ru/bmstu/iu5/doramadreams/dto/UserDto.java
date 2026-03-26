package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long userId;
    private String username;
    private String email;
}
