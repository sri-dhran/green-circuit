package com.greencircuit.backend.controller;

import com.greencircuit.backend.entity.RewardItem;
import com.greencircuit.backend.entity.RewardRedemption;
import com.greencircuit.backend.service.RewardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
public class RewardController {

    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @GetMapping
    public ResponseEntity<List<RewardItem>> getRewards() {
        return ResponseEntity.ok(rewardService.getAvailableRewards());
    }

    @GetMapping("/me")
    public ResponseEntity<List<RewardRedemption>> getMyRedemptions(Authentication authentication) {
        return ResponseEntity.ok(rewardService.getMyRedemptions(authentication.getName()));
    }

    @PostMapping("/redeem/{itemId}")
    public ResponseEntity<RewardRedemption> redeemReward(@PathVariable Long itemId, Authentication authentication) {
        return ResponseEntity.ok(rewardService.redeemReward(authentication.getName(), itemId));
    }
}
