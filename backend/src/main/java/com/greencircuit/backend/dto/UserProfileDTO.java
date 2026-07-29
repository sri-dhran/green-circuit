package com.greencircuit.backend.dto;

public class UserProfileDTO {
    private String name;
    private String email;
    private String role;
    private Integer rewardPoints;

    public UserProfileDTO() {
    }

    public UserProfileDTO(String name, String email, String role, Integer rewardPoints) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.rewardPoints = rewardPoints;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer rewardPoints) { this.rewardPoints = rewardPoints; }
}
