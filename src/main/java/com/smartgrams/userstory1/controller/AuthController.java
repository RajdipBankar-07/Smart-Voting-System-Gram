package com.smartgrams.userstory1.controller;

import com.smartgrams.userstory1.entity.Role;
import com.smartgrams.userstory1.entity.User;
import com.smartgrams.userstory1.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Default role if not provided or force setting logic
        if (user.getRole() == null) {
            user.setRole(Role.WARD_OFFICER);
        }
        userRepository.save(user);
        return "User registered successfully";
    }

    @GetMapping("/me")
    public java.util.Map<String, String> me(org.springframework.security.core.Authentication authentication) {
        String role = authentication.getAuthorities().stream().findFirst().get().getAuthority();
        // Spring Security adds "ROLE_" prefix usually, or uses the string from
        // UserDetailsService
        return java.util.Map.of(
                "username", authentication.getName(),
                "role", role);
    }
}
