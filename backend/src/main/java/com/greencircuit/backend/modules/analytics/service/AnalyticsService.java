package com.greencircuit.backend.modules.analytics.service;

import com.greencircuit.backend.modules.pickup.entity.RequestStatus;
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
        
        var allRequests = requestRepository.findAll();
        
        long completed = allRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.COLLECTED || r.getStatus() == RequestStatus.RECYCLED)
                .count();
        stats.put("completedPickups", completed);
        
        long totalItems = allRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.COLLECTED || r.getStatus() == RequestStatus.RECYCLED)
                .mapToLong(r -> r.getQuantity())
                .sum();
        stats.put("totalEwasteItemsCollected", totalItems);
        return stats;
    }
}
