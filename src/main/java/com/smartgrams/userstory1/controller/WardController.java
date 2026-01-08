package com.smartgrams.userstory1.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.smartgrams.userstory1.entity.Ward;
import com.smartgrams.userstory1.service.WardService;

@RestController
@RequestMapping("/api/wards")
public class WardController {

    private final WardService wardService;

    public WardController(WardService wardService) {
        this.wardService = wardService;
    }

    @GetMapping
    public List<Ward> getAllWards() {
        return wardService.getAllWards();
    }

    @GetMapping("/{id}")
    public Ward getWard(@PathVariable Long id) {
        return wardService.getWardById(id)
                .orElseThrow(() -> new RuntimeException("Ward not found"));
    }

    @PostMapping
    public Ward createWard(@RequestBody Ward ward) {
        return wardService.createWard(ward);
    }

    @PutMapping("/{id}")
    public Ward updateWard(@PathVariable Long id, @RequestBody Ward ward) {
        return wardService.updateWard(id, ward);
    }

    @DeleteMapping("/{id}")
    public void deleteWard(@PathVariable Long id) {
        wardService.deleteWard(id);
    }
}
