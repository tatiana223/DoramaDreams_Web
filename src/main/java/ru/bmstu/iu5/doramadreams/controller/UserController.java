package ru.bmstu.iu5.doramadreams.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.UserDto;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/register")
    public UserDto registerUser(@RequestBody UserDto userDto) {
        return userService.createUser(userDto);
    }

    @GetMapping("/{id}")
    public UserDto findByIdUser(@PathVariable Long id) {
        return userService.getUserById(id);
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
