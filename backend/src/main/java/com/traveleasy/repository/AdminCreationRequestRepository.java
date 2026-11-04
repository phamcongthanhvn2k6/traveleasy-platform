package com.traveleasy.repository;

import com.traveleasy.entity.AdminCreationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminCreationRequestRepository extends JpaRepository<AdminCreationRequest, Long> {
    List<AdminCreationRequest> findAllByOrderByCreatedAtDesc();
    List<AdminCreationRequest> findByStatusOrderByCreatedAtDesc(String status);
    boolean existsByProposedEmailAndStatus(String proposedEmail, String status);
}

