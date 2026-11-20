package com.complaintsystem.service;

import com.complaintsystem.dto.AdminResponseRequest;
import com.complaintsystem.dto.DashboardStats;
import com.complaintsystem.dto.StatusUpdateRequest;
import com.complaintsystem.entity.AdminResponse;
import com.complaintsystem.entity.Complaint;
import com.complaintsystem.entity.Notification;
import com.complaintsystem.repository.AdminResponseRepository;
import com.complaintsystem.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final ComplaintRepository complaintRepository;
    private final AdminResponseRepository adminResponseRepository;
    private final NotificationService notificationService;

    @Autowired
    public AdminService(ComplaintRepository complaintRepository, AdminResponseRepository adminResponseRepository, NotificationService notificationService) {
        this.complaintRepository = complaintRepository;
        this.adminResponseRepository = adminResponseRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Complaint updateComplaintStatus(Long id, StatusUpdateRequest request) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return null;
        }

        Complaint.Status newStatus = Complaint.Status.valueOf(request.getStatus().toUpperCase());
        Complaint.Status oldStatus = complaint.getStatus();
        complaint.setStatus(newStatus);

        Complaint savedComplaint = complaintRepository.save(complaint);

        // Create notification for status change
        String message = "Complaint status updated from " + oldStatus + " to " + newStatus;
        Notification.NotificationType notificationType = mapStatusToNotificationType(newStatus);
        notificationService.createNotification(savedComplaint, notificationType, message);

        return savedComplaint;
    }

    @Transactional
    public Complaint addAdminResponse(Long id, AdminResponseRequest request) {
        Complaint complaint = complaintRepository.findById(id).orElse(null);
        if (complaint == null) {
            return null;
        }

        AdminResponse adminResponse = complaint.getAdminResponse();
        if (adminResponse == null) {
            adminResponse = new AdminResponse();
            adminResponse.setComplaint(complaint);
        }

        adminResponse.setResponseText(request.getResponseText());
        adminResponse = adminResponseRepository.save(adminResponse);

        complaint.setAdminResponse(adminResponse);
        Complaint savedComplaint = complaintRepository.save(complaint);

        // Create notification for admin response
        notificationService.createNotification(savedComplaint, Notification.NotificationType.ADMIN_RESPONSE, "Admin has responded to your complaint");

        return savedComplaint;
    }

    public DashboardStats getDashboardStats() {
        List<Complaint> allComplaints = complaintRepository.findAll();

        Map<String, Long> statusCounts = new HashMap<>();
        statusCounts.put("SENT", 0L);
        statusCounts.put("IN_PROGRESS", 0L);
        statusCounts.put("RESOLVED", 0L);
        statusCounts.put("REJECTED", 0L);
        statusCounts.put("CANCELLED", 0L);

        Map<String, Long> priorityCounts = new HashMap<>();
        priorityCounts.put("LOW", 0L);
        priorityCounts.put("MEDIUM", 0L);
        priorityCounts.put("HIGH", 0L);

        for (Complaint complaint : allComplaints) {
            statusCounts.put(complaint.getStatus().name(), statusCounts.get(complaint.getStatus().name()) + 1);
            priorityCounts.put(complaint.getPriority().name(), priorityCounts.get(complaint.getPriority().name()) + 1);
        }

        return new DashboardStats(allComplaints.size(), statusCounts, priorityCounts);
    }

    private Notification.NotificationType mapStatusToNotificationType(Complaint.Status status) {
        switch (status) {
            case IN_PROGRESS:
                return Notification.NotificationType.IN_PROGRESS;
            case RESOLVED:
                return Notification.NotificationType.RESOLVED;
            case REJECTED:
                return Notification.NotificationType.REJECTED;
            case CANCELLED:
                return Notification.NotificationType.REJECTED;
            default:
                return Notification.NotificationType.SUBMITTED;
        }
    }
}
