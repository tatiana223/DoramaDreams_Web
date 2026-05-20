package ru.bmstu.iu5.doramadreams.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}