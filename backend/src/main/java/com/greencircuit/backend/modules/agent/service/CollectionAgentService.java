package com.greencircuit.backend.modules.agent.service;

import com.greencircuit.backend.modules.agent.dto.AgentDashboardDTO;
import com.greencircuit.backend.modules.agent.dto.AgentResponseDTO;
import com.greencircuit.backend.modules.agent.dto.CreateAgentDTO;
import com.greencircuit.backend.modules.agent.dto.UpdateAgentDTO;
import com.greencircuit.backend.modules.agent.entity.CollectionAgent;
import com.greencircuit.backend.modules.agent.repository.CollectionAgentRepository;
import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import com.greencircuit.backend.modules.notification.entity.Notification;
import com.greencircuit.backend.modules.notification.repository.NotificationRepository;
import com.greencircuit.backend.modules.pickup.entity.PickupRequest;
import com.greencircuit.backend.modules.pickup.entity.RequestStatus;
import com.greencircuit.backend.modules.pickup.repository.PickupRequestRepository;
import com.greencircuit.backend.modules.user.entity.Role;
import com.greencircuit.backend.modules.user.entity.User;
import com.greencircuit.backend.modules.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CollectionAgentService {

    private final CollectionAgentRepository agentRepository;
    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;
    private final PickupRequestRepository pickupRequestRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public CollectionAgentService(
            CollectionAgentRepository agentRepository,
            UserRepository userRepository,
            OfficeRepository officeRepository,
            PickupRequestRepository pickupRequestRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
        this.officeRepository = officeRepository;
        this.pickupRequestRepository = pickupRequestRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AgentResponseDTO createAgent(String officeUserEmail, CreateAgentDTO dto) {
        User officeUser = userRepository.findByEmail(officeUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("Office user not found"));

        Office office = officeUser.getOffice();
        if (office == null && officeUser.getRole() == Role.SUPER_ADMIN) {
            // For super admin, fallback to first active office if office not assigned
            office = officeRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("No collection office found in registry"));
        } else if (office == null) {
            throw new IllegalArgumentException("You are not associated with any collection office");
        }

        // Check duplicate email
        String email = dto.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent() || agentRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("An account with this email address already exists");
        }

        // Normalize mobile number
        String mobile = normalizeMobileNumber(dto.getMobileNumber());

        // 1. Create linked User account for agent login
        User agentUser = new User();
        agentUser.setName(dto.getFullName().trim());
        agentUser.setEmail(email);
        agentUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        agentUser.setRole(Role.AGENT);
        agentUser.setPhoneNumber(mobile);
        agentUser.setAddress(dto.getAddress());
        agentUser.setCity(dto.getCity());
        agentUser.setOffice(office);
        agentUser.setRewardPoints(0);
        userRepository.save(agentUser);

        // 2. Create CollectionAgent record
        CollectionAgent agent = new CollectionAgent();
        agent.setFullName(dto.getFullName().trim());
        agent.setMobileNumber(mobile);
        agent.setEmail(email);
        agent.setAddress(dto.getAddress());
        agent.setCity(dto.getCity());
        agent.setState(dto.getState() != null ? dto.getState() : office.getState());
        agent.setPincode(dto.getPincode());
        agent.setProfileImageUrl(dto.getProfileImageUrl());
        agent.setEmployeeId(dto.getEmployeeId() != null && !dto.getEmployeeId().isBlank() 
                ? dto.getEmployeeId() 
                : generateEmployeeId(office));
        agent.setStatus("ACTIVE");
        agent.setOffice(office);
        agent.setUser(agentUser);
        agentRepository.save(agent);

        // Send confirmation notification
        notificationRepository.save(new Notification(
                agentUser,
                "Welcome to Green Circuit Logistics! Your collection agent profile has been registered under " + office.getOfficeName() + "."
        ));

        return toDTO(agent);
    }

    public List<AgentResponseDTO> getAgentsForOffice(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<CollectionAgent> agents;
        if (user.getRole() == Role.SUPER_ADMIN && user.getOffice() == null) {
            agents = agentRepository.findAll();
        } else if (user.getOffice() != null) {
            agents = agentRepository.findByOffice(user.getOffice());
        } else {
            throw new IllegalArgumentException("No collection office assigned to this account");
        }

        return agents.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AgentResponseDTO getAgentById(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        CollectionAgent agent = agentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection agent not found"));

        if (user.getRole() != Role.SUPER_ADMIN && (user.getOffice() == null || !user.getOffice().getId().equals(agent.getOffice().getId()))) {
            throw new IllegalArgumentException("You are not authorized to view this collection agent");
        }

        return toDTO(agent);
    }

    @Transactional
    public AgentResponseDTO updateAgent(Long id, UpdateAgentDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        CollectionAgent agent = agentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection agent not found"));

        if (user.getRole() != Role.SUPER_ADMIN && (user.getOffice() == null || !user.getOffice().getId().equals(agent.getOffice().getId()))) {
            throw new IllegalArgumentException("You are not authorized to modify this collection agent");
        }

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            agent.setFullName(dto.getFullName().trim());
            if (agent.getUser() != null) {
                agent.getUser().setName(dto.getFullName().trim());
            }
        }

        if (dto.getMobileNumber() != null && !dto.getMobileNumber().isBlank()) {
            String mobile = normalizeMobileNumber(dto.getMobileNumber());
            agent.setMobileNumber(mobile);
            if (agent.getUser() != null) {
                agent.getUser().setPhoneNumber(mobile);
            }
        }

        if (dto.getAddress() != null) agent.setAddress(dto.getAddress());
        if (dto.getCity() != null) agent.setCity(dto.getCity());
        if (dto.getState() != null) agent.setState(dto.getState());
        if (dto.getPincode() != null) agent.setPincode(dto.getPincode());
        if (dto.getProfileImageUrl() != null) agent.setProfileImageUrl(dto.getProfileImageUrl());
        if (dto.getEmployeeId() != null) agent.setEmployeeId(dto.getEmployeeId());
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) agent.setStatus(dto.getStatus().toUpperCase());

        agentRepository.save(agent);
        if (agent.getUser() != null) {
            userRepository.save(agent.getUser());
        }

        return toDTO(agent);
    }

    @Transactional
    public AgentResponseDTO toggleStatus(Long id, String status, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        CollectionAgent agent = agentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Collection agent not found"));

        if (user.getRole() != Role.SUPER_ADMIN && (user.getOffice() == null || !user.getOffice().getId().equals(agent.getOffice().getId()))) {
            throw new IllegalArgumentException("You are not authorized to update this collection agent");
        }

        agent.setStatus("INACTIVE".equalsIgnoreCase(status) ? "INACTIVE" : "ACTIVE");
        agentRepository.save(agent);

        return toDTO(agent);
    }

    // ── Collection Agent Portal Methods ──────────────────────────────────────────

    public CollectionAgent getAgentForUser(String agentUserEmail) {
        User user = userRepository.findByEmail(agentUserEmail)
                .orElseThrow(() -> new IllegalArgumentException("Agent user account not found"));

        return agentRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("No collection agent profile linked with this login"));
    }

    public AgentDashboardDTO getAgentDashboardStats(String agentUserEmail) {
        CollectionAgent agent = getAgentForUser(agentUserEmail);

        long totalAssigned = pickupRequestRepository.countByAgent(agent);
        long pending = pickupRequestRepository.countByAgentAndStatusIn(
                agent,
                Set.of(RequestStatus.PENDING, RequestStatus.ACCEPTED, RequestStatus.ASSIGNED, RequestStatus.PICKUP_SCHEDULED, RequestStatus.ON_THE_WAY)
        );
        long completed = pickupRequestRepository.countByAgentAndStatusIn(
                agent,
                Set.of(RequestStatus.COLLECTED, RequestStatus.RECEIVED_AT_OFFICE, RequestStatus.RECYCLED, RequestStatus.COMPLETED)
        );

        // Today's pickups
        List<PickupRequest> requests = pickupRequestRepository.findByAgentOrderByCreatedAtDesc(agent);
        LocalDate today = LocalDate.now();
        long todayPickups = requests.stream()
                .filter(r -> (r.getPickupDate() != null && r.getPickupDate().isEqual(today))
                        || (r.getCreatedAt() != null && r.getCreatedAt().toLocalDate().isEqual(today)))
                .count();

        return new AgentDashboardDTO(totalAssigned, pending, todayPickups, completed);
    }

    public List<PickupRequest> getAgentAssignedRequests(String agentUserEmail, String statusStr) {
        CollectionAgent agent = getAgentForUser(agentUserEmail);

        if (statusStr != null && !statusStr.isBlank() && !"ALL".equalsIgnoreCase(statusStr)) {
            try {
                RequestStatus st = RequestStatus.valueOf(statusStr.toUpperCase());
                return pickupRequestRepository.findByAgentAndStatusOrderByCreatedAtDesc(agent, st);
            } catch (IllegalArgumentException ignored) {
            }
        }

        return pickupRequestRepository.findByAgentOrderByCreatedAtDesc(agent);
    }

    public PickupRequest getAgentRequestById(Long requestId, String agentUserEmail) {
        CollectionAgent agent = getAgentForUser(agentUserEmail);
        PickupRequest request = pickupRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Pickup request not found"));

        if (request.getAgent() == null || !request.getAgent().getId().equals(agent.getId())) {
            throw new IllegalArgumentException("You are not authorized to view this request");
        }

        return request;
    }

    @Transactional
    public PickupRequest updateAgentRequestStatus(Long requestId, String statusStr, String remarks, String proofUrl, String agentUserEmail) {
        CollectionAgent agent = getAgentForUser(agentUserEmail);
        PickupRequest request = pickupRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Pickup request not found"));

        if (request.getAgent() == null || !request.getAgent().getId().equals(agent.getId())) {
            throw new IllegalArgumentException("You are not assigned to this pickup request");
        }

        RequestStatus newStatus;
        try {
            newStatus = RequestStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + statusStr);
        }

        request.setStatus(newStatus);
        if (remarks != null && !remarks.isBlank()) {
            request.setAgentRemarks(remarks.trim());
        }
        if (proofUrl != null && !proofUrl.isBlank()) {
            request.setPickupProofUrl(proofUrl.trim());
        }

        if (newStatus == RequestStatus.COLLECTED) {
            notificationRepository.save(new Notification(
                    request.getUser(),
                    "Your e-waste for request REQ-" + request.getId() + " (" + request.getDeviceName() + ") has been collected by agent " + agent.getFullName() + "."
            ));
        } else if (newStatus == RequestStatus.ON_THE_WAY) {
            notificationRepository.save(new Notification(
                    request.getUser(),
                    "Collection Agent " + agent.getFullName() + " is on the way for your e-waste pickup (REQ-" + request.getId() + ")."
            ));
        } else if (newStatus == RequestStatus.RECEIVED_AT_OFFICE) {
            notificationRepository.save(new Notification(
                    request.getUser(),
                    "Your e-waste for request REQ-" + request.getId() + " safely arrived at " + request.getOffice().getOfficeName() + " for inspection."
            ));
        } else if (newStatus == RequestStatus.COMPLETED || newStatus == RequestStatus.RECYCLED) {
            request.setCompletedAt(LocalDateTime.now());
            // Award reward points if not already awarded
            User u = request.getUser();
            int points = request.getQuantity() != null ? request.getQuantity() * 50 : 50;
            u.setRewardPoints((u.getRewardPoints() != null ? u.getRewardPoints() : 0) + points);
            userRepository.save(u);

            notificationRepository.save(new Notification(
                    u,
                    "Your e-waste (REQ-" + request.getId() + ") has been processed for eco-friendly recycling! +" + points + " reward points credited."
            ));
        }

        return pickupRequestRepository.save(request);
    }

    // ── Helper Mapping ─────────────────────────────────────────────────────────

    public AgentResponseDTO toDTO(CollectionAgent agent) {
        AgentResponseDTO dto = new AgentResponseDTO();
        dto.setId(agent.getId());
        dto.setFullName(agent.getFullName());
        dto.setMobileNumber(agent.getMobileNumber());
        dto.setEmail(agent.getEmail());
        dto.setAddress(agent.getAddress());
        dto.setCity(agent.getCity());
        dto.setState(agent.getState());
        dto.setPincode(agent.getPincode());
        dto.setProfileImageUrl(agent.getProfileImageUrl());
        dto.setEmployeeId(agent.getEmployeeId());
        dto.setStatus(agent.getStatus());
        dto.setCreatedAt(agent.getCreatedAt());
        dto.setUpdatedAt(agent.getUpdatedAt());

        if (agent.getOffice() != null) {
            dto.setOfficeId(agent.getOffice().getId());
            dto.setOfficeName(agent.getOffice().getOfficeName());
        }

        if (agent.getUser() != null) {
            dto.setUserId(agent.getUser().getId());
        }

        long assigned = pickupRequestRepository.countByAgent(agent);
        long completed = pickupRequestRepository.countByAgentAndStatusIn(
                agent,
                Set.of(RequestStatus.COLLECTED, RequestStatus.RECEIVED_AT_OFFICE, RequestStatus.RECYCLED, RequestStatus.COMPLETED)
        );
        dto.setAssignedRequestsCount(assigned);
        dto.setCompletedPickupsCount(completed);

        return dto;
    }

    private String normalizeMobileNumber(String raw) {
        if (raw == null) return "";
        String cleaned = raw.replaceAll("[\\s\\-\\(\\)]", "");
        if (cleaned.startsWith("+91")) return cleaned;
        if (cleaned.length() == 10) return "+91 " + cleaned;
        return cleaned;
    }

    private String generateEmployeeId(Office office) {
        long count = agentRepository.countByOffice(office) + 1;
        String prefix = office.getOfficeName() != null && office.getOfficeName().length() >= 3
                ? office.getOfficeName().substring(0, 3).toUpperCase()
                : "AGT";
        return prefix + "-A" + String.format("%03d", count);
    }
}
