package com.greencircuit.backend.modules.pickup.repository;

import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.pickup.entity.PickupRequest;
import com.greencircuit.backend.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {
    List<PickupRequest> findByUserOrderByCreatedAtDesc(User user);
    List<PickupRequest> findByOfficeOrderByCreatedAtDesc(Office office);
}
