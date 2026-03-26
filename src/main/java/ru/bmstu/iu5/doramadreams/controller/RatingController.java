package ru.bmstu.iu5.doramadreams.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import ru.bmstu.iu5.doramadreams.dto.RatingDto;
import ru.bmstu.iu5.doramadreams.model.Rating;
import ru.bmstu.iu5.doramadreams.service.RatingService;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {
    @Autowired
    private RatingService ratingService;


    @PostMapping
    public RatingDto addRating(@RequestBody RatingDto ratingDto) {
        return ratingService.saveRating(ratingDto);
    }

    @GetMapping("dorama/{id}")
    public List<RatingDto> getByDorama(@PathVariable Long id) {
        return ratingService.getRatingsByDorama(id);
    }
}