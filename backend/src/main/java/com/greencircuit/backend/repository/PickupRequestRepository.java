package com.greencircuit.backend.repository;

import com.greencircuit.backend.entity.PickupRequest;
import com.greencircuit.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import com.greencircuit.backend.entity.Office;

@Repository
public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {
    List<PickupRequest> findByUserOrderByCreatedAtDesc(User user);
    List<PickupRequest> findByOfficeOrderByCreatedAtDesc(Office office);
}
