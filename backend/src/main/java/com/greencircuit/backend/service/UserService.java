package com.greencircuit.backend.service;

import com.greencircuit.backend.dto.UserProfileDTO;
import com.greencircuit.backend.entity.User;
import com.greencircuit.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileDTO getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return new UserProfileDTO(
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getRewardPoints()
        );
    }
}
