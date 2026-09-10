package com.greencircuit.backend.modules.pickup.service;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.center.repository.OfficeRepository;
import com.greencircuit.backend.modules.notification.entity.Notification;
import com.greencircuit.backend.modules.notification.repository.NotificationRepository;
import com.greencircuit.backend.modules.notification.service.EmailService;
import com.greencircuit.backend.modules.pickup.entity.PickupRequest;
import com.greencircuit.backend.modules.pickup.entity.RequestStatus;
import com.greencircuit.backend.modules.pickup.repository.PickupRequestRepository;
import com.greencircuit.backend.modules.user.entity.User;
import com.greencircuit.backend.modules.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class PickupRequestService {

    private final PickupRequestRepository pickupRequestRepository;
    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    private final String UPLOAD_DIR = "uploads/";

    public PickupRequestService(PickupRequestRepository pickupRequestRepository, UserRepository userRepository, OfficeRepository officeRepository, NotificationRepository notificationRepository, EmailService emailService) {
        this.pickupRequestRepository = pickupRequestRepository;
        this.userRepository = userRepository;
        this.officeRepository = officeRepository;
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
        
        // Ensure upload directory exists
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public PickupRequest createRequest(String userEmail, Long officeId, String deviceName, String deviceCategory, String brand, String model, Integer quantity, String description, Double approximateWeight, Double latitude, Double longitude, String userLocation, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Office office = officeRepository.findById(officeId)
                .orElseThrow(() -> new IllegalArgumentException("Office not found"));

        if (!"ACTIVE".equals(office.getStatus())) {
            throw new IllegalArgumentException("Selected collection center is not active.");
        }

        String photoPath = null;
        if (file != null && !file.isEmpty()) {
            // Validation can go here (type, size)
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, newFilename);
            Files.copy(file.getInputStream(), filePath);
            photoPath = "/uploads/" + newFilename;
        }

        PickupRequest request = new PickupRequest(user, office, deviceName, deviceCategory, brand, model, quantity, description, approximateWeight, photoPath, latitude, longitude, userLocation);
        PickupRequest saved = pickupRequestRepository.save(request);

        // Notify User
        String msg = "Your e-waste collection request has been sent to " + office.getOfficeName() + ".";
        createAndSendNotification(user, msg, "Green Circuit - Request Sent");

        return saved;
    }

    public List<PickupRequest> getUserRequests(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return pickupRequestRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<PickupRequest> getOfficeRequests(String officeEmail) {
        User user = userRepository.findByEmail(officeEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Office office = user.getOffice();
        if (office == null) {
            throw new IllegalArgumentException("This account is not linked to an office");
        }
        
        return pickupRequestRepository.findByOfficeOrderByCreatedAtDesc(office);
    }

    public PickupRequest getRequestById(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        PickupRequest request = pickupRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));

        // Validate access
        if (!request.getUser().getId().equals(user.getId()) && 
            (user.getOffice() == null || !request.getOffice().getId().equals(user.getOffice().getId()))) {
            throw new IllegalArgumentException("Unauthorized to view this request");
        }

        return request;
    }

    public PickupRequest acceptRequest(Long id, String response, String collectorEmail) {
        PickupRequest request = getAndValidateCollectorAccess(id, collectorEmail);

        request.setStatus(RequestStatus.ACCEPTED);
        request.setAcceptedAt(LocalDateTime.now());
        if (response != null) request.setCollectorResponse(response);

        PickupRequest saved = pickupRequestRepository.save(request);

        String msg = request.getOffice().getOfficeName() + " has accepted your e-waste collection request.";
        createAndSendNotification(request.getUser(), msg, "Green Circuit - Request Accepted");

        return saved;
    }

    public PickupRequest rejectRequest(Long id, String response, String collectorEmail) {
        PickupRequest request = getAndValidateCollectorAccess(id, collectorEmail);

        request.setStatus(RequestStatus.REJECTED);
        request.setRejectedAt(LocalDateTime.now());
        if (response != null) request.setCollectorResponse(response);

        PickupRequest saved = pickupRequestRepository.save(request);

        String msg = request.getOffice().getOfficeName() + " has rejected your e-waste collection request. You can select another nearby collector.";
        createAndSendNotification(request.getUser(), msg, "Green Circuit - Request Rejected");

        return saved;
    }

    public PickupRequest updateRequestStatus(Long requestId, String status, String response, String collectorEmail) {
        PickupRequest request = getAndValidateCollectorAccess(requestId, collectorEmail);
        
        RequestStatus newStatus = RequestStatus.valueOf(status);
        request.setStatus(newStatus);
        
        if (response != null) {
            request.setCollectorResponse(response);
        }

        if (newStatus == RequestStatus.COLLECTED || newStatus == RequestStatus.RECYCLED) {
            request.setCompletedAt(LocalDateTime.now());
            if (newStatus == RequestStatus.RECYCLED && request.getStatus() != RequestStatus.RECYCLED) {
                User requestUser = request.getUser();
                requestUser.setRewardPoints(requestUser.getRewardPoints() + 10);
                userRepository.save(requestUser);
            }
        }

        PickupRequest saved = pickupRequestRepository.save(request);

        // Notifications for other statuses
        if (newStatus == RequestStatus.COLLECTED) {
            createAndSendNotification(request.getUser(), "Your e-waste has been successfully collected.", "Green Circuit - E-Waste Collected");
        } else if (newStatus == RequestStatus.RECYCLED) {
            createAndSendNotification(request.getUser(), "Your e-waste has been successfully processed for recycling.", "Green Circuit - E-Waste Recycled");
        }
        
        return saved;
    }

    public PickupRequest assignCollector(Long requestId, String collectorName, String collectorPhone, LocalDate date, LocalTime time, String officeEmail) {
        PickupRequest request = getAndValidateCollectorAccess(requestId, officeEmail);
        
        request.setCollectorName(collectorName);
        request.setCollectorPhoneNumber(collectorPhone);
        request.setPickupDate(date);
        request.setPickupTime(time);
        request.setStatus(RequestStatus.PICKUP_SCHEDULED);

        PickupRequest updated = pickupRequestRepository.save(request);

        String message = String.format("Your e-waste pickup has been scheduled for %s at %s.",
                date.toString(), time.toString());
        
        createAndSendNotification(request.getUser(), message, "Green Circuit - Pickup Scheduled");

        return updated;
    }

    private PickupRequest getAndValidateCollectorAccess(Long requestId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        if (user.getOffice() == null) {
            throw new IllegalArgumentException("User is not a collector");
        }

        PickupRequest request = pickupRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        
        if (!request.getOffice().getId().equals(user.getOffice().getId())) {
            throw new IllegalArgumentException("Unauthorized to modify this request");
        }

        return request;
    }

    private void createAndSendNotification(User user, String message, String subject) {
        Notification notification = new Notification(user, message);
        notificationRepository.save(notification);
        try {
            emailService.sendEmail(user.getEmail(), subject, message);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
        }
    }
}
