package com.greencircuit.backend.service;

import com.greencircuit.backend.entity.Office;
import com.greencircuit.backend.entity.PickupRequest;
import com.greencircuit.backend.entity.User;
import com.greencircuit.backend.repository.OfficeRepository;
import com.greencircuit.backend.repository.PickupRequestRepository;
import com.greencircuit.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import com.greencircuit.backend.entity.Notification;
import com.greencircuit.backend.repository.NotificationRepository;
import com.greencircuit.backend.entity.RequestStatus;

@Service
public class PickupRequestService {

    private final PickupRequestRepository pickupRequestRepository;
    private final UserRepository userRepository;
    private final OfficeRepository officeRepository;
    private final NotificationRepository notificationRepository;

    private final String UPLOAD_DIR = "uploads/";

    public PickupRequestService(PickupRequestRepository pickupRequestRepository, UserRepository userRepository, OfficeRepository officeRepository, NotificationRepository notificationRepository) {
        this.pickupRequestRepository = pickupRequestRepository;
        this.userRepository = userRepository;
        this.officeRepository = officeRepository;
        this.notificationRepository = notificationRepository;
        
        // Ensure upload directory exists
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    public PickupRequest createRequest(String userEmail, Long officeId, String deviceName, String deviceCategory, Integer quantity, String condition, Double latitude, Double longitude, MultipartFile file) throws IOException {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        Office office = officeRepository.findById(officeId)
                .orElseThrow(() -> new IllegalArgumentException("Office not found"));

        String photoPath = null;
        if (file != null && !file.isEmpty()) {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, newFilename);
            Files.copy(file.getInputStream(), filePath);
            photoPath = "/uploads/" + newFilename;
        }

        PickupRequest request = new PickupRequest(user, office, deviceName, deviceCategory, quantity, condition, photoPath, latitude, longitude);
        return pickupRequestRepository.save(request);
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

    public PickupRequest updateRequestStatus(Long requestId, String status, String rejectionReason, String officeEmail) {
        PickupRequest request = pickupRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        
        RequestStatus newStatus = RequestStatus.valueOf(status);
        request.setStatus(newStatus);
        
        if (newStatus == RequestStatus.REJECTED && rejectionReason != null) {
            request.setRejectionReason(rejectionReason);
        }

        PickupRequest updated = pickupRequestRepository.save(request);
        
        // Notify user
        String message = "Your pickup request for " + request.getDeviceName() + " has been " + newStatus.name();
        if (newStatus == RequestStatus.REJECTED && rejectionReason != null) {
            message += ". Reason: " + rejectionReason;
        }
        
        Notification notification = new Notification(request.getUser(), message);
        notificationRepository.save(notification);

        return updated;
    }

    public PickupRequest assignCollector(Long requestId, String collectorName, String collectorPhone, LocalDate date, LocalTime time, String officeEmail) {
        PickupRequest request = pickupRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Request not found"));
        
        request.setCollectorName(collectorName);
        request.setCollectorPhoneNumber(collectorPhone);
        request.setPickupDate(date);
        request.setPickupTime(time);
        request.setStatus(RequestStatus.COLLECTOR_ASSIGNED);

        PickupRequest updated = pickupRequestRepository.save(request);

        String message = String.format("A collector (%s) has been assigned for your pickup on %s at %s. Contact: %s",
                collectorName, date.toString(), time.toString(), collectorPhone);
        
        Notification notification = new Notification(request.getUser(), message);
        notificationRepository.save(notification);

        return updated;
    }
}
