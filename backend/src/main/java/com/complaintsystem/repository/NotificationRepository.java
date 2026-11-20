package com.complaintsystem.repository;

import com.complaintsystem.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.complaint.userId = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByComplaintUserIdOrderByCreatedAtDesc(@Param("userId") String userId);

    @Query("SELECT n FROM Notification n WHERE n.complaint.userId = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findByComplaintUserIdAndIsReadFalseOrderByCreatedAtDesc(@Param("userId") String userId);

    @Query("SELECT n FROM Notification n WHERE n.complaint.userId = :userId AND n.isRead = false")
    List<Notification> findByComplaintUserIdAndIsReadFalse(@Param("userId") String userId);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.complaint.userId = :userId AND n.isRead = false")
    long countByComplaintUserIdAndIsReadFalse(@Param("userId") String userId);
}
