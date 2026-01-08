package com.smartgrams.userstory2.service;

import java.util.List;
import com.smartgrams.userstory2.entity.Scheme;

public interface SchemeService {
    Scheme addScheme(Scheme scheme);

    List<Scheme> getAllSchemes();
}
