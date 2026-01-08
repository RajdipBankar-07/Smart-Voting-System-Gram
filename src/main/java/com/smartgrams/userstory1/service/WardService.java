package com.smartgrams.userstory1.service;

import com.smartgrams.userstory1.entity.Ward;
import java.util.List;
import java.util.Optional;

public interface WardService {
    List<Ward> getAllWards();

    Optional<Ward> getWardById(Long id);

    Ward createWard(Ward ward);

    Ward updateWard(Long id, Ward ward);

    void deleteWard(Long id);
}
