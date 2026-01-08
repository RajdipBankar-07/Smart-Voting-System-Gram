package com.smartgrams.userstory1.service;

import com.smartgrams.userstory1.entity.User;
import com.smartgrams.userstory1.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final com.smartgrams.userstory1.repository.CitizenRepository citizenRepository;

    public CustomUserDetailsService(UserRepository userRepository,
            com.smartgrams.userstory1.repository.CitizenRepository citizenRepository) {
        this.userRepository = userRepository;
        this.citizenRepository = citizenRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. Try Admin/Staff Users
        var userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        }

        // 2. Try Citizens (Username = custom username, Password = custom password)
        var citizenOpt = citizenRepository.findByUsername(username);
        if (citizenOpt.isPresent()) {
            com.smartgrams.userstory1.entity.Citizen citizen = citizenOpt.get();

            return new org.springframework.security.core.userdetails.User(
                    citizen.getUsername(),
                    citizen.getPassword(),
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_CITIZEN")));
        }

        // Fallback: Check Aadhar for legacy or specific cases if needed,
        // but the user requested explicit username/password login.
        // Let's keep it clean as requested.

        throw new UsernameNotFoundException("User/Citizen not found: " + username);
    }
}
