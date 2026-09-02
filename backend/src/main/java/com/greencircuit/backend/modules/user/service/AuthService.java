package com.greencircuit.backend.modules.user.service;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import com.greencircuit.backend.modules.user.dto.AuthRequest;
import com.greencircuit.backend.modules.user.dto.AuthResponse;
import com.greencircuit.backend.modules.user.dto.RegisterRequest;
import com.greencircuit.backend.modules.user.entity.Role;
import com.greencircuit.backend.modules.user.entity.User;
import com.greencircuit.backend.modules.user.repository.UserRepository;
import com.greencircuit.backend.modules.user.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, OfficeRepository officeRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.officeRepository = officeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        Role role;
        try {
            role = Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role specified");
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                role
        );

        if (role == Role.OFFICE) {
            if (request.getOfficeId() == null) {
                throw new IllegalArgumentException("Office ID is required when registering as an OFFICE user");
            }
            Office office = officeRepository.findById(request.getOfficeId())
                    .orElseThrow(() -> new IllegalArgumentException("Office not found"));
            user.setOffice(office);
        }

        userRepository.save(user);

        String jwtToken = jwtUtil.generateToken(user);
        return new AuthResponse(jwtToken, user.getName(), user.getEmail(), user.getRole().name(), user.getRewardPoints());
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        String jwtToken = jwtUtil.generateToken(user);
        return new AuthResponse(jwtToken, user.getName(), user.getEmail(), user.getRole().name(), user.getRewardPoints());
    }
}
