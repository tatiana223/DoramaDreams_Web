package ru.bmstu.iu5.doramadreams.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import ru.bmstu.iu5.doramadreams.exception.ResourceNotFoundException;
import ru.bmstu.iu5.doramadreams.model.User;
import ru.bmstu.iu5.doramadreams.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));
    }

    public Long getCurrentUserId() {
        return getCurrentUser().getUserId();
    }
}