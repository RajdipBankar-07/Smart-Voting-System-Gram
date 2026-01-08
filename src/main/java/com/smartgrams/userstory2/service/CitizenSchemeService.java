package com.smartgrams.userstory2.service;

import java.util.List;
import com.smartgrams.userstory2.entity.CitizenScheme;

public interface CitizenSchemeService {

    CitizenScheme applyScheme(Long citizenId, Long schemeId);

    CitizenScheme approveScheme(Long id);

    CitizenScheme rejectScheme(Long id);

    List<CitizenScheme> getCitizenSchemes(Long citizenId);
}
