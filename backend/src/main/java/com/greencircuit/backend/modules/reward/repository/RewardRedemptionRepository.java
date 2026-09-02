package com.greencircuit.backend.modules.reward.repository;

import com.greencircuit.backend.modules.reward.entity.RewardRedemption;
import com.greencircuit.backend.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {
    List<RewardRedemption> findByUserOrderByRedeemedAtDesc(User user);
}
