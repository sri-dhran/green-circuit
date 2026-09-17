package com.greencircuit.backend.modules.agent.repository;

import com.greencircuit.backend.modules.agent.entity.CollectionAgent;
import com.greencircuit.backend.modules.center.entity.Office;
import com.greencircuit.backend.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionAgentRepository extends JpaRepository<CollectionAgent, Long> {

    List<CollectionAgent> findByOffice(Office office);

    List<CollectionAgent> findByOfficeAndStatus(Office office, String status);

    Optional<CollectionAgent> findByUser(User user);

    Optional<CollectionAgent> findByEmail(String email);

    Optional<CollectionAgent> findByMobileNumber(String mobileNumber);

    boolean existsByEmail(String email);

    boolean existsByMobileNumber(String mobileNumber);

    long countByOffice(Office office);

    long countByOfficeAndStatus(Office office, String status);
}
