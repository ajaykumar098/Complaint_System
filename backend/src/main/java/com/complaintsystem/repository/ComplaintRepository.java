package com.complaintsystem.repository;

import com.complaintsystem.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Optional<Complaint> findByComplaintId(String complaintId);
    List<Complaint> findByUserId(String userId);
    List<Complaint> findByStatus(Complaint.Status status);
    List<Complaint> findByPriority(Complaint.Priority priority);
    List<Complaint> findByStatusAndPriority(Complaint.Status status, Complaint.Priority priority);
    List<Complaint> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    List<Complaint> findByComplaintIdStartingWith(String prefix);
}
