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
    ) throws IOException {
        String email = authentication.getName();
        PickupRequest request = pickupRequestService.createRequest(
                email, officeId, deviceName, deviceCategory, brand, model, quantity, 
                description, approximateWeight, latitude, longitude, userLocation, file);
        return ResponseEntity.ok(request);
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
    public ResponseEntity<PickupRequest> getRequestById(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.getRequestById(id, email));
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<PickupRequest> acceptRequest(
            @PathVariable Long id,
            @RequestParam(value = "response", required = false) String response,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.acceptRequest(id, response, email));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<PickupRequest> rejectRequest(
            @PathVariable Long id,
            @RequestParam(value = "response", required = false) String response,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.rejectRequest(id, response, email));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PickupRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam("status") String status,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.updateRequestStatus(id, status, null, email));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<PickupRequest> updateStatusOld(
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

    @PutMapping("/{id}/assign-agent")
    public ResponseEntity<PickupRequest> assignAgent(
            @PathVariable Long id,
            @RequestParam("agentId") Long agentId,
            @RequestParam(value = "pickupDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate pickupDate,
            @RequestParam(value = "pickupTime", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime pickupTime,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(pickupRequestService.assignAgent(id, agentId, pickupDate, pickupTime, email));
    }
}
