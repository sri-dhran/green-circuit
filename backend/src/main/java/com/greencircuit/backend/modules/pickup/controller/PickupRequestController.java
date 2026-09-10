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
@RequestMapping({"/api/pickup-requests", "/api/collection-requests"})
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
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "model", required = false) String model,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("description") String description,
            @RequestParam(value = "approximateWeight", required = false) Double approximateWeight,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestParam(value = "userLocation", required = false) String userLocation,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        try {
            String email = authentication.getName();
            PickupRequest request = pickupRequestService.createRequest(
                    email, officeId, deviceName, deviceCategory, brand, model, quantity, 
                    description, approximateWeight, latitude, longitude, userLocation, file);
            return ResponseEntity.ok(request);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("File upload failed");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<PickupRequest>> getUserRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.getUserRequests(email));
    }

    // Keeping /me for backward compatibility
    @GetMapping("/me")
    public ResponseEntity<List<PickupRequest>> getMyRequests(Authentication authentication) {
        return getUserRequests(authentication);
    }

    @GetMapping("/collector")
    public ResponseEntity<List<PickupRequest>> getCollectorRequests(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.getOfficeRequests(email));
    }

    // Keeping /office for backward compatibility
    @GetMapping("/office")
    public ResponseEntity<List<PickupRequest>> getOfficeRequests(Authentication authentication) {
        return getCollectorRequests(authentication);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        try {
            return ResponseEntity.ok(pickupRequestService.getRequestById(id, email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<?> acceptRequest(
            @PathVariable Long id,
            @RequestParam(value = "response", required = false) String response,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(pickupRequestService.acceptRequest(id, response, email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<?> rejectRequest(
            @PathVariable Long id,
            @RequestParam(value = "response", required = false) String response,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(pickupRequestService.rejectRequest(id, response, email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(pickupRequestService.updateRequestStatus(id, status, null, email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatusOld(
            @PathVariable Long id,
            @RequestParam("status") String status,
            @RequestParam(value = "rejectionReason", required = false) String rejectionReason,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(pickupRequestService.updateRequestStatus(id, status, rejectionReason, email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/assign-collector")
    public ResponseEntity<?> assignCollector(
            @PathVariable Long id,
            @RequestParam("collectorName") String collectorName,
            @RequestParam("collectorPhone") String collectorPhone,
            @RequestParam("pickupDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam("pickupTime") @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime pickupTime,
            Authentication authentication
    ) {
        try {
            String email = authentication.getName();
            return ResponseEntity.ok(pickupRequestService.assignCollector(id, collectorName, collectorPhone, pickupDate, pickupTime, email));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
