package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.AuthResponse;
import ru.bmstu.iu5.doramadreams.dto.LoginRequest;
import ru.bmstu.iu5.doramadreams.dto.RegisterRequest;
import ru.bmstu.iu5.doramadreams.service.AuthService;

@Tag(name = "Auth", description = "Аутентификация и регистрация")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    @Operation(summary = "Зарегистрировать пользователя")

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
    @Operation(summary = "Войти в аккаунт")

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}