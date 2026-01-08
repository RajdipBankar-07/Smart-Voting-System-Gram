package com.smartgrams.userstory1.config;

import com.smartgrams.userstory1.entity.Role;
import com.smartgrams.userstory1.entity.User;
import com.smartgrams.userstory1.repository.UserRepository;
import com.smartgrams.userstory1.repository.WardRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(UserRepository userRepository, WardRepository wardRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin exists
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("password"));
                admin.setRole(Role.SUPER_ADMIN);
                userRepository.save(admin);
                System.out.println("DEFAULT ADMIN USER CREATED: username=admin, password=password");
            }

            // Create default wards if none exist
            if (wardRepository.count() == 0) {
                com.smartgrams.userstory1.entity.Ward ward1 = new com.smartgrams.userstory1.entity.Ward();
                ward1.setWardNumber(1);
                ward1.setWardName("Ward No. 1");
                ward1.setAreaName("Main Village Area");
                ward1.setPopulation(1200);
                wardRepository.save(ward1);

                com.smartgrams.userstory1.entity.Ward ward2 = new com.smartgrams.userstory1.entity.Ward();
                ward2.setWardNumber(2);
                ward2.setWardName("Ward No. 2");
                ward2.setAreaName("River Side Area");
                ward2.setPopulation(850);
                wardRepository.save(ward2);
                System.out.println("DEFAULT WARDS CREATED: Ward 1 and Ward 2");
            }
        };
    }
}
