package com.greencircuit.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "reward_items")
public class RewardItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private int pointsCost;
    private String imageUrl;

    public RewardItem() {}
    
    public RewardItem(String name, String description, int pointsCost, String imageUrl) {
        this.name = name; 
        this.description = description; 
        this.pointsCost = pointsCost; 
        this.imageUrl = imageUrl;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getPointsCost() { return pointsCost; }
    public String getImageUrl() { return imageUrl; }
}
