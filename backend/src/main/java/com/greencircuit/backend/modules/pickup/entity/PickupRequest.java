package com.greencircuit.backend.modules.pickup.entity;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "pickup_requests") // Also represents collection_requests
public class PickupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    @JoinColumn(name = "office_id") // Serves as collection_center_id
    private Office office;

    @Column(nullable = false)
    private String deviceName;

    @Column(nullable = false)
    private String deviceCategory;
    
    private String brand;
    private String model;

    @Column(nullable = false)
    private Integer quantity;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    private Double approximateWeight;

    @Column(name = "image_url")
    private String photoPath;

    @Column(name = "user_latitude")
    private Double latitude;
    
    @Column(name = "user_longitude")
    private Double longitude;
    
    @Column(name = "user_location")
    private String userLocation;

    @Column(columnDefinition = "TEXT")
    private String collectorResponse;

    private String collectorName;
    private String collectorPhoneNumber;
    private LocalDate pickupDate;
    private LocalTime pickupTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING;

    private LocalDateTime requestedAt = LocalDateTime.now();
    private LocalDateTime acceptedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime completedAt;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public PickupRequest() {
    }

    public PickupRequest(User user, Office office, String deviceName, String deviceCategory, String brand, String model, Integer quantity, String description, Double approximateWeight, String photoPath, Double latitude, Double longitude, String userLocation) {
        this.user = user;
        this.office = office;
        this.deviceName = deviceName;
        this.deviceCategory = deviceCategory;
        this.brand = brand;
        this.model = model;
        this.quantity = quantity;
        this.description = description;
        this.approximateWeight = approximateWeight;
        this.photoPath = photoPath;
        this.latitude = latitude;
        this.longitude = longitude;
        this.userLocation = userLocation;
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

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getApproximateWeight() { return approximateWeight; }
    public void setApproximateWeight(Double approximateWeight) { this.approximateWeight = approximateWeight; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getUserLocation() { return userLocation; }
    public void setUserLocation(String userLocation) { this.userLocation = userLocation; }

    public String getCollectorResponse() { return collectorResponse; }
    public void setCollectorResponse(String collectorResponse) { this.collectorResponse = collectorResponse; }

    public String getCollectorName() { return collectorName; }
    public void setCollectorName(String collectorName) { this.collectorName = collectorName; }

    public String getCollectorPhoneNumber() { return collectorPhoneNumber; }
    public void setCollectorPhoneNumber(String collectorPhoneNumber) { this.collectorPhoneNumber = collectorPhoneNumber; }

    public LocalDate getPickupDate() { return pickupDate; }
    public void setPickupDate(LocalDate pickupDate) { this.pickupDate = pickupDate; }

    public LocalTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalTime pickupTime) { this.pickupTime = pickupTime; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

    public LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
