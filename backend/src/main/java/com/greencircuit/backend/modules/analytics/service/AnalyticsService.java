package com.greencircuit.backend.modules.analytics.service;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import com.greencircuit.backend.modules.pickup.entity.PickupRequest;
import com.greencircuit.backend.modules.pickup.entity.RequestStatus;
import com.greencircuit.backend.modules.pickup.repository.PickupRequestRepository;
import com.greencircuit.backend.modules.reward.repository.RewardRedemptionRepository;
import com.greencircuit.backend.modules.user.entity.Role;
import com.greencircuit.backend.modules.user.entity.User;
import com.greencircuit.backend.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final PickupRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;
    private final RewardRedemptionRepository redemptionRepository;

    public AnalyticsService(
            PickupRequestRepository requestRepository,
            UserRepository userRepository,
            OfficeRepository officeRepository,
            RewardRedemptionRepository redemptionRepository
    ) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.officeRepository = officeRepository;
        this.redemptionRepository = redemptionRepository;
    }

    public Map<String, Object> getDashboardStats() {
        return getDashboardStats("all");
    }

    public Map<String, Object> getDashboardStats(String period) {
        Map<String, Object> stats = new HashMap<>();
        String normalizedPeriod = period != null ? period.trim().toLowerCase() : "all";
        stats.put("period", normalizedPeriod);

        // 1. Users Analytics (from users table)
        List<User> allUsers = userRepository.findAll();
        long totalUsers = allUsers.stream().filter(u -> u.getRole() == Role.USER).count();
        long totalRegisteredAccounts = allUsers.size();
        long officeStaffUsers = allUsers.stream().filter(u -> u.getRole() == Role.OFFICE).count();
        long superAdmins = allUsers.stream().filter(u -> u.getRole() == Role.SUPER_ADMIN).count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalRegisteredAccounts", totalRegisteredAccounts);
        stats.put("registeredIndividuals", totalUsers);
        stats.put("officeStaffUsers", officeStaffUsers);
        stats.put("superAdminUsers", superAdmins);

        // 2. Collection Offices Analytics (from offices table)
        List<Office> allOffices = officeRepository.findAll();
        long totalOffices = allOffices.size();
        long activeOffices = allOffices.stream()
                .filter(o -> o.getStatus() == null || "ACTIVE".equalsIgnoreCase(o.getStatus()))
                .count();
        long inactiveOffices = totalOffices - activeOffices;

        stats.put("totalCollectionOffices", totalOffices);
        stats.put("activeOffices", activeOffices);
        stats.put("inactiveOffices", inactiveOffices);

        // 3. Pickup Requests Analytics with date period filtering
        List<PickupRequest> allRequests = requestRepository.findAll();
        LocalDateTime cutoff = getCutoffDateTime(normalizedPeriod);
        List<PickupRequest> filteredRequests = allRequests;
        if (cutoff != null) {
            filteredRequests = allRequests.stream()
                    .filter(r -> r.getCreatedAt() != null && (r.getCreatedAt().isAfter(cutoff) || r.getCreatedAt().isEqual(cutoff)))
                    .collect(Collectors.toList());
        }

        stats.put("totalRequests", filteredRequests.size());
        stats.put("totalPickupRequests", filteredRequests.size());

        // Status Counts
        long pending = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.PENDING).count();
        long accepted = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.ACCEPTED).count();
        long scheduled = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.PICKUP_SCHEDULED).count();
        long collected = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.COLLECTED).count();
        long receivedAtOffice = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.RECEIVED_AT_OFFICE).count();
        long recycled = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.RECYCLED).count();
        long completed = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.COMPLETED).count();
        long rejected = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.REJECTED).count();
        long cancelled = filteredRequests.stream().filter(r -> r.getStatus() == RequestStatus.CANCELLED).count();

        long completedTotal = completed + recycled;
        stats.put("completedPickups", completedTotal);
        stats.put("pendingRequests", pending);
        stats.put("acceptedRequests", accepted);
        stats.put("scheduledRequests", scheduled);
        stats.put("collectedRequests", collected);
        stats.put("receivedAtOfficeRequests", receivedAtOffice);
        stats.put("recycledRequests", recycled);
        stats.put("completedRequests", completed);
        stats.put("rejectedRequests", rejected);
        stats.put("cancelledRequests", cancelled);

        // 4. Total E-Waste Items Saved (Sum of actual quantities of collected/processed items)
        long totalItemsCollected = filteredRequests.stream()
                .filter(r -> r.getStatus() == RequestStatus.COLLECTED ||
                             r.getStatus() == RequestStatus.RECEIVED_AT_OFFICE ||
                             r.getStatus() == RequestStatus.RECYCLED ||
                             r.getStatus() == RequestStatus.COMPLETED)
                .mapToLong(r -> r.getQuantity() != null ? r.getQuantity() : 1)
                .sum();
        stats.put("totalEwasteItemsCollected", totalItemsCollected);
        stats.put("totalRecycledItems", totalItemsCollected);

        // 5. Total Reward Points Distributed
        long currentBalances = allUsers.stream()
                .mapToLong(u -> u.getRewardPoints() != null ? u.getRewardPoints() : 0)
                .sum();
        long redeemedPoints = redemptionRepository.findAll().stream()
                .mapToLong(r -> r.getRewardItem() != null ? r.getRewardItem().getPointsCost() : 0)
                .sum();
        long totalPointsDistributed = currentBalances + redeemedPoints;
        stats.put("totalRewardPointsDistributed", totalPointsDistributed);

        // 6. Category Breakdown Analytics
        Map<String, List<PickupRequest>> categoryGroups = filteredRequests.stream()
                .collect(Collectors.groupingBy(r -> r.getDeviceCategory() != null && !r.getDeviceCategory().isBlank()
                        ? r.getDeviceCategory().trim()
                        : "Other E-Waste"));

        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        categoryGroups.forEach((category, requests) -> {
            Map<String, Object> catMap = new HashMap<>();
            catMap.put("category", category);
            catMap.put("count", requests.size());
            long totalQuantity = requests.stream().mapToLong(r -> r.getQuantity() != null ? r.getQuantity() : 1).sum();
            catMap.put("totalQuantity", totalQuantity);
            categoryBreakdown.add(catMap);
        });

        // Sort categories descending by count
        categoryBreakdown.sort((a, b) -> Integer.compare(
                ((Number) b.get("count")).intValue(),
                ((Number) a.get("count")).intValue()
        ));
        stats.put("categoryBreakdown", categoryBreakdown);

        // 7. Recent Submissions preview (top 5)
        List<Map<String, Object>> recentRequests = allRequests.stream()
                .sorted(Comparator.comparing(PickupRequest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("deviceName", r.getDeviceName());
                    map.put("category", r.getDeviceCategory());
                    map.put("quantity", r.getQuantity() != null ? r.getQuantity() : 1);
                    map.put("status", r.getStatus() != null ? r.getStatus().name() : "PENDING");
                    map.put("userEmail", r.getUser() != null ? r.getUser().getEmail() : "N/A");
                    map.put("userName", r.getUser() != null ? r.getUser().getName() : "N/A");
                    map.put("officeName", r.getOffice() != null ? r.getOffice().getOfficeName() : "N/A");
                    map.put("createdAt", r.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());
        stats.put("recentRequests", recentRequests);

        return stats;
    }

    private LocalDateTime getCutoffDateTime(String period) {
        LocalDateTime now = LocalDateTime.now();
        switch (period) {
            case "today":
                return now.toLocalDate().atStartOfDay();
            case "week":
                return now.minusDays(7);
            case "month":
                return now.minusMonths(1);
            case "year":
                return now.minusYears(1);
            case "all":
            default:
                return null;
        }
    }
}
