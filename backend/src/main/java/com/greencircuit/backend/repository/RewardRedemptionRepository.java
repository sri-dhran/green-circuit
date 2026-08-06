package com.greencircuit.backend.repository;

import com.greencircuit.backend.entity.RewardRedemption;
import com.greencircuit.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, Long> {
    List<RewardRedemption> findByUserOrderByRedeemedAtDesc(User user);
}
