package com.greencircuit.backend.modules.user.service;

import com.greencircuit.backend.modules.user.dto.UserProfileDTO;
import com.greencircuit.backend.modules.user.entity.User;
import com.greencircuit.backend.modules.user.repository.UserRepository;
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
        
        UserProfileDTO dto = new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.getRewardPoints(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getCity(),
                user.getProfileImageUrl()
        );

        if (user.getOffice() != null) {
            dto.setOfficeId(user.getOffice().getId());
            dto.setOfficeName(user.getOffice().getOfficeName());
        }

        return dto;
    }

    public UserProfileDTO updateProfile(String email, com.greencircuit.backend.modules.user.dto.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        String rawPhone = request.getMobileNumber() != null ? request.getMobileNumber() : request.getPhoneNumber();
        if (rawPhone != null && !rawPhone.isBlank()) {
            String cleaned = rawPhone.replaceAll("[\\s\\-\\(\\)]", "");
            if (cleaned.length() == 10) {
                user.setPhoneNumber("+91 " + cleaned);
            } else {
                user.setPhoneNumber(cleaned);
            }
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        if (request.getCity() != null) {
            user.setCity(request.getCity().trim());
        }

        if (request.getProfileImageUrl() != null) {
            user.setProfileImageUrl(request.getProfileImageUrl().trim());
        }

        userRepository.save(user);
        return getUserProfileByEmail(email);
    }
}
