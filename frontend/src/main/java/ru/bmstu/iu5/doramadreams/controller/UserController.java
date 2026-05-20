package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.UserDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.UserService;

import java.util.List;

@Tag(name = "Users", description = "Пользователи")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;
    @Operation(summary = "Получить список пользователей")

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }
    @Operation(summary = "Создать пользователя")

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
    }
    @Operation(summary = "Получить мой профиль")

    @GetMapping("/my")
    public UserDto findByIdUser() {
        Long userId = currentUserService.getCurrentUserId();
        return userService.getUserById(userId);
    }
    @Operation(summary = "Обновить мой профиль")

    @PutMapping("/my")
    public UserDto updateMyProfile(@RequestBody UserDto userDto) {
        Long userId = currentUserService.getCurrentUserId();
        return userService.updateUser(userId, userDto);
    }
    @Operation(summary = "Удалить мой профиль")

    @DeleteMapping("/my")
    public ResponseEntity<Void> deleteMyProfile() {
        Long userId = currentUserService.getCurrentUserId();
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
    @Operation(summary = "Найти пользователя по имени")

    @GetMapping("/search/username")
    public ResponseEntity<UserDto> findByNameUser(@RequestParam("username") String name) {
        return ResponseEntity.ok(userService.getUserByName(name));
    }
    @Operation(summary = "Найти пользователя по email")

    @GetMapping("/search/email")
    public ResponseEntity<UserDto> findByEmailUser(@RequestParam("email") String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
}