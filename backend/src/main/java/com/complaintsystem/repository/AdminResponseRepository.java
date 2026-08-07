package com.complaintsystem.repository;

import com.complaintsystem.entity.AdminResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminResponseRepository extends JpaRepository<AdminResponse, Long> {
    Optional<AdminResponse> findByComplaintId(Long complaintId);
}
