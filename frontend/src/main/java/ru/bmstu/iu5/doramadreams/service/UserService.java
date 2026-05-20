package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.dto.UserDto;
import ru.bmstu.iu5.doramadreams.exception.BadRequestException;
import ru.bmstu.iu5.doramadreams.exception.ConflictException;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.mapper.UserMapper;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public List<UserDto> getAllUsers() {
        return userMapper.toDtoList(userRepository.findAll());
    }

    public UserDto createUser(UserDto userDto) {
        validateUserForCreate(userDto);

        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            throw new ConflictException("Пользователь с таким username уже существует");
        }

        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            throw new ConflictException("Пользователь с таким email уже существует");
        }

        User user = userMapper.toEntity(userDto);
        user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));

        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    public UserDto getUserById(Long id) {
        return userMapper.toDto(findUserEntityById(id));
    }

    public UserDto getUserByName(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь с таким username не найден"));

        return userMapper.toDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь с таким email не найден"));

        return userMapper.toDto(user);
    }

    public UserDto updateUser(Long id, UserDto userDto) {
        User user = findUserEntityById(id);

        if (userDto.getUsername() != null && !userDto.getUsername().isBlank()) {
            userRepository.findByUsername(userDto.getUsername())
                    .filter(existingUser -> !existingUser.getUserId().equals(id))
                    .ifPresent(existingUser -> {
                        throw new ConflictException("Пользователь с таким username уже существует");
                    });

            user.setUsername(userDto.getUsername());
        }

        if (userDto.getEmail() != null && !userDto.getEmail().isBlank()) {
            userRepository.findByEmail(userDto.getEmail())
                    .filter(existingUser -> !existingUser.getUserId().equals(id))
                    .ifPresent(existingUser -> {
                        throw new ConflictException("Пользователь с таким email уже существует");
                    });

            user.setEmail(userDto.getEmail());
        }

        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        }

        return userMapper.toDto(userRepository.save(user));
    }

    public void deleteUser(Long id) {
        User user = findUserEntityById(id);
        userRepository.delete(user);
    }

    private User findUserEntityById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь с таким id не найден"));
    }

    private void validateUserForCreate(UserDto userDto) {
        if (userDto.getUsername() == null || userDto.getUsername().isBlank()) {
            throw new BadRequestException("Username не может быть пустым");
        }

        if (userDto.getEmail() == null || userDto.getEmail().isBlank()) {
            throw new BadRequestException("Email не может быть пустым");
        }

        if (userDto.getPassword() == null || userDto.getPassword().isBlank()) {
            throw new BadRequestException("Пароль не может быть пустым");
        }
    }
}