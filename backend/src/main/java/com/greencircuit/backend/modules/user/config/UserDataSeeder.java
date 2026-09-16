package com.greencircuit.backend.modules.user.config;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import com.greencircuit.backend.modules.user.entity.Role;
import com.greencircuit.backend.modules.user.entity.User;
import com.greencircuit.backend.modules.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class UserDataSeeder {

    @Bean
    public CommandLineRunner seedDemoUsers(
            UserRepository userRepository,
            OfficeRepository officeRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Seed standard demo user
            User user = userRepository.findByEmail("user@greencircuit.com").orElse(new User());
            user.setName("Green User");
            user.setEmail("user@greencircuit.com");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole(Role.USER);
            if (user.getRewardPoints() == null || user.getRewardPoints() < 150) {
                user.setRewardPoints(150);
            }
            userRepository.save(user);
            System.out.println("Seeded/updated demo user: user@greencircuit.com");

            // Seed Super Admin
            User admin = userRepository.findByEmail("admin@greencircuit.com").orElse(new User());
            admin.setName("Global Administrator");
            admin.setEmail("admin@greencircuit.com");
            admin.setPassword(passwordEncoder.encode("password123"));
            admin.setRole(Role.SUPER_ADMIN);
            userRepository.save(admin);
            System.out.println("Seeded/updated admin user: admin@greencircuit.com");

            // Seed Office users linked to specific collection centers
            List<Office> offices = officeRepository.findAll();
            if (!offices.isEmpty()) {
                Office techazarOffice = offices.stream()
                        .filter(o -> o.getOfficeName() != null && o.getOfficeName().contains("Techazar"))
                        .findFirst()
                        .orElse(offices.get(0));

                User officeUser = userRepository.findByEmail("techazar@greencircuit.com").orElse(new User());
                officeUser.setName("Techazar Center Manager");
                officeUser.setEmail("techazar@greencircuit.com");
                officeUser.setPassword(passwordEncoder.encode("password123"));
                officeUser.setRole(Role.OFFICE);
                officeUser.setOffice(techazarOffice);
                userRepository.save(officeUser);
                System.out.println("Seeded/updated office user: techazar@greencircuit.com");

                Office greenEraOffice = offices.stream()
                        .filter(o -> o.getOfficeName() != null && o.getOfficeName().contains("Green Era"))
                        .findFirst()
                        .orElse(offices.get(0));

                User greenEraUser = userRepository.findByEmail("greenera@greencircuit.com").orElse(new User());
                greenEraUser.setName("Green Era Logistics Manager");
                greenEraUser.setEmail("greenera@greencircuit.com");
                greenEraUser.setPassword(passwordEncoder.encode("password123"));
                greenEraUser.setRole(Role.OFFICE);
                greenEraUser.setOffice(greenEraOffice);
                userRepository.save(greenEraUser);
                System.out.println("Seeded/updated office user: greenera@greencircuit.com");
            }
        };
    }
}
