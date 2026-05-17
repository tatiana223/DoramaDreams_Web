package ru.bmstu.iu5.doramadreams.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.service.TestDataGeneratorService;

@Tag(name = "Admin Test Data", description = "Генерация тестовых данных для ML")
@RestController
@RequestMapping("/api/admin/test-data")
@RequiredArgsConstructor
public class AdminTestDataController {

    private final TestDataGeneratorService testDataGeneratorService;

    @Operation(summary = "Сгенерировать пользователей и взаимодействия")
    @PostMapping("/generate")
    public String generate(@RequestParam(defaultValue = "150") int users) {
        return testDataGeneratorService.generate(users);
    }
}