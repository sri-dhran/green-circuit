package com.greencircuit.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reward_redemptions")
public class RewardRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "reward_item_id")
    private RewardItem rewardItem;

    private LocalDateTime redeemedAt;

    public RewardRedemption() {}
    
    public RewardRedemption(User user, RewardItem rewardItem) {
        this.user = user;
        this.rewardItem = rewardItem;
        this.redeemedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public RewardItem getRewardItem() { return rewardItem; }
    public LocalDateTime getRedeemedAt() { return redeemedAt; }
}
