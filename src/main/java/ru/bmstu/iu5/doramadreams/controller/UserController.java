package ru.bmstu.iu5.doramadreams.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.UserDto;
import ru.bmstu.iu5.doramadreams.service.CurrentUserService;
import ru.bmstu.iu5.doramadreams.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@RequestBody UserDto userDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(userDto));
    }

    @GetMapping("/my")
    public UserDto findByIdUser() {
        Long userId = currentUserService.getCurrentUserId();
        return userService.getUserById(userId);
    }

    @PutMapping("/my")
    public UserDto updateMyProfile(@RequestBody UserDto userDto) {
        Long userId = currentUserService.getCurrentUserId();
        return userService.updateUser(userId, userDto);
    }

    @DeleteMapping("/my")
    public ResponseEntity<Void> deleteMyProfile() {
        Long userId = currentUserService.getCurrentUserId();
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search/username")
    public ResponseEntity<UserDto> findByNameUser(@RequestParam("username") String name) {
        return ResponseEntity.ok(userService.getUserByName(name));
    }

    @GetMapping("/search/email")
    public ResponseEntity<UserDto> findByEmailUser(@RequestParam("email") String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }
}