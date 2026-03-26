package ru.bmstu.iu5.doramadreams.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.bmstu.iu5.doramadreams.model.Rating;

public interface RatingRepository extends JpaRepository<Rating, Long> {
}
