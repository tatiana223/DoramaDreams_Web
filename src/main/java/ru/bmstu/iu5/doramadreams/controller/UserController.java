package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.AuthResponse;
import ru.bmstu.iu5.doramadreams.dto.UserDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.UserService;

@Tag(name = "Users", description = "Профиль пользователя")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @Operation(summary = "Получить мой профиль")
    @GetMapping("/my")
    public UserDto findByIdUser() {
        Long userId = currentUserService.getCurrentUserId();
        return userService.getUserById(userId);
    }

    @Operation(summary = "Обновить мой профиль")
    @PutMapping("/my")
    public AuthResponse updateMyProfile(@RequestBody UserDto userDto) {
        Long userId = currentUserService.getCurrentUserId();
        return userService.updateMyProfile(userId, userDto);
    }

    @Operation(summary = "Удалить мой профиль")
    @DeleteMapping("/my")
    public ResponseEntity<Void> deleteMyProfile() {
        Long userId = currentUserService.getCurrentUserId();
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
