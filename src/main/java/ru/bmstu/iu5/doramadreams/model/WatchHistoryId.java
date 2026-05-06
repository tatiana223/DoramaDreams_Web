package ru.bmstu.iu5.doramadreams.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchHistoryId implements Serializable {
    private Long user;   // Имя должно совпадать с полем в WatchHistory
    private Long dorama; // Имя должно совпадать с полем в WatchHistory
}