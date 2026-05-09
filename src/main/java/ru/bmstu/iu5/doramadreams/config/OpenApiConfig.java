package ru.bmstu.iu5.doramadreams.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI doramaDreamsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DoramaDreams API")
                        .description("REST API для веб-системы рекомендаций дорам")
                        .version("1.0.0"));
    }
}
