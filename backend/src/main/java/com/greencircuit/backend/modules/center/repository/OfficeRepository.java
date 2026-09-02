package com.greencircuit.backend.modules.center.repository;

import com.greencircuit.backend.modules.center.entity.Office;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfficeRepository extends JpaRepository<Office, Long> {
    List<Office> findByOfficeNameContainingIgnoreCase(String officeName);
}
