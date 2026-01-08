package com.smartgrams.userstory1.config;

import com.smartgrams.userstory1.service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;

    public SecurityConfig(CustomUserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for simplicity in MVP/API mode
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/citizens/upload").permitAll() // Public Registration
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/citizens/verify/**")
                        .hasAnyRole("SUPER_ADMIN", "WARD_OFFICER", "GRAM_PANCHAYAT_ADMIN")
                        .requestMatchers("/api/citizens/**")
                        .hasAnyRole("SUPER_ADMIN", "WARD_OFFICER", "GRAM_PANCHAYAT_ADMIN")
                        .requestMatchers("/api/wards/**")
                        .hasAnyRole("SUPER_ADMIN", "WARD_OFFICER", "GRAM_PANCHAYAT_ADMIN")
                        .requestMatchers("/api/dashboard/**")
                        .hasAnyRole("SUPER_ADMIN", "WARD_OFFICER", "GRAM_PANCHAYAT_ADMIN")
                        .requestMatchers("/api/voting/**").authenticated() // Allow logged in users (Citizen)
                        .anyRequest().authenticated())
                .httpBasic(basic -> {
                }); // Enable Basic Auth for testing

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }
}
