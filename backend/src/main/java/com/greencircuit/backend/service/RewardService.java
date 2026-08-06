package com.greencircuit.backend.service;

import com.greencircuit.backend.entity.RewardItem;
import com.greencircuit.backend.entity.RewardRedemption;
import com.greencircuit.backend.entity.User;
import com.greencircuit.backend.repository.RewardItemRepository;
import com.greencircuit.backend.repository.RewardRedemptionRepository;
import com.greencircuit.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class RewardService {

    private final RewardItemRepository itemRepository;
    private final RewardRedemptionRepository redemptionRepository;
    private final UserRepository userRepository;

    public RewardService(RewardItemRepository itemRepository, RewardRedemptionRepository redemptionRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.redemptionRepository = redemptionRepository;
        this.userRepository = userRepository;
    }

    public List<RewardItem> getAvailableRewards() {
        return itemRepository.findAll();
    }

    public List<RewardRedemption> getMyRedemptions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return redemptionRepository.findByUserOrderByRedeemedAtDesc(user);
    }

    @Transactional
    public RewardRedemption redeemReward(String email, Long itemId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        RewardItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("Reward not found"));

        if (user.getRewardPoints() < item.getPointsCost()) {
            throw new IllegalArgumentException("Not enough reward points");
        }

        user.setRewardPoints(user.getRewardPoints() - item.getPointsCost());
        userRepository.save(user);

        RewardRedemption redemption = new RewardRedemption(user, item);
        return redemptionRepository.save(redemption);
    }
}
