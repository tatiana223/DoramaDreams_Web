package ru.bmstu.iu5.doramadreams.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.bmstu.iu5.doramadreams.dto.UserDto;
import ru.bmstu.iu5.doramadreams.model.User;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "password", ignore = true)
    UserDto toDto(User user);

    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "registrationDate", ignore = true)
    User toEntity(UserDto dto);

    List<UserDto> toDtoList(List<User> users);
}
