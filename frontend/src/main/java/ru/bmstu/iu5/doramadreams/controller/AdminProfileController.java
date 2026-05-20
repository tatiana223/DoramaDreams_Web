package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ru.bmstu.iu5.doramadreams.dto.AdminDashboardDto;
import ru.bmstu.iu5.doramadreams.service.AdminDashboardService;

@Tag(name = "Admin Profile", description = "Профиль администратора и статистика системы")
@RestController
@RequestMapping("/api/admin/profile")
@RequiredArgsConstructor
public class AdminProfileController {

    private final AdminDashboardService adminDashboardService;

    @Operation(summary = "Получить статистику для профиля администратора")
    @GetMapping
    public AdminDashboardDto getAdminProfile() {
        return adminDashboardService.getDashboard();
    }
}