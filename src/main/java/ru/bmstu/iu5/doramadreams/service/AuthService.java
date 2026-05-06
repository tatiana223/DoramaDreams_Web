package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.AuthResponse;
import ru.bmstu.iu5.doramadreams.dto.LoginRequest;
import ru.bmstu.iu5.doramadreams.dto.RegisterRequest;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.model.UserRole;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            throw new BadRequestException("Username не может быть пустым");
        }

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email не может быть пустым");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Пароль не может быть пустым");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Пользователь с таким username уже существует");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Пользователь с таким email уже существует");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(
                token,
                savedUser.getUserId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email не может быть пустым");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BadRequestException("Пароль не может быть пустым");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Неверный email или пароль"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Неверный email или пароль");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}