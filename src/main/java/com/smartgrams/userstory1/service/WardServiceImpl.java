package com.smartgrams.userstory1.service;

import com.smartgrams.userstory1.entity.Ward;
import com.smartgrams.userstory1.repository.WardRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WardServiceImpl implements WardService {

    private final WardRepository wardRepository;

    public WardServiceImpl(WardRepository wardRepository) {
        this.wardRepository = wardRepository;
    }

    @Override
    public List<Ward> getAllWards() {
        return wardRepository.findAll();
    }

    @Override
    public Optional<Ward> getWardById(Long id) {
        return wardRepository.findById(id);
    }

    @Override
    public Ward createWard(Ward ward) {
        return wardRepository.save(ward);
    }

    @Override
    public Ward updateWard(Long id, Ward wardDetails) {
        return wardRepository.findById(id).map(ward -> {
            ward.setWardNumber(wardDetails.getWardNumber());
            ward.setWardName(wardDetails.getWardName());
            ward.setWardBoundary(wardDetails.getWardBoundary());
            ward.setPopulation(wardDetails.getPopulation());
            ward.setStatus(wardDetails.getStatus());
            return wardRepository.save(ward);
        }).orElseThrow(() -> new RuntimeException("Ward not found with id " + id));
    }

    @Override
    public void deleteWard(Long id) {
        wardRepository.deleteById(id);
    }
}
