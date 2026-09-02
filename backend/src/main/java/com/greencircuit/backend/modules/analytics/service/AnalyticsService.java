package com.greencircuit.backend.modules.analytics.service;

import com.greencircuit.backend.modules.pickup.repository.PickupRequestRepository;
import com.greencircuit.backend.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {
    private final PickupRequestRepository requestRepository;
    private final UserRepository userRepository;

    public AnalyticsService(PickupRequestRepository requestRepository, UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalRequests", requestRepository.count());
        
        long completed = requestRepository.findAll().stream().filter(r -> r.getStatus().name().equals("COMPLETED")).count();
        stats.put("completedPickups", completed);
        
        long totalItems = requestRepository.findAll().stream().filter(r -> r.getStatus().name().equals("COMPLETED")).mapToLong(r -> r.getQuantity()).sum();
        stats.put("totalEwasteItemsCollected", totalItems);
        return stats;
    }
}
