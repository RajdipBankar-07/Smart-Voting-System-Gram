package com.smartgrams.userstory2.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.smartgrams.userstory2.entity.Scheme;
import com.smartgrams.userstory2.repository.SchemeRepository;

@Service
public class SchemeServiceImpl implements SchemeService {

    private final SchemeRepository schemeRepository;

    public SchemeServiceImpl(SchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    @Override
    public Scheme addScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    @Override
    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }
}
