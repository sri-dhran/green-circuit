package com.greencircuit.backend.modules.pickup.controller;

import com.greencircuit.backend.modules.pickup.entity.PickupRequest;
import com.greencircuit.backend.modules.pickup.service.PickupRequestService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/pickup-requests")
public class PickupRequestController {

    private final PickupRequestService pickupRequestService;

    public PickupRequestController(PickupRequestService pickupRequestService) {
        this.pickupRequestService = pickupRequestService;
    }

    @PostMapping
    public ResponseEntity<?> createRequest(
            Authentication authentication,
            @RequestParam("officeId") Long officeId,
            @RequestParam("deviceName") String deviceName,
            @RequestParam("deviceCategory") String deviceCategory,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("condition") String condition,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            String email = authentication.getName();
            PickupRequest request = pickupRequestService.createRequest(email, officeId, deviceName, deviceCategory, quantity, condition, latitude, longitude, file);
            return ResponseEntity.ok(request);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("File upload failed");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<List<PickupRequest>> getMyRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.getUserRequests(email));
    }

    @GetMapping("/office")
    public ResponseEntity<List<PickupRequest>> getOfficeRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.getOfficeRequests(email));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PickupRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "rejectionReason", required = false) String rejectionReason,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.updateRequestStatus(id, status, rejectionReason, email));
    }

    @PutMapping("/{id}/assign-collector")
    public ResponseEntity<PickupRequest> assignCollector(
            @PathVariable Long id,
            @RequestParam("collectorName") String collectorName,
            @RequestParam("collectorPhone") String collectorPhone,
            @RequestParam("pickupDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam("pickupTime") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime pickupTime,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.assignCollector(id, collectorName, collectorPhone, pickupDate, pickupTime, email));
    }
}
