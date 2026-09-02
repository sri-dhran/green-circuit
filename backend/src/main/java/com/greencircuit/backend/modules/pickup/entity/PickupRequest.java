package com.greencircuit.backend.modules.pickup.entity;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "pickup_requests")
public class PickupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "office_id")
    private Office office;

    @Column(nullable = false)
    private String deviceName;

    @Column(nullable = false)
    private String deviceCategory;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private String deviceCondition;

    private String photoPath;

    private Double latitude;
    private Double longitude;
    
    private String rejectionReason;

    private String collectorName;
    private String collectorPhoneNumber;
    private LocalDate pickupDate;
    private LocalTime pickupTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING_VERIFICATION;

    private LocalDateTime createdAt = LocalDateTime.now();

    public PickupRequest() {
    }

    public PickupRequest(User user, Office office, String deviceName, String deviceCategory, Integer quantity, String deviceCondition, String photoPath, Double latitude, Double longitude) {
        this.user = user;
        this.office = office;
        this.deviceName = deviceName;
        this.deviceCategory = deviceCategory;
        this.quantity = quantity;
        this.deviceCondition = deviceCondition;
        this.photoPath = photoPath;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Office getOffice() { return office; }
    public void setOffice(Office office) { this.office = office; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getDeviceCategory() { return deviceCategory; }
    public void setDeviceCategory(String deviceCategory) { this.deviceCategory = deviceCategory; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getDeviceCondition() { return deviceCondition; }
    public void setDeviceCondition(String deviceCondition) { this.deviceCondition = deviceCondition; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getCollectorName() { return collectorName; }
    public void setCollectorName(String collectorName) { this.collectorName = collectorName; }

    public String getCollectorPhoneNumber() { return collectorPhoneNumber; }
    public void setCollectorPhoneNumber(String collectorPhoneNumber) { this.collectorPhoneNumber = collectorPhoneNumber; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalTime pickupTime) { this.pickupTime = pickupTime; }
}
