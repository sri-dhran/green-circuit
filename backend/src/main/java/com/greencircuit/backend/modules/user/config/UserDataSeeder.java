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
            com.greencircuit.backend.modules.agent.repository.CollectionAgentRepository agentRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Seed standard demo user
            User user = userRepository.findByEmail("user@greencircuit.com").orElse(new User());
            user.setName("Green User");
            user.setEmail("user@greencircuit.com");
            user.setPassword(passwordEncoder.encode("password123"));
            user.setRole(Role.USER);
            user.setPhoneNumber("+91 9876500001");
            user.setAddress("42 Palm Grove Avenue");
            user.setCity("Chennai");
            if (user.getRewardPoints() == null || user.getRewardPoints() < 150) {
                user.setRewardPoints(150);
            }
            userRepository.save(user);
            System.out.println("Seeded/updated demo user: user@greencircuit.com");

            // Seed Super Admin (Exclusively sri741815@gmail.com)
            User admin = userRepository.findByEmail("sri741815@gmail.com").orElse(new User());
            admin.setName("Super Admin");
            admin.setEmail("sri741815@gmail.com");
            admin.setPassword(passwordEncoder.encode("Sri@1234"));
            admin.setRole(Role.SUPER_ADMIN);
            admin.setPhoneNumber("+91 9000000001");
            userRepository.save(admin);
            System.out.println("Seeded/updated super admin user: sri741815@gmail.com");

            // Clean up legacy admin demo account if it exists
            userRepository.findByEmail("admin@greencircuit.com").ifPresent(userRepository::delete);

            // Seed Office users linked to specific collection centers
            List<Office> offices = officeRepository.findAll();
            if (!offices.isEmpty()) {
                seedOfficeStaff(userRepository, passwordEncoder, offices, "Techazar", "techazar@greencircuit.com", "Techazar Center Manager");
                seedOfficeStaff(userRepository, passwordEncoder, offices, "Green Era", "greenera@greencircuit.com", "Green Era Logistics Manager");
                seedOfficeStaff(userRepository, passwordEncoder, offices, "Adhira", "adhira@greencircuit.com", "Adhira Operations Lead");
                seedOfficeStaff(userRepository, passwordEncoder, offices, "Green India", "greenindia@greencircuit.com", "Green India Plant Supervisor");
                seedOfficeStaff(userRepository, passwordEncoder, offices, "Dharani", "dharani@greencircuit.com", "Dharani Processing Head");
                seedOfficeStaff(userRepository, passwordEncoder, offices, "Eco Birbals", "ecobirbals@greencircuit.com", "Eco Birbals Hub Manager");

                // Seed Collection Agents (Exclusive primary agent: ff2367211871@gmail.com / Sri@1234)
                seedCollectionAgent(userRepository, agentRepository, passwordEncoder, offices, "Techazar", "ff2367211871@gmail.com", "Primary Collection Agent", "+91 9876543210", "AGT-001", "Sri@1234");
                seedCollectionAgent(userRepository, agentRepository, passwordEncoder, offices, "Techazar", "agent.techazar@greencircuit.com", "Arun Kumar", "+91 9876543210", "TEC-A001", "password123");
                seedCollectionAgent(userRepository, agentRepository, passwordEncoder, offices, "Green Era", "agent.greenera@greencircuit.com", "Karthik Raja", "+91 9845123456", "GRE-A001", "password123");
                seedCollectionAgent(userRepository, agentRepository, passwordEncoder, offices, "Adhira", "agent.adhira@greencircuit.com", "Suresh Raina", "+91 9789012345", "ADH-A001", "password123");
            }
        };
    }

    private void seedCollectionAgent(
            UserRepository userRepository,
            com.greencircuit.backend.modules.agent.repository.CollectionAgentRepository agentRepository,
            PasswordEncoder passwordEncoder,
            List<Office> offices,
            String officeKeyword,
            String email,
            String fullName,
            String mobile,
            String empId,
            String rawPassword
    ) {
        Office targetOffice = offices.stream()
                .filter(o -> o.getOfficeName() != null && o.getOfficeName().toLowerCase().contains(officeKeyword.toLowerCase()))
                .findFirst()
                .orElse(null);

        if (targetOffice != null) {
            User agentUser = userRepository.findByEmail(email).orElse(new User());
            agentUser.setName(fullName);
            agentUser.setEmail(email);
            agentUser.setPassword(passwordEncoder.encode(rawPassword));
            agentUser.setRole(Role.AGENT);
            agentUser.setPhoneNumber(mobile);
            agentUser.setOffice(targetOffice);
            userRepository.save(agentUser);

            com.greencircuit.backend.modules.agent.entity.CollectionAgent agent = agentRepository.findByEmail(email)
                    .orElse(new com.greencircuit.backend.modules.agent.entity.CollectionAgent());
            agent.setFullName(fullName);
            agent.setEmail(email);
            agent.setMobileNumber(mobile);
            agent.setEmployeeId(empId);
            agent.setStatus("ACTIVE");
            agent.setOffice(targetOffice);
            agent.setUser(agentUser);
            agent.setCity(targetOffice.getCity());
            agent.setState(targetOffice.getState());
            agent.setAddress("Logistics Hub, " + targetOffice.getAddress());
            agentRepository.save(agent);

            System.out.println("Seeded/updated collection agent: " + fullName + " (" + email + ") for " + targetOffice.getOfficeName());
        }
    }

    private void seedOfficeStaff(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            List<Office> offices,
            String officeNameKeyword,
            String email,
            String managerName
    ) {
        Office targetOffice = offices.stream()
                .filter(o -> o.getOfficeName() != null && o.getOfficeName().toLowerCase().contains(officeNameKeyword.toLowerCase()))
                .findFirst()
                .orElse(null);

        if (targetOffice != null) {
            User staff = userRepository.findByEmail(email).orElse(new User());
            staff.setName(managerName);
            staff.setEmail(email);
            staff.setPassword(passwordEncoder.encode("password123"));
            staff.setRole(Role.OFFICE);
            staff.setOffice(targetOffice);
            userRepository.save(staff);
            System.out.println("Seeded/updated office user: " + email + " for office: " + targetOffice.getOfficeName());
        }
    }
}
