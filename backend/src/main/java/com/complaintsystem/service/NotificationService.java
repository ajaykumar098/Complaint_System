package com.complaintsystem.service;

import com.complaintsystem.entity.Complaint;
import com.complaintsystem.entity.Notification;
import com.complaintsystem.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createNotification(Complaint complaint, Notification.NotificationType type, String message) {
        Notification notification = new Notification();
        notification.setComplaint(complaint);
        notification.setComplaintIdStr(complaint.getComplaintId());
        notification.setNotificationId(UUID.randomUUID().toString());
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByUserId(String userId) {
        return notificationRepository.findByComplaintUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByComplaintUserIdAndIsReadFalse(userId);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }

    public long getUnreadCount(String userId) {
        return notificationRepository.countByComplaintUserIdAndIsReadFalse(userId);
    }
}
